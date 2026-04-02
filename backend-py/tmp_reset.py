from app.db import engine
from app.core.security import get_password_hash
from sqlmodel import Session, select
from app.models import User

with Session(engine) as session:
    emails = ['admin@admin.com', 'favio4515@gmail.com']
    for email in emails:
        user = session.exec(select(User).where(User.email == email)).first()
        if user:
            user.hashed_password = get_password_hash('admin123')
            session.add(user)
        else:
            session.add(User(
                email=email, 
                hashed_password=get_password_hash('admin123'), 
                full_name='Favio Jimenez', 
                role='admin'
            ))
    session.commit()
print("SUCCESS: Users reset to admin123")
