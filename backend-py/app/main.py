import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv(override=True)

from app.api import (
    about_stack,
    ads,
    admin_settings,
    ai_assistant,
    asesoria,
    auth,
    blog,
    casos_completos,
    casos_exito,
    certifications,
    chat,
    contact,
    education,
    enviar_cotizacion,
    experience,
    media,
    profile,
    proyectos,
    reviews,
    services_page,
    subscribers,
    team,
    timeline,
    upload,
)
from app.core.advisory_reminders import (
    start_advisory_reminder_worker,
    stop_advisory_reminder_worker,
)
from app.core.security import is_default_secret_key, is_strict_production_mode
from app.db import init_db

logger = logging.getLogger(__name__)

_PROXY_ENV_KEYS = (
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "http_proxy",
    "https_proxy",
    "all_proxy",
)
_PROXY_BLOCKED_MARKERS = ("127.0.0.1:9", "localhost:9")


def _sanitize_proxy_environment() -> None:
    """
    Evita que el backend herede proxies invalidos del sistema operativo.
    """
    cleared_keys = []
    for key in _PROXY_ENV_KEYS:
        value = str(os.getenv(key, "")).strip()
        lowered = value.lower()
        if value and any(marker in lowered for marker in _PROXY_BLOCKED_MARKERS):
            os.environ[key] = ""
            cleared_keys.append(key)

    required_no_proxy_entries = (
        "localhost",
        "127.0.0.1",
        "api.resend.com",
        "resend.com",
        "api.cloudinary.com",
        "res.cloudinary.com",
    )
    current_entries = []
    for key in ("NO_PROXY", "no_proxy"):
        raw = str(os.getenv(key, "")).strip()
        if raw:
            current_entries.extend(part.strip() for part in raw.split(",") if part.strip())

    seen = set()
    merged_entries = []
    for entry in [*current_entries, *required_no_proxy_entries]:
        normalized = entry.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        merged_entries.append(entry)

    merged_no_proxy = ",".join(merged_entries)
    os.environ["NO_PROXY"] = merged_no_proxy
    os.environ["no_proxy"] = merged_no_proxy

    if cleared_keys:
        logger.warning(
            "Se limpiaron proxies invalidos heredados del sistema: %s",
            ", ".join(cleared_keys),
        )


_sanitize_proxy_environment()

app = FastAPI(title="PORTAFOLIO API")

# CORS: permitir el frontend Next.js en desarrollo y produccion
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

allow_all_cors = os.getenv("CORS_ALLOW_ALL", "").strip().lower() == "true"
allowed_origins = ["*"] if allow_all_cors else origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers activos
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ads.router, prefix="/api/ads", tags=["ads"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(experience.router, prefix="/api/experiences", tags=["experiences"])
app.include_router(certifications.router, prefix="/api/certifications", tags=["certifications"])
app.include_router(education.router, prefix="/api/education", tags=["education"])
app.include_router(blog.router, prefix="/api/blog", tags=["blog"])
app.include_router(proyectos.router, prefix="/api/proyectos", tags=["proyectos"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(media.router, prefix="/api/media", tags=["media"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(services_page.router, prefix="/api/services-page", tags=["services-page"])
app.include_router(asesoria.router, prefix="/api", tags=["asesoria"])
app.include_router(enviar_cotizacion.router, prefix="/api/enviar-cotizacion", tags=["enviar-cotizacion"])
app.include_router(casos_exito.router, prefix="/api", tags=["casos-exito"])
app.include_router(casos_completos.router, prefix="/api", tags=["casos-completos"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(about_stack.router, prefix="/api/about-stack", tags=["about-stack"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai"])
app.include_router(team.router, prefix="/api/team", tags=["team"])
app.include_router(admin_settings.router, prefix="/api", tags=["admin-settings"])
app.include_router(subscribers.router, prefix="/api/subscribers", tags=["subscribers"])

# Asegurar directorio de uploads
uploads_path = Path("uploads")
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


def _validate_production_security():
    if not is_strict_production_mode():
        return

    issues = []
    if is_default_secret_key():
        issues.append("SECRET_KEY no puede quedar por defecto.")
    if allow_all_cors:
        issues.append("CORS_ALLOW_ALL=true no es valido en modo estricto.")
    if not os.getenv("FRONTEND_URL"):
        issues.append("FRONTEND_URL debe estar configurado.")
    if os.getenv("ADMIN_REQUIRE_AUTH", "true").strip().lower() != "true":
        issues.append("ADMIN_REQUIRE_AUTH debe ser true.")
    if not os.getenv("RESEND_API_KEY"):
        issues.append("RESEND_API_KEY debe estar configurado.")

    if issues:
        raise RuntimeError("[SECURITY] Configuracion insegura: " + " | ".join(issues))


@app.on_event("startup")
def on_startup():
    logger.info("Inicializando API")
    logger.info(
        "Cloudinary: %s",
        "CONFIGURADO" if os.getenv("CLOUDINARY_CLOUD_NAME") else "NO ENCONTRADO",
    )
    _validate_production_security()
    init_db()
    start_advisory_reminder_worker()
    subscribers.start_newsletter_campaign_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    subscribers.stop_newsletter_campaign_scheduler()
    stop_advisory_reminder_worker()


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
