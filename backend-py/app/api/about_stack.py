from datetime import datetime
import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import engine
from app.models import AboutStackItem
from app.core.admin_auth import require_admin

router = APIRouter()


class AboutStackCreate(BaseModel):
    name: str
    icon_key: Optional[str] = None
    order_index: int = 0
    active: bool = True


class AboutStackUpdate(BaseModel):
    name: str
    icon_key: Optional[str] = None
    order_index: int = 0
    active: bool = True


DEFAULT_STACK_ITEMS = [
    {"name": "React", "icon_key": "react", "color": "#61DAFB"},
    {"name": "Next.js", "icon_key": "nextjs", "color": "#F8FAFC"},
    {"name": "Node.js", "icon_key": "nodejs", "color": "#339933"},
    {"name": "Python", "icon_key": "python", "color": "#3776AB"},
    {"name": "AWS", "icon_key": "aws", "color": "#FF9900"},
    {"name": "Docker", "icon_key": "docker", "color": "#2496ED"},
    {"name": "PostgreSQL", "icon_key": "postgresql", "color": "#4169E1"},
    {"name": "MongoDB", "icon_key": "mongodb", "color": "#47A248"},
    {"name": "GraphQL", "icon_key": "graphql", "color": "#E10098"},
    {"name": "TypeScript", "icon_key": "typescript", "color": "#3178C6"},
    {"name": "Kubernetes", "icon_key": "kubernetes", "color": "#326CE5"},
    {"name": "TensorFlow", "icon_key": "tensorflow", "color": "#FF6F00"},
]

DEFAULT_STACK_COLOR = "#94A3B8"

ICON_COLOR_MAP = {item["icon_key"]: item["color"] for item in DEFAULT_STACK_ITEMS}
ICON_COLOR_MAP.update({
    "angular": "#DD0031",
})

NAME_ICON_ALIASES = {
    "react": "react",
    "nextjs": "nextjs",
    "nodejs": "nodejs",
    "python": "python",
    "aws": "aws",
    "docker": "docker",
    "postgresql": "postgresql",
    "mongodb": "mongodb",
    "graphql": "graphql",
    "typescript": "typescript",
    "kubernetes": "kubernetes",
    "tensorflow": "tensorflow",
    "angular": "angular",
    "next": "nextjs",
    "node": "nodejs",
    "postgres": "postgresql",
    "postgre": "postgresql",
    "ts": "typescript",
    "k8s": "kubernetes",
    "tf": "tensorflow",
    "angula": "angular",
}


def _normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower().strip())


def _canonicalize_icon_key(value: str) -> str:
    key = _normalize_key(value)
    if not key:
        return ""

    # Remove common version suffixes: angular18, reactv19, etc.
    key = re.sub(r"(v)?\d+$", "", key) or key

    if key in NAME_ICON_ALIASES:
        return NAME_ICON_ALIASES[key]

    if key in ICON_COLOR_MAP:
        return key

    token_aliases = [
        ("angular", "angular"),
        ("angula", "angular"),
        ("react", "react"),
        ("next", "nextjs"),
        ("node", "nodejs"),
        ("python", "python"),
        ("amazonwebservices", "aws"),
        ("aws", "aws"),
        ("docker", "docker"),
        ("postgres", "postgresql"),
        ("mongo", "mongodb"),
        ("graphql", "graphql"),
        ("typescript", "typescript"),
        ("kubernetes", "kubernetes"),
        ("tensor", "tensorflow"),
    ]

    for token, target in token_aliases:
        if token in key:
            return target

    return key


def _resolve_icon_key(name: str, icon_key: Optional[str]) -> str:
    normalized_icon = _canonicalize_icon_key(icon_key or "")
    if normalized_icon:
        return normalized_icon

    normalized_name = _canonicalize_icon_key(name)
    return NAME_ICON_ALIASES.get(normalized_name, normalized_name)


def _resolve_stack_color(name: str, icon_key: Optional[str]) -> str:
    resolved_icon = _resolve_icon_key(name, icon_key)
    if resolved_icon in ICON_COLOR_MAP:
        return ICON_COLOR_MAP[resolved_icon]

    normalized_name = _canonicalize_icon_key(name)
    aliased_icon = NAME_ICON_ALIASES.get(normalized_name)
    if aliased_icon and aliased_icon in ICON_COLOR_MAP:
        return ICON_COLOR_MAP[aliased_icon]

    return DEFAULT_STACK_COLOR


def _seed_defaults_if_empty(session: Session) -> None:
    existing = session.exec(select(AboutStackItem.id).limit(1)).first()
    if existing:
        return

    for index, item in enumerate(DEFAULT_STACK_ITEMS):
        session.add(
            AboutStackItem(
                name=item["name"],
                icon_key=item.get("icon_key"),
                color=item.get("color"),
                order_index=index,
                active=True,
            )
        )
    session.commit()


@router.get("", response_model=List[AboutStackItem])
def get_about_stack_items():
    with Session(engine) as session:
        _seed_defaults_if_empty(session)
        return session.exec(
            select(AboutStackItem).order_by(AboutStackItem.order_index.asc(), AboutStackItem.id.asc())
        ).all()


@router.post("", response_model=AboutStackItem)
def create_about_stack_item(
    payload: AboutStackCreate,
    current_user=Depends(require_admin),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="El nombre es requerido.")

    resolved_icon_key = _resolve_icon_key(name, payload.icon_key)
    resolved_color = _resolve_stack_color(name, payload.icon_key)

    with Session(engine) as session:
        item = AboutStackItem(
            name=name,
            icon_key=resolved_icon_key,
            color=resolved_color,
            order_index=payload.order_index,
            active=payload.active,
            updated_at=datetime.utcnow(),
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.put("/{item_id}", response_model=AboutStackItem)
def update_about_stack_item(
    item_id: int,
    payload: AboutStackUpdate,
    current_user=Depends(require_admin),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="El nombre es requerido.")

    resolved_icon_key = _resolve_icon_key(name, payload.icon_key)
    resolved_color = _resolve_stack_color(name, payload.icon_key)

    with Session(engine) as session:
        item = session.get(AboutStackItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item no encontrado.")

        item.name = name
        item.icon_key = resolved_icon_key
        item.color = resolved_color
        item.order_index = payload.order_index
        item.active = payload.active
        item.updated_at = datetime.utcnow()

        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.delete("/{item_id}")
def delete_about_stack_item(
    item_id: int,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        item = session.get(AboutStackItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item no encontrado.")
        session.delete(item)
        session.commit()
        return {"message": "Stack item eliminado"}
