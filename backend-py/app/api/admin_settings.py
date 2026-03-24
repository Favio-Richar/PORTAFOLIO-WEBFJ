from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from app.db import get_session
from app.models import User, GlobalSetting
from app.core.admin_auth import require_admin
from pydantic import BaseModel
from datetime import datetime
import os
import resend
from app.core.meeting_integrations import provider_is_configured, _google_access_token, _microsoft_graph_token
from app.core.settings import get_setting_value

router = APIRouter()

# --- SCHEMAS ---

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, Dict[str, Any]]
    providers: List[Dict[str, Any]]

class SettingUpdate(BaseModel):
    key: str
    value: str

class SettingResponse(BaseModel):
    key: str
    value: str
    description: Optional[str]
    group: str
    is_sensitive: bool
    updated_at: datetime

# --- ENDPOINTS ---

@router.get("/admin/health", response_model=HealthResponse)
def get_system_health(
    current_user: Optional[User] = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Verifica el estado de las integraciones externas sin exponer secretos."""
    services = {}
    
    # Check Resend
    resend_key = os.getenv("RESEND_API_KEY")
    if not resend_key:
        services["resend"] = {"status": "error", "message": "API Key no configurada en .env"}
    else:
        try:
            # Una prueba rápida: listar dominios o similar (sin enviar nada)
            # resend.api_key = resend_key
            # resend.Domains.list()
            services["resend"] = {"status": "ok", "message": "API Key configurada"}
        except Exception as e:
            services["resend"] = {"status": "error", "message": str(e)}

    # Check Google Calendar
    try:
        # Intentamos generar un token (esto valida el JSON de la Service Account)
        _google_access_token()
        services["google_calendar"] = {"status": "ok", "message": "Conexión exitosa con Google APIs"}
    except Exception as e:
        services["google_calendar"] = {"status": "error", "message": str(e)}

    # Check Teams
    try:
        # Solo si está configurado intentamos el token
        if os.getenv("TEAMS_CLIENT_ID"):
            _microsoft_graph_token()
            services["teams"] = {"status": "ok", "message": "Conexión exitosa con Microsoft Graph"}
        else:
            services["teams"] = {"status": "warning", "message": "No configurado"}
    except Exception as e:
        services["teams"] = {"status": "error", "message": str(e)}

    # Check Providers availability
    providers = []
    for p in ["google_meet", "teams", "jitsi"]:
        providers.append({
            "id": p,
            "configured": provider_is_configured(p),
            "is_default": get_setting_value(session, "default_meeting_provider", "google_meet") == p
        })

    return {
        "status": "ok",
        "services": services,
        "providers": providers
    }

@router.get("/admin/settings", response_model=List[SettingResponse])
def get_admin_settings(
    current_user: Optional[User] = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Retorna todas las configuraciones. Si es sensible, el valor se oculta en parte."""
    settings = session.exec(select(GlobalSetting)).all()
    
    # Si no hay configuraciones, creamos las básicas por defecto
    if not settings:
        defaults = [
            ("maintenance_mode", "false", "Activa el modo mantenimiento en todo el sitio", "system"),
            ("booking_auto_confirm", "true", "Confirma automáticamente las nuevas reservas", "advisory"),
            ("reminder_24h_enabled", "true", "Envía recordatorios 24h antes de la cita", "advisory"),
            ("reminder_1h_enabled", "true", "Envía recordatorios 1h antes de la cita", "advisory"),
            ("default_meeting_provider", "google_meet", "Proveedor de reuniones por defecto", "advisory"),
            ("booking_min_advance_hours", "2", "Horas mínimas de anticipación para reservar", "advisory"),
        ]
        for key, val, desc, grp in defaults:
            s = GlobalSetting(key=key, value=val, description=desc, group=grp)
            session.add(s)
        session.commit()
        settings = session.exec(select(GlobalSetting)).all()

    result = []
    for s in settings:
        val = s.value
        if s.is_sensitive and val:
            val = f"{val[:4]}****{val[-4:]}" if len(val) > 8 else "****"
            
        result.append(SettingResponse(
            key=s.key,
            value=val,
            description=s.description,
            group=s.group,
            is_sensitive=s.is_sensitive,
            updated_at=s.updated_at
        ))
    
    return result

@router.patch("/admin/settings")
def update_admin_settings(
    updates: List[SettingUpdate],
    current_user: Optional[User] = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """Actualiza configuraciones en lote."""
    for item in updates:
        db_setting = session.exec(select(GlobalSetting).where(GlobalSetting.key == item.key)).first()
        if db_setting:
            db_setting.value = item.value
            db_setting.updated_at = datetime.utcnow()
            session.add(db_setting)
        else:
            # Si no existe, lo creamos
            new_s = GlobalSetting(key=item.key, value=item.value)
            session.add(new_s)
            
    session.commit()
    return {"message": "Configuraciones actualizadas correctamente"}

@router.post("/admin/test-email")
def test_email_config(
    current_user: Optional[User] = Depends(require_admin)
):
    """Prueba el envío de un correo usando la configuración actual de Resend."""
    from app.core.email import send_email

    if current_user is None:
        raise HTTPException(status_code=401, detail="Autenticacion requerida")
    
    success = send_email(
        to_email=current_user.email,
        subject="🚀 Prueba de Conexión - Portafolio Admin",
        body=f"<h1>Hola {current_user.full_name}</h1><p>Esta es una prueba exitosa de la integración con Resend.</p><p>Enviado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="No se pudo enviar el correo de prueba. Revisa los logs del servidor.")
        
    return {"message": f"Correo de prueba enviado a {current_user.email}"}
