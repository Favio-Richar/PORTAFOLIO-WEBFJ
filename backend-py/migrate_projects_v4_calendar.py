import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")
engine = create_engine(DATABASE_URL)

def migrate():
    print(f"Connecting to {DATABASE_URL}...")
    with engine.connect() as conn:
        print("Checking if 'deployment_date' exists in 'proyecto'...")
        # Add column if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE proyecto ADD COLUMN deployment_date VARCHAR"))
            conn.commit()
            print("✅ Column 'deployment_date' added successfully.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("ℹ️ Column 'deployment_date' already exists.")
            else:
                print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate()
