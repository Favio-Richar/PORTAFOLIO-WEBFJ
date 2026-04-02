import os, imaplib, dotenv, email
from email.header import decode_header
dotenv.load_dotenv(override=True)
def get_h(h):
    if not h: return ""
    decoded = decode_header(h)
    parts = []
    for content, charset in decoded:
        if isinstance(content, bytes):
            parts.append(content.decode(charset or 'utf-8', errors='replace'))
        else:
            parts.append(str(content))
    return "".join(parts)

try:
    mail = imaplib.IMAP4_SSL(os.getenv('IMAP_SERVER'))
    mail.login(os.getenv('IMAP_USER'), os.getenv('IMAP_PASS'))
    res, folders = mail.list()
    for f in folders:
        folder = f.decode().split(' "." ')[-1].strip('"')
        print(f"Checking {folder}...")
        try:
            mail.select(folder)
            res, data = mail.search(None, 'ALL')
            ids = data[0].split()[-10:]
            for i in ids:
                res, md = mail.fetch(i, '(RFC822)')
                msg = email.message_from_bytes(md[0][1])
                sub = get_h(msg.get("Subject"))
                print(f"  [{i.decode()}] {sub}")
        except Exception as e:
            print(f"  Error: {e}")
except Exception as e:
    print(f"ERROR: {e}")
