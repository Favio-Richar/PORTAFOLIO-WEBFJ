from sqlmodel import create_engine, text
import os

# Usar la misma URL que en .env
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/portafolio-web"
engine = create_engine(DATABASE_URL)

def list_tables():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = result.fetchall()
    with open("tables_utf8.txt", "w", encoding="utf-8") as f:
        f.write(f"Total tables found: {len(tables)}\n")
        for table in tables:
            f.write(f"- {table[0]}\n")

if __name__ == "__main__":
    list_tables()
