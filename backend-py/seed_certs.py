import sys
import os

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import Certification

# Datos del componente Certificaciones.tsx original
certs_data = [
    {
        "title": "Ingeniero Informático",
        "issuer": "INSTITUTO PROFESIONAL",
        "date": "2022",
        "description": "Título Profesional de Grado Superior. Especialización en Arquitectura de Software, Redes e Inteligencia de Datos.",
        "icon": "FaUserGraduate",
        "level": "Título Profesional",
        "color": "gold",
        "badge": "Grado Académico",
        "credential_url": "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1200",
    },
    {
        "title": "Desarrollo Web Moderno",
        "issuer": "Capacitación Pro",
        "date": "2023",
        "description": "Arquitectura limpia, UI/UX, SSR, componentes reutilizables y micro-servicios frontales.",
        "icon": "FaCode",
        "level": "Avanzado",
        "color": "blue",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200",
    },
    {
        "title": "Python Profesional",
        "issuer": "Tech Academy",
        "date": "2023",
        "description": "Automatización, scripting avanzado, POO, data processing y backend robusto.",
        "icon": "FaPython",
        "level": "Experto",
        "color": "yellow",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200",
    },
    {
        "title": "APIs con FastAPI",
        "issuer": "Backend Master",
        "date": "2023",
        "description": "JWT, OAuth2, documentación OpenAPI, servicios escalables y de alto rendimiento.",
        "icon": "SiFastapi",
        "level": "Avanzado",
        "color": "emerald",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=1200",
    },
    {
        "title": "Next.js & React",
        "issuer": "Frontend Elite",
        "date": "2024",
        "description": "Frameworks modernos, SSR, ISR, API routes y optimización crítica de rendimiento.",
        "icon": "SiNextdotjs",
        "level": "Avanzado",
        "color": "gray",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200",
    },
    {
        "title": "Bases de Datos PostgreSQL",
        "issuer": "Data Masters",
        "date": "2023",
        "description": "Diseño de modelos, consultas optimizadas, índices, vistas y procedimientos almacenados.",
        "icon": "FaDatabase",
        "level": "Intermedio",
        "color": "indigo",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200",
    },
    {
        "title": "Flutter Avanzado",
        "issuer": "Mobile Innovators",
        "date": "2023",
        "description": "Ecosistema móvil completo con arquitectura limpia, inyección de dependencias y Provider/BLoC.",
        "icon": "FaMobileAlt",
        "level": "Intermedio",
        "color": "sky",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200",
    },
    {
        "title": "Fundamentos de Docker",
        "issuer": "DevOps Center",
        "date": "2023",
        "description": "Contenedores, imágenes, volúmenes, redes orchestración y despliegue continuo.",
        "icon": "FaDocker",
        "level": "Intermedio",
        "color": "blue",
        "badge": None,
        "credential_url": "https://images.unsplash.com/photo-1605745341112-85968b193ef5?q=80&w=1200",
    },
]

def seed():
    # Asegurar que las tablas existen
    init_db()
    
    with Session(engine) as session:
        print(f"Sincronizando {len(certs_data)} certificaciones...")
        for cert_item in certs_data:
            # Verificar si ya existe por titulo para no duplicar exactamente
            existing = session.exec(select(Certification).where(Certification.title == cert_item["title"])).first()
            if not existing:
                cert = Certification(**cert_item)
                session.add(cert)
                print(f"  + Agregada: {cert_item['title']}")
            else:
                print(f"  - Ya existe: {cert_item['title']}")

        
        try:
            session.commit()
            print("Migración completada con éxito.")
        except Exception as e:
            print(f"Error al guardar en la base de datos: {repr(e)}")
            session.rollback()

if __name__ == "__main__":
    seed()
