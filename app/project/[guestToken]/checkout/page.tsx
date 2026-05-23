import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MontagePreview } from "@/components/montage-preview";
import {
  calculateOrderPrice,
  formatMoney,
  formatProductOptionPrice,
  getDefaultDeliveryCity,
  getDefaultProductOption,
  getProductOptionsForTemplate,
  pricingConfig
} from "@/lib/pricing";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";
import { formatTemplateSize } from "@/lib/templates";

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
    ? await getPublicTemplateBySlug(project.chosenTemplateSlug)
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

  const layout = await getPublicTemplateEditorLayout(template.slug);
  const qualityWarningCount = project.photos.reduce(
    (count, photo) => count + photo.qualityWarnings.length,
    0
  );
  const missingTextFields = layout.textFields.filter(
    (field) => field.isRequired && !project.textValues[field.key]?.trim()
  );
  const filledSlotIds = new Set(project.placements.map((placement) => placement.slotId));
  const missingRequiredPhotos = layout.slots
    .slice(0, Math.min(template.minPhotos, layout.slots.length))
    .filter((slot) => !filledSlotIds.has(slot.id));
  const productOptions = getProductOptionsForTemplate(template);
  const defaultProductOption = getDefaultProductOption(template);
  const defaultDeliveryCity = getDefaultDeliveryCity();
  const startingPrice = calculateOrderPrice({
    template,
    quantity: 1,
    productOption: defaultProductOption.id,
    addFrame: false,
    giftWrap: false,
    premiumPaper: false,
    finish: "matte",
    urgentOrder: false,
    city: defaultDeliveryCity.id
  });

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
            Confirm the details for your printed order. Payment stays cash on delivery, and the
            order total is calculated from the product option, quantity, finish, and delivery city
            you choose below.
          </p>
          <p className="mt-3 text-sm font-semibold text-charcoal">
            Selected size: {formatTemplateSize(template)}
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
            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Delivery city
              <select
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                defaultValue={defaultDeliveryCity.id}
                name="city"
                required
              >
                {pricingConfig.deliveryCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.label} - {formatMoney(city.fee)}
                  </option>
                ))}
              </select>
              <span className="text-xs font-normal leading-5 text-charcoal-soft">
                The delivery fee is saved with your order. If your exact area needs a courier
                adjustment, we confirm it on WhatsApp before printing.
              </span>
            </label>
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
            </div>

            <fieldset className="grid gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.28)] p-4">
              <legend className="px-2 text-sm font-semibold text-charcoal">Product option</legend>
              <div className="grid gap-3">
                {productOptions.map((option) => (
                  <label
                    key={option.id}
                    className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-[8px] bg-cream px-3 py-3 text-sm text-charcoal-soft"
                  >
                    <input
                      className="mt-1 size-4 accent-rose"
                      defaultChecked={option.id === defaultProductOption.id}
                      name="productOption"
                      type="radio"
                      value={option.id}
                    />
                    <span>
                      <span className="flex flex-wrap items-center justify-between gap-2 font-semibold text-charcoal">
                        <span>{option.label}</span>
                        <span>{formatProductOptionPrice(option)}</span>
                      </span>
                      <span className="mt-1 block leading-5">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-3 text-sm text-charcoal-soft sm:grid-cols-2">
              {[
                [
                  "premiumPaper",
                  "Premium photo paper",
                  `+${formatMoney(pricingConfig.addOns.premiumPaper)} / item`
                ],
                [
                  "urgentOrder",
                  "Priority production",
                  `+${formatMoney(pricingConfig.addOns.urgent)} / order`
                ]
              ].map(([name, label, price]) => (
                <label
                  key={name}
                  className="flex items-center gap-3 rounded-[8px] bg-cream px-3 py-3"
                >
                  <input className="size-4 accent-rose" name={name} type="checkbox" value="true" />
                  <span className="flex flex-1 items-center justify-between gap-3">
                    <span>{label}</span>
                    <span className="font-semibold text-charcoal">{price}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Finish
                <select
                  className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                  name="finish"
                >
                  <option value="matte">Matte finish - included</option>
                  <option value="glossy">
                    Glossy finish - +{formatMoney(pricingConfig.addOns.glossyFinish)} / item
                  </option>
                </select>
              </label>
            </div>

            <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper p-4">
              <p className="text-sm font-semibold text-charcoal">Before checkout checklist</p>
              <ul className="mt-3 grid gap-2 text-sm text-charcoal-soft">
                <ChecklistItem
                  done={missingRequiredPhotos.length === 0}
                  label={`${template.minPhotos} required photo spot${template.minPhotos === 1 ? "" : "s"} filled`}
                />
                <ChecklistItem
                  done={missingTextFields.length === 0}
                  label="Required text fields completed"
                />
                <ChecklistItem
                  done={qualityWarningCount === 0}
                  label={
                    qualityWarningCount === 0
                      ? "No photo quality warnings"
                      : `${qualityWarningCount} photo warning${qualityWarningCount === 1 ? "" : "s"} to review`
                  }
                />
              </ul>
              {qualityWarningCount > 0 ? (
                <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-charcoal">
                  <input
                    className="size-4 accent-rose"
                    name="acknowledgeQualityWarnings"
                    required
                    type="checkbox"
                    value="true"
                  />
                  I understand the photo quality warnings.
                </label>
              ) : (
                <input name="acknowledgeQualityWarnings" type="hidden" value="true" />
              )}
              <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-charcoal">
                <input
                  className="size-4 accent-rose"
                  name="previewApproved"
                  required
                  type="checkbox"
                  value="true"
                />
                I approve this preview for printing.
              </label>
            </div>

            <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper p-4">
              <p className="text-sm font-semibold text-charcoal">Order estimate</p>
              <p className="mt-1 text-xs leading-5 text-charcoal-soft">
                Shown for 1 item, {defaultProductOption.label.toLowerCase()}, matte finish, and{" "}
                {defaultDeliveryCity.label} delivery. Your submitted total is recalculated from the
                exact choices in this form.
              </p>
              <div className="mt-3 grid gap-2 text-sm text-charcoal-soft">
                {startingPrice.lineItems.map((item) => (
                  <div className="flex justify-between gap-3" key={item.label}>
                    <span>{item.label}</span>
                    <span className="font-semibold text-charcoal">{formatMoney(item.amount)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex justify-between gap-3 border-t border-[rgb(199_163_95_/_0.25)] pt-3 text-sm font-bold text-charcoal">
                <span>Estimated cash on delivery</span>
                <span>{formatMoney(startingPrice.total)}</span>
              </p>
              <p className="mt-2 text-xs leading-5 text-charcoal-soft">
                No online payment is collected. We confirm the print details on WhatsApp before
                production if anything needs review.
              </p>
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
            <p className="mt-2 text-sm text-charcoal-soft">{formatTemplateSize(template)}</p>
          </div>
          <div className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
            <MontagePreview
              layout={layout}
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

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`grid size-5 place-items-center rounded-full text-xs font-bold ${
          done ? "bg-[rgb(34_128_91_/_0.14)] text-[rgb(25_96_68)]" : "bg-rose-soft text-charcoal"
        }`}
      >
        {done ? "OK" : "!"}
      </span>
      <span>{label}</span>
    </li>
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
