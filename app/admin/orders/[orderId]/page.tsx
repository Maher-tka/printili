import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { MontagePreview } from "@/components/montage-preview";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cn } from "@/lib/cn";
import { getOrderById } from "@/lib/order-store";
import {
  getOrderStatusActions,
  isOrderStatusAtLeast,
  orderStatusLabels,
  orderStatuses
} from "@/lib/order-workflow";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";
import { formatTemplateSize } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AdminOrderPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: AdminOrderPageProps): Promise<Metadata> {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  return {
    title: order ? `Admin ${order.orderNumber}` : "Admin Order",
    description: "Private order detail for production workflow."
  };
}

export default async function AdminOrderPage({ params, searchParams }: AdminOrderPageProps) {
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
    ? await getPublicTemplateBySlug(project.chosenTemplateSlug)
    : null;
  const layout = template ? await getPublicTemplateEditorLayout(template.slug) : null;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const workflowMessage = getWorkflowMessage(resolvedSearchParams);
  const statusActions = getOrderStatusActions(order.status);
  const printFileName = order.printFilePath ? getStoredFileName(order.printFilePath) : null;
  const previewFileName = order.previewFilePath ? getStoredFileName(order.previewFilePath) : null;
  const printFileStatusMismatch =
    Boolean(order.printFilePath) && !isOrderStatusAtLeast(order.status, "ready_to_print");

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
          {order.printFilePath ? (
            <a
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
              href={`/api/admin/orders/${order.id}/download?file=print`}
            >
              Download print PDF
            </a>
          ) : null}
        </div>
      </div>

      {workflowMessage ? (
        <div
          className={cn(
            "mt-6 rounded-[8px] border px-4 py-3 text-sm font-semibold",
            workflowMessage.tone === "error"
              ? "border-rose/40 bg-rose/10 text-rose"
              : "border-[rgb(199_163_95_/_0.35)] bg-cream text-charcoal"
          )}
        >
          {workflowMessage.text}
        </div>
      ) : null}

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
            <p>Project: {order.projectCode}</p>
            <p>Template: {order.templateSlug ?? "Template"}</p>
            <p>
              Sheet size:{" "}
              {template ? formatTemplateSize(template) : (order.sheetSize ?? "Template size")}
            </p>
            <p>Quantity: {order.quantity}</p>
            {order.totalPrice !== null ? <p>Total: {order.totalPrice.toFixed(2)} TND</p> : null}
            {order.deliveryFee !== null ? (
              <p>Delivery fee: {order.deliveryFee.toFixed(2)} TND</p>
            ) : null}
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
          {template && project && layout ? (
            <div className="rounded-[8px] bg-[rgb(45_41_38_/_0.06)] p-3 shadow-soft">
              <MontagePreview
                layout={layout}
                photos={project.photos}
                placements={project.placements}
                protectedPreview
                template={template}
                textValues={project.textValues}
                watermarkText={`PREVIEW ${order.orderNumber}`}
              />
            </div>
          ) : null}

          <InfoCard title="Production files">
            {printFileName ? (
              <>
                <p className="font-semibold text-charcoal">Print PDF ready</p>
                <p>{printFileName}</p>
                {previewFileName ? <p>Preview: {previewFileName}</p> : null}
                {printFileStatusMismatch ? (
                  <p className="font-semibold text-rose">
                    This file exists while the order status is still{" "}
                    {orderStatusLabels[order.status]}. Set the exact status to Ready to print if
                    this file is approved.
                  </p>
                ) : null}
                <a
                  className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
                  href={`/api/admin/orders/${order.id}/download?file=print`}
                >
                  Download print PDF
                </a>
                <div className="grid gap-2 sm:grid-cols-2">
                  <a
                    className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.4)] bg-paper px-4 text-sm font-semibold text-charcoal"
                    href={`/api/admin/orders/${order.id}/download?file=preview`}
                  >
                    Preview JPG
                  </a>
                  <a
                    className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.4)] bg-paper px-4 text-sm font-semibold text-charcoal"
                    href={`/api/admin/orders/${order.id}/download?file=summary`}
                  >
                    Summary JSON
                  </a>
                </div>
              </>
            ) : (
              <p>No print PDF has been generated yet.</p>
            )}
            <form action={`/api/admin/orders/${order.id}/export`} method="post">
              <button
                className="focus-ring min-h-10 w-full rounded-full border border-[rgb(199_163_95_/_0.4)] bg-paper px-4 text-sm font-semibold text-charcoal"
                type="submit"
              >
                {printFileName ? "Regenerate print PDF" : "Generate print PDF"}
              </button>
            </form>
          </InfoCard>

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

          <InfoCard title="Status actions">
            {statusActions.length ? (
              <div className="grid gap-2">
                {statusActions.map((action) => (
                  <form
                    action={`/api/admin/orders/${order.id}/status`}
                    key={`${action.status}-${action.label}`}
                    method="post"
                  >
                    <input name="status" type="hidden" value={action.status} />
                    <input name="note" type="hidden" value={action.note} />
                    <button
                      className={cn(
                        "focus-ring min-h-10 w-full rounded-full border px-4 text-sm font-semibold",
                        action.tone === "danger"
                          ? "border-rose/35 bg-paper text-rose"
                          : "border-[rgb(199_163_95_/_0.4)] bg-paper text-charcoal"
                      )}
                      type="submit"
                    >
                      {action.label}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <p>No next-step actions for this status.</p>
            )}

            <form
              action={`/api/admin/orders/${order.id}/status`}
              className="mt-4 grid gap-2 border-t border-[rgb(199_163_95_/_0.25)] pt-4"
              method="post"
            >
              <label className="grid gap-2 font-semibold text-charcoal">
                Set exact status
                <select
                  className="focus-ring min-h-10 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-charcoal"
                  defaultValue={order.status}
                  name="status"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <input name="note" type="hidden" value="Manual status correction by admin." />
              <input name="allowOverride" type="hidden" value="true" />
              <button
                className="focus-ring min-h-10 rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
                type="submit"
              >
                Save status
              </button>
            </form>
          </InfoCard>
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

function getStoredFileName(filePath: string) {
  return filePath.split(/[\\/]/).pop() ?? filePath;
}

function getWorkflowMessage(searchParams: Record<string, string | string[] | undefined>) {
  const exportState = getSingleValue(searchParams.export);
  const downloadState = getSingleValue(searchParams.download);
  const statusState = getSingleValue(searchParams.status);

  if (exportState === "ready") {
    return {
      tone: "success" as const,
      text: "Print PDF generated and the order is ready to download."
    };
  }

  if (exportState === "failed") {
    return {
      tone: "error" as const,
      text: "Print export could not be generated. Check the selected template and local photo files."
    };
  }

  if (downloadState === "missing") {
    return {
      tone: "error" as const,
      text: "The saved print PDF could not be found. Regenerate the print PDF before downloading."
    };
  }

  if (downloadState === "invalid") {
    return {
      tone: "error" as const,
      text: "The saved print PDF path is not valid. Regenerate the print PDF."
    };
  }

  if (statusState === "saved") {
    return {
      tone: "success" as const,
      text: "Order status saved."
    };
  }

  if (statusState === "invalid") {
    return {
      tone: "error" as const,
      text: "Choose a valid order status."
    };
  }

  if (statusState === "blocked") {
    return {
      tone: "error" as const,
      text: "That status jump is blocked by the production workflow. Use the exact status override only for intentional corrections."
    };
  }

  return null;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
