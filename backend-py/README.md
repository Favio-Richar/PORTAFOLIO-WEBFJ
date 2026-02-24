# Next Level Software Pro - Backend API

Backend en FastAPI + SQLModel para el portafolio y panel admin.

## Stack
- FastAPI (Python 3.10+)
- SQLModel / SQLAlchemy
- PostgreSQL
- Docker / Docker Compose

## Inicio rapido

Desde `backend-py`:

```bash
docker compose up --build
```

Docs:
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Reviews OAuth (Google)

### Variables de entorno

`backend-py/.env`:

```env
GOOGLE_CLIENT_ID=tu_client_id_de_google.apps.googleusercontent.com
REVIEW_MODERATION_ENABLED=false
```

`frontend-ui/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id_de_google.apps.googleusercontent.com
```

### Migracion de tablas (si ya existe DB)

```bash
cd backend-py
python migrate_reviews_oauth.py
```

### Endpoints

- `GET /api/reviews?page=1&page_size=40`
- `POST /api/reviews`
- `POST /api/reviews/approve` (opcional, moderacion)

`POST /api/reviews` recibe:

```json
{
  "rating": 5,
  "comment": "Comentario minimo de 20 caracteres...",
  "authMode": "google",
  "googleIdToken": "..."
}
```

o modo guest:

```json
{
  "rating": 5,
  "comment": "Comentario minimo de 20 caracteres...",
  "authMode": "guest",
  "display_name": "Nombre Cliente",
  "email": "cliente@empresa.com",
  "company": "Empresa SAC"
}
```

## Pruebas recomendadas

1. Flujo Google:
- Completa formulario en `/clientes`.
- Click `Publicar reseña`.
- Modal -> `Validar con Google`.
- Debe guardarse usuario + review verificada con `avatar_url` real.

2. Flujo guest:
- Modal -> `Publicar sin foto`.
- Debe guardarse review no verificada y mostrarse con iniciales/avatar default.

3. Errores:
- Rating fuera de 1..5 -> 400
- Comentario < 20 -> 400
- Token Google invalido -> 400

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portafolio-web

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dw4s3yo41
CLOUDINARY_API_KEY=367165625545128
CLOUDINARY_API_SECRET=IK0oz9MkNHU0d6B6OQuE8yF6d9w

# Email Configuration (Resend)
RESEND_API_KEY=re_GENnYsZ6_HV3YWxpmnW6cmv5n2Dr4YMM4
EMAIL_RECEIVER=favio4515@gmail.com
EMAIL_FROM=onboarding@resend.dev

# Google OAuth Configuration
GOOGLE_CLIENT_ID=686141217518-3ogat5mr2gassq258va2g50o65r26638.apps.googleusercontent.com