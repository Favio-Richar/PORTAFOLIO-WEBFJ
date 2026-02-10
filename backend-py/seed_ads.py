import json
from sqlmodel import Session
from app.db import engine, init_db
from app.models import Ad
from datetime import datetime

def bootstrap_ads():
    print("Iniciando carga de publicidad premium...")
    init_db()
    
    with Session(engine) as session:
        # Limpiar anuncios previos de esta posición
        # session.exec(text("DELETE FROM ad WHERE position = 'login_hero'"))
        
        ads_data = [
            {
                "title": "Software Architecture Pro",
                "media": [
                    {"type": "image", "url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"},
                    {"type": "image", "url": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"}
                ],
                "redirect_url": "https://portfolio.com/services",
                "position": "login_hero"
            },
            {
                "title": "Next-Gen User Interfaces",
                "media": [
                    {"type": "image", "url": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop"},
                    {"type": "image", "url": "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop"}
                ],
                "redirect_url": "https://portfolio.com/ui-design",
                "position": "login_hero"
            },
            {
                "title": "Cloud Infrastructure Elite",
                "media": [
                    {"type": "image", "url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"},
                    {"type": "image", "url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"}
                ],
                "redirect_url": "https://portfolio.com/cloud",
                "position": "login_hero"
            }
        ]
        
        for data in ads_data:
            ad = Ad(
                title=data["title"],
                media=json.dumps(data["media"]),
                redirect_url=data["redirect_url"],
                position=data["position"],
                is_active=True,
                created_at=datetime.utcnow()
            )
            session.add(ad)
        
        session.commit()
        print("✅ Carga de publicidad premium completada.")

if __name__ == "__main__":
    bootstrap_ads()
