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

