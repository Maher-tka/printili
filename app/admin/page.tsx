import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders, orderStatusLabels, type OrderStatusId } from "@/lib/order-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Private production dashboard for printable photo montage orders."
};

const statusOrder: OrderStatusId[] = [
  "new_order",
  "waiting_confirmation",
  "waiting_client_approval",
  "approved",
  "ready_to_print",
  "printed",
  "cut_finished",
  "out_for_delivery",
  "delivered",
  "cancelled"
];

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ error }, authenticated] = await Promise.all([searchParams, isAdminAuthenticated()]);

  if (!authenticated) {
    return <AdminLogin hasError={Boolean(error)} />;
  }

  const orders = await listOrders();
  const counts = Object.fromEntries(statusOrder.map((status) => [status, 0])) as Record<
    OrderStatusId,
    number
  >;

  orders.forEach((order) => {
    counts[order.status] += 1;
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
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
          href="/admin/template-ai"
        >
          AI template extractor
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statusOrder.map((status) => (
          <div className="soft-card p-4" key={status}>
            <p className="text-sm font-semibold text-charcoal-soft">{orderStatusLabels[status]}</p>
            <p className="mt-2 text-3xl font-semibold text-charcoal">{counts[status]}</p>
          </div>
        ))}
      </div>

      <div className="soft-card mt-8 grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Template AI studio
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Turn reference collages into layouts</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal-soft">
            Import a finished collage photo or layout image, detect photo slots and text zones, then
            review a draft template before customers use it.
          </p>
        </div>
        <Link className="font-semibold text-rose" href="/admin/template-ai">
          Open studio
        </Link>
      </div>

      <div className="soft-card mt-8 overflow-x-auto">
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
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-charcoal-soft" colSpan={10}>
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr className="border-t border-[rgb(199_163_95_/_0.18)]" key={order.id}>
                  <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.clientName}</td>
                  <td className="px-4 py-3">{order.whatsapp}</td>
                  <td className="px-4 py-3">{order.city}</td>
                  <td className="px-4 py-3">{order.templateSlug ?? "Template"}</td>
                  <td className="px-4 py-3">{order.sheetSize ?? "A4"}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
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
