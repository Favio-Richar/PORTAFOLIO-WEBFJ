import logging
import os
import threading
from datetime import datetime
from typing import Any, Dict, Optional
from zoneinfo import ZoneInfo

from sqlmodel import Session, select

from app.core.email import send_email
from app.db import engine
from app.models import AdvisoryBooking

logger = logging.getLogger(__name__)

BOOKING_TIMEZONE = (os.getenv("BOOKING_TIMEZONE") or "America/Santiago").strip()
ACTIVE_BOOKING_STATUSES = {"pending", "confirmed", "rescheduled"}

_DEFAULT_WINDOW_MINUTES = 30
_DEFAULT_POLL_SECONDS = 300

_worker_lock = threading.Lock()
_worker_stop = threading.Event()
_worker_thread: Optional[threading.Thread] = None
_last_run_at: Optional[str] = None
_last_result: Optional[Dict[str, Any]] = None


def _parse_bool_env(name: str, default: bool = True) -> bool:
    raw = str(os.getenv(name, "true" if default else "false")).strip().lower()
    return raw not in {"0", "false", "no", "off"}


def _window_minutes() -> int:
    try:
        value = int(str(os.getenv("REMINDER_WINDOW_MINUTES", _DEFAULT_WINDOW_MINUTES)).strip())
        return max(5, min(value, 240))
    except ValueError:
        return _DEFAULT_WINDOW_MINUTES


def _poll_seconds() -> int:
    try:
        value = int(str(os.getenv("REMINDERS_POLL_SECONDS", _DEFAULT_POLL_SECONDS)).strip())
        return max(30, min(value, 3600))
    except ValueError:
        return _DEFAULT_POLL_SECONDS


def _is_automatic_enabled() -> bool:
    return _parse_bool_env("REMINDERS_AUTOMATIC_ENABLED", True)


def _parse_booking_start_local(booking: AdvisoryBooking) -> Optional[datetime]:
    try:
        return datetime.strptime(f"{booking.date} {booking.time}", "%Y-%m-%d %H:%M").replace(
            tzinfo=ZoneInfo(BOOKING_TIMEZONE)
        )
    except ValueError:
        return None


def _within_window(delta_minutes: float, target_minutes: int, window_minutes: int) -> bool:
    return (target_minutes - window_minutes) <= delta_minutes <= (target_minutes + window_minutes)


def _send_reminder_email(booking: AdvisoryBooking, hours_label: str) -> bool:
    if not booking.customer_email:
        return False

    meeting_html = (
        f"<p><strong>Enlace de reunion:</strong> <a href='{booking.meeting_link}'>{booking.meeting_link}</a></p>"
        if booking.meeting_link
        else "<p><strong>Enlace de reunion:</strong> pendiente de confirmacion. Contacta por WhatsApp.</p>"
    )
    body = f"""
    <h2>Recordatorio de asesoria</h2>
    <p>Hola {booking.customer_name}, este es un recordatorio de tu asesoria.</p>
    <p><strong>Codigo:</strong> {booking.booking_code}</p>
    <p><strong>Servicio:</strong> {booking.service_name}</p>
    <p><strong>Fecha:</strong> {booking.date}</p>
    <p><strong>Hora:</strong> {booking.time} ({BOOKING_TIMEZONE})</p>
    <p><strong>Recordatorio:</strong> {hours_label} antes</p>
    {meeting_html}
    """
    subject = f"Recordatorio asesoria {booking.booking_code} ({hours_label})"
    return bool(send_email(booking.customer_email, subject, body))


def process_due_advisory_reminders(now_local: Optional[datetime] = None) -> Dict[str, Any]:
    global _last_run_at, _last_result

    window_minutes = _window_minutes()
    now_dt = now_local.astimezone(ZoneInfo(BOOKING_TIMEZONE)) if now_local else datetime.now(ZoneInfo(BOOKING_TIMEZONE))
    result: Dict[str, Any] = {
        "run_at": now_dt.isoformat(),
        "automatic_enabled": _is_automatic_enabled(),
        "window_minutes": window_minutes,
        "scanned": 0,
        "sent_h24": 0,
        "sent_h1": 0,
        "errors": 0,
    }

    try:
        with Session(engine) as session:
            rows = session.exec(
                select(AdvisoryBooking).where(AdvisoryBooking.status.in_(ACTIVE_BOOKING_STATUSES))
            ).all()

            for booking in rows:
                result["scanned"] += 1
                starts_at = _parse_booking_start_local(booking)
                if not starts_at:
                    result["errors"] += 1
                    continue

                delta_minutes = (starts_at - now_dt).total_seconds() / 60.0
                if delta_minutes < -15:
                    # Reserva ya pasada
                    continue

                changed = False
                if (
                    booking.reminders_h24
                    and booking.reminder_h24_sent_at is None
                    and _within_window(delta_minutes, 1440, window_minutes)
                ):
                    if _send_reminder_email(booking, "24 horas"):
                        booking.reminder_h24_sent_at = datetime.utcnow()
                        booking.updated_at = datetime.utcnow()
                        changed = True
                        result["sent_h24"] += 1
                    else:
                        result["errors"] += 1

                if (
                    booking.reminders_h1
                    and booking.reminder_h1_sent_at is None
                    and _within_window(delta_minutes, 60, window_minutes)
                ):
                    if _send_reminder_email(booking, "1 hora"):
                        booking.reminder_h1_sent_at = datetime.utcnow()
                        booking.updated_at = datetime.utcnow()
                        changed = True
                        result["sent_h1"] += 1
                    else:
                        result["errors"] += 1

                if changed:
                    session.add(booking)

            session.commit()
    except Exception:
        logger.exception("Fallo proceso de recordatorios de asesoria")
        result["errors"] += 1

    _last_run_at = now_dt.isoformat()
    _last_result = result
    return result


def get_reminder_runtime_status() -> Dict[str, Any]:
    return {
        "automatic_enabled": _is_automatic_enabled(),
        "poll_seconds": _poll_seconds(),
        "window_minutes": _window_minutes(),
        "last_run_at": _last_run_at,
        "last_result": _last_result,
        "worker_running": bool(_worker_thread and _worker_thread.is_alive()),
    }


def _worker_loop():
    logger.info("Worker de recordatorios de asesoria iniciado")
    while not _worker_stop.is_set():
        try:
            process_due_advisory_reminders()
        except Exception:
            logger.exception("Error en ciclo de worker de recordatorios")
        _worker_stop.wait(_poll_seconds())
    logger.info("Worker de recordatorios de asesoria detenido")


def start_advisory_reminder_worker():
    global _worker_thread
    if not _is_automatic_enabled():
        logger.info("Recordatorios automaticos deshabilitados por REMINDERS_AUTOMATIC_ENABLED")
        return

    with _worker_lock:
        if _worker_thread and _worker_thread.is_alive():
            return
        _worker_stop.clear()
        _worker_thread = threading.Thread(target=_worker_loop, name="advisory-reminders", daemon=True)
        _worker_thread.start()


def stop_advisory_reminder_worker():
    _worker_stop.set()
