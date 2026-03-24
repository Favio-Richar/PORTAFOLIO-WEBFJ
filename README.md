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
    ``uvicorn app.main:app --reload`

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
npm install html2canvas jspdf framer-motion
---
**Desarrollado por:** Favio Jiménez
**Licencia:** Propietaria
git add .
git commit -m "mensaje claro del cambio"
git push origin main

## Checklist Produccion (sin errores)

Usa esta lista exacta antes de desplegar.

### 1) Backend: variables obligatorias en `backend-py/.env`

No dejes URLs `localhost` en produccion.

```env
FRONTEND_URL=https://tu-dominio.com
FRONTEND_PUBLIC_URL=https://tu-dominio.com
BACKEND_PUBLIC_URL=https://api.tu-dominio.com
API_PUBLIC_URL=https://api.tu-dominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tu-dominio.com

SECURITY_STRICT_MODE=true
ADMIN_REQUIRE_AUTH=true
CORS_ALLOW_ALL=false
SECRET_KEY=<clave-larga-segura>

DATABASE_URL=postgresql://usuario:password@host:5432/db_produccion

RESEND_API_KEY=<tu_api_key_resend>
EMAIL_FROM=notificaciones@tu-dominio.com
RESEND_WEBHOOK_SECRET=<tu_webhook_secret>

CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
```

### 2) Frontend: variables obligatorias en produccion

Configura en el hosting del frontend:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.tu-dominio.com
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

### 3) DNS y correo (Resend)

- Verifica dominio en Resend.
- Configura SPF, DKIM y DMARC.
- Usa `EMAIL_FROM` del dominio verificado.

### 4) Base de datos

- Ejecuta migraciones antes de levantar trafico.
- Valida conexion real de `DATABASE_URL`.

### 5) Validacion rapida post-deploy

- `GET /health` responde `200`.
- Panel admin abre y autentica.
- Subida/listado Cloudinary funciona.
- Suscripcion publica guarda en base de datos.
- Envio de campana (test) llega por Resend.

### 6) Regla importante

- En desarrollo: `localhost`.
- En produccion: dominios reales.
- No reemplaces credenciales validas por placeholders.
