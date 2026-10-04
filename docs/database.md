# Database

PostgreSQL 17 with Prisma 6.19.3. The exact executable schema is `prisma/schema.prisma`; SQL migrations are committed. Prisma major version is pinned to keep the native PostgreSQL client stable. Upgrade deliberately, including generation and integration tests.

## Relations

- User has an ADMIN/EDITOR role, active flag, Argon2 password hash, Sessions, assigned ClientRequests, RequestNotes and AuditLogs.
- Session contains a unique SHA-256 refresh token hash and absolute expiry. JWT holds only subject and session ID.
- Project belongs to an optional Category and has many Technologies and ProjectImages. Concept, featured and published are independent flags.
- ProjectImage stores object key, URL, alt text, order and cover state. Binary bytes never enter PostgreSQL. Cover is derived from the relation rather than duplicated on Project.
- ClientRequest references an immutable PrivacyPolicy version and optional administrator assignee. Its internal RequestNotes remain private.
- Service and TeamMember have explicit published/order fields.
- BusinessSolution stores localized product cards with a slug unique per locale, sector, readiness and separate publication flag. Features and workflow are bounded string arrays.
- SiteBlock is identified by `(key, locale)`, constrained to hero/story/CTA/solutions and UZ/RU/EN. It stores editable text, alt, a public image URL and a private object key. Defaults live in the shared contracts package; uploaded bytes live in S3.
- Setting has an explicit public flag. Private settings never appear on the public endpoint.
- AuditLog stores actor, action, resource route, optional entity ID and timestamp; it does not store request bodies.

## Concurrency

Every image mutation takes a project row lock. Count, create/delete, cover reassignment and sorting operate in one transaction. Blob upload happens before the short transaction; rejected writes clean up their uploaded object. Project deletion uses the same lock. Failed storage cleanup is logged so operators can reconcile orphan objects without rolling back valid content updates. Refresh rotation uses conditional update and a transaction so only one caller can reuse an old token. Active policy updates take a PostgreSQL advisory lock. Site-block image replacement/removal is serialized with a per-block advisory lock, including the initial upload before a row exists. Replaced objects and rejected uploads are cleaned up.

## Operations

`npm run db:generate`, `npm run db:migrate`, `npm run db:seed`. In development, create new migrations with `npx prisma migrate dev --name descriptive_name`, review generated SQL and commit it. Production uses only `migrate deploy`, never `db push` or schema reset. Back up PostgreSQL and object storage independently. Restoring one without the other can leave broken portfolio images. Sessions can be periodically cleaned with `deleteMany({where:{expiresAt:{lt:new Date()}}})` in an operations job. Session expiry is enforced even before cleanup.
