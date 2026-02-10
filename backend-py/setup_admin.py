from sqlmodel import Session, select, create_engine
from app.models import User
from app.core.security import get_password_hash
from app.db import engine, init_db
import os

def setup_test_data():
    # 1. Asegurar tablas
    print("Iniciando DB...")
    init_db()
    
    with Session(engine) as session:
        # 2. Verificar si hay usuarios
        admin = session.exec(select(User).where(User.email == "admin@admin.com")).first()
        if not admin:
            print("Creando usuario administrador de prueba...")
            admin = User(
                email="admin@admin.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrador FJR",
                role="admin"
            )
            session.add(admin)
            session.commit()
            print("✅ Usuario admin@admin.com creado (pass: admin123)")
        else:
            print("✅ El usuario admin@admin.com ya existe.")

if __name__ == "__main__":
    setup_test_data()
