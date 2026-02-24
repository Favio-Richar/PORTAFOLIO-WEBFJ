import os
from sqlalchemy import text
from sqlmodel import SQLModel, Session, create_engine, select
import json

# IMPORTANTE: Importar todos los modelos para que SQLModel los registre
from app.models import (
    User, Ad, Profile, Experience, Proyecto, CasoExito, CasoExitoCompleto,
    Contact, Timeline, Certification, Education, Blog, BlogHeroConfig, BlogHeroSlide,
    ProfessionalPlan, AdditionalService, Faq, TeamMember, Review,
    ServiceIndustry, AboutStackItem, ServiceAdvisoryCard,
    AdvisoryWeeklyAvailability, AdvisoryBooking
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")

# For initial scaffold we use a regular (sync) engine. For high-load production consider
# async engine + async sessions and connection pool tuning.
engine = create_engine(DATABASE_URL, echo=True)  # echo=True para ver SQL

def _ensure_review_table_exists():
    """
    Garantiza la tabla review para reseñas multi-origen (incluye 'sobre-mi')
    incluso si la BD se creó parcialmente.
    """
    backend = engine.url.get_backend_name()

    if backend == "sqlite":
        create_review_sql = """
        CREATE TABLE IF NOT EXISTS review (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            display_name VARCHAR NULL,
            reviewer_email VARCHAR NULL,
            author_name VARCHAR NOT NULL,
            author_role VARCHAR NULL,
            author_company VARCHAR NULL,
            comment TEXT NULL,
            content TEXT NOT NULL,
            rating INTEGER DEFAULT 5,
            is_verified BOOLEAN DEFAULT FALSE,
            page_context VARCHAR NULL,
            status VARCHAR DEFAULT 'pending',
            created_at VARCHAR NULL,
            author_image VARCHAR NULL,
            initials VARCHAR NULL
        )
        """
    else:
        create_review_sql = """
        CREATE TABLE IF NOT EXISTS review (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NULL,
            display_name VARCHAR NULL,
            reviewer_email VARCHAR NULL,
            author_name VARCHAR NOT NULL,
            author_role VARCHAR NULL,
            author_company VARCHAR NULL,
            comment TEXT NULL,
            content TEXT NOT NULL,
            rating INTEGER DEFAULT 5,
            is_verified BOOLEAN DEFAULT FALSE,
            page_context VARCHAR NULL,
            status VARCHAR DEFAULT 'pending',
            created_at VARCHAR NULL,
            author_image VARCHAR NULL,
            initials VARCHAR NULL
        )
        """

    with engine.begin() as conn:
        conn.execute(text(create_review_sql))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_review_page_context ON review (page_context)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_review_status ON review (status)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_review_created_at ON review (created_at)"))


def _seed_service_advisory_cards():
    """
    Inserta las 6 asesorias iniciales SOLO si la tabla esta vacia.
    No toca ni borra datos existentes.
    """
    with Session(engine) as session:
        exists = session.exec(select(ServiceAdvisoryCard.id).limit(1)).first()
        if exists is not None:
            return

        defaults = [
            ServiceAdvisoryCard(
                title="Asesoria TI Estrategica para PYMEs",
                price="$79.000 CLP",
                duration="60 minutos",
                audience=json.dumps(
                    [
                        "Minimarkets",
                        "Talleres",
                        "Servicios tecnicos",
                        "Empresas pequenas que no saben que sistema implementar",
                    ],
                    ensure_ascii=False,
                ),
                includes=json.dumps(
                    [
                        "Diagnostico general del negocio (ventas, inventario, procesos)",
                        "Evaluacion de herramientas actuales",
                        "Identificacion de problemas criticos",
                        "Recomendacion de software (ERP, POS, CRM, automatizacion)",
                        "Definicion de prioridades",
                        "Plan de accion de corto y mediano plazo",
                    ],
                    ensure_ascii=False,
                ),
                result="El cliente sale con claridad sobre que sistema necesita, que implementar primero y que inversion estimada requiere.",
                market_note="Referencia mercado Chile: $70.000-$120.000. $79.000 es competitivo y profesional.",
                icon="briefcase",
                order_index=0,
                active=True,
            ),
            ServiceAdvisoryCard(
                title="Asesoria en Automatizacion de Procesos",
                price="$89.000 CLP",
                duration="60 minutos",
                audience=json.dumps(
                    [
                        "Empresas con tareas repetitivas manuales",
                        "Negocios que usan Excel para todo",
                        "Empresas que quieren ahorrar tiempo",
                    ],
                    ensure_ascii=False,
                ),
                includes=json.dumps(
                    [
                        "Identificacion de procesos manuales",
                        "Evaluacion de tareas repetitivas",
                        "Analisis de ahorro potencial",
                        "Propuesta de automatizacion (RPA, scripts, integraciones API)",
                        "Definicion de herramientas necesarias",
                        "Roadmap tecnico de implementacion",
                    ],
                    ensure_ascii=False,
                ),
                result="Plan concreto para reducir carga operativa y errores humanos.",
                market_note="Referencia mercado Chile: $80.000-$150.000. $89.000 es atractivo y serio.",
                icon="robot",
                order_index=1,
                active=True,
            ),
            ServiceAdvisoryCard(
                title="Asesoria Web y Optimizacion de Ventas",
                price="$69.000 CLP",
                duration="60 minutos",
                audience=json.dumps(
                    [
                        "Negocios con pagina web que no vende",
                        "E-commerce con baja conversion",
                        "Empresas con mala presentacion digital",
                    ],
                    ensure_ascii=False,
                ),
                includes=json.dumps(
                    [
                        "Revision UX/UI",
                        "Evaluacion de estructura comercial",
                        "Analisis de confianza y credibilidad",
                        "Recomendaciones de mejora",
                        "Checklist SEO basico",
                        "Estrategia para aumentar conversion",
                    ],
                    ensure_ascii=False,
                ),
                result="Lista priorizada de mejoras concretas para vender mas.",
                market_note="Referencia mercado Chile: $50.000-$100.000. $69.000 es excelente punto medio.",
                icon="chartline",
                order_index=2,
                active=True,
            ),
            ServiceAdvisoryCard(
                title="Asesoria ERP / Sistema de Gestion Empresarial",
                price="$99.000 CLP",
                duration="90 minutos",
                audience=json.dumps(
                    [
                        "Bodegas",
                        "Minimarkets",
                        "Empresas con inventario",
                        "Negocios que necesitan control real",
                    ],
                    ensure_ascii=False,
                ),
                includes=json.dumps(
                    [
                        "Analisis completo de procesos",
                        "Definicion de modulos necesarios",
                        "Estructura de roles",
                        "Evaluacion build vs SaaS",
                        "Integracion con facturacion",
                        "Roadmap de implementacion",
                    ],
                    ensure_ascii=False,
                ),
                result="Documento base para implementar un ERP correctamente.",
                market_note="Referencia mercado Chile: $100.000-$200.000. $99.000 es competitivo y atractivo.",
                icon="server",
                order_index=3,
                active=True,
            ),
            ServiceAdvisoryCard(
                title="Asesoria en Desarrollo de Sistema a Medida",
                price="$89.000 CLP",
                duration="60 minutos",
                audience=json.dumps(
                    [
                        "Empresas que quieren sistema propio",
                        "Clientes que no saben cuanto cuesta desarrollar",
                    ],
                    ensure_ascii=False,
                ),
                includes=json.dumps(
                    [
                        "Levantamiento de requerimientos",
                        "Definicion funcional inicial",
                        "Recomendacion tecnologica",
                        "Estimacion preliminar de costos y tiempos",
                        "Propuesta de arquitectura",
                    ],
                    ensure_ascii=False,
                ),
                result="Base clara para cotizacion formal de desarrollo.",
                market_note="Referencia mercado Chile: $70.000-$150.000. $89.000 es ideal para posicion profesional.",
                icon="code",
                order_index=4,
                active=True,
            ),
            ServiceAdvisoryCard(
                title="Primera Sesion Diagnostica Breve",
                price="$39.000 CLP",
                duration="30 minutos",
                audience=json.dumps(
                    [
                        "Ideal como puerta de entrada",
                        "Empresas que quieren un diagnostico general rapido",
                        "Clientes que prefieren validar antes de invertir mas",
                    ],
                    ensure_ascii=False,
                ),
                includes=json.dumps(
                    [
                        "Diagnostico general",
                        "Identificacion de problema principal",
                        "Recomendacion de siguiente paso",
                        "Sin plan detallado",
                    ],
                    ensure_ascii=False,
                ),
                result="Muchos clientes compran primero esta sesion y luego avanzan a una asesoria completa.",
                market_note="Precio entrada recomendado para activar nuevas oportunidades.",
                icon="clock",
                order_index=5,
                active=True,
            ),
        ]

        session.add_all(defaults)
        session.commit()


def _seed_advisory_weekly_availability():
    """
    Inserta disponibilidad semanal base SOLO si la tabla esta vacia.
    No toca ni borra configuracion existente.
    """
    with Session(engine) as session:
        exists = session.exec(select(AdvisoryWeeklyAvailability.id).limit(1)).first()
        if exists is not None:
            return

        defaults = [
            AdvisoryWeeklyAvailability(weekday=0, enabled=True, start_time="09:00", end_time="18:00"),
            AdvisoryWeeklyAvailability(weekday=1, enabled=True, start_time="09:00", end_time="18:00"),
            AdvisoryWeeklyAvailability(weekday=2, enabled=True, start_time="09:00", end_time="18:00"),
            AdvisoryWeeklyAvailability(weekday=3, enabled=True, start_time="09:00", end_time="18:00"),
            AdvisoryWeeklyAvailability(weekday=4, enabled=True, start_time="09:00", end_time="18:00"),
            AdvisoryWeeklyAvailability(weekday=5, enabled=True, start_time="10:00", end_time="13:00"),
            AdvisoryWeeklyAvailability(weekday=6, enabled=False, start_time="00:00", end_time="00:00"),
        ]

        session.add_all(defaults)
        session.commit()


def _ensure_advisory_booking_columns():
    """
    Asegura columnas de control para recordatorios automaticos en advisory_booking.
    Evita correos duplicados entre ejecuciones.
    """
    backend = engine.url.get_backend_name()

    with engine.begin() as conn:
        if backend == "sqlite":
            pragma_rows = conn.execute(text("PRAGMA table_info('advisory_booking')")).fetchall()
            columns = {str(row[1]) for row in pragma_rows}
            if "reminder_h24_sent_at" not in columns:
                conn.execute(text("ALTER TABLE advisory_booking ADD COLUMN reminder_h24_sent_at DATETIME"))
            if "reminder_h1_sent_at" not in columns:
                conn.execute(text("ALTER TABLE advisory_booking ADD COLUMN reminder_h1_sent_at DATETIME"))
            return

        conn.execute(text("ALTER TABLE advisory_booking ADD COLUMN IF NOT EXISTS reminder_h24_sent_at TIMESTAMP NULL"))
        conn.execute(text("ALTER TABLE advisory_booking ADD COLUMN IF NOT EXISTS reminder_h1_sent_at TIMESTAMP NULL"))

def init_db():
    """Crear todas las tablas definidas en los modelos"""
    SQLModel.metadata.create_all(engine)
    _ensure_review_table_exists()
    _ensure_advisory_booking_columns()
    _seed_service_advisory_cards()
    _seed_advisory_weekly_availability()
    print("[DB] Base de datos inicializada correctamente")

def get_session():
    from sqlmodel import Session
    with Session(engine) as session:
        yield session
