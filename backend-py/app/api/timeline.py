from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import Timeline
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


# Input schemas
class TimelineCreate(BaseModel):
    year: str
    title: str
    description: str
    category: Optional[str] = None
    icon: Optional[str] = None


class TimelineUpdate(BaseModel):
    year: str
    title: str
    description: str
    category: Optional[str] = None
    icon: Optional[str] = None


@router.get("", response_model=List[Timeline])
def get_timeline():
    with Session(engine) as session:
        timeline = session.exec(select(Timeline)).all()
        return timeline


@router.post("", response_model=Timeline)
def create_timeline(item_data: TimelineCreate):
    with Session(engine) as session:
        item = Timeline(
            year=item_data.year,
            title=item_data.title,
            description=item_data.description,
            category=item_data.category,
            icon=item_data.icon
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.put("/{item_id}", response_model=Timeline)
def update_timeline(item_id: int, item_data: TimelineUpdate):
    with Session(engine) as session:
        item = session.get(Timeline, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Timeline not found")
        
        item.year = item_data.year
        item.title = item_data.title
        item.description = item_data.description
        item.category = item_data.category
        item.icon = item_data.icon
        
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.delete("/{item_id}")
def delete_timeline(item_id: int):
    with Session(engine) as session:
        item = session.get(Timeline, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Timeline not found")
        
        session.delete(item)
        session.commit()
        return {"message": "Timeline deleted"}
