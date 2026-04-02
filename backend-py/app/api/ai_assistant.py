import logging
import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import engine
from app.models import ProfessionalPlan, Proyecto, ServiceAdvisoryCard

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    response: str
    action: Optional[str] = None  # 'whatsapp', 'booking', None

def get_system_context():
    """Recupera datos del sistema para alimentar la respuesta de la IA"""
    with Session(engine) as session:
        proyectos = session.exec(select(Proyecto).limit(3)).all()
        servicios = session.exec(select(ServiceAdvisoryCard).limit(3)).all()
        planes = session.exec(select(ProfessionalPlan).limit(3)).all()
        
        context = "Servicios disponibles: " + ", ".join([s.title for s in servicios])
        context += ". Proyectos destacados: " + ", ".join([p.title for p in proyectos])
        return context

@router.post("/chat", response_model=ChatResponse)
async def ai_chat_handler(request: ChatRequest):
    msg = request.message.lower()
    context = get_system_context()
    
    # Lógica de "Smart Bridge" (Puente Inteligente)
    # Si no hay API Key de OpenAI, usamos reglas de negocio avanzadas (Smart Fallback)
    
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if not openai_key:
        # --- SMART FALLBACK LOGIC ---
        if any(word in msg for word in ["cotizar", "precio", "costo", "cuanto", "valer", "presupuesto"]):
            return {
                "response": "Entiendo, cada proyecto es único y me encantaría que recibieras una cotización exacta. Como soy un asistente virtual, ¿te gustaría que te conecte directamente por WhatsApp con uno de nuestros ingenieros para hablar de los detalles?",
                "action": "whatsapp_offer"
            }
        
        if any(word in msg for word in ["hola", "buen", "dia", "tarde", "quien", "ayuda"]):
            return {
                "response": "¡Hola! Soy el asistente virtual inteligente de FJ Digital Engineering. Estoy aquí para resolver tus dudas sobre nuestros servicios de desarrollo y automatización. ¿Cuentas con un proyecto en mente o buscas información general?",
                "action": None
            }

        if any(word in msg for word in ["agendar", "cita", "reunion", "hablar", "asesoria", "entrevista"]):
            return {
                "response": "¡Claro que sí! Una reunión es el mejor paso para entender tu negocio. Contamos con una sección dedicada para agendar asesorías. ¿Te gustaría que te comparta el enlace directo?",
                "action": "booking_offer"
            }
            
        if any(word in msg for word in ["si", "claro", "por favor", "ok", "bueno", "dale"]):
            # Respuesta comodin para afirmaciones
            return {
                "response": "¡Excelente! Si buscabas conversar con un ingeniero, te dejo nuestro canal directo aquí.",
                "action": "whatsapp"
            }

        return {
            "response": "Comprendo lo que me comentas. Para poder darte el mejor servicio técnico y personalizado de parte de nuestra agencia, lo ideal sería que converses con uno de nuestros ingenieros especialistas. ¿Deseas que te derive a nuestro canal directo de WhatsApp?",
            "action": "whatsapp_offer"
        }
    
    # --- LLM INTEGRATION (OpenAI/Anthropic) ---
    # Aqui iria la llamada a LangChain o SDK de OpenAI usando el context recolectado
    # Por ahora mantenemos el orquestador listo para el API KEY.
    return {
        "response": "El motor de IA Avanzada esta listo. Por favor, configura tu OPENAI_API_KEY para habilitar respuestas generativas completas.",
        "action": None
    }
