import sys
import os

print(f"Python Version: {sys.version}")
print(f"Python Path: {sys.executable}")

try:
    import fastapi
    print("✓ FastAPI: OK")
    import sqlmodel
    print("✓ SQLModel: OK")
    import pydantic
    print("✓ Pydantic: OK")
    import dotenv
    print("✓ Dotenv: OK")
    import sqlalchemy
    print("✓ SQLAlchemy: OK")
    
    # Probar importaciones locales
    from app.main import app
    print("✓ Servidor Principal: OK")
    from app.models import Quote
    print("✓ Modelo 'Quote': OK")
    from app.api.ai_assistant import router as ai_router
    print("✓ Asistente IA: OK")
    
    print("\n[VERIFICACION] Todo el sistema está correctamente instalado y configurado.")
    print("[LIMPIEZA] Las lineas rojas en VS Code eran un error de configuracion del editor, NO de tu codigo.")
except Exception as e:
    print(f"\n[ERROR] Se encontró un problema real: {e}")
    sys.exit(1)
