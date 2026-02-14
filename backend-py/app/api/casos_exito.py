from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.db import get_session
from app.models import CasoExito

router = APIRouter()

# ========== GET ALL CASOS DE ÉXITO ==========
@router.get("/casos-exito", response_model=List[CasoExito])
def get_casos_exito(session: Session = Depends(get_session)):
    """Obtener todos los casos de éxito"""
    casos = session.exec(select(CasoExito)).all()
    return casos

# ========== GET ONE CASO DE ÉXITO ==========
@router.get("/casos-exito/{caso_id}", response_model=CasoExito)
def get_caso_exito(caso_id: int, session: Session = Depends(get_session)):
    """Obtener un caso de éxito por ID"""
    caso = session.get(CasoExito, caso_id)
    if not caso:
        raise HTTPException(status_code=404, detail="Caso de éxito no encontrado")
    return caso

# ========== CREATE CASO DE ÉXITO ==========
@router.post("/casos-exito", response_model=CasoExito)
def create_caso_exito(caso: CasoExito, session: Session = Depends(get_session)):
    """Crear un nuevo caso de éxito"""
    session.add(caso)
    session.commit()
    session.refresh(caso)
    return caso

# ========== UPDATE CASO DE ÉXITO ==========
@router.put("/casos-exito/{caso_id}", response_model=CasoExito)
def update_caso_exito(caso_id: int, caso_data: CasoExito, session: Session = Depends(get_session)):
    """Actualizar un caso de éxito"""
    caso = session.get(CasoExito, caso_id)
    if not caso:
        raise HTTPException(status_code=404, detail="Caso de éxito no encontrado")
    
    # Actualizar campos
    caso_dict = caso_data.dict(exclude_unset=True, exclude={"id", "created_at"})
    for key, value in caso_dict.items():
        setattr(caso, key, value)
    
    caso.updated_at = datetime.utcnow()
    
    session.add(caso)
    session.commit()
    session.refresh(caso)
    return caso

# ========== DELETE CASO DE ÉXITO ==========
@router.delete("/casos-exito/{caso_id}")
def delete_caso_exito(caso_id: int, session: Session = Depends(get_session)):
    """Eliminar un caso de éxito"""
    caso = session.get(CasoExito, caso_id)
    if not caso:
        raise HTTPException(status_code=404, detail="Caso de éxito no encontrado")
    
    session.delete(caso)
    session.commit()
    return {"message": "Caso de éxito eliminado exitosamente"}
