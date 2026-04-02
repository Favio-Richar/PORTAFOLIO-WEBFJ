from sqlmodel import Session, create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "sqlite:///./portfolio.db" # Default development path
if os.getenv("DATABASE_URL"):
    DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

def migrate():
    print(f"Connecting to {DATABASE_URL}...")
    with Session(engine) as session:
        try:
            # Intentar añadir la columna status a lead_communication
            session.execute(text("ALTER TABLE lead_communication ADD COLUMN status VARCHAR DEFAULT 'active';"))
            session.commit()
            print("Successfully added 'status' column to 'lead_communication' table.")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("Column 'status' already exists in 'lead_communication'.")
            else:
                print(f"Error migrating lead_communication: {e}")

        try:
            # Asegurar que todos los registros tengan un valor por defecto
            session.execute(text("UPDATE lead_communication SET status = 'active' WHERE status IS NULL;"))
            session.commit()
            print("Updated existing records to 'active'.")
        except Exception as e:
            print(f"Error updating records: {e}")

if __name__ == "__main__":
    migrate()
