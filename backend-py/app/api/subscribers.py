import csv
from html import escape as html_escape
import io
import json
import logging
import os
import re
import threading
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Set, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import HTMLResponse
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, or_
from sqlmodel import Session, select

from app.core.admin_auth import require_admin
from app.core.email import send_email_with_result
from app.core.security import ALGORITHM, SECRET_KEY
from app.db import engine, get_session
from app.models import (
    AdditionalService,
    Blog,
    BlogHeroSlide,
    NewsletterCampaign,
    NewsletterCampaignContent,
    NewsletterCampaignRecipientRule,
    NewsletterDelivery,
    NewsletterSubscriber,
    ProfessionalPlan,
    Proyecto,
    ServiceAdvisoryCard,
    ServiceCombo,
    SystemNotification,
)

router = APIRouter()
logger = logging.getLogger(__name__)

VALID_SUBSCRIBER_STATUSES = {"pending", "active", "unsubscribed", "bounced", "blocked"}
VALID_CAMPAIGN_STATUSES = {"draft", "scheduled", "sending", "sent", "failed"}
VALID_TARGET_MODES = {"all", "tags", "selected"}
VALID_RECIPIENT_RULE_TYPES = {"include", "exclude"}
VALID_CONTENT_SOURCE_TYPES = {
    "blog",
    "project",
    "service_plan",
    "service_extra",
    "service_combo",
    "advisory",
}

_NEWSLETTER_SCHEDULER_THREAD: Optional[threading.Thread] = None
_NEWSLETTER_SCHEDULER_STOP_EVENT = threading.Event()
_NEWSLETTER_SCHEDULER_LOCK = threading.Lock()
_SUBSCRIBE_RATE_LIMIT_BUCKET: Dict[str, List[datetime]] = {}
_SUBSCRIBE_RATE_LIMIT_LOCK = threading.Lock()
SCHEDULE_MIN_LEAD_SECONDS = 60


class CampaignContentItemPayload(BaseModel):
    source_type: str
    source_id: int
    title: str
    summary: Optional[str] = None
    details: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None


class CampaignContentItemOut(BaseModel):
    source_type: str
    source_id: int
    title: str
    summary: Optional[str] = None
    details: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    sort_index: int = 0


class CampaignContentOptionOut(BaseModel):
    source_type: str
    source_id: int
    title: str
    summary: Optional[str] = None
    details: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None


class CampaignContentCatalogOut(BaseModel):
    blog: List[CampaignContentOptionOut] = []
    projects: List[CampaignContentOptionOut] = []
    service_plans: List[CampaignContentOptionOut] = []
    service_extras: List[CampaignContentOptionOut] = []
    service_combos: List[CampaignContentOptionOut] = []
    advisories: List[CampaignContentOptionOut] = []


class SubscriberOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    status: str
    source: str
    tags: List[str] = []
    notes: Optional[str] = None
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime] = None
    last_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class SubscriberOptionOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    status: str
    source: str
    tags: List[str] = []


class SubscribersPageOut(BaseModel):
    items: List[SubscriberOut]
    total: int
    page: int
    page_size: int


class SubscriberCreatePayload(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    source: Optional[str] = "admin"
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = "active"


class SubscriberUpdatePayload(BaseModel):
    full_name: Optional[str] = None
    source: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class PublicSubscribePayload(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    source: Optional[str] = "website"
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    # Hidden field anti-bot. If it comes with data, request is discarded.
    company_website: Optional[str] = None
    # Epoch ms set by frontend when form renders to detect ultra-fast bot submits.
    submitted_at_ms: Optional[int] = None


class PublicSubscribeOut(BaseModel):
    subscriber: SubscriberOut
    requires_confirmation: bool = False
    message: str


class CampaignOut(BaseModel):
    id: int
    name: str
    subject: str
    preview_text: Optional[str] = None
    content_html: str
    content_text: Optional[str] = None
    status: str
    target_mode: str
    target_tags: List[str] = []
    content_items: List[CampaignContentItemOut] = []
    include_subscriber_ids: List[int] = []
    exclude_subscriber_ids: List[int] = []
    estimated_recipients: int = 0
    scheduled_for: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    total_recipients: int
    total_sent: int
    total_failed: int
    created_at: datetime
    updated_at: datetime


class CampaignCreatePayload(BaseModel):
    name: str
    subject: str
    preview_text: Optional[str] = None
    content_html: str
    content_text: Optional[str] = None
    target_mode: Optional[str] = "all"
    target_tags: Optional[List[str]] = None
    content_items: Optional[List[CampaignContentItemPayload]] = None
    include_subscriber_ids: Optional[List[int]] = None
    exclude_subscriber_ids: Optional[List[int]] = None
    scheduled_for: Optional[datetime] = None


class CampaignUpdatePayload(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    preview_text: Optional[str] = None
    content_html: Optional[str] = None
    content_text: Optional[str] = None
    target_mode: Optional[str] = None
    target_tags: Optional[List[str]] = None
    content_items: Optional[List[CampaignContentItemPayload]] = None
    include_subscriber_ids: Optional[List[int]] = None
    exclude_subscriber_ids: Optional[List[int]] = None
    status: Optional[str] = None
    scheduled_for: Optional[datetime] = None


class CampaignTestPayload(BaseModel):
    email: EmailStr


class CampaignSendPayload(BaseModel):
    force: bool = False


class DeliveryOut(BaseModel):
    id: int
    campaign_id: int
    subscriber_id: Optional[int] = None
    email: str
    status: str
    error_message: Optional[str] = None
    provider_message_id: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime


class NewsletterOverviewOut(BaseModel):
    total_subscribers: int
    pending_subscribers: int
    active_subscribers: int
    unsubscribed_subscribers: int
    bounced_subscribers: int
    blocked_subscribers: int
    total_campaigns: int
    draft_campaigns: int
    scheduled_campaigns: int
    sent_campaigns: int
    total_deliveries: int
    sent_deliveries: int
    failed_deliveries: int


class CampaignSendResultOut(BaseModel):
    campaign_id: int
    total_recipients: int
    total_sent: int
    total_failed: int
    status: str


class CampaignProcessDueOut(BaseModel):
    processed: int
    errors: int


class RecipientPreviewPayload(BaseModel):
    target_mode: Optional[str] = "all"
    target_tags: Optional[List[str]] = None
    include_subscriber_ids: Optional[List[int]] = None
    exclude_subscriber_ids: Optional[List[int]] = None


class RecipientPreviewItemOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    source: str


class RecipientPreviewOut(BaseModel):
    total: int
    items: List[RecipientPreviewItemOut]


def _normalize_email(value: str) -> str:
    normalized = str(value or "").strip().lower()
    if not normalized:
        raise HTTPException(status_code=400, detail="El email es obligatorio.")
    return normalized


def _normalize_tag(value: str) -> str:
    return str(value or "").strip().lower()


def _as_utc_naive(value: Optional[datetime]) -> Optional[datetime]:
    if not value:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def _validate_scheduled_for_or_raise(value: Optional[datetime]) -> Optional[datetime]:
    normalized = _as_utc_naive(value)
    if not normalized:
        return None
    min_allowed = datetime.utcnow() + timedelta(seconds=SCHEDULE_MIN_LEAD_SECONDS)
    if normalized <= min_allowed:
        raise HTTPException(
            status_code=400,
            detail="La fecha programada debe ser futura (minimo 1 minuto desde ahora).",
        )
    return normalized


def _parse_json_list(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except Exception:
        pass
    return []


def _dump_json_list(values: Optional[List[str]]) -> str:
    normalized = []
    seen = set()
    for item in values or []:
        tag = _normalize_tag(item)
        if not tag or tag in seen:
            continue
        seen.add(tag)
        normalized.append(tag)
    return json.dumps(normalized, ensure_ascii=False)


def _normalize_subscriber_ids(values: Optional[List[int]]) -> Set[int]:
    normalized: Set[int] = set()
    for item in values or []:
        try:
            value = int(item)
        except Exception:
            continue
        if value > 0:
            normalized.add(value)
    return normalized


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = str(os.getenv(name, "")).strip()
    if not raw:
        return default
    try:
        return int(raw)
    except Exception:
        return default


def _normalize_client_ip(value: Optional[str]) -> str:
    candidate = str(value or "").strip()
    if not candidate:
        return "unknown"
    if "," in candidate:
        candidate = candidate.split(",", 1)[0].strip()
    return candidate or "unknown"


def _enforce_subscribe_rate_limit(client_ip: str, email: str):
    enabled = _env_bool("NEWSLETTER_SUBSCRIBE_RATE_LIMIT_ENABLED", default=True)
    if not enabled:
        return

    window_seconds = max(5, _env_int("NEWSLETTER_SUBSCRIBE_RATE_WINDOW_SECONDS", 60))
    max_requests = max(1, _env_int("NEWSLETTER_SUBSCRIBE_RATE_MAX_REQUESTS", 10))
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=window_seconds)
    key = f"{client_ip}:{email}"

    with _SUBSCRIBE_RATE_LIMIT_LOCK:
        history = _SUBSCRIBE_RATE_LIMIT_BUCKET.get(key, [])
        history = [timestamp for timestamp in history if timestamp >= window_start]
        if len(history) >= max_requests:
            raise HTTPException(
                status_code=429,
                detail="Demasiadas solicitudes de suscripcion. Intenta nuevamente en unos segundos.",
            )
        history.append(now)
        _SUBSCRIBE_RATE_LIMIT_BUCKET[key] = history


def _text_excerpt(value: Optional[str], max_len: int = 180) -> Optional[str]:
    content = str(value or "").strip().replace("\n", " ")
    if not content:
        return None
    if len(content) <= max_len:
        return content
    return f"{content[:max_len - 3].strip()}..."


def _clean_catalog_summary(value: Optional[str], max_len: int = 170) -> Optional[str]:
    content = str(value or "").strip()
    if not content:
        return None

    if re.search(r"(GET|POST|PUT|PATCH|DELETE)\s+/api/|HTTP/1\.1|INFO:\s+\d{1,3}(?:\.\d{1,3}){3}:\d+", content, flags=re.IGNORECASE):
        return None

    # Remove common server log artifacts and request traces.
    content = re.sub(
        r"\"?(GET|POST|PUT|PATCH|DELETE)\s+/[^\s\"]+\s+HTTP/\d\.\d\"?",
        " ",
        content,
        flags=re.IGNORECASE,
    )
    content = re.sub(r"\bHTTP/\d\.\d\b", " ", content, flags=re.IGNORECASE)
    content = re.sub(r"\b\d\.\d\"?\s*\d{3}\s+[A-Z]{2,}\b", " ", content, flags=re.IGNORECASE)
    content = re.sub(r"\b\d{3}\s+OK\b", " ", content, flags=re.IGNORECASE)
    content = re.sub(r"\b\d{3}\b", " ", content)
    content = re.sub(r"\b(INFO|ERROR|WARN|WARNING|DEBUG)\b:?", " ", content, flags=re.IGNORECASE)
    content = re.sub(r"\b\d{1,3}(?:\.\d{1,3}){3}:\d+\b", " ", content)
    content = re.sub(r"\s*[-–]{2,}\s*", " ", content)
    content = re.sub(r"\s+", " ", content).strip(" -\"'.")

    if not content:
        return None
    noisy_tokens = ["/api/", "http/1.1", "127.0.0.1", "200 ok", "500", "404"]
    lowered = content.lower()
    if any(token in lowered for token in noisy_tokens):
        return None
    if len(content) <= max_len:
        return content
    return f"{content[: max_len - 3].strip()}..."


def _clean_detail_text(value: Optional[str], max_len: int = 2200) -> Optional[str]:
    content = str(value or "").strip()
    if not content:
        return None

    content = content.replace("\\n", "\n").replace("\\r", "\n")
    content = re.sub(r"<br\s*/?>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"</(p|div|li|h1|h2|h3|h4|h5|h6)>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"<li[^>]*>", "- ", content, flags=re.IGNORECASE)
    content = re.sub(r"<[^>]+>", " ", content)

    # Remove frequent request/server traces that break content quality.
    content = re.sub(
        r"\"?(GET|POST|PUT|PATCH|DELETE)\s+/[^\s\"]+\s+HTTP/\d\.\d\"?",
        " ",
        content,
        flags=re.IGNORECASE,
    )
    content = re.sub(r"\bHTTP/\d\.\d\b", " ", content, flags=re.IGNORECASE)
    content = re.sub(r"\b(INFO|ERROR|WARN|WARNING|DEBUG)\b:?", " ", content, flags=re.IGNORECASE)
    content = re.sub(r"\b\d{1,3}(?:\.\d{1,3}){3}:\d+\b", " ", content)
    content = re.sub(r"\s*[-â€“]{2,}\s*", " ", content)

    lines: List[str] = []
    for line in re.split(r"\r?\n", content):
        cleaned = re.sub(r"\s+", " ", line).strip(" \"'.")
        if not cleaned:
            continue
        lowered = cleaned.lower()
        if "/api/" in lowered or "http/1.1" in lowered or "127.0.0.1" in lowered:
            continue
        lines.append(cleaned)

    if not lines:
        return None

    normalized = "\n".join(lines).strip()
    if len(normalized) <= max_len:
        return normalized
    return f"{normalized[: max_len - 3].rstrip()}..."


def _parse_text_items(raw: Optional[str], limit: int = 12) -> List[str]:
    text = str(raw or "").strip()
    if not text:
        return []

    parsed_items: List[str] = []
    try:
        loaded = json.loads(text)
        if isinstance(loaded, list):
            parsed_items = [str(item).strip() for item in loaded if str(item).strip()]
        elif isinstance(loaded, dict):
            parsed_items = [
                f"{str(key).strip()}: {str(value).strip()}"
                for key, value in loaded.items()
                if str(key).strip() and str(value).strip()
            ]
    except Exception:
        normalized = text.replace("\\n", "\n")
        chunks = re.split(r"\n+|•|\u2022", normalized)
        if len(chunks) == 1:
            chunks = re.split(r"\s*\|\s*|;\s*", normalized)
        if len(chunks) == 1:
            chunks = [part for part in normalized.split(",")]
        parsed_items = [chunk.strip(" -\"'.") for chunk in chunks if chunk.strip(" -\"'.")]

    cleaned: List[str] = []
    seen = set()
    for item in parsed_items:
        normalized_item = re.sub(r"\s+", " ", str(item).strip())
        if not normalized_item:
            continue
        lowered = normalized_item.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        cleaned.append(normalized_item)
        if len(cleaned) >= limit:
            break
    return cleaned


_PROJECT_RESULT_META_KEYS = {
    "featured",
    "active",
    "order_index",
    "tags",
    "client_type",
    "slug",
    "id",
    "title",
    "description",
    "summary",
    "status",
    "category",
    "version",
    "stack",
    "media",
    "image_url",
    "video_url",
    "repo",
    "repo_url",
    "demo",
    "demo_url",
    "created_at",
    "updated_at",
}
_PROJECT_RESULT_PRIORITY_KEYS = (
    "results",
    "bullets",
    "impact",
    "kpis",
    "metrics",
    "benefits",
    "outcomes",
    "highlights",
)
_PROJECT_DESCRIPTION_NOISE_HINTS = (
    "o sea:",
    "la logica ya quedo",
    "la lógica ya quedó",
    "no ejecute build",
    "no ejecuté build",
    "build/test",
    "no toque nada",
    "no toqué nada",
    "proyectos admin",
    "pendiente para que se vean",
    "correccion de flujo",
    "corrección de flujo",
)


def _humanize_metric_key(raw_key: Optional[str]) -> str:
    raw = str(raw_key or "").strip()
    if not raw:
        return ""
    key = raw.replace("_", " ")

    key_map = {
        "transactions": "Transacciones",
        "clients": "Clientes",
        "uptime": "Disponibilidad",
        "patients": "Pacientes",
        "appointments": "Citas",
        "efficiency": "Eficiencia",
        "sales": "Ventas",
        "cart": "Carrito",
        "retention": "Retencion",
        "engagement": "Engagement",
        "courses": "Cursos",
        "rating": "Calificacion",
        "consumption": "Consumo",
        "nodes": "Nodos",
        "reliability": "Confiabilidad",
        "costs": "Costos",
        "works": "Obras",
        "safety": "Seguridad",
        "price": "Ticket estimado",
        "price_note": "Nota de precio",
    }
    lowered_raw = raw.lower()
    if lowered_raw in key_map:
        return key_map[lowered_raw]
    lowered_key = key.lower()
    if lowered_key in key_map:
        return key_map[lowered_key]
    return key[:1].upper() + key[1:]


def _is_placeholder_project_description(value: str) -> bool:
    lowered = str(value or "").strip().lower()
    return bool(re.fullmatch(r"caso de [eé]xito profesional desplegado\.?", lowered))


def _clean_project_description(value: Optional[str], max_len: int = 2600) -> Optional[str]:
    cleaned = _clean_detail_text(value, max_len=max_len)
    if not cleaned:
        return None

    lines: List[str] = []
    for raw_line in cleaned.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        lowered = line.lower()
        if any(token in lowered for token in _PROJECT_DESCRIPTION_NOISE_HINTS):
            continue
        if re.match(r"^(results?|stack|demo|repo|tags?|featured|active|order_index|client_type)\s*[:=]", lowered):
            continue
        if "/api/" in lowered or "http/1.1" in lowered or "127.0.0.1" in lowered:
            continue
        if re.match(r"^\d+(?:\.\d+)?\"?\s*\d{3}\s+ok$", lowered):
            continue
        if re.match(r"^-?\s*\d{3}\s+ok$", lowered):
            continue
        if lowered in {"ok", "200 ok", "404", "500"}:
            continue
        lines.append(line)

    if not lines:
        return None
    if not any(re.search(r"[a-zA-Z]{4,}", line) for line in lines):
        return None

    normalized = "\n".join(lines).strip()
    if _is_placeholder_project_description(normalized):
        return None
    if len(normalized) <= max_len:
        return normalized
    return f"{normalized[: max_len - 3].rstrip()}..."


def _build_generated_project_detail(row: Proyecto) -> str:
    project_title = _clean_catalog_summary(row.title, max_len=110) or "Proyecto"
    context_parts: List[str] = []
    if row.category:
        context_parts.append(str(row.category).strip())
    if row.status:
        context_parts.append(str(row.status).strip())
    if row.client_name:
        context_parts.append(f"Cliente {str(row.client_name).strip()}")

    context = " | ".join([part for part in context_parts if part])
    if context:
        return f"{project_title} orientado a resultados de negocio.\n\nContexto: {context}."
    return f"{project_title} orientado a resultados de negocio."


def _normalize_project_reference_url(value: Optional[str]) -> Optional[str]:
    url = str(value or "").strip()
    if not url or url in {"#", "-"}:
        return None
    lowered = url.lower()
    if lowered in {"n/a", "na", "null", "none"}:
        return None
    if lowered.startswith("javascript:") or lowered.startswith("about:"):
        return None
    if "chatgpt.com/c/" in lowered or "localhost:" in lowered:
        return None
    if lowered.startswith("http://") or lowered.startswith("https://"):
        return url
    return None


def _extract_project_result_items(raw: Optional[str], limit: int = 8) -> List[str]:
    text = str(raw or "").strip()
    if not text:
        return []

    try:
        loaded = json.loads(text)
    except Exception:
        return _parse_text_items(text, limit=limit)

    items: List[str] = []
    seen = set()

    def push(candidate: Optional[str]) -> None:
        if len(items) >= limit:
            return
        normalized = re.sub(r"\s+", " ", str(candidate or "").strip())
        if not normalized:
            return
        lowered = normalized.lower()
        if "/api/" in lowered or "http/1.1" in lowered or "127.0.0.1" in lowered:
            return
        if lowered in seen:
            return
        seen.add(lowered)
        if len(normalized) > 180:
            normalized = f"{normalized[:177].rstrip()}..."
        items.append(normalized)

    def consume(value: object) -> None:
        if len(items) >= limit or value is None:
            return

        if isinstance(value, list):
            for entry in value:
                if len(items) >= limit:
                    break
                consume(entry)
            return

        if isinstance(value, dict):
            for key, nested in value.items():
                if len(items) >= limit:
                    break
                key_norm = str(key).strip().lower()
                if not key_norm or key_norm in _PROJECT_RESULT_META_KEYS:
                    continue
                label = _humanize_metric_key(key)
                if isinstance(nested, (dict, list)):
                    consume(nested)
                    continue
                if isinstance(nested, bool):
                    continue
                value_txt = str(nested).strip()
                if not value_txt:
                    continue
                push(f"{label}: {value_txt}")
            return

        if isinstance(value, bool):
            return

        value_txt = str(value).strip()
        if not value_txt:
            return

        chunks = re.split(r"\n+|;\s*|\s*\|\s*", value_txt)
        if len(chunks) == 1:
            push(value_txt)
            return
        for chunk in chunks:
            if len(items) >= limit:
                break
            push(chunk.strip(" -\"'."))

    if isinstance(loaded, dict):
        for key in _PROJECT_RESULT_PRIORITY_KEYS:
            if key in loaded:
                consume(loaded.get(key))
                if len(items) >= limit:
                    return items[:limit]

        for key, value in loaded.items():
            if len(items) >= limit:
                break
            key_norm = str(key).strip().lower()
            if not key_norm or key_norm in _PROJECT_RESULT_META_KEYS or key_norm in _PROJECT_RESULT_PRIORITY_KEYS:
                continue
            if isinstance(value, bool):
                continue
            if isinstance(value, (list, dict)):
                consume(value)
                continue
            value_txt = str(value).strip()
            if not value_txt:
                continue
            label = _humanize_metric_key(key)
            push(f"{label}: {value_txt}")

        return items[:limit]

    consume(loaded)
    return items[:limit]


def _format_bullets(items: List[str]) -> Optional[str]:
    if not items:
        return None
    return "\n".join(f"- {item}" for item in items if item)


def _project_catalog_summary(row: Proyecto) -> str:
    description = _clean_project_description(row.description, max_len=220)
    description_summary = _clean_catalog_summary(description, max_len=170) if description else None
    if description_summary:
        return description_summary

    meta_parts = [str(row.category or "").strip(), str(row.status or "").strip()]
    meta_parts = [part for part in meta_parts if part]
    meta = " | ".join(meta_parts)

    title = _clean_catalog_summary(row.title, max_len=90) or "Proyecto"
    if meta:
        return f"{meta}. {title} con enfoque en resultados de negocio."
    return f"{title} con enfoque en resultados de negocio."


def _resolve_blog_category_image(category: Optional[str]) -> str:
    normalized = str(category or "").strip().lower()
    if "seguridad" in normalized:
        return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1400"
    if "guia" in normalized or "factura" in normalized:
        return "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1400"
    if "caso" in normalized or "reserva" in normalized:
        return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1400"
    if "industria" in normalized or "restaurante" in normalized:
        return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1400"
    if "estrategia" in normalized or "saas" in normalized:
        return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1400"
    if "ecommerce" in normalized:
        return "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1400"
    return "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=1400"


def _build_generated_blog_detail(title: str, category: Optional[str], author: Optional[str]) -> str:
    topic = _clean_catalog_summary(title, max_len=140) or "este articulo"
    category_label = str(category or "General").strip() or "General"
    author_label = str(author or "Equipo Editorial").strip() or "Equipo Editorial"
    parts = [
        f"Contexto: {category_label} | {author_label}",
        f"Panorama:\n{topic} responde a una necesidad real de negocio y entrega una mirada aplicable para equipos comerciales y tecnicos.",
        "Puntos clave:\n- Detectar el cuello de botella operativo principal.\n- Priorizar acciones de alto impacto y bajo riesgo.\n- Medir resultados con indicadores simples desde la primera semana.",
        "Siguiente paso:\nConvertir estas recomendaciones en un plan de implementacion por etapas con responsables y fechas concretas.",
    ]
    return "\n\n".join(parts)


def _build_blog_rich_detail(title: str, category: Optional[str], author: Optional[str], raw_content: Optional[str]) -> str:
    cleaned = _clean_detail_text(raw_content, max_len=2400) or ""
    generated = _build_generated_blog_detail(title, category, author)
    compact = re.sub(r"\s+", " ", cleaned).strip()
    if not compact:
        return generated
    if len(compact) < 260:
        return f"{generated}\n\nDetalle base:\n{cleaned}"
    if "contexto:" in compact.lower():
        return cleaned
    context_line = f"Contexto: {(category or 'General').strip() if str(category or '').strip() else 'General'} | {(author or 'Equipo Editorial').strip() if str(author or '').strip() else 'Equipo Editorial'}"
    return f"{context_line}\n\n{cleaned}"


def _extract_first_image_url(text: Optional[str]) -> Optional[str]:
    content = str(text or "")
    if not content:
        return None

    html_img = re.search(r"<img[^>]+src=[\"']([^\"']+)[\"']", content, flags=re.IGNORECASE)
    if html_img and html_img.group(1):
        return html_img.group(1).strip()

    markdown_img = re.search(r"!\[[^\]]*]\((https?://[^)]+)\)", content, flags=re.IGNORECASE)
    if markdown_img and markdown_img.group(1):
        return markdown_img.group(1).strip()

    matches = re.findall(r"https?://[^\s\"')>]+", content, flags=re.IGNORECASE)
    for raw in matches:
        candidate = raw.strip().rstrip(".,;:")
        lowered = candidate.lower()
        base = lowered.split("?")[0]
        if any(base.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]):
            return candidate
        if "res.cloudinary.com" in lowered and "/image/upload/" in lowered:
            return candidate
        if "images.unsplash.com/" in lowered or "source.unsplash.com/" in lowered:
            return candidate
        if "images.pexels.com/" in lowered or "cdn.pixabay.com/" in lowered:
            return candidate
    return None


def _resolve_public_backend_url() -> str:
    return (
        os.getenv("BACKEND_PUBLIC_URL")
        or os.getenv("API_PUBLIC_URL")
        or os.getenv("NEXT_PUBLIC_BACKEND_URL")
        or "http://localhost:8000"
    ).rstrip("/")


def _resolve_frontend_public_url() -> str:
    return (
        os.getenv("FRONTEND_PUBLIC_URL")
        or os.getenv("NEXT_PUBLIC_SITE_URL")
        or os.getenv("FRONTEND_URL")
        or "http://localhost:3000"
    ).rstrip("/")


def _hash_value(value: str) -> str:
    import hashlib

    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()


def _create_confirm_token(email: str) -> str:
    payload = {
        "sub": _normalize_email(email),
        "scope": "newsletter_confirm",
        "exp": datetime.utcnow() + timedelta(hours=max(1, _env_int("NEWSLETTER_CONFIRM_TOKEN_HOURS", 48))),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _verify_confirm_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=400, detail="Token de confirmacion invalido o vencido.") from exc

    if payload.get("scope") != "newsletter_confirm":
        raise HTTPException(status_code=400, detail="Token de confirmacion invalido.")
    return _normalize_email(str(payload.get("sub") or ""))


def _create_unsubscribe_token(email: str) -> str:
    payload = {
        "sub": _normalize_email(email),
        "scope": "newsletter_unsubscribe",
        "exp": datetime.utcnow() + timedelta(days=3650),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _verify_unsubscribe_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=400, detail="Token de baja invalido.") from exc

    if payload.get("scope") != "newsletter_unsubscribe":
        raise HTTPException(status_code=400, detail="Token de baja invalido.")
    return _normalize_email(str(payload.get("sub") or ""))


def _send_subscriber_confirmation_email(email: str, full_name: Optional[str], token: str) -> bool:
    backend_url = _resolve_public_backend_url()
    frontend_url = _resolve_frontend_public_url()
    confirm_url = f"{backend_url}/api/subscribers/confirm?token={token}"
    fallback_url = f"{frontend_url}/newsletter/confirm?token={token}"
    display_name = str(full_name or "").strip() or "Hola"

    html = (
        '<div style="font-family:Arial,sans-serif;background:#0b1220;padding:24px;color:#e2e8f0;">'
        '<div style="max-width:680px;margin:0 auto;border:1px solid #1e293b;border-radius:16px;padding:24px;background:#0f172a;">'
        f'<h1 style="margin:0 0 10px 0;font-size:24px;color:#f8fafc;">{html_escape(display_name)}, confirma tu suscripcion</h1>'
        '<p style="margin:0 0 12px 0;color:#94a3b8;">Para proteger tu correo, necesitamos una confirmacion final.</p>'
        f'<p style="margin:20px 0;"><a href="{confirm_url}" style="display:inline-block;background:#f97316;color:#020617;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold;">Confirmar suscripcion</a></p>'
        f'<p style="margin:8px 0 0 0;font-size:12px;color:#64748b;">Si el boton no funciona, copia este enlace: {html_escape(confirm_url)}</p>'
        f'<p style="margin:8px 0 0 0;font-size:12px;color:#64748b;">Fallback frontend: {html_escape(fallback_url)}</p>'
        "</div></div>"
    )
    result = send_email_with_result(email, "Confirma tu suscripcion al newsletter", html)
    return bool(result.ok)


def _extract_resend_event_email(payload: Dict) -> Optional[str]:
    data = payload.get("data")
    if isinstance(data, dict):
        for key in ("to", "recipient", "email"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return _normalize_email(value)
            if isinstance(value, list) and value:
                first = value[0]
                if isinstance(first, str) and first.strip():
                    return _normalize_email(first)
    for key in ("email", "to", "recipient"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return _normalize_email(value)
        if isinstance(value, list) and value:
            first = value[0]
            if isinstance(first, str) and first.strip():
                return _normalize_email(first)
    return None

def _campaign_content_rows(session: Session, campaign_id: int) -> List[NewsletterCampaignContent]:
    return session.exec(
        select(NewsletterCampaignContent)
        .where(NewsletterCampaignContent.campaign_id == campaign_id)
        .order_by(NewsletterCampaignContent.sort_index.asc(), NewsletterCampaignContent.id.asc())
    ).all()


def _campaign_rule_id_sets(session: Session, campaign_id: int) -> Dict[str, Set[int]]:
    rows = session.exec(
        select(NewsletterCampaignRecipientRule).where(
            NewsletterCampaignRecipientRule.campaign_id == campaign_id
        )
    ).all()

    include_ids: Set[int] = set()
    exclude_ids: Set[int] = set()
    for row in rows:
        if row.rule_type == "include":
            include_ids.add(row.subscriber_id)
        elif row.rule_type == "exclude":
            exclude_ids.add(row.subscriber_id)

    return {"include": include_ids, "exclude": exclude_ids}


def _save_campaign_content_rows(
    session: Session,
    campaign_id: int,
    content_items: Optional[List[CampaignContentItemPayload]],
):
    existing = session.exec(
        select(NewsletterCampaignContent).where(NewsletterCampaignContent.campaign_id == campaign_id)
    ).all()
    for row in existing:
        session.delete(row)

    for index, item in enumerate(content_items or []):
        source_type = str(item.source_type or "").strip().lower()
        if source_type not in VALID_CONTENT_SOURCE_TYPES:
            continue

        source_id = int(item.source_id)
        if source_id <= 0:
            continue

        session.add(
            NewsletterCampaignContent(
                campaign_id=campaign_id,
                source_type=source_type,
                source_id=source_id,
                title=str(item.title or "").strip() or f"Item {source_id}",
                summary=(
                    _clean_detail_text(item.details, max_len=2200)
                    or _clean_detail_text(item.summary, max_len=2200)
                    or _text_excerpt(item.summary, max_len=2200)
                ),
                url=str(item.url or "").strip() or None,
                sort_index=index,
                created_at=datetime.utcnow(),
            )
        )


def _save_campaign_recipient_rules(
    session: Session,
    campaign_id: int,
    include_ids: Set[int],
    exclude_ids: Set[int],
):
    rows = session.exec(
        select(NewsletterCampaignRecipientRule).where(
            NewsletterCampaignRecipientRule.campaign_id == campaign_id
        )
    ).all()
    for row in rows:
        session.delete(row)

    now = datetime.utcnow()
    for subscriber_id in sorted(include_ids):
        session.add(
            NewsletterCampaignRecipientRule(
                campaign_id=campaign_id,
                subscriber_id=subscriber_id,
                rule_type="include",
                created_at=now,
            )
        )
    for subscriber_id in sorted(exclude_ids):
        session.add(
            NewsletterCampaignRecipientRule(
                campaign_id=campaign_id,
                subscriber_id=subscriber_id,
                rule_type="exclude",
                created_at=now,
            )
        )


def _normalize_target_mode(value: Optional[str]) -> str:
    mode = str(value or "all").strip().lower()
    if mode not in VALID_TARGET_MODES:
        raise HTTPException(status_code=400, detail="Modo de segmentacion invalido.")
    return mode


def _to_content_item_out(row: NewsletterCampaignContent) -> CampaignContentItemOut:
    full_details = _clean_detail_text(row.summary, max_len=2200) or None
    return CampaignContentItemOut(
        source_type=row.source_type,
        source_id=row.source_id,
        title=row.title,
        summary=_text_excerpt(full_details, max_len=220) if full_details else row.summary,
        details=full_details,
        url=row.url,
        image_url=None,
        sort_index=row.sort_index,
    )


def _subscriber_to_out(subscriber: NewsletterSubscriber) -> SubscriberOut:
    return SubscriberOut(
        id=subscriber.id or 0,
        email=subscriber.email,
        full_name=subscriber.full_name,
        status=subscriber.status,
        source=subscriber.source,
        tags=_parse_json_list(subscriber.tags),
        notes=subscriber.notes,
        subscribed_at=subscriber.subscribed_at,
        unsubscribed_at=subscriber.unsubscribed_at,
        last_sent_at=subscriber.last_sent_at,
        created_at=subscriber.created_at,
        updated_at=subscriber.updated_at,
    )


def _subscriber_to_option(subscriber: NewsletterSubscriber) -> SubscriberOptionOut:
    return SubscriberOptionOut(
        id=subscriber.id or 0,
        email=subscriber.email,
        full_name=subscriber.full_name,
        status=subscriber.status,
        source=subscriber.source,
        tags=_parse_json_list(subscriber.tags),
    )


def _resolve_recipients_for_campaign(
    session: Session,
    campaign: NewsletterCampaign,
    include_ids: Set[int],
    exclude_ids: Set[int],
) -> List[NewsletterSubscriber]:
    active = session.exec(
        select(NewsletterSubscriber)
        .where(NewsletterSubscriber.status == "active")
        .order_by(NewsletterSubscriber.id.asc())
    ).all()

    by_id: Dict[int, NewsletterSubscriber] = {}
    for row in active:
        if row.id is not None:
            by_id[row.id] = row

    if campaign.target_mode == "selected":
        base_ids = set(include_ids)
    elif campaign.target_mode == "tags":
        target_tags = {_normalize_tag(tag) for tag in _parse_json_list(campaign.target_tags)}
        base_ids = {
            row.id
            for row in active
            if row.id is not None
            and target_tags.intersection({_normalize_tag(tag) for tag in _parse_json_list(row.tags)})
        }
        base_ids.update(include_ids)
    else:
        base_ids = {row.id for row in active if row.id is not None}
        base_ids.update(include_ids)

    final_ids = sorted(base_ids.difference(exclude_ids))
    return [by_id[item_id] for item_id in final_ids if item_id in by_id]


def _build_content_html(items: List[NewsletterCampaignContent]) -> str:
    if not items:
        return ""

    cards = []
    for item in items:
        title = (item.title or "").strip()
        details = _clean_detail_text(item.summary, max_len=1400) or ""
        url = (item.url or "").strip()

        parts = [
            '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:12px;">',
            f'<h3 style="margin:0 0 8px 0;font-size:18px;">{html_escape(title)}</h3>',
        ]
        if details:
            parts.append(
                '<p style="margin:0 0 10px 0;color:#334155;line-height:1.55;">'
                + html_escape(details).replace("\n", "<br />")
                + "</p>"
            )
        if url:
            parts.append(
                f'<a href="{url}" style="color:#1d4ed8;font-weight:bold;text-decoration:none;">Ver detalle</a>'
            )
        parts.append("</div>")
        cards.append("".join(parts))

    return (
        '<section style="margin-top:24px;">'
        '<h2 style="font-size:22px;margin:0 0 14px 0;">Contenido recomendado</h2>'
        + "".join(cards)
        + "</section>"
    )


def _compose_campaign_html(session: Session, campaign: NewsletterCampaign, recipient_email: str) -> str:
    token = _create_unsubscribe_token(recipient_email)
    unsubscribe_url = f"{_resolve_public_backend_url()}/api/subscribers/unsubscribe?token={token}"
    content_rows = _campaign_content_rows(session, campaign.id or 0)
    dynamic_content = _build_content_html(content_rows)

    footer = (
        '<hr style="margin:32px 0;border:0;border-top:1px solid #e5e7eb;" />'
        '<p style="font-family:Arial,sans-serif;font-size:12px;color:#64748b;">'
        'Recibiste este correo porque estas suscrito a nuestro boletin. '
        f'<a href="{unsubscribe_url}" style="color:#1d4ed8;">Cancelar suscripcion</a>.'
        "</p>"
    )

    return f"{campaign.content_html}{dynamic_content}{footer}"


def _campaign_to_out(session: Session, campaign: NewsletterCampaign) -> CampaignOut:
    content_rows = _campaign_content_rows(session, campaign.id or 0)
    rule_sets = _campaign_rule_id_sets(session, campaign.id or 0)
    recipients = _resolve_recipients_for_campaign(
        session,
        campaign,
        include_ids=rule_sets["include"],
        exclude_ids=rule_sets["exclude"],
    )

    return CampaignOut(
        id=campaign.id or 0,
        name=campaign.name,
        subject=campaign.subject,
        preview_text=campaign.preview_text,
        content_html=campaign.content_html,
        content_text=campaign.content_text,
        status=campaign.status,
        target_mode=campaign.target_mode,
        target_tags=_parse_json_list(campaign.target_tags),
        content_items=[_to_content_item_out(row) for row in content_rows],
        include_subscriber_ids=sorted(rule_sets["include"]),
        exclude_subscriber_ids=sorted(rule_sets["exclude"]),
        estimated_recipients=len(recipients),
        scheduled_for=campaign.scheduled_for,
        sent_at=campaign.sent_at,
        total_recipients=campaign.total_recipients,
        total_sent=campaign.total_sent,
        total_failed=campaign.total_failed,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


def _delivery_to_out(delivery: NewsletterDelivery) -> DeliveryOut:
    return DeliveryOut(
        id=delivery.id or 0,
        campaign_id=delivery.campaign_id,
        subscriber_id=delivery.subscriber_id,
        email=delivery.email,
        status=delivery.status,
        error_message=delivery.error_message,
        provider_message_id=delivery.provider_message_id,
        sent_at=delivery.sent_at,
        created_at=delivery.created_at,
    )


def _execute_campaign_send(
    session: Session,
    campaign: NewsletterCampaign,
    force: bool = False,
    already_claimed: bool = False,
) -> CampaignSendResultOut:
    if campaign.status == "sending":
        if not already_claimed:
            raise HTTPException(status_code=409, detail="La campana ya esta en proceso de envio.")

    if campaign.status == "sent" and not force:
        raise HTTPException(
            status_code=409,
            detail="Esta campana ya fue enviada. Usa force=true para reenviar.",
        )

    rule_sets = _campaign_rule_id_sets(session, campaign.id or 0)
    recipients = _resolve_recipients_for_campaign(
        session,
        campaign,
        include_ids=rule_sets["include"],
        exclude_ids=rule_sets["exclude"],
    )

    if not recipients:
        raise HTTPException(status_code=400, detail="No hay suscriptores activos para esta segmentacion.")

    if not already_claimed:
        now = datetime.utcnow()
        campaign.status = "sending"
        campaign.total_recipients = len(recipients)
        campaign.total_sent = 0
        campaign.total_failed = 0
        campaign.updated_at = now
        session.add(campaign)
        session.commit()

    sent_count = 0
    failed_count = 0

    for subscriber in recipients:
        now = datetime.utcnow()
        html = _compose_campaign_html(session, campaign, subscriber.email)
        result = send_email_with_result(subscriber.email, campaign.subject, html)
        ok = bool(result.ok)

        if ok:
            sent_count += 1
            subscriber.last_sent_at = now
            subscriber.updated_at = now
            session.add(subscriber)
        else:
            failed_count += 1

        session.add(
            NewsletterDelivery(
                campaign_id=campaign.id or 0,
                subscriber_id=subscriber.id,
                email=subscriber.email,
                status="sent" if ok else "failed",
                error_message=None if ok else (result.error or "No se pudo enviar el correo."),
                provider_message_id=result.provider_message_id,
                sent_at=now if ok else None,
                created_at=now,
            )
        )

    campaign.total_sent = sent_count
    campaign.total_failed = failed_count
    campaign.sent_at = now
    campaign.updated_at = now
    campaign.status = "sent" if sent_count > 0 else "failed"
    session.add(campaign)
    session.commit()
    session.refresh(campaign)

    return CampaignSendResultOut(
        campaign_id=campaign.id or 0,
        total_recipients=campaign.total_recipients,
        total_sent=campaign.total_sent,
        total_failed=campaign.total_failed,
        status=campaign.status,
    )


def process_due_newsletter_campaigns() -> Dict[str, int]:
    now = datetime.utcnow()
    processed = 0
    errors = 0

    with Session(engine) as session:
        scheduled_candidates = session.exec(
            select(NewsletterCampaign)
            .where(NewsletterCampaign.status == "scheduled")
            .where(NewsletterCampaign.scheduled_for.is_not(None))
            .order_by(NewsletterCampaign.scheduled_for.asc(), NewsletterCampaign.id.asc())
        ).all()

        for row in scheduled_candidates:
            if not row.id:
                continue
            try:
                campaign = session.get(NewsletterCampaign, row.id)
                if not campaign:
                    continue
                if campaign.status != "scheduled":
                    continue
                scheduled_for = _as_utc_naive(campaign.scheduled_for)
                if not scheduled_for or scheduled_for > now:
                    continue
                campaign.scheduled_for = scheduled_for
                campaign.status = "sending"
                campaign.updated_at = datetime.utcnow()
                session.add(campaign)
                session.commit()
                session.refresh(campaign)
                _execute_campaign_send(session, campaign, force=True, already_claimed=True)
                processed += 1
            except Exception as exc:
                failed_campaign = session.get(NewsletterCampaign, row.id)
                if failed_campaign and failed_campaign.status == "sending":
                    failed_campaign.status = "failed"
                    failed_campaign.updated_at = datetime.utcnow()
                    session.add(failed_campaign)
                    session.commit()
                logger.exception(
                    "Error procesando campana programada",
                    extra={"campaign_id": row.id, "error": str(exc)},
                )
                errors += 1

    return {"processed": processed, "errors": errors}


def _newsletter_scheduler_loop():
    while not _NEWSLETTER_SCHEDULER_STOP_EVENT.wait(45):
        try:
            process_due_newsletter_campaigns()
        except Exception:
            logger.exception("Error en ciclo scheduler newsletter")
            # Keep loop alive even if one cycle fails.
            continue


def start_newsletter_campaign_scheduler():
    global _NEWSLETTER_SCHEDULER_THREAD
    with _NEWSLETTER_SCHEDULER_LOCK:
        if _NEWSLETTER_SCHEDULER_THREAD and _NEWSLETTER_SCHEDULER_THREAD.is_alive():
            return
        _NEWSLETTER_SCHEDULER_STOP_EVENT.clear()
        _NEWSLETTER_SCHEDULER_THREAD = threading.Thread(
            target=_newsletter_scheduler_loop,
            name="newsletter-scheduler",
            daemon=True,
        )
        _NEWSLETTER_SCHEDULER_THREAD.start()


def stop_newsletter_campaign_scheduler():
    global _NEWSLETTER_SCHEDULER_THREAD
    with _NEWSLETTER_SCHEDULER_LOCK:
        _NEWSLETTER_SCHEDULER_STOP_EVENT.set()
        thread = _NEWSLETTER_SCHEDULER_THREAD
        _NEWSLETTER_SCHEDULER_THREAD = None

    if thread and thread.is_alive():
        thread.join(timeout=3)

def _build_content_catalog(session: Session) -> CampaignContentCatalogOut:
    blog_items = []
    blog_rows = session.exec(select(Blog).order_by(Blog.id.desc())).all()
    for row in blog_rows:
        if not row.id:
            continue
        summary = _clean_catalog_summary(row.content, max_len=220)
        if not summary:
            topic = _clean_catalog_summary(row.title, max_len=150) or "Articulo para newsletter"
            category_label = str(row.category or "general").strip().lower() or "general"
            summary = f"{topic}. Enfoque {category_label} con recomendaciones aplicables."
        details = _build_blog_rich_detail(row.title, row.category, row.author, row.content)
        image_url = _extract_first_image_url(row.content) or _resolve_blog_category_image(row.category)
        blog_items.append(
            CampaignContentOptionOut(
                source_type="blog",
                source_id=row.id,
                title=row.title,
                summary=summary,
                details=details,
                url=f"/blog/{row.id}",
                image_url=image_url,
            )
        )

    if not blog_items:
        # Fallback: if blog cards are managed as hero slides, expose them too.
        slide_rows = session.exec(
            select(BlogHeroSlide)
            .where(BlogHeroSlide.is_active == True)
            .order_by(BlogHeroSlide.order_index.asc(), BlogHeroSlide.id.asc())
        ).all()
        for row in slide_rows:
            if not row.id:
                continue
            image_url = (row.background_image_url or "").strip() or _resolve_blog_category_image(row.card_kicker)
            summary = _clean_catalog_summary(row.card_description) or "Contenido blog destacado."
            details_parts = []
            if row.card_kicker:
                details_parts.append(f"Kicker: {row.card_kicker}")
            description = _clean_detail_text(row.card_description, max_len=1200)
            if description:
                details_parts.append(description)
            tags = _parse_text_items(row.card_tags, limit=10)
            tags_block = _format_bullets(tags)
            if tags_block:
                details_parts.append(f"Tags:\n{tags_block}")
            blog_items.append(
                CampaignContentOptionOut(
                    source_type="blog",
                    source_id=1_000_000 + row.id,
                    title=(row.card_title or "").strip() or f"Blog slide {row.id}",
                    summary=summary,
                    details="\n\n".join(details_parts).strip() or summary,
                    url="/blog",
                    image_url=image_url,
                )
            )

    project_items: List[CampaignContentOptionOut] = []
    for row in session.exec(select(Proyecto).order_by(Proyecto.id.desc())).all():
        if not row.id:
            continue
        summary = _project_catalog_summary(row)
        project_blocks: List[str] = []
        project_results_meta: Dict[str, object] = {}
        try:
            loaded_results = json.loads(str(row.results or "").strip() or "{}")
            if isinstance(loaded_results, dict):
                project_results_meta = loaded_results
        except Exception:
            project_results_meta = {}
        meta = []
        if row.category:
            meta.append(f"Categoría: {row.category}")
        if row.status:
            meta.append(f"Estado: {row.status}")
        if row.version:
            meta.append(f"Versión: {row.version}")
        if row.client_name:
            meta.append(f"Cliente: {row.client_name}")
        elif project_results_meta.get("client_type"):
            meta.append(f"Cliente: {str(project_results_meta.get('client_type')).strip()}")
        if row.year:
            meta.append(f"Año: {row.year}")
        if row.deployment_date:
            meta.append(f"Despliegue: {row.deployment_date}")
        if meta:
            project_blocks.append(" | ".join(meta))

        description = _clean_project_description(row.description, max_len=2600) or _build_generated_project_detail(row)
        if description:
            project_blocks.append(f"Descripcion:\n{description}")

        stack_items = _parse_text_items(row.stack, limit=12)
        stack_block = _format_bullets(stack_items)
        if stack_block:
            project_blocks.append(f"Stack:\n{stack_block}")

        result_items = _extract_project_result_items(row.results, limit=8)
        results_block = _format_bullets(result_items)
        if results_block:
            project_blocks.append(f"Resultados:\n{results_block}")

        link_parts = []
        demo_link = _normalize_project_reference_url(row.demo_url)
        repo_link = _normalize_project_reference_url(row.repo_url)
        if demo_link:
            link_parts.append(f"Demo: {demo_link}")
        if repo_link:
            link_parts.append(f"Repo: {repo_link}")
        if link_parts:
            project_blocks.append(" | ".join(link_parts))

        project_items.append(
            CampaignContentOptionOut(
                source_type="project",
                source_id=row.id,
                title=row.title,
                summary=summary,
                details="\n\n".join([part for part in project_blocks if part]).strip() or summary,
                url="/proyectos",
                image_url=(row.image_url or "").strip() or None,
            )
        )

    service_plan_items: List[CampaignContentOptionOut] = []
    for row in session.exec(select(ProfessionalPlan).order_by(ProfessionalPlan.order_index.asc())).all():
        if not row.id:
            continue
        summary = _clean_catalog_summary(row.description) or "Plan profesional disponible para campañas."
        blocks: List[str] = []
        meta = []
        if row.price:
            meta.append(f"Precio: {row.price}")
        if row.category:
            meta.append(f"Categoría: {row.category}")
        if row.delivery:
            meta.append(f"Entrega: {_clean_catalog_summary(row.delivery, max_len=150) or row.delivery}")
        if row.ideal_for:
            meta.append(f"Ideal para: {_clean_catalog_summary(row.ideal_for, max_len=160) or row.ideal_for}")
        if meta:
            blocks.append(" | ".join(meta))

        description = _clean_detail_text(row.description, max_len=1300)
        if description:
            blocks.append(f"Descripción:\n{description}")

        modules = _parse_text_items(row.modules, limit=12)
        modules_block = _format_bullets(modules)
        if modules_block:
            blocks.append(f"Módulos:\n{modules_block}")

        includes = _parse_text_items(row.includes, limit=14)
        includes_block = _format_bullets(includes)
        if includes_block:
            blocks.append(f"Incluye:\n{includes_block}")

        service_plan_items.append(
            CampaignContentOptionOut(
                source_type="service_plan",
                source_id=row.id,
                title=row.name,
                summary=summary,
                details="\n\n".join(blocks).strip() or summary,
                url="/servicios",
                image_url=None,
            )
        )

    service_extra_items: List[CampaignContentOptionOut] = []
    for row in session.exec(select(AdditionalService).order_by(AdditionalService.id.desc())).all():
        if not row.id:
            continue
        summary = _clean_catalog_summary(row.description) or "Servicio adicional listo para campaña."
        blocks: List[str] = []
        meta = []
        if row.price:
            meta.append(f"Precio: {row.price}")
        payment_type = str(row.payment_type or "").strip()
        if payment_type:
            meta.append(f"Pago: {payment_type}")
        if row.recurring:
            meta.append("Recurrencia: Sí")
        if meta:
            blocks.append(" | ".join(meta))

        description = _clean_detail_text(row.description, max_len=1200)
        if description:
            blocks.append(f"Descripción:\n{description}")

        includes = _parse_text_items(row.includes, limit=12)
        includes_block = _format_bullets(includes)
        if includes_block:
            blocks.append(f"Incluye:\n{includes_block}")

        service_extra_items.append(
            CampaignContentOptionOut(
                source_type="service_extra",
                source_id=row.id,
                title=row.name,
                summary=summary,
                details="\n\n".join(blocks).strip() or summary,
                url="/servicios",
                image_url=None,
            )
        )

    service_combo_items: List[CampaignContentOptionOut] = []
    for row in session.exec(select(ServiceCombo).order_by(ServiceCombo.order_index.asc())).all():
        if not row.id:
            continue
        summary = _clean_catalog_summary(row.note) or _clean_catalog_summary(row.ideal) or "Combo empresarial disponible."
        blocks: List[str] = []
        meta = []
        if row.segment:
            meta.append(f"Segmento: {row.segment}")
        if row.individual_value:
            meta.append(f"Valor individual: {row.individual_value}")
        if row.combo_price:
            meta.append(f"Precio combo: {row.combo_price}")
        if row.timeline:
            meta.append(f"Timeline: {row.timeline}")
        if meta:
            blocks.append(" | ".join(meta))

        ideal = _clean_detail_text(row.ideal, max_len=600)
        if ideal:
            blocks.append(f"Ideal para:\n{ideal}")

        note = _clean_detail_text(row.note, max_len=1000)
        if note:
            blocks.append(f"Nota comercial:\n{note}")
        market_note = _clean_detail_text(row.market_note, max_len=700)
        if market_note:
            blocks.append(f"Referencia mercado:\n{market_note}")

        includes = _parse_text_items(row.includes, limit=14)
        includes_block = _format_bullets(includes)
        if includes_block:
            blocks.append(f"Incluye:\n{includes_block}")

        deliverables = _parse_text_items(row.deliverables, limit=12)
        deliverables_block = _format_bullets(deliverables)
        if deliverables_block:
            blocks.append(f"Entregables:\n{deliverables_block}")

        not_included = _parse_text_items(row.not_included, limit=10)
        not_included_block = _format_bullets(not_included)
        if not_included_block:
            blocks.append(f"No incluido:\n{not_included_block}")

        service_combo_items.append(
            CampaignContentOptionOut(
                source_type="service_combo",
                source_id=row.id,
                title=row.title,
                summary=summary,
                details="\n\n".join(blocks).strip() or summary,
                url="/servicios/combos",
                image_url=None,
            )
        )

    advisory_items: List[CampaignContentOptionOut] = []
    for row in session.exec(select(ServiceAdvisoryCard).order_by(ServiceAdvisoryCard.order_index.asc())).all():
        if not row.id:
            continue
        summary = _clean_catalog_summary(row.result) or "Asesoría técnica lista para campaña."
        blocks: List[str] = []
        meta = []
        if row.duration:
            meta.append(f"Duración: {row.duration}")
        if row.price:
            meta.append(f"Precio: {row.price}")
        if meta:
            blocks.append(" | ".join(meta))

        audience = _parse_text_items(row.audience, limit=12)
        audience_block = _format_bullets(audience)
        if audience_block:
            blocks.append(f"Audiencia:\n{audience_block}")

        includes = _parse_text_items(row.includes, limit=14)
        includes_block = _format_bullets(includes)
        if includes_block:
            blocks.append(f"Incluye:\n{includes_block}")

        result = _clean_detail_text(row.result, max_len=1000)
        if result:
            blocks.append(f"Resultado esperado:\n{result}")
        market_note = _clean_detail_text(row.market_note, max_len=700)
        if market_note:
            blocks.append(f"Referencia mercado:\n{market_note}")

        advisory_items.append(
            CampaignContentOptionOut(
                source_type="advisory",
                source_id=row.id,
                title=row.title,
                summary=summary,
                details="\n\n".join(blocks).strip() or summary,
                url="/asesoria",
                image_url=None,
            )
        )

    return CampaignContentCatalogOut(
        blog=blog_items,
        projects=project_items,
        service_plans=service_plan_items,
        service_extras=service_extra_items,
        service_combos=service_combo_items,
        advisories=advisory_items,
    )


@router.post("/subscribe", response_model=PublicSubscribeOut)
def subscribe_newsletter(
    payload: PublicSubscribePayload,
    request: Request,
    session: Session = Depends(get_session),
):
    email = _normalize_email(str(payload.email))
    now = datetime.utcnow()
    client_ip = _normalize_client_ip(request.headers.get("x-forwarded-for") or (request.client.host if request.client else ""))

    if str(payload.company_website or "").strip():
        raise HTTPException(status_code=400, detail="Solicitud invalida.")

    submitted_at_ms = int(payload.submitted_at_ms or 0)
    min_submit_seconds = max(0, _env_int("NEWSLETTER_MIN_SUBMIT_SECONDS", 2))
    if submitted_at_ms > 0 and min_submit_seconds > 0:
        elapsed_ms = int(time.time() * 1000) - submitted_at_ms
        if elapsed_ms < min_submit_seconds * 1000:
            raise HTTPException(status_code=429, detail="Espera un momento antes de enviar el formulario.")

    _enforce_subscribe_rate_limit(client_ip=client_ip, email=email)
    double_opt_in = _env_bool("NEWSLETTER_DOUBLE_OPT_IN", default=False)
    requires_confirmation = False

    subscriber = session.exec(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    ).first()

    if subscriber:
        subscriber.full_name = (payload.full_name or "").strip() or subscriber.full_name
        subscriber.source = (payload.source or "").strip().lower() or subscriber.source
        subscriber.notes = (payload.notes or "").strip() or subscriber.notes
        merged_tags = set(_parse_json_list(subscriber.tags))
        merged_tags.update({_normalize_tag(tag) for tag in payload.tags or [] if _normalize_tag(tag)})
        subscriber.tags = _dump_json_list(sorted(merged_tags))
        subscriber.unsubscribed_at = None
        if double_opt_in:
            if subscriber.status != "active" or not subscriber.email_verified_at:
                requires_confirmation = True
                subscriber.status = "pending"
        else:
            subscriber.status = "active"
            subscriber.email_verified_at = subscriber.email_verified_at or now
        subscriber.updated_at = now
    else:
        requires_confirmation = double_opt_in
        subscriber = NewsletterSubscriber(
            email=email,
            full_name=(payload.full_name or "").strip() or None,
            status="pending" if requires_confirmation else "active",
            source=(payload.source or "website").strip().lower(),
            tags=_dump_json_list(payload.tags),
            notes=(payload.notes or "").strip() or None,
            subscribed_at=now,
            email_verified_at=None if requires_confirmation else now,
            created_at=now,
            updated_at=now,
        )
        session.add(subscriber)

    if requires_confirmation:
        token = _create_confirm_token(email)
        subscriber.confirmation_token_hash = _hash_value(token)
        subscriber.confirmation_sent_at = now
        subscriber.email_verified_at = None
        sent = _send_subscriber_confirmation_email(email, subscriber.full_name, token)
        if not sent:
            raise HTTPException(
                status_code=503,
                detail="No se pudo enviar el correo de confirmacion. Intenta nuevamente en unos minutos.",
            )
    else:
        subscriber.confirmation_token_hash = None
        subscriber.confirmation_sent_at = None

    session.add(subscriber)
    session.commit()
    session.refresh(subscriber)

    # Trigger System Notification for Admin (Senior Feature)
    try:
        new_notif = SystemNotification(
            title="Nuevo Suscriptor",
            message=f"{subscriber.email} se ha unido al newsletter (Origen: {subscriber.source}).",
            type="info",
            link="/admin/subscribers"
        )
        session.add(new_notif)
        session.commit()
    except Exception as e:
        logger.error(f"Error creating notification for subscriber: {str(e)}")

    message = (
        "Revisa tu correo y confirma tu suscripcion para activar el newsletter."
        if requires_confirmation
        else "Suscripcion registrada correctamente."
    )
    return PublicSubscribeOut(
        subscriber=_subscriber_to_out(subscriber),
        requires_confirmation=requires_confirmation,
        message=message,
    )


@router.get("/confirm", response_class=HTMLResponse)
def confirm_newsletter_subscription(token: str, session: Session = Depends(get_session)):
    email = _verify_confirm_token(token)
    subscriber = session.exec(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    ).first()

    if not subscriber:
        raise HTTPException(status_code=404, detail="Suscriptor no encontrado.")

    token_hash = _hash_value(token)
    if subscriber.confirmation_token_hash and subscriber.confirmation_token_hash != token_hash:
        raise HTTPException(status_code=400, detail="Token de confirmacion invalido.")

    now = datetime.utcnow()
    subscriber.status = "active"
    subscriber.unsubscribed_at = None
    subscriber.email_verified_at = now
    subscriber.confirmation_token_hash = None
    subscriber.confirmation_sent_at = None
    subscriber.updated_at = now
    if not subscriber.subscribed_at:
        subscriber.subscribed_at = now
    session.add(subscriber)
    session.commit()

    html = """
    <html>
      <head><title>Suscripcion confirmada</title></head>
      <body style="font-family:Arial,sans-serif;background:#020617;color:#e2e8f0;padding:32px;">
        <div style="max-width:640px;margin:0 auto;border:1px solid #1e293b;border-radius:16px;padding:24px;background:#0f172a;">
          <h1 style="margin:0 0 12px 0;">Suscripcion confirmada</h1>
          <p style="margin:0;color:#94a3b8;">Tu correo quedo activado correctamente para recibir campanas y contenido.</p>
        </div>
      </body>
    </html>
    """
    return HTMLResponse(content=html)


@router.get("/unsubscribe", response_class=HTMLResponse)
def unsubscribe_newsletter(token: str, session: Session = Depends(get_session)):
    email = _verify_unsubscribe_token(token)
    subscriber = session.exec(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    ).first()

    if subscriber and subscriber.status != "unsubscribed":
        subscriber.status = "unsubscribed"
        subscriber.unsubscribed_at = datetime.utcnow()
        subscriber.updated_at = datetime.utcnow()
        session.add(subscriber)
        session.commit()

    html = """
    <html>
      <head><title>Suscripcion actualizada</title></head>
      <body style="font-family:Arial,sans-serif;background:#020617;color:#e2e8f0;padding:32px;">
        <div style="max-width:640px;margin:0 auto;border:1px solid #1e293b;border-radius:16px;padding:24px;background:#0f172a;">
          <h1 style="margin:0 0 12px 0;">Suscripcion cancelada</h1>
          <p style="margin:0;color:#94a3b8;">Tu correo fue removido del boletin correctamente.</p>
        </div>
      </body>
    </html>
    """
    return HTMLResponse(content=html)


@router.post("/webhooks/resend")
async def handle_resend_webhook(request: Request, session: Session = Depends(get_session)):
    expected_secret = str(os.getenv("RESEND_WEBHOOK_SECRET", "")).strip()
    if expected_secret:
        received_secret = str(request.headers.get("x-webhook-secret", "")).strip()
        if not received_secret or received_secret != expected_secret:
            raise HTTPException(status_code=401, detail="Webhook no autorizado.")

    payload = await request.json()
    events = payload if isinstance(payload, list) else [payload]
    updated = 0

    for event in events:
        if not isinstance(event, dict):
            continue
        event_type = str(event.get("type") or "").strip().lower()
        email = _extract_resend_event_email(event)
        if not email:
            continue

        next_status = None
        if "bounce" in event_type:
            next_status = "bounced"
        elif "complain" in event_type or "spam" in event_type:
            next_status = "blocked"
        elif "unsubscribe" in event_type:
            next_status = "unsubscribed"

        if not next_status:
            continue

        subscriber = session.exec(
            select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
        ).first()
        if not subscriber:
            continue

        subscriber.status = next_status
        if next_status == "unsubscribed":
            subscriber.unsubscribed_at = datetime.utcnow()
        subscriber.updated_at = datetime.utcnow()
        session.add(subscriber)
        updated += 1

    if updated > 0:
        session.commit()

    return {"ok": True, "updated": updated}


@router.get("/admin/overview", response_model=NewsletterOverviewOut)
def get_newsletter_overview(
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    subscribers = session.exec(select(NewsletterSubscriber)).all()
    campaigns = session.exec(select(NewsletterCampaign)).all()
    deliveries = session.exec(select(NewsletterDelivery)).all()

    return NewsletterOverviewOut(
        total_subscribers=len(subscribers),
        pending_subscribers=sum(1 for item in subscribers if item.status == "pending"),
        active_subscribers=sum(1 for item in subscribers if item.status == "active"),
        unsubscribed_subscribers=sum(1 for item in subscribers if item.status == "unsubscribed"),
        bounced_subscribers=sum(1 for item in subscribers if item.status == "bounced"),
        blocked_subscribers=sum(1 for item in subscribers if item.status == "blocked"),
        total_campaigns=len(campaigns),
        draft_campaigns=sum(1 for item in campaigns if item.status == "draft"),
        scheduled_campaigns=sum(1 for item in campaigns if item.status == "scheduled"),
        sent_campaigns=sum(1 for item in campaigns if item.status == "sent"),
        total_deliveries=len(deliveries),
        sent_deliveries=sum(1 for item in deliveries if item.status == "sent"),
        failed_deliveries=sum(1 for item in deliveries if item.status == "failed"),
    )


@router.get("/admin/subscribers", response_model=SubscribersPageOut)
def list_newsletter_subscribers(
    q: str = Query(default="", description="Busca por email o nombre"),
    status: str = Query(default="all", description="all | pending | active | unsubscribed | bounced | blocked"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=250),
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    normalized_status = (status or "all").strip().lower()
    if normalized_status != "all" and normalized_status not in VALID_SUBSCRIBER_STATUSES:
        raise HTTPException(status_code=400, detail="Estado de suscriptor invalido.")

    normalized_query = (q or "").strip().lower()

    filters = []
    if normalized_status != "all":
        filters.append(NewsletterSubscriber.status == normalized_status)

    if normalized_query:
        like_pattern = f"%{normalized_query}%"
        filters.append(
            or_(
                func.lower(NewsletterSubscriber.email).like(like_pattern),
                func.lower(func.coalesce(NewsletterSubscriber.full_name, "")).like(like_pattern),
            )
        )

    total_stmt = select(func.count()).select_from(NewsletterSubscriber)
    for item_filter in filters:
        total_stmt = total_stmt.where(item_filter)
    total_raw = session.exec(total_stmt).one()
    if isinstance(total_raw, tuple):
        total = int(total_raw[0])
    else:
        total = int(total_raw)

    start = (page - 1) * page_size

    list_stmt = select(NewsletterSubscriber)
    for item_filter in filters:
        list_stmt = list_stmt.where(item_filter)
    list_stmt = list_stmt.order_by(
        NewsletterSubscriber.created_at.desc(),
        NewsletterSubscriber.id.desc(),
    ).offset(start).limit(page_size)
    page_items = session.exec(list_stmt).all()

    return SubscribersPageOut(
        items=[_subscriber_to_out(item) for item in page_items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/admin/subscribers/options", response_model=List[SubscriberOptionOut])
def list_subscriber_options(
    q: str = Query(default=""),
    status: str = Query(default="active"),
    limit: int = Query(default=500, ge=1, le=2000),
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    normalized_status = (status or "active").strip().lower()
    normalized_query = (q or "").strip().lower()

    statement = select(NewsletterSubscriber)

    if normalized_status != "all":
        if normalized_status not in VALID_SUBSCRIBER_STATUSES:
            raise HTTPException(status_code=400, detail="Estado de suscriptor invalido.")
        statement = statement.where(NewsletterSubscriber.status == normalized_status)

    if normalized_query:
        like_pattern = f"%{normalized_query}%"
        statement = statement.where(
            or_(
                func.lower(NewsletterSubscriber.email).like(like_pattern),
                func.lower(func.coalesce(NewsletterSubscriber.full_name, "")).like(like_pattern),
            )
        )

    subscribers = session.exec(
        statement.order_by(NewsletterSubscriber.id.desc()).limit(limit)
    ).all()
    return [_subscriber_to_option(item) for item in subscribers]


@router.put("/admin/subscribers/{subscriber_id}", response_model=SubscriberOut)
def update_newsletter_subscriber(
    subscriber_id: int,
    payload: SubscriberUpdatePayload,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    subscriber = session.get(NewsletterSubscriber, subscriber_id)
    if not subscriber:
        raise HTTPException(status_code=404, detail="Suscriptor no encontrado.")

    now = datetime.utcnow()
    data = payload.model_dump(exclude_unset=True)

    if "status" in data and data["status"] is not None:
        normalized_status = str(data["status"]).strip().lower()
        if normalized_status not in VALID_SUBSCRIBER_STATUSES:
            raise HTTPException(status_code=400, detail="Estado de suscriptor invalido.")
        subscriber.status = normalized_status
        subscriber.unsubscribed_at = now if normalized_status == "unsubscribed" else None

    if "full_name" in data:
        subscriber.full_name = str(data["full_name"] or "").strip() or None

    if "source" in data:
        subscriber.source = str(data["source"] or "").strip().lower() or subscriber.source

    if "notes" in data:
        subscriber.notes = str(data["notes"] or "").strip() or None

    if "tags" in data:
        subscriber.tags = _dump_json_list(data.get("tags"))

    subscriber.updated_at = now
    session.add(subscriber)
    session.commit()
    session.refresh(subscriber)
    return _subscriber_to_out(subscriber)


@router.delete("/admin/subscribers/{subscriber_id}")
def delete_newsletter_subscriber(
    subscriber_id: int,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    subscriber = session.get(NewsletterSubscriber, subscriber_id)
    if not subscriber:
        raise HTTPException(status_code=404, detail="Suscriptor no encontrado.")

    deliveries = session.exec(
        select(NewsletterDelivery).where(NewsletterDelivery.subscriber_id == subscriber_id)
    ).all()
    for delivery in deliveries:
        delivery.subscriber_id = None
        session.add(delivery)

    rules = session.exec(
        select(NewsletterCampaignRecipientRule).where(
            NewsletterCampaignRecipientRule.subscriber_id == subscriber_id
        )
    ).all()
    for row in rules:
        session.delete(row)

    session.delete(subscriber)
    session.commit()
    return {"ok": True}


@router.get("/admin/subscribers/export")
def export_newsletter_subscribers_csv(
    status: str = Query(default="all"),
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    normalized_status = (status or "all").strip().lower()
    if normalized_status != "all" and normalized_status not in VALID_SUBSCRIBER_STATUSES:
        raise HTTPException(status_code=400, detail="Estado de suscriptor invalido.")

    subscribers = session.exec(
        select(NewsletterSubscriber).order_by(
            NewsletterSubscriber.created_at.desc(),
            NewsletterSubscriber.id.desc(),
        )
    ).all()

    if normalized_status != "all":
        subscribers = [item for item in subscribers if item.status == normalized_status]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "email",
            "full_name",
            "status",
            "source",
            "tags",
            "subscribed_at",
            "unsubscribed_at",
            "last_sent_at",
            "notes",
        ]
    )
    for item in subscribers:
        writer.writerow(
            [
                item.id,
                item.email,
                item.full_name or "",
                item.status,
                item.source,
                ", ".join(_parse_json_list(item.tags)),
                item.subscribed_at.isoformat() if item.subscribed_at else "",
                item.unsubscribed_at.isoformat() if item.unsubscribed_at else "",
                item.last_sent_at.isoformat() if item.last_sent_at else "",
                item.notes or "",
            ]
        )

    csv_content = output.getvalue()
    filename = f"newsletter-subscribers-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/admin/content-catalog", response_model=CampaignContentCatalogOut)
def get_campaign_content_catalog(
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    return _build_content_catalog(session)


@router.post("/admin/recipients/preview", response_model=RecipientPreviewOut)
def preview_campaign_recipients(
    payload: RecipientPreviewPayload,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaign = NewsletterCampaign(
        name="preview",
        subject="preview",
        content_html="<p>preview</p>",
        target_mode=_normalize_target_mode(payload.target_mode),
        target_tags=_dump_json_list(payload.target_tags),
        status="draft",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    recipients = _resolve_recipients_for_campaign(
        session,
        campaign,
        include_ids=_normalize_subscriber_ids(payload.include_subscriber_ids),
        exclude_ids=_normalize_subscriber_ids(payload.exclude_subscriber_ids),
    )

    return RecipientPreviewOut(
        total=len(recipients),
        items=[
            RecipientPreviewItemOut(
                id=item.id or 0,
                email=item.email,
                full_name=item.full_name,
                source=item.source,
            )
            for item in recipients[:100]
        ],
    )


@router.get("/admin/campaigns", response_model=List[CampaignOut])
def list_newsletter_campaigns(
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaigns = session.exec(
        select(NewsletterCampaign).order_by(
            NewsletterCampaign.created_at.desc(),
            NewsletterCampaign.id.desc(),
        )
    ).all()
    return [_campaign_to_out(session, item) for item in campaigns]


@router.post("/admin/campaigns/process-due", response_model=CampaignProcessDueOut)
def process_due_newsletter_campaigns_now(
    _current_user=Depends(require_admin),
):
    result = process_due_newsletter_campaigns()
    return CampaignProcessDueOut(processed=result.get("processed", 0), errors=result.get("errors", 0))


@router.post("/admin/campaigns", response_model=CampaignOut)
def create_newsletter_campaign(
    payload: CampaignCreatePayload,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    now = datetime.utcnow()
    target_mode = _normalize_target_mode(payload.target_mode)
    scheduled_for = _validate_scheduled_for_or_raise(payload.scheduled_for)

    if not payload.name.strip() or not payload.subject.strip() or not payload.content_html.strip():
        raise HTTPException(status_code=400, detail="Nombre, asunto y contenido HTML son obligatorios.")

    campaign = NewsletterCampaign(
        name=payload.name.strip(),
        subject=payload.subject.strip(),
        preview_text=(payload.preview_text or "").strip() or None,
        content_html=payload.content_html.strip(),
        content_text=(payload.content_text or "").strip() or None,
        status="scheduled" if scheduled_for else "draft",
        target_mode=target_mode,
        target_tags=_dump_json_list(payload.target_tags),
        scheduled_for=scheduled_for,
        created_at=now,
        updated_at=now,
    )
    session.add(campaign)
    session.commit()
    session.refresh(campaign)

    include_ids = _normalize_subscriber_ids(payload.include_subscriber_ids)
    exclude_ids = _normalize_subscriber_ids(payload.exclude_subscriber_ids)
    _save_campaign_content_rows(session, campaign.id or 0, payload.content_items)
    _save_campaign_recipient_rules(session, campaign.id or 0, include_ids, exclude_ids)

    session.commit()
    session.refresh(campaign)
    if scheduled_for:
        return _campaign_to_out(session, campaign)

    # Regla de negocio solicitada:
    # - Crear campaña SIN fecha programada => enviar inmediatamente.
    _execute_campaign_send(session, campaign, force=False)
    session.refresh(campaign)
    return _campaign_to_out(session, campaign)


@router.put("/admin/campaigns/{campaign_id}", response_model=CampaignOut)
def update_newsletter_campaign(
    campaign_id: int,
    payload: CampaignUpdatePayload,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaign = session.get(NewsletterCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campana no encontrada.")

    data = payload.model_dump(exclude_unset=True)
    status_explicit = "status" in data and data["status"] is not None

    if "name" in data and data["name"] is not None:
        campaign.name = str(data["name"]).strip()
    if "subject" in data and data["subject"] is not None:
        campaign.subject = str(data["subject"]).strip()
    if "preview_text" in data:
        campaign.preview_text = str(data["preview_text"] or "").strip() or None
    if "content_html" in data and data["content_html"] is not None:
        campaign.content_html = str(data["content_html"]).strip()
    if "content_text" in data:
        campaign.content_text = str(data["content_text"] or "").strip() or None
    if "target_mode" in data and data["target_mode"] is not None:
        campaign.target_mode = _normalize_target_mode(data["target_mode"])
    if "target_tags" in data:
        campaign.target_tags = _dump_json_list(data.get("target_tags"))
    if "status" in data and data["status"] is not None:
        status = str(data["status"]).strip().lower()
        if status not in VALID_CAMPAIGN_STATUSES:
            raise HTTPException(status_code=400, detail="Estado de campana invalido.")
        campaign.status = status
    if "scheduled_for" in data:
        campaign.scheduled_for = _validate_scheduled_for_or_raise(data.get("scheduled_for"))
        if not status_explicit:
            if campaign.scheduled_for:
                campaign.status = "scheduled"
            elif campaign.status == "scheduled":
                campaign.status = "draft"

    if not campaign.name or not campaign.subject or not campaign.content_html:
        raise HTTPException(status_code=400, detail="Nombre, asunto y contenido HTML son obligatorios.")

    campaign.updated_at = datetime.utcnow()
    session.add(campaign)

    if "content_items" in data:
        _save_campaign_content_rows(session, campaign.id or 0, payload.content_items)

    if "include_subscriber_ids" in data or "exclude_subscriber_ids" in data:
        include_ids = _normalize_subscriber_ids(payload.include_subscriber_ids)
        exclude_ids = _normalize_subscriber_ids(payload.exclude_subscriber_ids)
        if "include_subscriber_ids" not in data or payload.include_subscriber_ids is None:
            include_ids = _campaign_rule_id_sets(session, campaign.id or 0)["include"]
        if "exclude_subscriber_ids" not in data or payload.exclude_subscriber_ids is None:
            exclude_ids = _campaign_rule_id_sets(session, campaign.id or 0)["exclude"]
        _save_campaign_recipient_rules(session, campaign.id or 0, include_ids, exclude_ids)

    session.commit()
    session.refresh(campaign)
    return _campaign_to_out(session, campaign)


@router.delete("/admin/campaigns/{campaign_id}")
def delete_newsletter_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaign = session.get(NewsletterCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campana no encontrada.")

    deliveries = session.exec(
        select(NewsletterDelivery).where(NewsletterDelivery.campaign_id == campaign_id)
    ).all()
    for delivery in deliveries:
        session.delete(delivery)

    contents = session.exec(
        select(NewsletterCampaignContent).where(NewsletterCampaignContent.campaign_id == campaign_id)
    ).all()
    for row in contents:
        session.delete(row)

    rules = session.exec(
        select(NewsletterCampaignRecipientRule).where(
            NewsletterCampaignRecipientRule.campaign_id == campaign_id
        )
    ).all()
    for row in rules:
        session.delete(row)

    session.delete(campaign)
    session.commit()
    return {"ok": True}


@router.get("/admin/campaigns/{campaign_id}/deliveries", response_model=List[DeliveryOut])
def list_newsletter_campaign_deliveries(
    campaign_id: int,
    status: str = Query(default="all"),
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaign = session.get(NewsletterCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campana no encontrada.")

    normalized_status = (status or "all").strip().lower()
    deliveries = session.exec(
        select(NewsletterDelivery)
        .where(NewsletterDelivery.campaign_id == campaign_id)
        .order_by(NewsletterDelivery.created_at.desc(), NewsletterDelivery.id.desc())
    ).all()

    if normalized_status != "all":
        deliveries = [item for item in deliveries if item.status == normalized_status]

    return [_delivery_to_out(item) for item in deliveries]


@router.post("/admin/campaigns/{campaign_id}/send-test")
def send_newsletter_campaign_test(
    campaign_id: int,
    payload: CampaignTestPayload,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaign = session.get(NewsletterCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campana no encontrada.")

    destination = _normalize_email(str(payload.email))
    html = _compose_campaign_html(session, campaign, destination)
    result = send_email_with_result(destination, f"[TEST] {campaign.subject}", html)
    ok = bool(result.ok)

    subscriber = session.exec(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == destination)
    ).first()

    session.add(
        NewsletterDelivery(
            campaign_id=campaign.id or 0,
            subscriber_id=subscriber.id if subscriber else None,
            email=destination,
            status="sent" if ok else "failed",
            error_message=None if ok else (result.error or "No se pudo enviar correo de prueba."),
            provider_message_id=result.provider_message_id,
            sent_at=datetime.utcnow() if ok else None,
            created_at=datetime.utcnow(),
        )
    )
    session.commit()

    if not ok:
        raise HTTPException(status_code=502, detail="No se pudo enviar el correo de prueba.")

    return {"ok": True, "message": f"Correo de prueba enviado a {destination}."}


@router.post("/admin/campaigns/{campaign_id}/send-now", response_model=CampaignSendResultOut)
def send_newsletter_campaign_now(
    campaign_id: int,
    payload: CampaignSendPayload,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    campaign = session.get(NewsletterCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campana no encontrada.")

    return _execute_campaign_send(session, campaign, force=payload.force)
