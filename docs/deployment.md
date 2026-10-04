# Deployment

## Supported topology

The requested architecture requires Node.js processes and PostgreSQL. A Cloudflare Worker-only deployment cannot run the NestJS application unchanged. Keep this monorepo on a Node-capable host (container VM or managed Node service), serve the Vite build through a static web server, and use Cloudflare R2 or S3 for media. No cloud account, domain or production database has been provisioned by this local build.

Suggested hosts: `www.your-domain` for Next, `admin.your-domain` for Vite, `api.your-domain` for Nest, `media.your-domain` for a read-only bucket domain. Keep admin and API on the same registrable domain with HTTPS so SameSite=Lax cookies work. Do not mix localhost/127.0.0.1 during development.

## Environment

Copy `.env.example` to the deployment secret manager. Set unique database/storage credentials, a random JWT secret >=48 characters, HTTPS origins, `COOKIE_SECURE=true`, `NODE_ENV=production`, `API_HOST=0.0.0.0` inside a container, and `API_PORT=4100`. `NEXT_PUBLIC_*` and `VITE_*` variables are embedded in frontend builds; they must contain public URLs only. Set VITE_WEB_URL and VITE_API_URL for admin. Set API_INTERNAL_URL to the reachable private API endpoint for Next server rendering. A private internal network URL must never be assigned to NEXT_PUBLIC_API_URL.

## R2 / S3

Set STORAGE_ENDPOINT, STORAGE_REGION (`auto` for R2), STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET and STORAGE_PUBLIC_URL. Restrict the API key to the media bucket. Uploaded project assets are intentionally public, but bucket listing and writes must remain private. Enable a dedicated public media domain, or configure an equivalent read policy on S3. `npm run storage:init` is strictly for loopback MinIO and refuses non-local endpoints and production. Create production buckets through the infrastructure provider. Storage writes are server-to-server and require no browser write credentials.

## Build and release

1. Configure build-time public URLs and production runtime secrets.
2. `npm ci && npm run db:generate`.
3. Set the internal API URL. The sitemap is generated on request, so a live API is not required during the build.
4. `npm run build`.
5. Take a database backup, inspect pending SQL and run `npm run db:migrate` once per release.
6. For a new installation only, seed with a strong administrator password. Replace the local-preview policy before external use.
7. Start API with `node apps/api/dist/main.js`; start web with `npm run start --workspace=@buhariy/web`; serve `apps/admin/dist` with SPA fallback to index.html. Container/process orchestration must restart unhealthy services.
8. Terminate TLS at a trusted reverse proxy. Set body limits, upstream timeouts and security headers. If enabling trust-proxy, expose the API only through that proxy to prevent forged client IPs. Use one API process until a shared rate-limit backend is configured.
9. Smoke-test login, upload, publish, contact, editor restrictions and logout on the real domain. Verify image optimization against your actual media domain. Enable database backup and restore testing, storage lifecycle monitoring, health checks and central structured log retention.

`docker/Dockerfile` provides API, admin and web targets. The sitemap is generated at request time; the web target runs Next directly. Build-time ARG URLs are not secrets. Supply database and JWT values only at runtime. The included reverse proxy configuration is a template: replace the example domain before use.

## Launch content

The exact existing BUHARIY TECH logo was not supplied. Use the original file when received. Wordmark/favicon are temporary typography. The policy in seed data is explicitly a local testing draft, not legal approval. Confirm legal entity, contact/requests process, retention periods and applicable obligations with the company before activation. No real team records were invented. Empty team state is intentional. Concept projects must stay labelled until replaced with genuine cases.
