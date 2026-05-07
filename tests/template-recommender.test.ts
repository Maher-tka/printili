import { describe, expect, it } from "vitest";
import { featuredTemplates } from "../data/seed-templates";
import { PhotoOrientation } from "../lib/generated/prisma/client";
import { countPhotoOrientations, recommendTemplates } from "../lib/template-recommender";

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
    expect(recommendation.reasons).toContain("Matches the selected gift category.");
  });

  it("keeps near-fit templates when they can adapt", () => {
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
