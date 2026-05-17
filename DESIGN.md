# Printili Design System

## Goal

Printili must feel like a premium personalized photo-printing brand.

The website should look emotional, clean, warm, realistic, and professional - not like a generic template website.

The main feeling:

> Turn phone photos into real printed memories, gifts, frames, collages, and keepsakes.

---

## Core Design Direction

Printili uses a premium photo-product showcase style.

The visual style should include:

- warm cream / beige backgrounds
- realistic printed products
- soft shadows
- natural sunlight
- premium serif typography
- clean spacing
- minimal text
- elegant coral/peach accent color
- realistic product mockups
- rounded cards
- subtle depth
- emotional photography

The website should feel closer to:

- Apple product pages
- Framer landing pages
- premium photo printing brands
- luxury gift e-commerce
- modern Figma-style animated landing pages

It should NOT feel like:

- a cheap SaaS template
- a basic Shopify theme
- a colorful cartoon website
- a generic AI-generated layout
- a flat card-heavy dashboard
- a text-heavy page

---

## Brand Colors

Use this palette unless specifically instructed otherwise.

```css
:root {
  --background: #f8f1e8;
  --background-soft: #fffaf3;
  --card: rgba(255, 250, 243, 0.82);
  --text-main: #161616;
  --text-muted: #5f5b55;
  --accent: #d87355;
  --accent-soft: #f3c4b1;
  --border-soft: rgba(40, 30, 20, 0.12);
  --shadow-soft: 0 20px 60px rgba(67, 44, 24, 0.14);
}
```

Main colors:

- Background: warm cream / beige
- Text: near black
- Accent: coral / peach
- Cards: soft off-white glass effect
- Shadows: warm brown transparent shadows

Avoid:

- pure white backgrounds everywhere
- bright blue
- neon colors
- harsh black blocks
- random gradients
- too many colors

## Typography

```css
font-family: "Playfair Display", "Cormorant Garamond", Georgia, serif;
font-family: "Inter", "Manrope", Arial, sans-serif;
```

Use elegant typography.

Recommended:

```css
font-family: "Playfair Display", "Cormorant Garamond", Georgia, serif;
font-family: "Inter", "Manrope", Arial, sans-serif;
```

Typography rules:

- Large hero headlines should use a premium serif font.
- UI text, buttons, nav, and cards should use a clean sans-serif font.
- Accent words can use italic serif styling.
- Do not use cartoon fonts.
- Do not use too many font styles.

Example hero headline style:

```css
.hero-title {
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(3.2rem, 6vw, 6.8rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: var(--text-main);
}

.hero-title .accent {
  color: var(--accent);
  font-style: italic;
  font-weight: 500;
}
```

## Hero Section Rules

The Printili hero is the most important section.

Current baseline:

- Use the selected static hero image as the locked visual reference.
- Do not redesign it.
- Do not recreate the objects with CSS.
- Do not change the visual direction.
- Do not replace the realistic product scene with flat illustrations.

Hero must include:

- Printili logo
- clean navigation
- large emotional headline
- short subtext
- primary CTA
- secondary CTA
- trust row
- realistic product scene
- phone/photo stream/heart concept
- product category cards below

Hero headline direction:

From your phone to forever treasured

Alternative acceptable headline style:

From everyday moments to timeless keepsakes

The word treasured or timeless keepsakes should use the coral accent.

## Product Scene Rules

The product scene should always feel realistic.

Use:

- iPhone / smartphone
- photos coming out of phone
- photos forming a heart shape
- framed collage
- photo book
- tabletop frame
- birthday number collage
- polaroid prints
- realistic shadows
- soft sunlight
- warm interior background

Do not use:

- flat SVG objects for products
- cartoon product drawings
- random icons as product previews
- fake placeholder gray boxes
- low-quality stock-looking mockups
- harsh drop shadows
- unrealistic proportions

Important rule:

If realistic product assets exist, use them. Do not redraw them with CSS.

## Static Hero Baseline Rule

For now, the static hero image is the visual baseline.

When modifying the homepage:

- Keep the static hero unchanged first.
- Add new sections below it.
- Do not alter the hero unless specifically asked.
- If replacing parts of the hero with HTML, replace only one part at a time.

Phase plan:

1. Phase 1: Use full static hero image.
2. Phase 2: Replace only buttons with real HTML buttons.
3. Phase 3: Replace only category cards with real HTML cards.
4. Phase 4: Replace product objects with separated image assets.
5. Phase 5: Add scroll/parallax animation.

Never jump from Phase 1 directly to Phase 5.

## Category Card Rules

Category cards should look premium and visual.

Each card should include:

- small coral icon
- category title
- short description
- realistic product thumbnail
- circular arrow button

Allowed categories:

- Polaroid Prints
- Birthday Number Collage
- Wall Frames
- Photo Books
- Photo Collages
- Canvas Prints
- Personalized Gifts
- Mugs
- Gift Cards
- Wedding Prints
- Baby Collages
- Family Albums

Card style:

```css
.category-card {
  border-radius: 28px;
  background: rgba(255, 250, 243, 0.86);
  border: 1px solid rgba(40, 30, 20, 0.08);
  box-shadow: 0 18px 50px rgba(67, 44, 24, 0.12);
  backdrop-filter: blur(18px);
}
```

Do not make category cards:

- too colorful
- too text-heavy
- sharp-cornered
- flat gray boxes
- full of random icons
- dashboard-like

## Button Rules

Primary button:

- black / near black background
- white text
- rounded corners
- arrow icon
- premium spacing

Secondary button:

- transparent or soft cream
- subtle border
- black text
- rounded corners

Example:

```css
.btn-primary {
  background: #151515;
  color: white;
  border-radius: 14px;
  padding: 16px 28px;
  font-weight: 600;
}

.btn-secondary {
  background: rgba(255, 250, 243, 0.6);
  color: #151515;
  border: 1px solid rgba(20, 20, 20, 0.18);
  border-radius: 14px;
  padding: 16px 28px;
  font-weight: 600;
}
```

Avoid:

- bright blue buttons
- huge gradients
- square buttons
- many button styles
- random hover effects

## Animation Rules

Animation should be subtle and premium.

Allowed:

- slow floating
- soft parallax
- gentle fade-in
- slight rotation
- scroll-linked movement
- horizontal category carousel
- product-to-product transitions

Avoid:

- bouncing
- spinning
- shaking
- fast movement
- cartoon effects
- over-animated UI

Recommended animation tools:

- Framer Motion
- CSS transform
- opacity
- translateY
- rotate
- scale

Animation direction:

- Phone moves slightly down on scroll.
- Heart photo stream moves slightly up.
- Framed collage moves slower for depth.
- Category cards fade in from below.
- Product carousel slides gently between categories.

## Layout Rules

Use generous spacing.

Desktop:

- hero should feel wide and cinematic
- text on left
- product scene on right
- category cards below

Tablet:

- keep split layout if possible
- reduce product scene size
- avoid clutter

Mobile:

- stack text first
- show product image below
- category cards become horizontal scroll
- hide tiny decorative labels if needed

Do not squeeze the desktop layout into mobile.

## Image Rules

Use high-quality images only.

Product images should be:

- realistic
- warm-toned
- softly lit
- consistent with the hero
- not random stock-looking
- not cartoon-like

For generated image references:

- Use them as design direction.
- Do not let Codex reinterpret them.
- If possible, use them directly as assets.
- When splitting assets, preserve original shadows and lighting.

Important:

- Do not replace realistic product imagery with placeholder boxes.
- Do not use low-quality blurry images.
- Do not mix different lighting styles.

## Copywriting Tone

Printili copy should feel:

- emotional
- simple
- warm
- premium
- gift-focused
- memory-focused

Good examples:

- Turn your memories into beautiful printed gifts.
- From your phone to forever treasured.
- Create personalized keepsakes from the photos you love.
- Made to be held, gifted, and remembered.
- Print your favorite moments in style.

Avoid:

- Upload images and generate output.
- Fast photo processing system.
- Best online image tool.
- AI-powered product engine.

This is a memory/gift brand, not a technical SaaS product.

## Codex Rules

When using Codex, always follow these rules:

- Do not redesign unless explicitly asked.
- Do not reinterpret the reference.
- Do not replace realistic assets with CSS drawings.
- Do not invent a new color palette.
- Do not add random sections.
- Do not make the design text-heavy.
- Do not use generic template styling.
- Do not change the premium warm photo-printing direction.

Codex should act as:

- Frontend implementer first.
- Designer second.

When adding a new feature, Codex must:

1. Check this DESIGN.md first.
2. Match the existing visual style.
3. Reuse existing colors, spacing, buttons, and typography.
4. Avoid introducing new visual systems.
5. Keep the homepage premium and realistic.
