from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
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

# ========== REVIEWS ==========

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_name: str
    author_role: Optional[str] = None
    author_company: Optional[str] = None
    content: str
    rating: int = Field(default=5)
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

