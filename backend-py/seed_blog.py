import sys
import os
from datetime import datetime

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import Blog

# Datos de las 8 tarjetas principales del blog (sincronizado con frontend)
blog_posts_data = [
    {
        "title": "Como un sistema de reservas aumento 200% las ventas de un hotel",
        "content": "Caso real de implementacion de reservas online con pagos integrados y automatizacion operativa.",
        "author": "Equipo Editorial",
        "category": "Casos de Exito",
        "tags": "reservas, ventas, automatizacion",
        "is_published": True,
        "created_at": datetime(2024, 1, 15),
    },
    {
        "title": "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
        "content": "Comparativa clara entre alternativas de facturacion para crecer con orden financiero.",
        "author": "Equipo Editorial",
        "category": "Guias Practicas",
        "tags": "facturacion, pymes, guias",
        "is_published": True,
        "created_at": datetime(2024, 1, 12),
    },
    {
        "title": "5 errores costosos en gestion de inventario y como evitarlos",
        "content": "Lecciones practicas para ecommerce y retail enfocadas en reposicion y control de stock.",
        "author": "Equipo Editorial",
        "category": "Tips y Consejos",
        "tags": "inventario, ecommerce, operaciones",
        "is_published": True,
        "created_at": datetime(2024, 1, 10),
    },
    {
        "title": "Por que un restaurante necesita un POS moderno para escalar operaciones",
        "content": "Integracion de caja, cocina y delivery para decisiones de negocio con datos reales.",
        "author": "Equipo Editorial",
        "category": "Industria",
        "tags": "pos, restaurantes, integraciones",
        "is_published": True,
        "created_at": datetime(2024, 1, 8),
    },
    {
        "title": "Seguridad web para empresas: controles minimos para operar sin riesgo",
        "content": "Checklist tecnico para proteger datos y continuidad operativa en aplicaciones web.",
        "author": "Equipo Editorial",
        "category": "Seguridad",
        "tags": "seguridad, hardening, continuidad",
        "is_published": True,
        "created_at": datetime(2024, 1, 5),
    },
    {
        "title": "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
        "content": "Comparativa de costo, velocidad y flexibilidad para decidir la mejor ruta de producto.",
        "author": "Equipo Editorial",
        "category": "Estrategia",
        "tags": "saas, producto, arquitectura",
        "is_published": True,
        "created_at": datetime(2024, 1, 2),
    },
    {
        "title": "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
        "content": "Estrategias para reducir mora con recordatorios, reglas de cobro y seguimiento automatizado.",
        "author": "Equipo Editorial",
        "category": "Tips y Consejos",
        "tags": "cobranza, flujo de caja, automatizacion",
        "is_published": True,
        "created_at": datetime(2024, 1, 1),
    },
    {
        "title": "Ecommerce profesional: que necesita una tienda para vender de forma estable",
        "content": "Base operativa para vender online con catalogo, inventario, pagos y soporte conectados.",
        "author": "Equipo Editorial",
        "category": "Industria",
        "tags": "ecommerce, catalogo, pagos",
        "is_published": True,
        "created_at": datetime(2023, 12, 28),
    },
]


def seed_blog():
    """Crea las 8 tarjetas principales del blog en la BD"""
    init_db()
    
    with Session(engine) as session:
        # Verificar si ya existen posts
        existing_posts = session.exec(select(Blog)).all()
        
        if existing_posts:
            print(f"✓ Ya existen {len(existing_posts)} posts en la BD. Omitiendo seed de blog.")
            return
        
        # Crear los posts
        for post_data in blog_posts_data:
            new_post = Blog(**post_data)
            session.add(new_post)
            print(f"  + Agregando: {post_data['title'][:60]}...")
        
        session.commit()
        final_count = session.exec(select(Blog)).all()
        print(f"\n✓ Seed de blog completado: {len(final_count)} posts creados.\n")


if __name__ == "__main__":
    seed_blog()
