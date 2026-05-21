import type { Metadata } from "next";
import { PublicPageHero } from "@/components/printili/PublicPageHero";
import { StartUploadFlow } from "@/components/start-upload-flow";
import { getPublicTemplateBySlug } from "@/lib/public-template-store";
import { formatSheetSizeCm } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Start A Private Photo Montage Project",
  description:
    "Choose a category and upload private photos to start a printable photo montage gift project."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const resolvedSearchParams = await searchParams;
  const templateSlug = getSingleValue(resolvedSearchParams.template);
  const selectedTemplate = templateSlug ? await getPublicTemplateBySlug(templateSlug) : null;

  return (
    <section className="page-shell printili-public-page" aria-labelledby="start-heading">
      <PublicPageHero
        eyebrow="Create"
        image="/printili/hero-clean-scene.png"
        imageAlt="Phone photos turning into printed keepsakes"
        intro="Choose the gift style and upload your photos. We will create a private project, suggest matching templates, and show the print details after you pick a design."
        secondaryAction={{ href: "/templates", label: "Browse products" }}
        titleId="start-heading"
        title="Start with your photos."
      />

      <div className="mt-8 w-full min-w-0 max-w-5xl overflow-x-hidden">
        <StartUploadFlow
          initialCategory={selectedTemplate?.categoryId}
          initialTemplateMaxPhotos={selectedTemplate?.maxPhotos}
          initialTemplateMinPhotos={selectedTemplate?.minPhotos}
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
