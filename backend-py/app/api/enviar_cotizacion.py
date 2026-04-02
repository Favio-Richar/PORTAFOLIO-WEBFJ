import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.db import engine
from app.models import Quote, SystemNotification, LeadCommunication, LeadContactOverride
from app.core.email import send_email
import os

router = APIRouter()
logger = logging.getLogger(__name__)

class QuoteCreate(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    servicio: Optional[str] = "Consulta General"
    mensaje: Optional[str] = ""

@router.post("/")
async def crear_cotizacion(quote_data: QuoteCreate):
    """Recibe una solicitud de cotización, la guarda en DB y notifica por email"""
    try:
        with Session(engine) as session:
            # Combinar servicio y mensaje para la DB si es necesario
            full_message = f"SERVICIO: {quote_data.servicio}\n\nMENSAJE:\n{quote_data.mensaje}" if quote_data.servicio else quote_data.mensaje
            
            new_quote = Quote(
                nombre=quote_data.nombre,
                email=quote_data.email,
                telefono=quote_data.telefono,
                mensaje=full_message,
                created_at=datetime.utcnow()
            )
            session.add(new_quote)
            session.flush() # Asegurar que new_quote.id esté disponible
            
            # Crear notificación en el sistema
            new_notif = SystemNotification(
                title="Nuevo Contacto Web",
                message=f"{quote_data.nombre} solicita información sobre '{quote_data.servicio}'.",
                type="info",
                link="/admin/quotes/leads"
            )
            session.add(new_notif)
            
            # Guardar en el historial de comunicaciones (Chat inicial)
            initial_comm = LeadCommunication(
                lead_id=new_quote.id,
                lead_type="quote",
                sender="client",
                content=full_message,
                channel="email",
                direction="incoming"
            )
            session.add(initial_comm)
            
            session.commit()
            session.refresh(new_quote)

            # Persistencia en motor de Leads (LeadContactOverride)
            if quote_data.email and quote_data.telefono:
                email_norm = str(quote_data.email).strip().lower()
                existing_lead = session.exec(
                    select(LeadContactOverride).where(LeadContactOverride.email == email_norm)
                ).first()
                if existing_lead:
                    existing_lead.phone = quote_data.telefono
                    existing_lead.updated_at = datetime.utcnow()
                else:
                    new_lead = LeadContactOverride(
                        email=email_norm,
                        phone=quote_data.telefono,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    session.add(new_lead)
                session.commit()

            # Notificar al Administrador
            admin_email = os.getenv("EMAIL_RECEIVER", "ing@nextlevelsoftwarepro.com")
            try:
                send_email(
                    to_email=admin_email,
                    subject=f"NUEVO CONTACTO WEB ({quote_data.servicio}): {quote_data.nombre}",
                    html_content=f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #1a202c; padding: 20px;">
                            <h1 style="color: #0047FF; border-bottom: 2px solid #0047FF; padding-bottom: 10px;">Nueva solicitud de contacto</h1>
                            <p><strong>De:</strong> {quote_data.nombre}</p>
                            <p><strong>Email:</strong> {quote_data.email}</p>
                            <p><strong>Teléfono:</strong> {quote_data.telefono or 'No provisto'}</p>
                            <p><strong>Servicio de Interés:</strong> <span style="background: #edf2f7; padding: 2px 5px; font-weight: bold;">{quote_data.servicio}</span></p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p><strong>Mensaje del cliente:</strong></p>
                            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #0047FF;">
                                {quote_data.mensaje.replace('\n', '<br>')}
                            </div>
                            <br>
                            <p style="font-size: 12px; color: #718096;">Gestiona este cliente en tu <a href="http://localhost:3000/admin/quotes" style="color: #0047FF;">Dashboard Administrativo</a>.</p>
                        </div>
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
