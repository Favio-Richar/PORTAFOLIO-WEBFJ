from sqlmodel import Session, create_engine, select
import os
from app.models import LeadCommunication, Quote, AdvisoryBooking, DirectInquiry
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portfolio.db")
engine = create_engine(DATABASE_URL)

def audit():
    with Session(engine) as session:
        comms = session.exec(select(LeadCommunication)).all()
        quotes = session.exec(select(Quote)).all()
        bookings = session.exec(select(AdvisoryBooking)).all()
        directs = session.exec(select(DirectInquiry)).all()
        
        print(f"--- DATABASE AUDIT ---")
        print(f"Total Communications: {len(comms)}")
        print(f"Total Quotes: {len(quotes)}")
        print(f"Total Bookings: {len(bookings)}")
        print(f"Total Directs: {len(directs)}")
        
        print("\n--- SAMPLE COMMUNICATIONS (LAST 5) ---")
        for c in comms[-5:]:
            print(f"ID: {c.id} | Chan: {c.channel} | Sender: {c.sender} | Subj: {c.subject} | Status: {c.status}")

        noise_keywords = ["confirmación de gmail", "hostinger", "verifica tu dirección", "gmail-noreply"]
        print("\n--- NOISE FILTER ANALYSIS ---")
        for c in comms:
            subj = str(c.subject or "").lower()
            sender = str(c.sender or "").lower()
            is_noise = any(k in subj for k in noise_keywords) or any(k in sender for k in noise_keywords)
            if is_noise:
                print(f"ID {c.id} was filtered as NOISE (Subject: {c.subject})")

if __name__ == "__main__":
    audit()
