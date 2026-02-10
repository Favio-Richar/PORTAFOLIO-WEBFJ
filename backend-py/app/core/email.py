import os
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def send_email(to_email: str, subject: str, body: str):
    if not RESEND_API_KEY:
        print("Warning: Resend API Key not configured.")
        return False

    try:
        params = {
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": body,
        }

        email = resend.Emails.send(params)
        print(f"Email sent: {email}")
        return True
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
        return False

def send_reset_password_email(to_email: str, code: str):
    subject = "Código de Recuperación - Portafolio Admin"
    body = f"""
    <h1>Recuperación de Contraseña</h1>
    <p>Has solicitado restablecer tu contraseña.</p>
    <p>Tu código de verificación es: <strong>{code}</strong></p>
    <p>Este código expirará en 15 minutos.</p>
    <br>
    <p>Si no solicitaste esto, ignora este correo.</p>
    """
    return send_email(to_email, subject, body)
