# Neon Poll API Setup

The gallery is API-ready. It still works with browser-local voting on GitHub Pages, and it will persist votes to Neon as soon as the serverless API is deployed with a Neon connection string.

## Why This Needs An API

Do not connect the browser directly to Neon. That would expose the database password.

The safe flow is:

Gallery page -> `/api/poll` -> Neon

## Files

- `api/poll.js`: serverless poll endpoint.
- `api/health.js`: quick health check endpoint.
- `api/schema.sql`: table definition.
- `package.json`: dependency for `@neondatabase/serverless`.
- `vercel.json`: Vercel runtime config for the API.

## Environment Variables

Set these on the serverless host:

- `DATABASE_URL`: Neon pooled connection string.
- `ALLOWED_ORIGINS`: `https://teocuitlatl.com,http://teocuitlatl.com`

Use `.env.example` as the template. Never commit the real `DATABASE_URL`.

## Endpoints

`GET /api/poll`

Returns current tally:

```json
{ "results": { "sun": 12, "cenote": 9 } }
```

`POST /api/poll`

Body:

```json
{ "picks": ["sun", "cenote", "patzcuaro"] }
```

## Frontend Config

If the API is deployed on the same host, no frontend config is needed.

If the API is deployed elsewhere, add this before `chatbot.js` / gallery scripts:

```html
<script>
  window.MEXICA_POLL_API_URL = "https://your-api-domain.example.com/api/poll";
</script>
```

## Current Status

GitHub Pages cannot run serverless functions. Deploy the API folder to Vercel, Netlify, or another serverless host, then point the gallery to that endpoint with `window.MEXICA_POLL_API_URL`.

Recommended first deployment:

1. Create a Neon project and copy the pooled `DATABASE_URL`.
2. Deploy this repo to Vercel.
3. Add `DATABASE_URL` and `ALLOWED_ORIGINS` in the Vercel project environment variables.
4. Test `https://your-vercel-app.vercel.app/api/health`.
5. Set the gallery API URL to `https://your-vercel-app.vercel.app/api/poll`.
