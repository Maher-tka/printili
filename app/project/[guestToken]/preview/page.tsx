import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MontagePreview } from "@/components/montage-preview";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";
import { formatSheetSizeCm } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProjectPreviewPageProps = {
  params: Promise<{ guestToken: string }>;
};

export async function generateMetadata({ params }: ProjectPreviewPageProps): Promise<Metadata> {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  return {
    title: project ? `Preview Project ${project.projectCode}` : "Preview Project",
    description: "Preview and order submission placeholder for a printable photo montage gift."
  };
}

export default async function ProjectPreviewPage({ params }: ProjectPreviewPageProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project) {
    notFound();
  }

  const template = project.chosenTemplateSlug
    ? await getPublicTemplateBySlug(project.chosenTemplateSlug)
    : null;
  const layout = template ? await getPublicTemplateEditorLayout(template.slug) : null;
  const filledSlots = layout
    ? layout.slots.filter((slot) =>
        project.placements.some((placement) => placement.slotId === slot.id)
      ).length
    : 0;
  const missingSlots = layout ? Math.max(0, layout.slots.length - filledSlots) : 0;
  const warningPhotos = project.photos.filter((photo) => photo.qualityWarnings.length > 0);
  const requiredTextFields = layout?.textFields.filter((field) => field.isRequired) ?? [];
  const missingRequiredText = requiredTextFields.filter(
    (field) => !(project.textValues[field.key] ?? field.defaultValue ?? "").trim()
  ).length;

  return (
    <section className="page-shell py-12 sm:py-16" aria-labelledby="preview-heading">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
          Project {project.projectCode}
        </p>
        <h1 id="preview-heading" className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
          Preview & Submit Order
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          This is a protected preview. Your final print will be clean and high quality.
        </p>
      </div>

      {template && layout ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start">
          <div className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
            <div className="mb-3 flex rounded-full bg-cream p-1 text-xs font-semibold text-charcoal-soft">
              <span className="flex-1 rounded-full bg-paper px-3 py-2 text-center text-charcoal">
                Screen proof
              </span>
              <span className="flex-1 px-3 py-2 text-center">Print-safe review</span>
            </div>
            <MontagePreview
              layout={layout}
              photos={project.photos}
              placements={project.placements}
              protectedPreview
              template={template}
              textValues={project.textValues}
              watermarkText={`PREVIEW ${project.projectCode} ${new Date().toLocaleDateString()}`}
            />
          </div>

          <div className="grid gap-4">
            <div className="soft-card p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
                Protected preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{template.name}</h2>
              <p className="mt-2 text-sm font-semibold text-charcoal">
                {formatSheetSizeCm(template.sheetSize, template.orientation)}
              </p>
              <p className="mt-3 text-sm leading-6 text-charcoal-soft">
                This screen proof uses the same crop rules as the editor and stays watermarked until
                the order moves into the private production workflow.
              </p>
            </div>

            <div className="soft-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
                    Print-safe checks
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Ready before print</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    missingSlots === 0 && warningPhotos.length === 0 && missingRequiredText === 0
                      ? "bg-[rgb(34_128_91_/_0.12)] text-[rgb(25_96_68)]"
                      : "bg-rose-soft text-charcoal"
                  }`}
                >
                  {missingSlots === 0 && warningPhotos.length === 0 && missingRequiredText === 0
                    ? "Ready"
                    : "Review"}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <PreviewCheck
                  label="Photo slots"
                  value={`${filledSlots}/${layout.slots.length} filled`}
                  isReady={missingSlots === 0}
                />
                <PreviewCheck
                  label="Photo quality"
                  value={
                    warningPhotos.length === 0
                      ? "No warnings"
                      : `${warningPhotos.length} photo warning${warningPhotos.length === 1 ? "" : "s"}`
                  }
                  isReady={warningPhotos.length === 0}
                />
                <PreviewCheck
                  label="Required text"
                  value={missingRequiredText === 0 ? "Complete" : `${missingRequiredText} missing`}
                  isReady={missingRequiredText === 0}
                />
                <PreviewCheck
                  label="Output"
                  value={`${template.dpi} DPI`}
                  isReady={template.dpi >= 300}
                />
                <PreviewCheck
                  label="Safe margin"
                  value={`${template.safeMarginMm} mm`}
                  isReady={template.safeMarginMm >= 5}
                />
                <PreviewCheck
                  label="Bleed"
                  value={`${template.bleedMm} mm`}
                  isReady={template.productType === "cut_sheet" || template.bleedMm >= 3}
                />
              </dl>

              {warningPhotos.length > 0 ? (
                <div className="mt-4 rounded-[8px] bg-rose-soft p-4 text-sm leading-6 text-charcoal">
                  {warningPhotos.slice(0, 3).map((photo, index) => (
                    <p key={photo.id ?? `${photo.fileName}-${index}`}>
                      Photo {index + 1}: {photo.qualityWarnings[0]}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="soft-card mt-8 p-5">
          <p className="text-sm font-semibold text-charcoal-soft">
            Choose a template before previewing your order.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]"
          href={`/project/${guestToken}/editor`}
        >
          Edit design
        </Link>
        <Link
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal transition hover:bg-cream"
          href={`/project/${guestToken}/checkout`}
        >
          Submit order
        </Link>
      </div>
    </section>
  );
}

function PreviewCheck({
  isReady,
  label,
  value
}: {
  isReady: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-paper p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-soft">
        {label}
      </dt>
      <dd className="mt-2 flex items-center justify-between gap-3 font-semibold text-charcoal">
        <span>{value}</span>
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${isReady ? "bg-[rgb(25_150_104)]" : "bg-rose"}`}
        />
      </dd>
    </div>
  );
}
