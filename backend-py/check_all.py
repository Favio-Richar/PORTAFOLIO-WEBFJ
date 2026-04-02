import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def check_all():
    try:
        with engine.connect() as conn:
            # Columnas de lead_communication
            print("=== COLUMNAS DE lead_communication ===")
            r = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lead_communication' ORDER BY ordinal_position"))
            for row in r:
                print(f"  {row[0]}: {row[1]}")

            print("\n=== TODOS LOS REGISTROS DE lead_communication ===")
            r = conn.execute(text("SELECT id, lead_type, sender, channel, subject, created_at FROM lead_communication ORDER BY created_at DESC LIMIT 10"))
            rows = r.fetchall()
            if not rows:
                print("  TABLA VACÍA")
            for row in rows:
                print(f"  ID:{row[0]} type:{row[1]} sender:{row[2]} ch:{row[3]} subj:{row[4]} date:{row[5]}")

            print("\n=== TODOS LOS REGISTROS DE direct_inquiry ===")
            r = conn.execute(text("SELECT id, nombre, email, status, created_at FROM direct_inquiry ORDER BY created_at DESC LIMIT 5"))
            rows = r.fetchall()
            if not rows:
                print("  TABLA VACÍA")
            for row in rows:
                print(f"  ID:{row[0]} nombre:{row[1]} email:{row[2]} status:{row[3]} date:{row[4]}")

            print("\n=== COTIZACIONES ===")
            r = conn.execute(text("SELECT id, nombre, status FROM quote ORDER BY created_at DESC LIMIT 5"))
            rows = r.fetchall()
            if not rows:
                print("  TABLA VACÍA")
            for row in rows:
                print(f"  ID:{row[0]} nombre:{row[1]} status:{row[2]}")
                
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_all()
