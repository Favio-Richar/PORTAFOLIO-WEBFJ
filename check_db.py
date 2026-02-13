
from sqlmodel import Session, create_url, create_engine, select
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portafolio.db")

# Si es postgres, asegurar driver psycopg2 compatible
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

try:
    from app.models import Proyecto
    with Session(engine) as session:
        statement = select(Proyecto)
        results = session.exec(statement).all()
        print(f"TOTAL_PROJECTS: {len(results)}")
        for p in results:
            print(f"ID: {p.id} | Title: {p.title} | Cat: {p.category}")
except Exception as e:
    print(f"ERROR: {e}")
