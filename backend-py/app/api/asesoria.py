import json
import re
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.meeting_integrations import (
    MeetingProvisionRequest,
    provider_is_configured,
    provision_meeting,
)
from app.core.advisory_reminders import (
    get_reminder_runtime_status,
    process_due_advisory_reminders,
)
from app.db import get_session
from app.models import (
    AdvisoryBlockedSlot,
    AdvisoryBooking,
    AdvisoryWeeklyAvailability,
    ServiceAdvisoryCard,
    SystemNotification,
    LeadCommunication,
    LeadContactOverride,
    CalendarEvent
)
from app.core.settings import get_setting_value
from app.core.admin_auth import require_admin

router = APIRouter()

TIMEZONE_LABEL = "America/Santiago"
ALLOWED_STATUSES = {"pending", "confirmed", "cancelled", "rescheduled"}
ALLOWED_MEETING_PROVIDERS = {"google_meet", "teams", "jitsi"}
PROVIDER_LABELS = {
    "google_meet": "Google Meet",
    "teams": "Teams",
    "jitsi": "Jitsi Meet",
}


class AdvisoryServicePublic(BaseModel):
    id: str
    name: str
    duration_min: int
    price_clp: int
    highlights: List[str]
    active: bool = True


class AvailabilityResponse(BaseModel):
    slots: List[str]
    timezone: str = TIMEZONE_LABEL


class BookingCreatePayload(BaseModel):
    service_id: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    notes: str
    meeting_provider: str = "google_meet"
    reminders: dict


class BookingCreateResponse(BaseModel):
    booking_id: str
    status: str
    meeting_link: Optional[str] = None
    message: str


class BookingStatusUpdatePayload(BaseModel):
    status: str


class BlockSlotPayload(BaseModel):
    date: str
    time: str
    reason: Optional[str] = None


class ResendConfirmationPayload(BaseModel):
    booking_id: str


class AdminBookingResponse(BaseModel):
    id: str
    service_id: Optional[int] = None
    service_name: str
    customer_name: str
    customer_email: str
    customer_phone: str
    date: str
    time: str
    status: str
    meeting_provider: str
    meeting_link: Optional[str] = None
    reminders_h24: bool = True
    reminders_h1: bool = True
    reminder_h24_sent_at: Optional[str] = None
    reminder_h1_sent_at: Optional[str] = None
    created_at: Optional[str] = None


class WeeklyAvailabilityDayPayload(BaseModel):
    weekday: int
    enabled: bool
    start_time: str
    end_time: str


class WeeklyAvailabilityUpdatePayload(BaseModel):
    days: List[WeeklyAvailabilityDayPayload]


class MeetingProviderPublic(BaseModel):
    id: str
    label: str
    enabled: bool


class RescheduleBookingPayload(BaseModel):
    date: str
    time: str
    meeting_provider: Optional[str] = None
    notify_client: bool = True
    notes: Optional[str] = None


class BlockedSlotPublic(BaseModel):
    id: int
    date: str
    time: str
    reason: Optional[str] = None
    active: bool
    created_at: Optional[str] = None


class ReminderRunResponse(BaseModel):
    ok: bool = True
    run_at: str
    automatic_enabled: bool
    window_minutes: int
    scanned: int
    sent_h24: int
    sent_h1: int
    errors: int


def _parse_service_id(service_id: str) -> int:
    raw = str(service_id or "").strip()
    if not raw:
        raise HTTPException(status_code=400, detail="service_id es obligatorio")

    if raw.isdigit():
        return int(raw)

    match = re.search(r"(\d+)$", raw)
    if match:
        return int(match.group(1))

    raise HTTPException(status_code=400, detail="service_id invalido")


def _parse_json_list(value: Optional[str]) -> List[str]:
    raw = str(value or "").strip()
    if not raw:
        return []

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except (json.JSONDecodeError, TypeError, ValueError):
        pass

    return [part.strip() for part in raw.replace("\n", ",").split(",") if part.strip()]


def _parse_price_clp(value: Optional[str]) -> int:
    digits = re.sub(r"[^\d]", "", str(value or ""))
    return int(digits) if digits else 0


def _parse_duration_minutes(value: Optional[str]) -> int:
    match = re.search(r"(\d+)", str(value or ""))
    if not match:
        return 60
    minutes = int(match.group(1))
    return max(15, minutes)


def _validate_iso_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Fecha invalida. Usa YYYY-MM-DD.") from exc


def _validate_hhmm(time_str: str) -> str:
    if not re.match(r"^\d{2}:\d{2}$", str(time_str or "")):
        raise HTTPException(status_code=400, detail="Hora invalida. Usa HH:MM.")
    hours, minutes = map(int, str(time_str).split(":"))
    if not (0 <= hours <= 23 and 0 <= minutes <= 59):
        raise HTTPException(status_code=400, detail="Hora fuera de rango.")
    return f"{hours:02d}:{minutes:02d}"


def _to_minutes(hhmm: str) -> int:
    hours, minutes = map(int, hhmm.split(":"))
    return hours * 60 + minutes


def _to_hhmm(minutes: int) -> str:
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"


def _generate_booking_code(session: Session) -> str:
    for _ in range(8):
        code = f"AS-{datetime.utcnow().strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"
        exists = session.exec(select(AdvisoryBooking.id).where(AdvisoryBooking.booking_code == code)).first()
        if not exists:
            return code
    raise HTTPException(status_code=500, detail="No se pudo generar codigo de reserva unico.")


def _send_booking_confirmation_email(booking: AdvisoryBooking) -> bool:
    if not booking.customer_email:
        return False
    try:
        from app.core.email import send_email
    except Exception as e:
        print(f"Error importando send_email: {e}")
        return False

    from datetime import datetime
    year = datetime.utcnow().year
    
    # Si por alguna razon el link es None, le damos un valor seguro (Jitsi) para que no falle el HTML
    meeting_link = booking.meeting_link or f"https://meet.jit.si/asesoria-{booking.booking_code}"
    timezone_label = "America/Santiago" # Valor por defecto seguro para Chile

    try:
        body = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">FJ Digital Engineering</h1>
            </div>
            
            <div style="padding: 40px; color: #334155;">
                <h2 style="color: #10b981; margin-top: 0; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Reserva de Asesoria Aprobada</h2>
                
                <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">Estimado/a <strong>{booking.customer_name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Nos complace enormemente informarte que hemos <strong>confirmado formalmente</strong> tu reserva. A continuacion, te presentamos los parametros de acceso de tu sesion de consultoria especializada:</p>
                
                <div style="background-color: #f8fafc; padding: 20px 25px; border-radius: 8px; margin: 30px 0; border-left: 5px solid #10b981;">
                    <p style="margin: 8px 0; font-size: 15px;"><strong>🔢 Codigo de Agenda:</strong> <span style="color: #1e293b;">{booking.booking_code}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>🌟 Servicio Contratado:</strong> <span style="color: #1e293b;">{booking.service_name}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>📅 Fecha Oficial:</strong> <span style="color: #1e293b;">{booking.date}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>⏰ Hora Exacta:</strong> <span style="color: #1e293b;">{booking.time} ({timezone_label})</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>📹 Recurso de Reunion:</strong> <span style="color: #1e293b; text-transform: capitalize;">{booking.meeting_provider}</span></p>
                </div>

                <div style="text-align: center; margin: 45px 0 35px 0;">
                    <a href="{meeting_link}" style="background-color: #2563eb; color: #ffffff; padding: 16px 36px; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1);">Ingresar a la Sala de Reunion Oficial</a>
                </div>

                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                    <p style="font-size: 14px; color: #b91c1c; margin: 0; line-height: 1.5;"><strong>Importante:</strong> Si tu cliente de correo restringe los enlaces directos o el boton superior no reacciona, copia manualmente y pega el siguiente enlace maestro directamente en tu navegador:</p>
                    <a href="{meeting_link}" style="color: #dc2626; word-break: break-all; margin-top: 10px; display: block; font-size: 13px;">{meeting_link}</a>
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">¿Dudas de urgencia o incompatibilidad de agenda? Responda directo a este correo o llame a traves de WhatsApp para recalendarizar antes de las 48 hrs permitidas.</p>
                </div>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
                <p style="font-size: 13px; color: #64748b; margin: 0; font-weight: 500;">© {year} FJ Digital Engineering. El mas alto nivel en Automatizacion B2B.</p>
            </div>
        </div>
        """
    except Exception as e:
        print(f"Error generando body del correo de confirmacion: {e}")
        return False
    # Notificacion al cliente
    sent_client = bool(send_email(booking.customer_email, f"Confirmacion asesoria {booking.booking_code}", body))

    # Notificacion redundante al admin (Copia de seguridad)
    try:
        import os
        admin_email = os.getenv("EMAIL_RECEIVER")
        if admin_email and admin_email != booking.customer_email:
            send_email(
                admin_email,
                f"COPIA ADMIN: Nueva reserva {booking.booking_code} - {booking.customer_name}",
                f"<p>Hola Favio, se ha generado una nueva reserva. Aquí tienes la copia del enlace por si el cliente no la recibe:</p>{body}"
            )
    except Exception:
        pass # No bloquear el flujo principal si falla la copia al admin

    return sent_client


def _send_admin_new_booking_alert(booking: AdvisoryBooking, is_paid: bool):
    try:
        from app.core.email import send_email
        import os
        from dotenv import load_dotenv

        # OBLIGAMOS AL SERVIDOR A LEER EL ARCHIVO .ENV FRESCO CADA VEZ
        load_dotenv(override=True)
        # Se usa el correo que pidio el usuario explicitamente, o el del entorno
        admin_email = os.getenv("EMAIL_RECEIVER", "ing@nextlevelsoftwarepro.com")
        frontend_url = os.getenv("FRONTEND_PUBLIC_URL", "http://localhost:3000")
        
        status_text = "Pendiente de Pago o Aprobacion" if is_paid else "Auto-Confirmada (Gratuita)"
        
        clean_phone = "".join(filter(str.isdigit, booking.customer_phone)) if booking.customer_phone else ""
        wa_link = f'<a href="https://wa.me/{clean_phone}">{booking.customer_phone}</a>' if clean_phone else "No proporcionado"
        
        body = f"""
        <h2>¡Nueva Reserva en el Sistema!</h2>
        <p>Has recibido una nueva solicitud de asesoria en tu portafolio.</p>
        <ul>
            <li><strong>Cliente:</strong> {booking.customer_name} ({booking.customer_email})</li>
            <li><strong>WhatsApp/Telefono:</strong> {wa_link}</li>
            <li><strong>Servicio:</strong> {booking.service_name}</li>
            <li><strong>Fecha y Hora:</strong> {booking.date} a las {booking.time}</li>
            <li><strong>Tipo de Reserva:</strong> {status_text}</li>
        </ul>
        <p>Por favor ingresa al <a href="{frontend_url}/admin/dashboard">panel de administrador</a> para verificar el pago y gestionarla.</p>
        """
        
        send_email(
            admin_email,
            f"NUEVA RESERVA B2B - {booking.customer_name}",
            body
        )
    except Exception as e:
        print(f"Error enviando alerta admin: {e}")

def _send_client_pending_alert(booking: AdvisoryBooking, is_paid: bool, session: Session):
    try:
        from app.core.email import send_email
        if not booking.customer_email:
            return
            
        from datetime import datetime
        from zoneinfo import ZoneInfo
        year = datetime.now(ZoneInfo(TIMEZONE_LABEL)).year
        
        # Leemos los datos de pago de GlobalSettings o usamos defaults profesionales
        from app.core.settings import get_setting_value
        bank_details = get_setting_value(session, "bank_transfer_details", """
            <strong>Banco:</strong> Banco Falabella<br>
            <strong>Tipo:</strong> Cuenta Corriente<br>
            <strong>Numero:</strong> 1-724-002786-7<br>
            <strong>RUT:</strong> 24.785.698-6<br>
            <strong>Nombre:</strong> Favio Jimenez<br>
            <strong>Email:</strong> FAVIO4515@GMAIL.COM
        """).strip()
        
        paypal_link = get_setting_value(session, "paypal_payment_url", "https://paypal.me/fav945").strip()

        body = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">FJ Digital Engineering</h1>
            </div>
            
            <div style="padding: 40px; color: #334155;">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Solicitud de Reserva Recibida</h2>
                
                <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">Hola <strong>{booking.customer_name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Este es un mensaje automatico para informarte formalmente que <strong>hemos recibido tu peticion</strong> para el siguiente servicio corporativo:</p>
                
                <div style="background-color: #f8fafc; padding: 20px 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #3b82f6;">
                    <p style="margin: 8px 0; font-size: 15px;"><strong>🌟 Servicio B2B:</strong> <span style="color: #1e293b;">{booking.service_name}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>📅 Fecha Programada:</strong> <span style="color: #1e293b;">{booking.date}</span></p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>⏰ Hora en Agenda:</strong> <span style="color: #1e293b;">{booking.time}</span></p>
                </div>

                <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 25px; margin: 30px 0;">
                    <h3 style="color: #92400e; margin-top: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">💳 Opciones de Pago Corporativo</h3>
                    <p style="font-size: 14px; color: #b45309; margin-bottom: 15px;">Para asegurar y liberar de inmediato tu cupo en nuestra agenda oficial, puedes utilizar uno de los siguientes metodos:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px dashed #d1d5db;">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-transform: uppercase;">A. Transferencia Bancaria Directa</p>
                            <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
                                {bank_details}
                            </div>
                        </div>

                        <div style="text-align: center; padding: 10px 0;">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-transform: uppercase;">B. Pago via PayPal / Internacional</p>
                            <a href="{paypal_link}" style="background-color: #0070ba; color: #ffffff; padding: 12px 25px; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px; display: inline-block;">Pagar con PayPal</a>
                        </div>
                    </div>
                </div>

                <p style="font-size: 15px; line-height: 1.6; color: #64748b; font-style: italic;">* Una vez realizado el pago, nuestro equipo administrativo validara la transaccion y recibiras el correo final con el enlace de acceso a la reunion.</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 15px; margin: 0; color: #334155;">Atentamente,</p>
                    <p style="font-size: 16px; font-weight: bold; margin: 5px 0 0 0; color: #0f172a;">Equipo de Ingreso y Consultoria</p>
                    <p style="font-size: 14px; margin: 0; color: #64748b;">Next Level Software Pro</p>
                </div>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
                <p style="font-size: 13px; color: #64748b; margin: 0;">© {year} FJ Digital Engineering. Excelencia en Software.</p>
            </div>
        </div>
        """
        
        send_email(
            booking.customer_email,
            f"Hemos recibido tu solicitud de asesoria - {booking.service_name}",
            body
        )
    except Exception as e:
        print(f"Error enviando alerta de pre-reserva al cliente: {e}")



def _load_service_or_404(session: Session, service_id: str) -> ServiceAdvisoryCard:
    parsed_id = _parse_service_id(service_id)
    service = session.get(ServiceAdvisoryCard, parsed_id)
    if not service or not service.active:
        raise HTTPException(status_code=404, detail="Servicio de asesoria no encontrado.")
    return service


def _build_available_slots(
    session: Session,
    date_str: str,
    service: ServiceAdvisoryCard,
) -> List[str]:
    target_date = _validate_iso_date(date_str)
    weekday = target_date.weekday()  # 0 Monday ... 6 Sunday

    weekly_row = session.exec(
        select(AdvisoryWeeklyAvailability).where(AdvisoryWeeklyAvailability.weekday == weekday).limit(1)
    ).first()

    if not weekly_row or not weekly_row.enabled:
        return []

    start_time = _validate_hhmm(weekly_row.start_time)
    end_time = _validate_hhmm(weekly_row.end_time)
    start_min = _to_minutes(start_time)
    end_min = _to_minutes(end_time)
    if end_min <= start_min:
        return []

    duration = _parse_duration_minutes(service.duration)
    step = 30

    blocked_rows = session.exec(
        select(AdvisoryBlockedSlot).where(
            AdvisoryBlockedSlot.date == date_str,
            AdvisoryBlockedSlot.active == True,  # noqa: E712
        )
    ).all()
    blocked_times = {_validate_hhmm(item.time) for item in blocked_rows}

    booked_rows = session.exec(
        select(AdvisoryBooking).where(
            AdvisoryBooking.date == date_str,
            AdvisoryBooking.status != "cancelled",
        )
    ).all()
    booked_times = {_validate_hhmm(item.time) for item in booked_rows}

    now = datetime.now()
    is_today = target_date.date() == now.date()
    now_minutes = now.hour * 60 + now.minute

    slots: List[str] = []
    for minute in range(start_min, end_min + 1, step):
        if minute + duration > end_min:
            continue

        hhmm = _to_hhmm(minute)
        if hhmm in blocked_times or hhmm in booked_times:
            continue
        if is_today and minute <= now_minutes:
            continue
        slots.append(hhmm)

    return slots


@router.get("/asesoria/services", response_model=List[AdvisoryServicePublic])
def get_public_advisory_services(session: Session = Depends(get_session)):
    rows = session.exec(
        select(ServiceAdvisoryCard)
        .where(ServiceAdvisoryCard.active == True)  # noqa: E712
        .order_by(ServiceAdvisoryCard.order_index, ServiceAdvisoryCard.id)
    ).all()

    result: List[AdvisoryServicePublic] = []
    for item in rows:
        highlights = _parse_json_list(item.includes)
        result.append(
            AdvisoryServicePublic(
                id=str(item.id),
                name=item.title,
                duration_min=_parse_duration_minutes(item.duration),
                price_clp=_parse_price_clp(item.price),
                highlights=highlights[:6],
                active=bool(item.active),
            )
        )
    return result


@router.get("/asesoria/availability", response_model=AvailabilityResponse)
def get_advisory_availability(
    date: str = Query(..., description="YYYY-MM-DD"),
    service_id: str = Query(...),
    session: Session = Depends(get_session),
):
    service = _load_service_or_404(session, service_id)
    slots = _build_available_slots(session, date, service)
    return AvailabilityResponse(slots=slots, timezone=TIMEZONE_LABEL)


@router.get("/asesoria/providers", response_model=List[MeetingProviderPublic])
def get_advisory_providers():
    result: List[MeetingProviderPublic] = []
    for provider in sorted(ALLOWED_MEETING_PROVIDERS):
        result.append(
            MeetingProviderPublic(
                id=provider,
                label=PROVIDER_LABELS.get(provider, provider),
                enabled=provider_is_configured(provider),
            )
        )
    return result


@router.post("/asesoria/bookings", response_model=BookingCreateResponse)
def create_advisory_booking(payload: BookingCreatePayload, session: Session = Depends(get_session)):
    service = _load_service_or_404(session, payload.service_id)
    target_date = _validate_iso_date(payload.date)
    hhmm = _validate_hhmm(payload.time)
    duration_min = _parse_duration_minutes(service.duration)

    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="El nombre es obligatorio.")
    if not payload.email.strip():
        raise HTTPException(status_code=400, detail="El email es obligatorio.")
    if not payload.phone.strip():
        raise HTTPException(status_code=400, detail="El telefono es obligatorio.")
    if len(payload.notes.strip()) < 8:
        raise HTTPException(status_code=400, detail="El motivo debe tener al menos 8 caracteres.")

    provider = str(payload.meeting_provider or "google_meet").strip().lower()
    if provider not in ALLOWED_MEETING_PROVIDERS:
        raise HTTPException(status_code=400, detail="Plataforma invalida. Usa Google Meet o Teams.")
    if not provider_is_configured(provider):
        raise HTTPException(status_code=400, detail=f"La plataforma {PROVIDER_LABELS.get(provider, provider)} no esta configurada en backend.")

    from zoneinfo import ZoneInfo
    now = datetime.now(ZoneInfo(TIMEZONE_LABEL))
    slot_minutes = _to_minutes(hhmm)
    
    # Comparamos fechas de forma precisa (usando .date() de la zona horaria de Chile)
    if target_date.date() < now.date():
        raise HTTPException(status_code=400, detail="No puedes reservar en fechas pasadas.")
    if target_date.date() == now.date() and slot_minutes <= (now.hour * 60 + now.minute):
        raise HTTPException(status_code=400, detail="No puedes reservar horarios pasados.")

    available_slots = _build_available_slots(session, payload.date, service)
    if hhmm not in available_slots:
        raise HTTPException(status_code=409, detail="Ese horario ya no esta disponible.")

    # Validar horas mínimas de anticipación desde GlobalSettings
    min_advance_str = get_setting_value(session, "booking_min_advance_hours", "2")
    try:
        min_advance_hours = int(min_advance_str)
    except ValueError:
        min_advance_hours = 2

    if target_date.date() == now.date():
        if slot_minutes < (now.hour * 60 + now.minute + (min_advance_hours * 60)):
            raise HTTPException(
                status_code=400, 
                detail=f"Las reservas requieren al menos {min_advance_hours} horas de anticipación."
            )

    booking_code = _generate_booking_code(session)
    
    meeting_result = provision_meeting(
        MeetingProvisionRequest(
            booking_code=booking_code,
            provider=provider,
            service_name=service.title,
            customer_name=payload.name.strip(),
            customer_email=payload.email.strip(),
            notes=payload.notes.strip(),
            date=payload.date,
            time=hhmm,
            duration_min=duration_min,
        )
    )

    reminders = payload.reminders if isinstance(payload.reminders, dict) else {}
    
    # Prioridad: Configuracion Global de Auto-Confirmacion
    auto_confirm = get_setting_value(session, "booking_auto_confirm", "true") == "true"
    price_clp = _parse_price_clp(service.price)
    is_paid_service = price_clp > 0
    
    status = meeting_result.status if meeting_result.status in ALLOWED_STATUSES else "pending"
    
    # Si requiere pago, o auto_confirm esta apagado, queda en pending
    if not auto_confirm or is_paid_service:
        status = "pending"
        
    booking = AdvisoryBooking(
        booking_code=booking_code,
        service_id=service.id,
        service_name=service.title,
        date=payload.date,
        time=hhmm,
        customer_name=payload.name.strip(),
        customer_email=payload.email.strip(),
        customer_phone=payload.phone.strip(),
        company=(payload.company or "").strip() or None,
        notes=payload.notes.strip(),
        meeting_provider=provider,
        reminders_h24=bool(reminders.get("h24", True)),
        reminders_h1=bool(reminders.get("h1", True)),
        status=status,
        meeting_link=meeting_result.meeting_link,
        created_at=now,
    )

    session.add(booking)
    session.flush() # Asegurar ID disponible
    
    # Historial de comunicación inicial (CRM)
    initial_comm = LeadCommunication(
        lead_id=booking.id,
        lead_type="advisory",
        sender="client",
        content=f"Reserva de Asesoría: {booking.service_name} confirmada para el {booking.date} a las {booking.time}. Notas: {booking.notes}",
        channel="email",
        direction="incoming"
    )
    session.add(initial_comm)
    
    # Persistencia en motor de Leads (LeadContactOverride)
    if booking.customer_email and booking.customer_phone:
        email_norm = str(booking.customer_email).strip().lower()
        existing_lead = session.exec(
            select(LeadContactOverride).where(LeadContactOverride.email == email_norm)
        ).first()
        if existing_lead:
            existing_lead.phone = booking.customer_phone
            existing_lead.updated_at = datetime.utcnow()
        else:
            new_lead = LeadContactOverride(
                email=email_norm,
                phone=booking.customer_phone,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(new_lead)
            
    session.commit()
    session.refresh(booking)

    # Añadir al Calendario automáticamente
    try:
        cal_event = CalendarEvent(
            date=booking.date,
            title=f"Asesoría: {booking.customer_name}",
            description=f"Servicio: {booking.service_name} | Tel/Mail: {booking.customer_phone} - {booking.customer_email} | Ver en Asesorías Dashboard para más detalle.",
            type="important",
            time=booking.time,
            is_auto_generated=True,
            related_booking_code=booking.booking_code
        )
        session.add(cal_event)
        session.commit()
    except Exception as e:
        print(f"Error creating calendar event: {str(e)}")

    # ALERTA INMEDIATA AL ADMIN (Siempre se envia al backoffice para control)
    _send_admin_new_booking_alert(booking, is_paid_service)

    # Trigger System Notification (Senior Feature)
    try:
        new_notif = SystemNotification(
            title="Nueva Asesoría Solicitada",
            message=f"{booking.customer_name} ha reservado una sesión de {booking.service_name}.",
            type="info",
            link="/admin/advisories"
        )
        session.add(new_notif)
        session.commit()
    except Exception as e:
        print(f"Error creating notification for booking: {str(e)}")

    response_message = meeting_result.detail or "Reserva pre-creada correctamente."
    
    # Solo enviar correo generico de confirmacion con EL LINK DE GOOGLE MEET
    if not is_paid_service and auto_confirm:
        email_sent = _send_booking_confirmation_email(booking)
        if email_sent:
            response_message = f"{response_message} Enviamos confirmacion por correo."
        else:
            response_message = f"{response_message} Reserva creada, pero el correo automatico no pudo enviarse."
    # Notificar
    if status == "pending":
        _send_client_pending_alert(booking, is_paid=is_paid_service, session=session)

        if is_paid_service:
             response_message = f"{response_message} Falta completar el pago."
        else:
             response_message = f"{response_message} Esperando confirmacion manual del administrador."

    return BookingCreateResponse(
        booking_id=booking.booking_code,
        status=booking.status,
        meeting_link=booking.meeting_link if not is_paid_service else None,
        message=response_message,
    )


@router.post("/asesoria/bookings/{booking_id}/confirm-payment")
def confirm_booking_payment(
    booking_id: str,
    session: Session = Depends(get_session)
):
    """
    Endpoint para que el frontend marque como completado exitosamente tras volver de Stripe.
    Manda el correo de confirmacion con el link de la reunion.
    """
    booking = session.exec(select(AdvisoryBooking).where(AdvisoryBooking.booking_code == booking_id).limit(1)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")
    
    if booking.status == "confirmed":
        return {"ok": True, "message": "Ya estaba confirmada."}
        
    booking.status = "confirmed"
    booking.updated_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    email_sent = _send_booking_confirmation_email(booking)
    return {"ok": True, "email_sent": email_sent, "message": "Reserva confirmada y correo enviado."}


@router.get("/admin/bookings", response_model=List[AdminBookingResponse])
def get_admin_bookings(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    rows = session.exec(select(AdvisoryBooking).order_by(AdvisoryBooking.created_at.desc())).all()
    return [
        AdminBookingResponse(
            id=item.booking_code,
            service_id=item.service_id,
            service_name=item.service_name,
            customer_name=item.customer_name,
            customer_email=item.customer_email,
            customer_phone=item.customer_phone,
            date=item.date,
            time=item.time,
            status=item.status,
            meeting_provider=item.meeting_provider,
            meeting_link=item.meeting_link,
            reminders_h24=bool(item.reminders_h24),
            reminders_h1=bool(item.reminders_h1),
            reminder_h24_sent_at=item.reminder_h24_sent_at.isoformat() if item.reminder_h24_sent_at else None,
            reminder_h1_sent_at=item.reminder_h1_sent_at.isoformat() if item.reminder_h1_sent_at else None,
            created_at=item.created_at.isoformat() if item.created_at else None,
        )
        for item in rows
    ]


@router.patch("/admin/bookings/{booking_id}")
def patch_admin_booking_status(
    booking_id: str,
    payload: BookingStatusUpdatePayload,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    next_status = str(payload.status or "").strip().lower()
    if next_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Estado invalido.")
    if next_status == "rescheduled":
        raise HTTPException(
            status_code=400,
            detail="Usa /api/admin/bookings/{booking_id}/reschedule para reprogramar con fecha y hora real.",
        )

    booking = session.exec(select(AdvisoryBooking).where(AdvisoryBooking.booking_code == booking_id).limit(1)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")

    old_status = booking.status
    booking.status = next_status
    booking.updated_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)

    if old_status == "pending" and next_status == "confirmed":
        _send_booking_confirmation_email(booking)

    return {"ok": True, "id": booking.booking_code, "status": booking.status}


@router.delete("/admin/bookings/{booking_id}")
def delete_admin_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    booking = session.exec(select(AdvisoryBooking).where(AdvisoryBooking.booking_code == booking_id).limit(1)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")

    deleted_id = booking.booking_code
    session.delete(booking)
    session.commit()
    return {"ok": True, "id": deleted_id, "deleted": True}


@router.post("/admin/bookings/{booking_id}/reschedule")
def reschedule_admin_booking(
    booking_id: str,
    payload: RescheduleBookingPayload,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    booking = session.exec(select(AdvisoryBooking).where(AdvisoryBooking.booking_code == booking_id).limit(1)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")

    target_date = _validate_iso_date(payload.date)
    hhmm = _validate_hhmm(payload.time)
    now = datetime.now()
    slot_minutes = _to_minutes(hhmm)
    if target_date.date() < now.date():
        raise HTTPException(status_code=400, detail="No puedes reagendar a fechas pasadas.")
    if target_date.date() == now.date() and slot_minutes <= (now.hour * 60 + now.minute):
        raise HTTPException(status_code=400, detail="No puedes reagendar a horarios pasados.")

    provider = str(payload.meeting_provider or booking.meeting_provider or "google_meet").strip().lower()
    if provider not in ALLOWED_MEETING_PROVIDERS:
        raise HTTPException(status_code=400, detail="Plataforma invalida. Usa Google Meet o Teams.")
    if not provider_is_configured(provider):
        raise HTTPException(
            status_code=400,
            detail=f"La plataforma {PROVIDER_LABELS.get(provider, provider)} no esta configurada en backend.",
        )

    service = None
    if booking.service_id:
        service = session.get(ServiceAdvisoryCard, booking.service_id)
    if not service:
        service = session.exec(
            select(ServiceAdvisoryCard)
            .where(ServiceAdvisoryCard.title == booking.service_name, ServiceAdvisoryCard.active == True)  # noqa: E712
            .limit(1)
        ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio asociado a la reserva no encontrado.")

    same_slot = booking.date == payload.date and booking.time == hhmm
    available_slots = _build_available_slots(session, payload.date, service)
    if not same_slot and hhmm not in available_slots:
        raise HTTPException(status_code=409, detail="El horario seleccionado no esta disponible para reagendar.")

    duration_min = _parse_duration_minutes(service.duration)
    meeting_result = provision_meeting(
        MeetingProvisionRequest(
            booking_code=booking.booking_code,
            provider=provider,
            service_name=booking.service_name,
            customer_name=booking.customer_name,
            customer_email=booking.customer_email,
            notes=(payload.notes or booking.notes or "").strip(),
            date=payload.date,
            time=hhmm,
            duration_min=duration_min,
        )
    )

    booking.date = payload.date
    booking.time = hhmm
    booking.meeting_provider = provider
    booking.meeting_link = meeting_result.meeting_link
    booking.status = "rescheduled"
    if payload.notes is not None:
        booking.notes = payload.notes.strip() or booking.notes
    booking.updated_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)

    email_sent = False
    if payload.notify_client:
        email_sent = _send_booking_confirmation_email(booking)

    return {
        "ok": True,
        "id": booking.booking_code,
        "status": booking.status,
        "date": booking.date,
        "time": booking.time,
        "meeting_provider": booking.meeting_provider,
        "meeting_link": booking.meeting_link,
        "detail": meeting_result.detail,
        "email_sent": email_sent,
    }


@router.post("/admin/blocked-slots")
def create_blocked_slot(
    payload: BlockSlotPayload,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    _validate_iso_date(payload.date)
    hhmm = _validate_hhmm(payload.time)

    existing = session.exec(
        select(AdvisoryBlockedSlot).where(
            AdvisoryBlockedSlot.date == payload.date,
            AdvisoryBlockedSlot.time == hhmm,
            AdvisoryBlockedSlot.active == True,  # noqa: E712
        )
    ).first()
    if existing:
        return {"ok": True, "id": existing.id, "message": "Horario ya estaba bloqueado."}

    row = AdvisoryBlockedSlot(
        date=payload.date,
        time=hhmm,
        reason=(payload.reason or "").strip() or None,
        active=True,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return {
        "ok": True,
        "id": row.id,
        "date": row.date,
        "time": row.time,
        "reason": row.reason,
        "active": row.active,
    }


@router.get("/admin/blocked-slots", response_model=List[BlockedSlotPublic])
def get_admin_blocked_slots(
    active_only: bool = Query(True),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    statement = select(AdvisoryBlockedSlot)
    if active_only:
        statement = statement.where(AdvisoryBlockedSlot.active == True)  # noqa: E712
    if date_from:
        _validate_iso_date(date_from)
        statement = statement.where(AdvisoryBlockedSlot.date >= date_from)
    if date_to:
        _validate_iso_date(date_to)
        statement = statement.where(AdvisoryBlockedSlot.date <= date_to)

    rows = session.exec(statement.order_by(AdvisoryBlockedSlot.date.desc(), AdvisoryBlockedSlot.time.desc())).all()
    return [
        BlockedSlotPublic(
            id=item.id or 0,
            date=item.date,
            time=item.time,
            reason=item.reason,
            active=bool(item.active),
            created_at=item.created_at.isoformat() if item.created_at else None,
        )
        for item in rows
    ]


@router.delete("/admin/blocked-slots/{slot_id}")
def delete_admin_blocked_slot(
    slot_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    row = session.get(AdvisoryBlockedSlot, slot_id)
    if not row:
        raise HTTPException(status_code=404, detail="Bloqueo no encontrado.")

    row.active = False
    session.add(row)
    session.commit()
    return {"ok": True, "id": slot_id}


@router.get("/admin/weekly-availability")
def get_weekly_availability(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    rows = session.exec(select(AdvisoryWeeklyAvailability).order_by(AdvisoryWeeklyAvailability.weekday)).all()
    return [
        {
            "weekday": item.weekday,
            "enabled": bool(item.enabled),
            "start_time": item.start_time,
            "end_time": item.end_time,
        }
        for item in rows
    ]


@router.put("/admin/weekly-availability")
def update_weekly_availability(
    payload: WeeklyAvailabilityUpdatePayload,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    if not payload.days:
        raise HTTPException(status_code=400, detail="Debes enviar al menos un dia.")

    for day in payload.days:
        if day.weekday < 0 or day.weekday > 6:
            raise HTTPException(status_code=400, detail="weekday debe estar entre 0 y 6.")
        start_time = _validate_hhmm(day.start_time)
        end_time = _validate_hhmm(day.end_time)

        row = session.exec(
            select(AdvisoryWeeklyAvailability)
            .where(AdvisoryWeeklyAvailability.weekday == day.weekday)
            .limit(1)
        ).first()

        if not row:
            row = AdvisoryWeeklyAvailability(
                weekday=day.weekday,
                enabled=day.enabled,
                start_time=start_time,
                end_time=end_time,
                updated_at=datetime.utcnow(),
            )
        else:
            row.enabled = day.enabled
            row.start_time = start_time
            row.end_time = end_time
            row.updated_at = datetime.utcnow()

        session.add(row)

    session.commit()
    return {"ok": True}


@router.get("/admin/reminders/status")
def get_admin_reminders_status(
    current_user=Depends(require_admin),
):
    return get_reminder_runtime_status()


@router.post("/admin/reminders/run-now", response_model=ReminderRunResponse)
def run_admin_reminders_now(
    current_user=Depends(require_admin),
):
    result = process_due_advisory_reminders()
    return ReminderRunResponse(ok=True, **result)


@router.post("/admin/resend-confirmation")
def resend_booking_confirmation(
    payload: ResendConfirmationPayload,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    booking = session.exec(
        select(AdvisoryBooking).where(AdvisoryBooking.booking_code == payload.booking_id).limit(1)
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")

    sent = _send_booking_confirmation_email(booking)
    if not sent:
        raise HTTPException(status_code=500, detail="No se pudo enviar el correo de confirmacion.")

    return {"ok": True, "message": f"Confirmacion reenviada para {booking.booking_code}."}
