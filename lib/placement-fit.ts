import type {
  EditableFitMode,
  ProjectPlacementSummary,
  UploadedProjectPhoto
} from "@/lib/project-store";
import type { TemplateSlotSeed } from "@/types/templates";

export type PlacementControls = Pick<
  ProjectPlacementSummary,
  "zoom" | "offsetX" | "offsetY" | "rotation"
>;

const minZoom = 1;
const maxZoom = 2.8;
const minOffset = -80;
const maxOffset = 80;
const minRotation = -45;
const maxRotation = 45;

export function getEffectivePlacementControls({
  placement,
  photo,
  slot,
  targetAspectRatio
}: {
  placement: ProjectPlacementSummary;
  photo?: UploadedProjectPhoto;
  slot: TemplateSlotSeed;
  targetAspectRatio?: number;
}): PlacementControls {
  const baseControls = normalizePlacementControls(placement);

  if (placement.fitMode !== "smart_crop" || slot.allowSmartCrop === false) {
    return baseControls;
  }

  const suggestion = getSmartCropSuggestion({
    photo,
    slot,
    targetAspectRatio
  });

  return {
    zoom: roundControl(clamp(baseControls.zoom * suggestion.zoom, minZoom, maxZoom)),
    offsetX: roundControl(clamp(baseControls.offsetX + suggestion.offsetX, minOffset, maxOffset)),
    offsetY: roundControl(clamp(baseControls.offsetY + suggestion.offsetY, minOffset, maxOffset)),
    rotation: baseControls.rotation
  };
}

export function getSmartCropSuggestion({
  photo,
  slot,
  targetAspectRatio
}: {
  photo?: Pick<UploadedProjectPhoto, "aspectRatio" | "widthPx" | "heightPx">;
  slot: Pick<
    TemplateSlotSeed,
    "allowSmartCrop" | "height" | "preferredOrientation" | "role" | "shape" | "width"
  >;
  targetAspectRatio?: number;
}): PlacementControls {
  if (slot.allowSmartCrop === false) {
    return getNeutralControls();
  }

  const photoAspectRatio = getPhotoAspectRatio(photo);
  const slotAspectRatio = getFinitePositive(targetAspectRatio) ?? getSlotAspectRatio(slot);

  if (!photoAspectRatio || !slotAspectRatio) {
    return getNeutralControls();
  }

  const cropRatio = photoAspectRatio / slotAspectRatio;
  const cropPressure = clamp(Math.abs(Math.log(cropRatio)) / Math.log(3), 0, 1);
  const isPhotoTallerThanSlot = cropRatio < 0.92;
  const isPhotoWiderThanSlot = cropRatio > 1.08;
  const shapeZoom = slot.shape === "rect" ? 1 : 1.035;
  const roleZoom = slot.role === "thumbnail" || slot.role === "shape_tile" ? 0.035 : 0.02;
  const zoom = clamp(Math.max(shapeZoom, 1 + cropPressure * roleZoom), 1, 1.12);

  if (isPhotoTallerThanSlot) {
    const roleBias = slot.role === "hero" ? 15 : slot.role === "thumbnail" ? 10 : 12;
    const orientationBias = slot.preferredOrientation === "landscape" ? 5 : 0;

    return {
      zoom: roundControl(zoom),
      offsetX: 0,
      offsetY: roundControl((roleBias + orientationBias) * cropPressure),
      rotation: 0
    };
  }

  if (isPhotoWiderThanSlot && slot.preferredOrientation === "portrait") {
    return {
      zoom: roundControl(zoom),
      offsetX: 0,
      offsetY: 0,
      rotation: 0
    };
  }

  return {
    zoom: roundControl(zoom),
    offsetX: 0,
    offsetY: 0,
    rotation: 0
  };
}

export function normalizeEditableFitModeForSlot(
  fitMode: EditableFitMode,
  slot?: Pick<TemplateSlotSeed, "allowBlurFill" | "allowSmartCrop">
): EditableFitMode {
  if (fitMode === "contain_blur") {
    return slot?.allowBlurFill === false ? "cover" : "contain_blur";
  }

  if (fitMode === "smart_crop") {
    return slot?.allowSmartCrop === false ? "cover" : "smart_crop";
  }

  return "cover";
}

function normalizePlacementControls(placement: PlacementControls): PlacementControls {
  return {
    zoom: roundControl(clamp(placement.zoom, minZoom, maxZoom)),
    offsetX: roundControl(clamp(placement.offsetX, minOffset, maxOffset)),
    offsetY: roundControl(clamp(placement.offsetY, minOffset, maxOffset)),
    rotation: roundControl(clamp(placement.rotation, minRotation, maxRotation))
  };
}

function getNeutralControls(): PlacementControls {
  return {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0
  };
}

function getPhotoAspectRatio(
  photo?: Pick<UploadedProjectPhoto, "aspectRatio" | "widthPx" | "heightPx">
) {
  return getFinitePositive(photo?.aspectRatio) ?? getRatio(photo?.widthPx, photo?.heightPx);
}

function getSlotAspectRatio(slot: Pick<TemplateSlotSeed, "height" | "width">) {
  return getRatio(slot.width, slot.height);
}

function getRatio(width: number | null | undefined, height: number | null | undefined) {
  if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height) || height <= 0) {
    return null;
  }

  return width / height;
}

function getFinitePositive(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function roundControl(value: number) {
  return Number(value.toFixed(3));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
