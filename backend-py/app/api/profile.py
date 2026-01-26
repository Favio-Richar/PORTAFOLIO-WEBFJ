from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Profile

router = APIRouter()


@router.get("")
def get_profile():
    """Obtener perfil (solo hay uno)"""
    with Session(engine) as session:
        profile = session.exec(select(Profile)).first()
        if not profile:
            # Crear perfil por defecto si no existe
            profile = Profile(
                full_name="Favio Jiménez",
                title="Ingeniero de Software Full Stack",
                profile_image="",
                profile_video=""
            )
            session.add(profile)
            session.commit()
            session.refresh(profile)
        return profile


@router.post("")
def update_profile(profile_data: Profile):
    """Actualizar o crear perfil"""
    with Session(engine) as session:
        # Buscar perfil existente
        existing = session.exec(select(Profile)).first()
        
        if existing:
            # Actualizar existente
            existing.full_name = profile_data.full_name
            existing.title = profile_data.title
            existing.profile_image = profile_data.profile_image
            existing.profile_video = profile_data.profile_video
            session.add(existing)
        else:
            # Crear nuevo
            new_profile = Profile(
                full_name=profile_data.full_name,
                title=profile_data.title,
                profile_image=profile_data.profile_image,
                profile_video=profile_data.profile_video
            )
            session.add(new_profile)
        
        session.commit()
        return {"message": "Profile saved successfully"}
