import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CodexThreadLauncher } from "@/components/codex-thread-launcher";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  mainProjectThreadHref,
  templateExtractorPrompt,
  templateExtractorThreadHref
} from "@/lib/admin-tool-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin Template AI Studio",
  description: "Private admin intake for extracting collage template layouts from references."
};

const categories = [
  ["baby", "Baby"],
  ["couple", "Couple"],
  ["birthday", "Birthday"],
  ["family", "Family"],
  ["wedding", "Wedding"],
  ["cut_sheet", "Cut Sheet"],
  ["custom", "Custom Gift"]
];

export default async function AdminTemplateAiPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="template-ai-heading">
      <Link className="text-sm font-semibold text-rose" href="/admin">
        Back to dashboard
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Template AI studio
          </p>
          <h1
            id="template-ai-heading"
            className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
          >
            Extract a collage layout
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-charcoal-soft">
            Use a real finished collage photo for the public preview, then add an optional SVG
            layout export when you want exact photo rectangles and exact white gaps. After
            extraction you can review and correct the slots before customers use it.
          </p>

          <form
            action="/api/admin/template-ai"
            className="soft-card mt-8 grid gap-5 p-5 sm:p-6"
            encType="multipart/form-data"
            method="post"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Template name" name="templateName" required />
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Source type
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="sourceType"
                >
                  <option value="finished_collage_photo">Finished collage photo</option>
                  <option value="layout_image">Layout image</option>
                  <option value="internet_reference">Internet reference</option>
                </select>
              </label>
            </div>

            <Field label="Internet reference URL" name="sourceUrl" />

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Upload preview image
              <input
                accept="image/*"
                className="focus-ring rounded-[8px] border border-dashed border-[rgb(199_163_95_/_0.45)] bg-paper px-3 py-3 text-sm font-normal"
                name="referenceImage"
                type="file"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Optional exact layout SVG
              <input
                accept=".svg,image/svg+xml"
                className="focus-ring rounded-[8px] border border-dashed border-[rgb(199_163_95_/_0.45)] bg-paper px-3 py-3 text-sm font-normal"
                name="layoutFile"
                type="file"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Category
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="category"
                >
                  {categories.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Product type
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="productType"
                >
                  <option value="poster">Poster</option>
                  <option value="cut_sheet">Cut sheet</option>
                  <option value="framed_gift">Framed gift</option>
                  <option value="digital_printable">Digital printable</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Target size
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="sheetSize"
                >
                  <option value="A4">A4 / 21 x 29.7 cm</option>
                  <option value="A3">A3 / 29.7 x 42 cm</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Extraction notes
              <textarea
                className="focus-ring min-h-28 resize-none rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2 text-sm font-normal"
                name="notes"
                placeholder="Example: family poster, use the SVG boxes exactly, ignore the handwritten title."
              />
            </label>

            <div className="grid gap-3 text-sm text-charcoal-soft sm:grid-cols-2">
              {[
                ["detectSlots", "Detect photo slots"],
                ["detectText", "Ignore text for now"],
                ["normalize", "Normalize 0-1 geometry"],
                ["draftOnly", "Open review after extraction"]
              ].map(([name, label]) => (
                <label
                  className="flex items-center gap-3 rounded-[8px] bg-cream px-3 py-3"
                  key={name}
                >
                  <input
                    className="size-4 accent-rose"
                    defaultChecked
                    name={name}
                    type="checkbox"
                    value="true"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <button
              className="focus-ring min-h-12 rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
              type="submit"
            >
              Extract and review template
            </button>
          </form>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <div className="soft-card p-5">
            <h2 className="text-xl font-semibold">Draft output</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-charcoal-soft">
              <p>Normalized photo slots with x, y, width, height, shape, and z-index.</p>
              <p>SVG imports use the black rectangle geometry and skip red guide boxes.</p>
              <p>The saved template opens in a private review screen before final public QA.</p>
            </div>
          </div>
          <div className="soft-card p-5">
            <h2 className="text-xl font-semibold">Extractor role</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              The extractor turns a reference into reusable photo boxes. SVG files are read exactly;
              raster photos are scanned when no SVG layout is provided.
            </p>
          </div>
          <CodexThreadLauncher
            chatName="Template extractor chat"
            copyPromptLabel="Copy extractor prompt"
            description="Use this focused Codex chat for detection logic, SVG/OpenCV improvements, and saved layout data."
            mainThreadHref={mainProjectThreadHref}
            prompt={templateExtractorPrompt}
            promptLabel="Extractor prompt"
            threadHref={templateExtractorThreadHref}
          />
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  required = false
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-charcoal">
      {label}
      <input
        className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
        name={name}
        required={required}
      />
    </label>
  );
}
