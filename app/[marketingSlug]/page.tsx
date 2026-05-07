import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { seoLandingPages } from "@/data/seo-pages";

type MarketingPageProps = {
  params: Promise<{ marketingSlug: string }>;
};

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ marketingSlug: page.slug }));
}

export async function generateMetadata({ params }: MarketingPageProps): Promise<Metadata> {
  const { marketingSlug } = await params;
  const page = seoLandingPages.find((item) => item.slug === marketingSlug);

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
  const page = seoLandingPages.find((item) => item.slug === marketingSlug);

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
    <section className="page-shell py-12 sm:py-16" aria-labelledby="marketing-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Personalized print gifts
          </p>
          <h1
            id="marketing-heading"
            className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
          >
            {page.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-charcoal-soft">{page.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start">Start upload</ButtonLink>
            <ButtonLink href="/templates" variant="outline">
              Browse templates
            </ButtonLink>
          </div>
        </div>

        <div className="soft-card overflow-hidden">
          <div
            className="aspect-[4/3] bg-[linear-gradient(135deg,#fffaf3,#f1d7d8_55%,#c7a35f)]"
            role="img"
            aria-label={`${page.h1} preview placeholder`}
          />
          <div className="p-5">
            <h2 className="text-xl font-semibold">Product examples</h2>
            <ul className="mt-3 grid gap-2 text-sm text-charcoal-soft">
              {page.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
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

      <section className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-3xl">
          FAQ
        </h2>
        <div className="mt-5 grid gap-4">
          {faq.map((item) => (
            <div className="soft-card p-5" key={item.question}>
              <h3 className="text-lg font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-charcoal-soft">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-rose">
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
    <section className="soft-card p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-charcoal-soft">{children}</p>
    </section>
  );
}
