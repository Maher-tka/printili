import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageHero } from "@/components/printili/PublicPageHero";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the next steps for creating a Printili photo gift order."
};

export default function CartPage() {
  return (
    <article className="page-shell printili-public-page">
      <PublicPageHero
        eyebrow="Your cart"
        image="/printili/memory-gift-heart-hq.webp"
        imageAlt="Wrapped Printili photo gift"
        intro="Your personalized order begins after you choose a design and approve the preview. Start a project to build the gift before checkout."
        primaryAction={{ href: "/start", label: "Start a project" }}
        secondaryAction={{ href: "/templates", label: "Browse products" }}
        title="Nothing is waiting here yet."
      />

      <section className="printili-public-story" aria-label="Cart next steps">
        <article>
          <h2>1. Choose</h2>
          <p>Pick a template or product that fits the memory you want to turn into a gift.</p>
        </article>
        <article>
          <h2>2. Personalize</h2>
          <p>Upload photos, arrange the design, and preview it before anything is produced.</p>
        </article>
        <article>
          <h2>3. Confirm</h2>
          <p>Once the design is approved, it can move into the real order flow.</p>
        </article>
      </section>

      <nav className="printili-public-related" aria-label="Helpful cart links">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/gift-cards">Gift cards</Link>
        <Link href="/contact-us">Contact us</Link>
      </nav>
    </article>
  );
}
