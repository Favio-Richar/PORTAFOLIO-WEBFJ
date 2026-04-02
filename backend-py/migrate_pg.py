import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Re-intentar cargar entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def run_migration():
    print(f"Connecting to: {DATABASE_URL.split('@')[-1]}") # Log safe URL parts
    
    queries = [
        "ALTER TABLE direct_inquiry ADD COLUMN IF NOT EXISTS html_content TEXT",
        "ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS html_content TEXT",
        "ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS subject TEXT"
    ]
    
    try:
        with engine.begin() as conn:
            for q in queries:
                try:
                    conn.execute(text(q))
                    print(f"Success: {q}")
                except Exception as inner_e:
                    print(f"Notice (might already exist): {inner_e}")
        print("\nMigration Completed Successfully.")
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
