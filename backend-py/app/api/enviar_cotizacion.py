from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, EmailStr

router = APIRouter()


class CotizacionRequest(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str | None = None
    mensaje: str


@router.post("/", status_code=202)
def enviar_cotizacion(payload: CotizacionRequest, background_tasks: BackgroundTasks):
    # Placeholder: add background task to send email or persist the quote.
    # In production add a real email sender (SMTP, SendGrid, etc.)
    def _fake_send(p: CotizacionRequest):
        print("Enviar cotizacion:", p.dict())

    background_tasks.add_task(_fake_send, payload)
    return {"status": "accepted"}
