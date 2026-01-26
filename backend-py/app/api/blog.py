from fastapi import APIRouter, HTTPException
from typing import List
from sqlmodel import Session, select
from app.db import engine
from app.models import Blog

router = APIRouter()


@router.post("/", response_model=Blog)
def create_blog(item: Blog):
    with Session(engine) as session:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.get("/", response_model=List[Blog])
def list_blogs():
    with Session(engine) as session:
        return session.exec(select(Blog)).all()


@router.get("/{item_id}", response_model=Blog)
def get_blog(item_id: int):
    with Session(engine) as session:
        item = session.get(Blog, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        return item
