import type {
  ImplementedFitMode,
  ProjectPlacementSummary,
  UploadedProjectPhoto
} from "@/lib/project-store";
import type { TemplateSlotSeed } from "@/types/templates";

type SmartPhotoPlacement = Pick<
  ProjectPlacementSummary,
  "fitMode" | "zoom" | "offsetX" | "offsetY" | "rotation" | "focusX" | "focusY" | "blurBackground"
>;

export type FaceFocusPoint = {
  focusX: number;
  focusY: number;
  confidence?: number;
  faceCount?: number;
  faceSpreadX?: number;
};

const polaroidTemplateSlug = "a4-9-polaroid-cut-sheet";
const autoRotateImprovementThreshold = Math.log(1.28);
const closeRatioThreshold = Math.log(1.18);
const strongMismatchThreshold = Math.log(2.05);

type FaceDetectorResult = {
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type FaceDetectorConstructor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => {
  detect: (source: HTMLImageElement) => Promise<FaceDetectorResult[]>;
};

export function calculateSmartPhotoPlacement({
  faceFocus,
  photo,
  slot,
  templateSlug
}: {
  faceFocus?: FaceFocusPoint | null;
  photo: Pick<UploadedProjectPhoto, "aspectRatio" | "heightPx" | "widthPx">;
  slot: TemplateSlotSeed;
  templateSlug: string;
}): SmartPhotoPlacement {
  const frameAspectRatio = getSlotTargetAspectRatio(slot, templateSlug);
  const photoAspectRatio = getPhotoAspectRatio(photo);
  const shouldRotate = shouldAutoRotatePhoto({
    frameAspectRatio,
    faceFocus,
    photoAspectRatio,
    templateSlug
  });
  const fittedPhotoAspectRatio = shouldRotate ? 1 / photoAspectRatio : photoAspectRatio;
  const ratioDistance = Math.abs(Math.log(fittedPhotoAspectRatio / frameAspectRatio));
  const cropPressure = clamp(ratioDistance / Math.log(3), 0, 1);
  const faceSafeFocus = faceFocus ?? getFallbackFocus({ fittedPhotoAspectRatio, frameAspectRatio });
  const fitMode = chooseSmartFitMode({
    faceFocus,
    ratioDistance,
    slot
  });

  return {
    fitMode,
    zoom: fitMode === "contain" || fitMode === "contain_blur" ? 1 : round(1 + cropPressure * 0.12),
    offsetX: 0,
    offsetY: 0,
    rotation: shouldRotate ? 90 : 0,
    focusX: faceSafeFocus.focusX,
    focusY: faceSafeFocus.focusY,
    blurBackground: fitMode === "contain_blur"
  };
}

export function shouldAutoRotatePhoto({
  faceFocus,
  frameAspectRatio,
  photoAspectRatio,
  templateSlug
}: {
  faceFocus?: FaceFocusPoint | null;
  frameAspectRatio: number;
  photoAspectRatio: number;
  templateSlug?: string;
}) {
  if (!isFinitePositive(frameAspectRatio) || !isFinitePositive(photoAspectRatio)) {
    return false;
  }

  const isPortraitFrame = frameAspectRatio < 0.95;
  const isLandscapeFrame = frameAspectRatio > 1.05;
  const isPortraitPhoto = photoAspectRatio < 0.95;
  const isLandscapePhoto = photoAspectRatio > 1.05;
  const hasDetectedPeople = (faceFocus?.faceCount ?? 0) > 0;

  if (
    templateSlug === polaroidTemplateSlug &&
    ((isPortraitFrame && isLandscapePhoto) || (isLandscapeFrame && isPortraitPhoto))
  ) {
    return false;
  }

  if (hasDetectedPeople && isLandscapePhoto) {
    return false;
  }

  const normalError = Math.abs(Math.log(photoAspectRatio / frameAspectRatio));
  const rotatedError = Math.abs(Math.log(1 / photoAspectRatio / frameAspectRatio));
  const improvement = normalError - rotatedError;

  return improvement >= autoRotateImprovementThreshold && rotatedError <= normalError * 0.72;
}

export function shouldRepairUnsafePolaroidRotation({
  photo,
  placement,
  slot,
  templateSlug
}: {
  photo: Pick<UploadedProjectPhoto, "aspectRatio" | "heightPx" | "widthPx">;
  placement: Pick<
    ProjectPlacementSummary,
    "blurBackground" | "fitMode" | "focusX" | "focusY" | "offsetX" | "offsetY" | "rotation" | "zoom"
  >;
  slot: TemplateSlotSeed;
  templateSlug: string;
}) {
  if (templateSlug !== polaroidTemplateSlug || Math.abs(placement.rotation) < 88) {
    return false;
  }

  const looksLikeOldGeneratedRotation =
    placement.fitMode === "cover" &&
    placement.blurBackground === false &&
    Math.abs(placement.offsetX) < 0.001 &&
    Math.abs(placement.offsetY) < 0.001 &&
    Math.abs(placement.focusX - 50) < 0.001 &&
    Math.abs(placement.focusY - 50) < 0.001 &&
    placement.zoom >= 1 &&
    placement.zoom <= 1.14;

  if (!looksLikeOldGeneratedRotation) {
    return false;
  }

  const frameAspectRatio = getSlotTargetAspectRatio(slot, templateSlug);
  const photoAspectRatio = getPhotoAspectRatio(photo);

  return (
    (frameAspectRatio < 0.95 && photoAspectRatio > 1.05) ||
    (frameAspectRatio > 1.05 && photoAspectRatio < 0.95)
  );
}

export function getSlotTargetAspectRatio(slot: TemplateSlotSeed, templateSlug: string) {
  if (templateSlug === polaroidTemplateSlug) {
    return (slot.width * 0.88) / (slot.height * 0.76);
  }

  return slot.width / slot.height;
}

export function isNeutralPlacement(placement: ProjectPlacementSummary) {
  return (
    placement.fitMode === "cover" &&
    placement.zoom === 1 &&
    placement.offsetX === 0 &&
    placement.offsetY === 0 &&
    placement.rotation === 0 &&
    placement.focusX === 50 &&
    placement.focusY === 50 &&
    placement.blurBackground === false
  );
}

export async function detectFaceFocusFromImageUrl(imageUrl: string): Promise<FaceFocusPoint | null> {
  const detectorConstructor = (window as Window & { FaceDetector?: FaceDetectorConstructor })
    .FaceDetector;

  if (!detectorConstructor) {
    return null;
  }

  try {
    const image = await loadImage(imageUrl);
    const detector = new detectorConstructor({ fastMode: true, maxDetectedFaces: 4 });
    const faces = await detector.detect(image);
    const validFaces = faces
      .filter((face) => face.boundingBox.width > 0 && face.boundingBox.height > 0)

    if (validFaces.length === 0) {
      return null;
    }

    const groupBounds = validFaces.reduce(
      (bounds, face) => ({
        left: Math.min(bounds.left, face.boundingBox.x),
        top: Math.min(bounds.top, face.boundingBox.y),
        right: Math.max(bounds.right, face.boundingBox.x + face.boundingBox.width),
        bottom: Math.max(bounds.bottom, face.boundingBox.y + face.boundingBox.height)
      }),
      {
        left: Number.POSITIVE_INFINITY,
        top: Number.POSITIVE_INFINITY,
        right: 0,
        bottom: 0
      }
    );
    const groupWidth = groupBounds.right - groupBounds.left;

    return {
      focusX: round(clamp(((groupBounds.left + groupWidth / 2) / image.naturalWidth) * 100, 0, 100)),
      focusY: round(clamp(((groupBounds.top + (groupBounds.bottom - groupBounds.top) * 0.28) / image.naturalHeight) * 100, 0, 100)),
      confidence: 1,
      faceCount: validFaces.length,
      faceSpreadX: round(clamp((groupWidth / image.naturalWidth) * 100, 0, 100))
    };
  } catch {
    return null;
  }
}

function chooseSmartFitMode({
  faceFocus,
  ratioDistance,
  slot
}: {
  faceFocus?: FaceFocusPoint | null;
  ratioDistance: number;
  slot: TemplateSlotSeed;
}): ImplementedFitMode {
  if (hasEdgeSensitiveFaceFocus(faceFocus) && ratioDistance > closeRatioThreshold) {
    return slot.allowBlurFill === false
      ? slot.allowSmartCrop === false
        ? "cover"
        : "smart_crop"
      : "contain_blur";
  }

  if (ratioDistance >= strongMismatchThreshold && slot.allowBlurFill !== false) {
    return "contain_blur";
  }

  if (ratioDistance <= closeRatioThreshold) {
    return "cover";
  }

  return slot.allowSmartCrop === false ? "cover" : "smart_crop";
}

function hasEdgeSensitiveFaceFocus(faceFocus?: FaceFocusPoint | null) {
  if (!faceFocus || (faceFocus.faceCount ?? 0) === 0) {
    return false;
  }

  return (
    faceFocus.focusX < 24 ||
    faceFocus.focusX > 76 ||
    faceFocus.focusY < 22 ||
    faceFocus.focusY > 78 ||
    (faceFocus.faceSpreadX ?? 0) > 58
  );
}

function getFallbackFocus({
  fittedPhotoAspectRatio,
  frameAspectRatio
}: {
  fittedPhotoAspectRatio: number;
  frameAspectRatio: number;
}): FaceFocusPoint {
  if (fittedPhotoAspectRatio < frameAspectRatio * 0.78) {
    return {
      focusX: 50,
      focusY: 42
    };
  }

  return {
    focusX: 50,
    focusY: 50
  };
}

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Face detection image load failed."));
    image.src = imageUrl;
  });
}

function getPhotoAspectRatio(
  photo: Pick<UploadedProjectPhoto, "aspectRatio" | "heightPx" | "widthPx">
) {
  const aspectRatio = Number(photo.aspectRatio);

  if (isFinitePositive(aspectRatio)) {
    return aspectRatio;
  }

  if (!photo.widthPx || !photo.heightPx || photo.heightPx <= 0) {
    return 1;
  }

  return photo.widthPx / photo.heightPx;
}

function isFinitePositive(value: number) {
  return Number.isFinite(value) && value > 0;
}

function round(value: number) {
  return Number(value.toFixed(3));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
