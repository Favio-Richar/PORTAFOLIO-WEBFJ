import imaplib
import email
from email.header import decode_header
from email.utils import getaddresses
import os
import time
import threading
from datetime import datetime
from sqlmodel import Session, select, create_engine, text
from app.models import LeadCommunication, AdvisoryBooking, EnterpriseProposal, DirectInquiry, SystemNotification
from app.db import engine
from app.core.email_threading import (
    clean_message_id,
    normalize_email_address,
    parse_reference_ids,
    resolve_thread_id,
)

def get_decode_header(header):
    if not header: return ""
    try:
        decoded = decode_header(header)
        parts = []
        for content, charset in decoded:
            if isinstance(content, bytes):
                parts.append(content.decode(charset or 'utf-8', errors='replace'))
            else:
                parts.append(str(content))
        return "".join(parts)
    except: return str(header)

def is_spam_heuristic(subject, content, sender_email):
    subj = str(subject or "").lower()
    cont = str(content or "").lower()
    snd = str(sender_email or "").lower()
    spam_keywords = ["casino", "poker", "lottery", "winner", "prize", "jackpot", "viagra", "bitcoin", "crypto", "investment opportunity", "beneficiary", "money transfer", "congratulations", "earn money"]
    suspicious_domains = [".xyz", ".top", ".buzz", ".monster", ".icu", ".online"]
    if any(snd.endswith(d) for d in suspicious_domains): return True
    if any(k in subj for k in spam_keywords): return True
    if any(k in cont for k in spam_keywords) and len(cont) < 600: return True
    return False


def get_header_addresses(header_value):
    addresses = []
    for _, address in getaddresses([str(header_value or "")]):
        normalized = normalize_email_address(address)
        if normalized and normalized not in addresses:
            addresses.append(normalized)
    return addresses

def sync_emails():
    imap_server = os.getenv("IMAP_SERVER")
    imap_user = os.getenv("IMAP_USER")
    imap_pass = os.getenv("IMAP_PASS")
    if not all([imap_server, imap_user, imap_pass]): return

    try:
        mail = imaplib.IMAP4_SSL(imap_server)
        mail.login(imap_user, imap_pass)
        admin_emails = {imap_user.lower(), os.getenv("ADMIN_EMAIL", "").lower()}

        def sync_folder(folder_name: str, status_label: str = "pending", limit: int = 50):
            try:
                res, info = mail.select(f'"{folder_name}"', readonly=True)
                if res != 'OK': return
            except: return
            
            res, data = mail.search(None, 'ALL')
            if res != 'OK': return
            ids = data[0].split()[-limit:]
            if not ids: return

            with Session(engine) as session:
                for e_id in ids:
                    try:
                        res, msg_data = mail.fetch(e_id, '(RFC822)')
                        if res != 'OK': continue
                        msg = email.message_from_bytes(msg_data[0][1])
                        
                        header_id = clean_message_id(msg.get("Message-ID"))
                        in_reply_to = clean_message_id(msg.get("In-Reply-To"))
                        references_header = " ".join(parse_reference_ids(get_decode_header(msg.get("References")))) or None
                        subject = get_decode_header(msg.get("Subject"))
                        from_candidates = get_header_addresses(get_decode_header(msg.get("From")))
                        to_candidates = get_header_addresses(get_decode_header(msg.get("To")))
                        from_email = from_candidates[0] if from_candidates else ""
                        to_email = to_candidates[0] if to_candidates else ""
                        
                        # ID único robusto
                        message_id = header_id or f"imap_{folder_name}_{e_id.decode()}"

                        existing = session.exec(select(LeadCommunication).where(LeadCommunication.message_id == message_id)).first()
                        direction = "outgoing" if status_label == "sent" else "incoming"
                        folder_value = folder_name
                        thread_id = resolve_thread_id(
                            session,
                            message_id=message_id,
                            in_reply_to=in_reply_to,
                            references_header=references_header,
                            fallback=f"imap-{folder_name}-{e_id.decode()}",
                        )

                        if existing:
                            updated = False
                            if not existing.thread_id and thread_id:
                                existing.thread_id = thread_id
                                updated = True
                            if not existing.in_reply_to and in_reply_to:
                                existing.in_reply_to = in_reply_to
                                updated = True
                            if not existing.references_header and references_header:
                                existing.references_header = references_header
                                updated = True
                            if not existing.direction:
                                existing.direction = direction
                                updated = True
                            if not existing.folder and folder_value:
                                existing.folder = folder_value
                                updated = True
                            if not existing.from_email and from_email:
                                existing.from_email = from_email
                                updated = True
                            if not existing.to_email and to_email:
                                existing.to_email = to_email
                                updated = True
                            if updated:
                                session.add(existing)
                            continue

                        body_text = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() == "text/plain": 
                                    body_text = part.get_payload(decode=True).decode(errors='replace')
                                    break
                        else:
                            body_text = msg.get_payload(decode=True).decode(errors='replace')

                        final_content = body_text.strip() if body_text else "(Mensaje IMAP)"
                        
                        # Heurística aplicada
                        current_status = status_label
                        if current_status == "pending" and is_spam_heuristic(subject, final_content, from_email):
                            current_status = "spam"

                        counterpart_email = to_email if direction == "outgoing" else from_email
                        legacy_sender = f"admin_to_{counterpart_email}" if direction == "outgoing" and counterpart_email else (from_email or "system")
                        lead_type = "outbound" if direction == "outgoing" else "imap"

                        new_comm = LeadCommunication(
                            lead_id=0, lead_type=lead_type, sender=legacy_sender,
                            content=final_content, subject=subject, channel="email",
                            message_id=message_id,
                            thread_id=thread_id,
                            in_reply_to=in_reply_to,
                            references_header=references_header,
                            direction=direction,
                            folder=folder_value,
                            from_email=from_email or None,
                            to_email=to_email or None,
                            created_at=datetime.utcnow(),
                            status=current_status,
                        )
                        session.add(new_comm)
                        
                        # ── Detectar si es un correo interno del sistema ──────────────────
                        # Los emails generados por el propio sistema (notif de leads, pagos, etc.)
                        # NO deben crear una notificación de "Nuevo Correo" para no confundirlos
                        # con mensajes reales de clientes externos.
                        subject_lower = (subject or "").lower()
                        is_internal_system_email = any(keyword in subject_lower for keyword in [
                            "nuevo lead",          # legacy (por si hay emails viejos)
                            "nuevo contacto web",  # enviar_cotizacion.py (nombre nuevo)
                            "nueva solicitud",     # enviar_cotizacion.py 
                            "nuevo pago",          # proposals.py payment
                            "comprobante",         # proposals.py payment receipt
                            "nueva reserva",       # asesoria.py bookings
                            "nuevo suscriptor",    # subscribers.py
                            "propuesta comercial", # proposals.py send-email
                            "cotización rechazada",# proposals.py
                            "cotización aceptada", # proposals.py
                        ])

                        if current_status == "pending" and from_email not in admin_emails and not is_internal_system_email:
                            session.add(SystemNotification(
                                title="Nuevo Correo (Hostinger)",
                                message=f"De {from_email}: {(subject or 'Sin asunto')[:40]}...",
                                type="info", link="/admin/messages"
                            ))
                    except: continue
                session.commit()

        # RASTREO INTEGRAL (Para asegurar que no se pierda nada)
        # Sincronizamos Inbox
        sync_folder("INBOX", "pending", limit=50)
        
        # Sincronizamos Enviados
        for f in ["INBOX.Sent", "Sent", "Sent Items"]:
            sync_folder(f, "sent", limit=50)
            
        # Sincronizamos TODO lo que parezca Spam (agresivo)
        for f in ["INBOX.Junk", "Spam", "Junk", "INBOX.Spam", "Junk E-mail"]:
            sync_folder(f, "spam", limit=100)
            
        mail.logout()
    except Exception as e: print(f"[IMAP] Global Error: {e}")

_sync_running = False
def start_email_sync_worker(interval_seconds=60):
    global _sync_running
    if _sync_running: return
    _sync_running = True
    def run():
        while _sync_running:
            try: sync_emails()
            except: pass
            time.sleep(interval_seconds)
    threading.Thread(target=run, daemon=True).start()

def stop_email_sync_worker():
    global _sync_running
    _sync_running = False
