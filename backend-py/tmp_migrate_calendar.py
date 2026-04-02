import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/portafolio-web")
engine = create_engine(DATABASE_URL)

def migrate():
    print(f"Connecting to {DATABASE_URL}...")
    with engine.connect() as conn:
        print("Creating table 'calendar_event'...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS calendar_event (
                    id SERIAL PRIMARY KEY,
                    date VARCHAR NOT NULL,
                    title VARCHAR NOT NULL,
                    description VARCHAR,
                    type VARCHAR DEFAULT 'work',
                    time VARCHAR,
                    completed BOOLEAN DEFAULT FALSE,
                    is_auto_generated BOOLEAN DEFAULT FALSE,
                    related_booking_code VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_calendar_event_date ON calendar_event (date);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_calendar_event_type ON calendar_event (type);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_calendar_event_completed ON calendar_event (completed);"))
            conn.commit()
            print("✅ Table 'calendar_event' created successfully.")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate()
