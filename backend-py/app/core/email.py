import logging
import os
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

import resend

logger = logging.getLogger(__name__)


@dataclass
class EmailSendResult:
    ok: bool
    provider_message_id: Optional[str] = None
    error: Optional[str] = None


def _extract_provider_message_id(response: Any) -> Optional[str]:
    if isinstance(response, str):
        return response.strip() or None
    if isinstance(response, dict):
        for key in ("id", "message_id", "messageId"):
            value = response.get(key)
            if value:
                return str(value)
    return None


def send_email_with_result(to_email: str, subject: str, body: str) -> EmailSendResult:
    resend_api_key = str(os.getenv("RESEND_API_KEY", "")).strip()
    email_from = str(os.getenv("EMAIL_FROM", "onboarding@resend.dev")).strip()
    max_attempts = max(1, int(str(os.getenv("EMAIL_SEND_MAX_ATTEMPTS", "2")).strip() or "2"))
    retry_backoff_ms = max(0, int(str(os.getenv("EMAIL_SEND_RETRY_BACKOFF_MS", "700")).strip() or "700"))

    if not resend_api_key:
        error = "RESEND_API_KEY no configurado."
        logger.warning(error)
        return EmailSendResult(ok=False, error=error)

    resend.api_key = resend_api_key
    last_error: Optional[str] = None

    for attempt in range(1, max_attempts + 1):
        try:
            params = {
                "from": email_from,
                "to": [to_email],
                "subject": subject,
                "html": body,
            }
            response = resend.Emails.send(params)
            provider_message_id = _extract_provider_message_id(response)
            logger.info(
                "Email enviado",
                extra={
                    "email_to": to_email,
                    "subject": subject,
                    "provider_message_id": provider_message_id,
                    "attempt": attempt,
                },
            )
            return EmailSendResult(ok=True, provider_message_id=provider_message_id)
        except Exception as exc:
            last_error = str(exc)
            logger.error(
                "Error enviando email",
                extra={
                    "email_to": to_email,
                    "subject": subject,
                    "attempt": attempt,
                    "max_attempts": max_attempts,
                    "error": last_error,
                },
            )
            if attempt < max_attempts and retry_backoff_ms > 0:
                time.sleep(retry_backoff_ms / 1000.0)

    error_msg = f"Fallo envio a {to_email}: {last_error or 'error desconocido'}"
    with open("email_errors.log", "a", encoding="utf-8") as file:
        file.write(f"{datetime.utcnow().isoformat()} | {error_msg}\n")
    return EmailSendResult(ok=False, error=last_error or "Error desconocido")


def send_email(to_email: str, subject: str, body: str) -> bool:
    return send_email_with_result(to_email=to_email, subject=subject, body=body).ok


def send_reset_password_email(to_email: str, code: str):
    subject = "Codigo de Recuperacion - Portafolio Admin"
    body = f"""
    <h1>Recuperacion de Contrasena</h1>
    <p>Has solicitado restablecer tu contrasena.</p>
    <p>Tu codigo de verificacion es: <strong>{code}</strong></p>
    <p>Este codigo expirara en 15 minutos.</p>
    <br>
    <p>Si no solicitaste esto, ignora este correo.</p>
    """
    return send_email(to_email, subject, body)
