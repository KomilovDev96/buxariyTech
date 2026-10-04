# FixFlow product copy — source notes

Reviewed on 2026-09-14 using the user's connected GitHub access to `KomilovDev96/fixFlow`, default branch `main`. The review was read-only. No source files, secrets, client records or screenshots from the private repository were copied into public assets.

The catalog describes a service desk for multi-branch businesses and maintenance cost tracking. Supported by:

- [Request model](https://github.com/KomilovDev96/fixFlow/blob/main/server/src/modules/requests/schemas/request.schema.ts): company/object, assignee, priority, deadline, completion report, photos/video, work price, material expenses and receipt images.
- [Request service](https://github.com/KomilovDev96/fixFlow/blob/main/server/src/modules/requests/requests.service.ts): create, assign, status transitions, completion and review; Telegram notifications.
- [Object model](https://github.com/KomilovDev96/fixFlow/blob/main/server/src/modules/objects/schemas/object.schema.ts): company service sites with name/address/location.
- [Analytics service](https://github.com/KomilovDev96/fixFlow/blob/main/server/src/modules/analytics/analytics.service.ts): company/branch-scoped request summaries, executor details and recorded work charges/material expenses.
- [Excel export](https://github.com/KomilovDev96/fixFlow/blob/main/client/src/utils/exportExcel.ts): supervisor report with financial/category sheets.
- Repository tree includes Telegram Mini App screens for requests, request creation, details and profiles.

These support product-description wording, not a claim that FixFlow's deployment, reliability, security, accounting completeness or business outcomes were tested. No prices, savings percentages, banking/tax functionality or AI capability were inferred. User confirmed FixFlow is an existing product; catalog readiness is therefore AVAILABLE (company product). Three other seeded industry solutions are explicitly CONCEPT.

All catalog text, features, workflow, price label, readiness, ordering and publication status are editable in the admin's “Tayyor yechimlar” section, independently for each locale. Subsequent seed runs preserve edited records.
