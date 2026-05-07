import { NextResponse } from "next/server";
import { addAdminNote, getOrderById } from "@/lib/order-store";

export const runtime = "nodejs";

type NotesRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: NotesRouteProps) {
  const { orderId } = await params;
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
