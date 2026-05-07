import type { CategorySeed, TemplateSeed } from "@/types/templates";

export const categories: CategorySeed[] = [
  {
    id: "baby",
    slug: "baby",
    name: "Baby",
    description: "First year posters, birth details, and soft nursery-ready keepsakes.",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Baby smiling in soft natural light",
    seoTitle: "Baby Photo Montage Templates",
    seoDescription:
      "Browse printable baby photo montage templates for first year posters, birth info gifts, and nursery keepsakes."
  },
  {
    id: "couple",
    slug: "couple",
    name: "Couple",
    description: "Heart collages and romantic prints for anniversaries and love stories.",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Couple holding hands outdoors",
    seoTitle: "Couple Photo Montage Templates",
    seoDescription:
      "Browse romantic couple photo montage templates for anniversaries, love posters, and heart collages."
  },
  {
    id: "birthday",
    slug: "birthday",
    name: "Birthday",
    description: "Number collages and celebratory photo layouts made for gifting.",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Birthday cake with candles",
    seoTitle: "Birthday Photo Collage Templates",
    seoDescription:
      "Browse birthday number collage templates and printable celebration posters made from favorite photos."
  },
  {
    id: "family",
    slug: "family",
    name: "Family",
    description: "Warm story-led collages for family portraits and everyday moments.",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Family sitting together on a bed",
    seoTitle: "Family Photo Montage Templates",
    seoDescription:
      "Browse family photo montage templates for memory posters, parent gifts, and printed keepsakes."
  },
  {
    id: "wedding",
    slug: "wedding",
    name: "Wedding",
    description: "Welcome posters and elegant couple layouts for wedding celebrations.",
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Wedding couple standing together",
    seoTitle: "Wedding Photo Poster Templates",
    seoDescription:
      "Browse wedding welcome poster templates and elegant printable photo designs for wedding celebrations."
  },
  {
    id: "cut_sheet",
    slug: "cut-sheets",
    name: "Cut Sheets",
    description: "A4 photo sheets with equal pieces and fine cutting guide lines.",
    image:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Printed photos arranged on a table",
    seoTitle: "Cuttable Photo Sheet Templates",
    seoDescription:
      "Browse A4 cuttable photo sheet templates with equal grids and fine cutting guide lines."
  },
  {
    id: "custom",
    slug: "custom-gifts",
    name: "Custom Gifts",
    description: "Flexible decorative layouts for parents, personal stories, and mixed occasions.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Friends looking at printed photographs",
    seoTitle: "Custom Photo Gift Templates",
    seoDescription:
      "Browse custom printable photo gift templates for mother, father, family, and personal keepsake posters."
  }
];

export const featuredTemplates: TemplateSeed[] = [
  {
    id: "a4-polaroid-9",
    slug: "a4-9-polaroid-cut-sheet",
    name: "A4 9 Polaroid Cut Sheet",
    categoryId: "cut_sheet",
    productType: "cut_sheet",
    minPhotos: 9,
    maxPhotos: 9,
    preferredPortraitCount: 9,
    preferredLandscapeCount: 0,
    preferredSquareCount: 0,
    sheetSize: "A4",
    orientation: "portrait",
    supportedOrientations: ["portrait", "square"],
    hasCutGuides: true,
    cutLinePt: 0.25,
    safeMarginMm: 5,
    bleedMm: 0,
    dpi: 300,
    tags: ["a4", "polaroid", "cut sheet", "3x3", "print and cut"],
    isFeatured: true,
    description: "Nine equal Polaroid-style photo pieces in a 3x3 A4 cutting grid.",
    bestFor: ["Baby memories", "Couple mini prints", "Party favors", "Scrapbook pages"],
    printNotes: [
      "A4 portrait sheet with 3x3 equal pieces.",
      "Includes thin 0.25 pt cutting guide lines.",
      "Designed for clean cutting and physical finishing."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Printed instant photos arranged in a grid",
    seoTitle: "A4 9 Photo Polaroid Cut Sheet",
    seoDescription:
      "Create an A4 printable Polaroid photo sheet with 9 equal photos and fine cutting guide lines."
  },
  {
    id: "a4-landscape-8",
    slug: "a4-8-landscape-cut-sheet",
    name: "A4 8 Landscape Cut Sheet",
    categoryId: "cut_sheet",
    productType: "cut_sheet",
    minPhotos: 8,
    maxPhotos: 8,
    preferredPortraitCount: 0,
    preferredLandscapeCount: 8,
    preferredSquareCount: 0,
    sheetSize: "A4",
    orientation: "portrait",
    supportedOrientations: ["landscape"],
    hasCutGuides: true,
    cutLinePt: 0.25,
    safeMarginMm: 5,
    bleedMm: 0,
    dpi: 300,
    tags: ["a4", "landscape", "cut sheet", "2x4", "print and cut"],
    isFeatured: true,
    description: "Eight equal landscape photo pieces in a precise 2x4 A4 layout.",
    bestFor: ["Travel photos", "Wedding moments", "Family snapshots", "Landscape memories"],
    printNotes: [
      "A4 portrait sheet with 2x4 equal landscape pieces.",
      "Includes thin 0.25 pt cutting guide lines.",
      "Works best with horizontal photos."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Printed photographs laid out for cutting",
    seoTitle: "A4 8 Landscape Photo Cut Sheet",
    seoDescription:
      "Create an A4 printable landscape photo sheet with 8 equal photos and cutting guides."
  },
  {
    id: "baby-first-year",
    slug: "baby-first-year-poster",
    name: "Baby First Year Poster",
    categoryId: "baby",
    productType: "poster",
    minPhotos: 12,
    maxPhotos: 12,
    preferredPortraitCount: 8,
    preferredLandscapeCount: 0,
    preferredSquareCount: 4,
    sheetSize: "A3",
    orientation: "portrait",
    supportedOrientations: ["portrait", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["baby", "first year", "milestone", "poster"],
    isFeatured: true,
    description: "A soft milestone poster with one favorite photo for each month.",
    bestFor: ["First birthday gifts", "Nursery decor", "Baby milestone stories"],
    printNotes: [
      "A3 portrait decorative poster.",
      "Best with 12 clear monthly baby photos.",
      "Includes editable baby name and subtitle text."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Baby portrait for a first year photo poster",
    seoTitle: "Baby First Year Photo Poster",
    seoDescription:
      "Create a printable baby first year poster with 12 milestone photos and elegant keepsake styling."
  },
  {
    id: "baby-birth-info",
    slug: "baby-birth-info-silhouette",
    name: "Baby Birth Info Silhouette",
    categoryId: "baby",
    productType: "poster",
    minPhotos: 4,
    maxPhotos: 6,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 1,
    preferredSquareCount: 1,
    sheetSize: "A4",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["baby", "birth info", "silhouette", "nursery"],
    isFeatured: false,
    description: "A tender birth-info poster with a silhouette-led collage and baby details.",
    bestFor: ["Newborn gifts", "Birth announcements", "Nursery wall prints"],
    printNotes: [
      "A4 portrait keepsake poster.",
      "Includes editable name, birth date, weight, and height.",
      "Works best with one strong portrait and supporting detail photos."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Newborn baby wrapped in a soft blanket",
    seoTitle: "Baby Birth Info Silhouette Poster",
    seoDescription:
      "Create a printable baby birth info silhouette poster with newborn photos and editable birth details."
  },
  {
    id: "couple-heart",
    slug: "couple-heart-collage",
    name: "Couple Heart Collage",
    categoryId: "couple",
    productType: "poster",
    minPhotos: 18,
    maxPhotos: 24,
    preferredPortraitCount: 8,
    preferredLandscapeCount: 8,
    preferredSquareCount: 8,
    sheetSize: "A3",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["couple", "heart", "anniversary", "love", "collage"],
    isFeatured: true,
    description: "A romantic heart-shaped collage for anniversaries and love gifts.",
    bestFor: ["Anniversaries", "Valentine gifts", "Engagement memories", "Couple keepsakes"],
    printNotes: [
      "A3 portrait decorative poster.",
      "Designed for a large set of mixed photo orientations.",
      "Includes optional couple names text."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Couple holding hands for a romantic collage poster",
    seoTitle: "Couple Heart Photo Collage",
    seoDescription:
      "Create a romantic couple heart photo collage poster with 18 to 24 favorite relationship photos."
  },
  {
    id: "couple-love-poster",
    slug: "couple-love-poster",
    name: "Couple Love Poster",
    categoryId: "couple",
    productType: "poster",
    minPhotos: 6,
    maxPhotos: 8,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 2,
    preferredSquareCount: 2,
    sheetSize: "A4",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["couple", "love", "poster", "gift"],
    isFeatured: false,
    description: "A refined love-story poster with a hero photo and supporting memories.",
    bestFor: ["Simple couple gifts", "Engagement gifts", "Printed love notes"],
    printNotes: [
      "A4 portrait decorative poster.",
      "Best with one hero landscape photo and smaller supporting photos.",
      "Includes editable headline text."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Couple standing together for a love poster",
    seoTitle: "Couple Love Poster Template",
    seoDescription:
      "Create a printable couple love poster with a hero photo, supporting memories, and custom text."
  },
  {
    id: "birthday-number",
    slug: "birthday-number-collage",
    name: "Birthday Number Collage",
    categoryId: "birthday",
    productType: "poster",
    minPhotos: 12,
    maxPhotos: 18,
    preferredPortraitCount: 6,
    preferredLandscapeCount: 6,
    preferredSquareCount: 6,
    sheetSize: "A3",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["birthday", "number", "collage", "party"],
    isFeatured: false,
    description: "A celebratory number collage made from birthday memories.",
    bestFor: ["Kids birthdays", "Milestone birthdays", "Party table decor"],
    printNotes: [
      "A3 portrait decorative poster.",
      "Includes editable age number and name.",
      "Mixed photo orientations work well."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Birthday cake with candles for a number collage",
    seoTitle: "Birthday Number Photo Collage",
    seoDescription:
      "Create a printable birthday number collage poster with 12 to 18 photos and custom age text."
  },
  {
    id: "family-memory",
    slug: "family-memory-poster",
    name: "Family Memory Poster",
    categoryId: "family",
    productType: "poster",
    minPhotos: 8,
    maxPhotos: 10,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 4,
    preferredSquareCount: 2,
    sheetSize: "A3",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["family", "memory", "poster", "keepsake"],
    isFeatured: false,
    description: "A warm family poster with one hero memory and a balanced supporting grid.",
    bestFor: ["Family gifts", "Grandparent keepsakes", "Home memory walls"],
    printNotes: [
      "A3 portrait decorative poster.",
      "Best with one strong landscape hero photo.",
      "Includes editable family title text."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Family sitting together for a memory poster",
    seoTitle: "Family Memory Photo Poster",
    seoDescription:
      "Create a printable family memory poster with a hero photo and supporting family moments."
  },
  {
    id: "wedding-welcome",
    slug: "wedding-welcome-poster",
    name: "Wedding Welcome Poster",
    categoryId: "wedding",
    productType: "poster",
    minPhotos: 1,
    maxPhotos: 3,
    preferredPortraitCount: 1,
    preferredLandscapeCount: 2,
    preferredSquareCount: 0,
    sheetSize: "A3",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["wedding", "welcome", "poster", "event"],
    isFeatured: false,
    description: "An elegant welcome poster for wedding entrances and reception displays.",
    bestFor: ["Wedding welcome signs", "Reception tables", "Engagement events"],
    printNotes: [
      "A3 portrait event poster.",
      "Works with one main couple portrait and optional supporting photos.",
      "Includes editable names, welcome line, and wedding date."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Wedding couple for a welcome poster",
    seoTitle: "Wedding Welcome Photo Poster",
    seoDescription:
      "Create a printable wedding welcome poster with couple photos, names, and wedding date."
  },
  {
    id: "mother-father-gift",
    slug: "mother-father-gift-poster",
    name: "Mother/Father Gift Poster",
    categoryId: "custom",
    productType: "framed_gift",
    minPhotos: 5,
    maxPhotos: 9,
    preferredPortraitCount: 4,
    preferredLandscapeCount: 2,
    preferredSquareCount: 3,
    sheetSize: "A4",
    orientation: "portrait",
    supportedOrientations: ["portrait", "landscape", "square"],
    hasCutGuides: false,
    safeMarginMm: 8,
    bleedMm: 3,
    dpi: 300,
    tags: ["mother", "father", "parents", "gift", "poster"],
    isFeatured: false,
    description: "A thoughtful framed-gift poster for mothers, fathers, and grandparents.",
    bestFor: ["Mother's Day", "Father's Day", "Parent birthdays", "Grandparent gifts"],
    printNotes: [
      "A4 portrait gift poster.",
      "Designed for printing, finishing, and optional framing.",
      "Includes editable title and short gift message."
    ],
    previewImage:
      "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Parent holding a child close for a family gift poster",
    seoTitle: "Mother and Father Photo Gift Poster",
    seoDescription:
      "Create a printable mother or father gift poster with family photos and a personal message."
  }
];
