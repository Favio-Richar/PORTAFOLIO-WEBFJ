import os
import logging
import stripe
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Request
from sqlmodel import Session, select

from app.db import engine
from app.models import AdvisoryBooking
from app.core.email import send_email

router = APIRouter()
logger = logging.getLogger(__name__)

# Intentar cargar la key de entorno si existe, sino usar vacio (evita crasheos al arranque)
stripe.api_key = os.getenv("STRIPE_API_KEY", "")

class CheckoutRequest(BaseModel):
    product_name: str
    price_amount: int  # En centavos de USD/MXN segun configuracion
    currency: str = "usd"
    success_url: str
    cancel_url: str
    client_email: str = None
    client_name: str = None

@router.post("/create-checkout-session")
def create_checkout_session(data: CheckoutRequest):
    if not stripe.api_key:
        logger.error("STRIPE_API_KEY no configurado pero se intento crear un pago.")
        raise HTTPException(status_code=500, detail="El sistema de pagos no esta configurado en el servidor.")
    
    try:
        session_data = {
            "payment_method_types": ["card"],
            "line_items": [
                {
                    "price_data": {
                        "currency": data.currency,
                        "product_data": {
                            "name": data.product_name,
                        },
                        "unit_amount": data.price_amount,
                    },
                    "quantity": 1,
                }
            ],
            "mode": "payment",
            "success_url": data.success_url,
            "cancel_url": data.cancel_url,
        }
        
        if data.client_email:
            session_data["customer_email"] = data.client_email
            
        checkout_session = stripe.checkout.Session.create(**session_data)
        return {"url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Error generando checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# STRIPE WEBHOOK — recibe confirmaciones de pago automaticamente
# =============================================================================

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Endpoint que Stripe llama automaticamente cuando un pago se completa.
    Actualiza la reserva de asesoria a 'confirmed' y envia email de confirmacion.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()

    # Si no hay webhook secret configurado, aceptar el evento sin verificar firma
    # (util en desarrollo; en produccion SIEMPRE configurar el secret)
    event = None
    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except stripe.error.SignatureVerificationError:
            logger.warning("Stripe webhook: firma invalida")
            raise HTTPException(status_code=400, detail="Firma de webhook invalida")
        except Exception as e:
            logger.error(f"Stripe webhook error de verificacion: {e}")
            raise HTTPException(status_code=400, detail="Error verificando webhook")
    else:
        import json
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(status_code=400, detail="Payload invalido")
        logger.warning("STRIPE_WEBHOOK_SECRET no configurado — evento aceptado sin verificar firma")

    event_type = event.get("type", "") if isinstance(event, dict) else event.type

    if event_type == "checkout.session.completed":
        session_data = event.get("data", {}).get("object", {}) if isinstance(event, dict) else event.data.object
        customer_email = session_data.get("customer_email") or session_data.get("customer_details", {}).get("email")
        payment_status = session_data.get("payment_status", "")

        logger.info(f"Pago completado - email: {customer_email}, status: {payment_status}")

        # Intentar actualizar booking si el email coincide con una reserva pendiente
        if customer_email and payment_status == "paid":
            try:
                with Session(engine) as db:
                    booking = db.exec(
                        select(AdvisoryBooking)
                        .where(AdvisoryBooking.customer_email == customer_email)
                        .where(AdvisoryBooking.status.in_(["pending", "confirmed"]))
                        .order_by(AdvisoryBooking.created_at.desc())
                    ).first()

                    if booking:
                        booking.status = "confirmed"
                        db.add(booking)
                        db.commit()
                        logger.info(f"Booking {booking.booking_code} confirmado por pago Stripe")

                        # Enviar email de confirmacion al cliente
                        try:
                            send_email(
                                to_email=customer_email,
                                subject=f"Pago confirmado - {booking.service_name}",
                                body=f"""
                                <h1>¡Pago recibido exitosamente!</h1>
                                <p>Hola {booking.customer_name},</p>
                                <p>Tu pago para <strong>{booking.service_name}</strong> ha sido confirmado.</p>
                                <p><strong>Fecha:</strong> {booking.date}</p>
                                <p><strong>Hora:</strong> {booking.time}</p>
                                <p><strong>Codigo:</strong> {booking.booking_code}</p>
                                {f'<p><strong>Link reunión:</strong> <a href="{booking.meeting_link}">{booking.meeting_link}</a></p>' if booking.meeting_link else ''}
                                <hr>
                                <p>Te enviaremos un recordatorio antes de la sesion.</p>
                                """
                            )
                        except Exception as email_err:
                            logger.error(f"Error enviando confirmacion de pago: {email_err}")

                        # Notificar al admin
                        admin_email = os.getenv("EMAIL_RECEIVER", "favio4515@gmail.com")
                        try:
                            send_email(
                                to_email=admin_email,
                                subject=f"PAGO RECIBIDO: {booking.service_name} - {booking.customer_name}",
                                body=f"""
                                <h1>Nuevo pago confirmado</h1>
                                <p><strong>Cliente:</strong> {booking.customer_name}</p>
                                <p><strong>Email:</strong> {customer_email}</p>
                                <p><strong>Servicio:</strong> {booking.service_name}</p>
                                <p><strong>Fecha:</strong> {booking.date} a las {booking.time}</p>
                                <p><strong>Codigo:</strong> {booking.booking_code}</p>
                                """
                            )
                        except Exception as admin_err:
                            logger.error(f"Error notificando admin de pago: {admin_err}")
            except Exception as db_err:
                logger.error(f"Error actualizando booking tras pago: {db_err}")

    return {"status": "ok"}
