import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById } from "@/lib/order-store";
import {
  getExportPathForOrderFile,
  isPathInsideDirectory,
  type ExportFileKind
} from "@/lib/print-export";

export const runtime = "nodejs";

type DownloadRouteProps = {
  params: Promise<{ orderId: string }>;
};

const exportRoot = path.join(process.cwd(), ".local-storage", "exports");
const contentTypes: Record<ExportFileKind, string> = {
  print: "application/pdf",
  preview: "image/jpeg",
  summary: "application/json"
};

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

  const fileKind = getDownloadFileKind(request);
  const storedFilePath =
    fileKind === "print"
      ? order.printFilePath
      : getExportPathForOrderFile(order.orderNumber, fileKind);

  if (!storedFilePath) {
    orderUrl.searchParams.set("download", "missing");

    return NextResponse.redirect(orderUrl, 303);
  }

  const resolvedPath = path.resolve(storedFilePath);

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
      "Content-Type": contentTypes[fileKind]
    }
  });
}

function getDownloadFileKind(request: Request): ExportFileKind {
  const value = new URL(request.url).searchParams.get("file");

  if (value === "preview" || value === "summary") {
    return value;
  }

  return "print";
}
