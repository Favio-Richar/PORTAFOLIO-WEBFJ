# Next Level Software Pro (Elite System)

Bienvenido al repositorio central de **Next Level Software Pro**. Este es un sistema de portafolio y gestión profesional de alto nivel, diseñado con una arquitectura moderna separada en Frontend y Backend.

## 📂 Módulos del Proyecto

### 1. [Frontend UI (Elite Edition)](./frontend-ui/README.md)
Interfaz de usuario construida con **Next.js 15**, **React 19** y **Tailwind CSS**.
*   **Diseño:** Midnight Elite (Glassmorphism + 3D).
*   **Características:** Home Page interactiva, Chat IA flotante, Panel de Administración.
*   **Estado:** v2.0 (72% Completado).

### 2. [Backend API](./backend-py/README.md)
API RESTful construida con **FastAPI** y **PostgreSQL**.
*   **Características:** Autenticación robusta, Gestión de proyectos, Base de datos optimizada.
*   **Infraestructura:** Docker & Docker Compose.

## 🚀 Inicio Rápido (Full Stack)

Para levantar todo el sistema (Frontend + Backend + DB) usando Docker (recomendado):

1.  **Clonar repositorio (si aplica):**
    ```bash
    git clone <repo-url>
    cd PORTAFOLIO-WEBFJ
    ```

2.  **Iniciar Backend (Base de Datos y API):**
    ```bash
    cd backend-py
    docker compose up --build -d
    ```

3.  **Iniciar Frontend (Desarrollo):**
    ```bash
    cd ../frontend-ui
    npm install
    npm run dev
    ```

Visita:
*   **Web:** [http://localhost:3000](http://localhost:3000)
*   **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **Admin DB:** [http://localhost:8080](http://localhost:8080)

---
**Desarrollado por:** Favio Jiménez
**Licencia:** Propietaria
