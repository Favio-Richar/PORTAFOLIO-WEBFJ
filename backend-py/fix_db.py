import sys
import os

# Add current directory to sys.path to ensure imports work
sys.path.append(os.getcwd())

from sqlalchemy import inspect, text
from sqlmodel import SQLModel
from app.db import engine
# Import app.models to ensure all models are registered in SQLModel.metadata
import app.models

def cleanup_tables_keep_user():
    print("Starting database RESET (Keeping only 'user' table)...")
    
    # 1. Get all tables currently in the database
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    print(f"Existing tables in DB ({len(existing_tables)}): {sorted(list(existing_tables))}")

    # 2. Define tables to KEEP
    # We only want to keep the 'user' table. 
    # Note: 'alembic_version' is usually good to keep if using migrations, but user said "only user db". 
    # We will keep 'user' and 'alembic_version' (if exists) just in case, but prioritize user's request.
    # Actually, user said "only serve the user one".
    
    tables_to_keep = {'user', 'alembic_version'} 
    
    # 3. Identify tables to drop
    to_drop = existing_tables - tables_to_keep
    
    if not to_drop:
        print("\n✅ Database is clean! Only 'user' (and system tables) remain.")
        return

    print(f"\n⚠️  Found {len(to_drop)} tables to delete: {sorted(list(to_drop))}")
    print("These tables will be DELETED permanently.")

    # 4. Drop the tables
    with engine.connect() as conn:
        # Disable constraints momentarily if needed, but CASCADE should handle it.
        for table in to_drop:
            print(f"Dropping table: {table}")
            try:
                # CASCADE is crucial here in case 'user' relates to something else (unlikely parent) 
                # or these tables relate to each other.
                conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
                print(f"✅ Dropped: {table}")
            except Exception as e:
                print(f"❌ Error dropping {table}: {e}")
        conn.commit()
    
    print("\n✅ Reset complete. Only 'user' table remains.")

if __name__ == "__main__":
    cleanup_tables_keep_user()
