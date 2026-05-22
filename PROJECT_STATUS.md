# Printili Production V1 Status

Last audited: 2026-05-22

## Current Implemented Features

- Public premium homepage, category/product pages, templates browser, template detail pages, SEO metadata, sitemap, and robots.
- Guest project flow: choose category/template, upload photos, receive a private guest token, edit layout, preview, checkout, and confirmation.
- Customer/admin editor with photo replacement, crop controls, zoom, rotate, nudge, implemented fit modes, undo/redo shortcuts, delete/reset shortcuts, text fields, emoji tools, cut guide toggle, autosave states, mobile bottom controls, and protected preview watermarking.
- Photo intake uses server-side Sharp metadata extraction, orientation detection, brightness/sharpness scoring, basic print-quality warnings, safe local storage names, duplicate-preserving project storage, and quality warnings in editor/admin surfaces.
- Admin dashboard with password gate, order status cards, searchable/filterable order table, order detail, notes, approval toggles, print export downloads, template extractor link, template maker link, and template catalog manager.
- Order workflow has explicit statuses, contextual next actions, transition validation, admin override support, status history, local JSON development fallback, and Prisma/Postgres persistence when `DATABASE_URL` is configured.
- Checkout has required slot/text checks, photo warning acknowledgement, preview approval, centralized pricing, delivery fees, add-ons, and stored order totals.
- Print export creates `print.pdf`, `preview-watermark.jpg`, and `production-summary.json` using Sharp, validates local download paths, and supports custom product dimensions.
- Template system supports seeded public templates, saved templates, template slots, text fields, publish state metadata, duplicate/hide/restore admin actions, extractor review, and local/database template storage.
- Graduation is a real category with only two initial products/templates: Water Bottle Label and Round Juice Sticker.
- Tests cover pricing, order transitions, print dimensions/path safety, and template validation.

## Remaining Production Blockers

- Production needs a real migration plan for the Prisma schema changes before deployment.
- Local file upload/export storage must be replaced by cloud/object storage for durable hosting.
- Admin auth is still a single password signed-session model; it is acceptable for V1 but should become multi-admin role-based auth later.
- Print export is raster-backed PDF output, not editable vector/layer output.
- Online payment, WhatsApp automation, email notifications, analytics, and customer accounts are not implemented.

## Known Risks

- Local JSON storage and local file uploads are development-only; production must use Postgres and should later use cloud object storage.
- Prisma schema changes require a real production migration before deployment.
- PDF export is a high-resolution raster embedded into PDF, not editable vector/layer output.
- Face-priority and subject-priority fit modes are intentionally hidden/normalized until real detection metadata exists.
- Payment remains cash on delivery; no online payment, email, WhatsApp API automation, or customer accounts yet.
- The separate template-maker canvas app under `react-canvas-editor` is outside the main Next.js build and must be deployed/hosted separately if needed.

## Exact Next Milestones

1. Create and apply a production PostgreSQL migration for the schema changes.
2. Replace local upload/export storage with cloud storage and a signed download strategy.
3. Run real customer/admin browser QA on editor, checkout, order status, export, and Graduation project flows.
4. Add richer visual validation to the extractor/maker review screens.
5. Add Playwright smoke tests for start -> editor -> checkout and admin export.
6. Prepare launch pricing, delivery city list, and shop WhatsApp copy.
