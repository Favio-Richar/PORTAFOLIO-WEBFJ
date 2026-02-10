from sqlalchemy import inspect, text
from app.db import engine
from sqlmodel import Session, select
from app.models import User
from app.core.security import get_password_hash

def diag():
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('user')]
    print(f"Columns in 'user' table: {columns}")
    
    try:
        with Session(engine) as session:
            print("Attempting to insert admin...")
            u = User(
                email="admin@admin.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin",
                role="admin"
            )
            session.add(u)
            session.commit()
            print("Insert successful!")
    except Exception as e:
        print(f"Insert FAILED: {e}")

if __name__ == "__main__":
    diag()
