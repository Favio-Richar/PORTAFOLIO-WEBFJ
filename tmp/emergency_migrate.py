import sqlite3
import os

DB_PATH = 'backend-py/portfolio.db'

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check current columns in lead_communication
        cursor.execute("PRAGMA table_info(lead_communication)")
        columns = [c[1] for c in cursor.fetchall()]
        print(f"Current columns in lead_communication: {columns}")
        
        if 'status' not in columns:
            print("Adding 'status' column...")
            cursor.execute("ALTER TABLE lead_communication ADD COLUMN status VARCHAR DEFAULT 'active';")
            print("Column 'status' added successfully.")
        else:
            print("Column 'status' already exists.")
            
        # Ensure all records have 'active' status
        print("Setting default 'active' status to existing records...")
        cursor.execute("UPDATE lead_communication SET status = 'active' WHERE status IS NULL;")
        
        conn.commit()
        print("Migration complete.")
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
