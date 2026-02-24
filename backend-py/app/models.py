from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    name: Optional[str] = None
    provider: str = Field(default="local", index=True)
    provider_id: Optional[str] = Field(default=None, index=True, unique=True)
    avatar_url: Optional[str] = None
    role: str = Field(default="admin")
    is_active: bool = Field(default=True)
    created_at: Optional[str] = None
    reset_code: Optional[str] = None
    reset_code_expires: Optional[str] = None # ISO format datetime

# ========== PUBLICIDAD ==========

class Ad(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    media: str = Field(default="[]") # JSON string: Array<{type: 'image'|'video', url: string}>
    redirect_url: Optional[str] = None
    is_active: bool = Field(default=True)
    position: str = Field(default="login_header")  # login_hero, etc
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ========== PERFIL ==========

class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    title: str
    profile_image: Optional[str] = None
    profile_video: Optional[str] = None
    about: Optional[str] = None

# ========== EXPERIENCIA ==========

class Experience(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str
    position: str
    period: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None # JSON string or comma separated

# ========== PROYECTOS ==========

class Proyecto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    category: str
    status: str
    version: str
    description: str
    image_url: str
    video_url: Optional[str] = None
    media: Optional[str] = "[]" # JSON string array
    demo_url: str
    repo_url: str
    stack: str # JSON list
    results: Optional[str] = "{}" # JSON string mapping for metrics
    deployment_date: Optional[str] = None
    client_name: Optional[str] = None
    year: Optional[str] = "2024"


# ========== CASOS DE ÉXITO (CLIENTES) ==========

class CasoExito(SQLModel, table=True):
    """Casos de éxito para la página de Clientes"""
    id: Optional[int] = Field(default=None, primary_key=True)
    client_name: str  # Nombre del cliente
    company_name: str  # Nombre de la empresa
    industry: str  # Industria: finanzas, salud, retail, educación, construcción, tecnología
    year: str = Field(default="2024")
    website_url: Optional[str] = None  # URL de la web desplegada
    logo_url: Optional[str] = None  # Logo del cliente
    
    # Contenido descriptivo
    description: str  # Descripción detallada del caso de éxito
    testimonial: Optional[str] = None  # Testimonio del cliente
    
    # Datos estructurados (JSON)
    services: Optional[str] = "[]"  # JSON array: servicios aplicados
    timeline: Optional[str] = "[]"  # JSON array: fases del proyecto
    metrics: Optional[str] = "[]"  # JSON array: métricas de impacto
    results: Optional[str] = "{}"  # JSON object: resultados resumidos (revenue, users, etc)
    media: Optional[str] = "[]"  # JSON array: fotos y videos
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


# ========== CASOS DE ÉXITO COMPLETOS (CLIENTES) ==========

class CasoExitoCompleto(SQLModel, table=True):
    """Casos completos para /clientes/casos-completos y gestión avanzada en admin."""
    id: Optional[int] = Field(default=None, primary_key=True)

    # Identidad y contexto
    slug: str = Field(index=True, unique=True)
    company_name: str
    client_name: str
    client_role: Optional[str] = None
    industry: str
    year: str = Field(default="2026")
    country: Optional[str] = None
    website_url: Optional[str] = None

    # Branding y portada
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_video_url: Optional[str] = None

    # Narrativa del caso
    headline: str
    summary: str
    challenge: Optional[str] = None
    solution: Optional[str] = None
    impact: Optional[str] = None
    testimonial: Optional[str] = None

    # Estructura avanzada (JSON serializado)
    services: Optional[str] = "[]"
    technologies: Optional[str] = "[]"
    kpis: Optional[str] = "[]"
    timeline: Optional[str] = "[]"
    gallery: Optional[str] = "[]"
    extra_links: Optional[str] = "[]"

    # Estado de publicación
    order_index: int = Field(default=0, index=True)
    is_featured: bool = Field(default=False, index=True)
    is_published: bool = Field(default=True, index=True)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None




# ========== CONTACTO ==========

class Contact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    phone: str
    whatsapp: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    tiktok: Optional[str] = None
    location: str
    lat: Optional[float] = Field(default=-33.4569385)
    lng: Optional[float] = Field(default=-70.6482684)
    hero_image: Optional[str] = None
    hero_video: Optional[str] = None

# ========== TIMELINE (HITOS) ==========

class Timeline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    year: str
    title: str
    description: str
    category: Optional[str] = None
    icon: Optional[str] = None

# ========== CERTIFICACIONES ==========

class Certification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    issuer: str
    date: str
    description: Optional[str] = None
    icon: Optional[str] = None
    level: Optional[str] = None
    color: Optional[str] = None
    badge: Optional[str] = None
    credential_url: Optional[str] = None

# ========== EDUCACIÓN ==========

class Education(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    degree: str
    institution: str
    field_of_study: Optional[str] = None
    location: str
    start_year: str
    end_year: str
    description: Optional[str] = None
    certificate_url: Optional[str] = None

# ========== BLOG ==========

class Blog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    author: Optional[str] = "Favio Jiménez"
    category: Optional[str] = None
    tags: Optional[str] = None # JSON string
    is_published: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ========== PROFESSIONAL SERVICES (PLANES Y MÁS) ==========

class BlogHeroConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    badge_text: str = Field(default="Articulo destacado")
    headline_prefix: str = Field(default="El Futuro del")
    headline_highlight: str = Field(default="Software Engineering")
    headline_suffix: str = Field(default="en la era de la IA")
    description: str = Field(
        default="Analisis profundo sobre como los modelos fundacionales estan redefiniendo el ciclo de vida de desarrollo."
    )
    cta_text: str = Field(default="Leer Ahora")
    cta_url: str = Field(default="/blog")
    read_time_text: str = Field(default="15 min de lectura")
    media_type: str = Field(default="video")
    background_image_url: Optional[str] = None
    background_video_url: Optional[str] = None
    card_kicker: str = Field(default="Radar Tecnologico 2026")
    card_title: str = Field(default="3 tendencias que estan cambiando el desarrollo")
    card_description: str = Field(
        default="IA agentes, cloud eficiente y seguridad zero trust para productos reales."
    )
    card_tags: Optional[str] = Field(default='["LLM Ops","Cloud Native","Zero Trust"]')
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BlogHeroSlide(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    media_type: str = Field(default="image")
    background_image_url: Optional[str] = None
    background_video_url: Optional[str] = None
    card_kicker: str = Field(default="Radar Tecnologico 2026")
    card_title: str = Field(default="3 tendencias que estan cambiando el desarrollo")
    card_description: str = Field(
        default="IA agentes, cloud eficiente y seguridad zero trust para productos reales."
    )
    card_tags: Optional[str] = Field(default='["LLM OPS","CLOUD NATIVE","ZERO TRUST"]')
    is_active: bool = Field(default=True, index=True)
    order_index: int = Field(default=0, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProfessionalPlan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    modules: Optional[str] = None # JSON or newline separated
    price: str
    includes: Optional[str] = None # JSON or newline separated
    delivery: Optional[str] = None
    ideal_for: Optional[str] = None
    category: Optional[str] = None
    order_index: int = Field(default=0)

class AdditionalService(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    price: str
    icon: Optional[str] = None
    color: Optional[str] = None
    includes: Optional[str] = None
    recurring: bool = Field(default=False)
    payment_type: Optional[str] = "one-time"

class ServiceAdvisoryCard(SQLModel, table=True):
    __tablename__ = "service_advisory_card"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    price: str
    duration: str = Field(default="60 minutos")
    audience: Optional[str] = Field(default="[]")
    includes: Optional[str] = Field(default="[]")
    result: str
    market_note: Optional[str] = None
    icon: Optional[str] = Field(default="briefcase")
    order_index: int = Field(default=0, index=True)
    active: bool = Field(default=True, index=True)


class AdvisoryBooking(SQLModel, table=True):
    __tablename__ = "advisory_booking"

    id: Optional[int] = Field(default=None, primary_key=True)
    booking_code: str = Field(index=True)
    service_id: Optional[int] = Field(default=None, index=True)
    service_name: str
    date: str = Field(index=True)  # YYYY-MM-DD
    time: str = Field(index=True)  # HH:MM
    customer_name: str
    customer_email: str
    customer_phone: str
    company: Optional[str] = None
    notes: Optional[str] = None
    meeting_provider: str = Field(default="google_meet")
    reminders_h24: bool = Field(default=True)
    reminders_h1: bool = Field(default=True)
    reminder_h24_sent_at: Optional[datetime] = None
    reminder_h1_sent_at: Optional[datetime] = None
    status: str = Field(default="confirmed", index=True)  # pending|confirmed|cancelled|rescheduled
    meeting_link: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class AdvisoryBlockedSlot(SQLModel, table=True):
    __tablename__ = "advisory_blocked_slot"

    id: Optional[int] = Field(default=None, primary_key=True)
    date: str = Field(index=True)  # YYYY-MM-DD
    time: str = Field(index=True)  # HH:MM
    reason: Optional[str] = None
    active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AdvisoryWeeklyAvailability(SQLModel, table=True):
    __tablename__ = "advisory_weekly_availability"

    id: Optional[int] = Field(default=None, primary_key=True)
    weekday: int = Field(index=True)  # 0 Monday ... 6 Sunday
    enabled: bool = Field(default=True)
    start_time: str = Field(default="09:00")
    end_time: str = Field(default="18:00")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ========== FAQ & TEAM ==========

class Faq(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question: str
    answer: str
    category: Optional[str] = "General"
    active: bool = Field(default=True)
    order: int = Field(default=0)

class TeamMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: str
    description: Optional[str] = None
    skills: Optional[str] = None
    avatar_url: Optional[str] = None
    icon: Optional[str] = None
    gradient: Optional[str] = None
    order: int = Field(default=0)
    active: bool = Field(default=True)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    media_type: Optional[str] = "image"

# ========== SERVICES INDUSTRIES ==========

class ServiceIndustry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    icon: Optional[str] = "briefcase"
    examples: Optional[str] = "[]"
    order_index: int = Field(default=0, index=True)
    active: bool = Field(default=True, index=True)

# ========== ABOUT STACK ========== 

class AboutStackItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    icon_key: Optional[str] = None
    color: Optional[str] = None
    order_index: int = Field(default=0, index=True)
    active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

# ========== REVIEWS ==========

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    display_name: Optional[str] = None
    reviewer_email: Optional[str] = None
    author_name: str
    author_role: Optional[str] = None
    author_company: Optional[str] = None
    comment: Optional[str] = None
    content: str
    rating: int = Field(default=5)
    is_verified: bool = Field(default=False)
    page_context: Optional[str] = None
    status: str = Field(default="pending") # approved, pending, rejected
    created_at: Optional[str] = None
    author_image: Optional[str] = None
    initials: Optional[str] = None

# ========== GALLERY / MEDIA ==========

class Media(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: Optional[str] = None
    description: Optional[str] = None
    type: str = Field(default="image") # image, video
    url: str
    order_index: int = Field(default=0)
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

