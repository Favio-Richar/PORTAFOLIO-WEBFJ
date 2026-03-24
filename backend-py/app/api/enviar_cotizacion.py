import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.db import engine
from app.models import Quote
from app.core.email import send_email  # Asumiendo que existe o usamos Resend directo

router = APIRouter()
logger = logging.getLogger(__name__)

class QuoteCreate(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    mensaje: str

@router.post("/")
async def crear_cotizacion(quote_data: QuoteCreate):
    """Recibe una solicitud de cotización, la guarda en DB y notifica por email"""
    try:
        with Session(engine) as session:
            new_quote = Quote(
                nombre=quote_data.nombre,
                email=quote_data.email,
                telefono=quote_data.telefono,
                mensaje=quote_data.mensaje,
                created_at=datetime.utcnow()
            )
            session.add(new_quote)
            session.commit()
            session.refresh(new_quote)

            # Notificar al Administrador (Favio)
            admin_email = "favio4515@gmail.com"
            try:
                send_email(
                    to_email=admin_email,
                    subject=f"NUEVA COTIZACIÓN: {quote_data.nombre}",
                    html_content=f"""
                        <h1>Nueva solicitud de cotización</h1>
                        <p><strong>Nombre:</strong> {quote_data.nombre}</p>
                        <p><strong>Email:</strong> {quote_data.email}</p>
                        <p><strong>Teléfono:</strong> {quote_data.telefono or 'No provisto'}</p>
                        <p><strong>Mensaje:</strong><br>{quote_data.mensaje}</p>
                        <hr>
                        <p>Gestiona esta solicitud en tu panel administrativo.</p>
                    """
                )
            except Exception as e:
                logger.error(f"Error enviando email a admin: {str(e)}")

            return {"status": "success", "message": "Cotizacion recibida correctamente", "id": new_quote.id}

    except Exception as e:
        logger.error(f"Error procesando cotizacion: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al procesar la solicitud")

@router.get("/admin/list")
async def listar_cotizaciones_admin():
    """Endpoint para que el admin vea todas las cotizaciones"""
    with Session(engine) as session:
        quotes = session.exec(select(Quote).order_by(Quote.created_at.desc())).all()
        return quotes
