import os
import sys
# Añadir el path del proyecto para importar app
sys.path.append(os.getcwd())

from app.core.email_sync import sync_emails
from app.db import engine
from sqlmodel import Session

def run_sync():
    print("Iniciando sincronización manual de reparación...")
    try:
        # sync_emails() ya maneja la sesión de base de datos internamente si está bien configurada
        sync_emails()
        print("Sincronización finalizada exitosamente.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error en sincronización: {e}")

if __name__ == "__main__":
    run_sync()
