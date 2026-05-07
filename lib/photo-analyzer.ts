import sharp from "sharp";
import {
  EstimatedPrintQuality,
  PhotoOrientation,
  type SheetSize
} from "@/lib/generated/prisma/client";

export type PhotoAnalyzerInput = {
  buffer: Buffer;
  fileName: string;
  fileSizeBytes: number;
  sheetSize: SheetSize;
};

export type PhotoAnalysis = {
  widthPx: number | null;
  heightPx: number | null;
  aspectRatio: number | null;
  orientation: PhotoOrientation | null;
  fileSizeBytes: number;
  estimatedPrintQuality: EstimatedPrintQuality;
  brightnessScore: number | null;
  sharpnessScore: number | null;
  qualityWarnings: string[];
};

type PhotoSummaryInput = Pick<PhotoAnalysis, "orientation" | "qualityWarnings">;

const verySmallFileBytes = 150 * 1024;

const printTargets: Record<
  Extract<SheetSize, "A4" | "A3">,
  { shortSide: number; longSide: number }
> = {
  A4: { shortSide: 2480, longSide: 3508 },
  A3: { shortSide: 3508, longSide: 4961 }
};

export async function analyzePhoto({
  buffer,
  fileName,
  fileSizeBytes,
  sheetSize
}: PhotoAnalyzerInput): Promise<PhotoAnalysis> {
  try {
    const image = sharp(buffer, { failOn: "none" });
    const metadata = await image.metadata();
    const widthPx = metadata.width ?? null;
    const heightPx = metadata.height ?? null;
    const aspectRatio = calculateAspectRatio(widthPx, heightPx);
    const orientation = calculateOrientation(widthPx, heightPx);
    const stats = await sharp(buffer, { failOn: "none" })
      .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
      .stats();
    const brightnessScore = calculateBrightnessScore(stats.channels);
    const sharpnessScore = normalizeSharpnessScore(stats.sharpness);
    const estimatedPrintQuality = estimatePrintQuality(widthPx, heightPx, sheetSize);
    const qualityWarnings = getQualityWarnings({
      widthPx,
      heightPx,
      fileSizeBytes,
      sheetSize,
      estimatedPrintQuality,
      brightnessScore,
      sharpnessScore
    });

    return {
      widthPx,
      heightPx,
      aspectRatio,
      orientation,
      fileSizeBytes,
      estimatedPrintQuality,
      brightnessScore,
      sharpnessScore,
      qualityWarnings
    };
  } catch {
    throw new Error(`${fileName} could not be read as a valid image. Please choose another photo.`);
  }
}

export function calculateOrientation(widthPx: number | null, heightPx: number | null) {
  if (!widthPx || !heightPx) {
    return null;
  }

  if (heightPx > widthPx * 1.1) {
    return PhotoOrientation.PORTRAIT;
  }

  if (widthPx > heightPx * 1.1) {
    return PhotoOrientation.LANDSCAPE;
  }

  return PhotoOrientation.SQUARE;
}

export function calculateAspectRatio(widthPx: number | null, heightPx: number | null) {
  return widthPx && heightPx ? Number((widthPx / heightPx).toFixed(4)) : null;
}

export function estimatePrintQuality(
  widthPx: number | null,
  heightPx: number | null,
  sheetSize: SheetSize
) {
  if (!widthPx || !heightPx) {
    return EstimatedPrintQuality.LOW;
  }

  const target = sheetSize === "A3" ? printTargets.A3 : printTargets.A4;
  const shortSide = Math.min(widthPx, heightPx);
  const longSide = Math.max(widthPx, heightPx);

  if (shortSide >= target.shortSide * 0.85 && longSide >= target.longSide * 0.85) {
    return EstimatedPrintQuality.GOOD;
  }

  if (shortSide >= target.shortSide * 0.55 && longSide >= target.longSide * 0.55) {
    return EstimatedPrintQuality.ACCEPTABLE;
  }

  return EstimatedPrintQuality.LOW;
}

export function getQualityWarnings({
  widthPx,
  heightPx,
  fileSizeBytes,
  sheetSize,
  estimatedPrintQuality,
  brightnessScore,
  sharpnessScore
}: {
  widthPx: number | null;
  heightPx: number | null;
  fileSizeBytes: number;
  sheetSize: SheetSize;
  estimatedPrintQuality: EstimatedPrintQuality;
  brightnessScore: number | null;
  sharpnessScore: number | null;
}) {
  const warnings: string[] = [];

  if (!widthPx || !heightPx) {
    warnings.push("This file could not be measured as a valid image.");
    return warnings;
  }

  if (estimatedPrintQuality === EstimatedPrintQuality.LOW) {
    warnings.push(`Resolution may be too low for an important ${sheetSize} print placement.`);
  }

  if (estimatedPrintQuality === EstimatedPrintQuality.ACCEPTABLE) {
    warnings.push("Resolution is acceptable, but may look softer in a large hero photo slot.");
  }

  if (fileSizeBytes < verySmallFileBytes) {
    warnings.push("File size is very small, which can indicate a compressed or low-detail image.");
  }

  if (brightnessScore !== null && brightnessScore < 0.18) {
    warnings.push("Photo may be too dark and could need manual review before printing.");
  }

  if (brightnessScore !== null && brightnessScore > 0.92) {
    warnings.push("Photo may be very bright and could lose detail in print.");
  }

  if (sharpnessScore !== null && sharpnessScore < 0.08) {
    warnings.push("Photo may be soft or blurry and could need manual review.");
  }

  return warnings;
}

export function summarizePhotoAnalysis(photos: PhotoSummaryInput[]) {
  return {
    totalPhotos: photos.length,
    portraitCount: photos.filter((photo) => photo.orientation === PhotoOrientation.PORTRAIT).length,
    landscapeCount: photos.filter((photo) => photo.orientation === PhotoOrientation.LANDSCAPE)
      .length,
    squareCount: photos.filter((photo) => photo.orientation === PhotoOrientation.SQUARE).length,
    qualityWarnings: photos.flatMap((photo, index) =>
      (photo.qualityWarnings ?? []).map((warning) => `Photo ${index + 1}: ${warning}`)
    )
  };
}

function calculateBrightnessScore(channels: sharp.ChannelStats[]) {
  const colorChannels = channels.slice(0, 3);

  if (colorChannels.length === 0) {
    return null;
  }

  const mean =
    colorChannels.reduce((total, channel) => total + channel.mean, 0) / colorChannels.length;

  return Number(clamp(mean / 255).toFixed(4));
}

function normalizeSharpnessScore(sharpness: number) {
  return Number(clamp(sharpness / 100).toFixed(4));
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
