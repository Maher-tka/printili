import { describe, expect, it } from "vitest";
import { getTemplateQualityReport } from "@/lib/template-quality";
import type { TemplateEditorLayout, TemplateSeed } from "@/types/templates";

const readyTemplate: TemplateSeed = {
  id: "ready",
  slug: "ready-template",
  name: "Ready template",
  categoryId: "baby",
  productType: "poster",
  minPhotos: 2,
  maxPhotos: 2,
  preferredPortraitCount: 2,
  preferredLandscapeCount: 0,
  preferredSquareCount: 0,
  sheetSize: "A4",
  orientation: "portrait",
  supportedOrientations: ["portrait"],
  hasCutGuides: false,
  safeMarginMm: 8,
  bleedMm: 3,
  dpi: 300,
  tags: [],
  isFeatured: false,
  description: "Ready",
  priceLabel: "From 30 TND",
  bestFor: [],
  printNotes: [],
  previewImage: "/ready.jpg",
  previewAlt: "Ready template",
  seoTitle: "Ready",
  seoDescription: "Ready"
};

const readyLayout: TemplateEditorLayout = {
  slots: [
    {
      id: "slot-1",
      x: 0,
      y: 0,
      width: 0.4,
      height: 0.4,
      shape: "rect",
      role: "hero",
      zIndex: 1,
      borderRadius: 0,
      allowBlurFill: true,
      allowSmartCrop: true
    },
    {
      id: "slot-2",
      x: 0.5,
      y: 0,
      width: 0.4,
      height: 0.4,
      shape: "rect",
      role: "supporting",
      zIndex: 2,
      borderRadius: 0,
      allowBlurFill: true,
      allowSmartCrop: true
    }
  ],
  textFields: []
};

describe("getTemplateQualityReport", () => {
  it("marks complete templates as ready", () => {
    expect(getTemplateQualityReport(readyTemplate, readyLayout)).toEqual({
      score: 100,
      level: "ready",
      slotCount: 2,
      issues: []
    });
  });

  it("surfaces publishing and print-readiness problems", () => {
    const report = getTemplateQualityReport(
      {
        ...readyTemplate,
        dpi: 240,
        bleedMm: 0,
        safeMarginMm: 4,
        priceLabel: undefined
      },
      {
        slots: [],
        textFields: []
      }
    );

    expect(report.level).toBe("needs_work");
    expect(report.score).toBe(5);
    expect(report.issues.map((issue) => issue.id)).toEqual([
      "missing_slots",
      "low_dpi",
      "low_bleed",
      "tight_safe_margin",
      "missing_price"
    ]);
  });

  it("warns when the slot count disagrees with the public photo range", () => {
    const report = getTemplateQualityReport(readyTemplate, {
      ...readyLayout,
      slots: readyLayout.slots.slice(0, 1)
    });

    expect(report.level).toBe("review");
    expect(report.issues.map((issue) => issue.id)).toEqual(["slot_count_mismatch"]);
  });
});
