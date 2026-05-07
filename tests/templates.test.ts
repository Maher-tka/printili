import { describe, expect, it } from "vitest";
import { getTemplatesByCategory, recommendTemplates } from "../lib/templates";

describe("template helpers", () => {
  it("returns templates for a category", () => {
    const cuttableTemplates = getTemplatesByCategory("cut_sheet");

    expect(cuttableTemplates.map((template) => template.id)).toContain("a4-polaroid-9");
  });

  it("prioritizes exact photo-count and category matches", () => {
    const [bestMatch] = recommendTemplates({
      photoCount: 9,
      categoryId: "cut_sheet",
      orientations: ["portrait"]
    });

    expect(bestMatch.id).toBe("a4-polaroid-9");
  });
});
