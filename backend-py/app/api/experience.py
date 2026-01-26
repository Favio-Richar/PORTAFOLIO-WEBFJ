from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Experience
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


# Input schemas para crear/actualizar sin requerir id
class ExperienceCreate(BaseModel):
    company: str
    position: str
    period: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None


class ExperienceUpdate(BaseModel):
    company: str
    position: str
    period: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None


@router.get("", response_model=List[Experience])
def get_experiences():
    """Obtener todas las experiencias"""
    with Session(engine) as session:
        experiences = session.exec(select(Experience)).all()
        return experiences


@router.post("", response_model=Experience)
def create_experience(exp_data: ExperienceCreate):
    """Crear nueva experiencia"""
    with Session(engine) as session:
        exp = Experience(
            company=exp_data.company,
            position=exp_data.position,
            period=exp_data.period,
            location=exp_data.location,
            employment_type=exp_data.employment_type,
            description=exp_data.description,
            technologies=exp_data.technologies
        )
        session.add(exp)
        session.commit()
        session.refresh(exp)
        return exp


@router.put("/{exp_id}", response_model=Experience)
def update_experience(exp_id: int, exp_data: ExperienceUpdate):
    """Actualizar experiencia"""
    with Session(engine) as session:
        exp = session.get(Experience, exp_id)
        if not exp:
            raise HTTPException(status_code=404, detail="Experience not found")
        
        exp.company = exp_data.company
        exp.position = exp_data.position
        exp.period = exp_data.period
        exp.location = exp_data.location
        exp.employment_type = exp_data.employment_type
        exp.description = exp_data.description
        exp.technologies = exp_data.technologies
        
        session.add(exp)
        session.commit()
        session.refresh(exp)
        return exp


@router.delete("/{exp_id}")
def delete_experience(exp_id: int):
    """Eliminar experiencia"""
    with Session(engine) as session:
        exp = session.get(Experience, exp_id)
        if not exp:
            raise HTTPException(status_code=404, detail="Experience not found")
        
        session.delete(exp)
        session.commit()
        return {"message": "Experience deleted"}
