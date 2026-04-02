import logging
import hashlib
import html
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select, func
from app.db import engine
from app.models import (
    Quote,
    AdvisoryBooking,
    LeadCommunication,
    DirectInquiry,
    EnterpriseProposal,
    LeadContactOverride,
)
from app.core.admin_auth import require_admin
from app.core.email import send_email_with_result
from app.core.email_threading import build_message_id, clean_message_id, normalize_email_address

router = APIRouter()
logger = logging.getLogger(__name__)
UNREAD_COMM_STATUSES = {"pending", "active"}
ALLOWED_MESSAGE_STATUSES = {
    "pending",
    "confirmed",
    "active",
    "read",
    "reviewed",
    "processed",
    "contacted",
    "spam",
    "trash",
    "sent",
}

def get_content_hash(text: str, subject: str = "", sender: str = "") -> str:
    """Genera una huella digital única para el contenido del mensaje"""
    base = f"{str(text or '').strip()}|{str(subject or '').strip()}|{str(sender or '').strip()}"
    return hashlib.sha256(base.encode('utf-8')).hexdigest()

def is_noise_message(subject: str, content: str, sender: str = "") -> bool:
    """Detecta SOLO ruido técnico puro de proveedores. NO filtrar correos de negocio."""
    subj = str(subject or "").lower()
    snd = str(sender or "").lower()
    
    # Solo ruido técnico real de proveedores (Gmail, Hostinger bienvenida, spam técnico)
    noise_subjects = [
        "get started with business email",
        "confirmación de gmail",
        "google oauth",
        "mailer-daemon",
        "postmaster",
    ]
    
    if snd == "system_auto": return True
    return any(x in subj for x in noise_subjects)


def _normalize_email(value: Optional[str]) -> str:
    return str(value or "").strip().lower()


def _normalize_phone(value: Optional[str]) -> str:
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    return f"+{digits}" if digits else ""


def _first_valid_phone(*values: Optional[str]) -> str:
    for value in values:
        normalized = _normalize_phone(value)
        if normalized:
            return normalized
    return ""


def _render_email_body(content: str) -> str:
    safe_content = html.escape(content or "").replace("\n", "<br>")
    return (
        "<div style=\"font-family:Arial,sans-serif;font-size:14px;line-height:1.7;"
        "white-space:normal;color:#0f172a;\">"
        f"{safe_content}</div>"
    )


def _is_admin_sender(value: Optional[str]) -> bool:
    sender = str(value or "").strip().lower()
    return sender == "admin" or sender.startswith("admin_to_") or "@resend.dev" in sender


def _get_system_from_email() -> str:
    return normalize_email_address(os.getenv("EMAIL_FROM") or os.getenv("IMAP_USER"))


def _normalize_comm_status(status: Optional[str]) -> str:
    normalized = str(status or "").strip().lower()
    if not normalized:
        return "pending"
    if normalized == "active":
        return "pending"
    return normalized


def _message_identity_key(message: LeadCommunication) -> str:
    clean_id = clean_message_id(getattr(message, "message_id", None))
    if clean_id:
        return clean_id

    created_at = getattr(message, "created_at", None)
    created_key = created_at.isoformat() if created_at else ""
    return "|".join([
        str(getattr(message, "thread_id", "") or "").strip(),
        str(getattr(message, "sender", "") or "").strip().lower(),
        str(getattr(message, "subject", "") or "").strip(),
        created_key,
    ])


def _get_message_contact_email(message: LeadCommunication) -> str:
    direction = str(getattr(message, "direction", "") or "").strip().lower()

    if direction == "outgoing":
        return _normalize_email(message.to_email) or _normalize_email(str(message.sender or "").replace("admin_to_", ""))

    if direction == "incoming":
        return _normalize_email(message.from_email) or _normalize_email(message.sender)

    sender = str(message.sender or "").strip()
    if sender.startswith("admin_to_"):
        return _normalize_email(sender.replace("admin_to_", ""))
    return _normalize_email(message.from_email) or _normalize_email(message.to_email) or _normalize_email(sender)


def _history_sender_role(message: LeadCommunication) -> str:
    if str(getattr(message, "direction", "") or "").strip().lower() == "outgoing":
        return "admin"
    if str(message.sender or "").strip().lower() == "system":
        return "system"
    if _is_admin_sender(message.sender):
        return "admin"
    return "client"


def _serialize_history(messages: list[LeadCommunication]) -> list[dict[str, Any]]:
    return [
        {
            "id": message.id,
            "sender": _history_sender_role(message),
            "content": message.content,
            "html_content": message.html_content,
            "subject": message.subject,
            "channel": message.channel,
            "created_at": message.created_at,
        }
        for message in messages
    ]


def _build_reply_subject(subject: Optional[str]) -> str:
    clean_subject = str(subject or "").strip()
    if not clean_subject:
        return "Respuesta a tu solicitud - Favio Jimenez"
    if clean_subject.lower().startswith("re:"):
        return clean_subject
    return f"Re: {clean_subject}"


def _build_references_header(source_msg: Optional[LeadCommunication]) -> Optional[str]:
    if not source_msg:
        return None

    reference_chain: list[str] = []
    existing_refs = str(getattr(source_msg, "references_header", "") or "").strip().split()
    for reference_id in existing_refs:
        clean_reference_id = clean_message_id(reference_id)
        if clean_reference_id and clean_reference_id not in reference_chain:
            reference_chain.append(clean_reference_id)

    source_message_id = clean_message_id(getattr(source_msg, "message_id", None))
    if source_message_id and source_message_id not in reference_chain:
        reference_chain.append(source_message_id)

    return " ".join(reference_chain) or None


def _resolve_lead_phone(session: Session, email: Optional[str], explicit_phone: Optional[str] = None) -> str:
    normalized_email = _normalize_email(email)
    if not normalized_email:
        return _normalize_phone(explicit_phone)

    override = session.exec(
        select(LeadContactOverride).where(func.lower(LeadContactOverride.email) == normalized_email)
    ).first()
    quote = session.exec(
        select(Quote).where(func.lower(Quote.email) == normalized_email)
    ).first()
    booking = session.exec(
        select(AdvisoryBooking).where(func.lower(AdvisoryBooking.customer_email) == normalized_email)
    ).first()
    proposal = session.exec(
        select(EnterpriseProposal).where(func.lower(EnterpriseProposal.client_email) == normalized_email)
    ).first()

    return _first_valid_phone(
        override.phone if override else None,
        explicit_phone,
        quote.telefono if quote else None,
        booking.customer_phone if booking else None,
        proposal.client_phone if proposal else None,
    )


def _persist_lead_phone(session: Session, email: str, phone: str) -> str:
    normalized_email = _normalize_email(email)
    normalized_phone = _normalize_phone(phone)

    if not normalized_email:
        raise HTTPException(status_code=400, detail="No se pudo identificar el email del cliente.")
    if not normalized_phone:
        raise HTTPException(status_code=400, detail="El telefono no es valido.")

    now = datetime.utcnow()
    override = session.exec(
        select(LeadContactOverride).where(func.lower(LeadContactOverride.email) == normalized_email)
    ).first()

    if override:
        override.phone = normalized_phone
        override.updated_at = now
    else:
        override = LeadContactOverride(
            email=normalized_email,
            phone=normalized_phone,
            created_at=now,
            updated_at=now,
        )
    session.add(override)

    for quote in session.exec(
        select(Quote).where(func.lower(Quote.email) == normalized_email)
    ).all():
        quote.telefono = normalized_phone
        quote.updated_at = now
        session.add(quote)

    for booking in session.exec(
        select(AdvisoryBooking).where(func.lower(AdvisoryBooking.customer_email) == normalized_email)
    ).all():
        booking.customer_phone = normalized_phone
        booking.updated_at = now
        session.add(booking)

    for proposal in session.exec(
        select(EnterpriseProposal).where(func.lower(EnterpriseProposal.client_email) == normalized_email)
    ).all():
        proposal.client_phone = normalized_phone
        proposal.updated_at = now
        session.add(proposal)

    return normalized_phone


async def _extract_payload_and_attachments(request: Request) -> tuple[Dict[str, Any], list[dict[str, Any]]]:
    content_type = str(request.headers.get("content-type", "")).lower()
    payload: Dict[str, Any] = {}
    attachments: list[dict[str, Any]] = []

    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        for key in ("to", "subject", "content", "channel", "phone"):
            value = form.get(key)
            if value is not None:
                payload[key] = str(value)

        for item in form.getlist("attachments"):
            filename = str(getattr(item, "filename", "") or "").strip()
            if not filename:
                continue

            file_content = await item.read()
            if not file_content:
                continue

            attachment: dict[str, Any] = {
                "filename": filename,
                "content": list(file_content),
            }
            file_content_type = str(getattr(item, "content_type", "") or "").strip()
            if file_content_type:
                attachment["content_type"] = file_content_type
            attachments.append(attachment)
        return payload, attachments

    try:
        parsed = await request.json()
        if isinstance(parsed, dict):
            payload = parsed
    except Exception:
        payload = {}

    return payload, attachments


@router.get("/")
def get_unified_messages(
    current_user = Depends(require_admin)
):
    """Obtiene una lista unificada de todos los leads (Cotizaciones + Asesorías + Correos)"""
    with Session(engine) as session:
        # Obtener todas las fuentes de leads
        quotes = session.exec(select(Quote)).all()
        bookings = session.exec(select(AdvisoryBooking)).all()
        directs = session.exec(select(DirectInquiry)).all()
        # Propuestas manuales (EnterpriseProposals)
        proposals = session.exec(select(EnterpriseProposal)).all()
        
        # Correos IMAP sincronizados desde Hostinger
        imap_emails = session.exec(
            select(LeadCommunication).where(LeadCommunication.channel == "email")
        ).all()
        
        unified = []
        
        # Mapear Cotizaciones
        for q in quotes:
            unified.append({
                "id": q.id,
                "uid": f"qt_{q.id}",
                "nombre": q.nombre,
                "email": q.email,
                "telefono": _resolve_lead_phone(session, q.email, q.telefono),
                "mensaje": q.mensaje,
                "html_content": None,
                "subject": f"Cotización: {q.nombre}",
                "status": q.status,
                "created_at": q.created_at,
                "source": "Cotización Web",
                "type": "quote"
            })
            
        # Mapear Asesorías
        for b in bookings:
            unified.append({
                "id": b.id,
                "uid": f"ad_{b.id}",
                "nombre": b.customer_name,
                "email": b.customer_email,
                "telefono": _resolve_lead_phone(session, b.customer_email, b.customer_phone),
                "mensaje": f"Reserva de Asesoría: {b.service_name} \nFecha: {b.date} {b.time}\nCódigo: {b.booking_code}\nNotas: {b.notes or 'Sin notas'}",
                "html_content": None,
                "subject": f"Asesoría: {b.service_name}",
                "status": "pending" if b.status in {"confirmed", "pending"} else b.status,
                "created_at": b.created_at,
                "sender": "client",
                "source": "Asesoría Técnica",
                "type": "advisory"
            })

        # Mapear Correos Directos (formulario de contacto web)
        for d in directs:
            unified.append({
                "id": d.id,
                "uid": f"di_{d.id}",
                "nombre": d.nombre,
                "email": d.email,
                "telefono": _resolve_lead_phone(session, d.email),
                "mensaje": getattr(d, 'subject', d.nombre),
                "html_content": d.html_content,
                "subject": d.subject or d.nombre,
                "status": d.status,
                "created_at": d.created_at,
                "sender": "client",
                "source": "Contacto Web",
                "type": "direct"
            })

        # Mapear Propuestas Manuales (EnterpriseProposals)
        seen_emails = set()
        for p in proposals:
            # Solo añadir si el email es único para no duplicar leads
            if p.client_email.lower() in seen_emails:
                continue
            seen_emails.add(p.client_email.lower())
            
            unified.append({
                "id": p.id,
                "uid": f"ep_{p.id}",
                "nombre": f"{p.client_name} ({p.client_company or 'Empresa'})",
                "email": p.client_email,
                "telefono": _resolve_lead_phone(session, p.client_email, p.client_phone),
                "mensaje": f"Proyecto: {p.project_objective or 'Propuesta Elite en curso'}\nFolio: {p.quote_number}\nTotal: {p.final_total} {p.currency}",
                "html_content": None,
                "subject": f"Propuesta: {p.quote_number}",
                "status": "contacted" if p.status != "Pending" else "pending",
                "created_at": p.created_at,
                "sender": "client",
                "source": "Propuesta Elite",
                "type": "proposal"
            })

        # Mapear Correos IMAP (Hostinger) - Agrupados por hilo y contenido
        seen_msg_keys = set()
        for e in imap_emails:
            # 1. EVITAR RUIDO TÉCNICO Y DE SISTEMA (Filtro Senior)
            if is_noise_message(e.subject, e.content, e.sender):
                continue

            # 2. Clave de desduplicación de "Huella Digital"
            identity_key = _message_identity_key(e)
            if identity_key in seen_msg_keys:
                continue
            seen_msg_keys.add(identity_key)

            # Un email es "de admin" SOLO si viene de la carpeta Sent (status="sent")
            # o si es un mensaje outbound/reply del CRM.
            # Los emails en INBOX (status="active"), aunque vengan del email del admin,
            # son notificaciones del sistema que deben mostrarse en la bandeja de entrada.
            sender_value = str(e.sender or "")
            is_sent_folder = (str(e.folder or "").lower().startswith("sent") or e.status == "sent")
            is_crm_reply = _is_admin_sender(sender_value)
            is_outbound = (str(getattr(e, "direction", "") or "").lower() == "outgoing" or e.lead_type == "outbound")
            is_admin_msg = is_sent_folder or is_crm_reply or is_outbound
            normalized_status = _normalize_comm_status(e.status)
            if is_admin_msg and normalized_status in UNREAD_COMM_STATUSES:
                normalized_status = "sent"
            
            # Si es enviado por nosotros, mostramos a quién se lo enviamos
            contact_email = _get_message_contact_email(e)
            display_email = contact_email or sender_value
            if display_email == "admin":
                display_email = "Cliente (Destinatario Oculto)"
                 
            unified.append({
                "id": e.id,
                "uid": f"lc_{e.id}",
                "nombre": e.subject or "Correo Corporativo",
                "email": display_email,
                "telefono": _resolve_lead_phone(session, contact_email),
                "mensaje": e.content or "Sin contenido",
                "html_content": e.html_content,
                "subject": e.subject or "Sin asunto",
                "status": normalized_status,
                "created_at": e.created_at,
                "source": "Email Corporativo",
                "sender": "admin" if is_admin_msg else (sender_value or "client"),
                "is_admin": is_admin_msg,
                "type": "sent" if is_admin_msg else "imap"
            })

        # 4. FILTRO GLOBAL DE SEGURIDAD (Noise Purge Final)
        final_unified = []
        for u in unified:
            # Ignorar administradores de la bandeja de entrada principal
            # Si el tipo es 'sent' o 'is_admin', solo se mostrarán en la pestaña de Enviados
            final_unified.append(u)

        # 5. Ordenar por fecha descendente
        def safe_date(x):
            val = x.get("created_at")
            if not val: return datetime.min
            return datetime.fromisoformat(val.replace('Z', '+00:00')) if isinstance(val, str) else val

        final_unified.sort(key=safe_date, reverse=True)
        return final_unified

@router.get("/unread-count")
def get_unread_messages_count(
    current_user = Depends(require_admin)
):
    """Devuelve la cantidad total de interacciones sin gestionar"""
    with Session(engine) as session:
        # Conteo en Quotes (pending)
        q_count = session.exec(select(func.count()).select_from(Quote).where(Quote.status == "pending")).one()
        # Conteo en Asesorías (usamos el estado que consideres gestionable, ej: confirmed es nuevo lead)
        b_count = session.exec(
            select(func.count()).select_from(AdvisoryBooking).where(AdvisoryBooking.status.in_(("confirmed", "pending")))
        ).one()
        
        # Conteo en Directs (pending)
        d_count = session.exec(select(func.count()).select_from(DirectInquiry).where(DirectInquiry.status == "pending")).one()
        
        # Conteo de Emails IMAP Nuevos (status=pending, y que no sean envíos del admin)
        l_count = session.exec(
            select(func.count()).select_from(LeadCommunication).where(
                LeadCommunication.status.in_(tuple(UNREAD_COMM_STATUSES)),
                LeadCommunication.channel == "email",
                LeadCommunication.direction != "outgoing"
            )
        ).one()
        
        return {"unread_count": q_count + b_count + d_count + l_count}

@router.patch("/{id}/read")
def mark_message_as_read(
    id: int,
    uid: str | None = None,
    type: str = "quote",
    current_user = Depends(require_admin)
):
    """Marca una interacción como gestionada"""
    with Session(engine) as session:
        # Prioridad al UID si viene del frontend
        if uid and uid.startswith("lc_"):
            real_id = int(uid.replace("lc_", ""))
            msg = session.get(LeadCommunication, real_id)
            if msg and str(msg.status or "").strip().lower() in UNREAD_COMM_STATUSES:
                msg.status = "read"
                session.add(msg)
        elif type == "quote":
            msg = session.get(Quote, id)
            if msg and msg.status == "pending":
                msg.status = "reviewed"
                session.add(msg)
        elif type == "direct":
            msg = session.get(DirectInquiry, id)
            if msg and msg.status == "pending":
                msg.status = "read"
                session.add(msg)
        else:
            msg = session.get(AdvisoryBooking, id)
            if msg and str(msg.status or "").strip().lower() in {"confirmed", "pending"}:
                msg.status = "processed"
                session.add(msg)
        
        if not msg:
            raise HTTPException(status_code=404, detail="Mensaje no encontrado")
            
        session.commit()
        return {"success": True}

@router.get("/{id}/history")
def get_lead_history(
    id: int,
    uid: str | None = None,
    type: str = "quote",
    current_user = Depends(require_admin)
):
    """Obtiene el hilo de conversación de un lead específico"""
    with Session(engine) as session:
        # Si es un lead de IMAP (LeadCommunication)
        if uid and uid.startswith("lc_"):
            real_id = int(uid.replace("lc_", ""))
            source_msg = session.get(LeadCommunication, real_id)
            if not source_msg: return []
            
            source_thread_id = str(source_msg.thread_id or "").strip()
            if not source_thread_id:
                return []

            raw_history = session.exec(
                select(LeadCommunication).where(
                    LeadCommunication.thread_id == source_thread_id,
                    LeadCommunication.id != real_id
                ).order_by(LeadCommunication.created_at)
            ).all()

            history_unified = []
            seen_message_keys = {_message_identity_key(source_msg)}

            for history_item in raw_history:
                if is_noise_message(history_item.subject, history_item.content, history_item.sender):
                    continue
                history_key = _message_identity_key(history_item)
                if history_key in seen_message_keys:
                    continue
                history_unified.append(history_item)
                seen_message_keys.add(history_key)

            return _serialize_history(history_unified)

        history = session.exec(
            select(LeadCommunication).where(
                LeadCommunication.lead_id == id,
                LeadCommunication.lead_type == type
            ).order_by(LeadCommunication.created_at)
        ).all()
        return _serialize_history(history)

@router.patch("/{id}/phone")
async def update_lead_phone(
    id: int,
    request: Request,
    uid: str | None = None,
    type: str = "quote",
    current_user = Depends(require_admin)
):
    """Guarda o actualiza el telefono/WhatsApp manual del lead."""
    payload, _ = await _extract_payload_and_attachments(request)
    phone = str(payload.get("phone") or "").strip()

    if not phone:
        raise HTTPException(status_code=400, detail="El telefono es requerido.")

    with Session(engine) as session:
        contact_email = ""

        if uid and uid.startswith("lc_"):
            real_id = int(uid.replace("lc_", ""))
            source_msg = session.get(LeadCommunication, real_id)
            if source_msg:
                contact_email = _get_message_contact_email(source_msg)
        elif type == "quote":
            lead = session.get(Quote, id)
            if lead:
                contact_email = lead.email
        elif type == "advisory":
            lead = session.get(AdvisoryBooking, id)
            if lead:
                contact_email = lead.customer_email
        elif type == "direct":
            lead = session.get(DirectInquiry, id)
            if lead:
                contact_email = lead.email
        elif type in {"imap", "sent"}:
            lead = session.get(LeadCommunication, id)
            if lead:
                contact_email = _get_message_contact_email(lead)

        saved_phone = _persist_lead_phone(session, contact_email, phone)
        session.commit()
        return {"success": True, "email": _normalize_email(contact_email), "phone": saved_phone}

@router.post("/{id}/reply")
async def reply_to_lead(
    id: int,
    request: Request,
    uid: str | None = None,
    type: str = "quote",
    current_user = Depends(require_admin)
):
    """Envía una respuesta al cliente y la guarda en el historial"""
    payload, attachments = await _extract_payload_and_attachments(request)
    content = str(payload.get("content") or "").strip()
    channel = str(payload.get("channel") or "email").strip().lower() # email | whatsapp | note
    
    if not content:
        raise HTTPException(status_code=400, detail="El contenido es requerido")
    if channel not in {"email", "whatsapp", "note"}:
        raise HTTPException(status_code=400, detail="Canal no soportado")

    with Session(engine) as session:
        # 1. Obtener datos del cliente
        lead = None
        email = ""
        source_msg: LeadCommunication | None = None
        reply_subject = "Respuesta a tu solicitud - Favio Jimenez"
        thread_id: Optional[str] = None
        parent_message_id: Optional[str] = None
        references_header: Optional[str] = None
        
        if uid and uid.startswith("lc_"):
            # REPUESSTA A CORREO IMAP RECIBIDO
            real_id = int(uid.replace("lc_", ""))
            source_msg = session.get(LeadCommunication, real_id)
            if source_msg:
                lead = source_msg
                email = _get_message_contact_email(source_msg)
                reply_subject = _build_reply_subject(source_msg.subject)
                thread_id = source_msg.thread_id or clean_message_id(source_msg.message_id) or f"legacy-email-{source_msg.id}"
                parent_message_id = clean_message_id(source_msg.message_id)
                references_header = _build_references_header(source_msg)
                # Cambiamos type a imap para el historial
                type = "imap"
        elif type == "quote":
            lead = session.get(Quote, id)
            if lead:
                email = lead.email
        elif type == "advisory":
            lead = session.get(AdvisoryBooking, id)
            if lead:
                email = lead.customer_email
        elif type == "direct":
            lead = session.get(DirectInquiry, id)
            if lead:
                email = lead.email

        if not lead:
            raise HTTPException(status_code=404, detail="Mensaje o lead no encontrado")

        # 2. Ejecutar envío real si es email
        if channel == "email":
            outbound_message_id = build_message_id(_get_system_from_email())
            outbound_headers = {"Message-ID": outbound_message_id}
            if parent_message_id:
                outbound_headers["In-Reply-To"] = parent_message_id
            if references_header:
                outbound_headers["References"] = references_header
            try:
                sent_result = await send_email_with_result(
                    to_email=email,
                    subject=reply_subject,
                    body=_render_email_body(content),
                    attachments=attachments or None,
                    headers=outbound_headers,
                )
            except Exception as e:
                logger.error(f"Error enviando email: {e}")
                raise HTTPException(status_code=500, detail="Error enviando el correo corporativo")
            if not sent_result.ok:
                raise HTTPException(status_code=502, detail="No se pudo entregar la respuesta por correo.")
        else:
            outbound_message_id = None

        # 3. Guardar en historial
        comm = LeadCommunication(
            lead_id=id,
            lead_type=type,
            sender=f"admin_to_{email}",
            content=content,
            html_content=_render_email_body(content) if channel == "email" else None,
            subject=reply_subject if channel == "email" else None,
            channel=channel,
            message_id=outbound_message_id,
            thread_id=thread_id or outbound_message_id or f"lead-{type}-{id}",
            in_reply_to=parent_message_id if channel == "email" else None,
            references_header=references_header if channel == "email" else None,
            direction="outgoing",
            folder="sent" if channel == "email" else None,
            from_email=_get_system_from_email() if channel == "email" else None,
            to_email=email if channel == "email" else None,
            status="sent" # IMPORTANTE: marcarlo como enviado explícitamente
        )
        session.add(comm)
        
        # 4. Actualizar estado del lead a gestionado
        if type == "quote":
            lead.status = "contacted"
        elif type == "direct":
            lead.status = "contacted"
        elif type == "advisory":
            lead.status = "processed"
        session.add(lead)
        
        session.commit()
        return {"success": True}

@router.post("/send")
async def send_new_email(
    request: Request,
    current_user = Depends(require_admin)
):
    """Permite redactar y enviar un correo nuevo a cualquier dirección"""
    payload, attachments = await _extract_payload_and_attachments(request)
    to_email = str(payload.get("to") or "").strip()
    subject = str(payload.get("subject") or "").strip()
    content = str(payload.get("content") or "").strip()
    
    if not all([to_email, subject, content]):
        raise HTTPException(status_code=400, detail="Destinatario, asunto y contenido son requeridos")

    try:
        outbound_message_id = build_message_id(_get_system_from_email())
        sent_result = await send_email_with_result(
            to_email=to_email,
            subject=subject,
            body=_render_email_body(content),
            attachments=attachments or None,
            headers={"Message-ID": outbound_message_id},
        )
        if not sent_result.ok:
            raise HTTPException(status_code=502, detail="No se pudo enviar el correo corporativo")
        
        with Session(engine) as session:
            # Registrar en Enviados (lead_id=0 indica que no está vinculado a un lead específico aún)
            comm = LeadCommunication(
                lead_id=0,
                lead_type="outbound",
                sender=f"admin_to_{to_email}",
                content=content,
                html_content=_render_email_body(content),
                subject=subject,
                channel="email",
                message_id=outbound_message_id,
                thread_id=outbound_message_id,
                direction="outgoing",
                folder="sent",
                from_email=_get_system_from_email(),
                to_email=_normalize_email(to_email),
                status="sent"
            )
            session.add(comm)
            session.commit()
            return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error redactando email: {e}")
        raise HTTPException(status_code=500, detail="Error al enviar el correo corporativo")

@router.delete("/{id}")
def delete_message(
    id: int,
    uid: str | None = None,
    type: str = "quote",
    current_user = Depends(require_admin)
):
    """Elimina un mensaje de la base de datos"""
    with Session(engine) as session:
        msg = None
        if uid and uid.startswith("lc_"):
            real_id = int(uid.replace("lc_", ""))
            msg = session.get(LeadCommunication, real_id)
        elif type == "quote":
            msg = session.get(Quote, id)
        elif type == "direct":
            msg = session.get(DirectInquiry, id)
        elif type == "advisory":
            msg = session.get(AdvisoryBooking, id)
        elif type == "sent": # Para el caso de borrado desde Enviados
            msg = session.get(LeadCommunication, id)
            
        if not msg:
            raise HTTPException(status_code=404, detail="Mensaje no encontrado")
            
        # Borrado lógico (Trash system)
        msg.status = "trash"
        session.add(msg)
        session.commit()
        return {"success": True}

@router.patch("/{id}/status")
def update_message_status(
    id: int,
    payload: Dict[str, str],
    uid: str | None = None,
    type: str = "quote",
    current_user = Depends(require_admin)
):
    """Actualiza el estado de cualquier mensaje (ej: de spam a pending)"""
    new_status = str(payload.get("status") or "").strip().lower()
    if not new_status:
        raise HTTPException(status_code=400, detail="Estado requerido")
    if new_status not in ALLOWED_MESSAGE_STATUSES:
        raise HTTPException(status_code=400, detail="Estado no permitido")

    effective_status = "confirmed" if type == "advisory" and new_status == "pending" else new_status
        
    print(f"[STATUS_UPDATE] Intentando cambiar ID {id} (UID: {uid}) a {new_status}")
    
    with Session(engine) as session:
        msg = None
        # 1. Prioridad absoluta al UID (Detección IMAP)
        if uid and uid.startswith("lc_"):
            try:
                real_id = int(uid.replace("lc_", ""))
                msg = session.get(LeadCommunication, real_id)
            except: pass
            
        # 2. Respaldo por ID si es IMAP pero no venía lc_
        if not msg and type in {"imap", "sent"}:
            msg = session.get(LeadCommunication, id)
            
        # 3. Modelos estándar de Lead
        if not msg:
            if type == "quote":
                msg = session.get(Quote, id)
            elif type == "direct":
                msg = session.get(DirectInquiry, id)
            elif type == "advisory":
                msg = session.get(AdvisoryBooking, id)
            
        if not msg:
            print(f"[STATUS_UPDATE] ERROR: Mensaje no encontrado para ID {id}")
            raise HTTPException(status_code=404, detail="Mensaje no encontrado")
            
        msg.status = effective_status
        session.add(msg)
        session.commit()
        return {"success": True, "status": effective_status}
        print(f"[STATUS_UPDATE] ÉXITO: {id} ahora es {new_status}")
        return {"success": True}
