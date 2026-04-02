import psycopg2
import os
from dotenv import load_dotenv

# Localizar .env de forma absoluta
env_path = r"c:\Users\favio\PORTAFOLIO-WEBFJ-NEW\backend-py\.env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate_postgresql():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in .env")
        return

    print(f"Connecting to PostgreSQL: {DATABASE_URL}...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check current columns
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'lead_communication'
        """)
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Current columns in PostgreSQL lead_communication: {columns}")
        
        if 'status' not in columns:
            print("Adding 'status' column to PostgreSQL...")
            cursor.execute("ALTER TABLE lead_communication ADD COLUMN status VARCHAR(50) DEFAULT 'active';")
            print("Column 'status' added successfully to PostgreSQL.")
        else:
            print("Column 'status' already exists in PostgreSQL.")
            
        # Ensure 'active' for existing NULLs
        cursor.execute("UPDATE lead_communication SET status = 'active' WHERE status IS NULL;")
        print("Updated records to 'active'.")
        
        cursor.close()
        conn.close()
        print("PostgreSQL Migration Complete.")
    except Exception as e:
        print(f"Error migrating PostgreSQL: {e}")

if __name__ == "__main__":
    migrate_postgresql()
