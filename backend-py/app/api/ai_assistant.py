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
        if any(word in msg for word in ["cotizar", "precio", "costo", "cuanto", "valer"]):
            return {
                "response": f"Para darte un presupuesto exacto necesito conocer mas de tu proyecto. {context}. ¿Te gustaria que te redirija a WhatsApp para hablar con un especialista?",
                "action": "whatsapp"
            }
        
        if any(word in msg for word in ["hola", "buen", "quien", "ayuda"]):
            return {
                "response": "Hola! Soy el asistente virtual de FJ Digital Engineering. Puedo ayudarte con informacion sobre nuestros servicios de desarrollo, asesorias TI y automatizacion. ¿En que puedo apoyarte hoy?",
                "action": None
            }

        if any(word in msg for word in ["agendar", "cita", "reunion", "hablar", "asesoria"]):
            return {
                "response": "Puedes agendar una asesoria tecnica estrategica directamente en nuestra plataforma para que analicemos tu caso a fondo.",
                "action": "booking"
            }

        return {
            "response": "Entiendo. Tenemos amplia experiencia en ingenieria digital y automatizacion. ¿Te gustaria conocer mas sobre nuestros servicios o hablar con un humano por WhatsApp?",
            "action": "whatsapp"
        }
    
    # --- LLM INTEGRATION (OpenAI/Anthropic) ---
    # Aqui iria la llamada a LangChain o SDK de OpenAI usando el context recolectado
    # Por ahora mantenemos el orquestador listo para el API KEY.
    return {
        "response": "El motor de IA Avanzada esta listo. Por favor, configura tu OPENAI_API_KEY para habilitar respuestas generativas completas.",
        "action": None
    }
