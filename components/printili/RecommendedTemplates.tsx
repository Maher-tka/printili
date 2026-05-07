import Image from "next/image";
import Link from "next/link";
import { featuredTemplates } from "@/data/seed-templates";
import { formatSheetSizeCm } from "@/lib/templates";

const recommendedSlugs = [
  "baby-first-year-poster",
  "couple-heart-collage",
  "birthday-number-collage",
  "wedding-welcome-poster",
  "family-memory-poster",
  "a4-9-polaroid-cut-sheet"
];

export function RecommendedTemplates() {
  const templates = recommendedSlugs
    .map((slug) => featuredTemplates.find((template) => template.slug === slug))
    .filter(Boolean);

  return (
    <section
      className="printili-shell scroll-mt-8 py-8 sm:py-10"
      id="template-selector"
      aria-labelledby="recommended-heading"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="recommended-heading"
            className="font-display text-3xl leading-tight text-charcoal"
          >
            Recommended Templates
          </h2>
          <p className="mt-2 text-sm leading-6 text-charcoal-soft">
            Start with a proven print layout, then upload photos and edit every crop.
          </p>
        </div>
        <Link className="hidden text-sm font-bold text-rose sm:inline-flex" href="/templates">
          View all templates &rarr;
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {templates.map((template) =>
          template ? (
            <Link
              className="group overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-white/72 shadow-[0_16px_38px_rgb(45_41_38_/_0.08)] transition hover:-translate-y-1 hover:bg-paper hover:shadow-[0_22px_48px_rgb(45_41_38_/_0.14)]"
              href={`/template/${template.slug}`}
              key={template.id}
            >
              <div className="relative aspect-[4/5] bg-cream">
                <Image
                  src={template.previewImage}
                  alt={template.previewAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal/42 to-transparent" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-extrabold leading-snug text-charcoal">
                  {template.name}
                </h3>
                <p className="mt-2 text-xs leading-5 text-charcoal-soft">
                  {formatSheetSizeCm(template.sheetSize, template.orientation)}
                </p>
              </div>
            </Link>
          ) : null
        )}
      </div>
    </section>
  );
}
