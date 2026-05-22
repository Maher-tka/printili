# Printili

Printili is a premium personalized photo-printing platform for a small print shop. Customers choose a product or template, upload photos, adjust crop/fit/text, approve a protected preview, and submit a cash-on-delivery order. Admins review orders, track production status, generate print files, and manage templates.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy environment variables.

```bash
cp .env.example .env
```

3. Fill `.env`.

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="choose-a-strong-password"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

4. Generate the Prisma client.

```bash
npm run db:generate
```

5. Run database migrations or push the schema in development.

```bash
npm run db:push
```

6. Seed demo categories/templates.

```bash
npm run db:seed
```

7. Start development.

```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string. Required in production. Development can use `.local-storage` fallback only when this is unset.
- `ADMIN_PASSWORD`: Required in production. Production admin access fails if this is missing.
- `NEXT_PUBLIC_SITE_URL`: Public site URL used for shareable customer links and metadata.

Do not commit real `.env` secrets.

## Database

The Prisma datasource is PostgreSQL. The generated client uses the custom output path `lib/generated/prisma`.

Useful commands:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

For production, create a real migration plan before deploying schema changes.

## Admin Login

Open `/admin`.

If `ADMIN_PASSWORD` is set, enter that password. In production it must be configured; otherwise admin access fails loudly instead of opening the dashboard.

## Key Flows

- Customer start: `/start`
- Templates: `/templates`
- Graduation: `/categories/graduation`
- Guest editor: `/project/[guestToken]/editor`
- Protected preview: `/project/[guestToken]/preview`
- Checkout: `/project/[guestToken]/checkout`
- Admin dashboard: `/admin`

## Pricing And Checkout

Pricing lives in `lib/pricing.ts`. Checkout calculates a stored order total from:

- template size or product kind
- quantity
- selected add-ons
- urgent option
- delivery city/default fee

Customers must approve the preview and acknowledge photo warnings before checkout can submit.

## Print Export

Admins can generate print files from order detail pages. Files are stored under:

```text
.local-storage/exports/{orderNumber}/
```

Successful exports create:

- `print.pdf`
- `preview-watermark.jpg`
- `production-summary.json`

See `PRINT_EXPORT_NOTES.md` for current export behavior and limitations.

## Production Build

Run these before deployment:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Known Limitations

- Local JSON storage is development-only and is rejected in production.
- Print export embeds a high-quality raster into PDF rather than vector layers.
- Smart crop is implemented with orientation-aware placement; face priority and subject priority stay hidden until real detection metadata exists.
- Frame, gift wrap, premium paper, urgent orders, and delivery fees are centralized placeholders in `lib/pricing.ts` and should be edited before launch.
- Online payment is intentionally not implemented; payment is cash on delivery only.
- Local upload/export storage is not a cloud storage solution.

## Next Improvements

- Add real authentication and roles for admin users.
- Add cloud object storage for production photo uploads.
- Add formal migrations for production database rollout.
- Improve print export with richer text styling, bleed previews, and remote image support.
- Add Playwright visual regression checks for mobile and desktop flows.
