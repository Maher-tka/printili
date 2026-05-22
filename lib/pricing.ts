import type { TemplateSeed } from "@/types/templates";

export type FinishOption = "matte" | "glossy";

export type PriceInput = {
  template?: Pick<TemplateSeed, "sheetSize" | "productType" | "productKind"> | null;
  quantity: number;
  productOption: string;
  addFrame: boolean;
  giftWrap: boolean;
  premiumPaper: boolean;
  finish: FinishOption;
  urgentOrder: boolean;
  city: string;
};

export type PriceLineItem = {
  label: string;
  amount: number;
};

export type PriceBreakdown = {
  currency: "TND";
  quantity: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  lineItems: PriceLineItem[];
};

type PricingConfig = {
  currency: "TND";
  baseBySheetSize: Record<string, number>;
  customProductBase: Record<string, number>;
  productOptions: Record<string, number>;
  addOns: {
    frame: number;
    giftWrap: number;
    premiumPaper: number;
    glossyFinish: number;
    urgent: number;
  };
  deliveryFees: {
    default: number;
    byCity: Record<string, number>;
  };
};

export const pricingConfig: PricingConfig = {
  currency: "TND",
  baseBySheetSize: {
    A4: 18,
    A3: 32,
    custom: 7
  },
  customProductBase: {
    graduation_bottle_label: 1.2,
    graduation_round_sticker: 0.45
  },
  productOptions: {
    print_only: 0,
    frame_placeholder: 15,
    gift_wrap_placeholder: 4
  },
  addOns: {
    frame: 15,
    giftWrap: 4,
    premiumPaper: 3,
    glossyFinish: 2,
    urgent: 8
  },
  deliveryFees: {
    default: 10,
    byCity: {
      ariana: 7,
      "ben arous": 7,
      manouba: 8,
      tunis: 7
    }
  }
};

export function calculateOrderPrice(input: PriceInput): PriceBreakdown {
  const quantity = normalizeQuantity(input.quantity);
  const lineItems: PriceLineItem[] = [];
  const baseUnitPrice = getBaseUnitPrice(input.template);
  const baseAmount = roundMoney(baseUnitPrice * quantity);

  lineItems.push({
    label: `${quantity} x ${getTemplatePriceLabel(input.template)}`,
    amount: baseAmount
  });

  const productOptionAmount = getConfiguredAmount(
    pricingConfig.productOptions,
    input.productOption
  );

  if (productOptionAmount > 0) {
    lineItems.push({
      label: "Product option",
      amount: roundMoney(productOptionAmount * quantity)
    });
  }

  if (input.addFrame) {
    lineItems.push({ label: "Frame", amount: roundMoney(pricingConfig.addOns.frame * quantity) });
  }

  if (input.giftWrap) {
    lineItems.push({ label: "Gift wrap", amount: pricingConfig.addOns.giftWrap });
  }

  if (input.premiumPaper) {
    lineItems.push({
      label: "Premium paper",
      amount: roundMoney(pricingConfig.addOns.premiumPaper * quantity)
    });
  }

  if (input.finish === "glossy") {
    lineItems.push({
      label: "Glossy finish",
      amount: roundMoney(pricingConfig.addOns.glossyFinish * quantity)
    });
  }

  if (input.urgentOrder) {
    lineItems.push({ label: "Urgent order", amount: pricingConfig.addOns.urgent });
  }

  const subtotal = roundMoney(lineItems.reduce((total, item) => total + item.amount, 0));
  const deliveryFee = getDeliveryFee(input.city);

  return {
    currency: pricingConfig.currency,
    quantity,
    subtotal,
    deliveryFee,
    total: roundMoney(subtotal + deliveryFee),
    lineItems: [...lineItems, { label: "Delivery", amount: deliveryFee }]
  };
}

export function formatMoney(amount: number) {
  return `${roundMoney(amount).toFixed(2)} TND`;
}

export function getDeliveryFee(city: string) {
  const normalizedCity = normalizeCity(city);

  return pricingConfig.deliveryFees.byCity[normalizedCity] ?? pricingConfig.deliveryFees.default;
}

function getBaseUnitPrice(template: PriceInput["template"]) {
  if (template?.sheetSize === "custom" && template.productKind) {
    return (
      pricingConfig.customProductBase[template.productKind] ?? pricingConfig.baseBySheetSize.custom
    );
  }

  return (
    pricingConfig.baseBySheetSize[template?.sheetSize ?? "A4"] ?? pricingConfig.baseBySheetSize.A4
  );
}

function getTemplatePriceLabel(template: PriceInput["template"]) {
  if (template?.productKind === "graduation_bottle_label") {
    return "water bottle label";
  }

  if (template?.productKind === "graduation_round_sticker") {
    return "round juice sticker";
  }

  return `${template?.sheetSize ?? "A4"} print`;
}

function getConfiguredAmount(values: Record<string, number>, key: string) {
  return values[key] ?? 0;
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? Math.min(Math.floor(quantity), 500) : 1;
}

function normalizeCity(city: string) {
  return city.trim().toLowerCase();
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
