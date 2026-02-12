from sqlmodel import Session, select
from app.db import engine
from app.models import Media
import os

def seed_media():
    sample_items = [
        {"title": "Diseño Corporativo", "description": "Presentación de branding institucional", "type": "image", "url": "http://localhost:8000/uploads/01208439-fa96-4af6-a562-9151593bfc78.jpg"},
        {"title": "Demo Software", "description": "Video demostrativo de plataforma elite", "type": "video", "url": "http://localhost:8000/uploads/004c5ba2-9fc2-4cfb-bc43-a6920eddac9f.mp4"},
        {"title": "Arquitectura Digital", "description": "Infografía de sistemas distribuidos", "type": "image", "url": "http://localhost:8000/uploads/2383bf26-1099-4eaa-bf61-21a51d43ec7c.jpg"},
        {"title": "Consultoría Técnica", "description": "Resumen de sesión estratégica", "type": "video", "url": "http://localhost:8000/uploads/01a002f8-35d2-447a-9382-7d2154adde1c.mp4"},
        {"title": "Marketing Visual", "description": "Campaña de impacto en redes sociales", "type": "image", "url": "http://localhost:8000/uploads/339c2c86-4f06-4697-b90f-21f3c1f4b98d.png"}
    ]

    with Session(engine) as session:
        # Check if already has data to avoid duplication
        existing = session.exec(select(Media)).first()
        if existing:
            print("La galería ya tiene elementos. Saltando seeding.")
            return

        for data in sample_items:
            media_item = Media(**data)
            session.add(media_item)
        
        session.commit()
        print(f"Se han añadido {len(sample_items)} elementos a la galería.")

if __name__ == "__main__":
    seed_media()
