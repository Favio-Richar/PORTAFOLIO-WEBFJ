from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import (
    auth, ads, upload,
    profile, experience,
    proyectos, contact, media, timeline,
    certifications, education, blog,
    services_page, enviar_cotizacion, casos_exito
)



from app.db import init_db
from pathlib import Path

# --- DIAGNÓSTICO DE INICIO ---
print(f"--- DIAGNÓSTICO DE INICIO ---")
print(f"CLOUDINARY_CLOUD_NAME: {'CONFIGURADO' if os.getenv('CLOUDINARY_CLOUD_NAME') else 'NO ENCONTRADO'}")
print(f"-----------------------------")

app = FastAPI(title="PORTAFOLIO API")

# CORS: permitir el frontend Next.js en desarrollo y producción
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000", # Sometimes needed for internal redirects
]

# Agregar URL de producción si existe
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Required for allow_origins=["*"]
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
app.include_router(media.router, prefix="/api/media", tags=["media"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(services_page.router, prefix="/api/services-page", tags=["services-page"])
app.include_router(enviar_cotizacion.router, prefix="/api/enviar-cotizacion", tags=["enviar-cotizacion"])
app.include_router(casos_exito.router, prefix="/api", tags=["casos-exito"])



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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
