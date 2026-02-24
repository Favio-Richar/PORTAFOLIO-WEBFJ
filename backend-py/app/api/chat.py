import json
import os
from datetime import datetime, timezone
from typing import Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.db import get_session
from app.models import Contact

router = APIRouter()


class ChatMessagePayload(BaseModel):
    message: str = Field(min_length=1, max_length=1500)
    source: Optional[str] = Field(default="floating-chat", max_length=80)
    page: Optional[str] = Field(default="sitio-web", max_length=80)


class ChatMessageResponse(BaseModel):
    status: str
    provider: str
    timestamp: str


def _normalize_phone_number(value: str) -> str:
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    if digits.startswith("00"):
        digits = digits[2:]
    return digits


def _resolve_target_number(session: Session) -> str:
    env_target = _normalize_phone_number(os.getenv("WHATSAPP_TO_NUMBER", ""))
    if env_target:
        return env_target

    contact = session.exec(select(Contact)).first()
    if contact and contact.whatsapp:
        from_contact = _normalize_phone_number(contact.whatsapp)
        if from_contact:
            return from_contact

    return ""


def _send_whatsapp_text(phone_number_id: str, access_token: str, to_number: str, text: str) -> None:
    url = f"https://graph.facebook.com/v21.0/{phone_number_id}/messages"
    body = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": text,
        },
    }
    data = json.dumps(body).encode("utf-8")
    request = Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=12) as response:
            status_code = getattr(response, "status", 200)
            if status_code < 200 or status_code >= 300:
                raise HTTPException(status_code=502, detail="Error al enviar mensaje por WhatsApp.")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(
            status_code=502,
            detail=f"WhatsApp API rechazo la solicitud ({exc.code}). {detail[:220]}",
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"No se pudo conectar con WhatsApp API: {exc.reason}",
        ) from exc


@router.post("/messages", response_model=ChatMessageResponse)
def send_chat_message(payload: ChatMessagePayload, session: Session = Depends(get_session)):
    message = (payload.message or "").strip()
    if len(message) < 2:
        raise HTTPException(status_code=400, detail="El mensaje es demasiado corto.")

    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN", "").strip()
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    if not access_token or not phone_number_id:
        raise HTTPException(
            status_code=500,
            detail="Falta configurar WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID en el backend.",
        )

    to_number = _resolve_target_number(session)
    if not to_number:
        raise HTTPException(
            status_code=500,
            detail="No hay numero destino. Configura WHATSAPP_TO_NUMBER o el campo whatsapp en /api/contact.",
        )

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    source = (payload.source or "floating-chat").strip() or "floating-chat"
    page = (payload.page or "sitio-web").strip() or "sitio-web"

    whatsapp_body = (
        "Nuevo mensaje desde el chat web\n"
        f"Origen: {source}\n"
        f"Pagina: {page}\n"
        f"Fecha: {now}\n\n"
        f"Mensaje:\n{message}"
    )

    _send_whatsapp_text(phone_number_id, access_token, to_number, whatsapp_body[:3500])

    return ChatMessageResponse(
        status="sent",
        provider="meta-whatsapp-cloud",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

