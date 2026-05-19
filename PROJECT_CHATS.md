# Printili Project Chats

This file mirrors the Main control chat map for the Printili project.

## Project Map

| Area                    | Link                                                   | Purpose                                                              |
| ----------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| Main control chat       | `codex://threads/019e2730-9d31-7420-84b8-67b15f8c63cb` | Project map, decisions, and final integration.                       |
| Template maker chat     | `codex://threads/019dff41-517a-7ae3-bf95-372d22fb9b37` | Edit extracted layouts, correct slots, and publish templates.        |
| Template extractor chat | `codex://threads/019e0d71-3686-7393-a8ee-71769a94fd4a` | Detect rectangles, photo slots, SVG/OpenCV layouts, and export JSON. |
| Client editor chat      | `codex://threads/019e24f0-3e66-7e42-a0fe-81c696a8ae3e` | Customer upload, crop, fit, preview, approve, and order handoff.     |
| Admin/orders chat       | `codex://threads/019e183f-7465-73a3-b4c5-b0cd9bb50266` | Order dashboard, status, export, and delivery workflow.              |
| Public website chat     | `codex://threads/019e272c-2011-7b00-8d29-448784a8a6ab` | Homepage, category pages, SEO, product pages, and start-design flow. |

## Admin Integration

- Admin dashboard has separate buttons for Template extractor and Template maker.
- Template extractor saves detected templates into the shared template store.
- Template maker reads saved extracted templates and links each one to the correction/review screen.
- Corrected templates keep the same slug so the public website and client editor use the updated layout.

## Cross-Chat Update Rule

- The Main control chat is the source of truth for final integration decisions.
- I cannot automatically send messages into other Codex chats. When work in this chat affects another area, this file should be updated with a short handoff note.
- Each specialist chat should read this file at the start of its next session before making changes.
- If a specialist chat makes a change that affects another area, bring the result back to the Main control chat and update this file again.

## Latest Integration Update - May 16, 2026 - Static Hero Baseline

### Public Website Chat Handoff

- The homepage hero now uses the locked static reference image from the approved warm premium design direction.
- Phase 1 is now implemented as a full visual hero image with invisible working hotspots for Start Creating, Browse Products, Create Now, and the three visible category cards.
- The rest of the homepage remains unchanged below the hero so later phases can replace only one hero layer at a time without redesign drift.

## Latest Integration Update - May 16, 2026 - Homepage Finish Pass

### Public Website Chat Handoff

- The homepage now follows `DESIGN.md` more closely across the full page, not only in the hero.
- Lower sections were restyled into the same warm premium system: coral accent, serif/sans typography pairing, softer glass panels, cleaner spacing, black primary CTAs, and less technical copy.
- The tools/editor area is now one cohesive studio band instead of two disconnected sections.
- Mobile now uses a dedicated responsive hero with real product imagery, and both the occasion rail and recommended-template rail become horizontal swipe lists instead of long stacked grids.
- The desktop hero remains the approved locked static visual baseline.

## Latest Integration Update - May 17, 2026 - Final Homepage Reference Lock

### Public Website Chat Handoff

- Desktop `/` is now locked to the approved full-page final-look reference so the public homepage matches the signed-off visual exactly.
- Desktop keeps working invisible hotspots for Create Now, Start Creating, Explore Products, and the first-row category cards while preserving the approved artwork as the visual baseline.
- Mobile keeps a separate live responsive homepage built from the same warm premium direction so smaller screens remain usable instead of forcing the desktop image into a cramped layout.
- Future homepage work should replace desktop layers one section at a time from this locked baseline, and each replacement should be checked against `DESIGN.md` plus the approved final reference before shipping.

## Latest Integration Update - May 17, 2026 - Live Homepage Rebuild

### Public Website Chat Handoff

- Desktop `/` is no longer a screenshot with hotspots; it is now a responsive live homepage built from the approved visual reference.
- Navbar links, search, customer account, cart, hero CTAs, all 12 category cards, lower CTAs, newsletter form, and footer links are now real interactive elements.
- Category cards now use live HTML/CSS with hover lift, image zoom, and animated arrow buttons while keeping the approved warm product-card look.
- The homepage keeps the clean hero artwork as a real image layer, but text and controls are code-native so future work should continue replacing pieces with live UI rather than returning to a flattened screenshot baseline.

## Latest Integration Update - May 17, 2026 - Category Image Refresh

### Public Website Chat Handoff

- Homepage category cards now use the new high-resolution product imagery supplied for Photo Books, Photo Collages, Canvas Prints, Personalized Gifts, Mugs, Gift Cards, Wedding Prints, Baby Collages, and Family Albums.
- Category cards now use a clear split layout: a narrow left content zone and a wider right image zone, with only a short boundary fade so the product artwork remains visible.
- The remaining Polaroid Prints, Birthday Number Collage, and Wall Frames cards now also use matching high-resolution replacements from the follow-up asset drop.
- Hover zoom still stays clipped inside the image zone, while the arrow remains above the image layer at the card's lower-right corner.
- Mobile now reuses the same current hero scene as desktop instead of the older separate hero image.

## Latest Integration Update - May 17, 2026 - Desktop Layout Pass

### Public Website Chat Handoff

- Desktop homepage work is now the active priority; mobile layout should stay unchanged until the later dedicated mobile pass.
- The current approved desktop target is the Codex preview around `1605x900`; do not spend more time on other viewport passes until the desktop homepage is signed off.
- Shared desktop content now centers to a `1500px` inner width in that preview, and the category grid uses four equal columns with consistent `18px` gaps.
- Desktop category cards now use the intended `36% / 64%` split, a compact `40px` coral icon chip, a `56px` boundary fade, and larger bottom-right arrow buttons while keeping the approved hero unchanged.

## Latest Integration Update - May 17, 2026 - Lower Homepage Image Refresh

### Public Website Chat Handoff

- The four `Memories that live beautifully.` tiles now use the newer supplied product images for Decorate your space, Relive your favorite days, Gift from the heart, and Cherish every moment.
- The `Real stories. Real smiles.` visual now uses the newer warm heart-wall scene from the same approved asset set.
- No layout, hero, mobile, or category-card behavior changed in this pass; it was an artwork-only refresh for the lower desktop homepage sections.

## Latest Integration Update - May 17, 2026 - Public Site Wiring Pass

### Public Website Chat Handoff

- Homepage navigation, footer links, and all 12 homepage product cards now point to intentional public destinations instead of collapsing back into a few generic routes.
- Added dedicated warm-styled public pages for top-level navigation, footer destinations, and product families such as Wall Frames, Photo Books, Canvas Prints, Mugs, Baby Collages, Family Albums, and more.
- The shared non-home header now matches the Printili homepage direction with the same brand treatment, product nav, utility icons, and black CTA.
- Existing public pages now reuse a shared premium hero system, and the global font variables were corrected so the Playfair/Inter pairing actually renders across the site.

## Latest Integration Update - May 17, 2026 - Products Page Polish Pass

### Public Website Chat Handoff

- The public nav is now tighter: `Gallery` and `Gift Card` were removed from the main header because they duplicated stronger shopping paths.
- `/templates` now carries the premium Printili direction through the whole page, with a warmer catalog band, refined filters, upgraded template cards, and on-brand local product imagery instead of the older mixed stock previews.
- Gift Cards and Gallery still remain available elsewhere in the public site through dedicated pages and supporting links; this pass only simplified the primary navigation.

## Latest Integration Update - May 18, 2026 - Graduation Catalog Pass

### Public Website / Admin Templates Handoff

- Added a new public Graduation category card linking to `/categories/graduation`.
- The Graduation category currently contains exactly two active products: Water Bottle Label and Round Juice Sticker.
- Graduation now uses dedicated supplied artwork showing the approved bottle-label and round-sticker product scene.
- Product/catalog data now uses a small generic catalog model so more products can be added later manually without hardcoding any unapproved future Graduation items.
- Do not add placeholder or coming-soon Graduation products unless the Main control chat explicitly approves them.

## Latest Integration Update - May 18, 2026 - Homepage Scroll Surface Fix

### Public Website Chat Handoff

- The desktop hero overlay now ignores pointer input except on real links/buttons, so wheel scrolling works reliably in the Codex in-app browser while keeping the hero controls clickable.
- No visual redesign or mobile behavior changed in this pass.

## Latest Integration Update - May 15, 2026 - Website Confidence Pass

### Public Website / Client Editor Handoff

- The direct template start flow now receives the selected template's min/max photo counts.
- Customers who start from a specific design now see a guided 3-step upload flow, photo-count target, missing-photo reminder, and reorderable upload list before the project is created.
- Later photo selections now append into the existing upload batch instead of replacing it, and each selected photo row now has a remove control before project creation.
- Direct-template uploads now block early if the customer is below the template minimum, which prevents opening an editor with obviously empty required slots.
- The project preview page now shows a screen proof beside print-safe checks for filled slots, quality warnings, required text, DPI, safe margin, and bleed.
- Public template filters now also support delivery type and a priced-only toggle, with clearer labels for occasion and format.

### Admin Templates Handoff

- Added reusable template QA scoring in `lib/template-quality.ts`.
- `/admin/templates` now shows QA score badges, slot count, review warnings, and a `Need QA review` metric.
- Current QA checks flag missing slots, slot-count mismatch, low DPI, low bleed, tight safe margin, and missing public price.

### Admin / Orders Handoff

- The production dashboard status tiles are now clickable filters.
- `/admin?status=<status>` narrows the order table and shows a clear-filter action, which makes daily queue handling faster.

## Latest Integration Update - May 15, 2026 - Client Photo Library Pass

### Client Editor Chat Handoff

- The customer editor now treats uploaded photos as a permanent visible library, not a one-time upload batch.
- Extra uploads that do not fit the current template remain visible in `My photos` and are marked `Unused`.
- Every saved photo stays available for reuse; replacing a photo in a spot automatically returns the old photo to the unused pool when it is no longer used.
- Customer-facing language now uses `Photo spots` / `Spot N`, and the non-admin editor hides the fake design-tool buttons to keep the flow simpler.
- The photo library is a horizontal rail so customers can browse many uploads without reuploading.

### Template Maker / Template Extractor Handoff

- No template schema changes were needed for this pass.
- Client-editor behavior assumes templates may have fewer photo spots than the customer uploaded photos; unused uploads remain attached to the project and do not need new placements.

### Public Website / Admin Orders Handoff

- No route or order-flow changes were required.
- Public upload flows should continue preserving all uploaded photos on the project so the client editor can surface extras later.

## Latest Integration Update - May 15, 2026 - Template Maker Reliability Pass

### Template Maker Chat Handoff

- Undo and redo are now real history actions, available from both the toolbar and `Ctrl+Z` / `Ctrl+Shift+Z`.
- `Clear canvas` is now a visible top-bar action and can be undone.
- Horizontal and vertical spacing use the editable frame geometry, so px spacing matches the exported numbers exactly.
- Active multi-selection exports now preserve real canvas coordinates instead of leaking Fabric group-relative positions into JSON, the layer list, or saved templates.
- Match width, match height, match shape, and match all were re-tested on the 10-slot `888` template with repeated mixed operations.

### Admin / Templates Handoff

- `/api/templates?includeHidden=1` now returns hidden templates only for authenticated admins.
- Template Maker now requests the admin-capable feed, so hidden extracted templates such as `888` can still open in the maker while staying hidden from the public catalog.

### Template Extractor / Public Website Handoff

- Extracted templates can remain hidden from public pages and still be edited in Template Maker by slug.
- Public template routes keep using the normal visible-only feed; no hidden templates were exposed to customers.

## Latest Integration Update - May 14, 2026 - Template Maker Precision Tools

### Template Maker Chat Handoff

- `/admin/template-maker` now has an Illustrator-style `Align` panel.
- Multi-select frames, then click one selected frame again to make it the key object.
- Canvas click-again key selection now uses direct hit detection inside the selected group, so clicking a selected frame marks that exact frame as key more reliably.
- Small accidental pointer movement during key selection is locked/restored so the selected shapes do not slide when the user only meant to choose a key frame.
- Spacing now groups selected frames into rows for horizontal spacing and columns for vertical spacing instead of treating a full collage selection as one long line.
- Fixed a Fabric active-selection double-restore bug that could make align, spacing, or match operations send frames far away or make them appear to disappear.
- If the canvas is zoomed or scrolled, key-object selection is now explicit in the `Align` panel through a `Choose key frame` button grid. Clicking a selected row in the `Layers` list also works.
- Selected frames are highlighted blue on the canvas. The key frame is highlighted purple and stays key through align, spacing, and match operations.
- Frame names now render directly on the maker canvas as non-exporting labels, so `photo_01`, `photo_02`, etc. can be matched to the extracted slot table.
- Added align left/center/right/top/middle/bottom, horizontal/vertical spacing, and match width/height/shape/all tools.
- Match-size operations preserve each frame center, so frames do not jump from the top-left corner.
- Fabric's internal selection clearing is now suppressed during geometry edits so the chosen key object is not lost mid-operation.

### Template Extractor Chat Handoff

- No extractor logic changed.
- Extracted templates saved into the shared library can now be opened in Template Maker and corrected with key-object alignment and spacing tools.
- The extractor review preview now shows real slot IDs inside each empty shape instead of the generic `Photo` placeholder.

### Admin/Public/Client Editor Handoff

- Admin and public routes were not changed by this precision-tools update.
- UX research for next priorities is saved at `.lazyweb/design-research/printili-template-editor-ux-2026-05-14/report.md`.
- Strong next cross-area priorities: customer smart crop/fit, print-quality warnings, template version history, and production status workflow.

## Latest Integration Update - May 14, 2026

### Admin Templates Workspace

- Added a third admin dashboard button called `Templates`.
- New admin route: `/admin/templates`.
- The Templates page shows all templates grouped by category with preview thumbnails.
- Each row supports editing description, price label, button label, and category grouping.
- Each row links directly to the maker canvas with `http://localhost:3001/admin/template-maker?template=<slug>`.
- Templates can be removed from the public catalog and restored later.
- Public template cards and detail pages now display the saved price label and custom button text when set.

### Template Maker Chat Handoff

- The maker should continue using `/api/templates` as the shared template library.
- The maker receives selected templates through `?template=<slug>`.
- Saved templates that are hidden by admin metadata should not appear in the maker saved-template list because `/api/templates` filters hidden templates.
- If the maker adds new template fields later, coordinate them with `lib/public-template-store.ts`.

### Template Extractor Chat Handoff

- The extractor can keep saving templates through the existing shared store.
- Extracted templates now become manageable in `/admin/templates` after saving.
- The review screen and maker should preserve the same template slug so admin metadata, public pages, and editor layouts stay connected.

### Public Website Chat Handoff

- `components/template-card.tsx` now supports optional `priceLabel` and `ctaLabel`.
- `app/template/[slug]/page.tsx` now supports optional `priceLabel` and `ctaLabel`.
- Public listing pages use `getAllPublicTemplates()`, which filters templates hidden from the admin catalog.

### Admin/Orders Chat Handoff

- Admin dashboard now includes three catalog workflow buttons: Template extractor, Template maker, and Templates.
- Orders work was not changed by this update.
