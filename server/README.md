# MAIL AI backend

Node.js 20+. Start: `npm start` from `server/`.

Environment secrets:
- `NVIDIA_API_KEY`: NVIDIA NIM API key (never put in APK)
- `MAIL_ACCESS_TOKEN`: long random access token (enter in app; never commit)
- `NVIDIA_MODEL`: provider model ID, default `nvidia/nemotron-3-ultra-550b-a55b`
- `ALLOWED_ORIGIN`: `https://appassets.androidplatform.net`
- `PORT`: assigned by hosting platform

HTTPS must be provided by hosting reverse proxy. POST /chat with Authorization: Bearer token. GET /health does not disclose secrets.

Warning: this endpoint can incur provider costs. Rate limits, quota, and per-user accounts should be added before sharing the app with others.
