# Verification — 2026-09-14

## Executed successfully

- Full Turborepo production build: contracts, NestJS API, Vite admin and Next.js public site.
- TypeScript checking across all four workspace packages.
- 14 unit/validation tests.
- 21 integration tests against real local PostgreSQL and S3-compatible MinIO, with an isolated API listener and synthetic test records.
- 6 end-to-end Playwright scenarios in headless Chrome. Public routes (including all five requested service pages and a portfolio detail), language switching, mobile menu, login, project creation with five staged images, six-file selection rejection, interrupted batch recovery without duplicates or loss of unsaved text, publication, detailed case page, keyboard-controlled image dialog, localized site-block editing with uploaded images, consent-gated contact submission, administrator request review, status update, private note and logout. Added solution filtering, workflow expansion, product-specific enquiry persistence and admin product CRUD.
- Public horizontal overflow checks at 375, 390, 430, 768, 1024, 1280 and 1440 pixels. Admin checks at 375, 768 and 1280 pixels. Desktop/mobile screenshots were visually inspected.
- Database migrations applied, including one-cover/one-active-policy uniqueness and a database consent constraint.
- npm dependency audit reports 0 known vulnerabilities after Multer, Sharp, DeepmergeTS and Vitest updates and a compatible Vite version alignment.
- Local API /health checks PostgreSQL availability. Local object upload/read, format conversion and cleanup exercised.
- Environment secrets are ignored by Git. Public/admin environment files contain public endpoint configuration only.

The integration suite explicitly checks concurrent six-image uploads: exactly five succeed, one fails. It also covers MIME spoofing, oversized files, image order/cover/replacement/deletion, draft isolation, policy-version matching, form rate limiting, editor restrictions, refresh-token replay and immediate logout revocation. Site-block coverage includes ADMIN/EDITOR writes, anonymous denial, invalid keys, unknown storage-field rejection, real image validation, object replacement/removal and public response projection. Solution API checks cover editor writes, draft isolation, locale filtering, invalid fields, uniqueness and publication. A regression test verifies that publishing a project preserves omitted narrative fields.

## Scope and remaining launch work

- This is a locally running implementation. No domain, cloud deployment, production PostgreSQL/R2 resource, backup schedule or production monitoring account has been provisioned.
- Docker deployment recipes are supplied; production container deployment and backup/restore have not been exercised against a production environment.
- No external notification is sent: the NotificationService abstraction records a structured event and is ready for a provider integration.
- The original BUHARIY TECH logo and approved legal/contact material were not supplied. The wordmark/favicon are temporary typography; privacy seed content is explicitly a local preview policy.
- RU/EN dictionaries cover navigation, hero and forms. Hero, story, CTA and solution-section content can now be edited independently for UZ/RU/EN. Default story/CTA editorial text and portfolio records remain Uzbek; the solution catalog has UZ/RU/EN copy, while full translation of all existing site content is not represented as complete.
- No team members, testimonials, client outcomes or employee count have been invented. Seed portfolio records are explicitly labelled Concept Project.
- The optional WebMCP contact tool is feature-detected. No native supported WebMCP execution context was available for end-to-end validation; ordinary browser form and API paths were verified.
- Browser measurements are functional/responsive checks, not a Lighthouse or real-user Core Web Vitals certification. An independent production security review has not been performed.

## Local evidence

Ignored local screenshots: `.local/previews/home-desktop.png`, `home-mobile.png`, `admin-dashboard.png`, `admin-request.png`, `case-study.png`, `admin-site-blocks.png`, `insight-case-desktop.png` and `insight-case-mobile.png`, `solutions-desktop.png` and `solutions-mobile.png`. Test definitions live under `tests/`. Operational instructions are in README.md and deployment.md.
