import sys
import os
sys.path.append(os.getcwd())

from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import Ad
from datetime import datetime

def seed_hero_ads():
    print("Seeding HERO ads...")
    with Session(engine) as session:
        # Clear existing ads
        existing = session.exec(select(Ad)).all()
        for ad in existing:
            session.delete(ad)
        session.commit()
            
        print("Creating HERO sample ads...")
        
        # 1. Hero Ad - Architecture/Design
        ad1 = Ad(
            title="Diseño Arquitectónico Premium",
            image_url="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop", 
            redirect_url="https://webfj.pro",
            position="login_hero",
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(ad1)
        
        # 2. Hero Ad - Technology/Code
        ad2 = Ad(
            title="Desarrollo Full Stack Avanzado",
            image_url="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000&auto=format&fit=crop",
            redirect_url="https://webfj.pro",
            position="login_hero",
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(ad2)

        # 3. Hero Ad - Business/Strategy
        ad3 = Ad(
            title="Estrategia Digital 360°",
            image_url="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop",
            redirect_url="https://webfj.pro",
            position="login_hero",
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(ad3)

        session.commit()
        print("✅ Created 3 HERO ads.")

if __name__ == "__main__":
    init_db()
    seed_hero_ads()
