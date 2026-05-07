import { NextResponse } from "next/server";
import { listOrders } from "@/lib/order-store";

export function POST() {
  return NextResponse.json(
    {
      message: "Use /project/[guestToken]/checkout for cash-on-delivery order submission."
    },
    { status: 405 }
  );
}

export async function GET() {
  return NextResponse.json({
    orders: await listOrders()
  });
}
