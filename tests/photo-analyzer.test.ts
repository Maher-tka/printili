import { describe, expect, it } from "vitest";
import { EstimatedPrintQuality, PhotoOrientation, SheetSize } from "../lib/generated/prisma/client";
import {
  calculateAspectRatio,
  calculateOrientation,
  estimatePrintQuality,
  getQualityWarnings,
  summarizePhotoAnalysis
} from "../lib/photo-analyzer";

describe("photo analyzer rules", () => {
  it("classifies orientation with the 1.1 ratio rule", () => {
    expect(calculateOrientation(1000, 1200)).toBe(PhotoOrientation.PORTRAIT);
    expect(calculateOrientation(1200, 1000)).toBe(PhotoOrientation.LANDSCAPE);
    expect(calculateOrientation(1000, 1080)).toBe(PhotoOrientation.SQUARE);
  });

  it("calculates aspect ratio with four decimal precision", () => {
    expect(calculateAspectRatio(3000, 2000)).toBe(1.5);
    expect(calculateAspectRatio(null, 2000)).toBeNull();
  });

  it("estimates print quality by sheet size", () => {
    expect(estimatePrintQuality(3500, 5000, SheetSize.A3)).toBe(EstimatedPrintQuality.GOOD);
    expect(estimatePrintQuality(2400, 3200, SheetSize.A3)).toBe(EstimatedPrintQuality.ACCEPTABLE);
    expect(estimatePrintQuality(900, 1200, SheetSize.A4)).toBe(EstimatedPrintQuality.LOW);
  });

  it("keeps photo warnings focused to one useful issue", () => {
    const warnings = getQualityWarnings({
      widthPx: 900,
      heightPx: 1200,
      fileSizeBytes: 80 * 1024,
      sheetSize: SheetSize.A4,
      estimatedPrintQuality: EstimatedPrintQuality.LOW,
      brightnessScore: 0.5,
      sharpnessScore: 0.5
    });

    expect(warnings).toEqual(["This photo may print softly in a large A4 placement."]);
  });

  it("does not warn for acceptable photos without a serious issue", () => {
    const warnings = getQualityWarnings({
      widthPx: 1800,
      heightPx: 2400,
      fileSizeBytes: 420 * 1024,
      sheetSize: SheetSize.A4,
      estimatedPrintQuality: EstimatedPrintQuality.ACCEPTABLE,
      brightnessScore: 0.5,
      sharpnessScore: 0.16
    });

    expect(warnings).toEqual([]);
  });

  it("summarizes uploaded orientation counts and warnings", () => {
    const summary = summarizePhotoAnalysis([
      {
        orientation: PhotoOrientation.PORTRAIT,
        qualityWarnings: ["Low resolution"]
      },
      {
        orientation: PhotoOrientation.LANDSCAPE,
        qualityWarnings: []
      },
      {
        orientation: PhotoOrientation.SQUARE,
        qualityWarnings: ["Very small file"]
      }
    ]);

    expect(summary).toMatchObject({
      totalPhotos: 3,
      portraitCount: 1,
      landscapeCount: 1,
      squareCount: 1
    });
    expect(summary.qualityWarnings).toEqual([
      "Photo 1: Low resolution",
      "Photo 3: Very small file"
    ]);
  });
});
