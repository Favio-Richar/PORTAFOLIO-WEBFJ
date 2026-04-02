import os, imaplib, dotenv
dotenv.load_dotenv(override=True)
try:
    mail = imaplib.IMAP4_SSL(os.getenv('IMAP_SERVER'))
    mail.login(os.getenv('IMAP_USER'), os.getenv('IMAP_PASS'))
    res, folders = mail.list()
    with open('all_folders.txt', 'w', encoding='utf-8') as f:
        for fold in folders:
            f.write(fold.decode() + '\n')
    print("DONE: all_folders.txt updated")
except Exception as e:
    print(f"ERROR: {e}")
