import { describe, expect, it } from "vitest";
import {
  getActiveCatalogProductsByCategorySlug,
  getCatalogCategoryBySlug
} from "../lib/catalog";

describe("catalog", () => {
  it("keeps the graduation category limited to the approved active products", () => {
    const category = getCatalogCategoryBySlug("graduation");
    const products = getActiveCatalogProductsByCategorySlug("graduation");

    expect(category?.name).toBe("Graduation");
    expect(products.map((product) => product.name)).toEqual([
      "Water Bottle Label",
      "Round Juice Sticker"
    ]);
  });
});
