import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllPublicTemplates, savePublicTemplate } from "@/lib/public-template-store";
import { getCategoryById } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeHiddenRequested = url.searchParams.get("includeHidden") === "1";
  const includeHidden = includeHiddenRequested && (await isAdminAuthenticated());

  return NextResponse.json(
    {
      data: await getAllPublicTemplates({ includeHidden }),
      message: includeHidden ? "Admin template library." : "Public template library."
    },
    {
      headers: getCorsHeaders(request)
    }
  );
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  const headers = getCorsHeaders(request);

  if (!authenticated) {
    return NextResponse.json(
      { message: "Admin authentication required." },
      { status: 401, headers }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "Template payload must be JSON." },
      { status: 400, headers }
    );
  }

  const input = body as Record<string, unknown>;
  const previewDataUrl =
    getString(input.previewDataUrl) ??
    getString(getRecord(input.backgroundImage)?.dataUrl) ??
    getFirstBackgroundDataUrl(input.backgroundImages);
  const result = await savePublicTemplate({
    id: getString(input.id),
    slug: getString(input.slug),
    name: getString(input.name) ?? getString(input.templateName) ?? "Printili Template",
    category: getString(input.category) ?? getString(input.categoryId),
    productType: getString(input.productType),
    sheetSize: getString(input.sheetSize),
    orientation: getString(input.orientation),
    minPhotos: getNumber(input.minPhotos),
    maxPhotos: getNumber(input.maxPhotos),
    description: getString(input.description),
    tags: getStringArray(input.tags),
    previewDataUrl,
    previewImage: getString(input.previewImage) ?? getString(input.previewImageUrl),
    previewAlt: getString(input.previewAlt),
    canvas: getCanvas(input.canvas),
    frames: getRecordArray(input.frames),
    textFields: getRecordArray(input.textFields)
  });
  const category = getCategoryById(result.template.categoryId);

  return NextResponse.json(
    {
      data: result.template,
      persistence: result.persistence,
      reviewUrl: `/admin/template-ai/review/${result.template.slug}`,
      publicUrl: `/template/${result.template.slug}`,
      categoryUrl: category ? `/templates/${category.slug}` : "/templates",
      message: `${result.template.name} is now available in ${category?.name ?? result.template.categoryId}.`
    },
    { status: 201, headers }
  );
}

export function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}

function getFirstBackgroundDataUrl(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  for (const item of value) {
    const dataUrl = getString(getRecord(item)?.dataUrl);

    if (dataUrl) {
      return dataUrl;
    }
  }

  return undefined;
}

function getRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => getString(item)).filter((item): item is string => Boolean(item))
    : undefined;
}

function getCanvas(value: unknown) {
  const canvas = getRecord(value);

  return canvas
    ? {
        width: getNumber(canvas.width),
        height: getNumber(canvas.height)
      }
    : undefined;
}

function getRecordArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(getRecord(item)))
    : undefined;
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    Vary: "Origin"
  };

  if (origin === "http://localhost:3001" || origin === "http://127.0.0.1:3001") {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
  }

  return headers;
}
