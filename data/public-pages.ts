export type PublicPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  primaryCta: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
  highlights: Array<{
    title: string;
    description: string;
  }>;
  sections: Array<{
    title: string;
    body: string;
  }>;
  related: Array<{
    href: string;
    label: string;
  }>;
};

export const publicPages: PublicPage[] = [
  {
    slug: "occasions",
    title: "Shop Photo Gifts by Occasion",
    description:
      "Browse Printili photo gifts by birthdays, weddings, anniversaries, baby milestones, holidays, and family moments.",
    eyebrow: "Shop by occasion",
    heading: "Find the right keepsake for the moment.",
    intro:
      "Move from birthday joy to wedding elegance, baby milestones, family stories, and thoughtful gifts without losing the warm Printili feel.",
    heroImage: "/printili/memory-gift-heart-hq.webp",
    heroAlt: "Gift box wrapped with printed family photos",
    primaryCta: { href: "/templates", label: "Browse all products" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      {
        title: "Birthdays",
        description: "Number collages and celebratory prints made for milestone gifting."
      },
      {
        title: "Weddings",
        description: "Elegant welcome prints, framed memories, and romantic keepsakes."
      },
      {
        title: "Family moments",
        description: "Warm photo stories for parents, grandparents, and everyday memories."
      }
    ],
    sections: [
      {
        title: "Made for gifting",
        body: "Every occasion page leads into the same easy flow: choose a style, add photos, preview the result, and finish with a keepsake that feels personal."
      },
      {
        title: "A softer way to browse",
        body: "Use occasions when you know the reason for the gift before you know the exact product. It keeps choosing fast without making the experience feel transactional."
      }
    ],
    related: [
      { href: "/templates/birthday", label: "Birthday prints" },
      { href: "/templates/wedding", label: "Wedding prints" },
      { href: "/templates/baby", label: "Baby collages" }
    ]
  },
  {
    slug: "gallery",
    title: "Printili Gallery",
    description:
      "Explore realistic Printili photo products, framed memories, books, gifts, and printed keepsakes.",
    eyebrow: "Gallery",
    heading: "See how memories live after they are printed.",
    intro:
      "Frames, photo books, collages, mugs, and gifts all carry the same warm, realistic look that defines Printili.",
    heroImage: "/printili/story-real-smiles-wide-hq.webp",
    heroAlt: "Heart-shaped photo wall above a bed with warm lights",
    primaryCta: { href: "/templates", label: "Explore products" },
    secondaryCta: { href: "/start", label: "Create yours" },
    highlights: [
      {
        title: "Wall displays",
        description: "Framed collages and poster prints built to become part of the room."
      },
      {
        title: "Tabletop gifts",
        description: "Personal pieces that feel intimate, warm, and easy to give."
      },
      {
        title: "Story formats",
        description: "Books, albums, and collages that preserve more than one favorite moment."
      }
    ],
    sections: [
      {
        title: "Real products first",
        body: "Printili imagery stays grounded in real objects, natural light, and believable scale so customers can picture the finished gift clearly."
      },
      {
        title: "One visual language",
        body: "The gallery keeps the same cream palette, coral details, and softly lit photography as the homepage instead of feeling like a separate brand."
      }
    ],
    related: [
      { href: "/best-sellers", label: "Best sellers" },
      { href: "/new-arrivals", label: "New arrivals" },
      { href: "/templates", label: "All products" }
    ]
  },
  {
    slug: "how-it-works",
    title: "How Printili Works",
    description:
      "Learn how Printili turns phone photos into printed gifts from upload through preview and delivery.",
    eyebrow: "How it works",
    heading: "From phone photos to a finished keepsake.",
    intro:
      "Choose a product, upload photos, arrange the design, approve the preview, and send a beautiful printed memory into the real world.",
    heroImage: "/printili/hero-clean-scene.png",
    heroAlt: "Phone photos becoming printed products and framed memories",
    primaryCta: { href: "/start", label: "Start creating" },
    secondaryCta: { href: "/templates", label: "Browse products" },
    highlights: [
      {
        title: "1. Choose",
        description: "Start with an occasion, product, or template that fits the memory."
      },
      {
        title: "2. Personalize",
        description: "Upload photos, arrange them, and preview the design with confidence."
      },
      {
        title: "3. Receive",
        description: "Approve the result and move into print-ready delivery."
      }
    ],
    sections: [
      {
        title: "Simple on purpose",
        body: "The customer flow stays calm and visual while the print-safe details happen quietly behind the scenes."
      },
      {
        title: "Preview before print",
        body: "Every project is designed to reach a clear approval moment before it becomes a physical product."
      }
    ],
    related: [
      { href: "/start", label: "Start now" },
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-delivery", label: "Shipping" }
    ]
  },
  {
    slug: "gift-cards",
    title: "Printili Gift Cards",
    description: "Give a Printili gift card for personalized photo prints, books, frames, and keepsakes.",
    eyebrow: "Gift cards",
    heading: "Give them the joy of choosing their own memory.",
    intro:
      "Gift cards keep the present personal while letting the recipient choose the photos and format that mean the most to them.",
    heroImage: "/printili/cat-gift-cards.webp",
    heroAlt: "Printili gift card on a warm tabletop",
    primaryCta: { href: "/start", label: "Create a gift" },
    secondaryCta: { href: "/templates", label: "Browse products" },
    highlights: [
      {
        title: "Flexible",
        description: "Perfect when you know the person but not the exact photo story."
      },
      {
        title: "Thoughtful",
        description: "Feels warmer than a generic voucher because it leads to a real keepsake."
      },
      {
        title: "Easy to pair",
        description: "Works beautifully with birthdays, weddings, and family occasions."
      }
    ],
    sections: [
      {
        title: "A gift with room to personalize",
        body: "Instead of guessing the best format, let the recipient turn their own favorite memories into something they will actually keep."
      },
      {
        title: "Still very Printili",
        body: "Gift cards stay inside the same warm product universe as the rest of the site, not as a disconnected checkout add-on."
      }
    ],
    related: [
      { href: "/occasions", label: "Shop by occasion" },
      { href: "/best-sellers", label: "Best sellers" },
      { href: "/contact-us", label: "Need help?" }
    ]
  },
  {
    slug: "best-sellers",
    title: "Best Selling Photo Gifts",
    description:
      "Browse Printili best sellers, including framed collages, polaroid prints, photo books, and family gifts.",
    eyebrow: "Best sellers",
    heading: "The gifts customers come back for.",
    intro:
      "A focused collection of the products that make the quickest emotional connection and the easiest first purchase.",
    heroImage: "/printili/memory-decorate-space-hq.webp",
    heroAlt: "Framed photo collage held against a warm wall",
    primaryCta: { href: "/templates", label: "Browse products" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      {
        title: "Wall frames",
        description: "A strong choice when the memory deserves to live in the room."
      },
      {
        title: "Photo books",
        description: "A natural favorite for stories that need more than one page."
      },
      {
        title: "Polaroid prints",
        description: "Easy, tactile, and instantly giftable."
      }
    ],
    sections: [
      {
        title: "Confidence for first-time buyers",
        body: "Best sellers are where indecisive customers can begin without feeling like they are browsing a huge catalog."
      },
      {
        title: "Built from the homepage story",
        body: "The collection reflects the same products already introduced in the hero, so the next click feels natural."
      }
    ],
    related: [
      { href: "/new-arrivals", label: "New arrivals" },
      { href: "/gift-cards", label: "Gift cards" },
      { href: "/templates", label: "All products" }
    ]
  },
  {
    slug: "new-arrivals",
    title: "New Photo Gift Arrivals",
    description: "Discover new Printili templates, gift formats, and personalized photo products.",
    eyebrow: "New arrivals",
    heading: "Fresh ways to keep favorite moments close.",
    intro:
      "New arrivals highlight the latest formats while staying inside the same soft, realistic Printili design language.",
    heroImage: "/printili/memory-relive-days-hq.webp",
    heroAlt: "Open photo book on a warm fabric surface",
    primaryCta: { href: "/templates", label: "See the collection" },
    secondaryCta: { href: "/occasions", label: "Shop by occasion" },
    highlights: [
      {
        title: "Photo books",
        description: "Fresh layouts for longer stories and milestone memories."
      },
      {
        title: "Personalized gifts",
        description: "New keepsakes designed for gifting, not just printing."
      },
      {
        title: "Seasonal drops",
        description: "New ideas for holidays, anniversaries, and celebrations."
      }
    ],
    sections: [
      {
        title: "New without feeling random",
        body: "Every addition should still look like Printili: warm light, premium typography, soft depth, and real products."
      },
      {
        title: "A reason to revisit",
        body: "New arrivals give returning customers a clear place to check what has changed since their last order."
      }
    ],
    related: [
      { href: "/best-sellers", label: "Best sellers" },
      { href: "/gallery", label: "Gallery" },
      { href: "/templates", label: "All products" }
    ]
  },
  {
    slug: "anniversaries",
    title: "Anniversary Photo Gifts",
    description: "Browse romantic anniversary prints, couple collages, and personalized photo gifts.",
    eyebrow: "Anniversaries",
    heading: "Celebrate the years you have already made together.",
    intro:
      "Romantic keepsakes for couples, love stories, engagement memories, and the everyday photos that became part of the relationship.",
    heroImage: "/printili/story-real-smiles-wide-hq.webp",
    heroAlt: "Heart-shaped wall collage made from couple photos",
    primaryCta: { href: "/templates/couple", label: "Browse couple gifts" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      {
        title: "Heart collages",
        description: "A visual favorite for relationship milestones."
      },
      {
        title: "Love posters",
        description: "Simple, refined formats for a quieter gift."
      },
      {
        title: "Photo books",
        description: "Best when the story deserves chapters, not one frame."
      }
    ],
    sections: [
      {
        title: "More personal than flowers",
        body: "Anniversary gifts work best when they carry the shared history of the couple, not just the date."
      },
      {
        title: "Built for romantic photography",
        body: "Warm tones, natural light, and softer product scenes keep these gifts intimate instead of generic."
      }
    ],
    related: [
      { href: "/templates/couple", label: "Couple templates" },
      { href: "/gift-cards", label: "Gift cards" },
      { href: "/gallery", label: "Gallery" }
    ]
  },
  {
    slug: "holidays",
    title: "Holiday Photo Gifts",
    description:
      "Shop personalized holiday photo gifts, keepsakes, framed prints, and gift-ready photo products.",
    eyebrow: "Holidays",
    heading: "Turn the season into something they can keep.",
    intro:
      "Holiday gifts that feel thoughtful without losing the warmth, softness, and realism of the core Printili brand.",
    heroImage: "/printili/memory-gift-heart-hq.webp",
    heroAlt: "Wrapped photo gift with a red ribbon",
    primaryCta: { href: "/templates", label: "Browse holiday gifts" },
    secondaryCta: { href: "/gift-cards", label: "View gift cards" },
    highlights: [
      {
        title: "Gift-ready",
        description: "Photo products already made to feel personal when opened."
      },
      {
        title: "Family-friendly",
        description: "Easy formats for parents, grandparents, and shared memories."
      },
      {
        title: "Seasonal",
        description: "A better home for campaign moments than crowding the homepage."
      }
    ],
    sections: [
      {
        title: "A warmer kind of seasonal shop",
        body: "Holiday pages should feel like Printili first and seasonal second, so the site stays premium rather than novelty-driven."
      },
      {
        title: "Easy to personalize",
        body: "The strongest seasonal gifts still begin with the customer’s own photos and story."
      }
    ],
    related: [
      { href: "/gift-cards", label: "Gift cards" },
      { href: "/best-sellers", label: "Best sellers" },
      { href: "/occasions", label: "Occasions" }
    ]
  },
  {
    slug: "shipping-delivery",
    title: "Shipping and Delivery",
    description: "See how Printili handles delivery, order handoff, and print-ready fulfillment.",
    eyebrow: "Shipping & delivery",
    heading: "Printed with care. Delivered with the same care.",
    intro:
      "A clear handoff from approved design to finished product, with delivery language that stays simple and reassuring.",
    heroImage: "/printili/memory-photo-book.png",
    heroAlt: "Photo book being held in warm light",
    primaryCta: { href: "/start", label: "Start a project" },
    secondaryCta: { href: "/contact-us", label: "Contact us" },
    highlights: [
      {
        title: "Protected approval",
        description: "Orders move forward after the design is reviewed and approved."
      },
      {
        title: "Careful production",
        description: "Print-safe checks happen before a file becomes a physical product."
      },
      {
        title: "Clear support",
        description: "Customers know where to go if they need help before delivery."
      }
    ],
    sections: [
      {
        title: "What happens after approval",
        body: "Once the preview is confirmed, the order moves into production and delivery preparation."
      },
      {
        title: "Built for confidence",
        body: "This page keeps the fulfillment story straightforward so customers feel guided, not buried in policy language."
      }
    ],
    related: [
      { href: "/returns-refunds", label: "Returns & refunds" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact-us", label: "Contact us" }
    ]
  },
  {
    slug: "returns-refunds",
    title: "Returns and Refunds",
    description: "Review Printili return, refund, and support guidance for personalized photo products.",
    eyebrow: "Returns & refunds",
    heading: "Support that stays human after checkout too.",
    intro:
      "Personalized products need clear expectations, warm communication, and an easy path to help when something is not right.",
    heroImage: "/printili/memory-cherish-moment-hq.webp",
    heroAlt: "Photo mug with printed snapshots on a table",
    primaryCta: { href: "/contact-us", label: "Contact support" },
    secondaryCta: { href: "/faq", label: "Read FAQ" },
    highlights: [
      {
        title: "Personalized",
        description: "Every order is made from customer photos and approved design choices."
      },
      {
        title: "Clear",
        description: "Questions about issues, damage, or mistakes should have an obvious next step."
      },
      {
        title: "Respectful",
        description: "Support language should feel calm, direct, and genuinely helpful."
      }
    ],
    sections: [
      {
        title: "Designed to prevent surprises",
        body: "Preview approval and print-safe checks reduce the need for corrections after production."
      },
      {
        title: "When help is needed",
        body: "Customers should be able to reach a real support path quickly rather than hunt through the site."
      }
    ],
    related: [
      { href: "/shipping-delivery", label: "Shipping" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact-us", label: "Contact us" }
    ]
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    description: "Read common Printili questions about uploads, templates, privacy, previews, and delivery.",
    eyebrow: "FAQ",
    heading: "Answers before you need to ask.",
    intro:
      "Quick guidance for uploads, privacy, previews, products, and delivery, written in the same calm tone as the rest of the brand.",
    heroImage: "/printili/hero-clean-scene.png",
    heroAlt: "Printili products arranged in a premium hero scene",
    primaryCta: { href: "/contact-us", label: "Contact us" },
    secondaryCta: { href: "/how-it-works", label: "How it works" },
    highlights: [
      {
        title: "Uploads",
        description: "How many photos you need and what happens after selection."
      },
      {
        title: "Privacy",
        description: "How project photos remain private while you work."
      },
      {
        title: "Delivery",
        description: "What happens after preview approval and printing."
      }
    ],
    sections: [
      {
        title: "Can I start before choosing a template?",
        body: "Yes. You can begin with photos first, then move into recommendations and template selection."
      },
      {
        title: "Can I see the result before print?",
        body: "Yes. The flow is built around a protected preview and approval step before production."
      }
    ],
    related: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/shipping-delivery", label: "Shipping" },
      { href: "/contact-us", label: "Contact us" }
    ]
  },
  {
    slug: "contact-us",
    title: "Contact Printili",
    description: "Contact Printili for help choosing products, uploading photos, or checking an order.",
    eyebrow: "Contact us",
    heading: "Need help choosing the right keepsake?",
    intro:
      "Questions about products, photos, orders, or gift ideas should feel easy to ask and easy to solve.",
    heroImage: "/printili/story-real-smiles-wide-hq.webp",
    heroAlt: "Warm heart-shaped collage wall scene",
    primaryCta: { href: "/start", label: "Start a project" },
    secondaryCta: { href: "/faq", label: "Read FAQ" },
    highlights: [
      {
        title: "Product help",
        description: "Need help choosing between frames, books, or collages?"
      },
      {
        title: "Photo guidance",
        description: "Unsure which images will work best for a design?"
      },
      {
        title: "Order support",
        description: "Need help after preview, approval, or delivery?"
      }
    ],
    sections: [
      {
        title: "A warm support tone",
        body: "Printili support should feel like the brand itself: clear, reassuring, and personal."
      },
      {
        title: "Start with the reason",
        body: "Tell us what you want to create, and the right product or template becomes easier to recommend."
      }
    ],
    related: [
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-delivery", label: "Shipping" },
      { href: "/returns-refunds", label: "Returns" }
    ]
  },
  {
    slug: "about-us",
    title: "About Printili",
    description: "Learn about Printili and the belief that phone photos deserve a life beyond the screen.",
    eyebrow: "About us",
    heading: "We make phone photos feel worth keeping again.",
    intro:
      "Printili exists to turn everyday images into printed memories, thoughtful gifts, and objects people actually live with.",
    heroImage: "/printili/hero-clean-scene.png",
    heroAlt: "Printili photo products arranged in soft sunlight",
    primaryCta: { href: "/gallery", label: "View gallery" },
    secondaryCta: { href: "/start", label: "Create yours" },
    highlights: [
      {
        title: "Memory-first",
        description: "The emotional value of the photo leads the product experience."
      },
      {
        title: "Product-real",
        description: "We show real keepsakes, not abstract placeholders."
      },
      {
        title: "Gift-ready",
        description: "Every design should feel natural to give and meaningful to receive."
      }
    ],
    sections: [
      {
        title: "The Printili idea",
        body: "A beautiful memory deserves more than a camera roll. It deserves a place in the room, on the desk, or in someone’s hands."
      },
      {
        title: "How that shapes the site",
        body: "Warm color, premium serif type, realistic products, and restrained copy all serve the same purpose: make the memory feel real."
      }
    ],
    related: [
      { href: "/sustainability", label: "Sustainability" },
      { href: "/gallery", label: "Gallery" },
      { href: "/careers", label: "Careers" }
    ]
  },
  {
    slug: "sustainability",
    title: "Printili Sustainability",
    description: "Read how Printili frames more thoughtful material choices and lasting keepsakes.",
    eyebrow: "Sustainability",
    heading: "Made to last is part of the design.",
    intro:
      "A keepsake should not feel disposable. Better choices begin with thoughtful products, clearer materials, and gifts people want to keep.",
    heroImage: "/printili/cat-canvas-prints.webp",
    heroAlt: "Warm canvas print product scene",
    primaryCta: { href: "/templates", label: "Browse products" },
    secondaryCta: { href: "/about-us", label: "About Printili" },
    highlights: [
      {
        title: "Longer life",
        description: "Products designed to stay visible and meaningful over time."
      },
      {
        title: "Thoughtful choices",
        description: "A calmer product system with less disposable visual noise."
      },
      {
        title: "Premium finish",
        description: "Quality and longevity work together, not against each other."
      }
    ],
    sections: [
      {
        title: "Why it matters here",
        body: "Printili products are meant to be held onto, framed, gifted, and remembered rather than replaced quickly."
      },
      {
        title: "A practical direction",
        body: "The site keeps sustainability connected to product quality and long-term use, not vague claims."
      }
    ],
    related: [
      { href: "/about-us", label: "About us" },
      { href: "/gallery", label: "Gallery" },
      { href: "/templates", label: "Products" }
    ]
  },
  {
    slug: "blog",
    title: "Printili Journal",
    description: "Read Printili stories, gift ideas, and inspiration for turning photos into keepsakes.",
    eyebrow: "Journal",
    heading: "Ideas for the memories you want to keep.",
    intro:
      "A gentle home for gift ideas, product inspiration, and practical guidance around choosing photos that print beautifully.",
    heroImage: "/printili/memory-relive-days-hq.webp",
    heroAlt: "Open photo book on a table",
    primaryCta: { href: "/gallery", label: "View gallery" },
    secondaryCta: { href: "/templates", label: "Browse products" },
    highlights: [
      {
        title: "Gift guides",
        description: "Thoughtful ideas for occasions, relationships, and budgets."
      },
      {
        title: "Photo tips",
        description: "How to choose images that tell a stronger story."
      },
      {
        title: "Product inspiration",
        description: "Ways to use frames, books, and collages at home."
      }
    ],
    sections: [
      {
        title: "Useful, not filler",
        body: "The journal should help customers make better keepsakes, not simply publish content for its own sake."
      },
      {
        title: "Still visual",
        body: "Even editorial pages stay image-led and emotionally warm so the brand does not suddenly become text-heavy."
      }
    ],
    related: [
      { href: "/gallery", label: "Gallery" },
      { href: "/occasions", label: "Occasions" },
      { href: "/best-sellers", label: "Best sellers" }
    ]
  },
  {
    slug: "careers",
    title: "Careers at Printili",
    description: "Explore career opportunities with Printili and help turn memories into meaningful products.",
    eyebrow: "Careers",
    heading: "Build a brand people feel in their homes.",
    intro:
      "Work on products, design, and customer experiences that turn digital photos into real keepsakes.",
    heroImage: "/printili/memory-decorate-space-hq.webp",
    heroAlt: "Framed collage being held in warm light",
    primaryCta: { href: "/contact-us", label: "Contact us" },
    secondaryCta: { href: "/about-us", label: "About Printili" },
    highlights: [
      {
        title: "Craft",
        description: "Care about product detail, image quality, and finishing touches."
      },
      {
        title: "Empathy",
        description: "Build for customers preserving moments that matter to them."
      },
      {
        title: "Taste",
        description: "Keep the work premium, restrained, and emotionally clear."
      }
    ],
    sections: [
      {
        title: "What we value",
        body: "Warmth, precision, ownership, and a bias toward experiences that feel finished."
      },
      {
        title: "What makes the work interesting",
        body: "Printili sits where design, technology, and real physical products meet, which keeps the problems tangible and human."
      }
    ],
    related: [
      { href: "/about-us", label: "About us" },
      { href: "/gallery", label: "Gallery" },
      { href: "/contact-us", label: "Contact us" }
    ]
  },
  {
    slug: "polaroid-prints",
    title: "Polaroid Prints",
    description: "Create warm Polaroid-style prints from the photos you love.",
    eyebrow: "Polaroid prints",
    heading: "Small prints with a big memory feel.",
    intro:
      "Retro-inspired photo prints made for gifting, scrapbooks, desks, and the moments you want to hold in your hands.",
    heroImage: "/printili/cat-polaroids.webp",
    heroAlt: "Polaroid-style prints arranged in warm light",
    primaryCta: { href: "/templates/cut-sheets", label: "Browse Polaroid designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Tactile", description: "Easy to hold, gift, and arrange." },
      { title: "Retro", description: "A soft nostalgic look that still feels premium." },
      { title: "Flexible", description: "Perfect for mini stories, parties, and keepsake sets." }
    ],
    sections: [
      {
        title: "Best for everyday memories",
        body: "Polaroid prints work beautifully when the story is made of many smaller moments rather than one formal portrait."
      },
      {
        title: "Easy to personalize",
        body: "Choose the photos, arrange the sequence, and create a set that feels unmistakably yours."
      }
    ],
    related: [
      { href: "/templates/cut-sheets", label: "Cut sheet templates" },
      { href: "/photo-collages", label: "Photo collages" },
      { href: "/start", label: "Start creating" }
    ]
  },
  {
    slug: "birthday-number-collage",
    title: "Birthday Number Collage",
    description: "Create a birthday number collage from favorite photos.",
    eyebrow: "Birthday number collage",
    heading: "Turn a birthday into the story of a year.",
    intro:
      "Celebrate a milestone with a bold number shape filled with memories, smiles, and moments worth framing.",
    heroImage: "/printili/cat-birthday.webp",
    heroAlt: "Birthday number collage product scene",
    primaryCta: { href: "/templates/birthday", label: "Browse birthday designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Celebratory", description: "Built for birthdays and milestone years." },
      { title: "Personal", description: "The age becomes a frame for the whole story." },
      { title: "Display-ready", description: "A strong choice for tables, walls, and party decor." }
    ],
    sections: [
      {
        title: "A gift and a decoration",
        body: "Number collages do double duty: they look special during the celebration and remain meaningful afterward."
      },
      {
        title: "Works with many photos",
        body: "Use the full year of memories instead of choosing only one favorite image."
      }
    ],
    related: [
      { href: "/templates/birthday", label: "Birthday templates" },
      { href: "/occasions", label: "Occasions" },
      { href: "/gift-cards", label: "Gift cards" }
    ]
  },
  {
    slug: "wall-frames",
    title: "Wall Frames",
    description: "Create framed photo memories for your walls.",
    eyebrow: "Wall frames",
    heading: "Give your favorite moments a place in the room.",
    intro:
      "Framed prints and collages that make digital memories feel permanent, polished, and easy to live with.",
    heroImage: "/printili/cat-wall-frames.webp",
    heroAlt: "Wall frame product scene in a bright room",
    primaryCta: { href: "/templates/custom-gifts", label: "Browse wall-ready designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Room-ready", description: "Designed to feel at home on real walls." },
      { title: "Premium", description: "A stronger finish for the photos that matter most." },
      { title: "Giftable", description: "Ideal for homes, couples, and family occasions." }
    ],
    sections: [
      {
        title: "From screen to space",
        body: "Frames make a memory part of daily life instead of something buried in a camera roll."
      },
      {
        title: "A natural first product",
        body: "Wall frames are often the easiest way to turn one strong photo story into a lasting keepsake."
      }
    ],
    related: [
      { href: "/photo-collages", label: "Photo collages" },
      { href: "/best-sellers", label: "Best sellers" },
      { href: "/gallery", label: "Gallery" }
    ]
  },
  {
    slug: "photo-books",
    title: "Photo Books",
    description: "Create photo books that preserve favorite days from start to finish.",
    eyebrow: "Photo books",
    heading: "For memories that need more than one frame.",
    intro:
      "A softer, slower format for travel, anniversaries, baby milestones, and stories that unfold page by page.",
    heroImage: "/printili/cat-photo-books.webp",
    heroAlt: "Open photo book in warm natural light",
    primaryCta: { href: "/templates", label: "Browse photo products" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Story-led", description: "Best for sequences, chapters, and longer memories." },
      { title: "Gift-worthy", description: "A polished choice for anniversaries and family stories." },
      { title: "Tactile", description: "A product people return to, not just glance at." }
    ],
    sections: [
      {
        title: "A natural format for many photos",
        body: "When the story is bigger than one composition, a book keeps the full emotional arc intact."
      },
      {
        title: "Premium by feel",
        body: "The best photo books feel substantial, warm, and made to be reopened."
      }
    ],
    related: [
      { href: "/photo-collages", label: "Photo collages" },
      { href: "/new-arrivals", label: "New arrivals" },
      { href: "/gallery", label: "Gallery" }
    ]
  },
  {
    slug: "photo-collages",
    title: "Photo Collages",
    description: "Create personalized photo collages from favorite memories.",
    eyebrow: "Photo collages",
    heading: "Bring many favorite moments into one beautiful print.",
    intro:
      "Balanced layouts for families, couples, milestones, and any story that deserves more than a single image.",
    heroImage: "/printili/cat-photo-collages.webp",
    heroAlt: "Printed photo collage display",
    primaryCta: { href: "/templates", label: "Browse collage designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Flexible", description: "Works across couples, birthdays, babies, and families." },
      { title: "Expressive", description: "Lets one product carry a fuller story." },
      { title: "Display-ready", description: "Beautiful as a print, frame, or gift." }
    ],
    sections: [
      {
        title: "The heart of Printili",
        body: "Collages are where multiple photos become one emotional object instead of a scattered collection."
      },
      {
        title: "Easy to personalize",
        body: "Choose the story, add the photos, and let the structure hold everything together."
      }
    ],
    related: [
      { href: "/templates", label: "All templates" },
      { href: "/wall-frames", label: "Wall frames" },
      { href: "/start", label: "Start creating" }
    ]
  },
  {
    slug: "canvas-prints",
    title: "Canvas Prints",
    description: "Create warm canvas prints from your favorite photos.",
    eyebrow: "Canvas prints",
    heading: "A softer, gallery-style way to keep the moment.",
    intro:
      "Canvas prints add depth and presence to favorite images while staying warm, refined, and giftable.",
    heroImage: "/printili/cat-canvas-prints.webp",
    heroAlt: "Canvas print product scene",
    primaryCta: { href: "/templates", label: "Browse products" },
    secondaryCta: { href: "/gallery", label: "View gallery" },
    highlights: [
      { title: "Textured", description: "A more tactile finish for hero memories." },
      { title: "Decorative", description: "Strong for homes, bedrooms, and gallery walls." },
      { title: "Refined", description: "Premium without becoming formal or cold." }
    ],
    sections: [
      {
        title: "Made for display",
        body: "Canvas works especially well when the customer wants one moment to own the wall."
      },
      {
        title: "Still personal",
        body: "The finish elevates the photo without taking away the warmth of the memory."
      }
    ],
    related: [
      { href: "/wall-frames", label: "Wall frames" },
      { href: "/gallery", label: "Gallery" },
      { href: "/best-sellers", label: "Best sellers" }
    ]
  },
  {
    slug: "personalized-gifts",
    title: "Personalized Gifts",
    description: "Create thoughtful personalized photo gifts for people you love.",
    eyebrow: "Personalized gifts",
    heading: "A gift feels better when it carries a real memory.",
    intro:
      "Thoughtful keepsakes for parents, couples, families, and anyone who deserves something more personal than generic decor.",
    heroImage: "/printili/cat-personalized-gifts.webp",
    heroAlt: "Personalized pillow gift scene",
    primaryCta: { href: "/templates/custom-gifts", label: "Browse gift templates" },
    secondaryCta: { href: "/occasions", label: "Shop by occasion" },
    highlights: [
      { title: "Thoughtful", description: "Chosen for the person, not just the occasion." },
      { title: "Flexible", description: "Works across framed gifts, prints, and keepsakes." },
      { title: "Warm", description: "Feels intimate from the first glance." }
    ],
    sections: [
      {
        title: "The strongest Printili category",
        body: "Personalized gifts are where product, memory, and occasion come together most naturally."
      },
      {
        title: "Easy to make meaningful",
        body: "A few good photos can turn a simple object into something impossible to duplicate."
      }
    ],
    related: [
      { href: "/gift-cards", label: "Gift cards" },
      { href: "/occasions", label: "Occasions" },
      { href: "/best-sellers", label: "Best sellers" }
    ]
  },
  {
    slug: "mugs",
    title: "Photo Mugs",
    description: "Create photo mugs that bring favorite memories into everyday moments.",
    eyebrow: "Mugs",
    heading: "Memories that warm every sip.",
    intro:
      "A practical gift with emotional pull, perfect for family photos, couple memories, and thoughtful daily reminders.",
    heroImage: "/printili/cat-mugs.webp",
    heroAlt: "Photo mug in warm light",
    primaryCta: { href: "/templates/custom-gifts", label: "Browse mug gifts" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Everyday", description: "A memory people actually use, not just admire." },
      { title: "Giftable", description: "Easy for parents, partners, and family." },
      { title: "Personal", description: "Simple format, strong emotional return." }
    ],
    sections: [
      {
        title: "A small product with real presence",
        body: "Mugs work because they bring the photo into ordinary life again and again."
      },
      {
        title: "Best with simple stories",
        body: "One or two strong photos can make this category feel especially personal."
      }
    ],
    related: [
      { href: "/personalized-gifts", label: "Personalized gifts" },
      { href: "/gift-cards", label: "Gift cards" },
      { href: "/occasions", label: "Occasions" }
    ]
  },
  {
    slug: "wedding-prints",
    title: "Wedding Prints",
    description: "Create elegant wedding photo prints and welcome keepsakes.",
    eyebrow: "Wedding prints",
    heading: "Elegant keepsakes for the day everything changes.",
    intro:
      "Welcome posters, couple prints, and wedding memories designed with a softer, more refined finish.",
    heroImage: "/printili/cat-wedding-prints.webp",
    heroAlt: "Wedding photo print in warm light",
    primaryCta: { href: "/templates/wedding", label: "Browse wedding designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Elegant", description: "Designed for ceremonies, receptions, and keepsake display." },
      { title: "Romantic", description: "A natural home for couple portraits and vows." },
      { title: "Gift-ready", description: "Beautiful for newlyweds and loved ones alike." }
    ],
    sections: [
      {
        title: "Made for both event and memory",
        body: "Wedding products can guide the day itself, then remain meaningful long after it is over."
      },
      {
        title: "Softly premium",
        body: "Refined typography and warm photography keep the category elegant without becoming stiff."
      }
    ],
    related: [
      { href: "/templates/wedding", label: "Wedding templates" },
      { href: "/anniversaries", label: "Anniversaries" },
      { href: "/gallery", label: "Gallery" }
    ]
  },
  {
    slug: "baby-collages",
    title: "Baby Collages",
    description: "Create tender baby collages and first-year keepsakes.",
    eyebrow: "Baby collages",
    heading: "Tiny moments, gathered beautifully.",
    intro:
      "Baby milestones, nursery prints, and first-year memories designed to feel soft, emotional, and lasting.",
    heroImage: "/printili/cat-baby-collages.webp",
    heroAlt: "Baby collage product scene",
    primaryCta: { href: "/templates/baby", label: "Browse baby designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Milestone-ready", description: "Perfect for monthly photos and first birthdays." },
      { title: "Soft", description: "Warm styling that suits nurseries and family gifts." },
      { title: "Cherished", description: "A natural keepsake for parents and grandparents." }
    ],
    sections: [
      {
        title: "Built for first-year stories",
        body: "Baby collages help parents turn many small changes into one keepsake worth keeping."
      },
      {
        title: "A gentler visual language",
        body: "The category stays tender and calm instead of overly playful or cartoon-like."
      }
    ],
    related: [
      { href: "/templates/baby", label: "Baby templates" },
      { href: "/gift-cards", label: "Gift cards" },
      { href: "/gallery", label: "Gallery" }
    ]
  },
  {
    slug: "family-albums",
    title: "Family Albums",
    description: "Create family albums and memory prints from favorite shared moments.",
    eyebrow: "Family albums",
    heading: "Your family story, beautifully preserved.",
    intro:
      "Albums, prints, and collages for the everyday moments that become the memories everyone keeps.",
    heroImage: "/printili/cat-family-albums.webp",
    heroAlt: "Family album product scene",
    primaryCta: { href: "/templates/family", label: "Browse family designs" },
    secondaryCta: { href: "/start", label: "Start creating" },
    highlights: [
      { title: "Story-rich", description: "Made for many photos and shared history." },
      { title: "Home-ready", description: "A warm fit for shelves, tables, and family spaces." },
      { title: "Giftable", description: "Especially meaningful for parents and grandparents." }
    ],
    sections: [
      {
        title: "Made for shared memories",
        body: "Family products work best when they carry many people, years, and small everyday moments together."
      },
      {
        title: "A lasting home object",
        body: "Albums and collages give family photos a physical place to live beyond the phone."
      }
    ],
    related: [
      { href: "/templates/family", label: "Family templates" },
      { href: "/photo-books", label: "Photo books" },
      { href: "/best-sellers", label: "Best sellers" }
    ]
  }
];
