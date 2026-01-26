from sqlalchemy import text
import sys
import os

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine

def migrate():
    print("Iniciando migración de esquema...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS description VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS icon VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS level VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS color VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS badge VARCHAR"))
            conn.commit()
            print("✅ Columnas añadidas con éxito (o ya existían).")
        except Exception as e:
            print(f"❌ Error durante la migración: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
