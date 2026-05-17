import type { Metadata } from "next";
import { PublicPageHero } from "@/components/printili/PublicPageHero";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Your Printili Projects",
  description: "Start or return to a private Printili photo gift project."
};

export default function CustomerPage() {
  return (
    <section className="page-shell printili-public-page" aria-labelledby="customer-heading">
      <PublicPageHero
        eyebrow="Your projects"
        image="/printili/memory-relive-days-hq.webp"
        imageAlt="Open photo book with printed memories"
        intro="Start a new keepsake, return to a private project, or browse products before you choose the next set of photos."
        primaryAction={{ href: "/start", label: "Start a project" }}
        secondaryAction={{ href: "/templates", label: "Browse products" }}
        titleId="customer-heading"
        title="Your Printili projects."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Start fresh</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Begin with new photos and let the site guide you into the right design.
            </p>
            <ButtonLink className="mt-5" href="/start">
              Start now
            </ButtonLink>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Choose a format</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Browse frames, books, collages, and gifts before uploading.
            </p>
            <ButtonLink className="mt-5" href="/templates" variant="outline">
              View products
            </ButtonLink>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Need help?</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Find quick answers or contact support when a project needs a hand.
            </p>
            <ButtonLink className="mt-5" href="/faq" variant="outline">
              Read FAQ
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
