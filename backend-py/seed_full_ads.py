import sys
import os
sys.path.append(os.getcwd())

from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import Ad
from datetime import datetime

def seed_all_ads():
    print("Checking for existing ads...")
    with Session(engine) as session:
        # Clear existing ads
        existing = session.exec(select(Ad)).all()
        if existing:
            print(f"Deleting {len(existing)} existing ads to clean up.")
            for ad in existing:
                session.delete(ad)
            session.commit()
            
        print("Creating REALISTIC sample ads...")
        
        # 1. Header Ad (Horizontal) - Tech Conference / Server Room
        # Image: Modern dark server room or tech banner
        header_ad = Ad(
            title="Cloud Hosting Solutions",
            image_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", 
            redirect_url="https://aws.amazon.com",
            position="login_header",
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(header_ad)
        
        # 2. Sidebar Ad (Vertical for Left) - Coding / Developer
        # Image: Code on screen, dark mode
        sidebar_ad_1 = Ad(
            title="Full Stack Course",
            image_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&h=800&auto=format&fit=crop",
            redirect_url="https://udemy.com",
            position="sidebar",
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(sidebar_ad_1)

        # 3. Sidebar Ad (Vertical for Right) - Office / Business
        # Image: Modern office architecture
        sidebar_ad_2 = Ad(
            title="Tech Workspace Gear",
            image_url="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=400&h=800&auto=format&fit=crop",
            redirect_url="https://hermanmiller.com",
            position="sidebar",
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(sidebar_ad_2)

        session.commit()
        print("✅ Created 3 REALISTIC sample ads (Tech/Office).")

if __name__ == "__main__":
    init_db()
    seed_all_ads()
