import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { templateMakerCanvasHref } from "@/lib/admin-tool-links";
import { cn } from "@/lib/cn";
import { listOrders } from "@/lib/order-store";
import {
  isOrderStatusId,
  orderStatusLabels,
  orderStatuses,
  type OrderStatusId
} from "@/lib/order-workflow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Private production dashboard for printable photo montage orders."
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ city, error, q, status }, authenticated] = await Promise.all([
    searchParams,
    isAdminAuthenticated()
  ]);

  if (!authenticated) {
    return <AdminLogin hasError={Boolean(error)} />;
  }

  const orders = await listOrders();
  const counts = Object.fromEntries(orderStatuses.map((status) => [status, 0])) as Record<
    (typeof orderStatuses)[number],
    number
  >;

  orders.forEach((order) => {
    counts[order.status] += 1;
  });
  const selectedStatus = getSelectedStatus(status);
  const query = getSingleValue(q).trim().toLowerCase();
  const selectedCity = getSingleValue(city).trim().toLowerCase();
  const visibleOrders = orders.filter((order) => {
    const statusMatches = !selectedStatus || order.status === selectedStatus;
    const cityMatches = !selectedCity || order.city.toLowerCase().includes(selectedCity);
    const queryMatches =
      !query ||
      [order.orderNumber, order.clientName, order.whatsapp, order.projectCode]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return statusMatches && cityMatches && queryMatches;
  });

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="admin-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Private admin
          </p>
          <h1 id="admin-heading" className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            Production dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
            href="/admin/template-ai"
          >
            Template extractor
          </Link>
          <a
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-charcoal px-5 text-sm font-semibold text-charcoal"
            href={templateMakerCanvasHref}
          >
            Template maker
          </a>
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal"
            href="/admin/templates"
          >
            Templates
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <StatusTile
          href="/admin"
          isActive={!selectedStatus}
          label="All orders"
          value={orders.length}
        />
        {orderStatuses.map((status) => (
          <StatusTile
            href={`/admin?status=${status}`}
            isActive={selectedStatus === status}
            key={status}
            label={orderStatusLabels[status]}
            value={counts[status]}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="soft-card grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
              Template extractor
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Turn reference collages into layouts</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal-soft">
              Import a finished collage photo or layout image, detect photo slots, then save the
              template into the public category.
            </p>
          </div>
          <Link className="font-semibold text-rose" href="/admin/template-ai">
            Open extractor
          </Link>
        </div>
        <div className="soft-card grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
              Template maker
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Edit extracted templates</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal-soft">
              Open extracted templates saved by the extractor, preview their slots, then correct and
              publish them from the maker workflow.
            </p>
          </div>
          <a className="font-semibold text-rose" href={templateMakerCanvasHref}>
            Open maker
          </a>
        </div>
        <div className="soft-card grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">Templates</p>
            <h2 className="mt-2 text-2xl font-semibold">Manage the catalog</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal-soft">
              Review every template by category, edit descriptions, pricing, call-to-action text,
              and open any layout in the maker.
            </p>
          </div>
          <Link className="font-semibold text-rose" href="/admin/templates">
            Open templates
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-charcoal-soft">
          Showing {visibleOrders.length} order{visibleOrders.length === 1 ? "" : "s"}
          {selectedStatus ? ` in ${orderStatusLabels[selectedStatus].toLowerCase()}` : ""}.
        </p>
        {selectedStatus ? (
          <Link className="text-sm font-semibold text-rose" href="/admin">
            Clear filter
          </Link>
        ) : null}
      </div>

      <form className="soft-card mt-4 grid gap-3 p-4 sm:grid-cols-[1fr_220px_auto]" method="get">
        {selectedStatus ? <input name="status" type="hidden" value={selectedStatus} /> : null}
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Search
          <input
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
            defaultValue={getSingleValue(q)}
            name="q"
            placeholder="Order, name, WhatsApp"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          City
          <input
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
            defaultValue={getSingleValue(city)}
            name="city"
            placeholder="Tunis"
          />
        </label>
        <button
          className="focus-ring self-end rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-paper"
          type="submit"
        >
          Filter
        </button>
      </form>

      <div className="soft-card mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.08em] text-charcoal-soft">
            <tr>
              {[
                "Order",
                "Client",
                "WhatsApp",
                "City",
                "Template",
                "Sheet",
                "Qty",
                "Total",
                "Status",
                "Created",
                "Action"
              ].map((heading) => (
                <th className="px-4 py-3 font-semibold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-charcoal-soft" colSpan={11}>
                  {selectedStatus ? "No orders in this status yet." : "No orders yet."}
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => (
                <tr className="border-t border-[rgb(199_163_95_/_0.18)]" key={order.id}>
                  <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.clientName}</td>
                  <td className="px-4 py-3">{order.whatsapp}</td>
                  <td className="px-4 py-3">{order.city}</td>
                  <td className="px-4 py-3">{order.templateSlug ?? "Template"}</td>
                  <td className="px-4 py-3">{order.sheetSize ?? "A4"}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3">
                    {order.totalPrice !== null ? `${order.totalPrice.toFixed(2)} TND` : "-"}
                  </td>
                  <td className="px-4 py-3">{orderStatusLabels[order.status]}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link className="font-semibold text-rose" href={`/admin/orders/${order.id}`}>
                      Open order
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

function StatusTile({
  href,
  isActive,
  label,
  value
}: {
  href: string;
  isActive: boolean;
  label: string;
  value: number;
}) {
  return (
    <Link
      className={cn(
        "soft-card block p-4 transition hover:-translate-y-0.5",
        isActive && "!border-charcoal !bg-charcoal text-paper"
      )}
      href={href}
    >
      <p className={cn("text-sm font-semibold", isActive ? "text-paper/75" : "text-charcoal-soft")}>
        {label}
      </p>
      <p className={cn("mt-2 text-3xl font-semibold", isActive ? "text-paper" : "text-charcoal")}>
        {value}
      </p>
    </Link>
  );
}

function getSelectedStatus(value: string | string[] | undefined): OrderStatusId | undefined {
  const status = Array.isArray(value) ? value[0] : value;

  return isOrderStatusId(status) ? status : undefined;
}

function AdminLogin({ hasError }: { hasError: boolean }) {
  return (
    <section className="page-shell py-16 sm:py-24" aria-labelledby="admin-login-heading">
      <form action="/api/admin/login" className="soft-card mx-auto max-w-md p-6" method="post">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">Admin</p>
        <h1 id="admin-login-heading" className="mt-3 font-display text-4xl">
          Enter password
        </h1>
        {hasError ? (
          <p className="mt-3 text-sm font-semibold text-rose">Incorrect password.</p>
        ) : null}
        <label className="mt-5 grid gap-2 text-sm font-semibold text-charcoal">
          Password
          <input
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3"
            name="password"
            type="password"
          />
        </label>
        <button
          className="focus-ring mt-5 min-h-11 w-full rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
          type="submit"
        >
          Open dashboard
        </button>
      </form>
    </section>
  );
}
