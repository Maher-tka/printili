import type { Metadata } from "next";
import { DHero } from "@/components/printili/DHero";
import { EditorPreview } from "@/components/printili/EditorPreview";
import { OccasionCards } from "@/components/printili/OccasionCards";
import { RecommendedTemplates } from "@/components/printili/RecommendedTemplates";
import { SmartEngineFeatures } from "@/components/printili/SmartEngineFeatures";
import { TrustBar } from "@/components/printili/TrustBar";

export const metadata: Metadata = {
  title: "Printili — Custom Photo Montage Prints & Personalized Photo Gifts",
  description:
    "Create custom printable photo montages for babies, couples, birthdays, weddings, and family gifts. Upload photos, preview your design, and receive A4/A3 printed gifts delivered to your door.",
  openGraph: {
    title: "Printili — Custom Photo Montage Prints & Personalized Photo Gifts",
    description:
      "Create custom printable photo montages for babies, couples, birthdays, weddings, and family gifts.",
    type: "website"
  }
};

export default function PrintiliLandingPage() {
  return (
    <div className="printili-page">
      <DHero />
      <OccasionCards />
      <RecommendedTemplates />
      <SmartEngineFeatures />
      <EditorPreview />
      <section
        className="printili-shell py-8 sm:py-10"
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
      >
        <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-white/72 p-5 shadow-[0_18px_44px_rgb(45_41_38_/_0.08)]">
          <h2
            id="how-it-works-heading"
            className="font-display text-3xl leading-tight text-charcoal"
          >
            How it works
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[
              ["Choose", "Pick a template or let Printili suggest one."],
              ["Add Photos", "Upload memories and place them in slots."],
              ["Preview", "Approve a protected proof before printing."],
              ["We Deliver", "Confirm on WhatsApp and pay on delivery."]
            ].map(([title, description], index) => (
              <article className="rounded-[8px] bg-cream p-4" key={title}>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-rose text-sm font-black text-paper">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-charcoal">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-charcoal-soft">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <TrustBar />
    </div>
  );
}
