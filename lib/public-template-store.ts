import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  PhotoOrientation,
  ProductType as PrismaProductType,
  SheetSize as PrismaSheetSize,
  SlotRole,
  SlotShape,
  TemplateCategory as PrismaTemplateCategory,
  TemplateOrientation as PrismaTemplateOrientation
} from "@/lib/generated/prisma/client";
import { getTemplateEditorLayout } from "@/data/template-layouts";
import { categories, featuredTemplates } from "@/data/seed-templates";
import {
  assertLocalJsonFallbackAllowed,
  handleDatabaseFailure,
  hasConfiguredDatabaseUrl,
  isProductionRuntime
} from "@/lib/runtime-config";
import { assertValidPublicTemplate } from "@/lib/template-validation";
import type { TemplateFilterInput } from "@/lib/templates";
import type {
  PageOrientation,
  ProductType,
  SheetSize,
  TemplateCategoryId,
  TemplateEditorLayout,
  TemplateOrientation,
  TemplateSeed,
  TemplateSlotRole,
  TemplateSlotSeed,
  TemplateSlotShape,
  TemplateTextFieldSeed
} from "@/types/templates";

type StoredTemplateRecord = TemplateSeed & {
  editorLayout?: TemplateEditorLayout;
  savedAt?: string;
};

type SaveTemplateInput = {
  id?: string;
  slug?: string;
  name: string;
  categoryId?: TemplateCategoryId;
  category?: string;
  productType?: ProductType | string;
  sheetSize?: SheetSize | string;
  orientation?: PageOrientation | string;
  widthMm?: number;
  heightMm?: number;
  productKind?: string;
  minPhotos?: number;
  maxPhotos?: number;
  description?: string;
  tags?: string[];
  previewImage?: string;
  previewAlt?: string;
  previewDataUrl?: string | null;
  canvas?: {
    width?: number;
    height?: number;
  };
  frames?: Array<Record<string, unknown>>;
  textFields?: Array<Record<string, unknown>>;
};

type SavedTemplateResult = {
  template: StoredTemplateRecord;
  persistence: "database" | "local";
};

export type TemplateAdminMetadata = {
  slug: string;
  categoryId?: TemplateCategoryId;
  adminCategoryId?: string;
  description?: string;
  priceLabel?: string;
  ctaLabel?: string;
  isHidden?: boolean;
  isFeatured?: boolean;
  updatedAt?: string;
};

export type AdminTemplateCategory = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  publicCategoryId?: TemplateCategoryId;
  createdAt?: string;
};

type StoredAdminTemplateCategory = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

export type AdminTemplateRecord = TemplateSeed & {
  source: "seed" | "saved";
  adminCategoryId: string;
  isHidden: boolean;
  savedAt?: string;
  adminUpdatedAt?: string;
};

export type SavedPublicTemplate = TemplateSeed & {
  editorLayout?: TemplateEditorLayout;
  savedAt?: string;
};

const localTemplateStorePath = path.join(process.cwd(), ".local-storage", "templates.json");
const localTemplateAdminMetadataPath = path.join(
  process.cwd(),
  ".local-storage",
  "template-admin-metadata.json"
);
const localAdminCategoriesPath = path.join(
  process.cwd(),
  ".local-storage",
  "template-admin-categories.json"
);
const localUploadRoot = path.join(process.cwd(), ".local-storage", "uploads");
const seedSlugs = new Set(featuredTemplates.map((template) => template.slug));

const categoryLabels: Record<TemplateCategoryId, string> = {
  baby: "Baby",
  couple: "Couple",
  birthday: "Birthday",
  family: "Family",
  wedding: "Wedding",
  cut_sheet: "Cut Sheets",
  graduation: "Graduation",
  custom: "Custom Gifts"
};

const categoryToPrisma: Record<TemplateCategoryId, PrismaTemplateCategory> = {
  baby: PrismaTemplateCategory.BABY,
  couple: PrismaTemplateCategory.COUPLE,
  birthday: PrismaTemplateCategory.BIRTHDAY,
  family: PrismaTemplateCategory.FAMILY,
  wedding: PrismaTemplateCategory.WEDDING,
  cut_sheet: PrismaTemplateCategory.CUT_SHEET,
  graduation: PrismaTemplateCategory.GRADUATION,
  custom: PrismaTemplateCategory.CUSTOM
};

const prismaToCategory: Record<PrismaTemplateCategory, TemplateCategoryId> = {
  [PrismaTemplateCategory.BABY]: "baby",
  [PrismaTemplateCategory.COUPLE]: "couple",
  [PrismaTemplateCategory.BIRTHDAY]: "birthday",
  [PrismaTemplateCategory.FAMILY]: "family",
  [PrismaTemplateCategory.WEDDING]: "wedding",
  [PrismaTemplateCategory.CUT_SHEET]: "cut_sheet",
  [PrismaTemplateCategory.GRADUATION]: "graduation",
  [PrismaTemplateCategory.CUSTOM]: "custom"
};

const productTypeToPrisma: Record<ProductType, PrismaProductType> = {
  poster: PrismaProductType.POSTER,
  cut_sheet: PrismaProductType.CUT_SHEET,
  framed_gift: PrismaProductType.FRAMED_GIFT,
  digital_printable: PrismaProductType.DIGITAL_PRINTABLE,
  label: PrismaProductType.LABEL,
  sticker: PrismaProductType.STICKER
};

const prismaToProductType: Record<PrismaProductType, ProductType> = {
  [PrismaProductType.POSTER]: "poster",
  [PrismaProductType.CUT_SHEET]: "cut_sheet",
  [PrismaProductType.FRAMED_GIFT]: "framed_gift",
  [PrismaProductType.DIGITAL_PRINTABLE]: "digital_printable",
  [PrismaProductType.LABEL]: "label",
  [PrismaProductType.STICKER]: "sticker"
};

const sheetSizeToPrisma: Record<SheetSize, PrismaSheetSize> = {
  A4: PrismaSheetSize.A4,
  A3: PrismaSheetSize.A3,
  custom: PrismaSheetSize.CUSTOM
};

const prismaToSheetSize: Record<PrismaSheetSize, SheetSize> = {
  [PrismaSheetSize.A4]: "A4",
  [PrismaSheetSize.A3]: "A3",
  [PrismaSheetSize.CUSTOM]: "custom"
};

const orientationToPrisma: Record<PageOrientation, PrismaTemplateOrientation> = {
  portrait: PrismaTemplateOrientation.PORTRAIT,
  landscape: PrismaTemplateOrientation.LANDSCAPE
};

const prismaToOrientation: Record<PrismaTemplateOrientation, PageOrientation> = {
  [PrismaTemplateOrientation.PORTRAIT]: "portrait",
  [PrismaTemplateOrientation.LANDSCAPE]: "landscape"
};

export async function getAllPublicTemplates({
  includeHidden = false
}: {
  includeHidden?: boolean;
} = {}): Promise<TemplateSeed[]> {
  const [databaseTemplates, localTemplates, adminMetadata] = await Promise.all([
    readDatabaseTemplates(),
    readLocalTemplates(),
    readTemplateAdminMetadata()
  ]);
  const templatesBySlug = new Map<string, TemplateSeed>();

  for (const template of featuredTemplates) {
    templatesBySlug.set(template.slug, template);
  }

  for (const template of [...databaseTemplates, ...localTemplates]) {
    templatesBySlug.set(template.slug, template);
  }

  return Array.from(templatesBySlug.values())
    .map((template) => applyAdminMetadata(template, adminMetadata.get(template.slug)))
    .filter((template) => includeHidden || !adminMetadata.get(template.slug)?.isHidden);
}

export async function getPublicTemplateBySlug(slug: string) {
  const templates = await getAllPublicTemplates();

  return templates.find((template) => template.slug === slug);
}

export async function getFilteredPublicTemplates(filters: TemplateFilterInput) {
  return filterTemplates(await getAllPublicTemplates(), filters);
}

export async function getSavedPublicTemplates(): Promise<SavedPublicTemplate[]> {
  const [databaseTemplates, localTemplates, adminMetadata] = await Promise.all([
    readDatabaseTemplates(),
    readLocalTemplates(),
    readTemplateAdminMetadata()
  ]);
  const templatesBySlug = new Map<string, SavedPublicTemplate>();

  for (const template of [...databaseTemplates, ...localTemplates]) {
    if (!seedSlugs.has(template.slug) && !adminMetadata.get(template.slug)?.isHidden) {
      templatesBySlug.set(
        template.slug,
        applyAdminMetadata(template, adminMetadata.get(template.slug))
      );
    }
  }

  return Array.from(templatesBySlug.values());
}

export async function getAdminTemplateCategories(): Promise<AdminTemplateCategory[]> {
  const customCategories = await readAdminCategories();

  return [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      isSystem: true,
      publicCategoryId: category.id
    })),
    ...customCategories.map((category) => ({
      ...category,
      isSystem: false
    }))
  ];
}

export async function createAdminTemplateCategory({
  name,
  description
}: {
  name: string;
  description?: string;
}) {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Category name is required.");
  }

  const categories = await readAdminCategories();
  const existingIds = new Set([
    ...categories.map((category) => category.id),
    ...featuredTemplates.map((template) => template.categoryId)
  ]);
  const id = getSafeAdminCategoryId(cleanName, existingIds);
  const category = {
    id,
    name: cleanName,
    description: description?.trim() || "Admin planning category.",
    createdAt: new Date().toISOString()
  };

  await writeAdminCategories([...categories, category]);

  return category;
}

export async function getAdminTemplateCatalog(): Promise<AdminTemplateRecord[]> {
  const [databaseTemplates, localTemplates, adminMetadata] = await Promise.all([
    readDatabaseTemplates(),
    readLocalTemplates(),
    readTemplateAdminMetadata()
  ]);
  const templatesBySlug = new Map<
    string,
    { template: SavedPublicTemplate; source: "seed" | "saved" }
  >();

  for (const template of featuredTemplates) {
    templatesBySlug.set(template.slug, { template, source: "seed" });
  }

  for (const template of [...databaseTemplates, ...localTemplates]) {
    templatesBySlug.set(template.slug, {
      template,
      source: seedSlugs.has(template.slug) ? "seed" : "saved"
    });
  }

  return Array.from(templatesBySlug.values())
    .map(({ template, source }) => {
      const metadata = adminMetadata.get(template.slug);
      const appliedTemplate = applyAdminMetadata(template, metadata);

      return {
        ...appliedTemplate,
        source,
        adminCategoryId:
          metadata?.adminCategoryId || metadata?.categoryId || appliedTemplate.categoryId,
        isHidden: Boolean(metadata?.isHidden),
        savedAt: template.savedAt,
        adminUpdatedAt: metadata?.updatedAt
      };
    })
    .sort((a, b) => {
      if (a.isHidden !== b.isHidden) {
        return a.isHidden ? 1 : -1;
      }

      if (a.adminCategoryId !== b.adminCategoryId) {
        return a.adminCategoryId.localeCompare(b.adminCategoryId);
      }

      return a.name.localeCompare(b.name);
    });
}

export async function updateTemplateAdminMetadata(input: Omit<TemplateAdminMetadata, "updatedAt">) {
  const metadata = await readTemplateAdminMetadata();
  const previous = metadata.get(input.slug);
  const next: TemplateAdminMetadata = {
    ...previous,
    slug: input.slug,
    categoryId: input.categoryId,
    adminCategoryId: trimToUndefined(input.adminCategoryId),
    description: trimToUndefined(input.description),
    priceLabel: trimToUndefined(input.priceLabel),
    ctaLabel: trimToUndefined(input.ctaLabel),
    isHidden: input.isHidden ?? previous?.isHidden,
    isFeatured: input.isFeatured ?? previous?.isFeatured,
    updatedAt: new Date().toISOString()
  };

  metadata.set(input.slug, next);
  await writeTemplateAdminMetadata(metadata);

  return next;
}

export async function duplicatePublicTemplate(slug: string): Promise<StoredTemplateRecord> {
  const catalog = await getAdminTemplateCatalog();
  const source = catalog.find((template) => template.slug === slug);

  if (!source) {
    throw new Error("Template not found.");
  }

  const existingSlugs = new Set(catalog.map((template) => template.slug));
  const newSlug = getUniqueTemplateSlug(`${source.slug}-copy`, existingSlugs);
  const layout = await getPublicTemplateEditorLayout(source.slug);
  const duplicate: StoredTemplateRecord = {
    ...source,
    id: newSlug,
    slug: newSlug,
    name: `${source.name} Copy`,
    isFeatured: false,
    editorLayout: cloneEditorLayoutForTemplate(newSlug, layout),
    savedAt: new Date().toISOString()
  };

  assertValidPublicTemplate({
    template: duplicate,
    layout: duplicate.editorLayout
  });

  if (hasConfiguredDatabaseUrl()) {
    try {
      await upsertDatabaseTemplate(duplicate);
      return duplicate;
    } catch (error) {
      handleDatabaseFailure("Database template duplicate failed", error);
    }
  }

  await upsertLocalTemplate(duplicate);

  return duplicate;
}

export async function setPublicTemplateVisibility(slug: string, isHidden: boolean) {
  const metadata = await readTemplateAdminMetadata();
  const previous = metadata.get(slug);

  metadata.set(slug, {
    ...previous,
    slug,
    isHidden,
    updatedAt: new Date().toISOString()
  });

  await writeTemplateAdminMetadata(metadata);
}

export async function getPublicTemplateEditorLayout(slug: string): Promise<TemplateEditorLayout> {
  const seedLayout = getTemplateEditorLayout(slug);

  if (seedLayout.slots.length || seedLayout.textFields.length) {
    return seedLayout;
  }

  const localTemplate = (await readLocalTemplates()).find((template) => template.slug === slug);

  if (localTemplate?.editorLayout) {
    return localTemplate.editorLayout;
  }

  const databaseLayout = await readDatabaseTemplateLayout(slug);

  return databaseLayout ?? seedLayout;
}

export async function savePublicTemplate(input: SaveTemplateInput): Promise<SavedTemplateResult> {
  const template = await normalizeTemplateInput(input);
  assertValidPublicTemplate({
    template,
    layout: template.editorLayout
  });

  if (hasConfiguredDatabaseUrl()) {
    try {
      await upsertDatabaseTemplate(template);
      return { template, persistence: "database" };
    } catch (error) {
      handleDatabaseFailure("Database template save failed", error);
    }
  }

  await upsertLocalTemplate(template);

  return { template, persistence: "local" };
}

export async function saveTemplatePreviewFile({
  slug,
  fileName,
  buffer
}: {
  slug: string;
  fileName: string;
  buffer: Buffer;
}) {
  const extension = extensionFromFileName(fileName) ?? ".jpg";

  return savePreviewBuffer({
    slug,
    buffer,
    extension,
    fileName
  });
}

export function slugifyTemplate(value: string) {
  return slugify(value);
}

function filterTemplates(templates: TemplateSeed[], filters: TemplateFilterInput) {
  return templates.filter((template) => {
    const categoryMatches = !filters.categoryId || template.categoryId === filters.categoryId;
    const sheetSizeMatches = !filters.sheetSize || template.sheetSize === filters.sheetSize;
    const productTypeMatches = !filters.productType || template.productType === filters.productType;
    const photoCountMatches =
      !filters.photoCount ||
      (filters.photoCount >= template.minPhotos && filters.photoCount <= template.maxPhotos);
    const deliveryTypeMatches =
      !filters.deliveryType ||
      (filters.deliveryType === "digital"
        ? template.productType === "digital_printable"
        : template.productType !== "digital_printable");
    const pricingMatches = !filters.pricedOnly || Boolean(template.priceLabel);

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

async function normalizeTemplateInput(input: SaveTemplateInput): Promise<StoredTemplateRecord> {
  const name = input.name.trim() || "Printili Template";
  const slug = getSafeSavedSlug(input.slug ?? input.id ?? name);
  const categoryId = normalizeCategory(input.categoryId ?? input.category);
  const productType = normalizeProductType(input.productType, categoryId);
  const sheetSize = normalizeSheetSize(input.sheetSize);
  const orientation = normalizePageOrientation(input.orientation, input.canvas);
  const layout = createEditorLayout(slug, input);
  const frameCount = Math.max(1, layout.slots.length || Number(input.minPhotos) || 1);
  const previewImage =
    (input.previewDataUrl
      ? await saveDataUrlPreview({
          slug,
          dataUrl: input.previewDataUrl
        })
      : input.previewImage?.trim()) || getCategoryFallbackImage(categoryId);
  const orientationCounts = countSlotOrientations(layout.slots);

  return {
    id: slug,
    slug,
    name,
    categoryId,
    productType,
    minPhotos: normalizePositiveInt(input.minPhotos, frameCount),
    maxPhotos: normalizePositiveInt(input.maxPhotos, frameCount),
    preferredPortraitCount: orientationCounts.portrait,
    preferredLandscapeCount: orientationCounts.landscape,
    preferredSquareCount: orientationCounts.square,
    sheetSize,
    orientation,
    widthMm: normalizeOptionalPositiveNumber(input.widthMm),
    heightMm: normalizeOptionalPositiveNumber(input.heightMm),
    productKind: trimToUndefined(input.productKind),
    supportedOrientations: getSupportedOrientations(orientationCounts),
    hasCutGuides: productType === "cut_sheet",
    cutLinePt: productType === "cut_sheet" ? 0.25 : undefined,
    safeMarginMm: 8,
    bleedMm: productType === "cut_sheet" ? 0 : 3,
    dpi: 300,
    tags: normalizeTags(input.tags, categoryId, sheetSize, productType),
    isFeatured: false,
    description:
      input.description?.trim() ||
      `Saved ${categoryLabels[categoryId].toLowerCase()} photo montage template.`,
    bestFor: [
      `${categoryLabels[categoryId]} gifts`,
      "Personalized photo montages",
      "Premium printable keepsakes"
    ],
    printNotes: [
      `${sheetSize} ${orientation} template saved from the admin studio.`,
      `${frameCount} editable photo slot${frameCount === 1 ? "" : "s"} detected.`,
      "Preview appears in the public template category after saving."
    ],
    previewImage,
    previewAlt: input.previewAlt?.trim() || `${name} template preview`,
    seoTitle: `${name} Photo Montage Template`,
    seoDescription: `Create ${name}, a printable ${categoryLabels[
      categoryId
    ].toLowerCase()} photo montage template.`,
    editorLayout: layout,
    savedAt: new Date().toISOString()
  };
}

function getSafeSavedSlug(value: string) {
  const baseSlug = slugify(value) || `saved-template-${randomUUID().slice(0, 8)}`;

  return seedSlugs.has(baseSlug) ? `${baseSlug}-saved` : baseSlug;
}

function normalizeCategory(value: string | undefined): TemplateCategoryId {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replace(/\s+/g, "_");

  if (normalized === "mini_prints" || normalized === "cut_sheets" || normalized === "cut_sheet") {
    return "cut_sheet";
  }

  if (normalized === "custom_gifts" || normalized === "custom_gift" || normalized === "custom") {
    return "custom";
  }

  if (
    normalized === "baby" ||
    normalized === "couple" ||
    normalized === "birthday" ||
    normalized === "family" ||
    normalized === "wedding" ||
    normalized === "graduation"
  ) {
    return normalized;
  }

  return "custom";
}

function normalizeProductType(
  value: string | undefined,
  categoryId: TemplateCategoryId
): ProductType {
  if (
    value === "poster" ||
    value === "cut_sheet" ||
    value === "framed_gift" ||
    value === "label" ||
    value === "sticker"
  ) {
    return value;
  }

  if (value === "digital_printable") {
    return value;
  }

  return categoryId === "cut_sheet" ? "cut_sheet" : "poster";
}

function normalizeSheetSize(value: string | undefined): SheetSize {
  if (value === "A3" || value === "A4" || value === "custom") {
    return value;
  }

  return "A4";
}

function normalizePageOrientation(
  value: string | undefined,
  canvas: SaveTemplateInput["canvas"]
): PageOrientation {
  if (value === "landscape" || value === "portrait") {
    return value;
  }

  const width = Number(canvas?.width);
  const height = Number(canvas?.height);

  return width > height ? "landscape" : "portrait";
}

function normalizeTags(
  tags: string[] | undefined,
  categoryId: TemplateCategoryId,
  sheetSize: SheetSize,
  productType: ProductType
) {
  const values = [
    ...(Array.isArray(tags) ? tags : []),
    categoryId,
    sheetSize.toLowerCase(),
    productType.replaceAll("_", " ")
  ];

  return Array.from(new Set(values.map((tag) => tag.trim()).filter(Boolean))).slice(0, 12);
}

function normalizePositiveInt(value: number | undefined, fallback: number) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

function normalizeOptionalPositiveNumber(value: number | undefined) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function createEditorLayout(slug: string, input: SaveTemplateInput): TemplateEditorLayout {
  const canvasWidth = Math.max(1, Number(input.canvas?.width) || 1080);
  const canvasHeight = Math.max(1, Number(input.canvas?.height) || 1350);
  const slots = Array.isArray(input.frames)
    ? input.frames.map((frame, index) => toSlot(slug, frame, index, canvasWidth, canvasHeight))
    : [];
  const textFields = Array.isArray(input.textFields)
    ? input.textFields.map((field, index) =>
        toTextField(slug, field, index, canvasWidth, canvasHeight)
      )
    : [];

  return {
    slots: slots.filter((slot): slot is TemplateSlotSeed => Boolean(slot)),
    textFields: textFields.filter((field): field is TemplateTextFieldSeed => Boolean(field))
  };
}

function toSlot(
  slug: string,
  frame: Record<string, unknown>,
  index: number,
  canvasWidth: number,
  canvasHeight: number
): TemplateSlotSeed | null {
  const width = normalizeUnitValue(frame.widthPercent, frame.width, canvasWidth);
  const height = normalizeUnitValue(frame.heightPercent, frame.height, canvasHeight);

  if (width <= 0 || height <= 0) {
    return null;
  }

  const shape = normalizeSlotShape(frame.shape ?? frame.type);
  const zIndex = normalizePositiveInt(Number(frame.zIndex), index + 1);

  return {
    id: String(frame.id || `${slug}-slot-${index + 1}`),
    x: normalizeUnitValue(frame.xPercent, frame.x, canvasWidth),
    y: normalizeUnitValue(frame.yPercent, frame.y, canvasHeight),
    width,
    height,
    shape,
    role: normalizeSlotRole(frame.role, index),
    preferredOrientation: getPreferredOrientation(width, height),
    zIndex,
    borderRadius: normalizeBorderRadius(frame.radius, width, height),
    allowBlurFill: frame.allowBlurFill !== false,
    allowSmartCrop: frame.allowSmartCrop !== false
  };
}

function toTextField(
  slug: string,
  field: Record<string, unknown>,
  index: number,
  canvasWidth: number,
  canvasHeight: number
): TemplateTextFieldSeed | null {
  const key = slugify(String(field.key || field.id || `text-${index + 1}`));

  if (!key) {
    return null;
  }

  return {
    id: `${slug}-text-${key}`,
    key,
    label: String(field.label || field.name || `Text ${index + 1}`),
    placeholder: typeof field.placeholder === "string" ? field.placeholder : undefined,
    defaultValue: typeof field.defaultValue === "string" ? field.defaultValue : undefined,
    x: normalizeUnitValue(field.xPercent, field.x, canvasWidth),
    y: normalizeUnitValue(field.yPercent, field.y, canvasHeight),
    width: normalizeUnitValue(field.widthPercent, field.width, canvasWidth),
    height: normalizeUnitValue(field.heightPercent, field.height, canvasHeight),
    fontSize: Math.max(8, Number(field.fontSize) || 18),
    maxLength: Number.isFinite(Number(field.maxLength)) ? Number(field.maxLength) : undefined,
    isRequired: field.isRequired === true,
    zIndex: normalizePositiveInt(Number(field.zIndex), 20 + index)
  };
}

function normalizeUnitValue(percentValue: unknown, pixelValue: unknown, divisor: number) {
  const percent = Number(percentValue);

  if (Number.isFinite(percent)) {
    return clampUnit(percent);
  }

  const pixels = Number(pixelValue);

  if (!Number.isFinite(pixels)) {
    return 0;
  }

  if (pixels >= 0 && pixels <= 1) {
    return clampUnit(pixels);
  }

  return clampUnit(pixels / divisor);
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeSlotShape(value: unknown): TemplateSlotShape {
  if (value === "circle") return "circle";
  if (value === "heart") return "heart";
  if (value === "silhouette") return "silhouette";
  if (value === "number") return "number";
  if (value === "custom") return "custom";

  return "rect";
}

function normalizeSlotRole(value: unknown, index: number): TemplateSlotRole {
  if (
    value === "thumbnail" ||
    value === "shape_tile" ||
    value === "hero" ||
    value === "supporting"
  ) {
    return value;
  }

  return index === 0 ? "hero" : "supporting";
}

function normalizeBorderRadius(value: unknown, width: number, height: number) {
  const radius = Number(value);

  if (!Number.isFinite(radius) || radius <= 0) {
    return 0.04;
  }

  return Math.max(0, Math.min(0.5, radius / Math.max(width, height, 0.01)));
}

function getPreferredOrientation(width: number, height: number): TemplateOrientation {
  const ratio = width / Math.max(height, 0.01);

  if (ratio > 1.12) return "landscape";
  if (ratio < 0.88) return "portrait";
  return "square";
}

function countSlotOrientations(slots: TemplateSlotSeed[]) {
  return slots.reduce(
    (counts, slot) => {
      const orientation =
        slot.preferredOrientation ?? getPreferredOrientation(slot.width, slot.height);
      counts[orientation] += 1;
      return counts;
    },
    { portrait: 0, landscape: 0, square: 0 } satisfies Record<TemplateOrientation, number>
  );
}

function getSupportedOrientations(
  counts: Record<TemplateOrientation, number>
): TemplateOrientation[] {
  const orientations = (["portrait", "landscape", "square"] as const).filter(
    (orientation) => counts[orientation] > 0
  );

  return orientations.length ? orientations : ["portrait", "landscape", "square"];
}

function getCategoryFallbackImage(categoryId: TemplateCategoryId) {
  return categories.find((category) => category.id === categoryId)?.image ?? categories[0].image;
}

function applyAdminMetadata<TTemplate extends TemplateSeed>(
  template: TTemplate,
  metadata: TemplateAdminMetadata | undefined
): TTemplate {
  if (!metadata) {
    return template;
  }

  return {
    ...template,
    categoryId: metadata.categoryId ?? template.categoryId,
    description: metadata.description ?? template.description,
    priceLabel: metadata.priceLabel ?? template.priceLabel,
    ctaLabel: metadata.ctaLabel ?? template.ctaLabel,
    isFeatured: metadata.isFeatured ?? template.isFeatured
  };
}

async function readTemplateAdminMetadata(): Promise<Map<string, TemplateAdminMetadata>> {
  try {
    const metadata = JSON.parse(await readFile(localTemplateAdminMetadataPath, "utf8"));

    if (Array.isArray(metadata)) {
      return new Map(
        metadata
          .map(normalizeTemplateAdminMetadata)
          .filter((item): item is TemplateAdminMetadata => Boolean(item))
          .map((item) => [item.slug, item])
      );
    }

    if (metadata && typeof metadata === "object") {
      return new Map(
        Object.values(metadata)
          .map(normalizeTemplateAdminMetadata)
          .filter((item): item is TemplateAdminMetadata => Boolean(item))
          .map((item) => [item.slug, item])
      );
    }
  } catch {
    return new Map();
  }

  return new Map();
}

function normalizeTemplateAdminMetadata(value: unknown): TemplateAdminMetadata | null {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  const slug = typeof record?.slug === "string" ? record.slug.trim() : "";

  if (!record || !slug) {
    return null;
  }

  return {
    slug,
    categoryId: normalizeMetadataCategory(record.categoryId),
    adminCategoryId: getOptionalString(record.adminCategoryId),
    description: getOptionalString(record.description),
    priceLabel: getOptionalString(record.priceLabel),
    ctaLabel: getOptionalString(record.ctaLabel),
    isHidden: record.isHidden === true,
    isFeatured: record.isFeatured === true,
    updatedAt: getOptionalString(record.updatedAt)
  };
}

async function writeTemplateAdminMetadata(metadata: Map<string, TemplateAdminMetadata>) {
  await mkdir(path.dirname(localTemplateAdminMetadataPath), { recursive: true });
  await writeFile(
    localTemplateAdminMetadataPath,
    JSON.stringify(Object.fromEntries(metadata), null, 2)
  );
}

async function readAdminCategories(): Promise<StoredAdminTemplateCategory[]> {
  try {
    const categories = JSON.parse(await readFile(localAdminCategoriesPath, "utf8"));

    return Array.isArray(categories)
      ? categories
          .map(normalizeAdminCategory)
          .filter((category): category is StoredAdminTemplateCategory => Boolean(category))
      : [];
  } catch {
    return [];
  }
}

function normalizeAdminCategory(value: unknown): StoredAdminTemplateCategory | null {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  const id = getOptionalString(record?.id);
  const name = getOptionalString(record?.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    description: getOptionalString(record?.description) ?? "Admin planning category.",
    createdAt: getOptionalString(record?.createdAt) ?? new Date().toISOString()
  };
}

async function writeAdminCategories(
  categories: Array<{ id: string; name: string; description: string; createdAt: string }>
) {
  await mkdir(path.dirname(localAdminCategoriesPath), { recursive: true });
  await writeFile(localAdminCategoriesPath, JSON.stringify(categories, null, 2));
}

function getSafeAdminCategoryId(name: string, existingIds: Set<string>) {
  const baseSlug = slugify(name) || `category-${randomUUID().slice(0, 6)}`;

  if (!existingIds.has(baseSlug)) {
    return baseSlug;
  }

  return `${baseSlug}-${randomUUID().slice(0, 4)}`;
}

function getUniqueTemplateSlug(value: string, existingSlugs: Set<string>) {
  const baseSlug = slugify(value) || `saved-template-${randomUUID().slice(0, 8)}`;

  if (!existingSlugs.has(baseSlug) && !seedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${baseSlug}-${index}`;

    if (!existingSlugs.has(candidate) && !seedSlugs.has(candidate)) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomUUID().slice(0, 6)}`;
}

function cloneEditorLayoutForTemplate(
  slug: string,
  layout: TemplateEditorLayout
): TemplateEditorLayout {
  return {
    slots: layout.slots.map((slot, index) => ({
      ...slot,
      id: `${slug}-slot-${index + 1}`
    })),
    textFields: layout.textFields.map((field, index) => ({
      ...field,
      id: `${slug}-${field.key || `text-${index + 1}`}`
    }))
  };
}

function normalizeMetadataCategory(value: unknown): TemplateCategoryId | undefined {
  return categories.some((category) => category.id === value)
    ? (value as TemplateCategoryId)
    : undefined;
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function trimToUndefined(value: string | undefined) {
  return value?.trim() || undefined;
}

async function saveDataUrlPreview({ slug, dataUrl }: { slug: string; dataUrl: string }) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return savePreviewBuffer({
    slug,
    buffer: Buffer.from(match[2], "base64"),
    extension: extensionFromContentType(match[1]),
    fileName: `${slug}${extensionFromContentType(match[1])}`
  });
}

async function savePreviewBuffer({
  slug,
  buffer,
  extension,
  fileName
}: {
  slug: string;
  buffer: Buffer;
  extension: string;
  fileName: string;
}) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "preview";
  const objectName = `${randomUUID()}-${safeFileName}${safeFileName.endsWith(extension) ? "" : extension}`;
  const key = path.join("templates", slug, objectName).replaceAll("\\", "/");
  const absolutePath = path.join(localUploadRoot, key);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return `local://${key}`;
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

function extensionFromFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  return extension && extension.length <= 8 ? extension : null;
}

async function readLocalTemplates(): Promise<StoredTemplateRecord[]> {
  if (isProductionRuntime()) {
    return [];
  }

  try {
    const templates = JSON.parse(await readFile(localTemplateStorePath, "utf8"));

    return Array.isArray(templates)
      ? templates.map(withStoredTemplateDefaults).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

async function upsertLocalTemplate(template: StoredTemplateRecord) {
  assertLocalJsonFallbackAllowed("Template");
  const store = await readLocalTemplates();
  const nextStore = [template, ...store.filter((item) => item.slug !== template.slug)];

  await mkdir(path.dirname(localTemplateStorePath), { recursive: true });
  await writeFile(localTemplateStorePath, JSON.stringify(nextStore, null, 2));
}

function withStoredTemplateDefaults(template: StoredTemplateRecord): StoredTemplateRecord {
  return {
    ...template,
    id: template.id || template.slug,
    supportedOrientations: template.supportedOrientations ?? ["portrait", "landscape", "square"],
    bestFor: template.bestFor ?? [`${categoryLabels[template.categoryId]} gifts`],
    printNotes: template.printNotes ?? ["Saved from the admin template studio."],
    previewAlt: template.previewAlt || `${template.name} template preview`
  };
}

async function readDatabaseTemplates(): Promise<TemplateSeed[]> {
  if (!hasConfiguredDatabaseUrl()) {
    return [];
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
        slug: {
          notIn: Array.from(seedSlugs)
        }
      },
      orderBy: [
        {
          isFeatured: "desc"
        },
        {
          updatedAt: "desc"
        }
      ]
    });

    return templates.map(toTemplateSeedFromDatabase);
  } catch (error) {
    handleDatabaseFailure("Database template listing failed", error);
    return [];
  }
}

async function readDatabaseTemplateLayout(slug: string): Promise<TemplateEditorLayout | null> {
  if (!hasConfiguredDatabaseUrl()) {
    return null;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const template = await prisma.template.findUnique({
      where: {
        slug
      },
      include: {
        slots: {
          orderBy: {
            zIndex: "asc"
          }
        },
        textFields: {
          orderBy: {
            zIndex: "asc"
          }
        }
      }
    });

    if (!template) {
      return null;
    }

    return {
      slots: template.slots.map((slot) => ({
        id: slot.id,
        x: Number(slot.x),
        y: Number(slot.y),
        width: Number(slot.width),
        height: Number(slot.height),
        shape: fromPrismaSlotShape(slot.shape),
        role: fromPrismaSlotRole(slot.role),
        preferredOrientation: slot.preferredOrientation
          ? fromPrismaPhotoOrientation(slot.preferredOrientation)
          : undefined,
        zIndex: slot.zIndex,
        borderRadius: Number(slot.borderRadius),
        allowBlurFill: slot.allowBlurFill,
        allowSmartCrop: slot.allowSmartCrop
      })),
      textFields: template.textFields.map((field) => ({
        id: field.id,
        key: field.key,
        label: field.label,
        placeholder: field.placeholder ?? undefined,
        defaultValue: field.defaultValue ?? undefined,
        x: Number(field.x),
        y: Number(field.y),
        width: Number(field.width),
        height: Number(field.height),
        fontSize: Number(field.fontSize),
        maxLength: field.maxLength ?? undefined,
        isRequired: field.isRequired,
        zIndex: field.zIndex
      }))
    };
  } catch (error) {
    handleDatabaseFailure("Database template layout lookup failed", error);
    return null;
  }
}

async function upsertDatabaseTemplate(template: StoredTemplateRecord) {
  const { prisma } = await import("@/lib/prisma");

  await prisma.template.upsert({
    where: {
      slug: template.slug
    },
    update: {
      name: template.name,
      category: categoryToPrisma[template.categoryId],
      productType: productTypeToPrisma[template.productType],
      sheetSize: sheetSizeToPrisma[template.sheetSize],
      orientation: orientationToPrisma[template.orientation],
      widthMm: template.widthMm,
      heightMm: template.heightMm,
      productKind: template.productKind,
      minPhotos: template.minPhotos,
      maxPhotos: template.maxPhotos,
      preferredPortraitCount: template.preferredPortraitCount,
      preferredLandscapeCount: template.preferredLandscapeCount,
      preferredSquareCount: template.preferredSquareCount,
      hasCutGuides: template.hasCutGuides,
      cutLinePt: template.cutLinePt ?? 0.25,
      safeMarginMm: template.safeMarginMm,
      bleedMm: template.bleedMm,
      dpi: template.dpi,
      tags: template.tags,
      isActive: true,
      isFeatured: template.isFeatured,
      previewImageUrl: template.previewImage,
      slots: {
        deleteMany: {},
        create: toDatabaseSlots(template)
      },
      textFields: {
        deleteMany: {},
        create: toDatabaseTextFields(template)
      }
    },
    create: {
      slug: template.slug,
      name: template.name,
      category: categoryToPrisma[template.categoryId],
      productType: productTypeToPrisma[template.productType],
      sheetSize: sheetSizeToPrisma[template.sheetSize],
      orientation: orientationToPrisma[template.orientation],
      widthMm: template.widthMm,
      heightMm: template.heightMm,
      productKind: template.productKind,
      minPhotos: template.minPhotos,
      maxPhotos: template.maxPhotos,
      preferredPortraitCount: template.preferredPortraitCount,
      preferredLandscapeCount: template.preferredLandscapeCount,
      preferredSquareCount: template.preferredSquareCount,
      hasCutGuides: template.hasCutGuides,
      cutLinePt: template.cutLinePt ?? 0.25,
      safeMarginMm: template.safeMarginMm,
      bleedMm: template.bleedMm,
      dpi: template.dpi,
      tags: template.tags,
      isActive: true,
      isFeatured: template.isFeatured,
      previewImageUrl: template.previewImage,
      slots: {
        create: toDatabaseSlots(template)
      },
      textFields: {
        create: toDatabaseTextFields(template)
      }
    }
  });
}

function toDatabaseSlots(template: StoredTemplateRecord) {
  return (template.editorLayout?.slots ?? []).map((slot) => ({
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    shape: toPrismaSlotShape(slot.shape),
    role: toPrismaSlotRole(slot.role),
    preferredOrientation: slot.preferredOrientation
      ? toPrismaPhotoOrientation(slot.preferredOrientation)
      : undefined,
    zIndex: slot.zIndex,
    borderRadius: slot.borderRadius,
    allowBlurFill: slot.allowBlurFill,
    allowSmartCrop: slot.allowSmartCrop
  }));
}

function toDatabaseTextFields(template: StoredTemplateRecord) {
  return (template.editorLayout?.textFields ?? []).map((field) => ({
    key: field.key,
    label: field.label,
    placeholder: field.placeholder,
    defaultValue: field.defaultValue,
    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height,
    fontSize: field.fontSize,
    maxLength: field.maxLength,
    isRequired: field.isRequired,
    zIndex: field.zIndex
  }));
}

function toTemplateSeedFromDatabase(template: {
  id: string;
  slug: string;
  name: string;
  category: PrismaTemplateCategory;
  productType: PrismaProductType;
  sheetSize: PrismaSheetSize;
  orientation: PrismaTemplateOrientation;
  widthMm: unknown;
  heightMm: unknown;
  productKind: string | null;
  minPhotos: number;
  maxPhotos: number;
  preferredPortraitCount: number;
  preferredLandscapeCount: number;
  preferredSquareCount: number;
  hasCutGuides: boolean;
  cutLinePt: unknown;
  safeMarginMm: unknown;
  bleedMm: unknown;
  dpi: number;
  tags: string[];
  isFeatured: boolean;
  previewImageUrl: string;
}): TemplateSeed {
  const categoryId = prismaToCategory[template.category];
  const sheetSize = prismaToSheetSize[template.sheetSize];
  const orientation = prismaToOrientation[template.orientation];
  const description = `Saved ${categoryLabels[
    categoryId
  ].toLowerCase()} photo montage template from the admin library.`;

  return {
    id: template.id,
    slug: template.slug,
    name: template.name,
    categoryId,
    productType: prismaToProductType[template.productType],
    minPhotos: template.minPhotos,
    maxPhotos: template.maxPhotos,
    preferredPortraitCount: template.preferredPortraitCount,
    preferredLandscapeCount: template.preferredLandscapeCount,
    preferredSquareCount: template.preferredSquareCount,
    sheetSize,
    orientation,
    widthMm: template.widthMm === null ? undefined : Number(template.widthMm),
    heightMm: template.heightMm === null ? undefined : Number(template.heightMm),
    productKind: template.productKind ?? undefined,
    supportedOrientations: getSupportedOrientations({
      portrait: template.preferredPortraitCount,
      landscape: template.preferredLandscapeCount,
      square: template.preferredSquareCount
    }),
    hasCutGuides: template.hasCutGuides,
    cutLinePt: Number(template.cutLinePt),
    safeMarginMm: Number(template.safeMarginMm),
    bleedMm: Number(template.bleedMm),
    dpi: template.dpi,
    tags: template.tags,
    isFeatured: template.isFeatured,
    description,
    bestFor: [
      `${categoryLabels[categoryId]} gifts`,
      "Custom photo montage",
      "Premium printable keepsakes"
    ],
    printNotes: [
      `${sheetSize} ${orientation} template saved from the admin library.`,
      "Prepared with reusable photo slots for the editor.",
      "Preview appears in the public template category."
    ],
    previewImage: template.previewImageUrl,
    previewAlt: `${template.name} template preview`,
    seoTitle: `${template.name} Photo Montage Template`,
    seoDescription: description
  };
}

function toPrismaSlotShape(shape: TemplateSlotShape) {
  if (shape === "circle") return SlotShape.CIRCLE;
  if (shape === "heart") return SlotShape.HEART;
  if (shape === "silhouette") return SlotShape.SILHOUETTE;
  if (shape === "number") return SlotShape.NUMBER;
  if (shape === "custom") return SlotShape.CUSTOM;
  return SlotShape.RECT;
}

function fromPrismaSlotShape(shape: SlotShape): TemplateSlotShape {
  if (shape === SlotShape.CIRCLE) return "circle";
  if (shape === SlotShape.HEART) return "heart";
  if (shape === SlotShape.SILHOUETTE) return "silhouette";
  if (shape === SlotShape.NUMBER) return "number";
  if (shape === SlotShape.CUSTOM) return "custom";
  return "rect";
}

function toPrismaSlotRole(role: TemplateSlotRole) {
  if (role === "hero") return SlotRole.HERO;
  if (role === "thumbnail") return SlotRole.THUMBNAIL;
  if (role === "shape_tile") return SlotRole.SHAPE_TILE;
  return SlotRole.SUPPORTING;
}

function fromPrismaSlotRole(role: SlotRole): TemplateSlotRole {
  if (role === SlotRole.HERO) return "hero";
  if (role === SlotRole.THUMBNAIL) return "thumbnail";
  if (role === SlotRole.SHAPE_TILE) return "shape_tile";
  return "supporting";
}

function toPrismaPhotoOrientation(orientation: TemplateOrientation) {
  if (orientation === "landscape") return PhotoOrientation.LANDSCAPE;
  if (orientation === "square") return PhotoOrientation.SQUARE;
  return PhotoOrientation.PORTRAIT;
}

function fromPrismaPhotoOrientation(orientation: PhotoOrientation): TemplateOrientation {
  if (orientation === PhotoOrientation.LANDSCAPE) return "landscape";
  if (orientation === PhotoOrientation.SQUARE) return "square";
  return "portrait";
}

function slugify(value: string) {
  return String(value || "printili-template")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}
