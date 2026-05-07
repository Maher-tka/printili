import { NextResponse } from "next/server";
import { updateProjectTextValue } from "@/lib/project-store";

export const runtime = "nodejs";

type TextRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function PATCH(request: Request, { params }: TextRouteProps) {
  const { guestToken } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const fieldKey = typeof body.fieldKey === "string" ? body.fieldKey.trim() : "";
  const value = typeof body.value === "string" ? body.value : "";

  if (!fieldKey) {
    return NextResponse.json({ message: "Choose a text field before saving." }, { status: 400 });
  }

  const project = await updateProjectTextValue({
    guestToken,
    fieldKey,
    value: value.slice(0, 500)
  });

  if (!project) {
    return NextResponse.json({ message: "Project text field was not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
