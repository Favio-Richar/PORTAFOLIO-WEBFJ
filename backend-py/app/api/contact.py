from fastapi import APIRouter
from sqlmodel import Session, select
from app.db import engine
from app.models import Contact

router = APIRouter()


@router.get("")
def get_contact():
    """Obtener datos de contacto (solo hay uno)"""
    with Session(engine) as session:
        contact = session.exec(select(Contact)).first()
        if not contact:
            # Crear contacto por defecto si no existe
            contact = Contact(
                email="contacto@levelsoftwarepro.com",
                phone="+56 9 1234 5678",
                whatsapp="+56 9 1234 5678",
                linkedin="",
                github="",
                facebook="",
                instagram="",
                twitter="",
                tiktok="",
                location="Santiago, Chile",
                hero_image="",
                hero_video=""
            )
            session.add(contact)
            session.commit()
            session.refresh(contact)
        return contact


@router.post("")
def update_contact(contact_data: Contact):
    """Actualizar o crear contacto"""
    with Session(engine) as session:
        # Buscar contacto existente
        existing = session.exec(select(Contact)).first()
        
        if existing:
            # Actualizar existente
            existing.email = contact_data.email
            existing.phone = contact_data.phone
            existing.whatsapp = contact_data.whatsapp
            existing.linkedin = contact_data.linkedin
            existing.github = contact_data.github
            existing.facebook = contact_data.facebook
            existing.instagram = contact_data.instagram
            existing.twitter = contact_data.twitter
            existing.tiktok = contact_data.tiktok
            existing.location = contact_data.location
            existing.hero_image = contact_data.hero_image
            existing.hero_video = contact_data.hero_video
            session.add(existing)
        else:
            # Crear nuevo
            new_contact = Contact(
                email=contact_data.email,
                phone=contact_data.phone,
                whatsapp=contact_data.whatsapp,
                linkedin=contact_data.linkedin,
                github=contact_data.github,
                facebook=contact_data.facebook,
                instagram=contact_data.instagram,
                twitter=contact_data.twitter,
                tiktok=contact_data.tiktok,
                location=contact_data.location,
                hero_image=contact_data.hero_image,
                hero_video=contact_data.hero_video
            )
            session.add(new_contact)
        
        session.commit()
        return {"message": "Contact saved successfully"}
