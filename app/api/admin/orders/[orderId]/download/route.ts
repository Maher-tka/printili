import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById } from "@/lib/order-store";

export const runtime = "nodejs";

type DownloadRouteProps = {
  params: Promise<{ orderId: string }>;
};

const exportRoot = path.join(process.cwd(), ".local-storage", "exports");

export async function GET(request: Request, { params }: DownloadRouteProps) {
  const authenticated = await isAdminAuthenticated();
  const { orderId } = await params;

  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.redirect(new URL("/admin?order=missing", request.url), 303);
  }

  const orderUrl = new URL(`/admin/orders/${orderId}`, request.url);

  if (!order.printFilePath) {
    orderUrl.searchParams.set("download", "missing");

    return NextResponse.redirect(orderUrl, 303);
  }

  const resolvedPath = path.resolve(order.printFilePath);

  if (!isPathInsideDirectory(path.resolve(exportRoot), resolvedPath)) {
    orderUrl.searchParams.set("download", "invalid");

    return NextResponse.redirect(orderUrl, 303);
  }

  let body: Buffer;

  try {
    body = await readFile(resolvedPath);
  } catch {
    orderUrl.searchParams.set("download", "missing");

    return NextResponse.redirect(orderUrl, 303);
  }

  const fileName = path.basename(resolvedPath).replaceAll('"', "");

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Type": "application/pdf"
    }
  });
}

function isPathInsideDirectory(root: string, target: string) {
  const relativePath = path.relative(root, target);

  return Boolean(relativePath) && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}
