import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      message: "Guest project save placeholder. Magic resume links arrive in Phase 4."
    },
    { status: 501 }
  );
}

export function GET() {
  return NextResponse.json({
    message: "Guest project lookup placeholder for future resume links."
  });
}
