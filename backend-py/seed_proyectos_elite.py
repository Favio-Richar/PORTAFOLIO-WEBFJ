
import json
from sqlmodel import Session, create_engine
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
    
    projects = [
        {
            "title": "SmartRent+ Ecosystem",
            "category": "Tecnología",
            "status": "Production",
            "version": "v4.2.0",
            "description": "Plataforma SaaS líder en gestión inmobiliaria automatizada con IA para predicción de demanda y optimización de rentas.",
            "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
            "media": json.dumps([
                {"type": "image", "url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200"},
                {"type": "video", "url": "https://cdn.coverr.co/videos/coverr-working-on-a-laptop-1579/1080p.mp4"}
            ]),
            "demo_url": "https://smartrent.example.com",
            "repo_url": "https://github.com/favio/smartrent",
            "stack": json.dumps(["React", "FastAPI", "PostgreSQL", "TailwindCSS"]),
            "client_name": "SmartRent Global",
            "deployment_date": "2024-01-15"
        },
        {
            "title": "FinanceHub Pro",
            "category": "Finanzas",
            "status": "Completed",
            "version": "v2.1.0",
            "description": "Dashboard financiero de alta precisión para fondos de inversión, procesando millones de transacciones por segundo.",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
            "media": json.dumps([
                {"type": "image", "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200"}
            ]),
            "demo_url": "https://financehub.example.com",
            "repo_url": "https://github.com/favio/financehub",
            "stack": json.dumps(["Next.js", "Go", "Redis", "Kafka"]),
            "client_name": "FinanceHub Group",
            "deployment_date": "2023-11-20"
        },
        {
            "title": "HealthCare Connect",
            "category": "Salud",
            "status": "Active",
            "version": "v1.5.5",
            "description": "Portal de telemedicina ultra-seguro integrando expedientes electrónicos y monitoreo de pacientes en tiempo real.",
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200",
            "media": json.dumps([
                {"type": "image", "url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200"}
            ]),
            "demo_url": "https://healthcare.example.com",
            "repo_url": "https://github.com/favio/healthcare",
            "stack": json.dumps(["Vue.js", "Python", "MongoDB", "HIPAA Compliance"]),
            "client_name": "Digital Health Solutions",
            "deployment_date": "2024-02-01"
        },
        {
            "title": "RetailMax Analytics",
            "category": "Retail",
            "status": "Optimization",
            "version": "v3.0.1",
            "description": "Solución de Business Intelligence para retail con mapas de calor y seguimiento de inventario predictivo.",
            "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200",
            "media": json.dumps([
                {"type": "image", "url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"}
            ]),
            "demo_url": "https://retailmax.example.com",
            "repo_url": "https://github.com/favio/retailmax",
            "stack": json.dumps(["Angular", "Node.js", "AWS", "Snowflake"]),
            "client_name": "RetailMax Corp",
            "deployment_date": "2023-12-10"
        }
    ]

    with Session(engine) as session:
        # Check if table has data
        existing = session.query(Proyecto).first()
        if existing:
            print("Database already has projects. Skipping seed.")
        else:
            for p_data in projects:
                p = Proyecto(**p_data)
                session.add(p)
            session.commit()
            print(f"Success: Seeded {len(projects)} projects into portafolio.db")
            
except Exception as e:
    print(f"Error seeding database: {e}")
