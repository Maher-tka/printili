# Printable Photo Montage Gifts

Premium mobile-first web app for printable photo montage gifts, cut sheets, protected previews, cash-on-delivery orders, and admin print production.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Start development:

```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string. If unset or left as the placeholder, the app uses local JSON stores under `.local-storage`.
- `ADMIN_PASSWORD`: Optional admin password. If absent, admin routes use the development placeholder guard.
- `NEXT_PUBLIC_SITE_URL`: Optional public URL used when showing copyable magic links.

## Database And Seed

Generate the Prisma client:

```bash
npm run db:generate
```

With a configured PostgreSQL database, seed templates:

```bash
npm run db:seed
```

## Admin Login

Open `/admin`.

If `ADMIN_PASSWORD` is set, enter that password. If it is not set, the dashboard opens in development mode.

## Key Flows

- Customer start: `/start`
- Templates: `/templates`
- Guest editor: `/project/[guestToken]/editor`
- Protected preview: `/project/[guestToken]/preview`
- Checkout: `/project/[guestToken]/checkout`
- Admin dashboard: `/admin`

## Print Export

Admins can generate print files from order detail pages. Files are stored under `.local-storage/exports`.

See `PRINT_EXPORT_NOTES.md` for current export behavior and limitations.

## Known Limitations

- Local JSON storage is intended for development only.
- Print export embeds a high-quality raster into PDF rather than vector layers.
- Smart crop, face priority, and subject priority are placeholders and currently render like cover.
- Frame, gift wrap, premium paper, urgent orders, and delivery fees are pricing placeholders.
- Online payment is intentionally not implemented; payment is cash on delivery only.

## Next Improvements

- Add real authentication and roles for admin users.
- Add cloud object storage for production photo uploads.
- Add formal migrations for production database rollout.
- Improve print export with richer text styling and remote image support.
- Add Playwright visual regression checks for mobile and desktop flows.
