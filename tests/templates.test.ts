import { describe, expect, it } from "vitest";
import {
  getFilteredTemplates,
  getTemplatesByCategory,
  parseTemplateFilters,
  recommendTemplates
} from "../lib/templates";

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

  it("parses delivery and priced-only filters", () => {
    expect(
      parseTemplateFilters({
        deliveryType: "physical",
        pricedOnly: "1"
      })
    ).toMatchObject({
      deliveryType: "physical",
      pricedOnly: true
    });
  });

  it("filters to priced physical products when requested", () => {
    const templates = getFilteredTemplates({
      deliveryType: "physical",
      pricedOnly: true
    });

    expect(templates.every((template) => template.productType !== "digital_printable")).toBe(true);
    expect(templates.every((template) => Boolean(template.priceLabel))).toBe(true);
  });
});
