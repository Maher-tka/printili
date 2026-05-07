import { NextResponse } from "next/server";
import {
  editableFitModes,
  updateProjectPlacement,
  type EditableFitMode
} from "@/lib/project-store";

export const runtime = "nodejs";

type PlacementRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function PATCH(request: Request, { params }: PlacementRouteProps) {
  const { guestToken } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const fitMode = typeof body.fitMode === "string" ? body.fitMode : "cover";

  if (!editableFitModes.includes(fitMode as EditableFitMode)) {
    return NextResponse.json({ message: "Choose a valid fit mode." }, { status: 400 });
  }

  const placementId = typeof body.placementId === "string" ? body.placementId : undefined;
  const slotId = typeof body.slotId === "string" ? body.slotId : undefined;
  const photoId = typeof body.photoId === "string" ? body.photoId : undefined;

  if (!placementId && !slotId) {
    return NextResponse.json({ message: "Choose a photo slot before saving." }, { status: 400 });
  }

  const project = await updateProjectPlacement({
    guestToken,
    placementId,
    slotId,
    photoId,
    zoom: normalizeNumber(body.zoom, 1, 0.5, 2.8),
    offsetX: normalizeNumber(body.offsetX, 0, -80, 80),
    offsetY: normalizeNumber(body.offsetY, 0, -80, 80),
    rotation: normalizeNumber(body.rotation, 0, -45, 45),
    fitMode: fitMode as EditableFitMode
  });

  if (!project) {
    return NextResponse.json({ message: "Project placement was not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numeric));
}
