from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Media
from typing import List
from app.core.admin_auth import require_admin

router = APIRouter()

@router.get("", response_model=List[Media])
def get_all_media():
    """Obtener todos los elementos de la galería"""
    with Session(engine) as session:
        return session.exec(select(Media)).all()

@router.post("")
def create_media(media: Media, _current_user=Depends(require_admin)):
    """Añadir nuevo elemento a la galería"""
    with Session(engine) as session:
        session.add(media)
        session.commit()
        session.refresh(media)
        return media

@router.put("/{media_id}")
def update_media(media_id: int, media_data: Media, _current_user=Depends(require_admin)):
    """Actualizar metadata de un elemento de media"""
    with Session(engine) as session:
        media = session.get(Media, media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")

        media.title = media_data.title
        media.description = media_data.description
        media.type = media_data.type
        media.url = media_data.url
        media.order_index = media_data.order_index
        media.active = media_data.active

        session.add(media)
        session.commit()
        session.refresh(media)
        return media

@router.delete("/{media_id}")
def delete_media(media_id: int, _current_user=Depends(require_admin)):
    """Eliminar elemento de la galería"""
    with Session(engine) as session:
        media = session.get(Media, media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        session.delete(media)
        session.commit()
        return {"message": "Media deleted successfully"}
