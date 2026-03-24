from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import Ad
from app.core.admin_auth import require_admin
from pydantic import BaseModel
from typing import Optional, List, Any, Union
from datetime import datetime
import json

router = APIRouter()

# --- SCHEMAS ---
class AdCreate(BaseModel):
    title: str
    media: List[dict] # [{type: 'image'|'video', url: string}]
    redirect_url: Optional[str] = None
    position: str = "login_header"
    is_active: bool = True

class AdUpdate(BaseModel):
    title: Optional[str] = None
    media: Optional[List[dict]] = None
    redirect_url: Optional[str] = None
    position: Optional[str] = None
    is_active: Optional[bool] = None

# --- ENDPOINTS ---

@router.get("/public", response_model=List[Ad])
def get_public_ads(position: Optional[str] = None, session: Session = Depends(get_session)):
    """Obtener anuncios activos para el frontend (público)"""
    query = select(Ad).where(Ad.is_active == True)
    if position:
        query = query.where(Ad.position == position)
    ads = session.exec(query).all()
    return ads

@router.get("/", response_model=List[Ad])
def get_all_ads(
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    """Obtener todos los anuncios (Admin)"""
    ads = session.exec(select(Ad)).all()
    return ads

@router.post("/", response_model=Ad)
def create_ad(
    ad: AdCreate,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    """Crear un nuevo anuncio"""
    # Convert list to JSON string for storage
    media_json = json.dumps(ad.media)
    
    new_ad = Ad(
        title=ad.title,
        media=media_json,
        redirect_url=ad.redirect_url,
        position=ad.position,
        is_active=ad.is_active,
        created_at=datetime.utcnow()
    )
    session.add(new_ad)
    session.commit()
    session.refresh(new_ad)
    return new_ad

@router.patch("/{ad_id}", response_model=Ad)
def update_ad(
    ad_id: int,
    ad_update: AdUpdate,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    """Actualizar un anuncio existente"""
    ad = session.get(Ad, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    ad_data = ad_update.dict(exclude_unset=True)
    for key, value in ad_data.items():
        if key == 'media':
            setattr(ad, key, json.dumps(value))
        else:
            setattr(ad, key, value)
        
    session.add(ad)
    session.commit()
    session.refresh(ad)
    return ad

@router.delete("/{ad_id}")
def delete_ad(
    ad_id: int,
    session: Session = Depends(get_session),
    _current_user=Depends(require_admin),
):
    """Eliminar un anuncio"""
    ad = session.get(Ad, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    session.delete(ad)
    session.commit()
    return {"message": "Anuncio eliminado correctamente"}
