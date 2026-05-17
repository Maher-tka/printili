import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { templateMakerCanvasHref } from "@/lib/admin-tool-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin Template Maker",
  description: "Redirects to the Printili canvas template maker."
};

type AdminTemplateMakerRedirectProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTemplateMakerRedirect({
  searchParams
}: AdminTemplateMakerRedirectProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const query = searchParams ? await searchParams : {};
  const selectedTemplate = getSingleQueryValue(query.template);
  const destination = new URL(templateMakerCanvasHref);

  if (selectedTemplate) {
    destination.searchParams.set("template", selectedTemplate);
  }

  redirect(destination.toString());
}

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
