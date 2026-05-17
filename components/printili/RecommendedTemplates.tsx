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
      className="printili-shell scroll-mt-8 py-4 sm:py-5"
      id="template-selector"
      aria-labelledby="recommended-heading"
    >
      <div className="printili-section-title-row mb-4">
        <div className="printili-section-title">
          <h2
            id="recommended-heading"
            className="font-display text-3xl leading-tight text-charcoal"
          >
            Recommended Templates
          </h2>
        </div>
        <Link className="hidden text-sm font-bold text-rose sm:inline-flex" href="/templates">
          View all templates &rarr;
        </Link>
      </div>

      <div className="printili-template-grid">
        {templates.map((template) =>
          template ? (
            <Link
              className="group printili-template-card overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-white/72 shadow-[0_16px_38px_rgb(45_41_38_/_0.08)] transition hover:-translate-y-1 hover:bg-paper hover:shadow-[0_22px_48px_rgb(45_41_38_/_0.14)]"
              href={`/template/${template.slug}`}
              key={template.id}
            >
              <TemplateMiniPoster
                slug={template.slug}
                src={template.previewImage}
                alt={template.previewAlt}
              />
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

function TemplateMiniPoster({ slug, src, alt }: { slug: string; src: string; alt: string }) {
  const tiles = Array.from({ length: 16 }, (_, index) => `${src}-${index}`);

  return (
    <div className={`printili-template-poster printili-template-poster--${posterKind(slug)}`}>
      <span className="sr-only">{alt}</span>
      {slug === "baby-first-year-poster" ? (
        <>
          <strong>ONE</strong>
          <em>Year of Love</em>
          <div className="printili-template-poster__month-grid">
            {tiles.slice(0, 12).map((key) => (
              <span className="relative block" key={key}>
                <Image
                  src={src}
                  alt=""
                  width={54}
                  height={70}
                  sizes="42px"
                  className="h-full w-full object-cover"
                />
              </span>
            ))}
          </div>
        </>
      ) : slug === "couple-heart-collage" ? (
        <>
          <div className="printili-template-poster__heart">
            {tiles.map((key) => (
              <span className="relative block" key={key}>
                <Image
                  src={src}
                  alt=""
                  width={42}
                  height={42}
                  sizes="34px"
                  className="h-full w-full object-cover"
                />
              </span>
            ))}
          </div>
          <strong>You & Me</strong>
          <em>Always & Forever</em>
        </>
      ) : slug === "birthday-number-collage" ? (
        <>
          <div className="printili-template-poster__number">25</div>
          <strong>Happy Birthday</strong>
        </>
      ) : slug === "wedding-welcome-poster" ? (
        <>
          <div className="printili-template-poster__floral" />
          <strong>Welcome</strong>
          <em>to our wedding</em>
          <span>Riya & Ajun</span>
        </>
      ) : slug === "family-memory-poster" ? (
        <>
          <div className="printili-template-poster__word">FAMILY</div>
          <em>where life begins and love never ends</em>
        </>
      ) : (
        <div className="printili-template-poster__cut-grid">
          {tiles.slice(0, 9).map((key) => (
            <span className="relative block" key={key}>
              <Image
                src={src}
                alt=""
                width={58}
                height={74}
                sizes="48px"
                className="h-full w-full object-cover"
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function posterKind(slug: string) {
  if (slug.includes("heart")) return "heart";
  if (slug.includes("birthday")) return "birthday";
  if (slug.includes("wedding")) return "wedding";
  if (slug.includes("family")) return "family";
  if (slug.includes("polaroid")) return "cut";
  return "baby";
}
