from sqlmodel import Session, select, create_engine
from app.models import Blog
from app.db import engine, DATABASE_URL
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

def seed():
    print(f"DEBUG: Conectando a {DATABASE_URL}")
    with Session(engine) as session:
        print("Limpiando blogs antiguos...")
        # Delete by title or ID to ensure we don't have duplicates
        old_blogs = session.exec(select(Blog)).all()
        for b in old_blogs:
            session.delete(b)
        session.commit()

        real_data = [
            {
                "title": "Como un sistema de reservas aumento 200% las ventas de un hotel",
                "category": "Casos de Exito",
                "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
                "content": "Caso real de implementacion de reservas online con pagos integrados y automatizacion operativa."
            },
            {
                "title": "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
                "category": "Guias Practicas",
                "image": "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
                "content": "Comparativa clara entre alternativas de facturacion para crecer con orden financiero."
            },
            {
                "title": "5 errores costosos en gestion de inventario y como evitarlos",
                "category": "Tips y Consejos",
                "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
                "content": "Lecciones practicas para ecommerce y retail enfocadas en reposicion y control de stock."
            },
            {
                "title": "Por que un restaurante necesita un POS moderno para escalar operaciones",
                "category": "Industria",
                "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
                "content": "Integracion de caja, cocina y delivery para decisiones de negocio con datos reales."
            },
            {
                "title": "Seguridad web para empresas: controles minimos para operar sin riesgo",
                "category": "Seguridad",
                "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
                "content": "Checklist tecnico para proteger datos y continuidad operativa en aplicaciones web."
            },
            {
                "title": "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
                "category": "Estrategia",
                "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
                "content": "Comparativa de costo, velocidad y flexibilidad para decidir la mejor ruta de producto."
            },
            {
                "title": "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
                "category": "Tips y Consejos",
                "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
                "content": "Estrategias para reducir mora con recordatorios, reglas de cobro y seguimiento automatizado."
            },
            {
                "title": "Ecommerce profesional: que necesita una tienda para vender de forma estable",
                "category": "Industria",
                "image": "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1200",
                "content": "Base operativa para vender online con catalogo, inventario, pagos y soporte conectados."
            }
        ]

        for data in real_data:
            # Generate the rich content just like the frontend fallback
            rich_content = f"<strong>Contexto {data['category']}: {data['title']}.</strong><br/><br/>" \
                           f"{data['content']}<br/><br/>" \
                           "Diagnostico practico del escenario actual con foco en conversion, operacion y escalabilidad.<br/><br/>" \
                           "Recomendaciones accionables para implementar mejoras por etapas y medir impacto de forma semanal.<br/><br/>" \
                           "<strong>Puntos clave de implementacion:</strong><br/>" \
                           "- Definir una meta operativa concreta para este tema.<br/>" \
                           "- Priorizar acciones de alto impacto con baja complejidad inicial.<br/>" \
                           "- Medir avance con indicadores semanales y ajustes iterativos.<br/><br/>" \
                           "<strong>Plan de accion sugerido:</strong> Aplicar un enfoque por etapas de diagnostico, implementacion controlada y optimizacion continua."

            blog = Blog(
                title=data["title"],
                content=rich_content,
                category=data["category"],
                author="Equipo Editorial",
                main_image_url=data["image"],
                is_published=True,
                created_at=datetime.utcnow()
            )
            session.add(blog)
        
        session.commit()
        print(f"Sincronizados {len(real_data)} articulos reales con exito.")

if __name__ == "__main__":
    seed()
