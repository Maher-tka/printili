import type { Metadata } from "next";
import { StartUploadFlow } from "@/components/start-upload-flow";
import { formatSheetSizeCm, getTemplateBySlug } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Start A Private Photo Montage Project",
  description:
    "Choose a category and upload private photos to start a printable photo montage gift project."
};

type StartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const resolvedSearchParams = await searchParams;
  const templateSlug = getSingleValue(resolvedSearchParams.template);
  const selectedTemplate = templateSlug ? getTemplateBySlug(templateSlug) : null;

  return (
    <section className="page-shell py-12 sm:py-16" aria-labelledby="start-heading">
      <div className="max-w-3xl">
        <h1 id="start-heading" className="font-display text-4xl leading-tight sm:text-6xl">
          Start with your photos
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          Choose the gift style and upload your photos. We will create a private guest project,
          suggest matching templates, and show the exact print size after you pick a design.
        </p>
      </div>

      <div className="mt-8 max-w-5xl">
        <StartUploadFlow
          initialCategory={selectedTemplate?.categoryId}
          initialTemplateName={selectedTemplate?.name}
          initialTemplateSizeLabel={
            selectedTemplate
              ? formatSheetSizeCm(selectedTemplate.sheetSize, selectedTemplate.orientation)
              : undefined
          }
          initialTemplateSlug={selectedTemplate?.slug}
        />
      </div>
    </section>
  );
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
