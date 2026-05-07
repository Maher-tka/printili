import { PhotoOrientation } from "@/lib/generated/prisma/client";
import type { ProductType, SheetSize, TemplateCategoryId, TemplateSeed } from "@/types/templates";

export type TemplateRecommendationInput = {
  category: TemplateCategoryId;
  sheetSize?: SheetSize;
  photoCount: number;
  orientationCounts: {
    portrait: number;
    landscape: number;
    square: number;
  };
  productType?: ProductType;
  templates: TemplateSeed[];
  limit?: number;
};

export type TemplateRecommendation = {
  template: TemplateSeed;
  matchScore: number;
  label: RecommendationLabel;
  reasons: string[];
  canUse: boolean;
};

export type RecommendationLabel =
  | "Best Match"
  | "Most Popular"
  | "Best for A3"
  | "Cut-Ready"
  | "Needs More Photos"
  | "Good Option";

const adaptableGap = 3;

export function recommendTemplates({
  category,
  sheetSize,
  photoCount,
  orientationCounts,
  productType,
  templates,
  limit = 6
}: TemplateRecommendationInput): TemplateRecommendation[] {
  return templates
    .map((template) =>
      scoreTemplate({
        template,
        category,
        sheetSize,
        photoCount,
        orientationCounts,
        productType
      })
    )
    .filter((recommendation) => recommendation.canUse)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, Math.max(3, Math.min(limit, 6)));
}

function scoreTemplate({
  template,
  category,
  sheetSize,
  photoCount,
  orientationCounts,
  productType
}: Omit<TemplateRecommendationInput, "templates" | "limit"> & { template: TemplateSeed }) {
  const reasons: string[] = [];
  let score = 0;

  if (template.categoryId === category) {
    score += 30;
    reasons.push("Matches the selected gift category.");
  }

  const countFit = getPhotoCountFit(template, photoCount);
  score += countFit.score;
  reasons.push(countFit.reason);

  if (sheetSize && sheetSize !== "custom" && template.sheetSize === sheetSize) {
    score += 25;
    reasons.push(`Built for ${sheetSize} printing.`);
  }

  const orientationScore = getOrientationScore(template, orientationCounts);
  score += orientationScore.score;
  reasons.push(orientationScore.reason);

  if (productType) {
    if (template.productType === productType) {
      score += 10;
      reasons.push("Matches the selected product type.");
    }
  } else if (template.productType === "poster") {
    score += 4;
    reasons.push("Poster format works well as a first recommendation.");
  }

  if (template.isFeatured) {
    score += 5;
    reasons.push("Featured design with strong customer appeal.");
  }

  if (template.hasCutGuides) {
    score += 3;
    reasons.push("Cut-ready with guide lines for finishing.");
  }

  const canUse = countFit.canUse;
  const matchScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    template,
    matchScore,
    label: getRecommendationLabel(template, matchScore, countFit.needsMorePhotos),
    reasons: Array.from(new Set(reasons)).slice(0, 4),
    canUse
  };
}

function getPhotoCountFit(template: TemplateSeed, photoCount: number) {
  if (photoCount >= template.minPhotos && photoCount <= template.maxPhotos) {
    return {
      score: 30,
      reason: "Photo count fits this template.",
      canUse: true,
      needsMorePhotos: false
    };
  }

  if (photoCount < template.minPhotos) {
    const missing = template.minPhotos - photoCount;

    return {
      score: missing <= adaptableGap ? 8 : 0,
      reason: `Needs ${missing} more photo${missing === 1 ? "" : "s"} for the best layout.`,
      canUse: missing <= adaptableGap,
      needsMorePhotos: true
    };
  }

  const extra = photoCount - template.maxPhotos;

  return {
    score: extra <= adaptableGap ? 12 : 0,
    reason:
      extra <= adaptableGap
        ? "Can adapt by using the strongest uploaded photos."
        : "Too many photos for this layout without a different design.",
    canUse: extra <= adaptableGap,
    needsMorePhotos: false
  };
}

function getOrientationScore(
  template: TemplateSeed,
  orientationCounts: TemplateRecommendationInput["orientationCounts"]
) {
  const preferredTotal =
    template.preferredPortraitCount +
    template.preferredLandscapeCount +
    template.preferredSquareCount;

  if (preferredTotal === 0) {
    return {
      score: 8,
      reason: "Flexible orientation mix."
    };
  }

  const matched =
    Math.min(orientationCounts.portrait, template.preferredPortraitCount) +
    Math.min(orientationCounts.landscape, template.preferredLandscapeCount) +
    Math.min(orientationCounts.square, template.preferredSquareCount);
  const score = Math.round((matched / preferredTotal) * 15);

  return {
    score,
    reason:
      score >= 10
        ? "Uploaded photo orientations suit the layout."
        : "Orientation mix may need a little manual adjustment."
  };
}

function getRecommendationLabel(
  template: TemplateSeed,
  matchScore: number,
  needsMorePhotos: boolean
): RecommendationLabel {
  if (needsMorePhotos) {
    return "Needs More Photos";
  }

  if (template.hasCutGuides) {
    return "Cut-Ready";
  }

  if (template.sheetSize === "A3") {
    return "Best for A3";
  }

  if (template.isFeatured && matchScore >= 70) {
    return "Most Popular";
  }

  if (matchScore >= 75) {
    return "Best Match";
  }

  return "Good Option";
}

export function countPhotoOrientations(photos: Array<{ orientation: PhotoOrientation | null }>) {
  return {
    portrait: photos.filter((photo) => photo.orientation === PhotoOrientation.PORTRAIT).length,
    landscape: photos.filter((photo) => photo.orientation === PhotoOrientation.LANDSCAPE).length,
    square: photos.filter((photo) => photo.orientation === PhotoOrientation.SQUARE).length
  };
}
