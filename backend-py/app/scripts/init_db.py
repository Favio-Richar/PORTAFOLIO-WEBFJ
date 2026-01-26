import os
import subprocess
from sqlmodel import SQLModel, create_engine
from app.models import *  # ensure models are imported so metadata is populated


def main():
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/portafolio-web")
    engine = create_engine(database_url)

    print("Creating tables via SQLModel.metadata.create_all...")
    SQLModel.metadata.create_all(engine)
    print("Tables created (if not existing).")

    # Optionally run Alembic migrations if requested
    run_migrations = os.getenv("RUN_MIGRATIONS", "0")
    if run_migrations in ("1", "true", "True"):
        print("Running Alembic migrations: alembic upgrade head")
        # Use subprocess to call alembic in the container environment
        try:
            subprocess.check_call(["alembic", "upgrade", "head"])
            print("Alembic migrations applied.")
        except Exception as e:
            print("Alembic upgrade failed:", e)


if __name__ == "__main__":
    main()
