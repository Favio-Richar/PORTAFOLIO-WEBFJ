from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from app.db import get_session
from app.models import TeamMember
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TeamMember])
def get_team(session: Session = Depends(get_session)):
    statement = select(TeamMember).where(TeamMember.active == True).order_by(TeamMember.order)
    results = session.exec(statement).all()
    return results

@router.get("/all", response_model=List[TeamMember])
def get_all_team(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    statement = select(TeamMember).order_by(TeamMember.order)
    results = session.exec(statement).all()
    return results

@router.post("/", response_model=TeamMember)
def create_member(
    member: TeamMember,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    session.add(member)
    session.commit()
    session.refresh(member)
    return member

@router.put("/{member_id}", response_model=TeamMember)
def update_member(
    member_id: int,
    member_data: dict,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    db_member = session.get(TeamMember, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    for key, value in member_data.items():
        if hasattr(db_member, key):
            setattr(db_member, key, value)
    
    session.add(db_member)
    session.commit()
    session.refresh(db_member)
    return db_member

@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    db_member = session.get(TeamMember, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    session.delete(db_member)
    session.commit()
    return {"status": "success"}
