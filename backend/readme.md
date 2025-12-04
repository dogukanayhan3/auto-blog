# Auto-Blog Backend

Node.js backend with Express, JSON file storage, and AI-powered article generation.

## Setup
```bash
npm install
```

## Environment Variables

Create a `.env` file:
```
PORT=5000
NODE_ENV=development
HUGGINGFACE_API_KEY=your_key_here
```

## Running
```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Seed initial articles
npm run seed
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID or slug
- `POST /api/articles/generate` - Manually trigger article generation