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
        intro="No account needed. Upload photos, choose a template, preview the design, then send the order to the print shop."
        primaryAction={{ href: "/start", label: "Start with my photos" }}
        secondaryAction={{ href: "/templates", label: "Browse templates" }}
        titleId="customer-heading"
        title="Your photo gift, step by step."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">1. Upload photos</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Start with the photos on your phone. Extra photos stay saved, so you can swap them in
              later.
            </p>
            <ButtonLink className="mt-5" href="/start">
              Start now
            </ButtonLink>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">2. Choose a template</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Pick a collage, Polaroid sheet, label, sticker, or gift format without needing design
              software.
            </p>
            <ButtonLink className="mt-5" href="/templates" variant="outline">
              View templates
            </ButtonLink>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">3. Preview before print</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal-soft">
              Check the design, make small edits, and submit only when the printable preview feels
              right.
            </p>
            <ButtonLink className="mt-5" href="/start" variant="outline">
              Create preview
            </ButtonLink>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-[rgb(199_163_95_/_0.22)] bg-paper/90 p-5 shadow-soft">
        <p className="text-sm font-semibold text-charcoal">Private by default</p>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          Each project opens with a private magic link. Customers can preview the gift before the
          shop prepares the print file.
        </p>
      </div>
    </section>
  );
}
