import { NextResponse } from "next/server";
import { chooseTemplateForProject } from "@/lib/project-store";

export const runtime = "nodejs";

type ChooseTemplateRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function POST(request: Request, { params }: ChooseTemplateRouteProps) {
  const { guestToken } = await params;
  const formData = await request.formData();
  const templateSlug = formData.get("templateSlug");

  if (typeof templateSlug !== "string" || templateSlug.length === 0) {
    return NextResponse.json({ message: "Choose a template before continuing." }, { status: 400 });
  }

  const project = await chooseTemplateForProject({
    guestToken,
    templateSlug
  });

  if (!project) {
    return NextResponse.json({ message: "Project was not found." }, { status: 404 });
  }

  return NextResponse.redirect(new URL(`/project/${guestToken}/editor`, request.url), 303);
}
