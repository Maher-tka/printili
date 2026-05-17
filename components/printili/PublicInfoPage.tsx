import Link from "next/link";
import type { PublicPage } from "@/data/public-pages";
import { PublicPageHero } from "@/components/printili/PublicPageHero";

type PublicInfoPageProps = {
  page: PublicPage;
};

export function PublicInfoPage({ page }: PublicInfoPageProps) {
  return (
    <article className="page-shell printili-public-page">
      <PublicPageHero
        eyebrow={page.eyebrow}
        image={page.heroImage}
        imageAlt={page.heroAlt}
        intro={page.intro}
        primaryAction={page.primaryCta}
        secondaryAction={page.secondaryCta}
        title={page.heading}
      />

      <section className="printili-public-highlights" aria-label={`${page.heading} highlights`}>
        {page.highlights.map((highlight) => (
          <article key={highlight.title}>
            <h2>{highlight.title}</h2>
            <p>{highlight.description}</p>
          </article>
        ))}
      </section>

      <section className="printili-public-story" aria-label={`${page.heading} details`}>
        {page.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      <nav className="printili-public-related" aria-label="Related pages">
        {page.related.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </article>
  );
}
