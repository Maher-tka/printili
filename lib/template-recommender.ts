import { PhotoOrientation } from "@/lib/generated/prisma/client";
import {
  type RecommendationContext,
  shouldIncludeTemplateForRecommendation
} from "@/lib/templates";
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
  recommendationContext?: RecommendationContext;
};

export type TemplateRecommendation = {
  template: TemplateSeed;
  matchScore: number;
  label: RecommendationLabel;
  reasons: string[];
  missingPhotoCount: number;
  extraPhotoCount: number;
  canUse: boolean;
};

export type RecommendationLabel =
  | "Best Fit"
  | "Most Popular"
  | "Large Poster"
  | "Easy to Cut"
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
  limit = 6,
  recommendationContext = "generic_photo_upload"
}: TemplateRecommendationInput): TemplateRecommendation[] {
  return templates
    .filter((template) => shouldIncludeTemplateForRecommendation(template, recommendationContext))
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
    .filter((recommendation) => recommendation.matchScore > 0)
    .sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }

      if (a.canUse !== b.canUse) {
        return a.canUse ? -1 : 1;
      }

      return a.template.name.localeCompare(b.template.name);
    })
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
    reasons.push("Made for this occasion.");
  }

  const countFit = getPhotoCountFit(template, photoCount);
  score += countFit.score;
  reasons.push(countFit.reason);

  if (sheetSize && sheetSize !== "custom" && template.sheetSize === sheetSize) {
    score += 25;
    reasons.push(`Ready for ${sheetSize} printing.`);
  }

  const orientationScore = getOrientationScore(template, orientationCounts);
  score += orientationScore.score;
  reasons.push(orientationScore.reason);

  if (productType) {
    if (template.productType === productType) {
      score += 10;
      reasons.push("Matches the product you selected.");
    }
  } else if (template.productType === "poster") {
    score += 4;
    reasons.push("Good for a printed gift poster.");
  }

  if (template.isFeatured) {
    score += 5;
    reasons.push("Customer-friendly design.");
  }

  if (template.hasCutGuides) {
    score += 3;
    reasons.push("Great for cutting after print.");
  }

  const canUse = countFit.canUse && countFit.missingPhotoCount === 0;
  const matchScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    template,
    matchScore,
    label: getRecommendationLabel(template, matchScore, countFit.needsMorePhotos),
    reasons: Array.from(new Set(reasons)).slice(0, 4),
    missingPhotoCount: countFit.missingPhotoCount,
    extraPhotoCount: countFit.extraPhotoCount,
    canUse
  };
}

function getPhotoCountFit(template: TemplateSeed, photoCount: number) {
  if (photoCount >= template.minPhotos && photoCount <= template.maxPhotos) {
    return {
      score: 30,
      reason: "Perfect number of photos.",
      canUse: true,
      needsMorePhotos: false,
      missingPhotoCount: 0,
      extraPhotoCount: 0
    };
  }

  if (photoCount < template.minPhotos) {
    const missing = template.minPhotos - photoCount;

    return {
      score: missing <= adaptableGap ? 8 : 0,
      reason: `Add ${missing} more photo${missing === 1 ? "" : "s"} to use this design.`,
      canUse: missing <= adaptableGap,
      needsMorePhotos: true,
      missingPhotoCount: missing,
      extraPhotoCount: 0
    };
  }

  const extra = photoCount - template.maxPhotos;

  return {
    score: extra <= adaptableGap ? 12 : 0,
    reason:
      extra <= adaptableGap
        ? "We can use your strongest photos and keep extras for later."
        : "This design has fewer photo spots than your upload.",
    canUse: extra <= adaptableGap,
    needsMorePhotos: false,
    missingPhotoCount: 0,
    extraPhotoCount: extra
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
      reason: "Flexible for different photo shapes."
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
        ? "Good for your mix of vertical and horizontal photos."
        : "May need small crop adjustments."
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
    return "Easy to Cut";
  }

  if (template.sheetSize === "A3") {
    return "Large Poster";
  }

  if (template.isFeatured && matchScore >= 70) {
    return "Most Popular";
  }

  if (matchScore >= 75) {
    return "Best Fit";
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
