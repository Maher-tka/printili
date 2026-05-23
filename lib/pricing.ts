import type { ProductType, TemplateSeed } from "@/types/templates";

export type FinishOption = "matte" | "glossy";

export type ProductOptionId =
  | "print_only"
  | "cut_and_pack"
  | "framed_print"
  | "gift_ready_pack"
  | "party_pack";

export type ProductOption = {
  id: ProductOptionId;
  label: string;
  summaryLabel: string;
  description: string;
  amount: number;
  pricingUnit: "per_item" | "per_order";
  supportedProductTypes?: ProductType[];
  includedAddOns?: {
    frame?: boolean;
    giftWrap?: boolean;
  };
};

export type DeliveryCityId =
  | "tunis"
  | "ariana"
  | "ben_arous"
  | "manouba"
  | "nabeul"
  | "bizerte"
  | "sousse"
  | "monastir"
  | "mahdia"
  | "sfax"
  | "kairouan"
  | "gabes"
  | "medenine_djerba"
  | "other_tunisia";

export type DeliveryCityOption = {
  id: DeliveryCityId;
  label: string;
  fee: number;
  note: string;
};

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
  productOptions: ProductOption[];
  addOns: {
    frame: number;
    giftWrap: number;
    premiumPaper: number;
    glossyFinish: number;
    urgent: number;
  };
  defaultDeliveryCityId: DeliveryCityId;
  defaultCheckoutCityId: DeliveryCityId;
  deliveryCities: DeliveryCityOption[];
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
  productOptions: [
    {
      id: "print_only",
      label: "Print only",
      summaryLabel: "Print only",
      description: "Your approved design printed on quality paper and packed flat.",
      amount: 0,
      pricingUnit: "per_order"
    },
    {
      id: "cut_and_pack",
      label: "Cut and packed mini prints",
      summaryLabel: "Cutting and packing",
      description: "We print the sheet, cut each piece, and pack the set in a protective sleeve.",
      amount: 6,
      pricingUnit: "per_order",
      supportedProductTypes: ["cut_sheet"]
    },
    {
      id: "framed_print",
      label: "Framed print",
      summaryLabel: "Simple frame",
      description: "Finished in a simple black or white frame, ready to display or gift.",
      amount: 15,
      pricingUnit: "per_item",
      supportedProductTypes: ["poster", "framed_gift"],
      includedAddOns: {
        frame: true
      }
    },
    {
      id: "gift_ready_pack",
      label: "Gift-ready package",
      summaryLabel: "Gift-ready package",
      description: "Protective sleeve, ribbon, and a small gift note included with the order.",
      amount: 5,
      pricingUnit: "per_order",
      supportedProductTypes: ["poster", "cut_sheet", "framed_gift"],
      includedAddOns: {
        giftWrap: true
      }
    },
    {
      id: "party_pack",
      label: "Party pack sorting",
      summaryLabel: "Party pack sorting",
      description: "Labels or stickers are packed by set so they arrive ready for your table.",
      amount: 3,
      pricingUnit: "per_order",
      supportedProductTypes: ["label", "sticker"]
    }
  ],
  addOns: {
    frame: 15,
    giftWrap: 4,
    premiumPaper: 3,
    glossyFinish: 2,
    urgent: 8
  },
  defaultDeliveryCityId: "other_tunisia",
  defaultCheckoutCityId: "tunis",
  deliveryCities: [
    {
      id: "tunis",
      label: "Tunis",
      fee: 7,
      note: "Capital delivery"
    },
    {
      id: "ariana",
      label: "Ariana",
      fee: 7,
      note: "Greater Tunis delivery"
    },
    {
      id: "ben_arous",
      label: "Ben Arous",
      fee: 7,
      note: "Greater Tunis delivery"
    },
    {
      id: "manouba",
      label: "Manouba",
      fee: 8,
      note: "Greater Tunis delivery"
    },
    {
      id: "nabeul",
      label: "Nabeul / Hammamet",
      fee: 9,
      note: "Regional courier"
    },
    {
      id: "bizerte",
      label: "Bizerte",
      fee: 9,
      note: "Regional courier"
    },
    {
      id: "sousse",
      label: "Sousse",
      fee: 9,
      note: "Regional courier"
    },
    {
      id: "monastir",
      label: "Monastir",
      fee: 9,
      note: "Regional courier"
    },
    {
      id: "mahdia",
      label: "Mahdia",
      fee: 10,
      note: "Regional courier"
    },
    {
      id: "sfax",
      label: "Sfax",
      fee: 10,
      note: "Regional courier"
    },
    {
      id: "kairouan",
      label: "Kairouan",
      fee: 10,
      note: "Regional courier"
    },
    {
      id: "gabes",
      label: "Gabes",
      fee: 12,
      note: "Long-distance courier"
    },
    {
      id: "medenine_djerba",
      label: "Medenine / Djerba",
      fee: 12,
      note: "Long-distance courier"
    },
    {
      id: "other_tunisia",
      label: "Other Tunisia cities",
      fee: 10,
      note: "Confirmed by WhatsApp if the courier zone needs adjustment"
    }
  ]
};

const legacyProductOptions: Record<string, ProductOptionId> = {
  frame_placeholder: "framed_print",
  gift_wrap_placeholder: "gift_ready_pack",
  standard_print: "print_only"
};

const deliveryCityAliases: Record<string, DeliveryCityId> = {
  "ben arous": "ben_arous",
  hammamet: "nabeul",
  nabeul: "nabeul",
  djerba: "medenine_djerba",
  medenine: "medenine_djerba",
  "medenine djerba": "medenine_djerba",
  "other city": "other_tunisia",
  "other cities": "other_tunisia",
  other: "other_tunisia",
  tunisia: "other_tunisia"
};

export function calculateOrderPrice(input: PriceInput): PriceBreakdown {
  const quantity = normalizeQuantity(input.quantity);
  const lineItems: PriceLineItem[] = [];
  const baseUnitPrice = getBaseUnitPrice(input.template);
  const baseAmount = roundMoney(baseUnitPrice * quantity);
  const productOption = getProductOption(input.productOption, input.template);

  lineItems.push({
    label: `${quantity} x ${getTemplatePriceLabel(input.template)}`,
    amount: baseAmount
  });

  if (productOption.amount > 0) {
    lineItems.push({
      label: productOption.summaryLabel,
      amount: roundMoney(getOptionAmount(productOption, quantity))
    });
  }

  if (input.addFrame && !productOption.includedAddOns?.frame) {
    lineItems.push({
      label: "Simple frame",
      amount: roundMoney(pricingConfig.addOns.frame * quantity)
    });
  }

  if (input.giftWrap && !productOption.includedAddOns?.giftWrap) {
    lineItems.push({ label: "Gift wrapping", amount: pricingConfig.addOns.giftWrap });
  }

  if (input.premiumPaper) {
    lineItems.push({
      label: "Premium photo paper",
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
    lineItems.push({ label: "Priority production", amount: pricingConfig.addOns.urgent });
  }

  const subtotal = roundMoney(lineItems.reduce((total, item) => total + item.amount, 0));
  const deliveryCity = getDeliveryCityOption(input.city);
  const deliveryFee = deliveryCity.fee;

  return {
    currency: pricingConfig.currency,
    quantity,
    subtotal,
    deliveryFee,
    total: roundMoney(subtotal + deliveryFee),
    lineItems: [...lineItems, { label: `Delivery - ${deliveryCity.label}`, amount: deliveryFee }]
  };
}

export function formatMoney(amount: number) {
  return `${roundMoney(amount).toFixed(2)} TND`;
}

export function formatProductOptionPrice(option: ProductOption) {
  if (option.amount === 0) {
    return "Included";
  }

  const suffix = option.pricingUnit === "per_item" ? " / item" : " / order";

  return `+${formatMoney(option.amount)}${suffix}`;
}

export function getDeliveryFee(city: string) {
  return getDeliveryCityOption(city).fee;
}

export function getDeliveryCityOption(city: string) {
  const cityId = normalizeDeliveryCity(city);

  return (
    pricingConfig.deliveryCities.find((option) => option.id === cityId) ??
    pricingConfig.deliveryCities.find(
      (option) => option.id === pricingConfig.defaultDeliveryCityId
    )!
  );
}

export function getDeliveryCityLabel(city: string) {
  return getDeliveryCityOption(city).label;
}

export function getDefaultDeliveryCity() {
  return getDeliveryCityOption(pricingConfig.defaultCheckoutCityId);
}

export function normalizeDeliveryCity(city: string): DeliveryCityId {
  const normalizedCity = normalizeKey(city);

  if (!normalizedCity) {
    return pricingConfig.defaultDeliveryCityId;
  }

  const directMatch = pricingConfig.deliveryCities.find(
    (option) =>
      normalizeKey(option.id) === normalizedCity || normalizeKey(option.label) === normalizedCity
  );

  return (
    directMatch?.id ?? deliveryCityAliases[normalizedCity] ?? pricingConfig.defaultDeliveryCityId
  );
}

export function getProductOptionsForTemplate(template: PriceInput["template"]) {
  const productType = template?.productType;

  return pricingConfig.productOptions.filter(
    (option) =>
      !option.supportedProductTypes ||
      !productType ||
      option.supportedProductTypes.includes(productType)
  );
}

export function getDefaultProductOption(template: PriceInput["template"]) {
  const options = getProductOptionsForTemplate(template);

  if (template?.productType === "framed_gift") {
    return options.find((option) => option.id === "framed_print") ?? options[0];
  }

  return options[0] ?? pricingConfig.productOptions[0];
}

export function getProductOption(optionId: string, template: PriceInput["template"]) {
  const normalizedOptionId = normalizeProductOption(optionId, template);

  return (
    getProductOptionsForTemplate(template).find((option) => option.id === normalizedOptionId) ??
    getDefaultProductOption(template)
  );
}

export function normalizeProductOption(
  optionId: string,
  template: PriceInput["template"]
): ProductOptionId {
  const requestedOption = legacyProductOptions[optionId] ?? optionId;
  const availableOption = getProductOptionsForTemplate(template).find(
    (option) => option.id === requestedOption
  );

  return availableOption?.id ?? getDefaultProductOption(template).id;
}

function getOptionAmount(option: ProductOption, quantity: number) {
  return option.pricingUnit === "per_item" ? option.amount * quantity : option.amount;
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
    return "graduation water bottle label";
  }

  if (template?.productKind === "graduation_round_sticker") {
    return "graduation round sticker";
  }

  if (template?.productType === "cut_sheet") {
    return `${template.sheetSize} cut sheet print`;
  }

  if (template?.productType === "framed_gift") {
    return `${template.sheetSize} gift print`;
  }

  return `${template?.sheetSize ?? "A4"} print`;
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? Math.min(Math.floor(quantity), 500) : 1;
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ");
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
