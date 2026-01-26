import sys
import os
from sqlalchemy import text
from app.db import engine

def migrate():
    print("Iniciando migración para formularios profesionales...")
    
    with engine.begin() as conn:
        # Experience table
        try:
            conn.execute(text("ALTER TABLE experience ADD COLUMN location VARCHAR;"))
            print("- Columna 'location' añadida a 'experience'")
        except Exception as e:
            print(f"- Error al añadir 'location' a 'experience': {e}")
            
        try:
            conn.execute(text("ALTER TABLE experience ADD COLUMN employment_type VARCHAR;"))
            print("- Columna 'employment_type' añadida a 'experience'")
        except Exception as e:
            print(f"- Error al añadir 'employment_type' a 'experience': {e}")

        # Education table
        try:
            conn.execute(text("ALTER TABLE education ADD COLUMN field_of_study VARCHAR;"))
            print("- Columna 'field_of_study' añadida a 'education'")
        except Exception as e:
            print(f"- Error al añadir 'field_of_study' a 'education': {e}")

        try:
            conn.execute(text("ALTER TABLE education ADD COLUMN description VARCHAR;"))
            print("- Columna 'description' añadida a 'education'")
        except Exception as e:
            print(f"- Error al añadir 'description' a 'education': {e}")

    print("Migración completada con éxito.")

if __name__ == "__main__":
    migrate()
