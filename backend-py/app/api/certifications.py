from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Certification
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


# Input schemas
class CertificationCreate(BaseModel):
    title: str
    issuer: str
    date: str
    description: Optional[str] = None
    icon: Optional[str] = None
    level: Optional[str] = None
    color: Optional[str] = None
    badge: Optional[str] = None
    credential_url: Optional[str] = None


class CertificationUpdate(BaseModel):
    title: str
    issuer: str
    date: str
    description: Optional[str] = None
    icon: Optional[str] = None
    level: Optional[str] = None
    color: Optional[str] = None
    badge: Optional[str] = None
    credential_url: Optional[str] = None


@router.get("", response_model=List[Certification])
def get_certifications():
    with Session(engine) as session:
        certs = session.exec(select(Certification)).all()
        return certs


@router.post("", response_model=Certification)
def create_certification(cert_data: CertificationCreate):
    with Session(engine) as session:
        cert = Certification(
            title=cert_data.title,
            issuer=cert_data.issuer,
            date=cert_data.date,
            description=cert_data.description,
            icon=cert_data.icon,
            level=cert_data.level,
            color=cert_data.color,
            badge=cert_data.badge,
            credential_url=cert_data.credential_url
        )
        session.add(cert)
        session.commit()
        session.refresh(cert)
        return cert


@router.put("/{cert_id}", response_model=Certification)
def update_certification(cert_id: int, cert_data: CertificationUpdate):
    with Session(engine) as session:
        cert = session.get(Certification, cert_id)
        if not cert:
            raise HTTPException(status_code=404, detail="Certification not found")
        
        cert.title = cert_data.title
        cert.issuer = cert_data.issuer
        cert.date = cert_data.date
        cert.description = cert_data.description
        cert.icon = cert_data.icon
        cert.level = cert_data.level
        cert.color = cert_data.color
        cert.badge = cert_data.badge
        cert.credential_url = cert_data.credential_url
        
        session.add(cert)
        session.commit()
        session.refresh(cert)
        return cert


@router.delete("/{cert_id}")
def delete_certification(cert_id: int):
    with Session(engine) as session:
        cert = session.get(Certification, cert_id)
        if not cert:
            raise HTTPException(status_code=404, detail="Certification not found")
        
        session.delete(cert)
        session.commit()
        return {"message": "Certification deleted"}
