import html
import os
import re
import time
from datetime import datetime
from threading import Lock
from typing import Any, Dict, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pydantic import BaseModel
from sqlalchemy import func
from sqlmodel import Session, select

from app.db import get_session
from app.models import Review, User

router = APIRouter()

# Simple in-memory rate limit (per process)
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 8
_rate_limit_store: Dict[str, list[float]] = {}
_rate_limit_lock = Lock()
_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class ReviewUserPublic(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ReviewPublic(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: Optional[str] = None
    is_verified: bool = False
    status: str
    author_role: Optional[str] = None
    author_company: Optional[str] = None
    page_context: Optional[str] = None
    user: Optional[ReviewUserPublic] = None
    display_name: Optional[str] = None
    avatar_fallback: Optional[str] = None


class ReviewListResponse(BaseModel):
    items: list[ReviewPublic]
    page: int
    page_size: int
    total: int
    total_pages: int


class ReviewCreatePayload(BaseModel):
    rating: int
    comment: str
    authMode: Literal["google", "guest"]
    googleIdToken: Optional[str] = None
    display_name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    page_context: Optional[str] = "clientes"


class ReviewApprovePayload(BaseModel):
    review_id: int
    status: Literal["approved", "pending", "rejected"] = "approved"


def _is_moderation_enabled() -> bool:
    return os.getenv("REVIEW_MODERATION_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def _sanitize_text(value: str) -> str:
    return html.escape(value.strip(), quote=True)


def _normalize_email(value: Optional[str], required: bool = False) -> Optional[str]:
    normalized = (value or "").strip().lower()
    if not normalized:
        if required:
            raise HTTPException(status_code=400, detail="El correo es requerido.")
        return None
    if not _EMAIL_RE.match(normalized):
        raise HTTPException(status_code=400, detail="El correo no tiene formato valido.")
    return normalized


def _extract_initials(name: str) -> str:
    raw = (name or "").strip()
    if not raw:
        return "U"
    parts = [chunk for chunk in raw.split(" ") if chunk]
    if len(parts) == 1:
        return parts[0][0].upper()
    return f"{parts[0][0]}{parts[1][0]}".upper()


def _enforce_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    with _rate_limit_lock:
        history = _rate_limit_store.get(client_ip, [])
        history = [timestamp for timestamp in history if now - timestamp < RATE_LIMIT_WINDOW_SECONDS]
        if len(history) >= RATE_LIMIT_MAX_REQUESTS:
            raise HTTPException(status_code=429, detail="Demasiados intentos. Intenta nuevamente en un minuto.")
        history.append(now)
        _rate_limit_store[client_ip] = history


def _serialize_review(review: Review, user_by_id: Dict[int, User]) -> ReviewPublic:
    linked_user: Optional[User] = user_by_id.get(review.user_id) if review.user_id else None
    resolved_name = (
        (linked_user.name or linked_user.full_name if linked_user else None)
        or review.display_name
        or review.author_name
        or "Invitado"
    )
    resolved_avatar = (linked_user.avatar_url if linked_user else None) or review.author_image
    public_user = None
    if linked_user:
        public_user = ReviewUserPublic(
            name=linked_user.name or linked_user.full_name or resolved_name,
            email=linked_user.email,
            avatar_url=resolved_avatar,
        )

    return ReviewPublic(
        id=int(review.id or 0),
        rating=max(1, min(int(review.rating or 0), 5)),
        comment=(review.comment or review.content or "").strip(),
        created_at=review.created_at,
        is_verified=bool(review.is_verified),
        status=review.status or "pending",
        author_role=(review.author_role or "").strip() or None,
        author_company=(review.author_company or "").strip() or None,
        page_context=(review.page_context or "").strip() or None,
        user=public_user,
        display_name=resolved_name,
        avatar_fallback=_extract_initials(resolved_name),
    )


def _verify_google_id_token(token: str) -> Dict[str, Any]:
    primary_client_id = (os.getenv("GOOGLE_CLIENT_ID") or "").strip()
    extra_client_ids_raw = (os.getenv("GOOGLE_CLIENT_IDS") or "").strip()

    allowed_client_ids: list[str] = []
    if primary_client_id:
        allowed_client_ids.append(primary_client_id)
    if extra_client_ids_raw:
        allowed_client_ids.extend(
            [candidate.strip() for candidate in extra_client_ids_raw.split(",") if candidate.strip()]
        )

    # Remove duplicates preserving order
    deduped_allowed_client_ids: list[str] = []
    for candidate in allowed_client_ids:
        if candidate not in deduped_allowed_client_ids:
            deduped_allowed_client_ids.append(candidate)
    allowed_client_ids = deduped_allowed_client_ids

    if not allowed_client_ids:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID no configurado en el backend.")

    last_error: Optional[Exception] = None
    for client_id in allowed_client_ids:
        try:
            token_info = google_id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
            if token_info.get("aud") == client_id:
                return token_info
        except Exception as exc:
            last_error = exc

    # Fallback to inspect audience and return actionable diagnostics
    try:
        token_info = google_id_token.verify_oauth2_token(token, google_requests.Request())
        token_aud = str(token_info.get("aud") or "").strip()
        if token_aud and token_aud in allowed_client_ids:
            return token_info
        raise HTTPException(
            status_code=400,
            detail=f"El token de Google pertenece a otro client_id (aud={token_aud or 'desconocido'}).",
        )
    except HTTPException:
        raise
    except Exception as exc:
        reason = str(last_error or exc)
        raise HTTPException(
            status_code=400,
            detail=f"Token de Google invalido o expirado. Detalle: {reason}",
        ) from exc


@router.get("/reviews", response_model=ReviewListResponse)
def list_reviews(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=50),
    include_pending: bool = Query(default=False),
    page_context: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    filters = []
    normalized_page_context = (page_context or "").strip().lower()
    if normalized_page_context:
        filters.append(Review.page_context == normalized_page_context)

    if not include_pending:
        if _is_moderation_enabled():
            filters.append(Review.status == "approved")
        else:
            filters.append(Review.status != "rejected")

    count_query = select(func.count()).select_from(Review)
    for condition in filters:
        count_query = count_query.where(condition)
    total = int(session.exec(count_query).one() or 0)

    review_query = select(Review)
    for condition in filters:
        review_query = review_query.where(condition)
    review_query = review_query.order_by(Review.created_at.desc(), Review.id.desc()).offset((page - 1) * page_size).limit(page_size)
    reviews = session.exec(review_query).all()

    user_ids = [review.user_id for review in reviews if review.user_id]
    users_by_id: Dict[int, User] = {}
    if user_ids:
        users = session.exec(select(User).where(User.id.in_(user_ids))).all()
        users_by_id = {int(user.id): user for user in users if user.id is not None}

    items = [_serialize_review(review, users_by_id) for review in reviews]
    total_pages = max(1, (total + page_size - 1) // page_size)
    return ReviewListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


@router.post("/reviews")
def create_review(payload: ReviewCreatePayload, request: Request, session: Session = Depends(get_session)):
    _enforce_rate_limit(request)

    rating = int(payload.rating or 0)
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="La calificacion debe estar entre 1 y 5.")

    raw_comment = (payload.comment or "").strip()
    if len(raw_comment) < 20:
        raise HTTPException(status_code=400, detail="El comentario debe tener al menos 20 caracteres.")

    comment = _sanitize_text(raw_comment)
    page_context = (payload.page_context or "clientes").strip().lower()
    status = "pending" if _is_moderation_enabled() else "approved"
    now_iso = datetime.utcnow().isoformat()

    if payload.authMode == "google":
        if not payload.googleIdToken:
            raise HTTPException(status_code=400, detail="Falta googleIdToken para authMode=google.")

        token_info = _verify_google_id_token(payload.googleIdToken)
        provider_id = str(token_info.get("sub") or "").strip()
        if not provider_id:
            raise HTTPException(status_code=400, detail="No se pudo obtener sub desde Google.")

        google_name = _sanitize_text(str(token_info.get("name") or "Google User"))
        google_email = _normalize_email(str(token_info.get("email") or "").strip() or None, required=False)
        google_avatar = str(token_info.get("picture") or "").strip() or None

        user = session.exec(
            select(User).where(User.provider == "google", User.provider_id == provider_id)
        ).first()

        if user is None and google_email:
            user = session.exec(select(User).where(User.email == google_email)).first()

        if user is None:
            fallback_email = google_email or f"{provider_id}@google-oauth.local"
            user = User(
                email=fallback_email,
                hashed_password=f"google_oauth::{provider_id}",
                full_name=google_name,
                name=google_name,
                provider="google",
                provider_id=provider_id,
                avatar_url=google_avatar,
                role="client",
                is_active=True,
                created_at=now_iso,
            )
        else:
            user.full_name = google_name
            user.name = google_name
            user.provider = "google"
            user.provider_id = provider_id
            if google_avatar:
                user.avatar_url = google_avatar
            if google_email and user.email.endswith("@google-oauth.local"):
                user.email = google_email

        session.add(user)
        session.commit()
        session.refresh(user)

        review = Review(
            user_id=user.id,
            display_name=google_name,
            reviewer_email=google_email or None,
            author_name=google_name,
            author_role=None,
            author_company=_sanitize_text(payload.company or "") or None,
            comment=comment,
            content=comment,
            rating=rating,
            is_verified=True,
            page_context=page_context,
            status=status,
            created_at=now_iso,
            author_image=google_avatar,
            initials=_extract_initials(google_name),
        )
        session.add(review)
        session.commit()
        session.refresh(review)

        item = _serialize_review(review, {int(user.id): user} if user.id else {})
        message = "Resena publicada" if status == "approved" else "Resena enviada a revision"
        return {"ok": True, "item": item, "message": message}

    if payload.authMode == "guest":
        display_name = _sanitize_text(payload.display_name or "")
        if not display_name:
            raise HTTPException(status_code=400, detail="display_name es requerido para publicar como invitado.")

        reviewer_email = _normalize_email(payload.email, required=False)
        company = _sanitize_text(payload.company or "") or None

        review = Review(
            user_id=None,
            display_name=display_name,
            reviewer_email=reviewer_email,
            author_name=display_name,
            author_role=None,
            author_company=company,
            comment=comment,
            content=comment,
            rating=rating,
            is_verified=False,
            page_context=page_context,
            status=status,
            created_at=now_iso,
            author_image=None,
            initials=_extract_initials(display_name),
        )
        session.add(review)
        session.commit()
        session.refresh(review)

        item = _serialize_review(review, {})
        message = "Resena enviada" if status == "approved" else "Resena enviada a revision"
        return {"ok": True, "item": item, "message": message}

    raise HTTPException(status_code=400, detail="authMode invalido. Usa 'google' o 'guest'.")


@router.post("/reviews/approve")
def approve_review(payload: ReviewApprovePayload, session: Session = Depends(get_session)):
    review = session.get(Review, payload.review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Resena no encontrada.")
    review.status = payload.status
    session.add(review)
    session.commit()
    session.refresh(review)
    return {"ok": True, "id": review.id, "status": review.status}
