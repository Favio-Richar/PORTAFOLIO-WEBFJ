import base64
import json
import logging
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)

BOOKING_TIMEZONE = (os.getenv("BOOKING_TIMEZONE") or "America/Santiago").strip()


@dataclass
class MeetingProvisionRequest:
    booking_code: str
    provider: str
    service_name: str
    customer_name: str
    customer_email: str
    notes: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    duration_min: int


@dataclass
class MeetingProvisionResult:
    meeting_link: Optional[str]
    status: str  # confirmed | pending
    detail: str


def _slug(value: str, max_len: int = 64) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", str(value or "").strip().lower()).strip("-")
    if not normalized:
        normalized = uuid4().hex[:10]
    return normalized[:max_len]


def _slot_window(payload: MeetingProvisionRequest) -> tuple[datetime, datetime]:
    start = datetime.strptime(f"{payload.date} {payload.time}", "%Y-%m-%d %H:%M").replace(
        tzinfo=ZoneInfo(BOOKING_TIMEZONE)
    )
    duration = max(15, int(payload.duration_min or 60))
    end = start + timedelta(minutes=duration)
    return start, end


def _http_json(
    method: str,
    url: str,
    headers: Optional[dict] = None,
    payload: Optional[dict] = None,
    timeout_sec: int = 20,
) -> dict:
    request_headers = {"Accept": "application/json", **(headers or {})}
    request_data = None
    if payload is not None:
        request_headers["Content-Type"] = "application/json"
        request_data = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(url=url, method=method.upper(), headers=request_headers, data=request_data)
    try:
        with urllib.request.urlopen(request, timeout=timeout_sec) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {exc.code} en {url}: {raw[:400]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"No se pudo conectar a {url}: {exc}") from exc


def _http_form(
    method: str,
    url: str,
    headers: Optional[dict] = None,
    form_data: Optional[dict] = None,
    timeout_sec: int = 20,
) -> dict:
    encoded = urllib.parse.urlencode(form_data or {}).encode("utf-8")
    request_headers = {"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"}
    request_headers.update(headers or {})
    request = urllib.request.Request(url=url, method=method.upper(), headers=request_headers, data=encoded)
    try:
        with urllib.request.urlopen(request, timeout=timeout_sec) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {exc.code} en {url}: {raw[:400]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"No se pudo conectar a {url}: {exc}") from exc


def _google_access_token() -> str:
    try:
        from google.auth.transport.requests import Request as GoogleAuthRequest
        from google.oauth2 import service_account
    except Exception as exc:
        raise RuntimeError("google-auth no esta disponible en el backend.") from exc

    service_account_file = (os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE") or "").strip()
    service_account_json = (os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON") or "").strip()
    impersonate_user = (os.getenv("GOOGLE_CALENDAR_IMPERSONATE_EMAIL") or "").strip() or None

    if not service_account_file and not service_account_json:
        raise RuntimeError("Falta GOOGLE_SERVICE_ACCOUNT_FILE o GOOGLE_SERVICE_ACCOUNT_JSON.")

    scopes = ["https://www.googleapis.com/auth/calendar.events"]
    if service_account_json:
        info = json.loads(service_account_json)
        creds = service_account.Credentials.from_service_account_info(info, scopes=scopes)
    else:
        creds = service_account.Credentials.from_service_account_file(service_account_file, scopes=scopes)

    if impersonate_user:
        creds = creds.with_subject(impersonate_user)

    creds.refresh(GoogleAuthRequest())
    if not creds.token:
        raise RuntimeError("No se pudo generar token para Google Calendar.")
    return creds.token


def _is_google_configured() -> bool:
    service_account_file = (os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE") or "").strip()
    service_account_json = (os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON") or "").strip()
    return bool(service_account_file or service_account_json)


def _create_google_meet(payload: MeetingProvisionRequest) -> str:
    token = _google_access_token()
    calendar_id = (os.getenv("GOOGLE_CALENDAR_ID") or "primary").strip()
    start, end = _slot_window(payload)
    attendees = [{"email": payload.customer_email}] if payload.customer_email else []

    body = {
        "summary": f"Asesoria: {payload.service_name}",
        "description": payload.notes or f"Asesoria {payload.booking_code}",
        "start": {"dateTime": start.isoformat(), "timeZone": BOOKING_TIMEZONE},
        "end": {"dateTime": end.isoformat(), "timeZone": BOOKING_TIMEZONE},
        "conferenceData": {
            "createRequest": {
                "requestId": f"{payload.booking_code}-{uuid4().hex[:8]}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
        "attendees": attendees,
    }

    url = (
        "https://www.googleapis.com/calendar/v3/calendars/"
        f"{urllib.parse.quote(calendar_id, safe='')}/events"
        "?conferenceDataVersion=1&sendUpdates=none"
    )
    response = _http_json(
        "POST",
        url,
        headers={"Authorization": f"Bearer {token}"},
        payload=body,
    )

    link = response.get("hangoutLink")
    if not link:
        conference = response.get("conferenceData") or {}
        entries = conference.get("entryPoints") or []
        for entry in entries:
            if entry.get("entryPointType") == "video" and entry.get("uri"):
                link = entry["uri"]
                break
    if not link:
        link = response.get("htmlLink")

    if not link:
        raise RuntimeError("Google Calendar no devolvio link de reunion.")
    return str(link)


def _zoom_access_token() -> str:
    account_id = (os.getenv("ZOOM_ACCOUNT_ID") or "").strip()
    client_id = (os.getenv("ZOOM_CLIENT_ID") or "").strip()
    client_secret = (os.getenv("ZOOM_CLIENT_SECRET") or "").strip()
    if not account_id or not client_id or not client_secret:
        raise RuntimeError("Faltan credenciales Zoom: ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET.")

    auth = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    url = (
        "https://zoom.us/oauth/token?"
        f"grant_type=account_credentials&account_id={urllib.parse.quote(account_id, safe='')}"
    )
    response = _http_form("POST", url, headers={"Authorization": f"Basic {auth}"}, form_data={})
    token = str(response.get("access_token") or "").strip()
    if not token:
        raise RuntimeError("Zoom no devolvio access_token.")
    return token


def _is_zoom_configured() -> bool:
    account_id = (os.getenv("ZOOM_ACCOUNT_ID") or "").strip()
    client_id = (os.getenv("ZOOM_CLIENT_ID") or "").strip()
    client_secret = (os.getenv("ZOOM_CLIENT_SECRET") or "").strip()
    return bool(account_id and client_id and client_secret)


def _create_zoom_meeting(payload: MeetingProvisionRequest) -> str:
    token = _zoom_access_token()
    user_id = (os.getenv("ZOOM_USER_ID") or "me").strip()
    start, _ = _slot_window(payload)
    duration = max(15, int(payload.duration_min or 60))

    body = {
        "topic": f"Asesoria: {payload.service_name}",
        "type": 2,
        "start_time": start.strftime("%Y-%m-%dT%H:%M:%S"),
        "timezone": BOOKING_TIMEZONE,
        "duration": duration,
        "agenda": payload.notes or f"Reserva {payload.booking_code}",
        "settings": {"join_before_host": False, "waiting_room": True},
    }

    url = f"https://api.zoom.us/v2/users/{urllib.parse.quote(user_id, safe='')}/meetings"
    response = _http_json("POST", url, headers={"Authorization": f"Bearer {token}"}, payload=body)
    link = str(response.get("join_url") or "").strip()
    if not link:
        raise RuntimeError("Zoom no devolvio join_url.")
    return link


def _microsoft_graph_token() -> str:
    tenant_id = (os.getenv("TEAMS_TENANT_ID") or "").strip()
    client_id = (os.getenv("TEAMS_CLIENT_ID") or "").strip()
    client_secret = (os.getenv("TEAMS_CLIENT_SECRET") or "").strip()
    if not tenant_id or not client_id or not client_secret:
        raise RuntimeError("Faltan credenciales Teams: TEAMS_TENANT_ID / TEAMS_CLIENT_ID / TEAMS_CLIENT_SECRET.")

    token_url = f"https://login.microsoftonline.com/{urllib.parse.quote(tenant_id, safe='')}/oauth2/v2.0/token"
    response = _http_form(
        "POST",
        token_url,
        form_data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": "https://graph.microsoft.com/.default",
        },
    )
    token = str(response.get("access_token") or "").strip()
    if not token:
        raise RuntimeError("Microsoft Graph no devolvio access_token.")
    return token


def _is_teams_configured() -> bool:
    tenant_id = (os.getenv("TEAMS_TENANT_ID") or "").strip()
    client_id = (os.getenv("TEAMS_CLIENT_ID") or "").strip()
    client_secret = (os.getenv("TEAMS_CLIENT_SECRET") or "").strip()
    organizer = (os.getenv("TEAMS_ORGANIZER_USER_ID") or "").strip()
    return bool(tenant_id and client_id and client_secret and organizer)


def _create_teams_meeting(payload: MeetingProvisionRequest) -> str:
    organizer = (os.getenv("TEAMS_ORGANIZER_USER_ID") or "").strip()
    if not organizer:
        raise RuntimeError("Falta TEAMS_ORGANIZER_USER_ID (email o user id del organizador).")

    token = _microsoft_graph_token()
    start, end = _slot_window(payload)

    body = {
        "subject": f"Asesoria: {payload.service_name}",
        "startDateTime": start.isoformat(),
        "endDateTime": end.isoformat(),
    }
    url = f"https://graph.microsoft.com/v1.0/users/{urllib.parse.quote(organizer, safe='')}/onlineMeetings"
    response = _http_json("POST", url, headers={"Authorization": f"Bearer {token}"}, payload=body)
    link = str(response.get("joinWebUrl") or "").strip()
    if not link:
        raise RuntimeError("Teams no devolvio joinWebUrl.")
    return link


def _create_jitsi_meeting(payload: MeetingProvisionRequest) -> str:
    room = _slug(f"asesoria-{payload.booking_code}-{payload.customer_name}")
    return f"https://meet.jit.si/{room}"


def _create_whereby_meeting(payload: MeetingProvisionRequest) -> str:
    room_prefix = (os.getenv("WHEREBY_ROOM_PREFIX") or "asesoria").strip()
    room = _slug(f"{room_prefix}-{payload.booking_code}")
    return f"https://whereby.com/{room}"


def provider_is_configured(provider: str) -> bool:
    normalized = (provider or "").strip().lower()
    if normalized == "google_meet":
        return _is_google_configured()
    if normalized == "teams":
        return _is_teams_configured()
    if normalized == "zoom":
        return _is_zoom_configured()
    if normalized == "jitsi":
        return True
    if normalized == "whereby":
        return True
    return False


def _fallback_meeting(provider: str, payload: MeetingProvisionRequest) -> Optional[str]:
    fallback = (os.getenv("BOOKING_MEETING_FALLBACK_PROVIDER") or "none").strip().lower()
    if fallback == "none":
        return None
    if fallback == "jitsi":
        return _create_jitsi_meeting(payload)
    if fallback == "whereby":
        return _create_whereby_meeting(payload)
    if fallback == "google_meet":
        return "https://meet.google.com/new"
    if fallback == "zoom":
        return "https://zoom.us/meeting/schedule"
    if fallback == "teams":
        return "https://teams.microsoft.com/l/meetup-join/"
    return None


def provision_meeting(payload: MeetingProvisionRequest) -> MeetingProvisionResult:
    provider = (payload.provider or "google_meet").strip().lower()

    try:
        if provider == "google_meet":
            link = _create_google_meet(payload)
            return MeetingProvisionResult(meeting_link=link, status="confirmed", detail="Reunion creada en Google Meet.")
        if provider == "zoom":
            link = _create_zoom_meeting(payload)
            return MeetingProvisionResult(meeting_link=link, status="confirmed", detail="Reunion creada en Zoom.")
        if provider == "teams":
            link = _create_teams_meeting(payload)
            return MeetingProvisionResult(meeting_link=link, status="confirmed", detail="Reunion creada en Teams.")
        if provider == "jitsi":
            link = _create_jitsi_meeting(payload)
            return MeetingProvisionResult(meeting_link=link, status="confirmed", detail="Sala Jitsi creada.")
        if provider == "whereby":
            link = _create_whereby_meeting(payload)
            return MeetingProvisionResult(meeting_link=link, status="confirmed", detail="Sala Whereby creada.")
        return MeetingProvisionResult(meeting_link=None, status="pending", detail="Proveedor no soportado.")
    except Exception as exc:
        logger.exception("Fallo integracion de meeting para provider=%s: %s", provider, exc)
        fallback_link = _fallback_meeting(provider, payload)
        if fallback_link:
            return MeetingProvisionResult(
                meeting_link=fallback_link,
                status="confirmed",
                detail="No se pudo crear reunion en proveedor principal. Se genero enlace alternativo.",
            )
        return MeetingProvisionResult(
            meeting_link=None,
            status="pending",
            detail="Reserva creada, pero la reunion quedo pendiente de confirmacion manual.",
        )
