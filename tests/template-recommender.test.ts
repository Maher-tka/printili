import { describe, expect, it } from "vitest";
import { featuredTemplates } from "@/data/seed-templates";
import { PhotoOrientation } from "@/lib/generated/prisma/client";
import { countPhotoOrientations, recommendTemplates } from "@/lib/template-recommender";

describe("template recommender", () => {
  it("scores exact cut-sheet matches highly", () => {
    const [recommendation] = recommendTemplates({
      category: "cut_sheet",
      sheetSize: "A4",
      photoCount: 9,
      orientationCounts: {
        portrait: 9,
        landscape: 0,
        square: 0
      },
      productType: "cut_sheet",
      templates: featuredTemplates
    });

    expect(recommendation.template.slug).toBe("a4-9-polaroid-cut-sheet");
    expect(recommendation.matchScore).toBeGreaterThanOrEqual(90);
    expect(recommendation.reasons).toContain("Made for this occasion.");
  });

  it("keeps near-fit templates visible when they need only a few more photos", () => {
    const recommendations = recommendTemplates({
      category: "baby",
      sheetSize: "A4",
      photoCount: 3,
      orientationCounts: {
        portrait: 3,
        landscape: 0,
        square: 0
      },
      templates: featuredTemplates
    });

    expect(recommendations.some((item) => item.label === "Needs More Photos")).toBe(true);
  });

  it("excludes graduation products from generic photo upload recommendations", () => {
    const recommendations = recommendTemplates({
      category: "custom",
      photoCount: 1,
      orientationCounts: {
        portrait: 1,
        landscape: 0,
        square: 0
      },
      templates: featuredTemplates
    });

    expect(recommendations.map((recommendation) => recommendation.template.slug)).not.toContain(
      "graduation-water-bottle-label"
    );
    expect(recommendations.map((recommendation) => recommendation.template.slug)).not.toContain(
      "graduation-round-juice-sticker"
    );
  });

  it("excludes explicit-intent templates even when the photo count is a perfect fit", () => {
    const recommendations = recommendTemplates({
      category: "graduation",
      photoCount: 1,
      orientationCounts: {
        portrait: 1,
        landscape: 0,
        square: 0
      },
      templates: featuredTemplates
    });

    expect(recommendations.map((recommendation) => recommendation.template.slug)).not.toContain(
      "graduation-water-bottle-label"
    );
  });

  it("allows graduation products when the customer has explicit product intent", () => {
    const recommendations = recommendTemplates({
      category: "graduation",
      photoCount: 1,
      orientationCounts: {
        portrait: 1,
        landscape: 0,
        square: 0
      },
      templates: featuredTemplates,
      recommendationContext: "explicit_product_intent"
    });

    const bottleLabel = recommendations.find(
      (recommendation) => recommendation.template.slug === "graduation-water-bottle-label"
    );

    expect(bottleLabel?.canUse).toBe(true);
    expect(bottleLabel?.reasons).toContain("Made for this occasion.");
    expect(bottleLabel?.reasons).toContain("Perfect number of photos.");
  });

  it("keeps missing-photo designs visible but blocked with plain language", () => {
    const recommendations = recommendTemplates({
      category: "cut_sheet",
      photoCount: 1,
      orientationCounts: {
        portrait: 1,
        landscape: 0,
        square: 0
      },
      templates: featuredTemplates
    });

    const polaroidSheet = recommendations.find(
      (recommendation) => recommendation.template.slug === "a4-9-polaroid-cut-sheet"
    );

    expect(polaroidSheet?.canUse).toBe(false);
    expect(polaroidSheet?.label).toBe("Needs More Photos");
    expect(polaroidSheet?.missingPhotoCount).toBe(8);
    expect(polaroidSheet?.reasons).toContain("Add 8 more photos to use this design.");
  });

  it("summarizes photo orientations for recommendation input", () => {
    expect(
      countPhotoOrientations([
        { orientation: PhotoOrientation.PORTRAIT },
        { orientation: PhotoOrientation.LANDSCAPE },
        { orientation: PhotoOrientation.SQUARE },
        { orientation: null }
      ])
    ).toEqual({
      portrait: 1,
      landscape: 1,
      square: 1
    });
  });
});
