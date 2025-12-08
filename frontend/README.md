# Auto-Blog Frontend

React 19 single-page application that renders the article list and details while consuming the backend REST API.

## Highlights
- Modern React with functional components, React Router, and CSS modules.
- Centralized API client (`src/api/client.js`) that adapts to dev vs. production base URLs.
- Skeleton loaders + error states on the home page for polished UX.
- Dockerized build served by Nginx with a lightweight reverse proxy for `/api`.

## Project Structure

```
frontend/
├── src/
│   ├── api/client.js        # Axios instance & article helpers
│   ├── components/          # Header, ArticleCard, Loading states
│   ├── pages/               # HomePage (list) & ArticlePage (detail)
│   ├── App.js               # Router
│   └── index.js             # Entry point
├── Dockerfile               # Multi-stage build (Node → Nginx)
└── nginx.conf               # Proxies /api to backend container
```

## Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://localhost:3001/api` | Only used in development. In production we rely on nginx proxying `/api` to the backend network alias. |

Create `frontend/.env` when running locally if your backend is not on `localhost:3001`.

## Local Development

```bash
cd frontend
npm install
npm start       # Runs CRA dev server on port 3000
```

Ensure the backend is running (`PORT=3001` or adjust `REACT_APP_API_URL` accordingly). The CRA dev server proxies API calls using the value configured above.

## Production Build

```bash
npm run build
```

Artifacts land in `build/` and are copied into the nginx image during `docker build`. To preview locally:

```bash
npm install -g serve
serve -s build
```

## Docker

```bash
docker build -t auto-blog-frontend .
docker run -d --name auto-blog-frontend -p 8080:80 auto-blog-frontend
```

When run alongside the backend via `docker-compose up`, nginx forwards `/api` requests to `auto-blog-backend`. On standalone runs you must set `REACT_APP_API_URL` to a reachable backend URL before building.

## Testing

CRA test harness is available:

```bash
npm test
```

## Troubleshooting

- **Articles not loading** → Inspect browser console for `API Error`. Verify backend URL and network connectivity.
- **CORS issues** → Do not call the backend directly from dev mode; rely on the proxy or align `REACT_APP_API_URL` with the backend origin.
- **Stale assets after deploy** → Nginx caches aggressively. Restart the container (`docker restart blog-frontend`) or bump the image tag.

Refer to the root `README.md` for end-to-end deployment steps and AWS integration.
