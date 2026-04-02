import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")
engine = create_engine(DATABASE_URL)

def diag():
    print(f"Connecting to: {DATABASE_URL}")
    try:
        with engine.connect() as conn:
            # Check direct_inquiry
            print("\nChecking direct_inquiry columns:")
            res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'direct_inquiry'"))
            cols = [r[0] for r in res]
            print(f"Columns: {cols}")
            
            # Check lead_communication
            print("\nChecking lead_communication columns:")
            res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'lead_communication'"))
            cols = [r[0] for r in res]
            print(f"Columns: {cols}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    diag()
