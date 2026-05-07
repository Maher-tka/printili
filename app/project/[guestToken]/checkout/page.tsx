import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MontagePreview } from "@/components/montage-preview";
import { getTemplateEditorLayout } from "@/data/template-layouts";
import { getGuestProject } from "@/lib/project-store";
import { formatSheetSizeCm, getTemplateBySlug } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckoutPageProps = {
  params: Promise<{ guestToken: string }>;
};

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  return {
    title: project ? `Checkout ${project.projectCode}` : "Checkout",
    description: "Submit a cash-on-delivery order for a printable photo montage gift."
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project || new Date(project.expiresAt) < new Date()) {
    notFound();
  }

  const template = project.chosenTemplateSlug
    ? getTemplateBySlug(project.chosenTemplateSlug)
    : null;

  if (!template) {
    return (
      <section className="page-shell py-12 sm:py-16">
        <h1 className="font-display text-4xl">Choose a template first</h1>
        <Link
          className="mt-6 inline-flex font-semibold text-rose"
          href={`/project/${guestToken}/suggestions`}
        >
          Back to suggestions
        </Link>
      </section>
    );
  }

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="checkout-heading">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Project {project.projectCode}
          </p>
          <h1
            id="checkout-heading"
            className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
          >
            Delivery details
          </h1>
          <p className="mt-4 text-base leading-7 text-charcoal-soft">
            Payment is cash on delivery. Final price may be confirmed on WhatsApp before printing
            depending on size, frame, and delivery.
          </p>
          <p className="mt-3 text-sm font-semibold text-charcoal">
            Selected size: {formatSheetSizeCm(template.sheetSize, template.orientation)}
          </p>

          <form
            action={`/api/projects/${guestToken}/checkout`}
            className="soft-card mt-8 grid gap-5 p-5 sm:p-6"
            method="post"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="clientName" required />
              <Field label="WhatsApp number" name="whatsapp" required />
            </div>
            <Field label="Delivery address" name="deliveryAddress" required />
            <Field label="City/area" name="city" required />
            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Delivery notes
              <textarea
                className="focus-ring min-h-24 resize-none rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2 text-sm font-normal"
                name="deliveryNotes"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Quantity
                <input
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  defaultValue={1}
                  min={1}
                  name="quantity"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Product option
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="productOption"
                >
                  <option value="print_only">Print only</option>
                  <option value="frame_placeholder">Frame option placeholder</option>
                  <option value="gift_wrap_placeholder">Gift wrap placeholder</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 text-sm text-charcoal-soft sm:grid-cols-2">
              {[
                ["addFrame", "Add frame"],
                ["giftWrap", "Gift wrapping"],
                ["premiumPaper", "Premium paper"],
                ["urgentOrder", "Urgent order option"]
              ].map(([name, label]) => (
                <label
                  key={name}
                  className="flex items-center gap-3 rounded-[8px] bg-cream px-3 py-3"
                >
                  <input className="size-4 accent-rose" name={name} type="checkbox" value="true" />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Finish
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="finish"
                >
                  <option value="matte">Matte</option>
                  <option value="glossy">Glossy</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Delivery fee placeholder
                <input
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="deliveryFee"
                  placeholder="Confirmed on WhatsApp"
                  type="number"
                />
              </label>
            </div>

            <fieldset className="grid gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.28)] p-4">
              <legend className="px-2 text-sm font-semibold text-charcoal">
                Can we use your finished design as a sample?
              </legend>
              {[
                ["private", "No, keep private"],
                ["blur_faces", "Yes, but blur faces"],
                ["show_public", "Yes, show publicly"]
              ].map(([value, label], index) => (
                <label key={value} className="flex items-center gap-3 text-sm text-charcoal-soft">
                  <input
                    className="size-4 accent-rose"
                    defaultChecked={index === 0}
                    name="sampleUseConsent"
                    type="radio"
                    value={value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>

            <div className="rounded-[8px] bg-cream p-4 text-sm leading-6 text-charcoal-soft">
              Your photos stay private. We never publish your photos without permission. Protected
              previews prevent unauthorized printing. You can request deletion after delivery.
            </div>

            <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper p-4">
              <p className="text-sm font-semibold text-charcoal">Payment method</p>
              <p className="mt-1 text-sm text-charcoal-soft">Cash on delivery only</p>
            </div>

            <button
              className="focus-ring min-h-12 rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]"
              type="submit"
            >
              Submit order
            </button>
          </form>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="soft-card mb-4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
              Chosen template
            </p>
            <h2 className="mt-2 text-xl font-semibold">{template.name}</h2>
            <p className="mt-2 text-sm text-charcoal-soft">
              {formatSheetSizeCm(template.sheetSize, template.orientation)}
            </p>
          </div>
          <div className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
            <MontagePreview
              layout={getTemplateEditorLayout(template.slug)}
              photos={project.photos}
              placements={project.placements}
              protectedPreview
              template={template}
              textValues={project.textValues}
              watermarkText={`PREVIEW ${project.projectCode} ${new Date().toLocaleDateString()}`}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  required = false
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-charcoal">
      {label}
      <input
        className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
        name={name}
        required={required}
      />
    </label>
  );
}
