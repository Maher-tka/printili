import type {
  TemplateEditorLayout,
  TemplateOrientation,
  TemplateSlotRole,
  TemplateSlotSeed,
  TemplateSlotShape,
  TemplateTextFieldSeed
} from "@/types/templates";

type SlotInput = {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: TemplateSlotShape;
  role?: TemplateSlotRole;
  preferredOrientation?: TemplateOrientation;
  zIndex?: number;
  borderRadius?: number;
  allowBlurFill?: boolean;
  allowSmartCrop?: boolean;
};

type TextFieldInput = {
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

function gridSlots({
  rows,
  columns,
  x,
  y,
  width,
  height,
  gapX,
  gapY,
  shape = "rect",
  role = "supporting",
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
  shape?: TemplateSlotShape;
  role?: TemplateSlotRole;
  preferredOrientation?: TemplateOrientation;
  borderRadius?: number;
  allowBlurFill?: boolean;
  allowSmartCrop?: boolean;
  zIndexStart?: number;
}): SlotInput[] {
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

function slots(slug: string, slotInputs: SlotInput[]): TemplateSlotSeed[] {
  return slotInputs.map((slot, index) => ({
    id: `${slug}-slot-${index + 1}`,
    shape: slot.shape ?? "rect",
    role: slot.role ?? "supporting",
    preferredOrientation: slot.preferredOrientation,
    zIndex: slot.zIndex ?? index + 1,
    borderRadius: slot.borderRadius ?? 0.04,
    allowBlurFill: slot.allowBlurFill ?? true,
    allowSmartCrop: slot.allowSmartCrop ?? true,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height
  }));
}

function textFields(slug: string, fields: TextFieldInput[] = []): TemplateTextFieldSeed[] {
  return fields.map((field, index) => ({
    id: `${slug}-text-${field.key}`,
    isRequired: field.isRequired ?? false,
    zIndex: field.zIndex ?? 20 + index,
    ...field
  }));
}

function layout(slug: string, slotInputs: SlotInput[], fields?: TextFieldInput[]) {
  return {
    slots: slots(slug, slotInputs),
    textFields: textFields(slug, fields)
  };
}

const a4PolaroidSlug = "a4-9-polaroid-cut-sheet";
const a4LandscapeSlug = "a4-8-landscape-cut-sheet";
const babyFirstYearSlug = "baby-first-year-poster";
const babyBirthInfoSlug = "baby-birth-info-silhouette";
const coupleHeartSlug = "couple-heart-collage";
const coupleLoveSlug = "couple-love-poster";
const birthdayNumberSlug = "birthday-number-collage";
const familyMemorySlug = "family-memory-poster";
const weddingWelcomeSlug = "wedding-welcome-poster";
const parentGiftSlug = "mother-father-gift-poster";
const graduationBottleLabelSlug = "graduation-water-bottle-label";
const graduationRoundStickerSlug = "graduation-round-juice-sticker";

export const templateLayouts: Record<string, TemplateEditorLayout> = {
  [graduationBottleLabelSlug]: layout(
    graduationBottleLabelSlug,
    [
      {
        x: 0.035,
        y: 0.12,
        width: 0.18,
        height: 0.76,
        shape: "rect",
        role: "hero",
        preferredOrientation: "portrait",
        zIndex: 1,
        borderRadius: 0.12
      }
    ],
    [
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
  ),
  [graduationRoundStickerSlug]: layout(
    graduationRoundStickerSlug,
    [
      {
        x: 0.28,
        y: 0.17,
        width: 0.44,
        height: 0.44,
        shape: "circle",
        role: "hero",
        preferredOrientation: "portrait",
        zIndex: 1,
        borderRadius: 0.5
      }
    ],
    [
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
  ),
  [a4PolaroidSlug]: layout(
    a4PolaroidSlug,
    gridSlots({
      rows: 3,
      columns: 3,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      gapX: 0,
      gapY: 0,
      role: "thumbnail",
      preferredOrientation: "portrait",
      borderRadius: 0,
      allowBlurFill: false
    })
  ),
  [a4LandscapeSlug]: layout(
    a4LandscapeSlug,
    gridSlots({
      rows: 4,
      columns: 2,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      gapX: 0,
      gapY: 0,
      role: "thumbnail",
      preferredOrientation: "landscape",
      borderRadius: 0,
      allowBlurFill: false
    })
  ),
  [babyFirstYearSlug]: layout(
    babyFirstYearSlug,
    gridSlots({
      rows: 3,
      columns: 4,
      x: 0.08,
      y: 0.26,
      width: 0.84,
      height: 0.58,
      gapX: 0.018,
      gapY: 0.022,
      role: "thumbnail",
      preferredOrientation: "portrait",
      borderRadius: 0.05
    }),
    [
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
  ),
  [babyBirthInfoSlug]: layout(
    babyBirthInfoSlug,
    [
      {
        x: 0.18,
        y: 0.17,
        width: 0.64,
        height: 0.43,
        shape: "silhouette",
        role: "hero",
        preferredOrientation: "portrait",
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
        role: "supporting",
        preferredOrientation: "square",
        borderRadius: 0.06,
        zIndexStart: 2
      })
    ],
    [
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
  ),
  [coupleHeartSlug]: layout(
    coupleHeartSlug,
    gridSlots({
      rows: 4,
      columns: 6,
      x: 0.08,
      y: 0.18,
      width: 0.84,
      height: 0.58,
      gapX: 0.012,
      gapY: 0.014,
      shape: "heart",
      role: "shape_tile",
      preferredOrientation: "square",
      borderRadius: 0.08
    }),
    [
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
  ),
  [coupleLoveSlug]: layout(
    coupleLoveSlug,
    [
      {
        x: 0.11,
        y: 0.13,
        width: 0.78,
        height: 0.38,
        shape: "rect",
        role: "hero",
        preferredOrientation: "landscape",
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
        role: "supporting",
        preferredOrientation: "square",
        borderRadius: 0.055,
        zIndexStart: 2
      })
    ],
    [
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
  ),
  [birthdayNumberSlug]: layout(
    birthdayNumberSlug,
    gridSlots({
      rows: 3,
      columns: 6,
      x: 0.1,
      y: 0.24,
      width: 0.8,
      height: 0.47,
      gapX: 0.014,
      gapY: 0.018,
      shape: "number",
      role: "shape_tile",
      preferredOrientation: "square",
      borderRadius: 0.06
    }),
    [
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
  ),
  [familyMemorySlug]: layout(
    familyMemorySlug,
    [
      {
        x: 0.09,
        y: 0.1,
        width: 0.82,
        height: 0.34,
        shape: "rect",
        role: "hero",
        preferredOrientation: "landscape",
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
        role: "supporting",
        preferredOrientation: "square",
        borderRadius: 0.055,
        zIndexStart: 2
      })
    ],
    [
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
  ),
  [weddingWelcomeSlug]: layout(
    weddingWelcomeSlug,
    [
      {
        x: 0.12,
        y: 0.12,
        width: 0.76,
        height: 0.48,
        shape: "rect",
        role: "hero",
        preferredOrientation: "portrait",
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
        role: "supporting",
        preferredOrientation: "landscape",
        borderRadius: 0.04,
        zIndexStart: 2
      })
    ],
    [
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
  ),
  [parentGiftSlug]: layout(
    parentGiftSlug,
    gridSlots({
      rows: 3,
      columns: 3,
      x: 0.12,
      y: 0.19,
      width: 0.76,
      height: 0.52,
      gapX: 0.018,
      gapY: 0.018,
      role: "supporting",
      preferredOrientation: "square",
      borderRadius: 0.065
    }),
    [
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
  )
};

export function getTemplateEditorLayout(slug: string): TemplateEditorLayout {
  return templateLayouts[slug] ?? { slots: [], textFields: [] };
}
