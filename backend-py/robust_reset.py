import os
from dotenv import load_dotenv
from sqlmodel import Session, create_engine, select

# Load environment variables from .env
load_dotenv()

# Import models to ensure they are registered
from app.models import User
from app.core.security import get_password_hash

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"[DEBUG] Connecting to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)

def reset_users():
    with Session(engine) as session:
        # Search for both emails
        emails = ["admin@admin.com", "favio4515@gmail.com"]
        new_hashed_pw = get_password_hash("admin123")
        
        for email in emails:
            user = session.exec(select(User).where(User.email == email)).first()
            if user:
                user.hashed_password = new_hashed_pw
                session.add(user)
                print(f"[SUCCESS] Password reset for {email}")
            else:
                print(f"[WARNING] User {email} not found in this database.")
        
        session.commit()
        print("[DONE] Changes committed to database.")

if __name__ == "__main__":
    reset_users()
