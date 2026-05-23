import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecommendationCard } from "@/components/recommendation-card";
import { summarizePhotoAnalysis } from "@/lib/photo-analyzer";
import { getGuestProject } from "@/lib/project-store";
import { getAllPublicTemplates } from "@/lib/public-template-store";
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
    description: "Choose a Printili design that fits your uploaded photos."
  };
}

export default async function ProjectSuggestionsPage({ params }: ProjectSuggestionsPageProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project) {
    notFound();
  }

  const analysisSummary = summarizePhotoAnalysis(project.photos);
  const templates = await getAllPublicTemplates();
  const recommendations = recommendProjectTemplates({
    category: project.category,
    photoCount: project.photos.length,
    orientationCounts: countPhotoOrientations(project.photos),
    templates,
    limit: 6
  });
  const friendlyWarningCount = analysisSummary.qualityWarnings.length;
  const canUseCount = recommendations.filter((recommendation) => recommendation.canUse).length;

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
          Best designs for your photos
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          We found designs that fit your upload. Choose your favorite, then you can adjust crops,
          add text, preview, and send the order.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Occasion</p>
          <p className="mt-2 text-lg font-semibold">{categoryLabels[project.category]}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Ready designs</p>
          <p className="mt-2 text-lg font-semibold">{canUseCount}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Photos</p>
          <p className="mt-2 text-lg font-semibold">
            {formatPhotoCountRange(project.photos.length, project.photos.length)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-[var(--radius-card)] bg-paper p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Your photos are ready for design matching.</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          These designs fit your photo count best. Some photos may still need small crop adjustments
          in the editor.
        </p>
        {friendlyWarningCount > 0 ? (
          <div className="mt-4 rounded-[8px] bg-rose-soft p-4 text-sm leading-6 text-charcoal">
            Some photos may print softer. You can still continue, and we will show reminders again
            before checkout.
          </div>
        ) : null}
      </div>

      <section className="mt-10" aria-labelledby="matching-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="matching-heading" className="font-display text-3xl leading-tight sm:text-4xl">
              Choose your favorite design
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Start with one design now. You can still move photos, use Smart Fix, and edit text
              after choosing.
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
              Browse all products or upload a few more photos so we can suggest a better design.
            </p>
          </div>
        )}
      </section>

      <details className="mt-8 rounded-[var(--radius-card)] border border-[rgb(199_163_95_/_0.24)] bg-paper p-5">
        <summary className="cursor-pointer text-sm font-semibold text-charcoal">
          Advanced photo details
        </summary>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] bg-cream p-4">
            <p className="text-sm font-semibold text-charcoal-soft">Total photos</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.totalPhotos}</p>
          </div>
          <div className="rounded-[8px] bg-cream p-4">
            <p className="text-sm font-semibold text-charcoal-soft">Vertical</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.portraitCount}</p>
          </div>
          <div className="rounded-[8px] bg-cream p-4">
            <p className="text-sm font-semibold text-charcoal-soft">Horizontal</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.landscapeCount}</p>
          </div>
          <div className="rounded-[8px] bg-cream p-4">
            <p className="text-sm font-semibold text-charcoal-soft">Square</p>
            <p className="mt-2 text-2xl font-semibold">{analysisSummary.squareCount}</p>
          </div>
        </div>

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
      </details>
    </section>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
