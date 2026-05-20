# Neon Poll API Setup

The gallery is already API-ready. It still works with browser-local voting on GitHub Pages, but it can persist votes to Neon once this serverless API is deployed.

## Why This Needs An API

Do not connect the browser directly to Neon. That would expose the database password.

The safe flow is:

Gallery page -> `/api/poll` -> Neon

## Files

- `api/poll.js`: serverless poll endpoint.
- `api/schema.sql`: table definition.
- `package.json`: dependency for `@neondatabase/serverless`.

## Environment Variables

Set these on the serverless host:

- `DATABASE_URL`: Neon pooled connection string.
- `ALLOWED_ORIGINS`: `https://teocuitlatl.com,http://teocuitlatl.com`

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

GitHub Pages cannot run serverless functions. The API files are included so the same repo can be deployed to a serverless host, or copied into a small API-only deploy.
