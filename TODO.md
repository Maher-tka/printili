# TODO: Implementation Plan

## Current Repository State

The repository is currently empty except for Git metadata. No existing app stack was detected, so the recommended starting point is a new Next.js App Router project with TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Phase 1: Foundation And UI Shell

- [x] Initialize a Next.js App Router project with TypeScript.
- [x] Add Tailwind CSS and define the premium visual system: warm cream, beige, dusty rose, champagne gold, and charcoal.
- [x] Set up base layout, typography, responsive spacing, and reusable UI primitives.
- [x] Create mobile-first navigation and core shell for public pages, editor, and admin.
- [x] Add initial category entry points: babies, couples, birthdays, weddings, families, mother/father gifts, and cuttable sheets.
- [x] Build the first homepage experience around category choice, upload start, and "Let AI find my design".
- [x] Add linting, formatting, and a basic test setup.

## Phase 2: Template System And Recommendation

- [x] Design the template metadata model.
- [x] Add Prisma schema for templates, template slots, categories, and product types.
- [x] Seed initial templates for cuttable sheets and decorative posters.
- [x] Build the template library browsing UI.
- [x] Implement photo analysis for count, orientation, aspect ratio, and basic resolution warnings.
- [x] Build deterministic recommendation rules based on photo count, orientation, category, and product type.
- [ ] Add tests for template matching and recommendation edge cases.

## Phase 3: Editor And Preview Protection

- [x] Build the photo upload flow.
- [ ] Implement smart initial placement into template slots.
- [ ] Create the manual crop, zoom, and position editor.
- [ ] Optimize editor controls for touch and small screens.
- [ ] Store placement state per photo and slot.
- [ ] Generate protected low-resolution previews.
- [ ] Add soft repeated watermarking to client previews.
- [ ] Verify cuttable sheet grids preserve equal piece sizes.
- [ ] Add tests for placement state and preview generation.

## Phase 4: Guest Projects And Orders

- [x] Add guest project persistence.
- [ ] Generate secure magic resume links.
- [ ] Save uploads, template selection, crop settings, and draft order details.
- [ ] Build order submission form with name, WhatsApp, delivery address, city, and notes.
- [ ] Add cash-on-delivery order flow with no online payment.
- [ ] Add order statuses and status history.
- [ ] Create confirmation screens and resume-link messaging.
- [ ] Add tests for guest resume and order submission.

## Phase 5: Admin Panel And Print Export

- [ ] Add admin authentication.
- [ ] Build admin dashboard for order review and status management.
- [ ] Add filters for submitted, confirmed, in production, delivered, and cancelled orders.
- [ ] Add WhatsApp contact actions for order confirmation.
- [ ] Allow admin layout adjustments before production.
- [ ] Generate clean print-ready export without watermark.
- [ ] Support exact A4 cuttable sheets with 0.25 pt cutting guide lines.
- [ ] Add export formats required by the print workflow.
- [ ] Add tests for admin-only access and print export dimensions.

## Phase 6: SEO And Polish

- [ ] Create SEO-friendly category and product landing pages.
- [ ] Add route metadata, Open Graph metadata, and social preview images.
- [ ] Add sitemap and robots configuration.
- [ ] Add semantic headings, descriptive copy, and alt text.
- [ ] Improve performance for mobile uploads and previews.
- [ ] Add empty states, loading states, error states, and recovery flows.
- [ ] QA the full customer journey on phone and desktop.
- [ ] QA the admin production workflow.
- [ ] Polish animations, spacing, copy, and accessibility.

## Recommended Next Prompt

Implement Phase 1 only: initialize the Next.js App Router project with TypeScript and Tailwind CSS, create the premium mobile-first UI shell, add the first homepage/category flow, and set up basic linting and tests.
