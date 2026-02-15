from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.db import get_session
from app.models import ProfessionalPlan, AdditionalService, Faq, TeamMember, Review

router = APIRouter()


class ReviewCreate(BaseModel):
    author_name: str
    content: str
    rating: int
    author_role: str | None = None
    author_company: str | None = None
    page_context: str | None = None


class ReviewUpdate(BaseModel):
    status: str | None = None
    content: str | None = None
    author_name: str | None = None
    author_role: str | None = None
    author_company: str | None = None
    page_context: str | None = None

@router.get("/plans", response_model=List[ProfessionalPlan])
def get_plans(session: Session = Depends(get_session)):
    plans = session.exec(select(ProfessionalPlan).order_by(ProfessionalPlan.order_index)).all()
    return plans

@router.get("/additional-services", response_model=List[AdditionalService])
def get_additional_services(session: Session = Depends(get_session)):
    services = session.exec(select(AdditionalService)).all()
    return services

@router.get("/faqs", response_model=List[Faq])
def get_faqs(session: Session = Depends(get_session)):
    faqs = session.exec(select(Faq).where(Faq.active == True).order_by(Faq.order)).all()
    return faqs

@router.get("/team", response_model=List[TeamMember])
def get_team(session: Session = Depends(get_session)):
    team = session.exec(select(TeamMember).where(TeamMember.active == True).order_by(TeamMember.order)).all()
    return team

@router.get("/reviews", response_model=List[Review])
def get_reviews(
    page_context: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(Review).where(Review.status == "approved")
    normalized_page_context = (page_context or "").strip().lower()
    if normalized_page_context:
        query = query.where(Review.page_context == normalized_page_context)
    reviews = session.exec(query.order_by(Review.id.desc())).all()
    return reviews


@router.get("/reviews/admin", response_model=List[Review])
def get_reviews_admin(session: Session = Depends(get_session)):
    reviews = session.exec(select(Review).order_by(Review.id.desc())).all()
    return reviews


@router.post("/reviews", response_model=Review)
def create_review(payload: ReviewCreate, session: Session = Depends(get_session)):
    clean_rating = max(1, min(int(payload.rating), 5))
    review = Review(
        author_name=payload.author_name.strip(),
        author_role=(payload.author_role or "").strip() or None,
        author_company=(payload.author_company or "").strip() or None,
        content=payload.content.strip(),
        rating=clean_rating,
        page_context=(payload.page_context or "").strip().lower() or None,
        status="pending",
        created_at=datetime.utcnow().isoformat(),
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.put("/reviews/{review_id}", response_model=Review)
def update_review(review_id: int, payload: ReviewUpdate, session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    if payload.status is not None:
        allowed_status = {"pending", "approved", "rejected"}
        if payload.status not in allowed_status:
            raise HTTPException(status_code=400, detail="Estado invalido")
        review.status = payload.status

    if payload.content is not None:
        review.content = payload.content.strip()
    if payload.author_name is not None:
        review.author_name = payload.author_name.strip()
    if payload.author_role is not None:
        review.author_role = payload.author_role.strip() or None
    if payload.author_company is not None:
        review.author_company = payload.author_company.strip() or None
    if payload.page_context is not None:
        review.page_context = payload.page_context.strip().lower() or None

    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    session.delete(review)
    session.commit()
    return {"ok": True}
