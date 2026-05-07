import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/order-store";

export const runtime = "nodejs";

type DownloadRouteProps = {
  params: Promise<{ orderId: string }>;
};

const exportRoot = path.join(process.cwd(), ".local-storage", "exports");

export async function GET(_request: Request, { params }: DownloadRouteProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order?.printFilePath) {
    return NextResponse.json(
      { message: "Print file has not been generated yet." },
      { status: 404 }
    );
  }

  const resolvedPath = path.resolve(order.printFilePath);

  if (!resolvedPath.startsWith(path.resolve(exportRoot))) {
    return NextResponse.json({ message: "Print file path is not valid." }, { status: 400 });
  }

  const body = await readFile(resolvedPath);

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${path.basename(resolvedPath)}"`,
      "Content-Type": "application/pdf"
    }
  });
}
