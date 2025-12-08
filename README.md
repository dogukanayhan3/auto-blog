# Auto-Blog – AI Generated Blog Platform

Auto-Blog is a full-stack challenge solution that automatically generates, stores, and serves technology articles. It uses a React.js, a Node.js/Express backend with scheduled OpenAI calls, Dockerized workloads, and an AWS pipeline (CodeBuild → ECR → EC2).

## Key Capabilities
- 📰 **Daily content generation** – `node-cron` triggers OpenAI (gpt-3.5-turbo) once per day.
- ⚙️ **API-first backend** – REST endpoints for listing, retrieving, and manually generating articles.
- 🎨 **Responsive React UI** – List/detail views with skeleton loaders, powered by Axios client abstraction.
- 🐳 **Containerized everywhere** – Individual Dockerfiles, docker-compose for local parity, and ECR-hosted images.
- ☁️ **AWS-ready pipeline** – CodeBuild builds/pushes images, EC2 host pulls via `infra/scripts/deploy.sh`.

## Architecture Snapshot

```
User ─▶ Nginx (frontend container :80) ─▶ Express API (backend container :5000) ─▶ JSON datastore (Docker volume)
                                        └─▶ node-cron + OpenAI (daily generation)
Git push ─▶ AWS CodeBuild ─▶ Amazon ECR ─▶ EC2 pull & run (deploy.sh)
```

See `docs/ARCHITECTURE.md` for a deeper breakdown of flows, config matrix, and future improvements.

## Repository Layout

```
.
├── backend/                # Express API, cron job, data access
├── frontend/               # React + nginx config
├── infra/
│   └── scripts/            # EC2 bootstrap + deployment helpers
├── docs/                   # Architecture reference
├── docker-compose.yml      # Local multi-container dev
├── buildspec.yml           # AWS CodeBuild definition
└── README.md               # You are here
```

## 1. Prerequisites

- Node.js 20+, npm 10+
- Docker & Docker Compose
- AWS account with permissions for ECR, CodeBuild, EC2
- OpenAI API key

## 2. Environment Configuration

Create a root `.env` (used by Docker Compose) and component-specific files as needed.

```bash
# ./.env
OPENAI_API_KEY=sk-xxxx
CRON_SCHEDULE=00 10 * * *   # optional override (gets triggered at 10:00 AM everyday in Europe/Istanbul time as default)
```

Optional frontend override for local dev (`frontend/.env`):

```
REACT_APP_API_URL=http://localhost:3001/api
```

Backend accepts `PORT` (default 5000) and `NODE_ENV`.

## 3. Local Development

### Option A – Docker Compose (closest to prod)

```bash
docker-compose up --build
```

- Frontend: http://localhost (port 80)
- Backend API/health: http://localhost:3001 / http://localhost:3001/health
- Data persists inside the named volume `articles-data`.

### Option B – Run services manually

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm start
```

Set `REACT_APP_API_URL` if the backend runs on a non-default port.

### Seeding Initial Articles

```bash
cd backend
npm run seed   # guarantees at least 3 articles
```

This script is safe to rerun; it checks existing count before generating.

## 4. API Quick Reference

```bash
# List articles
curl http://localhost:3001/api/articles

# Get article by slug or id
curl http://localhost:3001/api/articles/streamlining-software-development-with-continuous-integration-and-deployment

# Manual generation
curl -X POST http://localhost:3001/api/articles/generate

# Health check
curl http://localhost:3001/health
```

Responses follow `{ success, data, ... }` envelopes; see `backend/src/routes/articles.js`.

## 5. AWS Deployment Workflow

### 5.1 Prepare AWS Resources
1. **ECR repositories**
   ```bash
   aws ecr create-repository --repository-name auto-blog-frontend
   aws ecr create-repository --repository-name auto-blog-backend
   ```
2. **EC2 host**
   - Ubuntu 22.04 LTS, t2.micro (free tier), 30GB gp3.
   - Security group: allow 22 (SSH), 80 (HTTP), 5000 (API), 443 if you plan to add TLS.

### 5.2 Bootstrap EC2

```bash
scp -i <key>.pem infra/scripts/init-ec2.sh ubuntu@<EC2_IP>:~
ssh -i <key>.pem ubuntu@<EC2_IP>
bash init-ec2.sh
aws configure   # set same credentials used by CodeBuild
```

### 5.3 Continuous Delivery via CodeBuild
1. Create a CodeBuild project pointing to this GitHub repo.
2. Enable privileged mode and use `buildspec.yml`.
3. Set environment variables `AWS_ACCOUNT_ID`, `AWS_REGION` (or inject via Parameter Store).
4. Attach `AmazonEC2ContainerRegistryPowerUser` to the CodeBuild service role.
5. On each push, CodeBuild builds/pushes both images tagged `latest` + short SHA.

### 5.4 Deploy to EC2

```bash
scp -i <key>.pem -r infra/scripts ubuntu@<EC2_IP>:~/auto-blog/infra/scripts
ssh -i <key>.pem ubuntu@<EC2_IP>
export OPENAI_API_KEY=sk-...        # or store in ~/.bashrc
bash ~/auto-blog/infra/scripts/deploy.sh
```

- Script logs in to ECR, pulls latest tags, recreates containers, and keeps the `blog-data` volume with historical posts.
- Verify with `curl http://localhost:5000/health` (from EC2) or hit the public IP in a browser.

## 6. Observability & Operations

- `docker logs blog-backend` → cron execution, AI responses, errors.
- `docker logs blog-frontend` → nginx access logs.
- Backend container exposes `/health` for uptime checks; Docker health checks restart unhealthy containers automatically.
- Data backup: `docker run --rm -v blog-data:/data alpine tar czf - /data > articles-backup.tgz`.

## 7. Troubleshooting

| Issue | Fix |
| --- | --- |
| Articles stuck at 0 | Run `npm run seed` or `POST /api/articles/generate`. Confirm OpenAI key. |
| Cron not firing | Confirm timezone/CRON env and backend logs. Ensure container clock/timezone is correct. |
| Frontend can’t reach API | When not using nginx proxy, set `REACT_APP_API_URL` to full backend origin before building. |
| CodeBuild fails on docker | Ensure “Privileged mode” is enabled and service role has ECR permissions. |

## 8. References
- `backend/README.md` – API details, cron behaviour, Docker usage.
- `frontend/README.md` – UI structure, local dev hints.
- `docs/ARCHITECTURE.md` – Deep dive architecture & future enhancements.
- `infra/scripts/init-ec2.sh` / `infra/scripts/deploy.sh` – operational scripts.
