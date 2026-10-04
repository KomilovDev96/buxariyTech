# REST contract

Base URL: `http://localhost:4100`. JSON input/output except multipart images. All write requests require `Origin` matching ADMIN_ORIGIN or WEB_ORIGIN. Browser credentials mode: `include` for admin/auth. Cookies are HttpOnly; clients never handle token values. The central typed contract is `packages/contracts/src/index.ts`, including Zod input schemas and serialized response types. Validation rejects unknown properties. API dates serialize as ISO strings.

## Public

| Method | Path                                   | Response                                   |
| ------ | -------------------------------------- | ------------------------------------------ |
| GET    | /health                                | Database readiness                         |
| GET    | /projects?page=1&limit=12&category=web | Page<Project>, published only              |
| GET    | /projects/:slug                        | Published project with at most five images |
| GET    | /services, /services/:slug             | Published service list/detail              |
| GET    | /team                                  | Published members in order                 |
| GET    | /privacy                               | Active immutable privacy version           |
| GET    | /settings                              | Public key/value pairs only                |
| POST   | /requests                              | Acknowledgement without client data        |

Requests require name, valid phone, service from shared enum, description (20–8000 characters), `consentGiven: true` and current `privacyPolicyVersion`. Telegram, company and budget are optional. The hidden `website` field must be empty. The server sets consentAt itself. Three attempts per minute per IP, including invalid attempts. Pagination: page >= 1, limit 1–100.

GET `/site-blocks` returns the twelve localized hero/story/CTA/solutions blocks (including defaults where no edit exists). Object storage keys are never exposed.

## Authentication

POST `/auth/login` with email/password; POST `/auth/refresh`; POST `/auth/logout`; GET `/auth/me`. Login and refresh set access and refresh cookies and return a safe user object. Access: 15 minutes. Refresh session: seven days, absolute expiry, single-use rotation. Logout revokes the underlying session immediately. Authenticated mutations check Origin. Incorrect login returns a generic error; login has an eight-per-minute IP limit.

## ADMIN and EDITOR

- GET/POST `/admin/projects`; GET/PATCH/DELETE `/admin/projects/:id`.
- POST `/admin/projects/:id/images`: multipart `file`.
- PUT `/admin/projects/:id/images/:imageId`: replace file.
- PATCH `/admin/projects/:id/images/:imageId`: `alt` and/or `isCover:true`.
- PATCH `/admin/projects/:id/images/reorder`: `{ids:[...]}` containing every current image ID exactly once.
- DELETE `/admin/projects/:id/images/:imageId`.
- GET/POST `/admin/categories`, `/admin/technologies`, `/admin/services`, `/admin/team`; PATCH/DELETE the same paths with `/:id`.
- GET `/admin/site-blocks`; PATCH `/admin/site-blocks/:key/:locale` with the complete text form `{title,body,label,imageAlt}`. Keys: `hero`, `story`, `cta`, `solutions`; locales: `uz`, `ru`, `en`.
- POST `/admin/site-blocks/:key/:locale/image` with multipart `file`; replaces the single image. DELETE the same path restores the standard hero/story image or removes the optional CTA/solutions image. Image URLs and storage keys cannot be supplied through JSON.
- GET `/admin/dashboard`: editors receive content counts; request counts and audit activity are administrator-only.

## ADMIN only

- GET `/admin/requests?page=1&status=NEW`; GET/PATCH `/admin/requests/:id`.
- POST `/admin/requests/:id/notes` with `{body}`.
- GET/POST `/admin/users`; PATCH `/admin/users/:id` for role, active state, name or password. Session revocation follows security changes. Self-demotion/deactivation is blocked.
- GET/PATCH `/admin/settings`; patch uses `{key,value,public}`.
- GET/POST `/admin/privacy`; new version uses `{version,title,content,active}`. Existing policy text is never edited.

## Errors and limits

`{success:false,code,message}` with HTTP 400 validation, 401 unauthenticated, 403 authorization/origin, 404 missing, 409 unique conflict, 413 oversized upload, 429 rate limiting, 500 generic server error. No production stack traces. Uploads: <=8 MiB, 64–8000 px in each dimension, <=40 million input pixels, JPEG/PNG/WebP, no animation, server re-encoding to WebP. Fields, notes and strings use bounded lengths.

## WebMCP

The contact page optionally registers `submit_project_request` when `document.modelContext` is present. It calls the same validation and submission function as the form and updates the visible success/error state. Explicit current-version privacy consent is mandatory. Unsupported browsers simply use the ordinary form.

## Portfolio narrative

Project input/output includes `goal`, `businessContext`, `challenge`, `solution`, `aiContribution` and `result` (up to 6000 characters each). Empty optional sections are hidden on the public case page. PATCH preserves fields omitted from the request, including technologies and publication/concept flags. Admin stages up to five local files before creating the project, then uploads sequentially using the nested image endpoint; successful files leave the pending queue, failed/unattempted files remain for retry within that editor session.

## Business solution catalog

GET `/solutions?locale=uz|ru|en` returns published products only (default UZ), ordered by featured/order/title, capped at 100. ADMIN and EDITOR can GET/POST `/admin/solutions` and PATCH/DELETE `/admin/solutions/:id`. PATCH accepts the complete editable form. Unknown properties are rejected. Slug is unique per locale. Readiness values are CONCEPT and AVAILABLE; publication is a separate flag.

Fields: title, slug, locale, sector (FINANCE/MANUFACTURING/TRADE/SERVICES), description, audience, features (1–10), workflow (0–8), outcome, priceLabel, readiness, featured, order and published. Public contact prefill resolves only a published solution in the active locale. The submitted description carries the product name through the existing consent-validated request flow.
