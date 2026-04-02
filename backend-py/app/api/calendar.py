from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.db import get_session
from app.core.admin_auth import require_admin
from app.models import CalendarEvent

router = APIRouter()

class CalendarEventCreate(BaseModel):
    date: str
    title: str
    description: str | None = None
    type: str = "work"
    time: str | None = None
    completed: bool = False

class CalendarEventUpdate(BaseModel):
    date: str | None = None
    title: str | None = None
    description: str | None = None
    type: str | None = None
    time: str | None = None
    completed: bool | None = None

@router.get("/", response_model=List[CalendarEvent])
def get_calendar_events(
    session: Session = Depends(get_session),
    admin: dict = Depends(require_admin)
):
    """Obtiene todos los eventos del calendario."""
    events = session.exec(select(CalendarEvent).order_by(CalendarEvent.date)).all()
    return events

@router.post("/", response_model=CalendarEvent)
def create_calendar_event(
    payload: CalendarEventCreate,
    session: Session = Depends(get_session),
    admin: dict = Depends(require_admin)
):
    """Crea un nuevo evento en el calendario."""
    event = CalendarEvent(
        date=payload.date,
        title=payload.title,
        description=payload.description,
        type=payload.type,
        time=payload.time,
        completed=payload.completed
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event

@router.put("/{event_id}", response_model=CalendarEvent)
def update_calendar_event(
    event_id: int,
    payload: CalendarEventUpdate,
    session: Session = Depends(get_session),
    admin: dict = Depends(require_admin)
):
    """Actualiza un evento existente."""
    event = session.get(CalendarEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
        
    session.add(event)
    session.commit()
    session.refresh(event)
    return event

@router.delete("/{event_id}")
def delete_calendar_event(
    event_id: int,
    session: Session = Depends(get_session),
    admin: dict = Depends(require_admin)
):
    """Elimina un evento."""
    event = session.get(CalendarEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    
    session.delete(event)
    session.commit()
    return {"message": "Evento eliminado correctamente."}
