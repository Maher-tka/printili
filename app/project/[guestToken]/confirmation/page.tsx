import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MontagePreview } from "@/components/montage-preview";
import { getOrderByProjectToken } from "@/lib/order-store";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";
import { formatSheetSizeCm } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ConfirmationPageProps = {
  params: Promise<{ guestToken: string }>;
};

export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { guestToken } = await params;
  const order = await getOrderByProjectToken(guestToken);

  return {
    title: order ? `Order ${order.orderNumber} Confirmed` : "Order Confirmation",
    description: "Cash-on-delivery photo montage order confirmation."
  };
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { guestToken } = await params;
  const [project, order] = await Promise.all([
    getGuestProject(guestToken),
    getOrderByProjectToken(guestToken)
  ]);

  if (!project || !order) {
    notFound();
  }

  const template = project.chosenTemplateSlug
    ? await getPublicTemplateBySlug(project.chosenTemplateSlug)
    : null;
  const layout = template ? await getPublicTemplateEditorLayout(template.slug) : null;
  const whatsappMessage = encodeURIComponent(
    `Hello, I submitted order ${order.orderNumber} for project ${project.projectCode}.`
  );

  return (
    <section className="page-shell py-12 sm:py-16" aria-labelledby="confirmation-heading">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Order {order.orderNumber}
          </p>
          <h1
            id="confirmation-heading"
            className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
          >
            Order received
          </h1>
          <div className="soft-card mt-6 grid gap-4 p-5 text-sm leading-6 text-charcoal-soft">
            <p>
              <strong className="text-charcoal">Payment on delivery.</strong> We will confirm on
              WhatsApp before printing.
            </p>
            <p>This is a protected preview. Your final print will be clean and high quality.</p>
            {template ? (
              <p>Print size: {formatSheetSizeCm(template.sheetSize, template.orientation)}</p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
              href={`https://wa.me/?text=${whatsappMessage}`}
              rel="noreferrer"
              target="_blank"
            >
              Contact on WhatsApp
            </a>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal"
              href={`/project/${guestToken}/editor`}
            >
              Edit design
            </Link>
          </div>
        </div>

        {template && layout ? (
          <aside className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
            <MontagePreview
              layout={layout}
              photos={project.photos}
              placements={project.placements}
              protectedPreview
              template={template}
              textValues={project.textValues}
              watermarkText={`PREVIEW ${order.orderNumber} ${new Date().toLocaleDateString()}`}
            />
          </aside>
        ) : null}
      </div>
    </section>
  );
}
