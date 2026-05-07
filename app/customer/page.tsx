import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Customer Project Placeholder",
  description: "Customer workspace placeholder for starting a printable photo montage project."
};

export default function CustomerPage() {
  return (
    <section className="page-shell py-14 sm:py-20" aria-labelledby="customer-heading">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <h1 id="customer-heading" className="font-display text-4xl leading-tight sm:text-6xl">
            Start a photo gift project
          </h1>
          <p className="mt-5 text-base leading-7 text-charcoal-soft">
            This placeholder will become the upload and recommendation entry point. The editor is
            intentionally not implemented in this phase.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start">Start Upload Flow</ButtonLink>
            <ButtonLink href="/api/templates" variant="outline">
              View Template API
            </ButtonLink>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Planned customer flow</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-charcoal-soft">
              <li>1. Upload photos.</li>
              <li>2. Analyze count, orientation, and basic quality.</li>
              <li>3. Recommend matching templates.</li>
              <li>4. Continue later with a guest magic link.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
