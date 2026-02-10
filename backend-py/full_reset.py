from sqlalchemy import text
from app.db import engine, init_db
from sqlmodel import Session, select
from app.models import User
from app.core.security import get_password_hash

def full_reset():
    with engine.connect() as conn:
        conn.execute(text("COMMIT"))
        print("Dropping all tables...")
        # Drop all tables manually to be sure
        tables = ['blog', 'proyecto', 'cliente', 'cotizacion', 'service', 'profile', 'experience', 'education', 'timeline', 'certification', 'contact', 'user', 'ad', 'alembic_version']
        for t in tables:
            conn.execute(text(f"DROP TABLE IF EXISTS \"{t}\" CASCADE;"))
        conn.commit()
    
    print("Initializing DB with new schema...")
    init_db()
    
    with Session(engine) as session:
        print("Creating admin user...")
        admin = User(
            email="admin@admin.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin",
            role="admin"
        )
        session.add(admin)
        session.commit()
        print("✅ Success! admin@admin.com / admin123")

if __name__ == "__main__":
    full_reset()
