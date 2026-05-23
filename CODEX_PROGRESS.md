# Printili Codex Progress

## 2026-05-23 Explicit Product Intent Pass

### Current Phase

Graduation/product-intent recommendation safety.

### Files Inspected

- `CODEX_PROGRESS.md`
- `package.json`
- `types/templates.ts`
- `types/catalog.ts`
- `data/seed-templates.ts`
- `data/catalog.ts`
- `lib/templates.ts`
- `lib/template-recommender.ts`
- `lib/public-template-store.ts`
- `lib/catalog.ts`
- `app/start/page.tsx`
- `components/start-upload-flow.tsx`
- `app/api/projects/start/route.ts`
- `app/project/[guestToken]/suggestions/page.tsx`
- `app/templates/page.tsx`
- `app/templates/[category]/page.tsx`
- `app/categories/[slug]/page.tsx`
- `components/catalog-product-card.tsx`
- `components/template-card.tsx`
- `components/template-filters.tsx`
- `tests/template-recommender.test.ts`
- `tests/templates.test.ts`
- `app/api/recommendations/route.ts`

### Files Changed

- `types/templates.ts`
- `data/seed-templates.ts`
- `data/catalog.ts`
- `lib/templates.ts`
- `lib/template-recommender.ts`
- `lib/public-template-store.ts`
- `lib/catalog.ts`
- `components/start-upload-flow.tsx`
- `app/start/page.tsx`
- `app/api/projects/start/route.ts`
- `app/project/[guestToken]/suggestions/page.tsx`
- `app/templates/[category]/page.tsx`
- `app/categories/[slug]/page.tsx`
- `components/catalog-product-card.tsx`
- `tests/template-recommender.test.ts`
- `tests/templates.test.ts`
- `tests/project-start-route.test.ts`

Ignored existing workspace item:
- `react-canvas-editor` is still modified as a separate subproject and was not touched.

### Completed Tasks

- Added scalable `recommendationVisibility: "generic" | "explicit_intent"` metadata for categories/templates.
- Marked the Graduation category and both Graduation templates as `explicit_intent`.
- Updated both recommendation helpers so `generic_photo_upload` is the default and excludes explicit-intent templates.
- Added `explicit_product_intent` context so direct product/category flows can still include Graduation products when intentionally selected.
- Removed Graduation from the normal upload-first category radio list and added a separate "Making Graduation labels or stickers?" callout that links to `/categories/graduation`.
- Direct `/start?template=graduation-water-bottle-label` and `/start?template=graduation-round-juice-sticker` now show product-first copy, exact custom size, and continue straight to the editor after upload.
- Added server-side safety in `POST /api/projects/start`: Graduation without a selected product returns `400` and does not create a generic suggestions project.
- Kept `/categories/graduation` and `/templates/graduation` available as explicit product browsing pages with clearer labels and CTAs.
- Updated catalog size formatting to show width x height for custom label products.
- Added tests proving generic recommendations exclude Graduation and direct Graduation product starts still work.

### Browser QA Notes

- `/start`: Graduation is not in the generic choices; separate Graduation product callout is visible; no horizontal overflow.
- `/categories/graduation`: hero says Graduation labels and stickers; product cards show Water Bottle Label and Round Juice Sticker with working create CTAs; no horizontal overflow.
- `/templates/graduation`: still shows exactly the two Graduation products/templates with product-specific CTAs.
- `/project/Aszb25F0npQn6EMGBrBrP0NoOwfHQwGRJDwgn8uuT08/suggestions`: generic suggestions do not show Graduation Water Bottle Label or Graduation Round Juice Sticker.
- `/start?template=graduation-water-bottle-label`: shows "Selected product", `20 x 4 cm`, and product-first copy.

### Commands Run

- `npx prettier --write ...touched files...`: passed
- `npm run typecheck`: passed
- `npm run test`: passed, 18 files and 69 tests
- `npm run lint`: passed
- `npm run build`: passed
- `npm run typecheck`: passed again after restoring `next-env.d.ts` generated-route churn
- `git diff --check`: passed with line-ending warnings only

Note:
- An attempted `npm run test -- --runInBand` failed because Vitest does not support that Jest flag. The normal `npm run test` passed afterward.

### Remaining Tasks

- Future explicit-intent categories should use the same `recommendationVisibility: "explicit_intent"` metadata instead of adding category-specific recommender logic.
- If admin UI later lets templates move between categories, expose recommendation visibility in admin controls so product-intent templates stay protected.
- A project that somehow already exists in an explicit-intent category without a template now shows the product-first fallback, but choosing a product starts a new product flow rather than reusing those existing uploaded photos.

### Continuation Instructions

Next session should keep the recommender split intact: generic photo uploads must use `generic_photo_upload`; direct product/category/template starts can use `explicit_product_intent`. Do not add Graduation back to upload-first smart matching. Continue with admin visibility controls or reusing existing uploaded photos for product-first fallback only if requested.

## 2026-05-23 Continuation Pass

### Current Phase

Mobile editor QA, project-level add-more-photos flow, and final route verification.

### Files Inspected

- `CODEX_PROGRESS.md`
- `DESIGN.md`
- `git status` / current diff
- `components/customer-editor.tsx`
- `components/start-upload-flow.tsx`
- `components/recommendation-card.tsx`
- `app/project/[guestToken]/suggestions/page.tsx`
- `app/project/[guestToken]/preview/page.tsx`
- `app/project/[guestToken]/checkout/page.tsx`
- `app/templates/[category]/page.tsx`
- `app/categories/[slug]/page.tsx`
- `app/api/projects/start/route.ts`
- `lib/project-store.ts`
- `lib/storage.ts`
- `lib/photo-analyzer.ts`
- `app/globals.css`
- `prisma/schema.prisma`

### Files Changed

- `app/api/projects/[guestToken]/photos/route.ts`
- `app/project/[guestToken]/add-photos/page.tsx`
- `components/project-add-photos-flow.tsx`
- `components/recommendation-card.tsx`
- `components/customer-editor.tsx`
- `app/project/[guestToken]/suggestions/page.tsx`
- `app/globals.css`
- `lib/project-store.ts`

Ignored local QA fixture note:
- `.local-storage/projects.json` had an extra final `]` and could not be parsed, which made all local private project links show "Project unavailable". I repaired that ignored local fixture so browser QA could test the real editor.

### Completed Tasks

- Added `addPhotosToGuestProject` so existing projects can append new photos in database or local fallback storage without replacing old uploads.
- Added `POST /api/projects/[guestToken]/photos` with project lookup, expiry check, image validation, Sharp analysis, local storage save, and redirect back to suggestions or editor.
- Added `/project/[guestToken]/add-photos`, a customer-facing add-more-photos page that shows existing saved photos, lets customers select more files, warns about duplicate filenames, keeps a carousel for new uploads, and returns to suggestions/editor.
- Wired blocked recommendation cards from a disabled "Add more photos first" button into the real add-photos route.
- Added an add-photos link inside the editor command bar and Photos panel.
- Mobile editor visual fix: bottom sheet is capped at `45svh`, page bottom padding matches it, mobile inspector chrome is reduced, and the site header no longer creates horizontal overflow on phone widths.
- Add-photos mobile overflow fix: existing-photo and new-photo carousels are contained inside their own horizontal scroll areas, not the whole page.
- Split decision: did not split `components/customer-editor.tsx` in this pass because current panels still share autosave/history/selection state tightly. Splitting is safer after the add-photos flow and mobile sheet behavior are accepted.

### Mobile QA Notes

- Browser viewport used: `390 x 844`.
- Editor route checked: `/project/IQn2XVGasI2bTmLy_Rmow_Z5sdutdNrtZ9TpIueXf04/editor`.
- Bottom sheet now covers about `45%` of the viewport instead of `72%`.
- Photos / Adjust / Text / More tabs remain visible with `40px` tap height.
- Editor horizontal overflow: `false`.
- After scrolling to the canvas area, about `304px` of canvas height remains visible above the bottom sheet.
- Add-photos route checked: `/project/IQn2XVGasI2bTmLy_Rmow_Z5sdutdNrtZ9TpIueXf04/add-photos?needed=2&returnTo=editor`.
- Add-photos page horizontal overflow: `false`.
- Graduation smoke checks passed on `/templates/graduation` and `/categories/graduation`; both show Water Bottle Label and Round Juice Sticker.
- Blocked recommendations route checked on `/project/Aszb25F0npQn6EMGBrBrP0NoOwfHQwGRJDwgn8uuT08/suggestions`; page shows the real add-more-photos action.

### Commands Run

- `npx prettier --write app/api/projects/[guestToken]/photos/route.ts app/project/[guestToken]/add-photos/page.tsx components/project-add-photos-flow.tsx components/recommendation-card.tsx components/customer-editor.tsx app/project/[guestToken]/suggestions/page.tsx app/globals.css lib/project-store.ts`: passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run test`: passed, 17 files and 64 tests
- `npm run build`: passed
- `npm run typecheck`: passed again after removing generated `next-env.d.ts` churn from the diff

### Remaining Tasks

- Keep `components/customer-editor.tsx` split as the next safe refactor after the new add-photos flow is accepted.
- Add direct editor support for uploading files from inside the Photos panel if users need fewer page transitions later.
- Add tests around `addPhotosToGuestProject` if project-store testing is expanded.
- Do a deeper checkout mobile form QA pass with real typing/submission after the next visual polish round.

### Continuation Instructions

Next session should start by checking the latest diff and testing the new `/project/[guestToken]/add-photos` route with a real small image upload. Do not redo the completed recommendation/template UX work. If splitting the editor, extract panels only after preserving current autosave/history behavior with focused tests or a very small refactor.

## Current Phase

Template discovery, recommendations, start upload, preview, checkout, and Graduation polish.

## Files Inspected In Current Pass

- `DESIGN.md`
- `CODEX_PROGRESS.md`
- `package.json`
- `app/page.tsx`
- `app/start/page.tsx`
- `components/start-upload-flow.tsx`
- `app/templates/page.tsx`
- `app/templates/[category]/page.tsx`
- `components/category-preview-card.tsx`
- `components/template-card.tsx`
- `components/template-filters.tsx`
- `data/seed-templates.ts`
- `data/catalog.ts`
- `lib/templates.ts`
- `lib/template-recommender.ts`
- `lib/public-template-store.ts`
- `app/project/[guestToken]/suggestions/page.tsx`
- `components/recommendation-card.tsx`
- `app/project/[guestToken]/editor/page.tsx`
- `app/admin/projects/[guestToken]/editor/page.tsx`
- `components/customer-editor.tsx`
- `lib/smart-photo-fit.ts`
- `app/project/[guestToken]/preview/page.tsx`
- `app/project/[guestToken]/checkout/page.tsx`
- `app/categories/[slug]/page.tsx`
- `components/catalog-product-card.tsx`
- `app/globals.css`
- `app/api/projects/start/route.ts`
- `app/api/projects/[guestToken]/template/route.ts`
- `app/api/projects/[guestToken]/checkout/route.ts`
- `app/api/projects/[guestToken]/placements/route.ts`
- `app/api/projects/[guestToken]/text/route.ts`
- `tests/catalog.test.ts`
- `tests/smart-photo-fit.test.ts`
- `tests/template-recommender.test.ts`

## Current Pass Changes

- Confirmed `/templates/[category]` exists, so existing category-card links are not broken.
- Added quick browse chips for All, Photo Collage, Polaroid / Cut Sheets, Graduation, Baby, Birthday, Wedding, and Family.
- Updated template cards to show product type, real custom size, photo count, best-use chips, and a working `Use this design` CTA to `/start?template=...`.
- Rewrote recommendation labels and reasons into customer language.
- Kept missing-photo recommendations visible but blocked with clear `Add more photos first` copy.
- Reworked the project suggestions page into a friendly customer step and moved technical photo details behind `Advanced photo details`.
- Added drag-and-drop support and stronger confidence copy to the start upload flow.
- Improved preview page wording, moved DPI/safe-margin/bleed into advanced details, and made the primary action depend on readiness.
- Split checkout copy into Contact, Delivery, Product options, and Final approval sections without changing the submission route.
- Polished the Graduation catalog product cards with clearer product type and customizable field labels.
- Added/updated recommendation tests for customer-friendly reasons and missing-photo blocking.

## Current Pass Commands

- `npx prettier --write ...touched files...`: passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run test`: passed, 17 files and 64 tests
- `npm run build`: passed
- Browser smoke test passed on:
  - `http://localhost:3000/templates`
  - `http://localhost:3000/templates/graduation`
  - `http://localhost:3000/categories/graduation`
  - `http://localhost:3000/project/A8xC4-8lms_00IkpAI5mKcKzTf7z1lwHfiuW_S7lYlQ/suggestions`

## Current Pass Remaining Tasks

- Do a deeper mobile visual pass later. This pass intentionally kept changes to real flow and did not redesign the approved homepage hero.
- Consider adding a project-level "add more photos" route so blocked recommendations can send customers directly to upload missing photos.
- Consider splitting customer editor panels into smaller files after the accepted UX stabilizes.

## Continuation Instructions

If a new Codex session resumes from here, inspect the latest git diff first, then continue with mobile visual QA and a project-level add-more-photos flow. Do not redesign the approved homepage hero.

## Current UX Audit

### Homepage flow

- The homepage uses the approved premium Printili hero and realistic product imagery, so the brand feeling is strong.
- The primary path is mostly clear, but the product promise can still be simpler: upload photos, choose a template, preview, then order.
- Category/product cards are visible and linked, including Graduation, but the public flow still needs plain-language guidance from products into the editor.

### Template/product browsing

- `/templates` exposes categories, filters, and template cards. This is useful, but it can feel like a catalog/filter tool instead of a guided customer choice.
- Graduation is already present and limited to the approved products: water bottle label and round juice sticker.
- Size/product differences exist in metadata and cards, but ordinary customers need simpler wording around what the product is for.

### Upload/start flow

- `/start` explains that photos create a private project and then suggestions appear.
- The flow stores uploaded photos and supports adding more photos from earlier work, but the customer should see reassurance that photos stay private and can be changed later.

### Editor

- The editor has strong functionality: autosave, undo/redo, slot selection, photo replacement, zoom/rotate/nudge, smart fit, blur fill, text styling, Polaroid captions, cut guides, and preview/checkout.
- The main issue is cognitive load. The inspector currently shows too many controls at once, mixing beginner actions with advanced crop/design controls.
- Some admin-only toolbar/design-tool UI is decorative and should be removed or made functional.
- Mobile uses a bottom sheet, but it needs clearer tabs and fewer controls per view so the canvas stays understandable.

### Preview/checkout

- Preview and checkout routes exist and are linked from the editor.
- The editor already prevents navigation while saving/error states exist, but status wording should be friendlier.

### Admin

- Admin can open the same editor in `adminMode`; admin complexity should remain clearly separated and not leak into customer mode.

### Trust

- The site uses warm premium visuals and private magic-link language. More customer-facing reassurance should continue to be added around privacy, preview-before-print, WhatsApp help, and local print-shop workflow.

## Implementation Plan For This Pass

1. Reorganize `components/customer-editor.tsx` into beginner-friendly tabs: Photos, Adjust, Text, and More.
2. Put Smart Fix first and hide advanced controls behind More.
3. Improve save/status and next-best-action wording.
4. Remove decorative fake admin design toolbar/buttons.
5. Add focused smart-fit tests for edge cases requested by the user.
6. Validate with typecheck, lint, tests, build, and browser inspection.

## Files Inspected

- `DESIGN.md`
- `package.json`
- `app/page.tsx`
- `app/customer/page.tsx`
- `app/templates/page.tsx`
- `app/project/[guestToken]/editor/page.tsx`
- `app/admin/projects/[guestToken]/editor/page.tsx`
- `components/customer-editor.tsx`
- `components/montage-preview.tsx`
- `lib/smart-photo-fit.ts`
- `lib/placement-fit.ts`
- `lib/project-store.ts`
- `lib/public-template-store.ts`
- `lib/templates.ts`
- `types/templates.ts`
- `data/seed-templates.ts`
- `data/template-layouts.ts`
- `app/globals.css`

## Changes Completed In This Pass

### Editor UX

- Reworked the customer editor inspector into clear beginner-friendly tabs: Photos, Adjust, Text, and More.
- Added a next-best-action card that changes for selected spot, saving state, save error, and empty selection.
- Renamed crop controls into customer language:
  - Smart Fix
  - Fit full photo
  - Fill frame
  - Blur background
- Put Smart Fix first in the Adjust panel.
- Moved precise rotation, nudge buttons, exact fit mode, undo/redo, reset, cut guides, and destructive clear actions into More.
- Kept the existing photo strip, slot picker, Polaroid caption tools, text style controls, autosave, undo/redo, preview, and submit flow.
- Removed decorative/fake admin design toolbar buttons and replaced them with a clear admin production-view label.
- Reduced mobile bottom-sheet clutter by keeping the magic-link save panel out of the mobile sheet.

### Public Flow

- Updated `/customer` to explain the customer path as Upload photos -> Choose a template -> Preview before print.
- Replaced the broken/nonexistent FAQ CTA with a real start/preview path.
- Added a private-by-default reassurance card.
- Updated `/templates` hero copy and CTAs so it guides customers to start with photos or view Graduation products.

### Smart Photo Fit

- Improved smart-fit safety for edge/group face cases: when faces are detected near the edge or spread across a group, mismatched crops prefer blur fill when allowed.
- Added tests for edge-sensitive face focus and slots that disallow blur/smart crop.

## Files Touched

- `CODEX_PROGRESS.md`
- `app/customer/page.tsx`
- `app/templates/page.tsx`
- `components/customer-editor.tsx`
- `lib/smart-photo-fit.ts`
- `tests/smart-photo-fit.test.ts`

Note: `react-canvas-editor` was already marked modified as a separate subproject before this pass and was not edited.

## Verification Status

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed: 17 files, 60 tests.
- `npm run build` passed.
- Browser QA passed on `http://localhost:3000/project/Aszb25F0npQn6EMGBrBrP0NoOwfHQwGRJDwgn8uuT08/editor`:
  - page identity correct
  - meaningful editor content rendered
  - no framework overlay
  - console errors/warnings empty
  - Photos/Adjust/Text/More tabs rendered
  - Adjust tab showed Smart Fix, Fit full photo, Fill frame
  - More tab showed advanced controls
  - Text tab showed caption/text tools
- Browser smoke checks passed on:
  - `http://localhost:3000/customer`
  - `http://localhost:3000/templates`

## Remaining Work

- Consider splitting `components/customer-editor.tsx` into smaller files once the UX settles; it is still large.
- Add a dedicated mobile visual pass for the bottom sheet and canvas height.
- Add stronger checkout confidence copy and quality-warning acknowledgement.
- Continue polishing template/product browsing so non-designers can choose product formats faster.
- Add real WhatsApp shop contact once the number/business copy is ready.

## Next Steps For Next Codex Session

1. Open the editor and test on a narrow mobile viewport.
2. Refactor editor panels into `components/customer-editor/*` only after visual behavior is accepted.
3. Improve checkout review and preview approval language.
4. Add clearer product cards for Graduation templates on `/categories/graduation` and `/templates?category=graduation`.
