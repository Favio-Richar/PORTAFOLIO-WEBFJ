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
                email="contact@example.com",
                phone="",
                linkedin="",
                github="",
                location="Chile"
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
            existing.linkedin = contact_data.linkedin
            existing.github = contact_data.github
            existing.location = contact_data.location
            session.add(existing)
        else:
            # Crear nuevo
            new_contact = Contact(
                email=contact_data.email,
                phone=contact_data.phone,
                linkedin=contact_data.linkedin,
                github=contact_data.github,
                location=contact_data.location
            )
            session.add(new_contact)
        
        session.commit()
        return {"message": "Contact saved successfully"}
