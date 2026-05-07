import { NextResponse } from "next/server";
import { featuredTemplates } from "@/data/seed-templates";

export function GET() {
  return NextResponse.json({
    data: featuredTemplates,
    message: "Seed template library placeholder for Phase 2."
  });
}
