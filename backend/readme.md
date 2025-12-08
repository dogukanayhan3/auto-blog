# Auto-Blog Backend

Express-based API that stores generated articles in a lightweight JSON datastore and exposes endpoints for the React client as well as operators.

## Features
- REST endpoints to list articles, fetch by `id`/`slug`, and trigger manual generation.
- `node-cron` job that creates 1 new article per day (default 10:00 Europe/Istanbul).
- AI content generation via OpenAI `gpt-3.5-turbo` with slug sanitization + persistence.
- Seed script guarantees the database has at least 3 entries for reviewers.

## Requirements
- Node.js 20+
- npm 10+
- An OpenAI API key with enough quota.

## Environment Variables

Create `backend/.env` or set them in your process manager / Docker configuration.

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✅ | API key used by `aiClient.js`. |
| `PORT` | ❌ (default `5000`) | HTTP port exposed by Express. |
| `NODE_ENV` | ❌ | `development` or `production` for logging. |
| `CRON_SCHEDULE` | ❌ | Override cron expression (e.g. `*/2 * * * *` for QA). |

## Installation & Local Development

```bash
cd backend
npm install
npm run dev   # nodemon hot reload
```

The server listens on `http://localhost:5000` by default and writes data to `src/data/articles.json`.

## NPM Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Express in production mode. |
| `npm run dev` | Start with `nodemon`. |
| `npm run seed` | Generate initial articles (minimum of three). |

> Run `npm run seed` after provisioning EC2 or when `articles.json` is empty to satisfy the challenge requirement of ≥3 articles.

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe with uptime metadata. |
| `GET` | `/api/articles` | List all articles (sorted newest first). |
| `GET` | `/api/articles/:identifier` | Fetch by numeric `id` or slug. |
| `POST` | `/api/articles/generate` | Manual AI article generation. |

### Sample Requests

```bash
curl http://localhost:5000/api/articles
curl http://localhost:5000/api/articles/streamlining-software-development-with-continuous-integration-and-deployment
curl -X POST http://localhost:5000/api/articles/generate
```

## Cron & Scheduling

`src/services/articleJob.js` spins up a cron worker when the server boots. Default: `00 10 * * *` in `Europe/Istanbul`. Override with `CRON_SCHEDULE` for demos/tests. The cron + manual endpoint both call `aiClient.generateArticle()` so they share validation and logging.

## Docker Usage

```bash
docker build -t auto-blog-backend .
docker run -d --name auto-blog-backend \
  -p 3001:5000 \
  -e OPENAI_API_KEY=sk-... \
  -v articles-data:/app/src/data \
  auto-blog-backend
```

The official Docker image is built via AWS CodeBuild and pushed to ECR; see `buildspec.yml` for the pipeline definition.

## Troubleshooting

- **AI errors / quota** → check `docker logs auto-blog-backend` or console output for OpenAI response. The service retries in the next cron window.
- **No articles returned** → ensure `articles.json` exists (created automatically) or rerun `npm run seed`.
- **Different timezone needed** → set `CRON_SCHEDULE` plus update `Europe/Istanbul` in `articleJob.js` to your desired zone.

For a complete system diagram refer to `docs/ARCHITECTURE.md`.
