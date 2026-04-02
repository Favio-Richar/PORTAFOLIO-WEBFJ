import re
import uuid
from email.utils import parseaddr
from typing import Optional

from sqlmodel import Session, select

from app.models import LeadCommunication


_MESSAGE_ID_PATTERN = re.compile(r"<[^<>]+>")


def normalize_email_address(value: Optional[str]) -> str:
    return parseaddr(str(value or "").strip())[1].strip().lower()


def clean_message_id(value: Optional[str]) -> Optional[str]:
    raw_value = str(value or "").strip()
    if not raw_value:
        return None

    match = _MESSAGE_ID_PATTERN.search(raw_value)
    if match:
        return match.group(0)

    return raw_value


def parse_reference_ids(value: Optional[str]) -> list[str]:
    raw_value = str(value or "").strip()
    if not raw_value:
        return []

    matches = _MESSAGE_ID_PATTERN.findall(raw_value)
    candidates = matches or raw_value.replace(",", " ").split()
    normalized: list[str] = []

    for candidate in candidates:
        clean_candidate = clean_message_id(candidate)
        if clean_candidate and clean_candidate not in normalized:
            normalized.append(clean_candidate)

    return normalized


def build_message_id(from_email: Optional[str] = None) -> str:
    normalized_from = normalize_email_address(from_email)
    domain = normalized_from.split("@", 1)[1] if "@" in normalized_from else "crm.local"
    return f"<crm-{uuid.uuid4().hex}@{domain}>"


def resolve_thread_id(
    session: Session,
    *,
    message_id: Optional[str] = None,
    in_reply_to: Optional[str] = None,
    references_header: Optional[str] = None,
    fallback: Optional[str] = None,
) -> str:
    candidate_ids: list[str] = []

    clean_reply_to = clean_message_id(in_reply_to)
    if clean_reply_to:
        candidate_ids.append(clean_reply_to)

    for reference_id in reversed(parse_reference_ids(references_header)):
        if reference_id not in candidate_ids:
            candidate_ids.append(reference_id)

    for candidate_id in candidate_ids:
        parent = session.exec(
            select(LeadCommunication).where(LeadCommunication.message_id == candidate_id)
        ).first()
        if parent:
            return parent.thread_id or clean_message_id(parent.message_id) or f"legacy-email-{parent.id}"

    clean_current_message_id = clean_message_id(message_id)
    if clean_current_message_id:
        return clean_current_message_id

    return fallback or f"thread-{uuid.uuid4().hex}"
