import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PhotoOrientation,
  PrismaClient,
  ProductType,
  SheetSize,
  SlotRole,
  SlotShape,
  TemplateCategory,
  TemplateOrientation
} from "../lib/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString })
  });
}

const prisma = createPrismaClient();

type SlotSeed = {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: SlotShape;
  role?: SlotRole;
  preferredOrientation?: PhotoOrientation;
  zIndex?: number;
  borderRadius?: number;
  allowBlurFill?: boolean;
  allowSmartCrop?: boolean;
};

type TextFieldSeed = {
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
  isRequired?: boolean;
  zIndex?: number;
};

type TemplateSeed = {
  slug: string;
  name: string;
  category: TemplateCategory;
  productType: ProductType;
  sheetSize: SheetSize;
  orientation: TemplateOrientation;
  widthMm?: number;
  heightMm?: number;
  productKind?: string;
  minPhotos: number;
  maxPhotos: number;
  preferredPortraitCount: number;
  preferredLandscapeCount: number;
  preferredSquareCount: number;
  hasCutGuides: boolean;
  cutLinePt?: number;
  safeMarginMm: number;
  bleedMm: number;
  dpi?: number;
  tags: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  version?: number;
  previewImageUrl: string;
  slots: SlotSeed[];
  textFields?: TextFieldSeed[];
};

function gridSlots({
  rows,
  columns,
  x,
  y,
  width,
  height,
  gapX,
  gapY,
  shape = SlotShape.RECT,
  role = SlotRole.SUPPORTING,
  preferredOrientation,
  borderRadius = 0.04,
  allowBlurFill = true,
  allowSmartCrop = true,
  zIndexStart = 1
}: {
  rows: number;
  columns: number;
  x: number;
  y: number;
  width: number;
  height: number;
  gapX: number;
  gapY: number;
  shape?: SlotShape;
  role?: SlotRole;
  preferredOrientation?: PhotoOrientation;
  borderRadius?: number;
  allowBlurFill?: boolean;
  allowSmartCrop?: boolean;
  zIndexStart?: number;
}): SlotSeed[] {
  const slotWidth = (width - gapX * (columns - 1)) / columns;
  const slotHeight = (height - gapY * (rows - 1)) / rows;

  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;

    return {
      x: x + column * (slotWidth + gapX),
      y: y + row * (slotHeight + gapY),
      width: slotWidth,
      height: slotHeight,
      shape,
      role,
      preferredOrientation,
      zIndex: zIndexStart + index,
      borderRadius,
      allowBlurFill,
      allowSmartCrop
    };
  });
}

const templateSeeds: TemplateSeed[] = [
  {
    slug: "graduation-water-bottle-label",
    name: "Graduation Water Bottle Label",
    category: TemplateCategory.GRADUATION,
    productType: ProductType.LABEL,
    sheetSize: SheetSize.CUSTOM,
    orientation: TemplateOrientation.LANDSCAPE,
    widthMm: 200,
    heightMm: 40,
    productKind: "graduation_bottle_label",
    minPhotos: 1,
    maxPhotos: 1,
    preferredPortraitCount: 1,
    preferredLandscapeCount: 0,
    preferredSquareCount: 0,
    hasCutGuides: true,
    cutLinePt: 0.25,
    safeMarginMm: 2,
    bleedMm: 2,
    tags: ["graduation", "water-bottle-label", "label", "party"],
    isFeatured: true,
    previewImageUrl: "/printili/cat-graduation-v2.webp",
    slots: [
      {
        x: 0.035,
        y: 0.12,
        width: 0.18,
        height: 0.76,
        shape: SlotShape.RECT,
        role: SlotRole.HERO,
        preferredOrientation: PhotoOrientation.PORTRAIT,
        zIndex: 1,
        borderRadius: 0.12
      }
    ],
    textFields: [
      {
        key: "graduate_name",
        label: "Graduate name",
        placeholder: "Mariam",
        x: 0.25,
        y: 0.16,
        width: 0.42,
        height: 0.24,
        fontSize: 20,
        maxLength: 42,
        isRequired: true,
        zIndex: 20
      },
      {
        key: "school_name",
        label: "School name",
        placeholder: "Printili School",
        x: 0.25,
        y: 0.42,
        width: 0.42,
        height: 0.16,
        fontSize: 11,
        maxLength: 44,
        zIndex: 21
      },
      {
        key: "graduation_year",
        label: "Graduation year",
        placeholder: "2026",
        x: 0.7,
        y: 0.16,
        width: 0.22,
        height: 0.26,
        fontSize: 18,
        maxLength: 8,
        isRequired: true,
        zIndex: 22
      },
      {
        key: "short_message",
        label: "Short message",
        placeholder: "Congratulations!",
        x: 0.25,
        y: 0.62,
        width: 0.62,
        height: 0.18,
        fontSize: 10,
        maxLength: 72,
        zIndex: 23
      }
    ]
  },
  {
    slug: "graduation-round-juice-sticker",
    name: "Graduation Round Juice Sticker",
    category: TemplateCategory.GRADUATION,
    productType: ProductType.STICKER,
    sheetSize: SheetSize.CUSTOM,
    orientation: TemplateOrientation.PORTRAIT,
    widthMm: 40,
    heightMm: 40,
    productKind: "graduation_round_sticker",
    minPhotos: 1,
    maxPhotos: 1,
    preferredPortraitCount: 1,
    preferredLandscapeCount: 0,
    preferredSquareCount: 0,
    hasCutGuides: true,
    cutLinePt: 0.25,
    safeMarginMm: 2,
    bleedMm: 2,
    tags: ["graduation", "round-sticker", "juice-sticker", "party"],
    isFeatured: true,
    previewImageUrl: "/printili/cat-graduation-v2.webp",
    slots: [
      {
        x: 0.28,
        y: 0.17,
        width: 0.44,
        height: 0.44,
        shape: SlotShape.CIRCLE,
        role: SlotRole.HERO,
        preferredOrientation: PhotoOrientation.PORTRAIT,
        zIndex: 1,
        borderRadius: 0.5
      }
    ],
    textFields: [
      {
        key: "graduate_name",
        label: "Graduate name",
        placeholder: "Mariam",
        x: 0.14,
        y: 0.64,
        width: 0.72,
        height: 0.12,
        fontSize: 15,
        maxLength: 30,
        isRequired: true,
        zIndex: 20
      },
      {
        key: "graduation_year",
        label: "Graduation year",
        placeholder: "2026",
        x: 0.26,
        y: 0.78,
        width: 0.48,
        height: 0.1,
        fontSize: 12,
        maxLength: 8,
        isRequired: true,
        zIndex: 21
      },
      {
        key: "short_message",
        label: "Short message",
        placeholder: "Congrats!",
        x: 0.18,
        y: 0.08,
        width: 0.64,
        height: 0.08,
        fontSize: 9,
        maxLength: 36,
        zIndex: 22
      }
    ]
  },
  {
    slug: "a4-9-polaroid-cut-sheet",
    name: "A4 9 Polaroid Cut Sheet",
    category: TemplateCategory.CUT_SHEET,
    productType: ProductType.CUT_SHEET,
    sheetSize: SheetSize.A4,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 9,
    maxPhotos: 9,
    preferredPortraitCount: 9,
    preferredLandscapeCount: 0,
    preferredSquareCount: 0,
    hasCutGuides: true,
    cutLinePt: 0.25,
    safeMarginMm: 5,
    bleedMm: 0,
    tags: ["a4", "polaroid", "cut-sheet", "3x3", "print-and-cut"],
    isFeatured: true,
    previewImageUrl:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=1200&q=80",
    slots: gridSlots({
      rows: 3,
      columns: 3,
      x: 0.055,
      y: 0.055,
      width: 0.89,
      height: 0.89,
      gapX: 0.018,
      gapY: 0.018,
      role: SlotRole.THUMBNAIL,
      preferredOrientation: PhotoOrientation.PORTRAIT,
      borderRadius: 0.025,
      allowBlurFill: false
    })
  },
  {
    slug: "a4-8-landscape-cut-sheet",
    name: "A4 8 Landscape Cut Sheet",
    category: TemplateCategory.CUT_SHEET,
    productType: ProductType.CUT_SHEET,
    sheetSize: SheetSize.A4,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 8,
    maxPhotos: 8,
    preferredPortraitCount: 0,
    preferredLandscapeCount: 8,
    preferredSquareCount: 0,
    hasCutGuides: true,
    cutLinePt: 0.25,
    safeMarginMm: 5,
    bleedMm: 0,
    tags: ["a4", "landscape", "cut-sheet", "2x4", "print-and-cut"],
    isFeatured: true,
    previewImageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    slots: gridSlots({
      rows: 4,
      columns: 2,
      x: 0.055,
      y: 0.055,
      width: 0.89,
      height: 0.89,
      gapX: 0.02,
      gapY: 0.018,
      role: SlotRole.THUMBNAIL,
      preferredOrientation: PhotoOrientation.LANDSCAPE,
      borderRadius: 0.018,
      allowBlurFill: false
    })
  },
  {
    slug: "baby-first-year-poster",
    name: "Baby First Year Poster",
    category: TemplateCategory.BABY,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A3,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 12,
    maxPhotos: 12,
    preferredPortraitCount: 8,
    preferredLandscapeCount: 0,
    preferredSquareCount: 4,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["baby", "first-year", "milestone", "poster"],
    isFeatured: true,
    previewImageUrl:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80",
    slots: gridSlots({
      rows: 3,
      columns: 4,
      x: 0.08,
      y: 0.26,
      width: 0.84,
      height: 0.58,
      gapX: 0.018,
      gapY: 0.022,
      role: SlotRole.THUMBNAIL,
      preferredOrientation: PhotoOrientation.PORTRAIT,
      borderRadius: 0.05
    }),
    textFields: [
      {
        key: "baby_name",
        label: "Baby name",
        placeholder: "Mila",
        x: 0.14,
        y: 0.1,
        width: 0.72,
        height: 0.08,
        fontSize: 34,
        maxLength: 40,
        isRequired: true,
        zIndex: 20
      },
      {
        key: "subtitle",
        label: "Subtitle",
        defaultValue: "My first year",
        x: 0.22,
        y: 0.18,
        width: 0.56,
        height: 0.04,
        fontSize: 14,
        maxLength: 60,
        zIndex: 21
      }
    ]
  },
  {
    slug: "baby-birth-info-silhouette",
    name: "Baby Birth Info Silhouette",
    category: TemplateCategory.BABY,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A4,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 4,
    maxPhotos: 6,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 1,
    preferredSquareCount: 1,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["baby", "birth-info", "silhouette", "nursery"],
    previewImageUrl:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80",
    slots: [
      {
        x: 0.18,
        y: 0.17,
        width: 0.64,
        height: 0.43,
        shape: SlotShape.SILHOUETTE,
        role: SlotRole.HERO,
        preferredOrientation: PhotoOrientation.PORTRAIT,
        zIndex: 1,
        borderRadius: 0.08
      },
      ...gridSlots({
        rows: 1,
        columns: 4,
        x: 0.12,
        y: 0.68,
        width: 0.76,
        height: 0.13,
        gapX: 0.016,
        gapY: 0,
        role: SlotRole.SUPPORTING,
        preferredOrientation: PhotoOrientation.SQUARE,
        borderRadius: 0.06,
        zIndexStart: 2
      })
    ],
    textFields: [
      {
        key: "baby_name",
        label: "Baby name",
        placeholder: "Adam",
        x: 0.18,
        y: 0.08,
        width: 0.64,
        height: 0.07,
        fontSize: 32,
        maxLength: 40,
        isRequired: true,
        zIndex: 20
      },
      {
        key: "birth_date",
        label: "Birth date",
        placeholder: "12 March 2026",
        x: 0.16,
        y: 0.84,
        width: 0.3,
        height: 0.04,
        fontSize: 11,
        maxLength: 32,
        zIndex: 21
      },
      {
        key: "birth_weight",
        label: "Birth weight",
        placeholder: "3.4 kg",
        x: 0.52,
        y: 0.84,
        width: 0.16,
        height: 0.04,
        fontSize: 11,
        maxLength: 16,
        zIndex: 22
      },
      {
        key: "birth_height",
        label: "Birth height",
        placeholder: "51 cm",
        x: 0.7,
        y: 0.84,
        width: 0.16,
        height: 0.04,
        fontSize: 11,
        maxLength: 16,
        zIndex: 23
      }
    ]
  },
  {
    slug: "couple-heart-collage",
    name: "Couple Heart Collage",
    category: TemplateCategory.COUPLE,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A3,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 18,
    maxPhotos: 24,
    preferredPortraitCount: 8,
    preferredLandscapeCount: 8,
    preferredSquareCount: 8,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["couple", "heart", "anniversary", "love", "collage"],
    isFeatured: true,
    previewImageUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    slots: gridSlots({
      rows: 4,
      columns: 6,
      x: 0.08,
      y: 0.18,
      width: 0.84,
      height: 0.58,
      gapX: 0.012,
      gapY: 0.014,
      shape: SlotShape.HEART,
      role: SlotRole.SHAPE_TILE,
      preferredOrientation: PhotoOrientation.SQUARE,
      borderRadius: 0.08
    }),
    textFields: [
      {
        key: "couple_names",
        label: "Couple names",
        placeholder: "Sana & Amir",
        x: 0.18,
        y: 0.8,
        width: 0.64,
        height: 0.07,
        fontSize: 30,
        maxLength: 50,
        zIndex: 40
      }
    ]
  },
  {
    slug: "couple-love-poster",
    name: "Couple Love Poster",
    category: TemplateCategory.COUPLE,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A4,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 6,
    maxPhotos: 8,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 2,
    preferredSquareCount: 2,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["couple", "love", "poster", "gift"],
    previewImageUrl:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    slots: [
      {
        x: 0.11,
        y: 0.13,
        width: 0.78,
        height: 0.38,
        shape: SlotShape.RECT,
        role: SlotRole.HERO,
        preferredOrientation: PhotoOrientation.LANDSCAPE,
        zIndex: 1,
        borderRadius: 0.045
      },
      ...gridSlots({
        rows: 2,
        columns: 4,
        x: 0.1,
        y: 0.56,
        width: 0.8,
        height: 0.25,
        gapX: 0.014,
        gapY: 0.018,
        role: SlotRole.SUPPORTING,
        preferredOrientation: PhotoOrientation.SQUARE,
        borderRadius: 0.055,
        zIndexStart: 2
      })
    ],
    textFields: [
      {
        key: "headline",
        label: "Headline",
        defaultValue: "Our love story",
        x: 0.18,
        y: 0.84,
        width: 0.64,
        height: 0.06,
        fontSize: 26,
        maxLength: 45,
        zIndex: 30
      }
    ]
  },
  {
    slug: "birthday-number-collage",
    name: "Birthday Number Collage",
    category: TemplateCategory.BIRTHDAY,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A3,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 12,
    maxPhotos: 18,
    preferredPortraitCount: 6,
    preferredLandscapeCount: 6,
    preferredSquareCount: 6,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["birthday", "number", "collage", "party"],
    previewImageUrl:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
    slots: gridSlots({
      rows: 3,
      columns: 6,
      x: 0.1,
      y: 0.24,
      width: 0.8,
      height: 0.47,
      gapX: 0.014,
      gapY: 0.018,
      shape: SlotShape.NUMBER,
      role: SlotRole.SHAPE_TILE,
      preferredOrientation: PhotoOrientation.SQUARE,
      borderRadius: 0.06
    }),
    textFields: [
      {
        key: "birthday_number",
        label: "Birthday number",
        placeholder: "5",
        x: 0.38,
        y: 0.08,
        width: 0.24,
        height: 0.12,
        fontSize: 56,
        maxLength: 2,
        isRequired: true,
        zIndex: 50
      },
      {
        key: "birthday_name",
        label: "Name",
        placeholder: "Yasmine",
        x: 0.18,
        y: 0.76,
        width: 0.64,
        height: 0.07,
        fontSize: 30,
        maxLength: 40,
        zIndex: 51
      }
    ]
  },
  {
    slug: "family-memory-poster",
    name: "Family Memory Poster",
    category: TemplateCategory.FAMILY,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A3,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 8,
    maxPhotos: 10,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 4,
    preferredSquareCount: 2,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["family", "memory", "poster", "keepsake"],
    previewImageUrl:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    slots: [
      {
        x: 0.09,
        y: 0.1,
        width: 0.82,
        height: 0.34,
        shape: SlotShape.RECT,
        role: SlotRole.HERO,
        preferredOrientation: PhotoOrientation.LANDSCAPE,
        zIndex: 1,
        borderRadius: 0.05
      },
      ...gridSlots({
        rows: 3,
        columns: 3,
        x: 0.1,
        y: 0.49,
        width: 0.8,
        height: 0.34,
        gapX: 0.016,
        gapY: 0.018,
        role: SlotRole.SUPPORTING,
        preferredOrientation: PhotoOrientation.SQUARE,
        borderRadius: 0.055,
        zIndexStart: 2
      })
    ],
    textFields: [
      {
        key: "family_title",
        label: "Family title",
        defaultValue: "Our family memories",
        x: 0.16,
        y: 0.86,
        width: 0.68,
        height: 0.05,
        fontSize: 24,
        maxLength: 55,
        zIndex: 40
      }
    ]
  },
  {
    slug: "wedding-welcome-poster",
    name: "Wedding Welcome Poster",
    category: TemplateCategory.WEDDING,
    productType: ProductType.POSTER,
    sheetSize: SheetSize.A3,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 1,
    maxPhotos: 3,
    preferredPortraitCount: 1,
    preferredLandscapeCount: 2,
    preferredSquareCount: 0,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["wedding", "welcome", "poster", "event"],
    previewImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    slots: [
      {
        x: 0.12,
        y: 0.12,
        width: 0.76,
        height: 0.48,
        shape: SlotShape.RECT,
        role: SlotRole.HERO,
        preferredOrientation: PhotoOrientation.PORTRAIT,
        zIndex: 1,
        borderRadius: 0.05
      },
      ...gridSlots({
        rows: 1,
        columns: 2,
        x: 0.18,
        y: 0.64,
        width: 0.64,
        height: 0.13,
        gapX: 0.02,
        gapY: 0,
        role: SlotRole.SUPPORTING,
        preferredOrientation: PhotoOrientation.LANDSCAPE,
        borderRadius: 0.04,
        zIndexStart: 2
      })
    ],
    textFields: [
      {
        key: "welcome_line",
        label: "Welcome line",
        defaultValue: "Welcome to the wedding of",
        x: 0.16,
        y: 0.79,
        width: 0.68,
        height: 0.04,
        fontSize: 14,
        maxLength: 60,
        zIndex: 30
      },
      {
        key: "couple_names",
        label: "Couple names",
        placeholder: "Leila & Sami",
        x: 0.14,
        y: 0.84,
        width: 0.72,
        height: 0.07,
        fontSize: 32,
        maxLength: 55,
        isRequired: true,
        zIndex: 31
      },
      {
        key: "wedding_date",
        label: "Wedding date",
        placeholder: "06 May 2026",
        x: 0.24,
        y: 0.92,
        width: 0.52,
        height: 0.035,
        fontSize: 12,
        maxLength: 40,
        zIndex: 32
      }
    ]
  },
  {
    slug: "mother-father-gift-poster",
    name: "Mother/Father Gift Poster",
    category: TemplateCategory.FAMILY,
    productType: ProductType.FRAMED_GIFT,
    sheetSize: SheetSize.A4,
    orientation: TemplateOrientation.PORTRAIT,
    minPhotos: 5,
    maxPhotos: 9,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 2,
    preferredSquareCount: 3,
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    tags: ["mother", "father", "parents", "gift", "poster"],
    previewImageUrl:
      "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=1200&q=80",
    slots: gridSlots({
      rows: 3,
      columns: 3,
      x: 0.12,
      y: 0.19,
      width: 0.76,
      height: 0.52,
      gapX: 0.018,
      gapY: 0.018,
      role: SlotRole.SUPPORTING,
      preferredOrientation: PhotoOrientation.SQUARE,
      borderRadius: 0.065
    }),
    textFields: [
      {
        key: "gift_title",
        label: "Gift title",
        defaultValue: "For the best parents",
        x: 0.16,
        y: 0.08,
        width: 0.68,
        height: 0.07,
        fontSize: 28,
        maxLength: 50,
        zIndex: 40
      },
      {
        key: "gift_message",
        label: "Gift message",
        placeholder: "Thank you for every beautiful memory.",
        x: 0.15,
        y: 0.76,
        width: 0.7,
        height: 0.09,
        fontSize: 14,
        maxLength: 140,
        zIndex: 41
      }
    ]
  }
];

async function main() {
  for (const templateSeed of templateSeeds) {
    const { slots, textFields = [], ...template } = templateSeed;

    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {
        ...template,
        widthMm: template.widthMm,
        heightMm: template.heightMm,
        productKind: template.productKind,
        slots: {
          deleteMany: {},
          create: slots
        },
        textFields: {
          deleteMany: {},
          create: textFields
        }
      },
      create: {
        ...template,
        widthMm: template.widthMm,
        heightMm: template.heightMm,
        productKind: template.productKind,
        slots: {
          create: slots
        },
        textFields: {
          create: textFields
        }
      }
    });
  }

  console.log(`Seeded ${templateSeeds.length} MVP templates.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
