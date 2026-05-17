import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addAdminNote, getOrderById } from "@/lib/order-store";

export const runtime = "nodejs";

type NotesRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: NotesRouteProps) {
  const authenticated = await isAdminAuthenticated();
  const { orderId } = await params;

  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const formData = await request.formData();
  const body = formData.get("body");
  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (typeof body === "string" && body.trim()) {
    await addAdminNote({
      orderId,
      projectId: order.projectId,
      body: body.trim()
    });
  }

  return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, request.url), 303);
}
