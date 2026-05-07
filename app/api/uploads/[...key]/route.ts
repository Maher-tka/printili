import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

type UploadRouteProps = {
  params: Promise<{ key: string[] }>;
};

const uploadRoot = path.join(process.cwd(), ".local-storage", "uploads");

export async function GET(request: Request, { params }: UploadRouteProps) {
  const { key } = await params;
  const absolutePath = path.resolve(uploadRoot, ...key);

  if (!isInsideUploadRoot(absolutePath)) {
    return NextResponse.json({ message: "Photo path is not valid." }, { status: 400 });
  }

  try {
    const fileStat = await stat(absolutePath);

    if (!fileStat.isFile()) {
      return NextResponse.json({ message: "Photo was not found." }, { status: 404 });
    }

    const originalBody = await readFile(absolutePath);
    const isLowResPreview = new URL(request.url).searchParams.get("preview") === "low";
    const body = isLowResPreview
      ? await sharp(originalBody, { failOn: "none" })
          .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 58, progressive: true })
          .toBuffer()
      : originalBody;

    return new Response(new Uint8Array(body), {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Type": isLowResPreview ? "image/jpeg" : getContentType(absolutePath)
      }
    });
  } catch {
    return NextResponse.json({ message: "Photo was not found." }, { status: 404 });
  }
}

function isInsideUploadRoot(absolutePath: string) {
  const root = path.resolve(uploadRoot);

  return absolutePath === root || absolutePath.startsWith(`${root}${path.sep}`);
}

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  if (extension === ".gif") {
    return "image/gif";
  }

  return "application/octet-stream";
}
