import { categories, featuredTemplates } from "@/data/seed-templates";
import type {
  ProductType,
  RecommendationVisibility,
  SheetSize,
  TemplateCategoryId,
  TemplateOrientation,
  TemplateSeed
} from "@/types/templates";

export type RecommendationContext = "generic_photo_upload" | "explicit_product_intent";

type RecommendationInput = {
  photoCount: number;
  categoryId?: TemplateCategoryId;
  orientations?: TemplateOrientation[];
  recommendationContext?: RecommendationContext;
};

export type TemplateFilterInput = {
  categoryId?: TemplateCategoryId;
  sheetSize?: SheetSize;
  productType?: ProductType;
  photoCount?: number;
  deliveryType?: DeliveryType;
  pricedOnly?: boolean;
};

export type DeliveryType = "physical" | "digital";

type SearchParams = Record<string, string | string[] | undefined>;

const templateCategoryIds: TemplateCategoryId[] = [
  "baby",
  "couple",
  "birthday",
  "family",
  "wedding",
  "cut_sheet",
  "graduation",
  "custom"
];

const sheetSizes: SheetSize[] = ["A4", "A3", "custom"];

const productTypes: ProductType[] = [
  "poster",
  "cut_sheet",
  "framed_gift",
  "digital_printable",
  "label",
  "sticker"
];
const deliveryTypes: DeliveryType[] = ["physical", "digital"];

export const productTypeLabels: Record<ProductType, string> = {
  poster: "Poster",
  cut_sheet: "Cut Sheet",
  framed_gift: "Framed Gift",
  digital_printable: "Digital Printable",
  label: "Label",
  sticker: "Sticker"
};

export const sheetSizeLabels: Record<SheetSize, string> = {
  A4: "A4",
  A3: "A3",
  custom: "Custom"
};

const sheetSizeDimensionsCm: Record<SheetSize, { width: number; height: number } | null> = {
  A4: { width: 21, height: 29.7 },
  A3: { width: 29.7, height: 42 },
  custom: null
};

export const categoryLabels: Record<TemplateCategoryId, string> = {
  baby: "Baby",
  couple: "Couple",
  birthday: "Birthday",
  family: "Family",
  wedding: "Wedding",
  cut_sheet: "Cut Sheets",
  graduation: "Graduation",
  custom: "Custom Gifts"
};

export function getCategoryRecommendationVisibility(
  categoryId: TemplateCategoryId
): RecommendationVisibility {
  return getCategoryById(categoryId)?.recommendationVisibility ?? "generic";
}

export function getTemplateRecommendationVisibility(
  template: Pick<TemplateSeed, "categoryId" | "recommendationVisibility">
): RecommendationVisibility {
  return (
    template.recommendationVisibility ?? getCategoryRecommendationVisibility(template.categoryId)
  );
}

export function shouldIncludeTemplateForRecommendation(
  template: Pick<TemplateSeed, "categoryId" | "recommendationVisibility">,
  recommendationContext: RecommendationContext = "generic_photo_upload"
) {
  if (recommendationContext === "explicit_product_intent") {
    return true;
  }

  return getTemplateRecommendationVisibility(template) === "generic";
}

export function getGenericRecommendationCategories() {
  return categories.filter(
    (category) => getCategoryRecommendationVisibility(category.id) === "generic"
  );
}

export function isExplicitIntentCategory(categoryId: TemplateCategoryId) {
  return getCategoryRecommendationVisibility(categoryId) === "explicit_intent";
}

export function getTemplatesByCategory(categoryId: TemplateCategoryId) {
  return featuredTemplates.filter((template) => template.categoryId === categoryId);
}

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isTemplateCategoryId(value: string | undefined): value is TemplateCategoryId {
  return templateCategoryIds.includes(value as TemplateCategoryId);
}

function isSheetSize(value: string | undefined): value is SheetSize {
  return sheetSizes.includes(value as SheetSize);
}

function isProductType(value: string | undefined): value is ProductType {
  return productTypes.includes(value as ProductType);
}

function isDeliveryType(value: string | undefined): value is DeliveryType {
  return deliveryTypes.includes(value as DeliveryType);
}

export function parseTemplateFilters(searchParams: SearchParams = {}): TemplateFilterInput {
  const category = getSingleQueryValue(searchParams.category);
  const sheetSize = getSingleQueryValue(searchParams.sheetSize);
  const productType = getSingleQueryValue(searchParams.productType);
  const photoCountValue = getSingleQueryValue(searchParams.photoCount);
  const deliveryType = getSingleQueryValue(searchParams.deliveryType);
  const pricedOnly = getSingleQueryValue(searchParams.pricedOnly);
  const photoCount = photoCountValue ? Number(photoCountValue) : undefined;

  return {
    categoryId: isTemplateCategoryId(category) ? category : undefined,
    sheetSize: isSheetSize(sheetSize) ? sheetSize : undefined,
    productType: isProductType(productType) ? productType : undefined,
    photoCount:
      photoCount && Number.isFinite(photoCount) && photoCount > 0 ? photoCount : undefined,
    deliveryType: isDeliveryType(deliveryType) ? deliveryType : undefined,
    pricedOnly: pricedOnly === "1"
  };
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryById(categoryId: TemplateCategoryId) {
  return categories.find((category) => category.id === categoryId);
}

export function getTemplateBySlug(slug: string) {
  return featuredTemplates.find((template) => template.slug === slug);
}

export function formatPhotoCountRange(minPhotos: number, maxPhotos: number) {
  return minPhotos === maxPhotos ? `${minPhotos} photos` : `${minPhotos}-${maxPhotos} photos`;
}

export function formatSheetSizeCm(sheetSize: SheetSize, orientation: "portrait" | "landscape") {
  const dimensions = sheetSizeDimensionsCm[sheetSize];

  if (!dimensions) {
    return "Custom size";
  }

  const width = orientation === "portrait" ? dimensions.width : dimensions.height;
  const height = orientation === "portrait" ? dimensions.height : dimensions.width;

  return `${sheetSize} ${orientation} / ${formatCm(width)} x ${formatCm(height)} cm`;
}

export function formatTemplateSize(
  template: Pick<TemplateSeed, "sheetSize" | "orientation" | "widthMm" | "heightMm">
) {
  if (template.sheetSize === "custom" && template.widthMm && template.heightMm) {
    return `${formatCm(template.widthMm / 10)} x ${formatCm(template.heightMm / 10)} cm`;
  }

  return formatSheetSizeCm(template.sheetSize, template.orientation);
}

export function getFilteredTemplates({
  categoryId,
  sheetSize,
  productType,
  photoCount,
  deliveryType,
  pricedOnly
}: TemplateFilterInput) {
  return featuredTemplates.filter((template) => {
    const categoryMatches = !categoryId || template.categoryId === categoryId;
    const sheetSizeMatches = !sheetSize || template.sheetSize === sheetSize;
    const productTypeMatches = !productType || template.productType === productType;
    const photoCountMatches =
      !photoCount || (photoCount >= template.minPhotos && photoCount <= template.maxPhotos);
    const deliveryTypeMatches =
      !deliveryType ||
      (deliveryType === "digital"
        ? template.productType === "digital_printable"
        : template.productType !== "digital_printable");
    const pricingMatches = !pricedOnly || Boolean(template.priceLabel);

    return (
      categoryMatches &&
      sheetSizeMatches &&
      productTypeMatches &&
      photoCountMatches &&
      deliveryTypeMatches &&
      pricingMatches
    );
  });
}

export function recommendTemplates({
  photoCount,
  categoryId,
  orientations = [],
  recommendationContext = "generic_photo_upload"
}: RecommendationInput) {
  const orientationSet = new Set(orientations);

  return featuredTemplates
    .filter((template) => shouldIncludeTemplateForRecommendation(template, recommendationContext))
    .map((template) => {
      const categoryScore = categoryId && template.categoryId === categoryId ? 3 : 0;
      const countDistance =
        photoCount < template.minPhotos
          ? template.minPhotos - photoCount
          : Math.max(0, photoCount - template.maxPhotos);
      const countScore =
        photoCount >= template.minPhotos && photoCount <= template.maxPhotos
          ? 4
          : Math.max(0, 2 - countDistance);
      const orientationScore = template.supportedOrientations.some((orientation) =>
        orientationSet.has(orientation)
      )
        ? 2
        : 0;

      return {
        ...template,
        score: categoryScore + countScore + orientationScore
      };
    })
    .filter((template) => template.score > 0)
    .sort((a, b) => b.score - a.score);
}

function formatCm(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
