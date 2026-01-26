from sqlalchemy import text
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine

def migrate():
    print("Iniciando migración forzada de esquema...")
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS description VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS icon VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS level VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS color VARCHAR"))
            conn.execute(text("ALTER TABLE certification ADD COLUMN IF NOT EXISTS badge VARCHAR"))
            print("✅ Comandos ejecutados.")
    except Exception as e:
        print(f"❌ Error durante la migración forzada: {e}")

if __name__ == "__main__":
    migrate()
