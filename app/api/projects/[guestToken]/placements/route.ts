import { NextResponse } from "next/server";
import {
  deleteProjectPlacement,
  isImplementedFitMode,
  updateProjectPlacement,
  type ImplementedFitMode
} from "@/lib/project-store";

export const runtime = "nodejs";

type PlacementRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function PATCH(request: Request, { params }: PlacementRouteProps) {
  const { guestToken } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const fitMode = typeof body.fitMode === "string" ? body.fitMode : "cover";

  if (!isImplementedFitMode(fitMode)) {
    return NextResponse.json({ message: "Choose a supported fit mode." }, { status: 400 });
  }

  const placementId = typeof body.placementId === "string" ? body.placementId : undefined;
  const slotId = typeof body.slotId === "string" ? body.slotId : undefined;
  const photoId = typeof body.photoId === "string" ? body.photoId : undefined;

  if (!placementId && !slotId) {
    return NextResponse.json({ message: "Choose a photo slot before saving." }, { status: 400 });
  }

  const normalizedPlacement = normalizePlacementControls(body, fitMode);
  const project = await updateProjectPlacement({
    guestToken,
    placementId,
    slotId,
    photoId,
    zoom: normalizedPlacement.zoom,
    offsetX: normalizedPlacement.offsetX,
    offsetY: normalizedPlacement.offsetY,
    rotation: normalizedPlacement.rotation,
    focusX: normalizedPlacement.focusX,
    focusY: normalizedPlacement.focusY,
    blurBackground: normalizedPlacement.blurBackground,
    fitMode
  });

  if (!project) {
    return NextResponse.json({ message: "Project placement was not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: PlacementRouteProps) {
  const { guestToken } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const placementId = typeof body.placementId === "string" ? body.placementId : undefined;
  const slotId = typeof body.slotId === "string" ? body.slotId : undefined;

  if (!placementId && !slotId) {
    return NextResponse.json({ message: "Choose a photo slot before clearing." }, { status: 400 });
  }

  const project = await deleteProjectPlacement({
    guestToken,
    placementId,
    slotId
  });

  if (!project) {
    return NextResponse.json({ message: "Project placement was not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

function normalizePlacementControls(body: Record<string, unknown>, fitMode: ImplementedFitMode) {
  return {
    zoom: normalizeNumber(body.zoom, 1, 1, 2.8),
    offsetX: normalizeNumber(body.offsetX, 0, -80, 80),
    offsetY: normalizeNumber(body.offsetY, 0, -80, 80),
    rotation: normalizeNumber(body.rotation, 0, -90, 90),
    focusX: normalizeNumber(body.focusX, 50, 0, 100),
    focusY: normalizeNumber(body.focusY, 50, 0, 100),
    blurBackground:
      typeof body.blurBackground === "boolean" ? body.blurBackground : fitMode === "contain_blur"
  };
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numeric));
}
