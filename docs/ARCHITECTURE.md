# Auto-Blog Architecture

## 1. High-Level Overview

```
┌──────────────┐       HTTPS        ┌──────────────┐
│  React SPA   │◀──────────────────▶│  Nginx (80)  │
│  (frontend)  │                    └──────┬───────┘
└──────┬───────┘                           │
       │                           Static assets + proxy /api → backend
       │
┌──────▼───────┐    REST/JSON     ┌─────────────────────┐
│  Express API │◀────────────────▶│  Article Scheduler  │
│ (backend:5000)                  │ (node-cron + OpenAI)│
└──────┬───────┘                  └─────────┬───────────┘
       │                                    │
       │ Local JSON persistence (Docker volume)
       │
┌──────▼────────┐
│ articles.json │
└───────────────┘
```

- **Frontend** builds with React 19 and is served by Nginx inside its container.
- **Backend** is an Express API that reads/writes a JSON datastore and exposes article endpoints.
- **Scheduler** (node-cron) lives in the backend container, creates one article per day via OpenAI.
- **Persistence** relies on a Docker named volume (`articles-data`) so articles survive redeploys.
- **Infrastructure**: Docker on EC2, CI via AWS CodeBuild, container registry in ECR.

## 2. Component Responsibilities

| Layer | Responsibilities | Key Files |
| --- | --- | --- |
| Frontend (`frontend/`) | Display article list/detail, call backend via `/api`, ship static bundle via nginx | `src/pages/*`, `src/api/client.js`, `Dockerfile`, `nginx.conf` |
| Backend (`backend/`) | REST API, article CRUD against JSON store, scheduled AI generation | `src/index.js`, `src/routes/articles.js`, `src/services/*`, `Dockerfile` |
| Data | Lightweight JSON persistence mounted at `/app/src/data` | `src/data/articles.json`, Docker volume `articles-data` |
| AI Integration | OpenAI `gpt-3.5-turbo` via `src/services/aiClient.js` | `.env` (`OPENAI_API_KEY`) |
| Automation | Daily cron (`articleJob.startDailyJob`) + manual `POST /api/articles/generate` | `src/services/articleJob.js`, `src/scripts/seed.js` |
| Infra | Local compose setup, EC2 bootstrap, CodeBuild pipeline → ECR | `docker-compose.yml`, `infra/scripts/*.sh`, `buildspec.yml` |

> **Why JSON?** The challenge allows JSON/SQLite/Postgres. JSON keeps infra lightweight on a single EC2 host. The backend abstracts persistence, so migrating to Postgres later only touches `models/db.js`.

## 3. Runtime Flows

### 3.1 Read Flow
1. User hits `http://<EC2_IP>/`.
2. Nginx serves the React build and proxies `/api/*` to the backend container.
3. Frontend calls `GET /api/articles`. Backend streams from `articles.json`, sorts by `createdAt`, returns payload.
4. On detail view, frontend requests `GET /api/articles/:slug` for full content.

### 3.2 Generation Flow
1. `node-cron` in `articleJob.startDailyJob()` schedules `CRON_SCHEDULE` (default `00 10 * * *` Istanbul time).
2. Job calls `aiClient.generateArticle()` -> OpenAI Chat Completions.
3. Article is normalized (slug creation, timestamps) and persisted via `db.createArticle`.
4. `articles.json` is stored on the mounted Docker volume so redeploys keep history.
5. Manual generation uses `POST /api/articles/generate` hitting the same workflow.

### 3.3 Seeding Flow
`npm run seed` (backend) runs `src/scripts/seed.js`: ensures ≥3 starter posts by calling the AI client up to three times with short delays. This script is useful immediately after provisioning EC2.

## 4. Container & Network Topology

| Container | Ports | Env | Volumes | Notes |
| --- | --- | --- | --- | --- |
| `auto-blog-backend` | `3001->5000` (local) / `5000` (EC2) | `PORT`, `NODE_ENV`, `OPENAI_API_KEY`, `CRON_SCHEDULE` | `articles-data:/app/src/data` | Hosts Express API + cron job |
| `auto-blog-frontend` | `80->80` | `NODE_ENV=production` (implicit) | — | Nginx serves React bundle, proxies `/api` |

Both containers join the `auto-blog` bridge network in `docker-compose.yml`. On EC2 the same naming is kept, so internal DNS `blog-backend` allows nginx to forward `/api`.

## 5. Deployment Pipeline

1. **Developer** pushes to GitHub main branch.
2. **AWS CodeBuild** (configured with `buildspec.yml`):
   - Logs into ECR.
   - Builds both Docker images (`frontend`, `backend`), tagging `latest` + short SHA.
   - Pushes images to respective repos.
3. **EC2 host** (single t2.micro) pulls the latest images via `infra/scripts/deploy.sh`:
   - Authenticates to ECR.
   - Stops existing containers, keeps `blog-data` volume.
   - Runs backend + frontend with restart policies.
4. **init-ec2.sh** bootstraps Docker, Docker Compose, AWS CLI on a fresh Ubuntu host.

The flow purposely avoids ECS per challenge requirements.

## 6. Configuration Matrix

| Variable | Purpose | Location |
| --- | --- | --- |
| `OPENAI_API_KEY` | Auth token for article generation | Backend container env / EC2 host |
| `PORT` | Backend listen port (default `5000`) | Backend env |
| `CRON_SCHEDULE` | Override cron frequency (e.g. `*/2 * * * *` for QA) | Backend env |
| `REACT_APP_API_URL` | Frontend dev proxy to backend | `frontend/.env` (dev only) |
| `AWS_ACCOUNT_ID`, `AWS_REGION` | ECR targets for deployment script and buildspec | `infra/scripts/deploy.sh`, `buildspec.yml` |

## 7. Observability & Recovery

- **Health checks**: Backend exposes `/health`, Docker healthcheck in both images ensures ECS-style restart even on plain Docker.
- **Logs**: `docker logs blog-backend` (cron + API), `docker logs blog-frontend` (nginx access).
- **Data backup**: `docker run --rm -v blog-data:/data alpine tar czf - /data > articles.tar.gz`.
- **Failure modes**:
  - AI quota exceeded → cron logs error, job retries next day. Manual trigger recommended after regaining quota.
  - Disk full → Docker fails to write JSON. Monitor `df -h`, expand storage or offload to S3/Postgres.

This document should answer “what runs where, how data flows, and how to operate it” for reviewers and for the final submission video.
