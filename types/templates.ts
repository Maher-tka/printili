export type TemplateCategoryId =
  | "baby"
  | "couple"
  | "birthday"
  | "family"
  | "wedding"
  | "cut_sheet"
  | "graduation"
  | "custom";

export type ProductType =
  | "poster"
  | "cut_sheet"
  | "framed_gift"
  | "digital_printable"
  | "label"
  | "sticker";

export type SheetSize = "A4" | "A3" | "custom";

export type PageOrientation = "portrait" | "landscape";

export type TemplateOrientation = "portrait" | "landscape" | "square";

export type TemplateSlotShape = "rect" | "circle" | "heart" | "silhouette" | "number" | "custom";

export type TemplateSlotRole = "hero" | "supporting" | "thumbnail" | "shape_tile";

export type RecommendationVisibility = "generic" | "explicit_intent";

export type TemplateSlotSeed = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: TemplateSlotShape;
  role: TemplateSlotRole;
  preferredOrientation?: TemplateOrientation;
  zIndex: number;
  borderRadius: number;
  allowBlurFill: boolean;
  allowSmartCrop: boolean;
};

export type TemplateTextFieldSeed = {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  maxLength?: number;
  isRequired: boolean;
  zIndex: number;
};

export type TemplateEditorLayout = {
  slots: TemplateSlotSeed[];
  textFields: TemplateTextFieldSeed[];
};

export type CategorySeed = {
  id: TemplateCategoryId;
  slug: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  recommendationVisibility?: RecommendationVisibility;
};

export type TemplateSeed = {
  id: string;
  slug: string;
  name: string;
  categoryId: TemplateCategoryId;
  productType: ProductType;
  minPhotos: number;
  maxPhotos: number;
  preferredPortraitCount: number;
  preferredLandscapeCount: number;
  preferredSquareCount: number;
  sheetSize: SheetSize;
  orientation: PageOrientation;
  widthMm?: number;
  heightMm?: number;
  productKind?: string;
  supportedOrientations: TemplateOrientation[];
  hasCutGuides: boolean;
  cutLinePt?: number;
  safeMarginMm: number;
  bleedMm: number;
  dpi: number;
  tags: string[];
  isFeatured: boolean;
  description: string;
  priceLabel?: string;
  ctaLabel?: string;
  recommendationVisibility?: RecommendationVisibility;
  bestFor: string[];
  printNotes: string[];
  previewImage: string;
  previewAlt: string;
  seoTitle: string;
  seoDescription: string;
};
