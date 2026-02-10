# Next Level Software Pro - Backend API

Esta carpeta contiene el backend de alto rendimiento construido con **FastAPI**, optimizado para velocidad, escalabilidad y facilidad de desarrollo. Utiliza Docker para un entorno consistente y PostgreSQL como base de datos robusta.

**Estado Actual:** 🛠️ En desarrollo activo

## 🛠️ Stack Tecnológico

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
*   **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [SQLModel](https://sqlmodel.tiangolo.com/) (Pydantic + SQLAlchemy)
*   **Migraciones:** Alembic
*   **Contenedorización:** Docker & Docker Compose
*   **Admin DB:** pgAdmin 4

## 🚀 Inicio Rápido (Local)

Asegúrate de tener Docker instalado y ejecutándose.

1.  **Levantar servicios:**
    Desde esta carpeta (`backend-py`):
    ```bash
    docker compose up --build
    ```

2.  **Acceder a la documentación API:**
    Una vez iniciado, visita: [http://localhost:8000/docs](http://localhost:8000/docs)
    Aquí podrás probar todos los endpoints interactivamente (Swagger UI).

3.  **Gestión de Base de Datos (pgAdmin):**
    *   **URL:** [http://localhost:8080](http://localhost:8080)
    *   **Login:** `admin@local`
    *   **Password:** `admin`

    **Conexión al servidor (Add Server):**
    *   **Host:** `db`
    *   **Port:** `5432`
    *   **Maintenance DB:** `portafolio`
    *   **Username:** `postgres`
    *   **Password:** `postgres`

## 📦 Estructura del Proyecto

*   `app/`: Código fuente de la aplicación.
    *   `api/`: Endpoints organizados por módulo.
    *   `core/`: Configuraciones y utilidades.
    *   `models/`: Modelos de base de datos (SQLModel).
*   `alembic/`: Archivos de migración de base de datos.
*   `docker-compose.yml`: Orquestación de servicios.

## 🔄 Inicialización de DB

La base de datos se inicializa automáticamente al arrancar. Si necesitas reiniciar desde cero:
```bash
docker compose down -v
docker compose up --build
```

---
© 2024-2026 Next Level Software Pro
