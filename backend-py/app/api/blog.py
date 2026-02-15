from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, Session, select

from app.db import engine
from app.models import Blog, BlogHeroConfig

router = APIRouter()


class BlogHeroConfigUpdate(SQLModel):
    badge_text: str = "Articulo destacado"
    headline_prefix: str = "El Futuro del"
    headline_highlight: str = "Software Engineering"
    headline_suffix: str = "en la era de la IA"
    description: str = (
        "Analisis profundo sobre como los modelos fundacionales estan redefiniendo el ciclo de vida de desarrollo."
    )
    cta_text: str = "Leer Ahora"
    cta_url: str = "/blog"
    read_time_text: str = "15 min de lectura"
    media_type: str = "video"
    background_image_url: Optional[str] = None
    background_video_url: Optional[str] = None
    card_kicker: str = "Radar Tecnologico 2026"
    card_title: str = "3 tendencias que estan cambiando el desarrollo"
    card_description: str = "IA agentes, cloud eficiente y seguridad zero trust para productos reales."
    card_tags: Optional[str] = '["LLM Ops","Cloud Native","Zero Trust"]'


@router.get("/hero", response_model=BlogHeroConfig)
def get_blog_hero():
    with Session(engine) as session:
        hero = session.exec(select(BlogHeroConfig)).first()
        if not hero:
            hero = BlogHeroConfig()
            session.add(hero)
            session.commit()
            session.refresh(hero)
        return hero


@router.post("/hero", response_model=BlogHeroConfig)
def upsert_blog_hero(payload: BlogHeroConfigUpdate):
    with Session(engine) as session:
        hero = session.exec(select(BlogHeroConfig)).first()

        if not hero:
            hero = BlogHeroConfig()

        hero.badge_text = payload.badge_text
        hero.headline_prefix = payload.headline_prefix
        hero.headline_highlight = payload.headline_highlight
        hero.headline_suffix = payload.headline_suffix
        hero.description = payload.description
        hero.cta_text = payload.cta_text
        hero.cta_url = payload.cta_url
        hero.read_time_text = payload.read_time_text
        hero.media_type = "image" if payload.media_type == "image" else "video"
        hero.background_image_url = payload.background_image_url
        hero.background_video_url = payload.background_video_url
        hero.card_kicker = payload.card_kicker
        hero.card_title = payload.card_title
        hero.card_description = payload.card_description
        hero.card_tags = payload.card_tags
        hero.updated_at = datetime.utcnow()

        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero


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
