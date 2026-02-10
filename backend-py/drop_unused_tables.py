import sys
import os
from sqlmodel import create_engine, text

# Add current directory to path
sys.path.append(os.getcwd())

from app.db import DATABASE_URL

def drop_tables():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Cleaning up database (Removing unused tables)...")
        
        # Tables to drop explicitly
        tables_to_drop = ["blog", "education", "certification"]
        
        for table in tables_to_drop:
            try:
                print(f"Dropping table: {table}...")
                # Note: For Postgres, we might need CASCADE if there are constraints, 
                # but these should be independent.
                conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
                print(f"Table {table} dropped.")
            except Exception as e:
                print(f"Error dropping {table}: {e}")
                
        conn.commit()
        print("Cleanup complete. Unused tables removed.")

if __name__ == "__main__":
    drop_tables()
