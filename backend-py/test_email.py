from dotenv import load_dotenv
import os
load_dotenv(override=True)

from app.core.email import send_email

print("Testing email sending...")
result = send_email(
    to_email="favio4515@gmail.com",
    subject="Prueba de Sistema - Portafolio",
    body="<h1>Hola Favio</h1><p>Esta es una prueba del sistema de correos.</p>"
)

if result:
    print("Email Sent Successfully!")
else:
    print("Email Failed to send. Check console output above.")
