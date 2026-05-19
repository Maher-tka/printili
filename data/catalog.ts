import type { CatalogCategory, CatalogProduct } from "@/types/catalog";

export const catalogCategories: CatalogCategory[] = [
  {
    id: "graduation",
    name: "Graduation",
    slug: "graduation",
    description: "Custom graduation labels, stickers, and printable party items.",
    isActive: true,
    cardDescription: "Custom labels and stickers for graduation parties.",
    cardImage: "/printili/cat-graduation-v2.webp",
    cardImageAlt: "Graduation bottle label and round juice sticker scene",
    heroImage: "/printili/cat-graduation-v2.webp",
    heroImageAlt: "Graduation bottle label and round juice sticker scene"
  }
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "graduation-water-bottle-label",
    name: "Water Bottle Label",
    slug: "graduation-water-bottle-label",
    categorySlug: "graduation",
    description: "Personalized graduation water bottle label.",
    widthCm: 20,
    heightCm: 4,
    shape: "rectangle",
    isActive: true,
    customizableFields: [
      "graduate_name",
      "school_name",
      "graduation_year",
      "color_theme",
      "optional_photo",
      "short_message"
    ]
  },
  {
    id: "graduation-round-juice-sticker",
    name: "Round Juice Sticker",
    slug: "graduation-round-juice-sticker",
    categorySlug: "graduation",
    description: "Personalized round graduation sticker for juice bottles and party favors.",
    widthCm: 4,
    heightCm: 4,
    diameterCm: 4,
    shape: "circle",
    isActive: true,
    customizableFields: [
      "graduate_name",
      "graduation_year",
      "color_theme",
      "optional_photo",
      "short_message"
    ]
  }
];
