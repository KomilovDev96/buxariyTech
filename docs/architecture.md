# BUHARIY TECH — architecture decision, before implementation

## Requirements and boundaries

A sales-oriented Uzbek website, an independent content/lead administration app, and a durable modular API. No fabricated clients, employees, outcomes, or numbers. Concept portfolio records are explicitly labelled. Existing logo is pending: use a wordmark, never invent a replacement monogram. The full original requirements are in product-brief.md.

## Architecture

npm workspaces + Turborepo coordinate Next.js App Router (web), React/Vite (admin), and NestJS (api). PostgreSQL is the source of truth; Prisma owns schema/migrations. Shared Zod contracts validate inputs on both sides; Nest pipes enforce them server-side. Serialized response types are centralized in the contracts package and imported type-only, so no Prisma code or database secrets enter browser bundles. Authentication uses Argon2id, short-lived JWT cookies tied to revocable database sessions, hashed rotating refresh tokens, ADMIN/EDITOR RBAC, and same-origin validation for cookie mutations. A reverse proxy can serve admin and API under the same parent domain.

## Database proposal

User -> Role enum (ADMIN/EDITOR); User -> Session[]; Project -> ProjectImage[] (five-image cap serialized by a database row lock); Project -> Category; Project <-> Technology; SiteBlock (key + locale, editable text + one image); BusinessSolution (localized product catalog); Service; TeamMember; ClientRequest -> User assignee; ClientRequest -> RequestNote[]; ClientRequest -> PrivacyPolicy version; Setting; AuditLog. A transaction protects image limits, ordering and cover selection. Public queries only return published records and never return request notes or private settings.

## Folders

apps/{web,admin,api}; packages/contracts; prisma/{schema.prisma,migrations,seed.ts}; docker; docs; tests; scripts. UI components stay in their application until genuine cross-app reuse appears. Avoid empty abstraction packages.

## REST contract proposal

/auth/login, /auth/refresh, /auth/logout, /auth/me; /projects[/:slug]; /services[/:slug]; /team; /privacy; /settings; POST /requests. Protected /admin/dashboard; /admin/projects CRUD and nested /images upload/update/delete/reorder; /admin/{categories,technologies,services,team}; ADMIN-only /admin/requests with notes, assignment, status, priority; /admin/users; /admin/settings; /admin/privacy. Pagination is bounded. API errors have {success:false,code,message}. Public contact returns acknowledgement only.

## Design system

80% technology / 20% heritage. #0D0D0D canvas, #1F1F1F surfaces, #D4AF7C accent, #8B6F47 bronze, #F5EFE6 text, #2E4A62 secondary. Montserrat headings, Inter body. Deliberate thin rules, restrained corners, generous spacing. A large typographic hero, real Bukhara architecture photography, numbered editorial sections, technical flow diagram and concept portfolio. Motion respects reduced-motion. Semantic accessible forms and keyboard navigation. Uzbek default with centralized dictionaries and RU/EN interface support.

## Delivery sequence

Repository -> schema/migration -> API -> auth -> admin -> public -> CMS -> leads -> storage -> metadata -> security -> automated and browser checks -> operations docs. Local Docker PostgreSQL and S3-compatible MinIO provide real persistence. Cloudflare R2 can replace MinIO using environment variables. Deployment to a Node-capable host is documented; Sites Workers cannot host this requested NestJS/PostgreSQL stack unchanged.

## Publication prerequisites

Obtain original logo, approved privacy policy/company contact details and real content; configure domain, PostgreSQL backups, R2 and production secrets. Do not equate local passing tests with a production security audit.
