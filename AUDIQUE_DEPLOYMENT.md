# AUDIQUE 2.0 – DEPLOYMENT GUIDE

## 1. Prerequisites
- **Docker & Docker Compose**: Docker 24+ with Compose V2.
- **Node.js**: 18+ (for local frontend development without Docker).
- **Java**: JDK 21+ and Maven 3.9+ (for local backend development without Docker).
- **Groq API Key**: Obtainable from [console.groq.com/keys](https://console.groq.com/keys).
- **Supabase Account**: Project URL, Anon Key, and JWT Secret from [app.supabase.com](https://app.supabase.com).

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

### Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `DB_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://postgres:5432/audique` |
| `DB_USERNAME` | Database username | `audique` |
| `DB_PASSWORD` | Database password | `audique` |
| `GROQ_API_KEY` | Groq Cloud API key | `gsk_...` |
| `GROQ_WHISPER_MODEL`| Model for STT transcription | `whisper-large-v3-turbo` |
| `GROQ_LLM_MODEL` | Model for summaries/notes/cards | `llama-3.1-8b-instant` |
| `SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anon/Public Key | `eyJ...` |
| `SUPABASE_JWT_SECRET`| JWT Secret for backend validation | Available in Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage/Admin operations | `eyJ...` |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket for audio | `audio-files` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `BACKEND_PORT` | Port exposed by Spring Boot | `8080` |

---

## 3. Docker Deployment

### 3.1 Local Development Mode (with Local PostgreSQL)
Runs frontend, Spring Boot backend, and a local PostgreSQL container:

```bash
# Build and run with the 'local' profile (starts postgres:16 container)
docker compose --profile local up --build -d

# Check running status
docker compose ps

# View unified logs
docker compose logs -f
```

### 3.2 Hosted Mode (with Supabase PostgreSQL)
When using hosted Supabase PostgreSQL, set `DB_URL` to your Supabase connection string and run without the local profile:

```bash
docker compose up --build -d
```

### 3.3 Container Rebuilds
```bash
# Rebuild only the Spring Boot backend
docker compose up --build -d backend

# Rebuild only the React frontend
docker compose up --build -d frontend

# Stop containers without losing database volume
docker compose down
```

---

## 4. Local Development (Without Docker)

### 4.1 Backend (Spring Boot)
```bash
cd backend-spring

# Ensure PostgreSQL is running locally on port 5432
mvn clean spring-boot:run
```
The backend starts on `http://localhost:8080`.
- Health check: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4.2 Frontend (React)
```bash
cd frontend
npm install
npm start
```
The React development server runs on `http://localhost:3000` and automatically proxies `/api`, `/transcribe`, `/summarize`, and `/download-pdf` requests to `http://localhost:8080`.

---

## 5. Troubleshooting

### Database Connection Refused
- Check that PostgreSQL is healthy:
  ```bash
  docker compose ps postgres
  ```
- Verify credentials match between `application.yml` and `.env`.

### Audio Upload Exceeds Limit
- Upload limit is set to 100MB in both Spring Boot (`spring.servlet.multipart.max-file-size`) and Nginx (`client_max_body_size 100M`).

### JWT Authorization Fails (401 / 403)
- Verify `SUPABASE_JWT_SECRET` in `.env` matches the Supabase project JWT secret (Settings -> API -> JWT Settings).

