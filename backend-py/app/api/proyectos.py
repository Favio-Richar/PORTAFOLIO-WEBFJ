from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import json
import logging
from pydantic import BaseModel
from sqlmodel import Session, select
from app.db import engine
from app.models import Proyecto
from app.core.admin_auth import require_admin

logger = logging.getLogger(__name__)

router = APIRouter()


# -- Helpers seguros de serializacion -----------------------------------------

def _safe_json_str(value) -> Optional[str]:
    """Garantiza que un valor quede como string JSON valido."""
    if value is None:
        return None
    if isinstance(value, str):
        # Verificar que sea JSON valido
        try:
            json.loads(value)
            return value
        except (json.JSONDecodeError, ValueError):
            # Si no es JSON, serializarlo
            return json.dumps(value, ensure_ascii=False)
    try:
        return json.dumps(value, ensure_ascii=False)
    except (TypeError, ValueError):
        return None


def _safe_parse(value) -> object:
    """Parsea un campo que puede ser string JSON o ya ser el tipo correcto."""
    if value is None:
        return None
    if isinstance(value, str):
        trimmed = value.strip()
        if not trimmed:
            return None
        try:
            return json.loads(trimmed)
        except (json.JSONDecodeError, ValueError):
            return value
    return value


def _project_to_dict(item: Proyecto) -> dict:
    """Convierte un Proyecto a dict con campos JSON correctamente parseados."""
    created_at = getattr(item, "created_at", None)
    return {
        "id": item.id,
        "title": item.title or "",
        "category": item.category or "otro",
        "status": item.status or "",
        "version": item.version or "",
        "description": item.description or "",
        "image_url": item.image_url or "",
        "video_url": item.video_url,
        # media y stack se devuelven parseados para que el frontend los reciba como listas
        "media": _safe_parse(item.media) or [],
        "stack": _safe_parse(item.stack) or [],
        # results se devuelve como string JSON (el frontend lo parsea)
        "results": item.results or "{}",
        "demo_url": item.demo_url or "",
        "repo_url": item.repo_url or "",
        "deployment_date": item.deployment_date,
        "client_name": item.client_name,
        "year": item.year,
        "created_at": str(created_at) if created_at else None,
    }


# -- Schemas ------------------------------------------------------------------

class ProyectoCreate(BaseModel):
    title: str
    category: str
    status: str
    version: str
    description: str
    image_url: str
    video_url: Optional[str] = None
    media: Optional[str] = "[]"
    demo_url: str
    repo_url: str
    stack: str  # JSON list string
    results: Optional[str] = "{}"
    deployment_date: Optional[str] = None
    client_name: Optional[str] = None
    year: Optional[str] = None


class ProyectoUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    media: Optional[str] = None
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    stack: Optional[str] = None
    results: Optional[str] = None
    deployment_date: Optional[str] = None
    client_name: Optional[str] = None
    year: Optional[str] = None


# -- Endpoints ----------------------------------------------------------------

@router.get("")
def list_proyectos():
    """Lista todos los proyectos ordenados de forma estable."""
    with Session(engine) as session:
        items = session.exec(select(Proyecto)).all()
        # Ordenamiento estable: por id como fallback consistente
        items_sorted = sorted(items, key=lambda p: p.id or 0)
        return [_project_to_dict(item) for item in items_sorted]


@router.get("/{item_id}")
def get_proyecto(item_id: int):
    with Session(engine) as session:
        item = session.get(Proyecto, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Proyecto not found")
        return _project_to_dict(item)


@router.post("")
def create_proyecto(
    data: ProyectoCreate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        payload = data.model_dump()

        # Garantizar que media y stack sean strings JSON validos
        payload["media"] = _safe_json_str(payload.get("media")) or "[]"
        payload["stack"] = _safe_json_str(payload.get("stack")) or "[]"
        payload["results"] = _safe_json_str(payload.get("results")) or "{}"

        item = Proyecto(**payload)
        session.add(item)
        session.commit()
        session.refresh(item)
        return _project_to_dict(item)


@router.put("/{item_id}")
def update_proyecto(
    item_id: int,
    data: ProyectoUpdate,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        item = session.get(Proyecto, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Proyecto not found")

        values = data.model_dump(exclude_unset=True)

        # Garantizar serializacion segura para campos JSON
        for json_field in ("media", "stack", "results"):
            if json_field in values and values[json_field] is not None:
                values[json_field] = _safe_json_str(values[json_field]) or (
                    "[]" if json_field in ("media", "stack") else "{}"
                )

        for key, value in values.items():
            setattr(item, key, value)

        session.add(item)
        session.commit()
        session.refresh(item)
        return _project_to_dict(item)


@router.delete("/{item_id}")
def delete_proyecto(
    item_id: int,
    current_user=Depends(require_admin),
):
    with Session(engine) as session:
        item = session.get(Proyecto, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Proyecto not found")

        # Intentar borrar media de Cloudinary antes de eliminar
        try:
            from app.utils.cloudinary_helper import delete_cloudinary_by_url

            media_list = _safe_parse(item.media) or []
            if isinstance(media_list, list):
                for m in media_list:
                    url = m.get("url", "") if isinstance(m, dict) else ""
                    rtype = m.get("resource_type", "image") if isinstance(m, dict) else "image"
                    if url:
                        delete_cloudinary_by_url(url, rtype)
            if item.image_url:
                delete_cloudinary_by_url(item.image_url, "image")
            if item.video_url:
                delete_cloudinary_by_url(item.video_url, "video")
        except Exception as e:
            logger.warning("No se pudo limpiar Cloudinary al borrar proyecto %s: %s", item_id, e)

        session.delete(item)
        session.commit()
        return {"message": "Proyecto deleted"}
