from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, Session, select

from app.db import engine
from app.models import Blog, BlogHeroConfig, BlogHeroSlide
from app.core.admin_auth import require_admin

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


class BlogHeroSlideCreate(SQLModel):
    media_type: str = "image"
    background_image_url: Optional[str] = None
    background_video_url: Optional[str] = None
    card_kicker: str = "Radar Tecnologico 2026"
    card_title: str = "3 tendencias que estan cambiando el desarrollo"
    card_description: str = "IA agentes, cloud eficiente y seguridad zero trust para productos reales."
    card_tags: Optional[str] = '["LLM OPS","CLOUD NATIVE","ZERO TRUST"]'
    is_active: bool = True
    order_index: Optional[int] = None


class BlogHeroSlideUpdate(SQLModel):
    media_type: Optional[str] = None
    background_image_url: Optional[str] = None
    background_video_url: Optional[str] = None
    card_kicker: Optional[str] = None
    card_title: Optional[str] = None
    card_description: Optional[str] = None
    card_tags: Optional[str] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None


class BlogHeroSlideReorder(SQLModel):
    ids: List[int]


class BlogCardCreate(SQLModel):
    title: str
    content: str
    author: Optional[str] = "Equipo Editorial"
    category: Optional[str] = "General"
    tags: Optional[str] = None
    main_image_url: Optional[str] = None
    is_published: bool = True


class BlogCardUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    main_image_url: Optional[str] = None
    is_published: Optional[bool] = None


def _normalize_media_type(value: Optional[str]) -> str:
    return "video" if value == "video" else "image"


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
def upsert_blog_hero(
    payload: BlogHeroConfigUpdate,
    current_user=Depends(require_admin),
):
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


@router.get("/hero/slides", response_model=List[BlogHeroSlide])
def list_blog_hero_slides():
    with Session(engine) as session:
        slides = session.exec(
            select(BlogHeroSlide).order_by(BlogHeroSlide.order_index.asc(), BlogHeroSlide.id.asc())
        ).all()
        return slides


@router.post("/hero/slides", response_model=BlogHeroSlide)
def create_blog_hero_slide(
    payload: BlogHeroSlideCreate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        if payload.order_index is None:
            last = session.exec(select(BlogHeroSlide).order_by(BlogHeroSlide.order_index.desc())).first()
            next_order = (last.order_index + 1) if last else 0
        else:
            next_order = payload.order_index

        slide = BlogHeroSlide(
            media_type=_normalize_media_type(payload.media_type),
            background_image_url=payload.background_image_url,
            background_video_url=payload.background_video_url,
            card_kicker=payload.card_kicker,
            card_title=payload.card_title,
            card_description=payload.card_description,
            card_tags=payload.card_tags,
            is_active=payload.is_active,
            order_index=next_order,
            updated_at=datetime.utcnow(),
        )
        session.add(slide)
        session.commit()
        session.refresh(slide)
        return slide


@router.post("/hero/slides/reorder", response_model=List[BlogHeroSlide])
def reorder_blog_hero_slides(
    payload: BlogHeroSlideReorder,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        ids_to_position = {slide_id: index for index, slide_id in enumerate(payload.ids)}
        slides = session.exec(select(BlogHeroSlide)).all()

        for slide in slides:
            if slide.id in ids_to_position:
                slide.order_index = ids_to_position[slide.id]
                slide.updated_at = datetime.utcnow()
                session.add(slide)

        session.commit()
        ordered = session.exec(
            select(BlogHeroSlide).order_by(BlogHeroSlide.order_index.asc(), BlogHeroSlide.id.asc())
        ).all()
        return ordered


@router.patch("/hero/slides/{slide_id}", response_model=BlogHeroSlide)
def update_blog_hero_slide(
    slide_id: int,
    payload: BlogHeroSlideUpdate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        slide = session.get(BlogHeroSlide, slide_id)
        if not slide:
            raise HTTPException(status_code=404, detail="Slide no encontrado")

        if payload.media_type is not None:
            slide.media_type = _normalize_media_type(payload.media_type)
        if payload.background_image_url is not None:
            slide.background_image_url = payload.background_image_url
        if payload.background_video_url is not None:
            slide.background_video_url = payload.background_video_url
        if payload.card_kicker is not None:
            slide.card_kicker = payload.card_kicker
        if payload.card_title is not None:
            slide.card_title = payload.card_title
        if payload.card_description is not None:
            slide.card_description = payload.card_description
        if payload.card_tags is not None:
            slide.card_tags = payload.card_tags
        if payload.is_active is not None:
            slide.is_active = payload.is_active
        if payload.order_index is not None:
            slide.order_index = payload.order_index

        slide.updated_at = datetime.utcnow()
        session.add(slide)
        session.commit()
        session.refresh(slide)
        return slide


@router.delete("/hero/slides/{slide_id}")
def delete_blog_hero_slide(
    slide_id: int,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        slide = session.get(BlogHeroSlide, slide_id)
        if not slide:
            raise HTTPException(status_code=404, detail="Slide no encontrado")
        session.delete(slide)
        session.commit()
        return {"message": "Slide eliminado"}


@router.post("/", response_model=Blog)
def create_blog(
    item: BlogCardCreate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        blog = Blog(
            title=item.title.strip(),
            content=item.content.strip(),
            author=(item.author or "Equipo Editorial").strip(),
            category=(item.category or "General").strip(),
            tags=item.tags,
            main_image_url=item.main_image_url,
            is_published=item.is_published,
            created_at=datetime.utcnow(),
        )
        session.add(blog)
        session.commit()
        session.refresh(blog)
        return blog


@router.get("/", response_model=List[Blog])
def list_blogs():
    with Session(engine) as session:
        return session.exec(select(Blog).order_by(Blog.created_at.desc(), Blog.id.desc())).all()


@router.get("/{item_id}", response_model=Blog)
def get_blog(item_id: int):
    with Session(engine) as session:
        item = session.get(Blog, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        return item


@router.put("/{item_id}", response_model=Blog)
def update_blog(
    item_id: int,
    payload: BlogCardCreate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        item = session.get(Blog, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")

        item.title = payload.title.strip()
        item.content = payload.content.strip()
        item.author = (payload.author or "Equipo Editorial").strip()
        item.category = (payload.category or "General").strip()
        item.tags = payload.tags
        item.main_image_url = payload.main_image_url
        item.is_published = payload.is_published

        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.patch("/{item_id}", response_model=Blog)
def patch_blog(
    item_id: int,
    payload: BlogCardUpdate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        item = session.get(Blog, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")

        if payload.title is not None:
            item.title = payload.title.strip()
        if payload.content is not None:
            item.content = payload.content.strip()
        if payload.author is not None:
            item.author = payload.author.strip() or "Equipo Editorial"
        if payload.category is not None:
            item.category = payload.category.strip() or "General"
        if payload.tags is not None:
            item.tags = payload.tags
        if payload.main_image_url is not None:
            item.main_image_url = payload.main_image_url
        if payload.is_published is not None:
            item.is_published = payload.is_published

        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.delete("/{item_id}")
def delete_blog(
    item_id: int,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        item = session.get(Blog, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        session.delete(item)
        session.commit()
        return {"message": "Blog eliminado"}


@router.post("/bootstrap")
def bootstrap_blogs():
    with Session(engine) as session:
        # Limpiar antiguos
        session.execute(text("DELETE FROM blog"))
        session.commit()

        real_data = [
            {
                "title": "Como un sistema de reservas aumento 200% las ventas de un hotel",
                "category": "Casos de Exito",
                "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
                "content": "Caso real de implementacion de reservas online con pagos integrados y automatizacion operativa."
            },
            {
                "title": "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
                "category": "Guias Practicas",
                "image": "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
                "content": "Comparativa clara entre alternativas de facturacion para crecer con orden financiero."
            },
            {
                "title": "5 errores costosos en gestion de inventario y como evitarlos",
                "category": "Tips y Consejos",
                "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
                "content": "Lecciones practicas para ecommerce y retail enfocadas en reposicion y control de stock."
            },
            {
                "title": "Por que un restaurante necesita un POS moderno para escalar operaciones",
                "category": "Industria",
                "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
                "content": "Integracion de caja, cocina y delivery para decisiones de negocio con datos reales."
            },
            {
                "title": "Seguridad web para empresas: controles minimos para operar sin riesgo",
                "category": "Seguridad",
                "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
                "content": "Checklist tecnico para proteger datos y continuidad operativa en aplicaciones web."
            },
            {
                "title": "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
                "category": "Estrategia",
                "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
                "content": "Comparativa de costo, velocidad y flexibilidad para decidir la mejor ruta de producto."
            },
            {
                "title": "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
                "category": "Tips y Consejos",
                "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
                "content": "Estrategias para reducir mora con recordatorios, reglas de cobro y seguimiento automatizado."
            },
            {
                "title": "Ecommerce profesional: que necesita una tienda para vender de forma estable",
                "category": "Industria",
                "image": "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&q=80&w=1200",
                "content": "Base operativa para vender online con catalogo, inventario, pagos y soporte conectados."
            }
        ]

        for data in real_data:
            rich_content = f"<strong>Contexto {data['category']}: {data['title']}.</strong><br/><br/>" \
                           f"{data['content']}<br/><br/>" \
                           "Diagnostico practico del escenario actual con foco en conversion, operacion y escalabilidad.<br/><br/>" \
                           "Recomendaciones accionables para implementar mejoras por etapas y medir impacto de forma semanal.<br/><br/>" \
                           "<strong>Puntos clave de implementacion:</strong><br/>" \
                           "- Definir una meta operativa concreta para este tema.<br/>" \
                           "- Priorizar acciones de alto impacto con baja complejidad inicial.<br/>" \
                           "- Medir avance con indicadores semanales y ajustes iterativos.<br/><br/>" \
                           "<strong>Plan de accion sugerido:</strong> Aplicar un enfoque por etapas de diagnostico, implementacion controlada y optimizacion continua."

            blog = Blog(
                title=data["title"],
                content=rich_content,
                category=data["category"],
                author="Equipo Editorial",
                main_image_url=data["image"],
                is_published=True,
                created_at=datetime.utcnow()
            )
            session.add(blog)
        
        session.commit()
        return {"message": f"Sincronizados {len(real_data)} articulos con exito"}
