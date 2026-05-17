export const mainProjectThreadHref = "codex://threads/019e2730-9d31-7420-84b8-67b15f8c63cb";

export const templateMakerThreadHref = "codex://threads/019dff41-517a-7ae3-bf95-372d22fb9b37";

export const templateMakerCanvasHref = "http://localhost:3001/admin/template-maker";

export const templateExtractorThreadHref = "codex://threads/019e0d71-3686-7393-a8ee-71769a94fd4a";

export const clientEditorThreadHref = "codex://threads/019e24f0-3e66-7e42-a0fe-81c696a8ae3e";

export const adminOrdersThreadHref = "codex://threads/019e183f-7465-73a3-b4c5-b0cd9bb50266";

export const publicWebsiteThreadHref = "codex://threads/019e272c-2011-7b00-8d29-448784a8a6ab";

export const projectChatLinks = [
  {
    name: "Main control chat",
    href: mainProjectThreadHref,
    purpose: "Overall Printili project map, decisions, and final integration."
  },
  {
    name: "Template extractor chat",
    href: templateExtractorThreadHref,
    purpose: "Detect rectangles, photo slots, text areas, and export reusable layout JSON."
  },
  {
    name: "Template maker chat",
    href: templateMakerThreadHref,
    purpose: "Edit extracted layouts, correct slots, and publish templates into categories."
  },
  {
    name: "Client editor chat",
    href: clientEditorThreadHref,
    purpose: "Customer upload, crop, fit, preview, approve, and order handoff."
  },
  {
    name: "Admin/orders chat",
    href: adminOrdersThreadHref,
    purpose: "Order dashboard, status workflow, export, and delivery tracking."
  },
  {
    name: "Public website chat",
    href: publicWebsiteThreadHref,
    purpose: "Homepage, category pages, SEO, product pages, and start-design flow."
  }
] as const;

export const templateExtractorPrompt = String.raw`Continue the Printili template extractor work in C:\Users\Maher\Documents\New project 5.

Goal: improve the admin extractor that detects rectangles/slots from uploaded images and SVG files, then saves the extracted template so the Template maker can edit it.

Start by reading:
- app/admin/template-ai/page.tsx
- app/api/admin/template-ai/route.ts
- app/admin/template-ai/review/[slug]/page.tsx
- lib/template-shape-detector.ts
- lib/public-template-store.ts
- types/templates.ts

Keep this chat focused on extraction quality, SVG/OpenCV detection, normalized slot coordinates, and clean saved template data. Report integration decisions back to the Main control chat.`;

export const templateMakerPrompt = String.raw`Continue the Printili template maker work in C:\Users\Maher\Documents\New project 5.

Goal: build and refine the admin template maker so extracted layouts can be reviewed, corrected, saved, and shown on the public website inside their selected category.

Start by reading:
- app/admin/template-ai/page.tsx
- app/api/admin/template-ai/route.ts
- lib/template-shape-detector.ts
- lib/public-template-store.ts
- types/templates.ts
- components/montage-preview.tsx

Then inspect how the current extractor saves templates, find the next practical improvements for the maker workflow, implement them, and verify the admin route plus public template preview.`;

export function createTemplateMakerPrompt({
  templateName,
  templateSlug,
  slotCount
}: {
  templateName: string;
  templateSlug: string;
  slotCount: number;
}) {
  return String.raw`Continue the Printili template maker work in C:\Users\Maher\Documents\New project 5.

Focus on this extracted template:
- Name: ${templateName}
- Slug: ${templateSlug}
- Detected slots: ${slotCount}

Goal: open the saved template from the extractor, review the slot geometry, correct anything wrong, and save the improved version back to the same template slug so the public website and client editor use the corrected layout.

Start by reading:
- app/admin/template-maker/page.tsx
- app/admin/template-ai/review/[slug]/page.tsx
- lib/public-template-store.ts
- components/montage-preview.tsx
- types/templates.ts

Use /admin/template-ai/review/${templateSlug} as the current browser review screen, then report important integration decisions back to the Main control chat.`;
}
