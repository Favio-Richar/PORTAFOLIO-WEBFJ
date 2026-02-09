from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db import get_session
from app.models import ProfessionalPlan, AdditionalService, Faq, TeamMember, Review

router = APIRouter()

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
def get_reviews(session: Session = Depends(get_session)):
    reviews = session.exec(select(Review).where(Review.status == "approved")).all()
    return reviews
