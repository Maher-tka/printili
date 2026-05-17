import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PublicInfoPage } from "@/components/printili/PublicInfoPage";
import { PublicPageHero } from "@/components/printili/PublicPageHero";
import { publicPages } from "@/data/public-pages";
import { seoLandingPages } from "@/data/seo-pages";

type MarketingPageProps = {
  params: Promise<{ marketingSlug: string }>;
};

export function generateStaticParams() {
  return [...seoLandingPages, ...publicPages].map((page) => ({ marketingSlug: page.slug }));
}

export async function generateMetadata({ params }: MarketingPageProps): Promise<Metadata> {
  const { marketingSlug } = await params;
  const page =
    publicPages.find((item) => item.slug === marketingSlug) ??
    seoLandingPages.find((item) => item.slug === marketingSlug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website"
    }
  };
}

export default async function MarketingPage({ params }: MarketingPageProps) {
  const { marketingSlug } = await params;
  const publicPage = publicPages.find((item) => item.slug === marketingSlug);
  const page = seoLandingPages.find((item) => item.slug === marketingSlug);

  if (publicPage) {
    return <PublicInfoPage page={publicPage} />;
  }

  if (!page) {
    notFound();
  }

  const faq = [
    {
      question: "How does it work?",
      answer:
        "Upload photos, choose or receive a recommended template, preview, and order with cash on delivery."
    },
    {
      question: "Are my photos private?",
      answer: "Your photos stay private, and we never publish them without your permission."
    },
    {
      question: "Can I print A4 or A3?",
      answer: "Yes, supported templates include photo collage A4 A3 print options and cut sheets."
    }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: "Printable Photo Montage Gifts",
        areaServed: "Tunisia",
        description: "Personalized photo collage and montage print service."
      },
      {
        "@type": "Product",
        name: page.h1,
        description: page.description
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  };

  return (
    <section className="page-shell printili-public-page" aria-labelledby="marketing-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PublicPageHero
        eyebrow="Personalized print gifts"
        image={marketingHeroImage(page.slug)}
        imageAlt={`${page.h1} preview`}
        intro={page.intro}
        primaryAction={{ href: "/start", label: "Start upload" }}
        secondaryAction={{ href: "/templates", label: "Browse templates" }}
        titleId="marketing-heading"
        title={page.h1}
      />

      <div className="printili-public-highlights">
        <ContentBlock title="How it works">
          Upload your photos, choose a design, adjust crops, review a protected preview, and confirm
          your printable photo collage by WhatsApp before production.
        </ContentBlock>
        <ContentBlock title="Popular keywords">{page.keywords.join(", ")}.</ContentBlock>
        <ContentBlock title="Made for gifts">
          Premium layouts support custom photo montage print, poster photo personnalisé, and
          impression montage photo workflows.
        </ContentBlock>
      </div>

      <section className="printili-public-faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">
          FAQ
        </h2>
        <div>
          {faq.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="printili-public-related">
        {page.related.map((href) => (
          <Link href={href} key={href}>
            {href}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContentBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}

function marketingHeroImage(slug: string) {
  const images: Record<string, string> = {
    "photo-montage-print": "/printili/memory-decorate-space-hq.webp",
    "baby-photo-poster": "/printili/cat-baby-collages.webp",
    "couple-photo-gift": "/printili/story-real-smiles-wide-hq.webp",
    "birthday-photo-collage": "/printili/cat-birthday.webp",
    "family-photo-poster": "/printili/cat-family-albums.webp",
    "wedding-photo-print": "/printili/cat-wedding-prints.webp",
    "polaroid-cut-sheet": "/printili/cat-polaroids.webp",
    "a4-photo-collage-print": "/printili/cat-photo-collages.webp",
    "a3-photo-collage-print": "/printili/cat-canvas-prints.webp",
    "custom-photo-gift-tunisia": "/printili/cat-personalized-gifts.webp"
  };

  return images[slug] ?? "/printili/hero-clean-scene.png";
}
