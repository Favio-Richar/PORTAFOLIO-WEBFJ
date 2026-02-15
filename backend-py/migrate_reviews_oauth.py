"""
Migracion para sistema de resenas con OAuth Google.

Uso:
  python migrate_reviews_oauth.py
"""

from sqlalchemy import text
from sqlmodel import SQLModel

from app.db import engine
from app.models import Review, User


def _run_statement(conn, sql: str):
    try:
        conn.execute(text(sql))
        print(f"[OK] {sql}")
    except Exception as exc:
        print(f"[WARN] {sql} -> {exc}")


def run():
    # Asegura tablas base
    SQLModel.metadata.create_all(engine, tables=[User.__table__, Review.__table__])

    with engine.begin() as conn:
        # user (oauth profile)
        _run_statement(conn, 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS name VARCHAR')
        _run_statement(conn, 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS provider VARCHAR DEFAULT \'local\'')
        _run_statement(conn, 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS provider_id VARCHAR')
        _run_statement(conn, 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS avatar_url VARCHAR')
        _run_statement(conn, 'CREATE UNIQUE INDEX IF NOT EXISTS ix_user_provider_id ON "user" (provider_id)')

        # review (flujo verificado/no verificado)
        _run_statement(conn, "ALTER TABLE review ADD COLUMN IF NOT EXISTS user_id INTEGER")
        _run_statement(conn, "ALTER TABLE review ADD COLUMN IF NOT EXISTS display_name VARCHAR")
        _run_statement(conn, "ALTER TABLE review ADD COLUMN IF NOT EXISTS reviewer_email VARCHAR")
        _run_statement(conn, "ALTER TABLE review ADD COLUMN IF NOT EXISTS comment TEXT")
        _run_statement(conn, "ALTER TABLE review ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE")
        _run_statement(conn, "CREATE INDEX IF NOT EXISTS ix_review_user_id ON review (user_id)")

        # Backfill de columnas nuevas desde datos previos
        _run_statement(conn, "UPDATE review SET display_name = author_name WHERE display_name IS NULL")
        _run_statement(conn, "UPDATE review SET comment = content WHERE comment IS NULL")
        _run_statement(conn, "UPDATE review SET reviewer_email = author_role WHERE reviewer_email IS NULL")
        _run_statement(conn, "UPDATE review SET is_verified = FALSE WHERE is_verified IS NULL")

    print("[DONE] Migracion de resenas OAuth completada.")


if __name__ == "__main__":
    run()
