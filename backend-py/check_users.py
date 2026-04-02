import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("=== USUARIOS ADMIN ===")
    r = conn.execute(text("SELECT id, email, full_name FROM \"user\" ORDER BY id LIMIT 10"))
    rows = r.fetchall()
    if not rows:
        print("  NO HAY USUARIOS")
    for row in rows:
        print(f"  ID:{row[0]} email:{row[1]} name:{row[2]}")
    
    print("\n=== COUNT de lead_communication ===")
    r = conn.execute(text("SELECT count(*), channel FROM lead_communication GROUP BY channel"))
    for row in r:
        print(f"  count:{row[0]} channel:{row[1]}")
