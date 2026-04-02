import os
from sqlalchemy import text
from sqlmodel import SQLModel, Session, create_engine, select
import json
from app.core.email_threading import clean_message_id, normalize_email_address, parse_reference_ids

# IMPORTANTE: Importar todos los modelos para que SQLModel los registre
from app.models import (
    User, Ad, Profile, Experience, Proyecto, CasoExito, CasoExitoCompleto,
    Contact, Timeline, Certification, Education, Blog, BlogHeroConfig, BlogHeroSlide,
    ProfessionalPlan, AdditionalService, Faq, TeamMember, Review,
    ServiceIndustry, AboutStackItem, ServiceAdvisoryCard,
    AdvisoryWeeklyAvailability, AdvisoryBooking, ServiceCombo,
    ServiceComboDiagnosticCard, ServiceComboHighlightCard, ServiceMarqueeCard,
    NewsletterSubscriber, NewsletterCampaign, NewsletterDelivery,
    NewsletterCampaignContent, NewsletterCampaignRecipientRule,
    Quote, EnterpriseProposal, GlobalSetting, QuoteHistory,
    SystemNotification, LeadCommunication, DirectInquiry, LeadContactOverride
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")
SQL_ECHO = os.getenv("SQL_ECHO", "").lower() == "true"

# For initial scaffold we use a regular (sync) engine. For high-load production consider
# async engine + async sessions and connection pool tuning.
engine = create_engine(DATABASE_URL, echo=SQL_ECHO)


def _normalize_key(value: str) -> str:
    return str(value or "").strip().lower()


DEFAULT_ADDITIONAL_SERVICES = [
    {
        "name": "Integracion CRM Empresarial",
        "description": "Conexion estrategica entre tu web y CRM para gestion avanzada de clientes y seguimiento real de oportunidades.",
        "price": "$250.000 CLP",
        "icon": "sync",
        "includes": [
            "Configuracion CRM",
            "Sincronizacion automatica de leads",
            "Pipeline de ventas personalizado",
            "Historial de interacciones",
            "Automatizacion basica de seguimiento",
            "Capacitacion equipo",
        ],
        "payment_type": "Proyecto unico",
        "recurring": False,
    },
    {
        "name": "App Movil PWA Empresarial",
        "description": "Aplicacion web progresiva optimizada para rendimiento, instalacion movil y experiencia moderna.",
        "price": "$550.000 CLP",
        "icon": "mobile",
        "includes": [
            "Instalacion en dispositivos moviles",
            "Notificaciones push",
            "Optimizacion rendimiento",
            "Funcionalidad offline basica",
            "Panel de administracion",
            "Publicacion lista para uso empresarial",
        ],
        "payment_type": "Proyecto unico desde",
        "recurring": False,
    },
    {
        "name": "Integracion Pasarelas de Pago",
        "description": "Implementacion segura de sistemas de pago en tu sitio web con validacion completa del flujo.",
        "price": "$80.000 CLP",
        "icon": "creditcard",
        "includes": [
            "Configuracion Webpay / Flow / MercadoPago / Stripe / Khipu",
            "Integracion backend",
            "Webhook de confirmacion automatica",
            "Pruebas en ambiente sandbox",
            "Validacion flujo completo",
        ],
        "payment_type": "Por pasarela",
        "recurring": False,
    },
    {
        "name": "Migracion WordPress a Tecnologia Moderna",
        "description": "Modernizacion completa para mejorar velocidad, SEO tecnico y rendimiento general.",
        "price": "$350.000 CLP",
        "icon": "rocket",
        "includes": [
            "Migracion contenido",
            "Optimizacion SEO tecnica",
            "Rediseno visual moderno",
            "Mejora de rendimiento Core Web Vitals",
            "Mantencion estructura URL",
        ],
        "payment_type": "Proyecto unico desde",
        "recurring": False,
    },
    {
        "name": "Mantenimiento Web Premium",
        "description": "Plan de soporte continuo para estabilidad, seguridad y mejoras menores recurrentes.",
        "price": "$45.000 CLP",
        "icon": "tools",
        "includes": [
            "Actualizaciones tecnicas",
            "Backups automaticos",
            "Monitoreo basico",
            "Soporte tecnico prioritario",
            "Resolucion incidencias",
        ],
        "payment_type": "Mensual",
        "recurring": True,
    },
    {
        "name": "Hosting VPS Chile",
        "description": "Infraestructura optimizada con baja latencia en Chile y configuracion lista para produccion.",
        "price": "$35.000 CLP",
        "icon": "server",
        "includes": [
            "VPS 4GB RAM",
            "SSD NVMe",
            "Configuracion inicial",
            "Firewall basico",
            "Monitoreo basico",
        ],
        "payment_type": "Mensual",
        "recurring": True,
    },
    {
        "name": "Auditoria de Seguridad Web",
        "description": "Evaluacion tecnica de vulnerabilidades, hardening basico y plan ejecutivo de mejoras.",
        "price": "$150.000 CLP",
        "icon": "shield",
        "includes": [
            "Escaneo de vulnerabilidades",
            "Revision configuraciones criticas",
            "Hardening basico",
            "Informe ejecutivo con recomendaciones",
        ],
        "payment_type": "Auditoria unica",
        "recurring": False,
    },
    {
        "name": "Bot WhatsApp Business API",
        "description": "Automatizacion comercial con respuestas, menus y derivacion de oportunidades desde WhatsApp.",
        "price": "$180.000 CLP",
        "icon": "robot",
        "includes": [
            "Respuestas automaticas 24/7",
            "Menu interactivo con botones",
            "Integracion con formularios y sitio web",
            "Analitica de conversaciones",
            "Plantillas de mensajes aprobadas",
        ],
        "payment_type": "Setup unico",
        "recurring": False,
    },
    {
        "name": "Email Marketing Automation",
        "description": "Secuencias automaticas de correo para captacion, seguimiento comercial y recuperacion de oportunidades.",
        "price": "$120.000 CLP",
        "icon": "mail",
        "includes": [
            "Secuencias de bienvenida",
            "Automatizacion de seguimiento",
            "Recuperacion de carritos o leads",
            "Segmentacion de audiencias",
            "Metricas de apertura y clicks",
        ],
        "payment_type": "Setup + mensual",
        "recurring": True,
    },
    {
        "name": "SEO Local Chile",
        "description": "Posicionamiento local en Google para negocios que necesitan aparecer en mapas y busquedas cercanas.",
        "price": "$150.000 CLP",
        "icon": "map-marker",
        "includes": [
            "Optimizacion Google Business Profile",
            "Keywords locales",
            "Mejoras on-page basicas",
            "Gestion de resenas",
            "Reporte de posicionamiento",
        ],
        "payment_type": "Mensual",
        "recurring": True,
    },
    {
        "name": "Campanas Google Ads",
        "description": "Configuracion y lanzamiento de campanas de Google Ads con foco en demanda y conversion.",
        "price": "$200.000 CLP",
        "icon": "bullhorn",
        "includes": [
            "Investigacion de keywords",
            "Configuracion de campanas",
            "Tracking de conversiones",
            "Copies iniciales de anuncios",
            "Revision de estructura y optimizacion base",
        ],
        "payment_type": "Setup + gestion",
        "recurring": False,
    },
    {
        "name": "Meta Ads Facebook Instagram",
        "description": "Campanas en Meta Ads para captacion, remarketing y performance en redes sociales.",
        "price": "$180.000 CLP",
        "icon": "bullhorn",
        "includes": [
            "Configuracion Business Manager",
            "Pixeles y eventos",
            "Segmentacion inicial",
            "Campana de captacion o remarketing",
            "Dashboard base de resultados",
        ],
        "payment_type": "Setup + gestion",
        "recurring": False,
    },
    {
        "name": "Branding Completo",
        "description": "Identidad visual profesional con lineamientos claros para presentar tu negocio con consistencia.",
        "price": "$250.000 CLP",
        "icon": "paint-brush",
        "includes": [
            "Logo base",
            "Paleta cromatica",
            "Sistema tipografico",
            "Manual de marca basico",
            "Aplicaciones iniciales",
        ],
        "payment_type": "Proyecto unico",
        "recurring": False,
    },
    {
        "name": "Pack Redes Sociales",
        "description": "Kit grafico para redes con piezas listas para comunicar una marca de forma profesional.",
        "price": "$80.000 CLP",
        "icon": "instagram",
        "includes": [
            "Templates para feed",
            "Stories editables",
            "Portadas destacadas",
            "Ajuste de foto de perfil",
            "Guia base de uso",
        ],
        "payment_type": "Pack unico",
        "recurring": False,
    },
    {
        "name": "Fotografia Profesional",
        "description": "Sesion fotografica para productos, espacios o equipo con entrega editada para uso comercial.",
        "price": "$120.000 CLP",
        "icon": "camera",
        "includes": [
            "Sesion fotografica",
            "Fotos editadas",
            "Tomas de producto o ambiente",
            "Entrega digital optimizada",
        ],
        "payment_type": "Sesion",
        "recurring": False,
    },
    {
        "name": "Capacitacion Equipo Comercial",
        "description": "Transferencia operativa para que el equipo use correctamente las automatizaciones y herramientas activadas.",
        "price": "$90.000 CLP",
        "icon": "users",
        "includes": [
            "Sesion de capacitacion",
            "Buenas practicas de operacion",
            "Resolucion de dudas",
            "Checklist de uso diario",
        ],
        "payment_type": "Sesion",
        "recurring": False,
    },
    {
        "name": "SEO Tecnico Base",
        "description": "Correcciones tecnicas iniciales para indexacion, estructura y rendimiento de un sitio web.",
        "price": "$110.000 CLP",
        "icon": "search",
        "includes": [
            "Revision de indexacion",
            "Mejoras meta y headings",
            "Ajustes de sitemap y robots",
            "Correcciones de performance base",
        ],
        "payment_type": "Auditoria + implementacion base",
        "recurring": False,
    },
]


DEFAULT_SERVICE_COMBOS = [
    {
        "title": "Combo 1 - Presencia Digital Profesional",
        "segment": "PYMEs",
        "ideal": "Ideal para negocios que recien quieren profesionalizar su imagen.",
        "includes": [
            "Branding Completo",
            "Pack Redes Sociales",
            "Fotografia Profesional",
        ],
        "individual_value": "$450.000 CLP",
        "combo_price": "$390.000 CLP",
        "note": "Ahorro visible para facilitar el cierre comercial.",
        "deliverables": [
            "Identidad visual base: logo, paleta y tipografias",
            "Pack de piezas graficas para redes sociales feed y stories",
            "Sesion fotografica y seleccion de imagenes editadas",
            "Entrega de archivos base para uso comercial",
        ],
        "timeline": "7 a 12 dias habiles",
        "not_included": [
            "Impresion de material fisico",
            "Compra de imagenes premium de terceros",
            "Gestion mensual de redes sociales",
        ],
        "market_note": "Posicion competitivo para PYMEs en Chile que buscan presencia profesional inicial.",
        "order_index": 0,
        "active": True,
    },
    {
        "title": "Combo 2 - Crecimiento Digital",
        "segment": "PYMEs",
        "ideal": "Para negocios que ya tienen web y quieren vender mas.",
        "includes": [
            "SEO Local Chile",
            "Campanas Google Ads",
            "Meta Ads Facebook Instagram",
            "Email Marketing Automation",
        ],
        "individual_value": "$510.000 CLP",
        "combo_price": "$450.000 CLP",
        "note": "Sube ticket promedio inmediato con foco en demanda.",
        "deliverables": [
            "SEO local inicial con optimizacion de perfil y estructura base",
            "Configuracion de campanas Google Ads y Meta Ads",
            "Instalacion de pixeles, eventos y conversion tracking",
            "Setup de automatizacion de email para captacion y seguimiento",
        ],
        "timeline": "10 a 15 dias habiles",
        "not_included": [
            "Presupuesto de pauta publicitaria",
            "Gestion mensual posterior a la configuracion",
            "Licencias de plataformas externas",
        ],
        "market_note": "Alineado a paquetes de activacion comercial para PYMEs chilenas con foco en demanda.",
        "order_index": 1,
        "active": True,
    },
    {
        "title": "Combo 3 - E-commerce Optimizado",
        "segment": "PYMEs",
        "ideal": "Para tiendas online que quieren vender en serio.",
        "includes": [
            "Integracion Pasarelas de Pago",
            "Email Marketing Automation",
            "SEO Local Chile",
            "Mantenimiento Web Premium",
        ],
        "individual_value": "$440.000 CLP",
        "combo_price": "$390.000 CLP",
        "note": "Paquete equilibrado para conversion y continuidad operativa.",
        "deliverables": [
            "Integracion de una pasarela de pago con flujo de confirmacion",
            "Automatizacion de emails de compra y seguimiento",
            "Ajustes SEO local basicos para visibilidad inicial",
            "Mantenimiento preventivo y correctivo por 2 meses",
        ],
        "timeline": "12 a 18 dias habiles",
        "not_included": [
            "Comisiones de pasarela de pago",
            "Carga masiva de catalogo por lote",
            "Campanas pagadas de trafico",
        ],
        "market_note": "Paquete competitivo para e-commerce chileno que busca estabilizar conversion y operacion.",
        "order_index": 2,
        "active": True,
    },
    {
        "title": "Combo 4 - Automatizacion Empresarial",
        "segment": "Empresarial",
        "ideal": "Para empresas que necesitan orden comercial y operacion trazable.",
        "includes": [
            "Bot WhatsApp Business API",
            "Integracion CRM Empresarial",
            "Email Marketing Automation",
            "Capacitacion Equipo Comercial",
        ],
        "individual_value": "$550.000 CLP",
        "combo_price": "$520.000 CLP",
        "note": "Eleva ticket sin generar friccion de compra.",
        "deliverables": [
            "Configuracion de bot WhatsApp Business API para flujo comercial",
            "Integracion con CRM para seguimiento de leads y oportunidades",
            "Automatizacion de secuencias de correo de soporte comercial",
            "Capacitacion operativa al equipo para uso diario",
        ],
        "timeline": "15 a 25 dias habiles",
        "not_included": [
            "Licenciamiento CRM y proveedores de API",
            "Mesa de soporte 24/7 permanente",
            "Desarrollo de ERP completo",
        ],
        "market_note": "Posicion de entrada solida para empresas chilenas en etapa de orden y escalamiento.",
        "order_index": 3,
        "active": True,
    },
    {
        "title": "Combo 5 - Transformacion Digital Completa",
        "segment": "Empresarial",
        "ideal": "Para empresas que buscan estructura digital de alto impacto.",
        "includes": [
            "Migracion WordPress a Tecnologia Moderna",
            "Integracion CRM Empresarial",
            "App Movil PWA Empresarial",
            "SEO Tecnico Base",
        ],
        "individual_value": "$1.150.000 CLP",
        "combo_price": "$1.050.000 CLP",
        "note": "Ticket alto real con solucion de punta a punta.",
        "deliverables": [
            "Migracion de WordPress a stack moderno orientado a rendimiento",
            "Integracion CRM para centralizar y seguir oportunidades",
            "Implementacion de PWA empresarial con base operativa",
            "SEO tecnico inicial para estructura e indexacion",
        ],
        "timeline": "25 a 45 dias habiles",
        "not_included": [
            "Redaccion de contenido desde cero",
            "Infraestructura mensual hosting, terceros o licencias",
            "Integraciones enterprise fuera de alcance acordado",
        ],
        "market_note": "Ticket premium competitivo para proyectos de transformacion digital en Chile.",
        "order_index": 4,
        "active": True,
    },
]


DEFAULT_COMBO_DIAGNOSTIC_CARDS = [
    {
        "badge": "1 - PYME",
        "title": "Soy emprendedor o pequena empresa",
        "description": "Estoy comenzando o tengo un negocio pequeno y quiero vender mas.",
        "needs_label": "Generalmente necesitas",
        "needs": [
            "Mejorar tu imagen digital",
            "Aparecer en Google",
            "Generar mas clientes",
            "Automatizar tareas basicas",
            "Ordenar tu presencia online",
        ],
        "recommendations_label": "Te recomendamos",
        "recommendations_text": "SEO Local, Google Ads, Meta Ads, Email Marketing, Branding y Mantenimiento Web.",
        "cta_text": "Ver soluciones para PYMEs",
        "cta_href": "#pyme-soluciones",
        "theme": "emerald",
        "order_index": 0,
        "active": True,
    },
    {
        "badge": "2 - CRECIMIENTO",
        "title": "Soy una empresa en crecimiento",
        "description": "Ya tengo clientes, pero necesito orden, automatizacion y estructura.",
        "needs_label": "Generalmente necesitas",
        "needs": [
            "Automatizar procesos internos",
            "Integrar sistemas",
            "Centralizar clientes en CRM",
            "Reducir errores manuales",
            "Escalar operaciones",
        ],
        "recommendations_label": "Te recomendamos",
        "recommendations_text": "Integracion CRM, Bot WhatsApp Business API, automatizacion avanzada, migracion moderna y App PWA.",
        "cta_text": "Ver soluciones empresariales",
        "cta_href": "#empresarial-soluciones",
        "theme": "blue",
        "order_index": 1,
        "active": True,
    },
    {
        "badge": "3 - CONSOLIDADA",
        "title": "Soy una empresa consolidada",
        "description": "Necesito optimizar, escalar y asegurar mi infraestructura tecnologica.",
        "needs_label": "Generalmente necesitas",
        "needs": [
            "Arquitectura tecnologica solida",
            "Seguridad avanzada",
            "Optimizacion de rendimiento",
            "Sistemas personalizados",
            "Integraciones complejas",
        ],
        "recommendations_label": "Te recomendamos",
        "recommendations_text": "Auditoria de Seguridad, desarrollo a medida, ERP empresarial, hosting dedicado y automatizacion integral.",
        "cta_text": "Solicitar evaluacion estrategica",
        "cta_href": "/asesoria?source=servicios-combos&reserve_type=asesoria&reserve_name=Evaluacion+estrategica+de+empresa",
        "theme": "violet",
        "order_index": 2,
        "active": True,
    },
]


DEFAULT_COMBO_HIGHLIGHT_CARDS = [
    {
        "title": "Para PYMEs que quieren crecer",
        "description": "Soluciones practicas y efectivas para aumentar ventas, mejorar presencia digital y profesionalizar tu negocio.",
        "items": [
            "Branding Completo",
            "Pack Redes Sociales",
            "Fotografia Profesional",
            "SEO Local Chile",
            "Campanas Google Ads",
            "Meta Ads Facebook Instagram",
        ],
        "footer_note": "Disenados para negocios que necesitan crecer sin complicaciones tecnicas.",
        "theme": "emerald",
        "order_index": 0,
        "active": True,
    },
    {
        "title": "Para Empresas que necesitan escalar",
        "description": "Arquitectura tecnologica, automatizacion y sistemas que ordenan y profesionalizan tu operacion.",
        "items": [
            "Bot WhatsApp Business API",
            "Integracion CRM Empresarial",
            "Email Marketing Automation",
            "Capacitacion Equipo Comercial",
            "Migracion WordPress a Tecnologia Moderna",
            "App Movil PWA Empresarial",
        ],
        "footer_note": "Pensado para empresas que quieren estructura, control y crecimiento sostenido.",
        "theme": "blue",
        "order_index": 1,
        "active": True,
    },
]

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


def _seed_additional_services():
    """
    Inserta servicios adicionales faltantes sin modificar ni borrar los existentes.
    """
    with Session(engine) as session:
        existing_names = {
            _normalize_key(name)
            for name in session.exec(select(AdditionalService.name)).all()
            if name is not None
        }

        missing_items = [
            item for item in DEFAULT_ADDITIONAL_SERVICES if _normalize_key(item["name"]) not in existing_names
        ]

        if not missing_items:
            return

        for item in missing_items:
            session.add(
                AdditionalService(
                    name=item["name"],
                    description=item["description"],
                    price=item["price"],
                    icon=item.get("icon"),
                    includes=json.dumps(item.get("includes", []), ensure_ascii=False),
                    recurring=bool(item.get("recurring", False)),
                    payment_type=item.get("payment_type"),
                )
            )

        session.commit()


def _seed_service_combos():
    """
    Inserta combos faltantes sin tocar los ya creados o editados.
    """
    with Session(engine) as session:
        existing_titles = {
            _normalize_key(title)
            for title in session.exec(select(ServiceCombo.title)).all()
            if title is not None
        }

        missing_items = [
            item for item in DEFAULT_SERVICE_COMBOS if _normalize_key(item["title"]) not in existing_titles
        ]

        if not missing_items:
            return

        for item in missing_items:
            session.add(
                ServiceCombo(
                    title=item["title"],
                    segment=item["segment"],
                    ideal=item["ideal"],
                    includes=json.dumps(item.get("includes", []), ensure_ascii=False),
                    individual_value=item["individual_value"],
                    combo_price=item["combo_price"],
                    note=item["note"],
                    deliverables=json.dumps(item.get("deliverables", []), ensure_ascii=False),
                    timeline=item["timeline"],
                    not_included=json.dumps(item.get("not_included", []), ensure_ascii=False),
                    market_note=item.get("market_note"),
                    order_index=int(item.get("order_index", 0)),
                    active=bool(item.get("active", True)),
                )
            )

        session.commit()


def _seed_combo_diagnostic_cards():
    """
    Inserta tarjetas de diagnostico faltantes sin tocar las ya existentes.
    """
    with Session(engine) as session:
        existing_titles = {
            _normalize_key(title)
            for title in session.exec(select(ServiceComboDiagnosticCard.title)).all()
            if title is not None
        }

        missing_items = [
            item for item in DEFAULT_COMBO_DIAGNOSTIC_CARDS if _normalize_key(item["title"]) not in existing_titles
        ]

        if not missing_items:
            return

        for item in missing_items:
            session.add(
                ServiceComboDiagnosticCard(
                    badge=item["badge"],
                    title=item["title"],
                    description=item["description"],
                    needs_label=item["needs_label"],
                    needs=json.dumps(item.get("needs", []), ensure_ascii=False),
                    recommendations_label=item["recommendations_label"],
                    recommendations_text=item["recommendations_text"],
                    cta_text=item["cta_text"],
                    cta_href=item["cta_href"],
                    theme=item.get("theme", "emerald"),
                    order_index=int(item.get("order_index", 0)),
                    active=bool(item.get("active", True)),
                )
            )

        session.commit()


def _seed_combo_highlight_cards():
    """
    Inserta tarjetas premium faltantes sin borrar ni modificar contenido existente.
    """
    with Session(engine) as session:
        existing_titles = {
            _normalize_key(title)
            for title in session.exec(select(ServiceComboHighlightCard.title)).all()
            if title is not None
        }

        missing_items = [
            item for item in DEFAULT_COMBO_HIGHLIGHT_CARDS if _normalize_key(item["title"]) not in existing_titles
        ]

        if not missing_items:
            return

        for item in missing_items:
            session.add(
                ServiceComboHighlightCard(
                    title=item["title"],
                    description=item["description"],
                    items=json.dumps(item.get("items", []), ensure_ascii=False),
                    footer_note=item.get("footer_note"),
                    theme=item.get("theme", "emerald"),
                    order_index=int(item.get("order_index", 0)),
                    active=bool(item.get("active", True)),
                )
            )

        session.commit()


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


def _ensure_newsletter_columns():
    """
    Asegura columnas de confirmacion para doble opt-in y operacion en produccion.
    Compatible con SQLite y PostgreSQL sin romper datos existentes.
    """
    backend = engine.url.get_backend_name()

    with engine.begin() as conn:
        if backend == "sqlite":
            pragma_rows = conn.execute(text("PRAGMA table_info('newsletter_subscriber')")).fetchall()
            columns = {str(row[1]) for row in pragma_rows}
            if "email_verified_at" not in columns:
                conn.execute(text("ALTER TABLE newsletter_subscriber ADD COLUMN email_verified_at DATETIME"))
            if "confirmation_token_hash" not in columns:
                conn.execute(text("ALTER TABLE newsletter_subscriber ADD COLUMN confirmation_token_hash VARCHAR"))
            if "confirmation_sent_at" not in columns:
                conn.execute(text("ALTER TABLE newsletter_subscriber ADD COLUMN confirmation_sent_at DATETIME"))
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_newsletter_subscriber_confirmation_token_hash "
                    "ON newsletter_subscriber (confirmation_token_hash)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_newsletter_subscriber_email_verified_at "
                    "ON newsletter_subscriber (email_verified_at)"
                )
            )
            return

        conn.execute(
            text("ALTER TABLE newsletter_subscriber ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL")
        )
        conn.execute(
            text("ALTER TABLE newsletter_subscriber ADD COLUMN IF NOT EXISTS confirmation_token_hash VARCHAR NULL")
        )
        conn.execute(
            text("ALTER TABLE newsletter_subscriber ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMP NULL")
        )
        conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_newsletter_subscriber_confirmation_token_hash "
                "ON newsletter_subscriber (confirmation_token_hash)"
            )
        )
        conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_newsletter_subscriber_email_verified_at "
                "ON newsletter_subscriber (email_verified_at)"
            )
        )

def _ensure_enterprise_proposal_columns():
    backend = engine.url.get_backend_name()
    with engine.begin() as conn:
        if backend == "sqlite":
            pragma_rows = conn.execute(text("PRAGMA table_info('enterprise_proposal')")).fetchall()
            columns = {str(row[1]) for row in pragma_rows}
            if "public_token" not in columns:
                conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN public_token VARCHAR"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_ent_prop_token ON enterprise_proposal (public_token)"))
            if "user_id" not in columns:
                conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN user_id INTEGER"))
            if "accepted_at" not in columns:
                conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN accepted_at DATETIME"))
            if "rejected_at" not in columns:
                conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN rejected_at DATETIME"))
            return

        conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN IF NOT EXISTS public_token VARCHAR"))
        conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN IF NOT EXISTS user_id INTEGER"))
        conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP NULL"))
        conn.execute(text("ALTER TABLE enterprise_proposal ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_ent_prop_token ON enterprise_proposal (public_token)"))


def _ensure_lead_communication_columns():
    """Asegura la existencia de metadatos de threading para correo."""
    backend = engine.url.get_backend_name()
    with engine.begin() as conn:
        if backend == "sqlite":
            pragma_rows = conn.execute(text("PRAGMA table_info('lead_communication')")).fetchall()
            columns = {str(row[1]) for row in pragma_rows}
            sqlite_columns = {
                "message_id": "VARCHAR",
                "thread_id": "VARCHAR",
                "in_reply_to": "VARCHAR",
                "references_header": "TEXT",
                "direction": "VARCHAR DEFAULT 'incoming'",
                "folder": "VARCHAR",
                "from_email": "VARCHAR",
                "to_email": "VARCHAR",
            }
            for column_name, column_type in sqlite_columns.items():
                if column_name not in columns:
                    conn.execute(text(f"ALTER TABLE lead_communication ADD COLUMN {column_name} {column_type}"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_msgid ON lead_communication (message_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_thread ON lead_communication (thread_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_inreply ON lead_communication (in_reply_to)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_direction ON lead_communication (direction)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_folder ON lead_communication (folder)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_fromemail ON lead_communication (from_email)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_toemail ON lead_communication (to_email)"))
            return

        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS message_id VARCHAR NULL"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS thread_id VARCHAR NULL"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS in_reply_to VARCHAR NULL"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS references_header TEXT NULL"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS direction VARCHAR NOT NULL DEFAULT 'incoming'"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS folder VARCHAR NULL"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS from_email VARCHAR NULL"))
        conn.execute(text("ALTER TABLE lead_communication ADD COLUMN IF NOT EXISTS to_email VARCHAR NULL"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_msgid ON lead_communication (message_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_thread ON lead_communication (thread_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_inreply ON lead_communication (in_reply_to)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_direction ON lead_communication (direction)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_folder ON lead_communication (folder)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_fromemail ON lead_communication (from_email)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_lead_comm_toemail ON lead_communication (to_email)"))


def _backfill_lead_communication_metadata():
    """Normaliza correos históricos para que no se agrupen por asunto."""
    with Session(engine) as session:
        rows = session.exec(
            select(LeadCommunication).order_by(LeadCommunication.created_at, LeadCommunication.id)
        ).all()

        if not rows:
            return

        changed = False

        for row in rows:
            legacy_sender = str(row.sender or "").strip()
            legacy_sender_lower = legacy_sender.lower()
            inferred_outgoing = (
                str(row.direction or "").lower() == "outgoing"
                or str(row.status or "").lower() == "sent"
                or legacy_sender_lower == "admin"
                or legacy_sender_lower.startswith("admin_to_")
                or "@resend.dev" in legacy_sender_lower
            )

            normalized_from_email = normalize_email_address(row.from_email)
            normalized_to_email = normalize_email_address(row.to_email)
            legacy_contact = normalize_email_address(legacy_sender.replace("admin_to_", ""))

            if not normalized_from_email:
                normalized_from_email = legacy_contact if not inferred_outgoing else normalize_email_address(os.getenv("EMAIL_FROM") or os.getenv("IMAP_USER"))
            if not normalized_to_email and inferred_outgoing:
                normalized_to_email = legacy_contact

            clean_mid = clean_message_id(row.message_id)
            clean_reply_to = clean_message_id(row.in_reply_to)
            clean_references = " ".join(parse_reference_ids(row.references_header)) or None
            inferred_direction = "outgoing" if inferred_outgoing else "incoming"
            inferred_folder = row.folder or ("sent" if inferred_outgoing else "inbox")

            if row.message_id != clean_mid:
                row.message_id = clean_mid
                changed = True
            if row.in_reply_to != clean_reply_to:
                row.in_reply_to = clean_reply_to
                changed = True
            if row.references_header != clean_references:
                row.references_header = clean_references
                changed = True
            if row.direction != inferred_direction:
                row.direction = inferred_direction
                changed = True
            if row.folder != inferred_folder:
                row.folder = inferred_folder
                changed = True
            if row.from_email != normalized_from_email:
                row.from_email = normalized_from_email or None
                changed = True
            if row.to_email != normalized_to_email:
                row.to_email = normalized_to_email or None
                changed = True

        if changed:
            session.flush()

        known_threads: dict[str, str] = {}

        for row in rows:
            message_id = clean_message_id(row.message_id)
            if message_id and row.thread_id:
                known_threads[message_id] = row.thread_id

        for row in rows:
            if row.thread_id:
                continue

            resolved_thread_id = None
            for candidate in [clean_message_id(row.in_reply_to), *reversed(parse_reference_ids(row.references_header))]:
                if candidate and candidate in known_threads:
                    resolved_thread_id = known_threads[candidate]
                    break

            if not resolved_thread_id:
                resolved_thread_id = clean_message_id(row.message_id) or f"legacy-email-{row.id}"

            row.thread_id = resolved_thread_id
            changed = True

            message_id = clean_message_id(row.message_id)
            if message_id:
                known_threads[message_id] = resolved_thread_id

        if changed:
            session.commit()


def init_db():
    """Crear todas las tablas definidas en los modelos"""
    SQLModel.metadata.create_all(engine)
    _ensure_review_table_exists()
    _ensure_advisory_booking_columns()
    _ensure_newsletter_columns()
    _ensure_enterprise_proposal_columns()
    _ensure_lead_communication_columns()
    _backfill_lead_communication_metadata()
    # Asegurar tabla para correos directos
    with engine.begin() as conn:
        backend = engine.url.get_backend_name()
        if backend == "sqlite":
            cursor = conn.connection.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS direct_inquiry (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT DEFAULT 'Cliente Directo',
                    email TEXT NOT NULL,
                    subject TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
                )
            """)
        else:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS direct_inquiry (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR DEFAULT 'Cliente Directo',
                    email VARCHAR NOT NULL,
                    subject VARCHAR,
                    status VARCHAR DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
                )
            """))
    
    _seed_additional_services()
    _seed_service_combos()
    _seed_combo_diagnostic_cards()
    _seed_combo_highlight_cards()
    _seed_service_advisory_cards()
    _seed_advisory_weekly_availability()
    print("[DB] Base de datos inicializada correctamente")

def get_session():
    from sqlmodel import Session
    with Session(engine) as session:
        yield session
