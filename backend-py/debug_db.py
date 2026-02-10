from sqlalchemy import inspect, text
from app.db import engine, init_db
from sqlmodel import Session, select
from app.models import User

def debug_db():
    try:
        print("Checking tables...")
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Existing tables: {tables}")
        
        print("Running init_db()...")
        init_db()
        print("init_db() finished.")
        
        tables_after = inspector.get_table_names()
        print(f"Tables after init: {tables_after}")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    debug_db()
