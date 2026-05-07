import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/order-store";
import { generatePrintExport } from "@/lib/print-export";

export const runtime = "nodejs";

type ExportRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: ExportRouteProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  await generatePrintExport(order);

  return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, request.url), 303);
}
