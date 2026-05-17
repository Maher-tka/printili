import type { TemplateEditorLayout, TemplateSeed } from "@/types/templates";

export type TemplateQualityIssue = {
  id:
    | "missing_slots"
    | "slot_count_mismatch"
    | "low_dpi"
    | "low_bleed"
    | "tight_safe_margin"
    | "missing_price";
  label: string;
  tone: "warning" | "danger";
};

export type TemplateQualityReport = {
  score: number;
  level: "ready" | "review" | "needs_work";
  slotCount: number;
  issues: TemplateQualityIssue[];
};

export function getTemplateQualityReport(
  template: TemplateSeed,
  layout: TemplateEditorLayout
): TemplateQualityReport {
  const issues: TemplateQualityIssue[] = [];
  let score = 100;

  if (layout.slots.length === 0) {
    issues.push({
      id: "missing_slots",
      label: "No editable photo slots found",
      tone: "danger"
    });
    score -= 35;
  }

  if (
    layout.slots.length > 0 &&
    (layout.slots.length < template.minPhotos || layout.slots.length > template.maxPhotos)
  ) {
    issues.push({
      id: "slot_count_mismatch",
      label: "Slot count does not match the public photo range",
      tone: "warning"
    });
    score -= 15;
  }

  if (template.dpi < 300) {
    issues.push({
      id: "low_dpi",
      label: "Output density is below 300 DPI",
      tone: "danger"
    });
    score -= 25;
  }

  if (template.productType !== "cut_sheet" && template.bleedMm < 3) {
    issues.push({
      id: "low_bleed",
      label: "Poster bleed is below 3 mm",
      tone: "warning"
    });
    score -= 15;
  }

  const recommendedSafeMargin = template.productType === "cut_sheet" ? 5 : 8;

  if (template.safeMarginMm < recommendedSafeMargin) {
    issues.push({
      id: "tight_safe_margin",
      label: `Safe margin is below ${recommendedSafeMargin} mm`,
      tone: "warning"
    });
    score -= 10;
  }

  if (!template.priceLabel) {
    issues.push({
      id: "missing_price",
      label: "Public price is missing",
      tone: "warning"
    });
    score -= 10;
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  const hasDangerIssue = issues.some((issue) => issue.tone === "danger");
  const level =
    hasDangerIssue || normalizedScore < 70
      ? "needs_work"
      : normalizedScore < 100
        ? "review"
        : "ready";

  return {
    score: normalizedScore,
    level,
    slotCount: layout.slots.length,
    issues
  };
}
