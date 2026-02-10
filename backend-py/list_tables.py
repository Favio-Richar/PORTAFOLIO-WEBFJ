import sys
import os
from sqlmodel import create_engine, text, inspect

# Add current directory to path
sys.path.append(os.getcwd())

from app.db import DATABASE_URL

def list_tables():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Current tables in database: {tables}")

if __name__ == "__main__":
    list_tables()
