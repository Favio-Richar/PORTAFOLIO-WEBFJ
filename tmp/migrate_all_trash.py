import psycopg2
import os
from dotenv import load_dotenv

env_path = r"c:\Users\favio\PORTAFOLIO-WEBFJ-NEW\backend-py\.env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate_all_tables():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in .env")
        return

    print(f"Connecting to PostgreSQL: {DATABASE_URL}...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        tables = ['quote', 'advisory_booking', 'direct_inquiry', 'lead_communication']
        
        for table in tables:
            # Check current columns
            cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
            columns = [row[0] for row in cursor.fetchall()]
            
            if 'status' not in columns:
                print(f"Adding 'status' column to {table}...")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN status VARCHAR(50) DEFAULT 'active';")
            else:
                print(f"Column 'status' already exists in {table}.")
            
            # Update NULL status to 'active' for existing records
            cursor.execute(f"UPDATE {table} SET status = 'active' WHERE status IS NULL;")
            
        cursor.close()
        conn.close()
        print("All tables successfully migrated to support the Trash System.")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate_all_tables()
