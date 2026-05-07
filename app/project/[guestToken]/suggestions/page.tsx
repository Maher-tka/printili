import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecommendationCard } from "@/components/recommendation-card";
import { featuredTemplates } from "@/data/seed-templates";
import { summarizePhotoAnalysis } from "@/lib/photo-analyzer";
import { getGuestProject } from "@/lib/project-store";
import {
  countPhotoOrientations,
  recommendTemplates as recommendProjectTemplates
} from "@/lib/template-recommender";
import { categoryLabels, formatPhotoCountRange } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProjectSuggestionsPageProps = {
  params: Promise<{ guestToken: string }>;
};

export async function generateMetadata({ params }: ProjectSuggestionsPageProps): Promise<Metadata> {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  return {
    title: project ? `Project ${project.projectCode} Suggestions` : "Project Suggestions",
    description:
      "Review placeholder template suggestions for a private printable photo montage project."
  };
}

export default async function ProjectSuggestionsPage({ params }: ProjectSuggestionsPageProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project) {
    notFound();
  }

  const analysisSummary = summarizePhotoAnalysis(project.photos);
  const recommendations = recommendProjectTemplates({
    category: project.category,
    photoCount: project.photos.length,
    orientationCounts: countPhotoOrientations(project.photos),
    templates: featuredTemplates,
    limit: 6
  });

  return (
    <section className="page-shell py-12 sm:py-16" aria-labelledby="suggestions-heading">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
          Project {project.projectCode}
        </p>
        <h1
          id="suggestions-heading"
          className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
        >
          Template suggestions are ready to begin
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          This is the first matching engine. It uses your category, photo count, and photo
          orientations; the final print size comes from the template you choose.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Category</p>
          <p className="mt-2 text-lg font-semibold">{categoryLabels[project.category]}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Print size</p>
          <p className="mt-2 text-lg font-semibold">Chosen by template</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Photos</p>
          <p className="mt-2 text-lg font-semibold">
            {formatPhotoCountRange(project.photos.length, project.photos.length)}
          </p>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="analysis-heading">
        <h2 id="analysis-heading" className="font-display text-3xl leading-tight sm:text-4xl">
          Photo analysis summary
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <div className="soft-card p-5">
            <p className="text-sm font-semibold text-charcoal-soft">Total photos</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.totalPhotos}</p>
          </div>
          <div className="soft-card p-5">
            <p className="text-sm font-semibold text-charcoal-soft">Portrait</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.portraitCount}</p>
          </div>
          <div className="soft-card p-5">
            <p className="text-sm font-semibold text-charcoal-soft">Landscape</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.landscapeCount}</p>
          </div>
          <div className="soft-card p-5">
            <p className="text-sm font-semibold text-charcoal-soft">Square</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.squareCount}</p>
          </div>
        </div>

        {analysisSummary.qualityWarnings.length > 0 ? (
          <div className="mt-5 rounded-[var(--radius-card)] bg-rose-soft p-5">
            <h3 className="text-lg font-semibold">Quality warnings</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-charcoal">
              {analysisSummary.qualityWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-5 rounded-[var(--radius-card)] bg-paper p-5">
            <h3 className="text-lg font-semibold">No quality warnings found.</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              These photos look ready for first-pass template matching.
            </p>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[rgb(199_163_95_/_0.24)] bg-paper">
          <div className="grid gap-px bg-[rgb(199_163_95_/_0.2)]">
            {project.photos.map((photo, index) => (
              <div
                className="grid gap-2 bg-paper p-4 text-sm sm:grid-cols-2 lg:grid-cols-7"
                key={photo.fileName}
              >
                <p className="font-semibold text-charcoal">Photo {index + 1}</p>
                <p className="text-charcoal-soft">{photo.widthPx ?? "?"} px wide</p>
                <p className="text-charcoal-soft">{photo.heightPx ?? "?"} px high</p>
                <p className="text-charcoal-soft">
                  {photo.orientation ? photo.orientation.toLowerCase() : "unknown"}
                </p>
                <p className="text-charcoal-soft">
                  {photo.aspectRatio ? `${photo.aspectRatio.toFixed(2)} ratio` : "unknown ratio"}
                </p>
                <p className="text-charcoal-soft">{formatFileSize(photo.fileSizeBytes)}</p>
                <p className="font-semibold text-charcoal">
                  {photo.estimatedPrintQuality?.toLowerCase() ?? "unknown"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="matching-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="matching-heading" className="font-display text-3xl leading-tight sm:text-4xl">
              Matching templates
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Top {recommendations.length} recommendation
              {recommendations.length === 1 ? "" : "s"} from the seed library.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal transition hover:bg-cream"
            href="/templates"
          >
            Browse all templates
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                guestToken={guestToken}
                key={recommendation.template.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        ) : (
          <div className="soft-card mt-6 p-7">
            <h3 className="text-xl font-semibold">No exact matches yet.</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal-soft">
              The next recommendation phase will broaden matching across orientation and product
              type. For now, browse the full template library.
            </p>
          </div>
        )}
      </section>

      <p className="mt-8 text-sm text-charcoal-soft">
        Saved in {project.persistence === "database" ? "the database" : "local development storage"}
        .
      </p>
    </section>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
