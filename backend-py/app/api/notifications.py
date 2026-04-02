import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models import SystemNotification
from app.core.admin_auth import require_admin

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[SystemNotification])
def get_notifications(
    limit: int = 20, 
    current_user = Depends(require_admin)
):
    """Obtiene las últimas 20 notificaciones del sistema"""
    with Session(engine) as session:
        return session.exec(
            select(SystemNotification)
            .order_by(SystemNotification.created_at.desc())
            .limit(limit)
        ).all()

@router.get("/unread-count")
def get_unread_count(
    current_user = Depends(require_admin)
):
    """Devuelve la cantidad de notificaciones sin leer"""
    with Session(engine) as session:
        # sqlmodel doesn't have .count() directly on exec in early versions so we do len() or count trick
        # A more efficient count:
        from sqlalchemy import func
        statement = select(func.count()).select_from(SystemNotification).where(SystemNotification.is_read == False)
        count = session.exec(statement).one()
        return {"unread_count": count}

@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user = Depends(require_admin)
):
    """Marca una notificación específica como leída"""
    with Session(engine) as session:
        notif = session.get(SystemNotification, notification_id)
        if not notif:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        notif.is_read = True
        session.add(notif)
        session.commit()
        return {"success": True, "id": notification_id}

@router.patch("/read-all")
def mark_all_as_read(
    current_user = Depends(require_admin)
):
    """Marca todas las notificaciones como leídas de forma masiva (Senior Optimization)"""
    from sqlalchemy import update
    with Session(engine) as session:
        statement = update(SystemNotification).where(SystemNotification.is_read == False).values(is_read=True)
        session.exec(statement)
        session.commit()
        return {"success": True}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user = Depends(require_admin)
):
    """Elimina una notificación específica"""
    with Session(engine) as session:
        notif = session.get(SystemNotification, notification_id)
        if not notif:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        session.delete(notif)
        session.commit()
        return {"success": True, "id": notification_id}

@router.delete("/clear-all")
def clear_all_notifications(
    current_user = Depends(require_admin)
):
    """Elimina todas las notificaciones de la base de datos de forma atómica (Senior Optimization)"""
    from sqlalchemy import delete
    with Session(engine) as session:
        statement = delete(SystemNotification)
        session.exec(statement)
        session.commit()
        return {"success": True}
