import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MontagePreview } from "@/components/montage-preview";
import { getTemplateEditorLayout } from "@/data/template-layouts";
import { getGuestProject } from "@/lib/project-store";
import { formatSheetSizeCm, getTemplateBySlug } from "@/lib/templates";

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
    ? getTemplateBySlug(project.chosenTemplateSlug)
    : null;

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

      {template ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start">
          <div className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
            <div className="mb-3 flex rounded-full bg-cream p-1 text-xs font-semibold text-charcoal-soft">
              <span className="flex-1 rounded-full bg-paper px-3 py-2 text-center text-charcoal">
                Flat proof preview
              </span>
              <span className="flex-1 px-3 py-2 text-center">Mockup preview soon</span>
            </div>
            <MontagePreview
              layout={getTemplateEditorLayout(template.slug)}
              photos={project.photos}
              placements={project.placements}
              protectedPreview
              template={template}
              textValues={project.textValues}
              watermarkText={`PREVIEW ${project.projectCode} ${new Date().toLocaleDateString()}`}
            />
          </div>

          <div className="soft-card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
              Protected preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{template.name}</h2>
            <p className="mt-2 text-sm font-semibold text-charcoal">
              {formatSheetSizeCm(template.sheetSize, template.orientation)}
            </p>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              This preview uses a repeated watermark and the same crop rules as the editor,
              including blur background fit. Downloading the final clean production file is only
              available to the private admin workflow.
            </p>
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
