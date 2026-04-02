import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def full_check():
    try:
        with engine.connect() as conn:
            # Contar TODOS los mensajes por tipo
            print("=== RESUMEN COMPLETO DE DATOS ===\n")
            
            r = conn.execute(text("SELECT count(*) FROM lead_communication"))
            print(f"lead_communication (total): {r.scalar()}")
            
            r = conn.execute(text("SELECT count(*) FROM lead_communication WHERE html_content IS NOT NULL AND html_content != ''"))
            print(f"lead_communication (con HTML): {r.scalar()}")
            
            r = conn.execute(text("SELECT count(*) FROM direct_inquiry"))
            print(f"direct_inquiry (total): {r.scalar()}")
            
            r = conn.execute(text("SELECT count(*) FROM quote"))
            print(f"quote (cotizaciones total): {r.scalar()}")
            
            r = conn.execute(text("SELECT count(*) FROM advisorybooking"))
            print(f"advisorybooking (asesorias total): {r.scalar()}")
            
            print("\n=== ULTIMOS 5 MENSAJES lead_communication ===")
            r = conn.execute(text("SELECT id, lead_type, sender, subject, channel, created_at FROM lead_communication ORDER BY created_at DESC LIMIT 5"))
            for row in r:
                print(f"ID:{row[0]} type:{row[1]} sender:{row[2]} subj:{row[3]} ch:{row[4]} date:{row[5]}")
                
            print("\n=== ULTIMAS 3 COTIZACIONES ===")
            r = conn.execute(text("SELECT id, nombre, email, status, created_at FROM quote ORDER BY created_at DESC LIMIT 3"))
            for row in r:
                print(f"ID:{row[0]} name:{row[1]} email:{row[2]} status:{row[3]} date:{row[4]}")
                
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    full_check()
