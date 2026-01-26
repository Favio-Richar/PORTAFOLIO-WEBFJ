from dotenv import load_dotenv
load_dotenv()
import os
print(f"--- DIAGNÓSTICO DE INICIO ---")
print(f"CLOUDINARY_CLOUD_NAME: {'CONFIGURADO' if os.getenv('CLOUDINARY_CLOUD_NAME') else 'NO ENCONTRADO'}")
print(f"-----------------------------")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import blog, proyectos, enviar_cotizacion, profile, experience, education, timeline, certifications, contact, upload
from app.db import init_db
from pathlib import Path

app = FastAPI(title="PORTAFOLIO API")

# CORS: permitir el frontend Next.js en desarrollo y producción
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "*"), # Permitir URL de producción desde variables de entorno
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers existentes
app.include_router(blog.router, prefix="/api/blog", tags=["blog"])
app.include_router(proyectos.router, prefix="/api/proyectos", tags=["proyectos"])
app.include_router(enviar_cotizacion.router, prefix="/api/cotizacion", tags=["cotizacion"])

# Nuevos routers para Admin Panel
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(experience.router, prefix="/api/experiences", tags=["experiences"])
app.include_router(education.router, prefix="/api/education", tags=["education"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(certifications.router, prefix="/api/certifications", tags=["certifications"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

# Asegurar que el directorio de uploads exista
uploads_path = Path("uploads")
uploads_path.mkdir(parents=True, exist_ok=True)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
