from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Session, select
from app.db import engine
from app.models import Proyecto

router = APIRouter()

# Schemas
class ProyectoCreate(BaseModel):
    title: str
    category: str
    status: str
    version: str
    description: str
    image_url: str
    video_url: Optional[str] = None
    media: Optional[str] = "[]"
    demo_url: str
    repo_url: str
    stack: str # JSON list
    deployment_date: Optional[str] = None
    client_name: Optional[str] = None

class ProyectoUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    media: Optional[str] = None
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    stack: Optional[str] = None
    deployment_date: Optional[str] = None
    client_name: Optional[str] = None

@router.get("", response_model=List[Proyecto])
def list_proyectos():
    with Session(engine) as session:
        return session.exec(select(Proyecto)).all()

@router.get("/{item_id}", response_model=Proyecto)
def get_proyecto(item_id: int):
    with Session(engine) as session:
        item = session.get(Proyecto, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Proyecto not found")
        return item

@router.post("", response_model=Proyecto)
def create_proyecto(data: ProyectoCreate):
    with Session(engine) as session:
        item = Proyecto(**data.model_dump())
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

@router.put("/{item_id}", response_model=Proyecto)
def update_proyecto(item_id: int, data: ProyectoUpdate):
    with Session(engine) as session:
        item = session.get(Proyecto, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Proyecto not found")
        
        values = data.model_dump(exclude_unset=True)
        for key, value in values.items():
            setattr(item, key, value)
            
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

@router.delete("/{item_id}")
def delete_proyecto(item_id: int):
    with Session(engine) as session:
        item = session.get(Proyecto, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Proyecto not found")
        
        session.delete(item)
        session.commit()
        return {"message": "Proyecto deleted"}
