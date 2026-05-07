# Project Brief: Premium Printable Photo Montage Gifts

## Vision

Build a premium, mobile-first web platform where clients upload photos, choose or receive recommended montage designs, preview a protected version, and submit a cash-on-delivery order for a finished printed product.

The experience should feel emotional, polished, and simple: Pinterest-style inspiration, Canva-like editing ease, and professional print-production confidence.

## Business Context

The business creates physical printable photo montage gifts. Clients provide photos and order customized print products for babies, couples, birthdays, weddings, families, mother and father gifts, and cuttable photo sheets.

The business handles:

- Photo review and layout correction when needed
- Printing
- Cutting and finishing
- Delivery
- WhatsApp order confirmation

The MVP uses cash/payment on delivery only. Online payment is intentionally out of scope for the first version.

## Core Customer Flow

1. Client enters the website.
2. Client chooses a category or starts with "Let AI find my design".
3. Client uploads photos.
4. System analyzes photo count, orientation, and basic quality.
5. System recommends matching templates.
6. Client chooses a template.
7. Client adjusts crop, zoom, and position inside each photo slot.
8. Client sees a protected low-resolution preview with a soft repeated watermark.
9. Client submits an order with name, WhatsApp, delivery address, city, and notes.
10. Client receives a guest magic link to continue editing without creating an account.
11. Admin reviews the order, confirms by WhatsApp, edits if needed, generates a clean print-ready file, prints, cuts, delivers, and marks status.

## MVP Product Types

### A. Cuttable Photo Sheets

#### A4 Portrait: 9 Polaroid Photos

- 3x3 equal grid
- A4 portrait layout
- Equal pieces after cutting
- Thin 0.25 pt cutting guide lines
- Print-ready export must preserve exact dimensions

#### A4 Portrait: 8 Landscape Photos

- 2x4 equal grid
- A4 portrait layout
- Equal pieces after cutting
- Thin 0.25 pt cutting guide lines
- Print-ready export must preserve exact dimensions

### B. Decorative Posters

- Baby first year poster
- Baby birth info / silhouette collage
- Couple heart collage
- Couple love poster
- Birthday number collage
- Family memory poster
- Wedding welcome poster
- Mother / father gift poster

## Required System Modules

### Template Library

Stores reusable montage templates with metadata:

- Category
- Product type
- Required photo count
- Supported photo orientations
- Print size
- Slot geometry
- Recommended use cases
- Editable text fields
- Preview image
- SEO metadata

### Photo Analyzer

Analyzes uploaded photos before template selection:

- Count
- Orientation: portrait, landscape, square
- Basic resolution and quality
- Aspect ratio
- Potential warnings for low-quality images

### Template Recommender

Matches uploaded photos to templates using:

- Photo count
- Orientation mix
- Category intent
- Product type
- Required slot count
- Basic quality constraints

The first version can use deterministic rules. AI-assisted recommendations can be added later if the business needs richer matching.

### Smart Placement Engine

Automatically places photos into template slots:

- Match orientation to compatible slots
- Center faces or subjects where possible in a later phase
- Preserve each image's crop state
- Avoid destructive edits to source uploads

### Manual Crop / Zoom Editor

Allows clients to adjust each photo inside its slot:

- Drag position
- Zoom in/out
- Reset crop
- Switch selected slot
- Mobile-friendly touch interactions

### Preview Protection Engine

Generates protected client previews:

- Low-resolution output
- Soft repeated watermark
- No clean downloadable print file for clients
- Clean export only available to admin

### Guest Project Save / Resume

Allows clients to continue without an account:

- Guest project token
- Magic resume link
- Stored uploads, selected template, crop states, and order draft
- Expiration policy to avoid unlimited storage growth

### Order Submission

Captures cash-on-delivery order details:

- Name
- WhatsApp number
- Delivery address
- City
- Notes
- Selected product
- Selected template
- Uploaded photos
- Crop settings
- Preview reference
- Order status

### Admin Panel

Supports operational workflow:

- View orders
- Filter by status
- Review submitted photos and preview
- Contact client by WhatsApp
- Edit layout when needed
- Generate clean print-ready export
- Mark order as confirmed, in production, delivered, or cancelled

### Print-Ready Export

Generates clean production files:

- Exact A4 and poster dimensions
- Correct bleed/safe-area handling where needed
- 300 DPI target for print workflows where possible
- Thin cutting guide lines for cuttable sheets
- No watermark
- Admin-only access

### SEO-First Marketing Pages

Build category and product landing pages designed to rank and convert:

- Baby photo montage gifts
- Couple photo gifts
- Birthday photo collage posters
- Wedding welcome posters
- Family memory posters
- Mother and father gift posters
- Printable photo sheets

## Design Direction

The product should feel premium, emotional, elegant, and easy to use.

Design inspiration:

- Pinterest inspiration browsing
- Canva simplicity
- Professional print production

Primary design characteristics:

- Mobile-first
- Fully responsive for phone and desktop
- Warm cream, beige, dusty rose, champagne gold, and charcoal
- Soft shadows
- Rounded cards
- Elegant typography
- Clean spacing
- Large tappable controls
- Clear visual hierarchy
- Emotional product imagery
- Calm editing interface

The interface should prioritize actual workflows over marketing spectacle. The first screen should help users choose a category, upload photos, or start recommendation.

## Technical Direction

No existing application stack was detected in the current repository. Recommended stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Server Actions or route handlers for mutations
- Object storage for uploaded images
- Image processing/export service using a reliable server-side renderer
- Clean modular architecture

Suggested architecture:

- `app/` for routes, layouts, and server actions
- `components/` for reusable UI
- `features/templates/`
- `features/uploads/`
- `features/recommendation/`
- `features/editor/`
- `features/orders/`
- `features/admin/`
- `lib/` for shared utilities
- `prisma/` for schema and migrations
- `tests/` for unit, integration, and workflow tests

## SEO Requirements

The platform should be SEO-friendly from the beginning:

- Clean semantic HTML
- Metadata per route
- Open Graph images and titles
- Sitemap structure
- Category landing pages
- Product landing pages
- Descriptive alt text
- Human-readable URLs
- Fast mobile performance
- Structured content for gift occasions and product types

## MVP Data Objects

Likely core entities:

- Template
- TemplateSlot
- Upload
- Project
- ProjectPhotoPlacement
- Order
- OrderStatusHistory
- AdminUser
- Category
- ProductType

## MVP Order Statuses

- Draft
- Submitted
- Confirmed
- Needs client response
- In production
- Ready for delivery
- Delivered
- Cancelled

## Non-Goals For MVP

- Online card payment
- Client accounts and passwords
- Complex AI image generation
- Full automated print vendor integration
- Native mobile app
- Multi-vendor marketplace

## Success Criteria

The MVP is successful when:

- A client can upload photos and receive suitable template suggestions.
- A client can select a template and adjust photo crops on mobile.
- A client can submit a cash-on-delivery order.
- A guest magic link can reopen the saved project.
- An admin can review, confirm, edit, and export a clean print-ready file.
- SEO landing pages exist for the main categories and product types.
- Cuttable photo sheets export with accurate equal grids and thin cutting lines.

## Open Questions

- What cities are supported for delivery at launch?
- Should prices vary by product type, size, city, or finishing option?
- What exact poster sizes are offered beyond A4 sheets?
- Should WhatsApp confirmation be manual link-based or integrated through an API later?
- What is the upload storage retention period for abandoned guest projects?
- Should admin exports be PDF, PNG, JPG, or multiple formats?
