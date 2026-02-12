from sqlmodel import Session, create_engine, text
import os
from dotenv import load_dotenv

# Cargar variables de entorno si es necesario
load_dotenv()

# Obtener URL de base de datos del entorno o usar la conocida
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portfolio_db")

engine = create_engine(DATABASE_URL)

def migrate():
    with Session(engine) as session:
        print("Iniciando migración de base de datos...")
        
        # 1. Agregar columnas a contact
        try:
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS whatsapp TEXT"))
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS facebook TEXT"))
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS instagram TEXT"))
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS twitter TEXT"))
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS tiktok TEXT"))
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS hero_image TEXT"))
            session.execute(text("ALTER TABLE contact ADD COLUMN IF NOT EXISTS hero_video TEXT"))
            print("Columnas de redes sociales y hero añadidas o ya existentes en 'contact'.")
        except Exception as e:
            print(f"Error al actualizar tabla 'contact': {e}")
        
        # Actualizar tabla media
        try:
            session.execute(text("ALTER TABLE media ADD COLUMN IF NOT EXISTS description TEXT"))
            session.execute(text("ALTER TABLE media ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0"))
            print("Columnas faltantes añadidas o ya existentes en 'media'.")
        except Exception as e:
            print(f"Error al actualizar tabla 'media': {e}")

        # 2. Crear tabla media
        try:
            session.execute(text("""
                CREATE TABLE IF NOT EXISTS media (
                    id SERIAL PRIMARY KEY,
                    title TEXT,
                    description TEXT,
                    type TEXT DEFAULT 'image',
                    url TEXT NOT NULL,
                    order_index INTEGER DEFAULT 0,
                    active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("Tabla 'media' creada o ya existente.")
        except Exception as e:
            print(f"Error al crear tabla 'media': {e}")
            
        session.commit()
        print("Migración completada con éxito.")

if __name__ == "__main__":
    migrate()
