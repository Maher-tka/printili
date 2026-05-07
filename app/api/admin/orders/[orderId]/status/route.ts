import { NextResponse } from "next/server";
import { updateOrderStatus, type OrderStatusId } from "@/lib/order-store";

export const runtime = "nodejs";

type StatusRouteProps = {
  params: Promise<{ orderId: string }>;
};

const statuses: OrderStatusId[] = [
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

export async function POST(request: Request, { params }: StatusRouteProps) {
  const { orderId } = await params;
  const formData = await request.formData();
  const status = formData.get("status");

  if (typeof status !== "string" || !statuses.includes(status as OrderStatusId)) {
    return NextResponse.json({ message: "Choose a valid status." }, { status: 400 });
  }

  await updateOrderStatus({
    orderId,
    status: status as OrderStatusId,
    note: typeof formData.get("note") === "string" ? String(formData.get("note")) : undefined
  });

  return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, request.url), 303);
}
