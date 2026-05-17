import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CustomerEditor } from "@/components/customer-editor";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AdminProjectEditorPageProps = {
  params: Promise<{ guestToken: string }>;
};

export async function generateMetadata({ params }: AdminProjectEditorPageProps): Promise<Metadata> {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  return {
    title: project ? `Admin Edit ${project.projectCode}` : "Admin Project Editor",
    description: "Private admin design editor for production adjustments."
  };
}

export default async function AdminProjectEditorPage({ params }: AdminProjectEditorPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project || !project.chosenTemplateSlug) {
    notFound();
  }

  const template = await getPublicTemplateBySlug(project.chosenTemplateSlug);

  if (!template) {
    notFound();
  }

  const layout = await getPublicTemplateEditorLayout(template.slug);

  return <CustomerEditor adminMode layout={layout} project={project} template={template} />;
}
