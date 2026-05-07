import { NextResponse } from "next/server";
import { recommendTemplates } from "@/lib/templates";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    data: recommendTemplates({
      photoCount: Number(body.photoCount ?? 0),
      categoryId: body.categoryId,
      orientations: Array.isArray(body.orientations) ? body.orientations : []
    }),
    message: "Deterministic recommendation placeholder for Phase 2."
  });
}

export function GET() {
  return NextResponse.json({
    message: "Post photo metadata here to receive template recommendations in Phase 2."
  });
}
