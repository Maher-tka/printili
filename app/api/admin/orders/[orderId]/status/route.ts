import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/lib/order-store";
import { isOrderStatusId } from "@/lib/order-workflow";

export const runtime = "nodejs";

type StatusRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: StatusRouteProps) {
  const authenticated = await isAdminAuthenticated();
  const { orderId } = await params;

  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const formData = await request.formData();
  const status = formData.get("status");

  if (!isOrderStatusId(status)) {
    return NextResponse.redirect(
      new URL(`/admin/orders/${orderId}?status=invalid`, request.url),
      303
    );
  }

  const note = formData.get("note");
  const allowOverride = formData.get("allowOverride") === "true";
  let updatedOrder;

  try {
    updatedOrder = await updateOrderStatus({
      orderId,
      status,
      note: typeof note === "string" && note.trim() ? note.trim() : undefined,
      allowOverride
    });
  } catch {
    return NextResponse.redirect(
      new URL(`/admin/orders/${orderId}?status=blocked`, request.url),
      303
    );
  }

  if (!updatedOrder) {
    return NextResponse.redirect(new URL("/admin?order=missing", request.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin/orders/${orderId}?status=saved`, request.url), 303);
}
