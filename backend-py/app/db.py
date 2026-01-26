import os
from sqlmodel import SQLModel, create_engine

# IMPORTANTE: Importar todos los modelos para que SQLModel los registre
from app.models import (
    Blog, Proyecto, Cliente, Cotizacion, Service,
    Profile, Experience, Education, Timeline, Certification, Contact
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")

# For initial scaffold we use a regular (sync) engine. For high-load production consider
# async engine + async sessions and connection pool tuning.
engine = create_engine(DATABASE_URL, echo=True)  # echo=True para ver SQL

def init_db():
    """Crear todas las tablas definidas en los modelos"""
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas creadas en PostgreSQL")
