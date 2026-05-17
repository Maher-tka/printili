import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById, updateOrderStatus } from "@/lib/order-store";
import { shouldPromoteToReadyToPrintAfterExport } from "@/lib/order-workflow";
import { generatePrintExport } from "@/lib/print-export";

export const runtime = "nodejs";

type ExportRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: ExportRouteProps) {
  const authenticated = await isAdminAuthenticated();
  const { orderId } = await params;

  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.redirect(new URL("/admin?order=missing", request.url), 303);
  }

  try {
    await generatePrintExport(order);

    if (shouldPromoteToReadyToPrintAfterExport(order.status)) {
      await updateOrderStatus({
        orderId,
        status: "ready_to_print",
        note: "Print PDF generated and ready for production."
      });
    }
  } catch (error) {
    console.warn("Print export failed.", error);

    return NextResponse.redirect(
      new URL(`/admin/orders/${orderId}?export=failed`, request.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/orders/${orderId}?export=ready`, request.url), 303);
}
