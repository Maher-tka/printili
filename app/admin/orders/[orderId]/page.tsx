import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { MontagePreview } from "@/components/montage-preview";
import { getTemplateEditorLayout } from "@/data/template-layouts";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById, orderStatusLabels, type OrderStatusId } from "@/lib/order-store";
import { getGuestProject } from "@/lib/project-store";
import { formatSheetSizeCm, getTemplateBySlug } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AdminOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

const statusActions: Array<{ status: OrderStatusId; label: string }> = [
  { status: "waiting_confirmation", label: "Mark waiting confirmation" },
  { status: "waiting_confirmation", label: "Mark confirmed" },
  { status: "waiting_client_approval", label: "Mark waiting client approval" },
  { status: "approved", label: "Mark approved" },
  { status: "ready_to_print", label: "Mark ready to print" },
  { status: "printed", label: "Mark printed" },
  { status: "cut_finished", label: "Mark cut/finished" },
  { status: "out_for_delivery", label: "Mark out for delivery" },
  { status: "delivered", label: "Mark delivered" },
  { status: "cancelled", label: "Cancel order" }
];

export async function generateMetadata({ params }: AdminOrderPageProps): Promise<Metadata> {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  return {
    title: order ? `Admin ${order.orderNumber}` : "Admin Order",
    description: "Private order detail for production workflow."
  };
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const project = await getGuestProject(order.guestToken);
  const template = project?.chosenTemplateSlug
    ? getTemplateBySlug(project.chosenTemplateSlug)
    : null;

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="order-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-rose" href="/admin">
            Back to dashboard
          </Link>
          <h1 id="order-heading" className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm font-semibold text-charcoal-soft">
            {orderStatusLabels[order.status]}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-4 text-sm font-semibold"
            href={`/admin/projects/${order.guestToken}/editor?orderId=${order.id}`}
          >
            Open design editor
          </Link>
          <form action={`/api/admin/orders/${order.id}/export`} method="post">
            <button
              className="focus-ring min-h-11 rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
              type="submit"
            >
              Generate Print File
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="grid gap-6">
          <InfoCard title="Client info">
            <p>{order.clientName}</p>
            <a
              className="font-semibold text-rose"
              href={`https://wa.me/${order.whatsapp}`}
              rel="noreferrer"
              target="_blank"
            >
              {order.whatsapp}
            </a>
            <p>{order.city}</p>
            <p>{order.deliveryAddress}</p>
            {order.deliveryNotes ? <p>{order.deliveryNotes}</p> : null}
          </InfoCard>

          <InfoCard title="Order details">
            <p>Template: {order.templateSlug ?? "Template"}</p>
            <p>
              Sheet size:{" "}
              {template
                ? formatSheetSizeCm(template.sheetSize, template.orientation)
                : order.sheetSize ?? "Template size"}
            </p>
            <p>Quantity: {order.quantity}</p>
            <p>Payment: Cash on delivery</p>
            <p>Product option: {order.productOption}</p>
            <p>Finish: {order.finish}</p>
            <p>Frame: {order.addFrame ? "Yes" : "No"}</p>
            <p>Gift wrap: {order.giftWrap ? "Yes" : "No"}</p>
            <p>Premium paper: {order.premiumPaper ? "Yes" : "No"}</p>
            <p>Urgent: {order.urgentOrder ? "Placeholder selected" : "No"}</p>
            <p>Privacy choice: {formatConsent(order.sampleUseConsent)}</p>
            <p>Client approved preview: {project?.clientApprovedPreview ? "Yes" : "No"}</p>
            <p>Design approved: {project?.designApproved ? "Yes" : "No"}</p>
          </InfoCard>

          <InfoCard title="Uploaded photos and quality warnings">
            {project?.photos.length ? (
              <div className="grid gap-3">
                {project.photos.map((photo, index) => (
                  <div className="rounded-[8px] bg-cream p-3" key={photo.id ?? photo.fileName}>
                    <p className="font-semibold">
                      Photo {index + 1}: {photo.fileName}
                    </p>
                    <p>
                      {photo.widthPx} x {photo.heightPx} px ·{" "}
                      {photo.estimatedPrintQuality.toLowerCase()}
                    </p>
                    {photo.qualityWarnings.length ? (
                      <ul className="mt-2 list-inside list-disc">
                        {photo.qualityWarnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p>No photos found.</p>
            )}
          </InfoCard>

          <InfoCard title="Status timeline">
            <ol className="grid gap-3">
              {order.statusHistory.map((item) => (
                <li className="rounded-[8px] bg-cream p-3" key={item.id}>
                  <p className="font-semibold">{orderStatusLabels[item.status]}</p>
                  <p>{new Date(item.createdAt).toLocaleString()}</p>
                  {item.note ? <p>{item.note}</p> : null}
                </li>
              ))}
            </ol>
          </InfoCard>

          <InfoCard title="Admin notes">
            <form
              action={`/api/admin/orders/${order.id}/notes`}
              className="grid gap-3"
              method="post"
            >
              <textarea
                className="focus-ring min-h-24 resize-none rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2"
                name="body"
                placeholder="Private production note"
              />
              <button
                className="focus-ring min-h-10 rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
                type="submit"
              >
                Add note
              </button>
            </form>
            <div className="mt-4 grid gap-3">
              {order.adminNotes.map((note) => (
                <div className="rounded-[8px] bg-cream p-3" key={note.id}>
                  <p>{note.body}</p>
                  <p className="mt-1 text-xs">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-24">
          {template && project ? (
            <div className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
              <MontagePreview
                layout={getTemplateEditorLayout(template.slug)}
                photos={project.photos}
                placements={project.placements}
                protectedPreview
                template={template}
                textValues={project.textValues}
                watermarkText={`PREVIEW ${order.orderNumber}`}
              />
            </div>
          ) : null}

          <InfoCard title="Production checklist">
            {[
              "Review customer details",
              "Check photo quality warnings",
              "Confirm preview approval",
              "Generate print file",
              "Print at 300 DPI",
              "Cut/finish if needed",
              "Confirm delivery status"
            ].map((item) => (
              <label className="flex items-center gap-3" key={item}>
                <input className="size-4 accent-rose" type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </InfoCard>

          {project ? (
            <form
              action={`/api/admin/projects/${project.guestToken}/approval`}
              className="soft-card grid gap-3 p-4 text-sm text-charcoal-soft"
              method="post"
            >
              <label className="flex items-center gap-3">
                <input
                  className="size-4 accent-rose"
                  defaultChecked={project.clientApprovedPreview}
                  name="clientApprovedPreview"
                  type="checkbox"
                  value="true"
                />
                <span>Client approved preview</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  className="size-4 accent-rose"
                  defaultChecked={project.designApproved}
                  name="designApproved"
                  type="checkbox"
                  value="true"
                />
                <span>Design approved for print</span>
              </label>
              <button
                className="focus-ring min-h-10 rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
                type="submit"
              >
                Save approvals
              </button>
            </form>
          ) : null}

          <div className="soft-card grid gap-2 p-4">
            {statusActions.map((action) => (
              <form
                action={`/api/admin/orders/${order.id}/status`}
                key={action.label}
                method="post"
              >
                <input name="status" type="hidden" value={action.status} />
                <button
                  className="focus-ring min-h-10 w-full rounded-full border border-[rgb(199_163_95_/_0.4)] bg-paper px-4 text-sm font-semibold text-charcoal"
                  type="submit"
                >
                  {action.label}
                </button>
              </form>
            ))}
          </div>

          {order.printFilePath ? (
            <a className="font-semibold text-rose" href={`/api/admin/orders/${order.id}/download`}>
              Download Print PDF
            </a>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="soft-card p-5 text-sm leading-6 text-charcoal-soft">
      <h2 className="text-xl font-semibold text-charcoal">{title}</h2>
      <div className="mt-4 grid gap-2">{children}</div>
    </div>
  );
}

function formatConsent(consent: string) {
  if (consent === "blur_faces") {
    return "Yes, but blur faces";
  }

  if (consent === "show_public") {
    return "Yes, show publicly";
  }

  return "No, keep private";
}
