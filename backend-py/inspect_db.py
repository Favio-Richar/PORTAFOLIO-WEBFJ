from sqlalchemy import text
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine

def inspect_all():
    with engine.connect() as conn:
        print("--- TABLAS ---")
        tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        for t in tables:
            print(f"Table: {t[0]}")
            print("  Columns:")
            cols = conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t[0]}'"))
            for c in cols:
                print(f"    - {c[0]} ({c[1]})")

if __name__ == "__main__":
    inspect_all()
