from sqlalchemy import text
import sys
import os

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine

def check():
    print("Certificaciones en la base de datos:")
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, title, issuer FROM certification"))
        for row in res:
            print(f"- [{row[0]}] {row[1]} ({row[2]})")

if __name__ == "__main__":
    check()
