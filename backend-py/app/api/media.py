from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Media
from typing import List

router = APIRouter()

@router.get("", response_model=List[Media])
def get_all_media():
    """Obtener todos los elementos de la galería"""
    with Session(engine) as session:
        return session.exec(select(Media)).all()

@router.post("")
def create_media(media: Media):
    """Añadir nuevo elemento a la galería"""
    with Session(engine) as session:
        session.add(media)
        session.commit()
        session.refresh(media)
        return media

@router.delete("/{media_id}")
def delete_media(media_id: int):
    """Eliminar elemento de la galería"""
    with Session(engine) as session:
        media = session.get(Media, media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        session.delete(media)
        session.commit()
        return {"message": "Media deleted successfully"}
