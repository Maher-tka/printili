import type { Metadata } from "next";
import Image from "next/image";
import { CategoryPreviewCard } from "@/components/category-preview-card";
import { ButtonLink } from "@/components/ui/button";
import { categories, featuredTemplates } from "@/data/seed-templates";

export const metadata: Metadata = {
  title: "Premium Printable Photo Montage Gifts",
  description:
    "Upload photos and create premium printable photo montage gifts for babies, couples, birthdays, weddings, families, and cuttable photo sheets."
};

const heroImages = featuredTemplates.slice(0, 4);
const floatingImages = featuredTemplates.slice(0, 8);
const catalogHighlights = categories.filter((category) =>
  ["baby", "couple", "wedding", "cut_sheet"].includes(category.id)
);

const howItWorks = [
  {
    title: "Start with your photos",
    description:
      "Upload the memories you want printed, from baby milestones to wedding moments and family favorites."
  },
  {
    title: "Choose a matching design",
    description:
      "Template recommendations are shaped by photo count, orientation, product type, and basic print quality."
  },
  {
    title: "Confirm and receive",
    description:
      "Submit your cash-on-delivery order, continue through a guest link, and confirm details by WhatsApp."
  }
];

const creativeTools = ["Templates", "Photos", "Elements", "Text", "Emoji", "Layout", "Effects"];

const productProofs = [
  "Premium print quality",
  "Made to gift",
  "Protected preview",
  "Delivered with care"
];

export default function Home() {
  return (
    <>
      <section className="atelier-hero" aria-labelledby="home-hero-heading">
        <div className="page-shell grid min-h-[82svh] gap-10 py-12 sm:py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="relative z-10 max-w-2xl">
            <h1
              id="home-hero-heading"
              className="font-display text-5xl leading-[0.98] text-charcoal sm:text-7xl lg:text-8xl"
            >
              Create a <span className="text-rose">photo gift</span> that feels already framed
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-charcoal-soft sm:text-lg">
              Upload your phone photos, choose a crafted montage template, edit the details, and
              receive a printed gift confirmed on WhatsApp with cash on delivery.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                className="min-w-52 bg-rose hover:bg-[rgb(171_98_106)]"
                href="/start"
                size="lg"
              >
                Start Create Yours Now
              </ButtonLink>
              <ButtonLink
                className="min-w-44 border-champagne/70 bg-paper text-charcoal hover:bg-cream"
                href="/templates"
                variant="outline"
                size="lg"
              >
                Browse Templates
              </ButtonLink>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              {productProofs.map((proof) => (
                <div className="proof-item" key={proof}>
                  <span aria-hidden="true" />
                  <p>{proof}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-showcase" aria-label="Photos becoming a framed delivered montage">
            <div className="floating-photo-field" aria-hidden="true">
              {floatingImages.map((template, index) => (
                <div className={`floating-photo floating-photo--${index + 1}`} key={template.id}>
                  <Image
                    src={template.previewImage}
                    alt={template.previewAlt}
                    fill
                    priority={index < 2}
                    className="object-cover"
                    sizes="150px"
                  />
                </div>
              ))}
            </div>

            <div className="framed-poster">
              <div className="poster-glass" />
              <div className="poster-grid">
                {heroImages.map((template) => (
                  <div className="relative overflow-hidden" key={template.slug}>
                    <Image
                      src={template.previewImage}
                      alt={`${template.name} montage tile`}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                  </div>
                ))}
              </div>
              <p>Our best moments</p>
            </div>

            <div className="gift-box" aria-hidden="true">
              <div className="gift-box__lid" />
              <div className="gift-box__bow" />
              <p>Made for you</p>
            </div>

            <div className="mini-proof-sheet" aria-hidden="true">
              {heroImages.map((template) => (
                <div className="relative overflow-hidden" key={template.slug}>
                  <Image
                    src={template.previewImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="creative-rail" aria-label="Design editor tools preview">
        <div className="page-shell flex min-h-16 flex-wrap items-center gap-3 py-3 text-paper">
          <span className="hidden text-sm font-semibold text-paper/70 sm:inline">New project</span>
          <span className="hidden h-6 w-px bg-paper/16 sm:inline" aria-hidden="true" />
          <span className="rounded-full bg-paper/10 px-3 py-1 text-xs font-semibold">
            A3 Portrait
          </span>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
            {creativeTools.map((tool) => (
              <span className="creative-rail__tool" key={tool}>
                {tool}
              </span>
            ))}
          </div>
          <ButtonLink
            className="bg-rose px-5 text-paper hover:bg-[rgb(171_98_106)]"
            href="/start"
            size="sm"
          >
            Preview & Order
          </ButtonLink>
        </div>
      </section>

      <section
        className="page-shell py-14 sm:py-20"
        id="templates"
        aria-labelledby="category-heading"
      >
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
          <div>
            <h2 id="category-heading" className="font-display text-4xl leading-tight sm:text-5xl">
              Made for every meaningful moment
            </h2>
            <p className="mt-4 text-base leading-7 text-charcoal-soft">
              Start from a gift occasion, then let the platform guide the photos into a printable
              layout with the right size and finish.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogHighlights.map((category) => (
              <CategoryPreviewCard category={category} key={category.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="studio-band py-14 sm:py-20" aria-labelledby="process-heading">
        <div className="page-shell">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h2 id="process-heading" className="font-display text-4xl leading-tight sm:text-5xl">
                A simple creation flow with studio production behind it
              </h2>
              <p className="mt-4 text-base leading-7 text-charcoal-soft">
                Customers get the ease of a modern collage app. The admin team gets order review,
                proof approval, print export, and delivery status control.
              </p>
            </div>
            <div className="process-strip">
              {howItWorks.map((step, index) => (
                <div className="process-step" key={step.title}>
                  <span>{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20" aria-labelledby="engine-heading">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="engine-preview">
            {categories.slice(0, 6).map((category) => (
              <div className="engine-preview__row" key={category.id}>
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  width={72}
                  height={72}
                  className="aspect-square rounded-[8px] object-cover"
                />
                <div>
                  <p>{category.name}</p>
                  <span>Template size set after design selection</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 id="engine-heading" className="font-display text-4xl leading-tight sm:text-5xl">
              Smart matching before the editor
            </h2>
            <p className="mt-4 text-base leading-7 text-charcoal-soft">
              The first recommendation engine uses photo count, orientation, product category, and
              basic print readiness. The admin AI studio can later turn reference collages into new
              draft layouts for the catalog.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/start" variant="outline">
                Let AI Find My Design
              </ButtonLink>
              <ButtonLink href="/templates" variant="primary">
                Open Catalogue
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pb-16 sm:pb-24" aria-labelledby="more-categories-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="more-categories-heading"
              className="font-display text-3xl leading-tight sm:text-4xl"
            >
              Explore the full gift catalogue
            </h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Baby posters, birthdays, families, weddings, and cut-ready sheets all share one smooth
              upload and editing experience.
            </p>
          </div>
          <ButtonLink href="/templates" variant="outline">
            Browse all
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <CategoryPreviewCard category={category} key={category.id} />
          ))}
        </div>
      </section>
    </>
  );
}
