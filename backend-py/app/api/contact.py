import json
from typing import Optional, Tuple
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends
from sqlmodel import SQLModel, Session, select
from app.db import engine
from app.models import Contact
from app.core.admin_auth import require_admin

router = APIRouter()


class ContactUpdate(SQLModel):
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
    lat: Optional[float] = None
    lng: Optional[float] = None
    hero_image: Optional[str] = None
    hero_video: Optional[str] = None


def _fetch_geocode(params: dict) -> Optional[Tuple[float, float, str]]:
    query = urlencode(params)
    url = f"https://nominatim.openstreetmap.org/search?{query}"
    req = Request(url, headers={"User-Agent": "portfolio-web-contact/1.0"})

    with urlopen(req, timeout=6) as response:
        if response.status != 200:
            return None
        payload = json.loads(response.read().decode("utf-8"))

    if not payload:
        return None

    lat = float(payload[0]["lat"])
    lng = float(payload[0]["lon"])
    display_name = str(payload[0].get("display_name", "")).lower()
    return lat, lng, display_name


def geocode_location(location: str) -> Optional[Tuple[float, float]]:
    """Convierte una dirección a coordenadas usando Nominatim (OpenStreetMap)."""
    location = (location or "").strip()
    if not location:
        return None

    params = {
        "q": location,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
        "accept-language": "es",
    }
    if "chile" in location.lower():
        params["countrycodes"] = "cl"

    try:
        result = _fetch_geocode(params)
        if not result:
            return None
        lat, lng, display_name = result

        # Si la consulta menciona Santiago pero el resultado no, reintenta con una consulta más específica.
        location_l = location.lower()
        wants_santiago = "santiago" in location_l
        if wants_santiago and "santiago" not in display_name:
            retry_params = {
                **params,
                "q": f"{location}, Region Metropolitana de Santiago, Chile",
                "countrycodes": "cl",
            }
            retry_result = _fetch_geocode(retry_params)
            if retry_result:
                lat, lng, _ = retry_result

        return lat, lng
    except Exception:
        return None


@router.get("")
def get_contact():
    """Obtener datos de contacto (solo hay uno)"""
    with Session(engine) as session:
        contact = session.exec(select(Contact)).first()
        if not contact:
            # Crear contacto por defecto si no existe
            contact = Contact(
                email="contacto@levelsoftwarepro.com",
                phone="+56 9 1234 5678",
                whatsapp="+56 9 1234 5678",
                linkedin="",
                github="",
                facebook="",
                instagram="",
                twitter="",
                tiktok="",
                location="Santiago, Chile",
                lat=-33.4569385,
                lng=-70.6482684,
                hero_image="",
                hero_video=""
            )
            session.add(contact)
            session.commit()
            session.refresh(contact)
        return contact


@router.post("")
def update_contact(
    contact_data: ContactUpdate,
    current_user=Depends(require_admin),
):
    """Actualizar o crear contacto"""
    with Session(engine) as session:
        # Buscar contacto existente
        existing = session.exec(select(Contact)).first()

        resolved_lat = contact_data.lat
        resolved_lng = contact_data.lng

        # Si no llegan coordenadas en el payload, intentamos resolverlas desde location.
        if (resolved_lat is None or resolved_lng is None) and contact_data.location:
            geocoded = geocode_location(contact_data.location)
            if geocoded:
                resolved_lat, resolved_lng = geocoded

        if existing:
            # Si cambia la direccion, forzamos geocodificacion para evitar usar coordenadas antiguas del payload.
            current_location = (existing.location or "").strip().lower()
            incoming_location = (contact_data.location or "").strip().lower()
            location_changed = incoming_location and incoming_location != current_location
            manual_coords_provided = contact_data.lat is not None and contact_data.lng is not None
            if location_changed and not manual_coords_provided:
                geocoded = geocode_location(contact_data.location)
                if geocoded:
                    resolved_lat, resolved_lng = geocoded

            # Actualizar existente
            existing.email = contact_data.email
            existing.phone = contact_data.phone
            existing.whatsapp = contact_data.whatsapp
            existing.linkedin = contact_data.linkedin
            existing.github = contact_data.github
            existing.facebook = contact_data.facebook
            existing.instagram = contact_data.instagram
            existing.twitter = contact_data.twitter
            existing.tiktok = contact_data.tiktok
            existing.location = contact_data.location
            if resolved_lat is not None:
                existing.lat = resolved_lat
            if resolved_lng is not None:
                existing.lng = resolved_lng
            existing.hero_image = contact_data.hero_image
            existing.hero_video = contact_data.hero_video
            session.add(existing)
        else:
            # Crear nuevo
            new_contact = Contact(
                email=contact_data.email,
                phone=contact_data.phone,
                whatsapp=contact_data.whatsapp,
                linkedin=contact_data.linkedin,
                github=contact_data.github,
                facebook=contact_data.facebook,
                instagram=contact_data.instagram,
                twitter=contact_data.twitter,
                tiktok=contact_data.tiktok,
                location=contact_data.location,
                lat=resolved_lat if resolved_lat is not None else -33.4569385,
                lng=resolved_lng if resolved_lng is not None else -70.6482684,
                hero_image=contact_data.hero_image,
                hero_video=contact_data.hero_video
            )
            session.add(new_contact)
        
        session.commit()
        return {"message": "Contact saved successfully"}
