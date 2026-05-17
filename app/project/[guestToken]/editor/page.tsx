import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerEditor } from "@/components/customer-editor";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProjectEditorPlaceholderProps = {
  params: Promise<{ guestToken: string }>;
};

export async function generateMetadata({
  params
}: ProjectEditorPlaceholderProps): Promise<Metadata> {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  return {
    title: project ? `Edit Project ${project.projectCode}` : "Project Editor",
    description: "Adjust photo crops and text for a printable photo montage gift."
  };
}

export default async function ProjectEditorPage({ params }: ProjectEditorPlaceholderProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project || new Date(project.expiresAt) < new Date()) {
    notFound();
  }

  const template = project.chosenTemplateSlug
    ? await getPublicTemplateBySlug(project.chosenTemplateSlug)
    : null;

  if (template) {
    const layout = await getPublicTemplateEditorLayout(template.slug);

    return <CustomerEditor layout={layout} project={project} template={template} />;
  }

  return (
    <section className="page-shell py-12 sm:py-16" aria-labelledby="editor-heading">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
          Project {project.projectCode}
        </p>
        <h1 id="editor-heading" className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
          Choose a template first
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          Your photos are saved. Pick a recommended design before opening the crop editor.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Selected template</p>
          <p className="mt-2 text-lg font-semibold">Not selected yet</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Photos</p>
          <p className="mt-2 text-lg font-semibold">{project.photos.length}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-sm font-semibold text-charcoal-soft">Starter placements</p>
          <p className="mt-2 text-lg font-semibold">{project.placements.length}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]"
          href={`/project/${guestToken}/suggestions`}
        >
          See template suggestions
        </Link>
        <Link
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal transition hover:bg-cream"
          href="/templates"
        >
          Browse templates
        </Link>
      </div>
    </section>
  );
}
