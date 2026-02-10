import os
from dotenv import load_dotenv
import resend

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
# Usaremos el email que el usuario tiene en el .env
TO_EMAIL = os.getenv("EMAIL_RECEIVER", "favio4515@gmail.com")

print(f"DEBUG: Using API KEY: {RESEND_API_KEY[:10]}...")
print(f"DEBUG: From: {EMAIL_FROM}")
print(f"DEBUG: To: {TO_EMAIL}")

if not RESEND_API_KEY:
    print("❌ ERROR: RESEND_API_KEY no encontrada en .env")
    exit(1)

resend.api_key = RESEND_API_KEY

try:
    params = {
        "from": EMAIL_FROM,
        "to": [TO_EMAIL],
        "subject": "Prueba de Diagnóstico - Resend",
        "html": "<h1>Si puedes leer esto, Resend está funcionando correctamente.</h1>"
    }
    print("Enviando...")
    r = resend.Emails.send(params)
    print(f"✅ Éxito: {r}")
except Exception as e:
    print(f"❌ FALLÓ: {e}")
