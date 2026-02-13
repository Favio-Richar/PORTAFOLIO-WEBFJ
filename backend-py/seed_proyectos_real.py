
import json
from sqlmodel import Session, create_engine, SQLModel
import os
from dotenv import load_dotenv

load_dotenv()

# Setup engine
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend-py/portafolio.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

try:
    from app.models import Proyecto
    
    # DROP AND RECREATE TO APPLY SCHEMA CHANGE
    SQLModel.metadata.drop_all(engine, tables=[Proyecto.__table__])
    SQLModel.metadata.create_all(engine)
    print("Table 'proyecto' recreated with new schema.")

    projects = [
        {
            "title": "TechCorp Global",
            "category": "Tecnología",
            "status": "Production",
            "version": "v4.2.0",
            "description": "Transformación digital completa de sistemas legacy y migración a nube híbrida con alta disponibilidad.",
            "image_url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200",
            "results": json.dumps({ "revenue": "+245%", "users": "2M+", "satisfaction": "98%" }),
            "year": "2023",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        },
        {
            "title": "FinanceHub Pro",
            "category": "Finanzas",
            "status": "Completed",
            "version": "v2.1.0",
            "description": "Plataforma de inversión con IA y análisis en tiempo real para el sector financiero enterprise.",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
            "results": json.dumps({ "transactions": "$2.5B", "clients": "150K+", "uptime": "99.99%" }),
            "year": "2023",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        },
        {
            "title": "HealthCare Plus",
            "category": "Salud",
            "status": "Active",
            "version": "v1.5.5",
            "description": "Sistema de gestión hospitalaria y telemedicina ultra-seguro para redes de salud nacionales.",
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200",
            "results": json.dumps({ "patients": "500K+", "appointments": "1M+", "efficiency": "+180%" }),
            "year": "2023",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        },
        {
            "title": "RetailMax",
            "category": "Retail",
            "status": "Optimization",
            "version": "v3.0.1",
            "description": "E-commerce omnicanal con experiencia personalizada impulsada por modelos de recomendación IA.",
            "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200",
            "results": json.dumps({ "sales": "+320%", "cart": "+85%", "retention": "89%" }),
            "year": "2022",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        },
        {
            "title": "EduLearn Academy",
            "category": "Educación",
            "status": "Production",
            "version": "v2.0.0",
            "description": "Plataforma de educación gamificada con rutas de aprendizaje adaptativas para empresas.",
            "image_url": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200",
            "results": json.dumps({ "engagement": "+150%", "courses": "500+", "rating": "4.9/5" }),
            "year": "2023",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        },
        {
            "title": "GreenEnergy Solutions",
            "category": "Tecnología",
            "status": "Active",
            "version": "v1.2.0",
            "description": "IoT aplicado a parques eólicos y solares con monitoreo predictivo e integración de red inteligente.",
            "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200",
            "results": json.dumps({ "consumption": "-30%", "nodes": "500+", "reliability": "95%" }),
            "year": "2024",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        },
        {
            "title": "Construcciones Alfa",
            "category": "Construcción",
            "status": "Production",
            "version": "v2.4.0",
            "description": "Control de obra y logística con gemelos digitales para infraestructuras críticas.",
            "image_url": "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1200",
            "results": json.dumps({ "costs": "-20%", "works": "50+", "safety": "100%" }),
            "year": "2023",
            "demo_url": "#", "repo_url": "#", "stack": "[]"
        }
    ]

    with Session(engine) as session:
        for p_data in projects:
            p = Proyecto(**p_data)
            session.add(p)
        session.commit()
        print(f"Success: Seeded {len(projects)} REAL projects into portafolio.db")
            
except Exception as e:
    print(f"Error seeding database: {e}")
