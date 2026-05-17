import type { Metadata } from "next";
import { PublicPageHero } from "@/components/printili/PublicPageHero";

export const metadata: Metadata = {
  title: "Newsletter Signup",
  description: "Stay inspired with Printili updates, offers, and memory-focused ideas."
};

export default function NewsletterPage() {
  return (
    <article className="page-shell printili-public-page">
      <PublicPageHero
        eyebrow="Newsletter"
        image="/printili/memory-relive-days-hq.webp"
        imageAlt="Open photo book with warm printed memories"
        intro="You are on the list for product inspiration, gift ideas, and thoughtful updates from Printili."
        primaryAction={{ href: "/templates", label: "Browse products" }}
        secondaryAction={{ href: "/start", label: "Start creating" }}
        title="Thanks for staying inspired with us."
      />

      <section className="printili-public-story" aria-label="Newsletter details">
        <article>
          <h2>What to expect</h2>
          <p>Warm product ideas, seasonal gift inspiration, and useful photo-printing guidance.</p>
        </article>
        <article>
          <h2>What not to expect</h2>
          <p>No noisy discount blasts or generic marketing clutter. The tone stays Printili.</p>
        </article>
      </section>
    </article>
  );
}
