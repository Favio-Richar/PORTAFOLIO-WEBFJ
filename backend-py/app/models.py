from typing import Optional
from sqlmodel import SQLModel, Field


class Blog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str


class Proyecto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    category: str
    status: str
    version: str
    description: str
    image_url: str
    video_url: Optional[str] = None
    media: Optional[str] = Field(default="[]")  # JSON string: Array<{type: 'image'|'video', url: string}>
    demo_url: str
    repo_url: str
    stack: str  # JSON string del array de tecnologías
    deployment_date: Optional[str] = None
    client_name: Optional[str] = None


class Cliente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: Optional[str] = None
    company: Optional[str] = None
    testimonial: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None


class Cotizacion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str
    telefono: Optional[str] = None
    servicio: Optional[str] = None
    mensaje: Optional[str] = None
    status: Optional[str] = Field(default="pending")
    created_at: Optional[str] = None


class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None


# ========== NUEVOS MODELOS PARA PORTFOLIO ==========

class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    title: str
    profile_image: Optional[str] = None
    profile_video: Optional[str] = None


class Experience(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str
    position: str
    period: str  # Seguiremos guardando el string para compatibilidad, o mapearemos
    location: Optional[str] = None
    employment_type: Optional[str] = None  # Full-time, Remote, etc.
    description: Optional[str] = None
    technologies: Optional[str] = None  # JSON string de array


class Education(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    degree: str
    institution: str
    field_of_study: Optional[str] = None
    location: str
    start_year: str  # Cambiaremos a formato fecha en el front
    end_year: str
    description: Optional[str] = None
    certificate_url: Optional[str] = None


class Timeline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    year: str
    title: str
    description: str
    category: Optional[str] = None
    icon: Optional[str] = None


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


class Contact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None
