from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Education
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


# Input schemas para crear/actualizar sin requerir id
class EducationCreate(BaseModel):
    degree: str
    institution: str
    field_of_study: Optional[str] = None
    location: str
    start_year: str
    end_year: str
    description: Optional[str] = None
    certificate_url: Optional[str] = None


class EducationUpdate(BaseModel):
    degree: str
    institution: str
    field_of_study: Optional[str] = None
    location: str
    start_year: str
    end_year: str
    description: Optional[str] = None
    certificate_url: Optional[str] = None


@router.get("", response_model=List[Education])
def get_education():
    with Session(engine) as session:
        education = session.exec(select(Education)).all()
        return education


@router.post("", response_model=Education)
def create_education(edu_data: EducationCreate):
    try:
        with Session(engine) as session:
            edu = Education(
                degree=edu_data.degree,
                institution=edu_data.institution,
                field_of_study=edu_data.field_of_study,
                location=edu_data.location,
                start_year=edu_data.start_year,
                end_year=edu_data.end_year,
                description=edu_data.description,
                certificate_url=edu_data.certificate_url
            )
            session.add(edu)
            session.commit()
            session.refresh(edu)
            return edu
    except Exception as e:
        print(f"Error creating education: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/{edu_id}", response_model=Education)
def update_education(edu_id: int, edu_data: EducationUpdate):
    try:
        with Session(engine) as session:
            edu = session.get(Education, edu_id)
            if not edu:
                raise HTTPException(status_code=404, detail="Education not found")
            
            edu.degree = edu_data.degree
            edu.institution = edu_data.institution
            edu.field_of_study = edu_data.field_of_study
            edu.location = edu_data.location
            edu.start_year = edu_data.start_year
            edu.end_year = edu_data.end_year
            edu.description = edu_data.description
            edu.certificate_url = edu_data.certificate_url
            
            session.add(edu)
            session.commit()
            session.refresh(edu)
            return edu
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating education: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{edu_id}")
def delete_education(edu_id: int):
    with Session(engine) as session:
        edu = session.get(Education, edu_id)
        if not edu:
            raise HTTPException(status_code=404, detail="Education not found")
        
        session.delete(edu)
        session.commit()
        return {"message": "Education deleted"}

