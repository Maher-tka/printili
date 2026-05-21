import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { updateOrderGeneratedFiles, type OrderSummary } from "@/lib/order-store";
import { getEffectivePlacementControls } from "@/lib/placement-fit";
import { getGuestProject } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";
import type { TemplateEditorLayout, TemplateSeed, TemplateSlotSeed } from "@/types/templates";

const exportRoot = path.join(process.cwd(), ".local-storage", "exports");

export async function generatePrintExport(order: OrderSummary) {
  const project = await getGuestProject(order.guestToken);

  if (!project || !project.chosenTemplateSlug) {
    throw new Error("Project or template was not found for print export.");
  }

  const template = await getPublicTemplateBySlug(project.chosenTemplateSlug);

  if (!template) {
    throw new Error("Template was not found for print export.");
  }

  const layout = await getPublicTemplateEditorLayout(template.slug);
  const dimensions = getPrintDimensions(template);
  const base = sharp({
    create: {
      width: dimensions.widthPx,
      height: dimensions.heightPx,
      channels: 4,
      background: "#fffaf3"
    }
  });
  const composites: sharp.OverlayOptions[] = [];

  for (const [index, placement] of project.placements.entries()) {
    const slot = layout.slots.find((item) => item.id === placement.slotId) ?? layout.slots[index];
    const photo = project.photos.find((item) => item.id === placement.photoId);

    if (!slot || !photo) {
      continue;
    }

    const imagePath = getLocalUploadPath(photo.originalUrl);

    if (!imagePath) {
      continue;
    }

    const slotBox = toPixelBox(slot, dimensions.widthPx, dimensions.heightPx);
    const isPolaroid = template.slug === "a4-9-polaroid-cut-sheet";
    const imageBox = isPolaroid ? getPolaroidImageBox(slotBox) : slotBox;
    const effectivePlacement = getEffectivePlacementControls({
      placement,
      photo,
      slot,
      targetAspectRatio: imageBox.width / imageBox.height
    });
    const imageBuffer = await renderSlotImage({
      imagePath,
      width: imageBox.width,
      height: imageBox.height,
      fitMode: placement.fitMode === "contain_blur" ? "contain_blur" : "cover",
      placement: effectivePlacement
    });

    if (isPolaroid) {
      composites.push({
        input: Buffer.from(
          `<svg width="${slotBox.width}" height="${slotBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/></svg>`
        ),
        left: slotBox.left,
        top: slotBox.top
      });
    }

    composites.push({
      input: imageBuffer,
      left: imageBox.left,
      top: imageBox.top
    });
  }

  composites.push({
    input: renderTextAndGuidesSvg({
      template,
      layout,
      textValues: project.textValues,
      widthPx: dimensions.widthPx,
      heightPx: dimensions.heightPx
    }),
    left: 0,
    top: 0
  });

  const printJpeg = await base.composite(composites).jpeg({ quality: 94 }).toBuffer();
  const previewJpeg = await sharp(printJpeg)
    .resize({ width: 1200, fit: "inside" })
    .composite([
      {
        input: renderWatermarkSvg({
          widthPx: 1200,
          heightPx: Math.round((1200 / dimensions.widthPx) * dimensions.heightPx),
          text: `PREVIEW ${order.orderNumber}`
        }),
        left: 0,
        top: 0
      }
    ])
    .jpeg({ quality: 68 })
    .toBuffer();
  const pdfBuffer = createSingleImagePdf({
    image: printJpeg,
    imageWidth: dimensions.widthPx,
    imageHeight: dimensions.heightPx,
    widthPt: dimensions.widthMm * 2.83464567,
    heightPt: dimensions.heightMm * 2.83464567
  });
  const exportDir = path.join(exportRoot, order.orderNumber);
  const pdfFileName = `ORDER-${order.orderNumber}_${template.sheetSize}_${template.slug}_PRINT.pdf`;
  const previewFileName = `ORDER-${order.orderNumber}_PREVIEW_WATERMARK.jpg`;
  const pdfPath = path.join(exportDir, pdfFileName);
  const previewPath = path.join(exportDir, previewFileName);

  await mkdir(exportDir, { recursive: true });
  await writeFile(pdfPath, pdfBuffer);
  await writeFile(previewPath, previewJpeg);
  await updateOrderGeneratedFiles({
    orderId: order.id,
    printFilePath: pdfPath,
    previewFilePath: previewPath
  });

  return {
    printFilePath: pdfPath,
    previewFilePath: previewPath
  };
}

function getPrintDimensions(template: TemplateSeed) {
  const isA3 = template.sheetSize === "A3";
  const widthMm = isA3 ? 297 : 210;
  const heightMm = isA3 ? 420 : 297;
  const widthPx = isA3 ? 3508 : 2480;
  const heightPx = isA3 ? 4961 : 3508;

  return template.orientation === "landscape"
    ? { widthMm: heightMm, heightMm: widthMm, widthPx: heightPx, heightPx: widthPx }
    : { widthMm, heightMm, widthPx, heightPx };
}

function toPixelBox(slot: TemplateSlotSeed, canvasWidth: number, canvasHeight: number) {
  return {
    left: Math.round(slot.x * canvasWidth),
    top: Math.round(slot.y * canvasHeight),
    width: Math.round(slot.width * canvasWidth),
    height: Math.round(slot.height * canvasHeight)
  };
}

function getPolaroidImageBox(box: { left: number; top: number; width: number; height: number }) {
  const horizontalPadding = Math.round(box.width * 0.06);
  const topPadding = Math.round(box.height * 0.06);
  const bottomPadding = Math.round(box.height * 0.18);

  return {
    left: box.left + horizontalPadding,
    top: box.top + topPadding,
    width: box.width - horizontalPadding * 2,
    height: box.height - topPadding - bottomPadding
  };
}

async function renderSlotImage({
  imagePath,
  width,
  height,
  fitMode,
  placement
}: {
  imagePath: string;
  width: number;
  height: number;
  fitMode: "cover" | "contain_blur";
  placement: {
    zoom: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
}) {
  const image = sharp(await readFile(imagePath), { failOn: "none" });

  if (fitMode === "contain_blur") {
    const [background, foreground] = await Promise.all([
      image
        .clone()
        .resize(width, height, { fit: "cover" })
        .blur(24)
        .modulate({ brightness: 0.75, saturation: 0.9 })
        .toBuffer(),
      image
        .clone()
        .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    ]);

    return sharp(background)
      .composite([{ input: foreground, left: 0, top: 0 }])
      .jpeg({ quality: 94 })
      .toBuffer();
  }

  return renderCoverSlotImage({ image, width, height, placement });
}

async function renderCoverSlotImage({
  image,
  width,
  height,
  placement
}: {
  image: ReturnType<typeof sharp>;
  width: number;
  height: number;
  placement: {
    zoom: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
}) {
  const zoom = clampFinite(placement.zoom, 1, 2.8, 1);
  const rotation = clampFinite(placement.rotation, -45, 45, 0);
  const radians = Math.abs((rotation * Math.PI) / 180);
  const rotatedCoverageWidth = width * Math.cos(radians) + height * Math.sin(radians);
  const rotatedCoverageHeight = width * Math.sin(radians) + height * Math.cos(radians);
  const resizeWidth = Math.max(width, Math.ceil(rotatedCoverageWidth * zoom));
  const resizeHeight = Math.max(height, Math.ceil(rotatedCoverageHeight * zoom));
  const rotatedBuffer = await image
    .resize(resizeWidth, resizeHeight, { fit: "cover" })
    .rotate(rotation, { background: { r: 255, g: 250, b: 243, alpha: 1 } })
    .png()
    .toBuffer();
  const rotatedImage = sharp(rotatedBuffer);
  const metadata = await rotatedImage.metadata();
  const sourceWidth = metadata.width ?? width;
  const sourceHeight = metadata.height ?? height;
  const maxLeft = Math.max(0, sourceWidth - width);
  const maxTop = Math.max(0, sourceHeight - height);
  const left = Math.round(
    clampFinite(sourceWidth / 2 - width / 2 - (placement.offsetX / 100) * width, 0, maxLeft, 0)
  );
  const top = Math.round(
    clampFinite(sourceHeight / 2 - height / 2 - (placement.offsetY / 100) * height, 0, maxTop, 0)
  );

  return rotatedImage.extract({ left, top, width, height }).jpeg({ quality: 94 }).toBuffer();
}

function renderTextAndGuidesSvg({
  template,
  layout,
  textValues,
  widthPx,
  heightPx
}: {
  template: TemplateSeed;
  layout: TemplateEditorLayout;
  textValues: Record<string, string>;
  widthPx: number;
  heightPx: number;
}) {
  const textNodes = layout.textFields
    .map((field) => {
      const value = escapeXml(textValues[field.key] ?? field.defaultValue ?? "");
      const x = (field.x + field.width / 2) * widthPx;
      const y = (field.y + field.height / 2) * heightPx;
      const fontSize = Math.max(18, field.fontSize * 3.2);

      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#2d2926" font-family="Georgia, serif" font-size="${fontSize}">${value}</text>`;
    })
    .join("");
  const guideNodes = template.hasCutGuides ? renderCutGuides(template.slug, widthPx, heightPx) : "";

  return Buffer.from(
    `<svg width="${widthPx}" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">${textNodes}${guideNodes}</svg>`
  );
}

function renderCutGuides(templateSlug: string, widthPx: number, heightPx: number) {
  const columns = templateSlug === "a4-8-landscape-cut-sheet" ? 2 : 3;
  const rows = templateSlug === "a4-8-landscape-cut-sheet" ? 4 : 3;
  const strokeWidth = 1;
  const vertical = Array.from({ length: columns - 1 }, (_, index) => {
    const x = ((index + 1) / columns) * widthPx;

    return `<line x1="${x}" y1="0" x2="${x}" y2="${heightPx}" stroke="#555" stroke-width="${strokeWidth}"/>`;
  }).join("");
  const horizontal = Array.from({ length: rows - 1 }, (_, index) => {
    const y = ((index + 1) / rows) * heightPx;

    return `<line x1="0" y1="${y}" x2="${widthPx}" y2="${y}" stroke="#555" stroke-width="${strokeWidth}"/>`;
  }).join("");

  return vertical + horizontal;
}

function renderWatermarkSvg({
  widthPx,
  heightPx,
  text
}: {
  widthPx: number;
  heightPx: number;
  text: string;
}) {
  const escapedText = escapeXml(text);
  const marks = Array.from({ length: 36 }, (_, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);

    return `<text x="${column * 320 - 80}" y="${row * 150}" transform="rotate(-22 ${column * 320} ${row * 150})" fill="#2d2926" fill-opacity="0.22" font-size="28" font-family="Arial" font-weight="700">${escapedText}</text>`;
  }).join("");

  return Buffer.from(
    `<svg width="${widthPx}" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">${marks}</svg>`
  );
}

function createSingleImagePdf({
  image,
  imageWidth,
  imageHeight,
  widthPt,
  heightPt
}: {
  image: Buffer;
  imageWidth: number;
  imageHeight: number;
  widthPt: number;
  heightPt: number;
}) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,
    `<< /Length ${`q ${widthPt.toFixed(2)} 0 0 ${heightPt.toFixed(2)} 0 0 cm /Im0 Do Q`.length} >>\nstream\nq ${widthPt.toFixed(2)} 0 0 ${heightPt.toFixed(2)} 0 0 cm /Im0 Do Q\nendstream`
  ];
  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n")];
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(`${index + 1} 0 obj\n${object}`));

    if (index === 3) {
      chunks.push(image, Buffer.from("\nendstream\nendobj\n"));
    } else {
      chunks.push(Buffer.from("\nendobj\n"));
    }
  });

  const body = Buffer.concat(chunks);
  const xrefOffset = body.length;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF"
  ].join("\n");

  return Buffer.concat([body, Buffer.from(xref)]);
}

function getLocalUploadPath(originalUrl: string) {
  if (!originalUrl.startsWith("local://")) {
    return null;
  }

  return path.join(process.cwd(), ".local-storage", "uploads", originalUrl.replace("local://", ""));
}

function clampFinite(value: unknown, min: number, max: number, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numeric));
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
