import json
from sqlmodel import Session
from app.db import engine
from app.models import Proyecto

def seed_projects():
    proyectos_data = [
        {
            "title": "SmartRent+",
            "category": "Plataforma Empresarial",
            "status": "En Producción",
            "version": "v3.2",
            "description": "Sistema integral de gestión de propiedades: arriendos, ventas, pagos automatizados, notificaciones en tiempo real, chat interno y panel administrativo avanzado. Incluye ERP Lite y aplicación móvil nativa.",
            "image_url": "/img/25-oct-revista-768x432.jpg",
            "demo_url": "https://nextlevelsoftwarepro.com",
            "repo_url": "https://github.com/Favio-Richar",
            "stack": json.dumps(["Flutter", "FastAPI", "NestJS", "PostgreSQL", "Next.js", "Docker", "Microservicios"]),
        },
        {
            "title": "Mi Negocio Digital",
            "category": "ERP / CRM",
            "status": "En Desarrollo",
            "version": "v1.7 Beta",
            "description": "Ecosistema empresarial diseñado para PYMEs. Control total de inventario, gestión de ventas, roles de usuario, soporte técnico automatizado y catálogo digital con analítica avanzada.",
            "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop",
            "demo_url": "#",
            "repo_url": "#",
            "stack": json.dumps(["Flutter", "NestJS", "Node.js", "PostgreSQL", "JWT", "Docker"]),
        },
        {
            "title": "ERP Corporativo de Alta Gama",
            "category": "Sistema Empresarial",
            "status": "Producción Interna",
            "version": "v2.0",
            "description": "Software de planificación de recursos empresariales con módulos avanzados de facturación electrónica, gestión de proveedores, dashboards financieros y despliegue automatizado.",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
            "demo_url": "#",
            "repo_url": "#",
            "stack": json.dumps(["React", "FastAPI", "PostgreSQL", "Docker", "CI/CD", "Grafana"]),
        },
    ]

    with Session(engine) as session:
        # Solo agregar si no hay proyectos para evitar duplicados
        count = len(session.query(Proyecto).all())
        if count == 0:
            for p_info in proyectos_data:
                proyecto = Proyecto(**p_info)
                session.add(proyecto)
            session.commit()
            print("Proyectos sembrados exitosamente.")
        else:
            print("Ya existen proyectos en la base de datos.")

if __name__ == "__main__":
    seed_projects()
