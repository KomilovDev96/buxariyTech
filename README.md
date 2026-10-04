# BUHARIY TECH

**Qadriyatlardan kelajakka.** Digital foundation for a technology company in Bukhara.

Three independent applications with real PostgreSQL persistence, an S3-compatible portfolio store, authentication, portfolio CMS and a lead workflow. Default public language: Uzbek Latin. Navigation, hero and forms include RU/EN dictionaries; editorial copy and CMS content currently remain Uzbek. No fabricated clients, employees or business results. Seed projects are clearly marked **Concept Project**.

## Local setup

Requirements: Node.js 22.12+ (tested on 24.15), npm 11, Docker Compose.

```sh
npm ci
npm run setup:local
npm run infra:up
npm run db:generate
npm run db:migrate
npm run db:seed
npm run storage:init
npm run dev
```

- Public website: http://localhost:3100
- Administration: http://localhost:3101
- API health: http://localhost:4100/health
- MinIO console: http://localhost:59001

Use **localhost consistently** for cookie authentication. Local setup generates independent random database, storage, JWT and administrator secrets. Read `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the ignored `.env`. No hardcoded administrator password is distributed. Re-running setup preserves the existing environment; re-running seed preserves existing content/passwords. `.env` must never be committed. To update existing app environment files, copy only the required public keys from `.env`; never copy server secrets into frontend environment files.

## Architecture and stack

| Surface  | Stack                                                                            | Source               |
| -------- | -------------------------------------------------------------------------------- | -------------------- |
| Public   | Next.js App Router, React Server Components, TypeScript, Tailwind, Framer Motion | `apps/web`           |
| Admin    | React, Vite, TypeScript, Tailwind, shadcn/ui with Radix primitives, Lucide         | `apps/admin`         |
| API      | NestJS modules, shared Zod validation, Prisma, Argon2id, JWT cookies             | `apps/api`           |
| Contract | Shared request schemas and serialized response types                             | `packages/contracts` |
| Database | PostgreSQL 17, committed Prisma migrations                                       | `prisma`             |
| Media    | S3 abstraction; MinIO locally, R2/S3 in production                               | `apps/api/src/media` |

npm workspaces and Turborepo manage dependency order. No artificial empty shared UI packages. The public site is primarily server rendered; only navigation, form submission and motion use client components. Published content is cached for 30 seconds; privacy policy reads are fresh. Admin data is always loaded through authenticated API calls.

## Features

Portfolio creation/update/deletion, draft/publish, featured and concept labels, categories/technologies, up to five optimized images, replacement, ordering, alt text and cover selection. Services/team CRUD. Lead statuses NEW → REVIEWING → CONTACTED → DISCUSSION → PROPOSAL → NEGOTIATION → WON / REJECTED, priority, assignee and private notes. Role-aware dashboard, user management, versioned privacy policies, public/private settings, audit records, notification adapter boundary.

## Security

Passwords use Argon2id. Access cookies expire in 15 minutes and reference revocable database sessions; rotating refresh tokens are stored hashed and expire in seven days. Every protected request verifies current user activity and role. All mutations require an allowlisted Origin, including login and refresh. Editor access excludes leads, users, private settings and privacy administration. Cookie-based CORS is restricted to configured origins. Production startup requires secure cookies.

Uploads are memory-bounded at 8 MB, decoded by Sharp and verified against actual format, dimensions and pixel limits; only JPEG, PNG, WebP single-frame images are accepted. Images are re-encoded to WebP, stripped of original metadata and resized to at most 2000 pixels. Project row locks serialize concurrent changes. A sixth image fails server-side. SVG is never accepted. Public forms have Zod validation, a honeypot, a three-per-minute rate limit and explicit current-version consent. No secrets or request bodies are logged. Notifications currently record an event without sending it to an external provider.

The default rate limiter is per API process. Deploy one API replica or add a shared throttler store before scaling horizontally. The request handler also limits JSON to 128 KB. Reverse-proxy body limits and timeouts are included in deployment examples.

## Testing and building

```sh
npm run typecheck
npm test
npm run build --workspace=@buhariy/api
npm run test:api
npm run test:browser
npm run build
npm audit
```

Integration tests start an isolated API listener on port 4102 against the configured local PostgreSQL/MinIO, create test records and clean up their own content. Do not run tests with production credentials. Browser tests use local public/admin servers and synthetic contact details. Tests cover login, RBAC, drafts/publication, valid/invalid/oversized images, concurrent sixth-image rejection, ordering/cover/replacement/deletion, consent, rate limiting, lead assignment/notes, refresh rotation and logout revocation. See `docs/verification.md` for executed results and remaining limitations.

## Documentation

- [Architecture](docs/architecture.md)
- [Database and migrations](docs/database.md)
- [API contract](docs/api.md)
- [Deployment](docs/deployment.md)
- [Asset provenance](docs/assets.md)
- [Original product brief](docs/product-brief.md)

## Before public launch

Supply the original logo, company contact/legal details and an approved privacy policy; the seed policy is clearly marked a **local test copy**. Replace concept content with real portfolio work as available. Add real team members (no employee count is invented). Configure domain/TLS, production PostgreSQL backups, R2 credentials, monitoring and an independent security review appropriate to the launch. Local verification is not a claim that production infrastructure has been deployed or audited.
