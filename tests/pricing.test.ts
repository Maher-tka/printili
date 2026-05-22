import { describe, expect, it } from "vitest";
import { calculateOrderPrice, getDeliveryFee } from "@/lib/pricing";
import type { TemplateSeed } from "@/types/templates";

const a4Template = {
  sheetSize: "A4",
  productType: "poster"
} satisfies Pick<TemplateSeed, "sheetSize" | "productType">;

const customStickerTemplate = {
  sheetSize: "custom",
  productType: "sticker",
  productKind: "graduation_round_sticker"
} satisfies Pick<TemplateSeed, "sheetSize" | "productType" | "productKind">;

describe("pricing", () => {
  it("calculates a clear poster order total", () => {
    const price = calculateOrderPrice({
      template: a4Template,
      quantity: 2,
      productOption: "print_only",
      addFrame: true,
      giftWrap: true,
      premiumPaper: false,
      finish: "matte",
      urgentOrder: false,
      city: "Tunis"
    });

    expect(price.subtotal).toBe(70);
    expect(price.deliveryFee).toBe(7);
    expect(price.total).toBe(77);
  });

  it("uses custom product pricing for graduation stickers", () => {
    const price = calculateOrderPrice({
      template: customStickerTemplate,
      quantity: 20,
      productOption: "print_only",
      addFrame: false,
      giftWrap: false,
      premiumPaper: false,
      finish: "matte",
      urgentOrder: false,
      city: "Sousse"
    });

    expect(price.subtotal).toBe(9);
    expect(price.deliveryFee).toBe(10);
    expect(price.total).toBe(19);
  });

  it("normalizes configured delivery cities", () => {
    expect(getDeliveryFee("  ARIANA ")).toBe(7);
    expect(getDeliveryFee("Unknown city")).toBe(10);
  });
});
