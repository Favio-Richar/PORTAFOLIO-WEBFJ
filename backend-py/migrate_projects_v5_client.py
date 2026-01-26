import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")
engine = create_engine(DATABASE_URL)

def migrate():
    print(f"Connecting to {DATABASE_URL}...")
    with engine.connect() as conn:
        print("Checking if 'client_name' exists in 'proyecto'...")
        # Add column if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE proyecto ADD COLUMN client_name VARCHAR"))
            conn.commit()
            print("✅ Column 'client_name' added successfully.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("ℹ️ Column 'client_name' already exists.")
            else:
                print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate()
