import re
import unicodedata
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.models import CasoExitoCompleto

router = APIRouter()


def _slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    if not slug:
        slug = f"caso-{int(datetime.utcnow().timestamp())}"
    return slug


def _ensure_unique_slug(session: Session, base_slug: str, exclude_id: Optional[int] = None) -> str:
    candidate = _slugify(base_slug)
    index = 2

    while True:
        existing = session.exec(select(CasoExitoCompleto).where(CasoExitoCompleto.slug == candidate)).first()
        if not existing:
            return candidate
        if exclude_id is not None and existing.id == exclude_id:
            return candidate
        candidate = f"{_slugify(base_slug)}-{index}"
        index += 1


def _payload_dict(payload: BaseModel, exclude_unset: bool = True) -> dict:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_unset=exclude_unset)
    return payload.dict(exclude_unset=exclude_unset)


class CasoCompletoCreate(BaseModel):
    slug: Optional[str] = None
    company_name: str
    client_name: str
    client_role: Optional[str] = None
    industry: str
    year: str = "2026"
    country: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_video_url: Optional[str] = None
    headline: str
    summary: str
    challenge: Optional[str] = None
    solution: Optional[str] = None
    impact: Optional[str] = None
    testimonial: Optional[str] = None
    services: Optional[str] = "[]"
    technologies: Optional[str] = "[]"
    kpis: Optional[str] = "[]"
    timeline: Optional[str] = "[]"
    gallery: Optional[str] = "[]"
    extra_links: Optional[str] = "[]"
    order_index: int = 0
    is_featured: bool = False
    is_published: bool = True


class CasoCompletoUpdate(BaseModel):
    slug: Optional[str] = None
    company_name: Optional[str] = None
    client_name: Optional[str] = None
    client_role: Optional[str] = None
    industry: Optional[str] = None
    year: Optional[str] = None
    country: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_video_url: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    impact: Optional[str] = None
    testimonial: Optional[str] = None
    services: Optional[str] = None
    technologies: Optional[str] = None
    kpis: Optional[str] = None
    timeline: Optional[str] = None
    gallery: Optional[str] = None
    extra_links: Optional[str] = None
    order_index: Optional[int] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None


@router.get("/casos-completos", response_model=List[CasoExitoCompleto])
def get_casos_completos(
    published_only: bool = Query(default=False),
    session: Session = Depends(get_session),
):
    query = select(CasoExitoCompleto)
    if published_only:
        query = query.where(CasoExitoCompleto.is_published == True)  # noqa: E712
    query = query.order_by(CasoExitoCompleto.order_index, CasoExitoCompleto.id.desc())
    return session.exec(query).all()


@router.get("/casos-completos/slug/{slug}", response_model=CasoExitoCompleto)
def get_caso_completo_by_slug(slug: str, session: Session = Depends(get_session)):
    case = session.exec(select(CasoExitoCompleto).where(CasoExitoCompleto.slug == slug)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Caso completo no encontrado")
    return case


@router.get("/casos-completos/{case_id}", response_model=CasoExitoCompleto)
def get_caso_completo(case_id: int, session: Session = Depends(get_session)):
    case = session.get(CasoExitoCompleto, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Caso completo no encontrado")
    return case


@router.post("/casos-completos", response_model=CasoExitoCompleto)
def create_caso_completo(payload: CasoCompletoCreate, session: Session = Depends(get_session)):
    data = _payload_dict(payload, exclude_unset=False)

    base_slug = data.get("slug") or data.get("company_name") or data.get("headline") or "caso-cliente"
    data["slug"] = _ensure_unique_slug(session, base_slug)
    data["updated_at"] = datetime.utcnow()

    case = CasoExitoCompleto(**data)
    session.add(case)
    session.commit()
    session.refresh(case)
    return case


@router.put("/casos-completos/{case_id}", response_model=CasoExitoCompleto)
def update_caso_completo(case_id: int, payload: CasoCompletoUpdate, session: Session = Depends(get_session)):
    case = session.get(CasoExitoCompleto, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Caso completo no encontrado")

    updates = _payload_dict(payload, exclude_unset=True)
    if not updates:
        return case

    if "slug" in updates or "company_name" in updates:
        base_slug = updates.get("slug") or updates.get("company_name") or case.company_name or case.slug
        updates["slug"] = _ensure_unique_slug(session, base_slug, exclude_id=case_id)

    for key, value in updates.items():
        setattr(case, key, value)

    case.updated_at = datetime.utcnow()
    session.add(case)
    session.commit()
    session.refresh(case)
    return case


@router.delete("/casos-completos/{case_id}")
def delete_caso_completo(case_id: int, session: Session = Depends(get_session)):
    case = session.get(CasoExitoCompleto, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Caso completo no encontrado")

    session.delete(case)
    session.commit()
    return {"message": "Caso completo eliminado exitosamente"}
