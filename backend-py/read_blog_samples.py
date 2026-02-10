import sys
import os
from sqlalchemy import text

sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'app'))

try:
    from app.db import engine
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, title, content FROM blog LIMIT 3"))
        for r in res:
            print(f"--- ID: {r[0]} ---")
            print(f"TITLE: {r[1]}")
            print(f"CONTENT: {r[2][:300]}...")
            print("\n")
except Exception as e:
    print(f"ERROR: {e}")
