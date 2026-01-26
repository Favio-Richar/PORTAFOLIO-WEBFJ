FastAPI backend scaffold for PORTAFOLIO-WEBFJ

This folder contains a production-ready FastAPI scaffold with Docker and Docker Compose
including Postgres and pgAdmin. It provides a starting point for the Python backend and
OpenAPI (auto-generated) for the frontend.

Run locally (from this folder):
```bash
cd backend-py
docker compose up --build

After the services start:

- FastAPI docs: http://localhost:8000/docs
- pgAdmin: http://localhost:8080  (login: admin@local / admin)

To register the Postgres server in pgAdmin use these connection details:
- Host: `db`
- Port: `5432`
- Maintenance DB: `portafolio`
- Username: `postgres`
- Password: `postgres`
Note: your Postgres database for this project is named `portafolio-web` (adjust connection settings if you use a different DB).

Notes:
- This scaffold uses `SQLModel` + `Alembic` placeholders. Before production, create proper Alembic migrations and configure connection pooling.
- If you want I can convert your existing `backend/prisma/schema.prisma` to `SQLModel` models and add Alembic migrations.

Automatic DB initialization
---------------------------

You can create the database tables automatically in two ways:

1) Quick (dev): the API runs `SQLModel.metadata.create_all(...)` on startup, so simply:

```powershell
cd backend-py
docker compose up --build
```

2) Explicit script (idempotent): run the init script which creates tables and can optionally run Alembic migrations.

```powershell
cd backend-py
docker compose run --rm api python -m app.scripts.init_db
# to also run alembic migrations (set env var RUN_MIGRATIONS=1):
docker compose run --rm -e RUN_MIGRATIONS=1 api python -m app.scripts.init_db
```

The `init_db.py` script is idempotent: it will create missing tables and will call `alembic upgrade head` when `RUN_MIGRATIONS=1`.
FastAPI backend scaffold for PORTAFOLIO-WEBFJ

This folder contains a production-ready FastAPI scaffold with Docker and Docker Compose
including Postgres and pgAdmin. It provides a starting point for the Python backend and
OpenAPI (auto-generated) for the frontend.

Run locally (from this folder):

```bash
cd backend-py
docker compose up --build
```

After the services start:

- FastAPI docs: http://localhost:8000/docs
- pgAdmin: http://localhost:8080  (login: admin@local / admin)

To register the Postgres server in pgAdmin use these connection details:

- Host: `db`
- Port: `5432`
- Maintenance DB: `portafolio`
- Username: `postgres`
- Password: `postgres`

Notes:
- This scaffold uses `SQLModel` + `Alembic` placeholders. Before production, create proper Alembic migrations and configure connection pooling.
- If you want I can convert your existing `backend/prisma/schema.prisma` to `SQLModel` models and add Alembic migrations.
