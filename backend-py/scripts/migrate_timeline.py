from sqlalchemy import text
from app.db import engine

def migrate():
    print("🚀 Iniciando migración de Timeline...")
    with engine.connect() as conn:
        # Añadir columna category si no existe
        conn.execute(text("ALTER TABLE timeline ADD COLUMN IF NOT EXISTS category VARCHAR;"))
        # Añadir columna icon si no existe
        conn.execute(text("ALTER TABLE timeline ADD COLUMN IF NOT EXISTS icon VARCHAR;"))
        conn.commit()
    print("✅ Migración completada: Columnas 'category' e 'icon' añadidas a la tabla 'timeline'.")

if __name__ == "__main__":
    migrate()
