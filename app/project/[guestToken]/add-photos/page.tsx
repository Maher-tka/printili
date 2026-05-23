import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectAddPhotosFlow } from "@/components/project-add-photos-flow";
import { getGuestProject } from "@/lib/project-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AddPhotosPageProps = {
  params: Promise<{ guestToken: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: AddPhotosPageProps): Promise<Metadata> {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  return {
    title: project ? `Add Photos To ${project.projectCode}` : "Add Photos",
    description: "Add more photos to an existing private Printili project."
  };
}

export default async function AddPhotosPage({ params, searchParams }: AddPhotosPageProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project || new Date(project.expiresAt) < new Date()) {
    notFound();
  }

  const query = (await searchParams) ?? {};
  const neededPhotoCount = parseNeededPhotoCount(query.needed);
  const returnTo = query.returnTo === "editor" ? "editor" : "suggestions";

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="add-photos-heading">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
          Private project
        </p>
        <h1
          id="add-photos-heading"
          className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
        >
          Add more photos
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          Add extra photos to this saved project, then return to your design suggestions or editor.
          Your earlier uploads stay in place.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal transition hover:bg-cream"
          href={`/project/${guestToken}/suggestions`}
        >
          Back to suggestions
        </Link>
        {project.chosenTemplateSlug ? (
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal transition hover:bg-cream"
            href={`/project/${guestToken}/editor`}
          >
            Back to editor
          </Link>
        ) : null}
      </div>

      <div className="mt-8">
        <ProjectAddPhotosFlow
          existingPhotos={project.photos.map((photo) => ({
            fileName: photo.fileName,
            originalUrl: photo.originalUrl,
            qualityWarnings: photo.qualityWarnings
          }))}
          guestToken={guestToken}
          neededPhotoCount={neededPhotoCount}
          projectCode={project.projectCode}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}

function parseNeededPhotoCount(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const needed = rawValue ? Number(rawValue) : 0;

  return Number.isFinite(needed) && needed > 0 ? Math.floor(needed) : undefined;
}
