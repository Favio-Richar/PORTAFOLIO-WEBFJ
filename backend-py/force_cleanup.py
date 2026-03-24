from sqlmodel import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")
engine = create_engine(DATABASE_URL)

def drop_tables():p
    with engine.connect() as conn:
        conn.execute(text("COMMIT"))
        inspector_query = text("SELECT tablename FROM pg_tables WHERE schemaname='public'")
        tables = conn.execute(inspector_query).fetchall()
        
        for t in tables:
            table_name = t[0]
            if table_name not in ['user', 'ad', 'alembic_version']:
                print(f"Dropping {table_name}...")
                conn.execute(text(f"DROP TABLE IF EXISTS \"{table_name}\" CASCADE;"))
                
        conn.commit()

if __name__ == "__main__":
    drop_tables()
