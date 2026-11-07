# MAIL AI Developer — Cloudflare Worker

Worker is **not deployed** by adding these files to GitHub.

Deploy using Cloudflare dashboard (create Worker named mail-ai-developer-api and paste src/index.js), or use Wrangler from the worker directory:
`npx wrangler deploy`

In Worker > Settings > Variables and Secrets add two encrypted **secrets**:
- `NVIDIA_API_KEY`: NVIDIA NIM key, never put in APK or GitHub
- `MAIL_ACCESS_TOKEN`: a separate, long, random secret string used by the Android app

The Android app requires:
- Server HTTPS: `https://<your-worker-subdomain>.workers.dev`
- Code access: the `MAIL_ACCESS_TOKEN` secret (not the NVIDIA key)
- Model: NVIDIA Nemotron

Test GET `/health` should return `{"status":"online","configured":true}`.
The service may incur NVIDIA usage costs and is subject to Cloudflare quotas. Do not share the access token or expose the service as a public free-for-all. CORS is not a replacement for authentication.
