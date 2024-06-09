# Deployment Notes

Use the root-level `docker-compose.yml` for local or server-based review. The app has three runtime pieces: MySQL, Spring Boot backend, and Nginx-served frontend.

## Required Environment

Create `.env` at the repository root:

```bash
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=rag_chat
MYSQL_USER=rag_user
MYSQL_PASSWORD=
APP_SECURITY_JWT_SECRET=
OPENAI_API_KEY=
```

Do not commit `.env`.

## Build and Run

```bash
cd frontend
npm ci
npm run build

cd ..
docker compose up -d --build
```

Check services:

```bash
docker compose ps
curl http://localhost:8080/api/health
```

Open the frontend at:

```text
http://localhost:8081
```

## Data and Persistence

- MySQL stores users, document metadata, chat sessions, and messages.
- Uploaded files are stored in the configured upload directory.
- The embedding store is in memory and is rebuilt from uploaded documents on backend startup.

## Production Caveats

This deployment setup is intended for course review and local demonstration. A production version should add HTTPS, persistent vector storage, stronger secret management, document-level access control, backup policy, and monitoring.
