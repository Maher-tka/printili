import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplatePreviewImage } from "@/components/template-preview-image";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuredTemplates } from "@/data/seed-templates";
import { getPhotoSource } from "@/lib/photo-url";
import { getPublicTemplateBySlug } from "@/lib/public-template-store";
import {
  categoryLabels,
  formatPhotoCountRange,
  formatSheetSizeCm,
  getCategoryById,
  productTypeLabels
} from "@/lib/templates";

type TemplateDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return featuredTemplates.map((template) => ({
    slug: template.slug
  }));
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = await getPublicTemplateBySlug(slug);

  if (!template) {
    return {
      title: "Template"
    };
  }

  return {
    title: template.seoTitle,
    description: template.seoDescription,
    openGraph: {
      title: template.seoTitle,
      description: template.seoDescription,
      images: [
        {
          url: getPhotoSource(template.previewImage),
          alt: template.previewAlt
        }
      ]
    }
  };
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { slug } = await params;
  const template = await getPublicTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const category = getCategoryById(template.categoryId);

  return (
    <article className="page-shell py-12 sm:py-16" aria-labelledby="template-heading">
      <Link
        className="focus-ring inline-flex rounded-sm text-sm font-semibold text-charcoal-soft transition hover:text-charcoal"
        href={category ? `/templates/${category.slug}` : "/templates"}
      >
        Back to {category?.name ?? "templates"}
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="soft-card overflow-hidden">
          <div className="relative aspect-[4/5] bg-cream-strong sm:aspect-[5/4] lg:aspect-[4/5]">
            <TemplatePreviewImage
              src={template.previewImage}
              alt={template.previewAlt}
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 52vw, 100vw"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-charcoal-soft">
            <span>{categoryLabels[template.categoryId]}</span>
            <span aria-hidden="true">/</span>
            <span>{productTypeLabels[template.productType]}</span>
            <span aria-hidden="true">/</span>
            <span>{formatSheetSizeCm(template.sheetSize, template.orientation)}</span>
          </div>

          <h1
            id="template-heading"
            className="mt-4 font-display text-4xl leading-tight sm:text-6xl"
          >
            {template.name}
          </h1>
          <p className="mt-5 text-base leading-7 text-charcoal-soft">{template.description}</p>
          {template.priceLabel ? (
            <p className="mt-5 inline-flex rounded-full bg-cream px-4 py-2 text-sm font-semibold text-charcoal">
              {template.priceLabel}
            </p>
          ) : null}

          <div className="mt-8">
            <ButtonLink href={`/start?template=${template.slug}`} size="lg">
              {template.ctaLabel ?? "Start with this design"}
            </ButtonLink>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <dt className="text-sm font-semibold text-charcoal-soft">Photo count</dt>
                <dd className="mt-2 text-lg font-semibold">
                  {formatPhotoCountRange(template.minPhotos, template.maxPhotos)}
                </dd>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <dt className="text-sm font-semibold text-charcoal-soft">Sheet size</dt>
                <dd className="mt-2 text-lg font-semibold">
                  {formatSheetSizeCm(template.sheetSize, template.orientation)}
                </dd>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <dt className="text-sm font-semibold text-charcoal-soft">Product type</dt>
                <dd className="mt-2 text-lg font-semibold">
                  {productTypeLabels[template.productType]}
                </dd>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <dt className="text-sm font-semibold text-charcoal-soft">Print setup</dt>
                <dd className="mt-2 text-lg font-semibold">
                  {template.dpi} DPI / {template.bleedMm} mm bleed
                </dd>
              </CardContent>
            </Card>
          </dl>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <section className="soft-card p-6" aria-labelledby="best-for-heading">
          <h2 id="best-for-heading" className="font-display text-2xl leading-tight">
            Best for
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-charcoal-soft">
            {template.bestFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="soft-card p-6" aria-labelledby="print-notes-heading">
          <h2 id="print-notes-heading" className="font-display text-2xl leading-tight">
            Print notes
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-charcoal-soft">
            {template.printNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
            {template.hasCutGuides && (
              <li>Cut guide line: {template.cutLinePt?.toFixed(2) ?? "0.25"} pt.</li>
            )}
          </ul>
        </section>

        <section className="soft-card p-6" aria-labelledby="matching-heading">
          <h2 id="matching-heading" className="font-display text-2xl leading-tight">
            Photo matching
          </h2>
          <p className="mt-5 text-sm leading-6 text-charcoal-soft">
            Preferred mix: {template.preferredPortraitCount} portrait,{" "}
            {template.preferredLandscapeCount} landscape, and {template.preferredSquareCount} square
            photos.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                className="rounded-full bg-rose-soft px-3 py-1 text-xs font-semibold text-charcoal"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
