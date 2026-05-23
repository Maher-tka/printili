# Printili Codex Progress

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
