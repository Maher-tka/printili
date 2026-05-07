export type SeoLandingPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  examples: string[];
  keywords: string[];
  related: string[];
};

export const seoLandingPages: SeoLandingPage[] = [
  {
    slug: "photo-montage-print",
    title: "Custom Photo Montage Print",
    description:
      "Create a custom photo montage print with personalized photo collage layouts for A4 and A3 gifts.",
    h1: "Custom Photo Montage Print",
    intro:
      "Turn favorite phone photos into a polished printable photo collage, ready for printing, finishing, and delivery.",
    examples: ["Baby milestones", "Couple memories", "Family gifts"],
    keywords: [
      "custom photo montage print",
      "personalized photo collage",
      "impression montage photo"
    ],
    related: ["/templates", "/a4-photo-collage-print", "/a3-photo-collage-print"]
  },
  {
    slug: "baby-photo-poster",
    title: "Custom Baby Poster and First Year Photo Poster",
    description: "Design a custom baby poster, baby first year poster, or birth info photo print.",
    h1: "Custom Baby Poster",
    intro:
      "Create a soft, emotional poster photo personnalisé for newborn gifts and first birthday memories.",
    examples: ["Baby first year poster", "Birth info poster", "Nursery keepsake"],
    keywords: ["custom baby poster", "baby first year poster", "poster photo personnalisé"],
    related: ["/templates/baby", "/template/baby-first-year-poster", "/start"]
  },
  {
    slug: "couple-photo-gift",
    title: "Couple Anniversary Poster and Photo Gift",
    description: "Create a couple anniversary poster or romantic personalized photo gift.",
    h1: "Couple Photo Gift",
    intro:
      "Design a warm couple anniversary poster from favorite relationship photos and love-story moments.",
    examples: ["Heart collage", "Love poster", "Engagement gift"],
    keywords: [
      "couple anniversary poster",
      "personalized photo gift Tunisia",
      "cadeau personnalisé photo Tunisie"
    ],
    related: ["/templates/couple", "/template/couple-heart-collage", "/start"]
  },
  {
    slug: "birthday-photo-collage",
    title: "Birthday Photo Collage Print",
    description: "Create a birthday photo collage or number collage poster for celebrations.",
    h1: "Birthday Photo Collage",
    intro:
      "Build a printable birthday photo collage with favorite photos arranged into a celebratory design.",
    examples: ["Number collage", "Kids birthday poster", "Milestone birthday print"],
    keywords: ["birthday photo collage", "printable photo collage", "personalized photo collage"],
    related: ["/templates/birthday", "/template/birthday-number-collage", "/start"]
  },
  {
    slug: "family-photo-poster",
    title: "Family Photo Collage Print",
    description:
      "Create a family photo collage print for parent gifts, grandparents, and home memories.",
    h1: "Family Photo Poster",
    intro:
      "Collect family memories into a premium family photo collage print made for gifting and display.",
    examples: ["Family memory poster", "Parent gift", "Grandparent keepsake"],
    keywords: [
      "family photo collage print",
      "personalized photo gift Tunisia",
      "cadeau personnalisé photo Tunisie"
    ],
    related: ["/templates/family", "/template/family-memory-poster", "/custom-photo-gift-tunisia"]
  },
  {
    slug: "wedding-photo-print",
    title: "Wedding Welcome Poster and Photo Print",
    description: "Create a wedding welcome poster or elegant wedding photo print.",
    h1: "Wedding Photo Print",
    intro:
      "Design an elegant wedding welcome poster or printed couple keepsake for reception displays.",
    examples: ["Wedding welcome poster", "Engagement display", "Reception print"],
    keywords: [
      "wedding welcome poster",
      "photo collage A4 A3 print",
      "impression A4 A3 photo Tunisie"
    ],
    related: ["/templates/wedding", "/template/wedding-welcome-poster", "/start"]
  },
  {
    slug: "polaroid-cut-sheet",
    title: "Polaroid Photo Print Sheet",
    description: "Create a Polaroid photo print sheet with equal A4 cut lines.",
    h1: "Polaroid Photo Print Sheet",
    intro:
      "Print nine Polaroid-style photos on an A4 cut sheet with precise 0.25 pt cutting guides.",
    examples: ["9-photo A4 sheet", "Scrapbook pieces", "Party favors"],
    keywords: [
      "Polaroid photo print sheet",
      "photo collage A4 A3 print",
      "printable photo collage"
    ],
    related: ["/templates/cut-sheets", "/template/a4-9-polaroid-cut-sheet", "/start"]
  },
  {
    slug: "a4-photo-collage-print",
    title: "A4 Photo Collage Print",
    description: "Create an A4 photo collage print or printable photo collage gift.",
    h1: "A4 Photo Collage Print",
    intro:
      "Choose an A4 printable photo collage for cut sheets, framed gifts, and compact posters.",
    examples: ["A4 cut sheet", "A4 love poster", "A4 parent gift"],
    keywords: [
      "photo collage A4 A3 print",
      "impression A4 A3 photo Tunisie",
      "printable photo collage"
    ],
    related: ["/templates", "/polaroid-cut-sheet", "/start"]
  },
  {
    slug: "a3-photo-collage-print",
    title: "A3 Photo Collage Print",
    description: "Create a premium A3 photo collage print for larger posters and wall gifts.",
    h1: "A3 Photo Collage Print",
    intro:
      "Use A3 space for bigger memories, from baby first year posters to wedding and family prints.",
    examples: ["A3 baby poster", "A3 family collage", "A3 wedding welcome"],
    keywords: [
      "photo collage A4 A3 print",
      "custom photo montage print",
      "impression A4 A3 photo Tunisie"
    ],
    related: ["/templates", "/baby-photo-poster", "/wedding-photo-print"]
  },
  {
    slug: "custom-photo-gift-tunisia",
    title: "Personalized Photo Gift Tunisia",
    description:
      "Order a personalized photo gift in Tunisia with custom montage printing and delivery.",
    h1: "Personalized Photo Gift Tunisia",
    intro:
      "Create a cadeau personnalisé photo Tunisie with private uploads, protected previews, and cash on delivery.",
    examples: ["Mother/Father gift", "Couple gift", "Family keepsake"],
    keywords: [
      "personalized photo gift Tunisia",
      "cadeau personnalisé photo Tunisie",
      "impression montage photo"
    ],
    related: ["/templates/custom-gifts", "/start", "/photo-montage-print"]
  }
];
