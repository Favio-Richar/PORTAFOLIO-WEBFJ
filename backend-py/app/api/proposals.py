import json
import logging
import secrets
import os
import re
import uuid
import cloudinary.uploader
from html import escape
from datetime import datetime, timedelta
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select, or_

from app.db import engine
from app.models import (
    AdditionalService,
    AdvisoryBooking,
    EnterpriseProposal,
    ProfessionalPlan,
    QuoteHistory,
    ServiceAdvisoryCard,
    ServiceCombo,
    ServiceIndustry,
    SystemNotification,
)
from app.core.email import send_email
from app.core.settings import get_setting_value
from app.core.admin_auth import require_admin

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/payment-settings")
async def get_public_payment_settings():
    """
    Retorna las configuraciones de pago (Banco, PayPal, MercadoPago) de GlobalSettings.
    Cualquier cliente con acceso al portal de seguimiento puede ver esto. Las configuraciones
    vienen de la base de datos (GlobalSettings) para ser dinámicas.
    """
    with Session(engine) as session:
        bank_details = get_setting_value(session, "bank_transfer_details", "Banco Falabella | Corriente | 1-724-002786-7 | RUT: 24.785.698-6 | Favio Jimenez")
        paypal_url = get_setting_value(session, "paypal_payment_url", "https://paypal.me/fav945")
        mp_url = get_setting_value(session, "mercadopago_payment_url", "https://www.mercadopago.cl")
        transbank_url = get_setting_value(session, "transbank_payment_url", "#")
        
        return {
            "bank_transfer_details": bank_details,
            "paypal_payment_url": paypal_url,
            "mercadopago_payment_url": mp_url,
            "transbank_payment_url": transbank_url
        }

ALLOWED_PROPOSAL_STATUSES = {"Pending", "Sent", "Approved", "Rejected", "Expired"}
PROJECT_TRACKING_STAGES = [
    ("quote_created", "Cotizacion creada"),
    ("quote_sent", "Cotizacion enviada"),
    ("client_review", "Revision del cliente"),
    ("quote_approved", "Propuesta aprobada"),
    ("payment_50", "Pago inicial 50% confirmado"),
    ("kickoff", "Inicio del proyecto"),
    ("system_progress", "Avance de sistema"),
    ("development", "Desarrollo"),
    ("qa", "Validacion y QA"),
    ("delivery", "Entrega final"),
]
TRACKING_ACTION_PREFIX = "TRACKING::"
TRACKING_STAGE_META = {
    "quote_created": {
        "description": "La propuesta fue estructurada por administracion y quedo lista para su validacion comercial.",
        "next_step": "Enviar formalmente la cotizacion al correo del cliente.",
        "client_title": "Cotizacion generada",
    },
    "quote_sent": {
        "description": "La propuesta fue enviada por correo junto con su enlace seguro de revision.",
        "next_step": "El cliente revisa alcance, inversion y condiciones comerciales.",
        "client_title": "Cotizacion enviada",
    },
    "client_review": {
        "description": "La propuesta se encuentra en evaluacion del cliente y puede recibir observaciones antes de aprobarse.",
        "next_step": "Esperar confirmacion, dudas o solicitud de ajustes.",
        "client_title": "Revision del cliente",
    },
    "quote_approved": {
        "description": "La propuesta fue aprobada y quedo habilitado el inicio administrativo del proyecto.",
        "next_step": "Confirmar pago inicial y coordinar kickoff operativo.",
        "client_title": "Propuesta aprobada",
    },
    "payment_50": {
        "description": "Se confirmo el pago inicial acordado, habilitando el arranque formal del proyecto.",
        "next_step": "Preparar kickoff, accesos, cronograma y responsables.",
        "client_title": "Pago inicial confirmado",
    },
    "kickoff": {
        "description": "Estamos alineando objetivos, accesos, responsables y calendario de trabajo con su equipo.",
        "next_step": "Arranca el avance del sistema y primeros entregables visuales.",
        "client_title": "Inicio del proyecto",
    },
    "system_progress": {
        "description": "Estamos trabajando en los primeros entregables, pantallas y estructura inicial del proyecto.",
        "next_step": "Avanzar hacia el desarrollo del codigo o integracion tecnica profunda.",
        "client_title": "Avance de sistema",
    },
    "development": {
        "description": "El equipo tecnico se encuentra construyendo, integrando y documentando los entregables comprometidos.",
        "next_step": "Validar avances, cerrar pendientes tecnicos y preparar QA.",
        "client_title": "Desarrollo en curso",
    },
    "qa": {
        "description": "La solucion esta pasando por validacion funcional, control de calidad y ajustes finales previos a entrega.",
        "next_step": "Cerrar observaciones y preparar entrega final.",
        "client_title": "Validacion y QA",
    },
    "delivery": {
        "description": "El proyecto entro en fase de entrega final, documentacion y cierre operativo.",
        "next_step": "Confirmar recepcion final y cierre administrativo.",
        "client_title": "Entrega final",
    },
}


def _generate_unique_quote_number(session: Session, suffix: str = "") -> str:
    timestamp = datetime.now().strftime("%Y%m%d")
    for _ in range(30):
        random_suffix = secrets.randbelow(900000) + 100000
        candidate = f"QT-{timestamp}-{random_suffix}{suffix}"
        existing_id = session.exec(
            select(EnterpriseProposal.id).where(EnterpriseProposal.quote_number == candidate)
        ).first()
        if not existing_id:
            return candidate
    return f"QT-{timestamp}-{int(datetime.utcnow().timestamp())}{suffix}"


def _clean_inline_text(value: Optional[Union[str, int, float]], fallback: str = "") -> str:
    if value is None:
        return fallback
    text = str(value)
    text = (
        text.replace("\r\n", "\n")
        .replace("\\r\\n", "\n")
        .replace("\\n", "\n")
        .replace("`r`n", "\n")
        .replace("`n", "\n")
        .replace("\u00a0", " ")
    )
    text = re.sub(r"\s+", " ", text).strip()
    return text or fallback


def _parse_proposal_items(value: Optional[Union[str, List[dict]]]) -> List[dict]:
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    if not value:
        return []
    try:
        parsed = json.loads(str(value))
        if isinstance(parsed, list):
            return [item for item in parsed if isinstance(item, dict)]
    except (TypeError, ValueError, json.JSONDecodeError):
        return []
    return []


def _get_tracking_stage_meta(stage_id: Optional[str]) -> dict:
    safe_stage = str(stage_id or "")
    meta = TRACKING_STAGE_META.get(safe_stage, {})
    return {
        "id": safe_stage,
        "client_title": meta.get("client_title") or safe_stage,
        "description": meta.get("description") or "",
        "next_step": meta.get("next_step") or "",
    }


def _parse_text_list(value: Optional[Union[str, List[str]]]) -> List[str]:
    if value is None:
        return []
    def _normalize_list_text(text: str) -> str:
        return (
            text.replace("\r\n", "\n")
            .replace("\\r\\n", "\n")
            .replace("\\n", "\n")
            .replace("`r`n", "\n")
            .replace("`n", "\n")
            .replace("•", "\n")
            .replace("·", "\n")
            .replace("\u00a0", " ")
        )

    def _split_list_text(text: str) -> List[str]:
        normalized = _normalize_list_text(text).strip().strip("[]")
        if not normalized:
            return []
        parts = re.split(r"[\n;,]+", normalized)
        return [part.strip().strip("'\"") for part in parts if part and part.strip().strip("'\"")]

    if isinstance(value, list):
        merged: List[str] = []
        for item in value:
            merged.extend(_split_list_text(str(item)))
        return merged

    trimmed = str(value).strip()
    if not trimmed:
        return []

    try:
        parsed = json.loads(trimmed)
        if isinstance(parsed, list):
            merged: List[str] = []
            for item in parsed:
                merged.extend(_split_list_text(str(item)))
            return merged
    except (json.JSONDecodeError, TypeError, ValueError):
        pass

    return _split_list_text(trimmed)


def _to_number(value: Optional[Union[int, float, str]], default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)

    raw = str(value).strip()
    if not raw:
        return default

    cleaned = re.sub(r"[^\d,.\-]", "", raw)
    if not cleaned:
        return default

    if re.match(r"^-?\d{1,3}(\.\d{3})+$", cleaned):
        cleaned = cleaned.replace(".", "")
    elif re.match(r"^-?\d{1,3}(,\d{3})+$", cleaned):
        cleaned = cleaned.replace(",", "")
    elif "." in cleaned and "," in cleaned:
        if cleaned.rfind(",") > cleaned.rfind("."):
            cleaned = cleaned.replace(".", "").replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")

    try:
        return float(cleaned)
    except (TypeError, ValueError):
        digits_only = re.sub(r"[^\d\-]", "", cleaned)
        if not digits_only:
            return default
        try:
            return float(digits_only)
        except (TypeError, ValueError):
            return default


def _format_money(value: Optional[Union[int, float, str]], currency: str = "CLP") -> str:
    amount = _to_number(value, 0.0)
    safe_currency = (currency or "CLP").upper()
    if safe_currency == "CLP":
        formatted = f"{int(round(amount)):,}".replace(",", ".")
        return f"${formatted} {safe_currency}"
    return f"${amount:,.2f} {safe_currency}"


def _proposal_to_payload(proposal: EnterpriseProposal) -> dict:
    payload: dict = {}
    for field_name in EnterpriseProposal.model_fields.keys():
        value = getattr(proposal, field_name, None)
        if isinstance(value, datetime):
            payload[field_name] = value.isoformat()
        else:
            payload[field_name] = value
    return payload


def _normalize_match_text(value: Optional[Union[str, List[str]]]) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        raw = " ".join(str(item) for item in value if item is not None)
    else:
        raw = str(value)
    normalized = (
        raw.replace("\r\n", " ")
        .replace("\\r\\n", " ")
        .replace("\\n", " ")
        .replace("`r`n", " ")
        .replace("`n", " ")
        .replace("\u00a0", " ")
        .lower()
    )
    normalized = re.sub(r"[^0-9a-záéíóúñü\s]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def _collect_match_keywords(proposal: EnterpriseProposal, items: List[dict]) -> List[str]:
    stopwords = {
        "para", "con", "sin", "por", "del", "las", "los", "una", "uno", "sobre", "desde",
        "tipo", "ideal", "servicio", "servicios", "proyecto", "proyectos", "incluye",
        "entrega", "resultado", "gestion", "comercial", "cliente", "digital", "engineering",
        "fj", "propuesta", "solucion", "soluciones", "pagina", "web", "plan", "combo",
    }
    text_sources: List[str] = [
        proposal.client_company or "",
        proposal.project_objective or "",
        proposal.notes or "",
        proposal.payment_terms or "",
        proposal.legal_terms or "",
    ]
    for item in items:
        text_sources.extend(
            [
                str(item.get("name", "")),
                str(item.get("description", "")),
                str(item.get("service_type", "")),
                str(item.get("category", "")),
                str(item.get("timeline", "")),
                str(item.get("ideal_for", "")),
                str(item.get("delivery", "")),
                str(item.get("result", "")),
                str(item.get("market_note", "")),
                str(item.get("note", "")),
                str(item.get("duration", "")),
            ]
        )
        text_sources.extend(_parse_text_list(item.get("includes")))
        text_sources.extend(_parse_text_list(item.get("deliverables")))
        text_sources.extend(_parse_text_list(item.get("audience")))

    tokens: List[str] = []
    for source in text_sources:
        normalized = _normalize_match_text(source)
        if not normalized:
            continue
        for token in normalized.split():
            if len(token) < 4 or token in stopwords:
                continue
            tokens.append(token)

    unique_tokens: List[str] = []
    seen = set()
    for token in tokens:
        if token in seen:
            continue
        seen.add(token)
        unique_tokens.append(token)
    return unique_tokens[:18]


def _score_candidate_match(keywords: List[str], *texts: Optional[Union[str, List[str]]]) -> int:
    if not keywords:
        return 0
    candidate_text = _normalize_match_text([text for text in texts if text is not None])
    if not candidate_text:
        return 0
    candidate_tokens = set(candidate_text.split())
    score = 0
    for keyword in keywords:
        if keyword in candidate_tokens:
            score += 3
        elif keyword in candidate_text:
            score += 1
    return score

# --- Schemas ---
class ProposalItem(BaseModel):
    id: Union[int, str]
    name: str
    description: str
    price: float
    quantity: int = 1
    customPrice: Optional[float] = None
    type: Optional[str] = None
    source_id: Optional[Union[int, str]] = None
    service_type: Optional[str] = None
    category: Optional[str] = None
    includes: Optional[Union[List[str], str]] = None
    deliverables: Optional[Union[List[str], str]] = None
    timeline: Optional[str] = None
    ideal_for: Optional[str] = None
    delivery: Optional[str] = None
    result: Optional[str] = None
    audience: Optional[Union[List[str], str]] = None
    market_note: Optional[str] = None
    payment_type: Optional[str] = None
    note: Optional[str] = None
    duration: Optional[str] = None

class ProposalCreate(BaseModel):
    client_name: str
    client_company: Optional[str] = None
    client_email: EmailStr
    client_phone: Optional[str] = None
    client_rfc: Optional[str] = None
    client_address: Optional[str] = None
    currency: str = "CLP"
    urgency_level: str = "Standard"
    valid_days: int = 30
    lead_time: str = "4-6 Weeks"
    items: List[ProposalItem]
    subtotal: float
    discount_percent: float = 0.0
    tax_percent: float = 19.0
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_clabe: Optional[str] = None
    payment_terms: Optional[str] = None
    project_objective: Optional[str] = None
    payment_schedule: str = "[]"
    legal_terms: Optional[str] = None
    notes: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str


class ProjectProgressUpdate(BaseModel):
    stage: str
    note: Optional[str] = None


class ProjectTrackingUpdate(BaseModel):
    stage: str
    note: Optional[str] = None
    progress_percent: Optional[int] = None
    report: Optional[str] = None
    media_urls: Optional[List[str]] = None
    client_visible: bool = True
    complete_stage: bool = True


def _build_tracking_action(data: dict) -> str:
    return f"{TRACKING_ACTION_PREFIX}{json.dumps(data, ensure_ascii=False)}"


def _parse_tracking_action(action: str) -> Optional[dict]:
    if not isinstance(action, str) or not action.startswith(TRACKING_ACTION_PREFIX):
        return None
    raw = action[len(TRACKING_ACTION_PREFIX):].strip()
    if not raw:
        return None
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else None
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


from app.models import (
    EnterpriseProposal, 
    QuoteHistory, 
    SystemNotification, 
    LeadCommunication,
    LeadContactOverride
)


def _build_tracking_payload(proposal: EnterpriseProposal, history: List[QuoteHistory]) -> dict:
    stage_order = {stage_id: idx for idx, (stage_id, _) in enumerate(PROJECT_TRACKING_STAGES)}
    stage_dates: dict = {"quote_created": proposal.created_at, "quote_sent": proposal.sent_at, "quote_approved": proposal.accepted_at}
    stage_activity_dates: dict = {"quote_created": proposal.created_at, "quote_sent": proposal.sent_at, "quote_approved": proposal.accepted_at}
    events: List[dict] = []
    client_events: List[dict] = []
    tracking_stage_data: dict = {}
    items = _parse_proposal_items(proposal.items)
    latest_progress_override: Optional[int] = None

    for row in history:
        action_text = str(row.action or "")
        action_lower = action_text.lower()
        tracking_payload = _parse_tracking_action(action_text)

        stage_hit: Optional[str] = None
        stage_completed = True
        if tracking_payload:
            stage_hit = str(tracking_payload.get("stage") or "")
            if stage_hit:
                tracking_stage_data[stage_hit] = tracking_payload
                stage_completed = bool(tracking_payload.get("completed", True))
                if latest_progress_override is None and isinstance(tracking_payload.get("progress_percent"), int):
                    latest_progress_override = max(0, min(100, int(tracking_payload["progress_percent"])))
        else:
            if "cliente abrió" in action_lower:
                stage_hit = "client_review"
            elif "aceptad" in action_lower:
                stage_hit = "quote_approved"
            elif "enviada por email" in action_lower:
                stage_hit = "quote_sent"
            elif "proyecto - kickoff" in action_lower or "inicio del proyecto" in action_lower:
                stage_hit = "kickoff"
            elif "avance de sistema" in action_lower or "system_progress" in action_lower:
                stage_hit = "system_progress"
            elif "proyecto - desarrollo" in action_lower:
                stage_hit = "development"
            elif "proyecto - qa" in action_lower or "validacion" in action_lower or "pruebas" in action_lower:
                stage_hit = "qa"
            elif "proyecto - entrega" in action_lower or "entrega final" in action_lower:
                stage_hit = "delivery"
            elif "pago" in action_lower and "50" in action_lower:
                stage_hit = "payment_50"

        if stage_hit and not stage_activity_dates.get(stage_hit):
            stage_activity_dates[stage_hit] = row.created_at

        if stage_hit and stage_completed and not stage_dates.get(stage_hit):
            stage_dates[stage_hit] = row.created_at

        default_client_visible = bool(stage_hit in {"quote_created", "quote_sent", "client_review", "quote_approved", "payment_50", "kickoff", "system_progress", "development", "qa", "delivery"})
        stage_meta = _get_tracking_stage_meta(stage_hit)
        report_text = _clean_inline_text(tracking_payload.get("report")) if tracking_payload else ""
        event_item = {
            "id": row.id,
            "action": tracking_payload.get("title") if tracking_payload else action_text,
            "created_at": row.created_at.isoformat() if isinstance(row.created_at, datetime) else None,
            "stage": stage_hit,
            "stage_label": stage_meta["client_title"] if stage_hit else None,
            "summary": report_text or stage_meta["description"] or None,
            "report": report_text or None,
            "media_urls": tracking_payload.get("media_urls") if tracking_payload else None,
            "completed": stage_completed,
            "progress_percent": tracking_payload.get("progress_percent") if tracking_payload else None,
            "client_visible": bool(tracking_payload.get("client_visible", True)) if tracking_payload else default_client_visible,
        }
        events.append(event_item)
        if event_item["client_visible"]:
            client_events.append(event_item)

    # Etapa "actual" = primera post-aprobación sin fecha (p. ej. pago 50% antes de kickoff).
    current_stage = "client_review"
    if proposal.status == "Approved":
        post_approval = ("payment_50", "kickoff", "system_progress", "development", "qa", "delivery")
        current_stage = "payment_50"
        for stage_id in post_approval:
            if not stage_dates.get(stage_id):
                current_stage = stage_id
                break
        else:
            current_stage = "delivery"
    elif proposal.status == "Rejected":
        current_stage = "quote_approved"
    elif proposal.status == "Sent":
        current_stage = "client_review"
    elif proposal.status == "Pending":
        current_stage = "quote_created"

    stages = []
    for stage_id, label in PROJECT_TRACKING_STAGES:
        stage_idx = stage_order[stage_id]
        current_idx = stage_order.get(current_stage, 0)
        payload = tracking_stage_data.get(stage_id) or {}
        meta = _get_tracking_stage_meta(stage_id)
        status = "pending"
        if stage_dates.get(stage_id):
            status = "completed"
        elif stage_idx == current_idx:
            status = "current"
        elif stage_idx < current_idx:
            status = "completed"
        stages.append(
            {
                "id": stage_id,
                "label": label,
                "status": status,
                "date": (stage_dates.get(stage_id) or stage_activity_dates.get(stage_id)).isoformat() if (stage_dates.get(stage_id) or stage_activity_dates.get(stage_id)) else None,
                "client_title": meta["client_title"],
                "description": meta["description"],
                "next_step": meta["next_step"],
                "report": _clean_inline_text(payload.get("report")) or None,
                "media_urls": payload.get("media_urls") or [],
                "summary": _clean_inline_text(payload.get("report")) or meta["description"] or None,
                "progress_percent": payload.get("progress_percent") if isinstance(payload.get("progress_percent"), int) else None,
                "completed": bool(payload.get("completed", True)) if payload else status == "completed",
            }
        )

    completed_count = sum(1 for item in stages if item["status"] == "completed")
    progress_percent = int(round((completed_count / len(stages)) * 100)) if stages else 0
    current_stage_detail = next((stage for stage in stages if stage["id"] == current_stage), None)
    next_stage_detail = next((stage for stage in stages if stage["status"] == "pending"), None)
    latest_client_update = client_events[0] if client_events else None
    scope_items = []
    for item in items[:4]:
        scope_items.append(
            {
                "name": _clean_inline_text(item.get("name"), "Servicio profesional"),
                "description": _clean_inline_text(item.get("description")),
                "includes": _parse_text_list(item.get("includes"))[:4],
                "deliverables": _parse_text_list(item.get("deliverables"))[:4],
            }
        )

    return {
        "status": proposal.status,
        "current_stage": current_stage,
        "progress_percent": latest_progress_override if latest_progress_override is not None else progress_percent,
        "stages": stages,
        "events": events,
        "client_timeline": client_events,
        "current_stage_detail": current_stage_detail,
        "next_stage_detail": next_stage_detail,
        "latest_client_update": latest_client_update,
        "scope_items": scope_items,
    }


def _build_tracking_update_email_html(proposal: EnterpriseProposal, tracking: dict, frontend_url: str) -> str:
    current_stage = tracking.get("current_stage_detail") or {}
    latest_update = tracking.get("latest_client_update") or {}
    progress_percent = int(_to_number(tracking.get("progress_percent"), 0))
    quote_number = _clean_inline_text(proposal.quote_number, "QT")
    client_name = _clean_inline_text(proposal.client_name, "Cliente")
    company_name = _clean_inline_text(proposal.client_company, client_name)
    stage_title = _clean_inline_text(current_stage.get("client_title"), "Actualizacion de proyecto")
    stage_summary = _clean_inline_text(current_stage.get("summary") or latest_update.get("summary"))
    stage_next = _clean_inline_text(current_stage.get("next_step"))
    tracking_url = f"{frontend_url}/cotizacion/{proposal.public_token}/seguimiento"
    proposal_url = f"{frontend_url}/cotizacion/{proposal.public_token}"
    evidence_links = latest_update.get("media_urls") or []
    evidence_html = ""
    if evidence_links:
        evidence_html = "".join(
            f'<a href="{escape(str(url))}" style="display:inline-block; margin:0 8px 8px 0; padding:8px 12px; border:1px solid #cbd5e1; border-radius:999px; color:#0f172a; text-decoration:none; font-size:12px; font-weight:700;">Evidencia {idx + 1}</a>'
            for idx, url in enumerate(evidence_links[:4])
        )
        evidence_html = f'<div style="margin-top:14px;">{evidence_html}</div>'

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin:0; padding:24px 0; background:#eef2e8; color:#1e293b; font-family:Arial, sans-serif;">
        <div style="max-width:720px; margin:0 auto; background:#ffffff; border:1px solid #d7dfcf; box-shadow:0 12px 30px rgba(15,23,42,0.08);">
            <div style="padding:26px 30px; background:#0f172a; color:#ffffff;">
                <div style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; font-weight:700; color:#a5b4c7;">Seguimiento operativo</div>
                <div style="margin-top:10px; font-size:28px; font-weight:900;">{escape(quote_number)}</div>
                <div style="margin-top:8px; font-size:14px; color:#d5dfeb;">{escape(company_name)}</div>
            </div>
            <div style="padding:28px 30px 32px;">
                <p style="margin:0 0 14px; font-size:15px; line-height:1.7;">Estimado/a <strong>{escape(client_name)}</strong>,</p>
                <p style="margin:0 0 16px; font-size:14px; line-height:1.8; color:#475569;">
                    Registramos un nuevo avance visible en su proyecto. Puede revisar el estado general y la trazabilidad completa desde su portal seguro.
                </p>
                <div style="border:1px solid #d7dfcf; background:#f8fbf3; padding:18px 18px 16px;">
                    <div style="display:inline-block; background:#e5f0d4; color:#6d8b35; padding:6px 10px; border-radius:999px; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.10em;">Etapa actual</div>
                    <div style="margin-top:12px; font-size:24px; font-weight:900; color:#0f172a;">{escape(stage_title)}</div>
                    <div style="margin-top:8px; font-size:14px; line-height:1.75; color:#475569;">{escape(stage_summary or "Se registro una nueva actualizacion en su proyecto.")}</div>
                    <div style="margin-top:14px; font-size:13px; color:#334155;"><strong>Avance general:</strong> {progress_percent}%</div>
                    {f'<div style="margin-top:8px; font-size:13px; line-height:1.7; color:#334155;"><strong>Siguiente paso:</strong> {escape(stage_next)}</div>' if stage_next else ''}
                    {evidence_html}
                </div>
                <div style="margin-top:22px; text-align:center;">
                    <a href="{tracking_url}" style="display:inline-block; background:#6d8b35; color:#ffffff; text-decoration:none; font-size:12px; font-weight:900; letter-spacing:0.10em; text-transform:uppercase; padding:14px 24px;">Ver seguimiento del proyecto</a>
                </div>
                <div style="margin-top:14px; text-align:center;">
                    <a href="{proposal_url}" style="display:inline-block; color:#0f172a; text-decoration:none; font-size:12px; font-weight:700;">Abrir propuesta comercial</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# --- Endpoints ---

@router.post("/")
async def create_proposal(
    data: ProposalCreate,
    current_user=Depends(require_admin),
):
    """Crea una nueva cotización profesional"""
    try:
        # Generar número de folio único: QT-YYYYMMDD-RAND
        # Generar token publico
        public_token = secrets.token_urlsafe(16)

        # Calcular financieros
        disc_amt = data.subtotal * (data.discount_percent / 100)
        taxable_amt = data.subtotal - disc_amt
        tax_amt = taxable_amt * (data.tax_percent / 100)
        final_total = taxable_amt + tax_amt

        with Session(engine) as session:
            quote_number = _generate_unique_quote_number(session)
            proposal = EnterpriseProposal(
                public_token=public_token,
                quote_number=quote_number,
                client_name=data.client_name,
                client_company=data.client_company,
                client_email=data.client_email,
                client_phone=data.client_phone,
                client_rfc=data.client_rfc,
                client_address=data.client_address,
                currency=data.currency,
                urgency_level=data.urgency_level,
                valid_days=data.valid_days,
                lead_time=data.lead_time,
                items=json.dumps([item.dict() for item in data.items]),
                subtotal=data.subtotal,
                discount_percent=data.discount_percent,
                discount_amount=disc_amt,
                tax_percent=data.tax_percent,
                tax_amount=tax_amt,
                final_total=final_total,
                bank_name=data.bank_name,
                bank_account=data.bank_account,
                bank_clabe=data.bank_clabe,
                payment_terms=data.payment_terms,
                project_objective=data.project_objective,
                payment_schedule=data.payment_schedule,
                legal_terms=data.legal_terms,
                notes=data.notes,
                status="Pending",
                created_at=datetime.utcnow()
            )
            session.add(proposal)
            # Persist proposal first to get ID, then write history in the same transaction.
            session.flush()
            session.add(history)

            # Persistencia en motor de Leads (LeadContactOverride)
            if data.client_email and data.client_phone:
                email_norm = data.client_email.strip().lower()
                existing_lead = session.exec(
                    select(LeadContactOverride).where(LeadContactOverride.email == email_norm)
                ).first()
                if existing_lead:
                    existing_lead.phone = data.client_phone
                    existing_lead.updated_at = datetime.utcnow()
                else:
                    new_lead = LeadContactOverride(
                        email=email_norm,
                        phone=data.client_phone,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    session.add(new_lead)

            session.commit()
            session.refresh(proposal)

            # Return a fully materialized payload so frontend always receives ID/folio.
            return _proposal_to_payload(proposal)
    except Exception as e:
        logger.error(f"Error creating proposal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_proposals(current_user=Depends(require_admin)):
    """Lista todas las cotizaciones guardadas"""
    with Session(engine) as session:
        statement = select(EnterpriseProposal).order_by(EnterpriseProposal.created_at.desc())
        results = session.exec(statement).all()
        return [_proposal_to_payload(result) for result in results]

@router.get("/{proposal_id}")
async def get_proposal_detail(proposal_id: int, current_user = Depends(require_admin)):
    """Obtiene el detalle completo de una cotización incluyendo su historial"""
    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Cotización no encontrada")
        
        # Obtener historial
        history = session.exec(
            select(QuoteHistory)
            .where(QuoteHistory.proposal_id == proposal_id)
            .order_by(QuoteHistory.created_at.desc())
        ).all()
        
        return {
            "proposal": _proposal_to_payload(proposal),
            "history": history,
            "tracking": _build_tracking_payload(proposal, history),
        }

@router.get("/search-leads")
async def search_leads(
    q: str = Query(..., min_length=2),
    current_user=Depends(require_admin),
):
    """Busca contactos en la base de datos de reservas para autocompletar cotizaciones"""
    with Session(engine) as session:
        # Buscar en Booking
        statement = select(AdvisoryBooking).where(
            or_(
                AdvisoryBooking.customer_name.contains(q),
                AdvisoryBooking.customer_email.contains(q),
                AdvisoryBooking.company.contains(q)
            )
        ).limit(10)
        results = session.exec(statement).all()
        
        leads = []
        seen_emails = set()
        for r in results:
            if r.customer_email not in seen_emails:
                leads.append({
                    "name": r.customer_name,
                    "email": r.customer_email,
                    "phone": r.customer_phone,
                    "company": r.company
                })
                seen_emails.add(r.customer_email)
        
        return leads

@router.patch("/{proposal_id}/status")
async def update_status(
    proposal_id: int,
    data: StatusUpdate,
    current_user=Depends(require_admin),
):
    """Actualiza el estado de una cotización (flujo administrativo)"""
    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        if data.status not in ALLOWED_PROPOSAL_STATUSES:
            raise HTTPException(status_code=400, detail="Estado de propuesta no permitido")

        # Aprobación y rechazo solo desde el portal del cliente (token público).
        if data.status in ("Approved", "Rejected"):
            raise HTTPException(
                status_code=400,
                detail="La aprobación y el rechazo solo se registran desde el enlace del cliente (portal público).",
            )

        old_status = proposal.status
        proposal.status = data.status
        proposal.updated_at = datetime.utcnow()
        session.add(proposal)
        
        history = QuoteHistory(proposal_id=proposal.id, action=f"Estado actualizado de {old_status} a {data.status} por Admin")
        session.add(history)
        
        session.commit()
        session.refresh(proposal)
        return _proposal_to_payload(proposal)


@router.post("/{proposal_id}/project-progress")
async def add_project_progress(
    proposal_id: int,
    data: ProjectTrackingUpdate,
    current_user=Depends(require_admin),
):
    """Registra avance de proyecto para seguimiento cliente/admin"""
    stage_labels = {
        "payment_50": "Pago inicial 50% confirmado",
        "kickoff": "Kickoff",
        "system_progress": "Avance de sistema",
        "development": "Desarrollo",
        "qa": "QA",
        "delivery": "Entrega final",
    }
    if data.stage not in stage_labels:
        raise HTTPException(status_code=400, detail="Etapa no permitida")

    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Cotización no encontrada")
        if proposal.status != "Approved":
            raise HTTPException(status_code=400, detail="Solo se puede avanzar proyecto cuando la cotización está aprobada")

        history_rows = session.exec(
            select(QuoteHistory)
            .where(QuoteHistory.proposal_id == proposal_id)
            .order_by(QuoteHistory.created_at.desc())
        ).all()

        ordered_admin_stages = ["payment_50", "kickoff", "development", "qa", "delivery"]
        tracking_before = _build_tracking_payload(proposal, history_rows)
        current_stage_before = str(tracking_before.get("current_stage") or "")
        completed_stage_ids = {
            str(stage.get("id"))
            for stage in (tracking_before.get("stages") or [])
            if isinstance(stage, dict) and stage.get("status") == "completed"
        }

        if data.stage in completed_stage_ids:
            raise HTTPException(status_code=400, detail="Esta etapa ya fue completada previamente")

        if data.stage != current_stage_before:
            raise HTTPException(
                status_code=400,
                detail=f"La etapa activa actual es: {stage_labels.get(current_stage_before, current_stage_before or 'sin etapa activa')}",
            )

        clean_note = (data.note or "").strip()
        clean_report = (data.report or "").strip()
        clean_media = [str(url).strip() for url in (data.media_urls or []) if str(url).strip()]

        if data.stage in {"development", "qa", "delivery"} and not clean_media:
            raise HTTPException(
                status_code=400,
                detail="Debes adjuntar al menos una evidencia en foto o video para registrar esta etapa",
            )

        auto_progress = int(round(((ordered_admin_stages.index(data.stage) + 4) / len(PROJECT_TRACKING_STAGES)) * 100))
        progress_value = data.progress_percent if data.progress_percent is not None else (None if data.complete_stage else max(0, min(99, auto_progress - 5)))
        payload = {
            "stage": data.stage,
            "title": stage_labels[data.stage] if data.complete_stage else f"Actualizacion de {stage_labels[data.stage]}",
            "note": clean_note or None,
            "report": clean_report or None,
            "media_urls": clean_media,
            "progress_percent": max(0, min(100, int(progress_value if progress_value is not None else auto_progress))),
            "client_visible": bool(data.client_visible),
            "completed": bool(data.complete_stage),
            "created_by": "admin",
        }
        action = _build_tracking_action(payload)

        history = QuoteHistory(proposal_id=proposal.id, action=action)
        session.add(history)
        proposal.updated_at = datetime.utcnow()
        session.add(proposal)
        session.commit()

        refreshed_history = session.exec(
            select(QuoteHistory)
            .where(QuoteHistory.proposal_id == proposal_id)
            .order_by(QuoteHistory.created_at.desc())
        ).all()
        tracking_payload = _build_tracking_payload(proposal, refreshed_history)

        if data.client_visible and proposal.client_email and proposal.public_token:
            frontend_url = (os.getenv("FRONTEND_URL") or "http://localhost:3000").rstrip("/")
            try:
                await send_email(
                    to_email=proposal.client_email,
                    subject=f"Actualizacion de proyecto {proposal.quote_number} - {proposal.client_company or proposal.client_name}",
                    body=_build_tracking_update_email_html(proposal, tracking_payload, frontend_url),
                )
            except Exception as notify_exc:
                logger.error(f"Error sending tracking update email: {str(notify_exc)}")

        return {
            "status": "success",
            "tracking": tracking_payload,
        }

@router.put("/{proposal_id}")
async def update_proposal(
    proposal_id: int,
    data: ProposalCreate,
    current_user=Depends(require_admin),
):
    """Edita una cotización existente"""
    try:
        disc_amt = data.subtotal * (data.discount_percent / 100)
        taxable_amt = data.subtotal - disc_amt
        tax_amt = taxable_amt * (data.tax_percent / 100)
        final_total = taxable_amt + tax_amt

        with Session(engine) as session:
            proposal = session.get(EnterpriseProposal, proposal_id)
            if not proposal:
                raise HTTPException(status_code=404, detail="Proposal not found")
            
            proposal.client_name = data.client_name
            proposal.client_company = data.client_company
            proposal.client_email = data.client_email
            proposal.client_phone = data.client_phone
            proposal.client_rfc = data.client_rfc
            proposal.client_address = data.client_address
            proposal.currency = data.currency
            proposal.urgency_level = data.urgency_level
            proposal.valid_days = data.valid_days
            proposal.lead_time = data.lead_time
            proposal.items = json.dumps([item.dict() for item in data.items])
            proposal.subtotal = data.subtotal
            proposal.discount_percent = data.discount_percent
            proposal.discount_amount = disc_amt
            proposal.tax_percent = data.tax_percent
            proposal.tax_amount = tax_amt
            proposal.final_total = final_total
            proposal.bank_name = data.bank_name
            proposal.bank_account = data.bank_account
            proposal.bank_clabe = data.bank_clabe
            proposal.payment_terms = data.payment_terms
            proposal.project_objective = data.project_objective
            proposal.payment_schedule = data.payment_schedule
            proposal.legal_terms = data.legal_terms
            proposal.notes = data.notes
            proposal.updated_at = datetime.utcnow()
            
            session.add(proposal)
            
            history = QuoteHistory(proposal_id=proposal.id, action="Cotización editada y recalculada")
            session.add(history)
            
            session.commit()
            session.refresh(proposal)
            return _proposal_to_payload(proposal)
    except Exception as e:
        logger.error(f"Error editing proposal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{proposal_id}/clone")
async def clone_proposal(proposal_id: int, current_user=Depends(require_admin)):
    """Duplica una cotización existente y devuelve la nueva en estado Pendiente"""
    with Session(engine) as session:
        original = session.get(EnterpriseProposal, proposal_id)
        if not original:
            raise HTTPException(status_code=404, detail="Proposal not found")
            
        quote_number = _generate_unique_quote_number(session, suffix="-COPY")
        
        public_token = secrets.token_urlsafe(16)
        
        cloned = EnterpriseProposal(
            public_token=public_token,
            quote_number=quote_number,
            client_name=original.client_name,
            client_company=original.client_company,
            client_email=original.client_email,
            client_phone=original.client_phone,
            client_rfc=original.client_rfc,
            client_address=original.client_address,
            currency=original.currency,
            urgency_level=original.urgency_level,
            valid_days=original.valid_days,
            lead_time=original.lead_time,
            items=original.items,
            subtotal=original.subtotal,
            discount_percent=original.discount_percent,
            discount_amount=original.discount_amount,
            tax_percent=original.tax_percent,
            tax_amount=original.tax_amount,
            final_total=original.final_total,
            bank_name=original.bank_name,
            bank_account=original.bank_account,
            bank_clabe=original.bank_clabe,
            payment_terms=original.payment_terms,
            project_objective=original.project_objective,
            payment_schedule=original.payment_schedule,
            legal_terms=original.legal_terms,
            notes=original.notes,
            payment_method=original.payment_method,
            payment_receipt_url=original.payment_receipt_url,
            payment_status=original.payment_status,
            status="Pending",
            created_at=datetime.utcnow()
        )
        session.add(cloned)
        session.flush()
        history = QuoteHistory(proposal_id=cloned.id, action=f"Clonada a partir de QT {original.quote_number}")
        session.add(history)
        session.commit()
        session.refresh(cloned)
        return _proposal_to_payload(cloned)

@router.delete("/{proposal_id}")
async def delete_proposal(proposal_id: int, current_user=Depends(require_admin)):
    """Elimina una cotización"""
    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        session.delete(proposal)
        session.commit()
        return {"status": "success"}

@router.post("/{public_token}/payment-receipt-upload")
async def upload_payment_receipt_file(
    public_token: str,
    file: UploadFile = File(...),
):
    """
    Endpoint público para que el cliente suba su comprobante de pago (Imagen/PDF).
    Se valida el token público antes de permitir la subida a Cloudinary.
    """
    with Session(engine) as session:
        proposal = session.exec(select(EnterpriseProposal).where(EnterpriseProposal.public_token == public_token)).first()
        if not proposal:
            raise HTTPException(status_code=404, detail="Propuesta no encontrada")
        
        try:
            # Asegurar configuración completa de Cloudinary
            cloudinary.config(
                cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
                api_key=os.getenv("CLOUDINARY_API_KEY"),
                api_secret=os.getenv("CLOUDINARY_API_SECRET"),
                secure=True
            )

            # Detectar si es PDF para forzar resource_type="raw"
            is_pdf = file.filename.lower().endswith(".pdf")
            res_type = "raw" if is_pdf else "auto"

            # Subir a Cloudinary (específico para comprobantes)
            file_content = await file.read()
            upload_result = cloudinary.uploader.upload(
                file_content,
                public_id=f"receipts/{proposal.quote_number}_{uuid.uuid4()}",
                resource_type=res_type,
                access_mode="public",
                overwrite=False,
            )
            receipt_url = upload_result.get("secure_url")
            logger.info(f"Comprobante subido ({res_type}): {receipt_url}")
            
            # Actualizar la propuesta
            proposal.payment_method = "transfer"
            proposal.payment_receipt_url = receipt_url
            proposal.payment_status = "verifying"
            proposal.updated_at = datetime.utcnow()
            session.add(proposal)
            
            # Historial
            history = QuoteHistory(
                proposal_id=proposal.id, 
                action=f"PAGO::Comprobante de transferencia subido por el cliente. Esperando validación."
            )
            session.add(history)
            
            # Notificación al Admin (La Campana)
            notif = SystemNotification(
                title="Comprobante de Pago Recibido",
                message=f"El cliente {proposal.client_name} ({proposal.quote_number}) ha subido su comprobante de pago. Pendiente validación.",
                type="warning",
                link=f"/admin/quotes/{proposal.id}"
            )
            session.add(notif)
            
            # Enviar Correo al Admin
            admin_email = os.getenv("EMAIL_RECEIVER", "ing@nextlevelsoftwarepro.com")
            email_body = f"""
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #849a3f;">Nuevo Comprobante de Pago Recibido</h2>
                <p>El cliente de la cotización <strong>{proposal.quote_number}</strong> ({proposal.client_name}) ha subido un comprobante de transferencia.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Detalles:</strong></p>
                <ul>
                    <li><strong>Monto Total:</strong> {proposal.final_total} {proposal.currency}</li>
                    <li><strong>Link al Comprobante:</strong> <a href="{receipt_url}">Ver Archivo</a></li>
                </ul>
                <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/admin/quotes/{proposal.id}" 
                   style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Validar en el Panel Admin
                </a>
            </div>
            """
            await send_email(
                to_email=admin_email,
                subject=f"NUEVO PAGO: {proposal.quote_number} - {proposal.client_name}",
                body=email_body
            )
            
            session.commit()
            return {"status": "success", "url": receipt_url}
            
        except Exception as e:
            logger.error(f"Error subiendo comprobante: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/{public_token}/payment-receipt")
async def update_payment_receipt_url(
    public_token: str,
    receipt_url: str,
    method: str = "transfer",
):
    """El cliente sube un comprobante de transferencia desde el portal de seguimiento"""
    with Session(engine) as session:
        proposal = session.exec(select(EnterpriseProposal).where(EnterpriseProposal.public_token == public_token)).first()
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        proposal.payment_method = method
        proposal.payment_receipt_url = receipt_url
        proposal.payment_status = "verifying"
        proposal.updated_at = datetime.utcnow()
        session.add(proposal)
        
        # Historial
        history = QuoteHistory(
            proposal_id=proposal.id, 
            action=f"PAGO::Comprobante de {method} subido por el cliente. Esperando validación."
        )
        session.add(history)
        
        # Notificación al Admin (La Campana)
        notif = SystemNotification(
            title="Comprobante de Pago Recibido",
            message=f"El cliente de la cotización {proposal.quote_number} ha subido un comprobante de {method}. Pendiente validación.",
            type="warning",
            link=f"/admin/quotes/{proposal.id}"
        )
        session.add(notif)
        
        session.commit()
        return {"status": "success", "message": "Comprobante recibido"}

@router.post("/{proposal_id}/approve-payment")
async def approve_proposal_payment(
    proposal_id: int,
    current_user=Depends(require_admin)
):
    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Propuesta no encontrada")
        
        proposal.payment_status = "paid"
        proposal.updated_at = datetime.utcnow()
        session.add(proposal)
        
        # 1. Historial de Pago (Registro simple)
        history = QuoteHistory(
            proposal_id=proposal.id, 
            action=f"PAGO::Pago inicial validado por {current_user.full_name}. Proyecto activado."
        )
        session.add(history)
        
        # 2. Completar etapa payment_50 en el ROADMAP (Usando el prefijo del sistema)
        # Esto hace que el roadmap avance visualmente
        finish_payment_action = f"{TRACKING_ACTION_PREFIX}CONSOLIDADO::Hito: payment_50 | Estado: Completada | Nota: Pago validado por administración."
        session.add(QuoteHistory(proposal_id=proposal.id, action=finish_payment_action))

        # 3. Activar hito de Kickoff inmediatamente
        kickoff_action = f"{TRACKING_ACTION_PREFIX}CONSOLIDADO::Hito: kickoff | Estado: Activa | Nota: Proyecto iniciado tras confirmación de pago."
        session.add(QuoteHistory(proposal_id=proposal.id, action=kickoff_action))
        
        session.commit()
        return {"status": "success", "message": "Pago aprobado y roadmap avanzado a Kickoff"}

@router.post("/{proposal_id}/reject-payment")
async def reject_proposal_payment(
    proposal_id: int,
    current_user=Depends(require_admin)
):
    """
    Rechaza el comprobante actual para permitir que el cliente envíe uno nuevo.
    """
    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Propuesta no encontrada")
        
        proposal.payment_receipt_url = None
        proposal.payment_status = "pending"
        proposal.updated_at = datetime.utcnow()
        session.add(proposal)
        
        # Historial
        history = QuoteHistory(
            proposal_id=proposal.id, 
            action=f"PAGO::Comprobante rechazado por administración ({current_user.full_name}). Se requiere re-envío."
        )
        session.add(history)
        
        session.commit()
        return {"status": "success", "message": "Comprobante rechazado"}

@router.post("/{proposal_id}/send-email")
async def send_proposal_email(proposal_id: int, current_user=Depends(require_admin)):
    """Envía la propuesta por correo electrónico al cliente"""
    with Session(engine) as session:
        proposal = session.get(EnterpriseProposal, proposal_id)
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        # Generar cuerpo HTML profesional de ALTA GAMA
        try:
            items = json.loads(proposal.items)
        except Exception:
            items = []

        frontend_url = (os.getenv("FRONTEND_URL") or "http://localhost:3000").rstrip("/")
        brand_name = "Digital Engineering FJ"
        brand_tagline = "Desarrollo web, automatizacion y soluciones comerciales"
        brand_mark = "DFJ"

        def make_slug(text: str) -> str:
            base = _normalize_match_text(text)
            return base.replace(" ", "-") or "servicio"

        def build_related_url(source_type: str, title: str) -> str:
            slug = make_slug(title)
            # Planes y servicios viven en /servicios
            if source_type == "plan":
                return f"{frontend_url}/servicios#plan-{slug}"
            if source_type == "combo":
                return f"{frontend_url}/servicios#combo-{slug}"
            if source_type == "additional":
                return f"{frontend_url}/servicios#extra-{slug}"
            if source_type == "advisory":
                return f"{frontend_url}/asesoria#{slug}"
            return f"{frontend_url}/servicios#servicio-{slug}"

        def build_industry_url(name: str) -> str:
            slug = make_slug(name)
            # Tipos de proyecto / industrias viven en /proyectos
            return f"{frontend_url}/proyectos#industria-{slug}"

        def clean_inline_text(value: Optional[Union[str, int, float]], fallback: str = "") -> str:
            if value is None:
                return fallback
            text = str(value)
            text = (
                text.replace("\r\n", "\n")
                .replace("\\r\\n", "\n")
                .replace("\\n", "\n")
                .replace("`r`n", "\n")
                .replace("`n", "\n")
                .replace("\u00a0", " ")
            )
            text = re.sub(r"\s+", " ", text).strip()
            return text or fallback

        proposal_keywords = _collect_match_keywords(proposal, items)
        quoted_service_names = {
            _normalize_match_text(item.get("name"))
            for item in items
            if _normalize_match_text(item.get("name"))
        }

        related_candidates: List[dict] = []

        def push_related_candidate(
            *,
            source_type: str,
            title: str,
            description: str,
            price: Optional[Union[str, int, float]],
            badge: str,
            bullets: List[str],
            score_texts: List[Optional[Union[str, List[str]]]],
            order_hint: int,
        ) -> None:
            normalized_title = _normalize_match_text(title)
            if not normalized_title or normalized_title in quoted_service_names:
                return

            cleaned_bullets = [clean_inline_text(bullet) for bullet in bullets if clean_inline_text(bullet)]
            score = _score_candidate_match(proposal_keywords, title, description, badge, cleaned_bullets, score_texts)
            related_candidates.append(
                {
                    "source_type": source_type,
                    "title": clean_inline_text(title),
                    "description": clean_inline_text(description),
                    "price": _format_money(price, proposal.currency),
                    "badge": clean_inline_text(badge, "Relacionado"),
                    "bullets": cleaned_bullets[:3],
                    "score": score,
                    "order_hint": order_hint,
                    "url": build_related_url(source_type, clean_inline_text(title)),
                }
            )

        plans = session.exec(select(ProfessionalPlan).order_by(ProfessionalPlan.order_index, ProfessionalPlan.id)).all()
        for idx, plan in enumerate(plans):
            push_related_candidate(
                source_type="plan",
                title=plan.name,
                description=plan.description,
                price=plan.price,
                badge=plan.category or "Plan profesional",
                bullets=_parse_text_list(plan.includes) or _parse_text_list(plan.delivery) or _parse_text_list(plan.ideal_for),
                score_texts=[plan.category, plan.includes, plan.delivery, plan.ideal_for, plan.modules],
                order_hint=idx,
            )

        combos = session.exec(
            select(ServiceCombo)
            .where(ServiceCombo.active == True)
            .order_by(ServiceCombo.order_index, ServiceCombo.id)
        ).all()
        for idx, combo in enumerate(combos):
            push_related_candidate(
                source_type="combo",
                title=combo.title,
                description=combo.note or combo.ideal,
                price=combo.combo_price,
                badge=f"Combo {clean_inline_text(combo.segment, 'estrategico')}",
                bullets=_parse_text_list(combo.includes) or _parse_text_list(combo.deliverables),
                score_texts=[combo.segment, combo.ideal, combo.includes, combo.deliverables, combo.timeline, combo.market_note],
                order_hint=100 + idx,
            )

        additional_services = session.exec(select(AdditionalService).order_by(AdditionalService.id)).all()
        for idx, service in enumerate(additional_services):
            push_related_candidate(
                source_type="additional",
                title=service.name,
                description=service.description,
                price=service.price,
                badge="Servicio adicional",
                bullets=_parse_text_list(service.includes),
                score_texts=[service.includes, service.payment_type, service.color],
                order_hint=200 + idx,
            )

        advisories = session.exec(
            select(ServiceAdvisoryCard)
            .where(ServiceAdvisoryCard.active == True)
            .order_by(ServiceAdvisoryCard.order_index, ServiceAdvisoryCard.id)
        ).all()
        for idx, advisory in enumerate(advisories):
            push_related_candidate(
                source_type="advisory",
                title=advisory.title,
                description=advisory.result,
                price=advisory.price,
                badge="Asesoria",
                bullets=_parse_text_list(advisory.includes) or _parse_text_list(advisory.audience),
                score_texts=[advisory.includes, advisory.audience, advisory.market_note, advisory.duration],
                order_hint=300 + idx,
            )

        related_candidates.sort(key=lambda item: (-item["score"], item["order_hint"], item["title"]))
        selected_related: List[dict] = []
        seen_related_titles = set()
        for candidate in related_candidates:
            if candidate["title"] in seen_related_titles:
                continue
            selected_related.append(candidate)
            seen_related_titles.add(candidate["title"])
            if len(selected_related) == 3:
                break

        related_services_html = ""
        for related in selected_related:
            bullets_html = ""
            if related["bullets"]:
                bullets_html = (
                    '<ul style="margin: 14px 0 0 18px; padding: 0; color: #dbe7f8; font-size: 12px; line-height: 1.7;">'
                    + "".join(f"<li style=\"margin-bottom: 4px;\">{escape(bullet)}</li>" for bullet in related["bullets"])
                    + "</ul>"
                )
            related_services_html += f"""
            <table role="presentation" width="100%" style="width:100%; border-collapse:separate; border-spacing:0; margin-bottom:16px; background:#101827; border:1px solid #223049; border-radius:18px;">
                <tr>
                    <td style="padding:0;">
                        <div style="height:6px; line-height:6px; font-size:6px; background:#6d8b35; border-radius:18px 18px 0 0;">&nbsp;</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 20px 18px;">
                        <table role="presentation" width="100%" style="width:100%; border-collapse:collapse;">
                            <tr>
                                <td style="padding:0 0 12px; vertical-align:top;">
                                    <span style="display:inline-block; background:#1f334e; color:#9fe870; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.10em; padding:7px 11px; border-radius:999px;">
                                        {escape(related["badge"])}
                                    </span>
                                </td>
                                <td style="padding:0 0 12px; vertical-align:top; text-align:right;">
                                    <div style="display:inline-block; background:#0b1220; border:1px solid #2c4d78; padding:10px 14px; border-radius:14px; text-align:left;">
                                        <div style="font-size:10px; color:#93a8c6; text-transform:uppercase; letter-spacing:0.10em;">Valor referencial</div>
                                        <div style="font-size:20px; font-weight:900; color:#ffffff; margin-top:3px;">Desde {escape(related["price"])}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding:0;">
                                    <div style="font-size:23px; line-height:1.2; font-weight:900; color:#ffffff;">{escape(related["title"])}</div>
                                    <div style="font-size:13px; line-height:1.75; color:#bfd0e5; margin-top:9px;">{escape(related["description"])}</div>
                                    {bullets_html}
                                    <div style="margin-top:16px;">
                                        <a href="{escape(related["url"])}" style="display:inline-block; padding:10px 18px; background:#6d8b35; color:#ffffff !important; text-decoration:none; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.10em; border-radius:999px;">
                                            Ver en la web
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding-top:16px; border-top:1px solid #223049;">
                                    <div style="font-size:11px; color:#8ca3c2; text-transform:uppercase; letter-spacing:0.10em;">Servicio complementario recomendado</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            """

        industries = session.exec(
            select(ServiceIndustry)
            .where(ServiceIndustry.active == True)
            .order_by(ServiceIndustry.order_index, ServiceIndustry.id)
        ).all()
        industry_candidates: List[dict] = []
        for idx, industry in enumerate(industries):
            industry_candidates.append(
                {
                    "name": clean_inline_text(industry.name),
                    "description": clean_inline_text(industry.description),
                    "examples": _parse_text_list(industry.examples),
                    "score": _score_candidate_match(proposal_keywords, industry.name, industry.description, industry.examples),
                    "order_hint": idx,
                    "url": build_industry_url(clean_inline_text(industry.name)),
                }
            )

        industry_candidates.sort(key=lambda item: (-item["score"], item["order_hint"], item["name"]))
        selected_industries = industry_candidates[:3]

        project_types_html = ""
        for industry in selected_industries:
            examples_text = ", ".join(industry["examples"][:3])
            project_types_html += f"""
            <table role="presentation" width="100%" style="width:100%; border-collapse:separate; border-spacing:0; margin-bottom:14px; background:#f8fbf2; border:1px solid #d9dfd2; border-radius:16px;">
                <tr>
                    <td style="padding:18px 18px 16px; border-left:4px solid #6d8b35;">
                        <div style="display:inline-block; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.10em; color:#6d8b35; margin-bottom:10px; background:#e7f0d2; padding:6px 10px; border-radius:999px;">Tipo de proyecto</div>
                        <div style="font-size:19px; font-weight:900; color:#0f172a; line-height:1.25;">{escape(industry["name"])}</div>
                        <div style="font-size:13px; line-height:1.75; color:#475569; margin-top:8px;">{escape(industry["description"])}</div>
                        {f'<div style="font-size: 12px; color: #64748b; margin-top: 12px; line-height:1.6;"><strong>Ejemplos:</strong> {escape(examples_text)}</div>' if examples_text else ''}
                        <div style="margin-top:14px;">
                            <a href="{escape(industry["url"])}" style="display:inline-block; padding:9px 16px; background:#6d8b35; color:#ffffff !important; text-decoration:none; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.10em; border-radius:999px;">
                                Ver proyectos similares
                            </a>
                        </div>
                    </td>
                </tr>
            </table>
            """

        complementary_block_html = ""
        if related_services_html or project_types_html:
            complementary_block_html = f"""
            <div class="secondary-container" style="max-width:760px; margin:18px auto 0; background:#ffffff; border:1px solid #cfd7c5; box-shadow:0 14px 36px rgba(15,23,42,0.07);">
                <div style="padding:28px 34px 34px;">
                    <div class="section-title" style="margin-top:0;">Portafolio complementario sugerido</div>
                    <p style="margin: 0 0 18px; font-size: 13px; color: #334155; line-height: 1.75;">
                        A continuacion compartimos soluciones relacionadas que suelen potenciar esta implementacion.
                        Este bloque es complementario y no modifica la cotizacion formal presentada arriba.
                    </p>
                    {f'<div style="font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; color:#6d8b35; margin:0 0 12px;">Servicios relacionados</div>{related_services_html}' if related_services_html else ''}
                    {f'<div style="font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; color:#6d8b35; margin:22px 0 12px;">Tipos de proyecto donde este enfoque genera valor</div>{project_types_html}' if project_types_html else ''}
                    <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: #64748b;">
                        Si alguna alternativa le interesa, puede responder este mismo correo y preparamos una ampliacion formal de alcance.
                    </p>
                </div>
            </div>
            """

        items_html = ""
        for item in items:
            includes = _parse_text_list(item.get("includes"))
            deliverables = _parse_text_list(item.get("deliverables"))
            audience = _parse_text_list(item.get("audience"))
            delivery_list = _parse_text_list(item.get("delivery"))
            ideal_for_list = _parse_text_list(item.get("ideal_for"))
            item_name = clean_inline_text(item.get("name"), "Servicio profesional")
            item_description = clean_inline_text(item.get("description"), "")
            service_type = clean_inline_text(item.get("service_type"))
            category = clean_inline_text(item.get("category"))
            timeline = clean_inline_text(item.get("timeline"))
            result = clean_inline_text(item.get("result"))

            detail_lines: List[str] = []
            if service_type:
                detail_lines.append(f"Tipo: {service_type}")
            if category:
                detail_lines.append(f"Categoria: {category}")
            if includes:
                detail_lines.append(f"Incluye: {', '.join(includes[:4])}")
            if deliverables:
                detail_lines.append(f"Entregables: {', '.join(deliverables[:4])}")
            if timeline:
                detail_lines.append(f"Timeline: {timeline}")
            if delivery_list:
                detail_lines.append(f"Entrega: {', '.join(delivery_list[:4])}")
            if ideal_for_list:
                detail_lines.append(f"Ideal para: {', '.join(ideal_for_list[:4])}")
            if result:
                detail_lines.append(f"Resultado esperado: {result}")
            if audience:
                detail_lines.append(f"Audiencia: {', '.join(audience[:4])}")

            details_html = ""
            if detail_lines:
                details_html = (
                    '<ul style="margin: 10px 0 0 18px; padding: 0; color: #334155; font-size: 11px; line-height: 1.55;">'
                    + "".join(f"<li style=\"margin-bottom: 5px;\">{escape(line)}</li>" for line in detail_lines)
                    + "</ul>"
                )
            quantity = max(1, int(_to_number(item.get("quantity"), 1)))
            unit_price = _to_number(item.get("price"), 0.0)
            line_total = unit_price * quantity

            items_html += f"""
            <tr style="border-bottom: 1px solid #d9dfd2;">
                <td style="padding: 16px 14px; font-size: 14px; color: #1a202c; vertical-align: top;">
                    <strong style="font-size: 16px; color: #0f172a;">{escape(item_name)}</strong><br>
                    <span style="font-size: 12px; color: #64748b; line-height: 1.55; display: inline-block; margin-top: 5px;">{escape(item_description)}</span>
                    {details_html}
                </td>
                <td style="padding: 16px 14px; font-size: 14px; text-align: center; color: #334155; font-weight: 700; vertical-align: top;">{quantity}</td>
                <td style="padding: 16px 14px; font-size: 13px; text-align: right; color: #0f172a; vertical-align: top;">
                    <div style="font-weight: 700;">Unitario: {_format_money(unit_price, proposal.currency)}</div>
                    <div style="font-weight: 900; margin-top: 5px; font-size: 18px;">{_format_money(line_total, proposal.currency)}</div>
                </td>
            </tr>
            """

        if not items_html:
            items_html = """
            <tr style="border-bottom: 1px solid #edf2f7;">
                <td colspan="3" style="padding: 16px 10px; font-size: 13px; color: #64748b; text-align: center;">
                    No hay servicios cargados en esta propuesta.
                </td>
            </tr>
            """

        project_objective_text = clean_inline_text(proposal.project_objective)
        payment_terms_text = clean_inline_text(proposal.payment_terms, "50% anticipo, 50% contra entrega final.")
        legal_terms_text = clean_inline_text(proposal.legal_terms, "La propiedad intelectual se transfiere tras el pago total.")

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body {{ font-family: 'Inter', Arial, sans-serif; background-color: #eef1ea; color: #1e293b; margin: 0; padding: 24px 0; }}
                .container {{ max-width: 760px; margin: 0 auto; background: #ffffff; overflow: hidden; box-shadow: 0 14px 36px rgba(15,23,42,0.10); border: 1px solid #cfd7c5; }}
                .header {{ padding: 28px 34px 20px; color: #0f172a; border-bottom: 1px solid #d9dfd2; }}
                .content {{ padding: 28px 34px 34px; }}
                .footer {{ background-color: #f8fafc; padding: 22px 34px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #d9dfd2; line-height: 1.6; }}
                .btn {{ display: inline-block; padding: 14px 28px; background-color: #6d8b35; color: #ffffff !important; text-decoration: none; font-weight: 900; font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 20px; }}
                .section-title {{ background: #6d8b35; color: #ffffff; padding: 9px 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; margin: 28px 0 14px; }}
                .meta-table td {{ padding: 5px 0; font-size: 13px; color: #334155; vertical-align: top; }}
                .meta-label {{ font-weight: 800; color: #0f172a; padding-right: 12px; white-space: nowrap; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <div style="width:56px; height:56px; background:#6d8b35; color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; letter-spacing:1px;">{brand_mark}</div>
                            <div>
                                <p style="margin:0; font-size:20px; color:#1f2937; font-weight:900; letter-spacing:-0.03em;">{brand_name}</p>
                                <p style="margin:4px 0 0; font-size:11px; color:#64748b; font-weight:600;">{brand_tagline}</p>
                            </div>
                        </div>
                        <div>
                            <p style="margin:0; font-size:10px; text-transform:uppercase; color:#64748b; font-weight:800; letter-spacing:0.12em; text-align:right;">Folio</p>
                            <p style="margin:6px 0 0; font-size:32px; color:#0f172a; font-weight:900; letter-spacing:-0.05em; text-align:right;">{escape(proposal.quote_number)}</p>
                        </div>
                    </div>
                    <div style="margin-top: 18px; background:#6d8b35; color:#ffffff; padding:9px 12px; font-size:13px; font-weight:900; text-transform:uppercase; letter-spacing:0.06em;">
                        Propuesta comercial / {escape(proposal.client_company or proposal.client_name or 'Proyecto')}
                    </div>
                </div>
                <div class="content">
                    <table class="meta-table" style="width:100%; border-collapse:collapse; margin-bottom: 18px;">
                        <tr>
                            <td class="meta-label">Senor:</td>
                            <td>{escape(proposal.client_name or 'Cliente')}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Empresa:</td>
                            <td>{escape(proposal.client_company or 'No registrada')}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Correo:</td>
                            <td>{escape(proposal.client_email or 'Sin correo')}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Emision:</td>
                            <td>{(proposal.created_at or datetime.utcnow()).strftime("%d/%m/%Y")} | Vigencia: {((proposal.created_at or datetime.utcnow()) + timedelta(days=int(_to_number(proposal.valid_days, 30)))).strftime("%d/%m/%Y")}</td>
                        </tr>
                    </table>

                    {f'<div class="section-title">Referencia del proyecto</div><div style="border:1px solid #d9dfd2; padding: 14px 16px; font-size: 13px; line-height: 1.7; color:#334155;">{escape(project_objective_text)}</div>' if project_objective_text else ''}

                    <div class="section-title">Detalle del servicio</div>
                    <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
                        <thead>
                            <tr style="background-color: #f5f7f1; border-top: 1px solid #d9dfd2; border-bottom: 2px solid #d9dfd2;">
                                <th style="padding: 12px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Descripcion del servicio</th>
                                <th style="padding: 12px 14px; text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Cant.</th>
                                <th style="padding: 12px 14px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                    </table>

                    <div class="section-title">Valores y forma de pago</div>
                    <div style="border:1px solid #d9dfd2; padding: 16px 18px;">
                        <p style="margin: 0 0 12px; font-size: 13px; color: #334155; line-height: 1.7;">La inversion para el desarrollo, implementacion y configuracion de los servicios considerados es la siguiente:</p>
                        <p style="margin: 6px 0; font-size: 13px; color: #475569;">Subtotal: <strong>{_format_money(proposal.subtotal, proposal.currency)}</strong></p>
                        {f'<p style="margin: 6px 0; font-size: 13px; color: #16a34a;">Descuento ({_to_number(proposal.discount_percent, 0):.0f}%): <strong>- {_format_money(proposal.discount_amount, proposal.currency)}</strong></p>' if _to_number(proposal.discount_amount, 0) > 0 else ''}
                        <p style="margin: 6px 0; font-size: 13px; color: #334155;">Impuestos ({_to_number(proposal.tax_percent, 0):.0f}%): <strong>+ {_format_money(proposal.tax_amount, proposal.currency)}</strong></p>
                        <p style="margin: 14px 0 0; font-size: 28px; color: #6d8b35; font-weight: 900; letter-spacing: -0.04em;">Total: {_format_money(proposal.final_total, proposal.currency)}</p>
                        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #d9dfd2;">
                            <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.7;"><strong>Condiciones comerciales:</strong> {escape(payment_terms_text)}</p>
                            <p style="margin: 10px 0 0; color: #334155; font-size: 13px; line-height: 1.7;"><strong>Condiciones legales:</strong> {escape(legal_terms_text)}</p>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 34px;">
                        <p style="font-size: 12px; color: #475569;">Puede revisar, descargar y aprobar esta propuesta desde el portal seguro de clientes.</p>
                        <a href="{frontend_url}/cotizacion/{proposal.public_token}" class="btn">Abrir Propuesta Comercial</a>
                    </div>
                </div>
                <div class="footer">
                    <p style="font-weight: 900; letter-spacing: 1px; margin-bottom: 10px; color:#0f172a;">{brand_name.upper()}</p>
                    <p style="margin-top: 0;">Documento confidencial. Esta propuesta es valida por {int(_to_number(proposal.valid_days, 30))} dias naturales desde su emision.</p>
                </div>
            </div>
            {complementary_block_html}
        </body>
        </html>
        """
        
        try:
            success = await send_email(
                to_email=proposal.client_email,
                subject=f"Propuesta Comercial Formal {proposal.quote_number} - {proposal.client_company or proposal.client_name}",
                body=html_body
            )
            
            if success:
                proposal.sent_at = datetime.utcnow()
                proposal.status = "Sent"  # Automatically set to Sent
                session.add(proposal)
                
                history = QuoteHistory(proposal_id=proposal.id, action="Enviada por email al cliente")
                session.add(history)
                
                session.commit()
                return {"status": "success", "message": "Email enviado correctamente"}
            else:
                raise HTTPException(status_code=500, detail="Error enviando email")
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# --- Public Endpoints ---
@router.get("/public/{token}")
async def get_public_proposal(token: str):
    """Devuelve la propuesta para el cliente público usando su token"""
    with Session(engine) as session:
        statement = select(EnterpriseProposal).where(EnterpriseProposal.public_token == token)
        proposal = session.exec(statement).first()
        if not proposal:
            raise HTTPException(status_code=404, detail="Cotización no encontrada o enlace inválido")
        
        payload = _proposal_to_payload(proposal)

        # Registrar vista en historial
        history = QuoteHistory(proposal_id=proposal.id, action="Cliente abrió el enlace online")
        session.add(history)
        session.commit()
        
        return payload


@router.get("/public/{token}/history")
async def get_public_proposal_history(token: str):
    """Devuelve trazabilidad publica de la propuesta por token"""
    with Session(engine) as session:
        statement = select(EnterpriseProposal).where(EnterpriseProposal.public_token == token)
        proposal = session.exec(statement).first()
        if not proposal:
            raise HTTPException(status_code=404, detail="Cotización no encontrada o enlace inválido")

        history = session.exec(
            select(QuoteHistory)
            .where(QuoteHistory.proposal_id == proposal.id)
            .order_by(QuoteHistory.created_at.desc())
        ).all()

        return {
            "proposal": _proposal_to_payload(proposal),
            "history": history,
            "tracking": _build_tracking_payload(proposal, history),
        }

@router.post("/public/{token}/action")
async def action_public_proposal(token: str, action: StatusUpdate):
    """Cliente firma/acepta o rechaza la propuesta desde internet"""
    with Session(engine) as session:
        statement = select(EnterpriseProposal).where(EnterpriseProposal.public_token == token)
        proposal = session.exec(statement).first()
        if not proposal:
            raise HTTPException(status_code=404, detail="Not found")
        
        if proposal.status in ["Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="La cotización ya fue gestionada.")
            
        allowed = {"Approved": "Aceptada", "Rejected": "Rechazada"}
        new_status = action.status
        
        if new_status not in allowed:
            raise HTTPException(status_code=400, detail="Invalid action")
            
        proposal.status = new_status
        proposal.updated_at = datetime.utcnow()
        if new_status == "Approved":
            proposal.accepted_at = datetime.utcnow()
        else:
            proposal.rejected_at = datetime.utcnow()
            
        session.add(proposal)
        
        history = QuoteHistory(proposal_id=proposal.id, action=f"El cliente ha {allowed[new_status]} la cotización online")
        session.add(history)
        
        # Create notification for the Admin
        notif_type = "success" if new_status == "Approved" else "error"
        notif_title = f"Cotización {allowed[new_status]}"
        notif_msg = f"El cliente {proposal.client_name} ha {allowed[new_status].lower()} la propuesta {proposal.quote_number}."
        new_notif = SystemNotification(
            title=notif_title,
            message=notif_msg,
            type=notif_type,
            link=f"/admin/quotes/{proposal.id}"
        )
        session.add(new_notif)
        
        session.commit()
        session.refresh(proposal)
        return {"status": "success", "new_status": new_status}
 
