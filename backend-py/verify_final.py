import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def verify():
    print(f"Verifying data in: {DATABASE_URL.split('@')[-1]}")
    try:
        with engine.connect() as conn:
            # Count messages with HTML
            res = conn.execute(text("SELECT count(*) FROM lead_communication WHERE html_content IS NOT NULL"))
            count = res.scalar()
            print(f"\nTotal messages with HTML content: {count}")
            
            # List some subjects
            if count > 0:
                print("\nLast 5 subjects imported:")
                res = conn.execute(text("SELECT subject, created_at FROM lead_communication WHERE html_content IS NOT NULL ORDER BY created_at DESC LIMIT 5"))
                for r in res:
                    print(f"- {r[0]} ({r[1]})")
            else:
                print("\nWARNING: No messages with HTML content found.")
                
    except Exception as e:
        print(f"ERROR during verification: {e}")

if __name__ == "__main__":
    verify()
