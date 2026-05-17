import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  savePublicTemplate,
  saveTemplatePreviewFile,
  slugifyTemplate
} from "@/lib/public-template-store";
import {
  detectTemplateShapesFromImage,
  detectTemplateShapesFromSvg
} from "@/lib/template-shape-detector";
import { getCategoryById } from "@/lib/templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ message: "Admin authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const templateName = getText(formData, "templateName") || "Untitled collage template";
  const sourceType = getText(formData, "sourceType") || "layout_image";
  const sourceUrl = getText(formData, "sourceUrl");
  const category = getText(formData, "category") || "custom";
  const productType = getText(formData, "productType") || "poster";
  const sheetSize = getText(formData, "sheetSize") || "A4";
  const notes = getText(formData, "notes");
  const referenceImage = formData.get("referenceImage");
  const layoutFile = formData.get("layoutFile");
  const slug = slugifyTemplate(templateName);
  const uploadedReferenceImage =
    referenceImage instanceof File && referenceImage.size > 0 ? referenceImage : null;
  const uploadedLayoutFile = layoutFile instanceof File && layoutFile.size > 0 ? layoutFile : null;
  const uploadedFile = uploadedReferenceImage
    ? {
        name: uploadedReferenceImage.name,
        size: uploadedReferenceImage.size,
        type: uploadedReferenceImage.type
      }
    : null;
  const uploadedVectorFile = uploadedLayoutFile
    ? {
        name: uploadedLayoutFile.name,
        size: uploadedLayoutFile.size,
        type: uploadedLayoutFile.type
      }
    : null;
  const uploadBuffer = uploadedReferenceImage
    ? Buffer.from(await uploadedReferenceImage.arrayBuffer())
    : null;
  const layoutBuffer = uploadedLayoutFile
    ? Buffer.from(await uploadedLayoutFile.arrayBuffer())
    : null;
  const referenceImageIsSvg = uploadedReferenceImage ? isSvgUpload(uploadedReferenceImage) : false;
  const layoutFileIsSvg = uploadedLayoutFile ? isSvgUpload(uploadedLayoutFile) : false;

  if (!uploadBuffer && !layoutBuffer) {
    return NextResponse.json(
      {
        status: "reference_required",
        message:
          "Upload a real collage image or a clean SVG layout so the shape detector can find rectangles. URL-only extraction is not enabled yet."
      },
      { status: 400 }
    );
  }

  if (layoutBuffer && !layoutFileIsSvg) {
    return NextResponse.json(
      {
        status: "unsupported_layout_file",
        message:
          "The exact layout file must be an SVG export. EPS/PDF needs to be exported to SVG first so the rectangle coordinates stay readable."
      },
      { status: 400 }
    );
  }

  const detectedLayout =
    layoutBuffer && layoutFileIsSvg
      ? detectTemplateShapesFromSvg(layoutBuffer)
      : uploadBuffer && referenceImageIsSvg
        ? detectTemplateShapesFromSvg(uploadBuffer)
        : await detectTemplateShapesFromImage(uploadBuffer as Buffer);

  if (detectedLayout.frames.length === 0) {
    return NextResponse.json(
      {
        status: "no_shapes_detected",
        message:
          "No reliable photo rectangles were detected. Try a cleaner front-facing collage image or an SVG export where the photo boxes are separate rectangles.",
        draftTemplate: {
          name: templateName,
          category,
          productType,
          sheetSize,
          source: {
            type: sourceType,
            url: sourceUrl || null,
            uploadedFile,
            uploadedVectorFile
          },
          notes,
          detectedSlots: []
        }
      },
      { status: 422 }
    );
  }

  const previewBuffer = uploadBuffer ?? layoutBuffer;
  const previewFile = uploadedReferenceImage ?? uploadedLayoutFile;
  const previewImage =
    previewBuffer && previewFile
      ? await saveTemplatePreviewFile({
          slug,
          fileName: previewFile.name,
          buffer: previewBuffer
        })
      : sourceUrl || undefined;
  const savedTemplate = await savePublicTemplate({
    slug,
    name: templateName,
    category,
    productType,
    sheetSize,
    description: notes || undefined,
    previewImage,
    canvas: detectedLayout.canvas,
    frames: detectedLayout.frames,
    textFields: []
  });

  if (request.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(
      new URL(`/admin/template-ai/review/${savedTemplate.template.slug}?saved=1`, request.url),
      303
    );
  }

  const savedCategory = getCategoryById(savedTemplate.template.categoryId);

  return NextResponse.json({
    status: "template_saved",
    message:
      "Template intake saved. Review and correct the detected slots before customers use it.",
    savedTemplate: savedTemplate.template,
    persistence: savedTemplate.persistence,
    reviewUrl: `/admin/template-ai/review/${savedTemplate.template.slug}`,
    publicUrl: `/template/${savedTemplate.template.slug}`,
    categoryUrl: savedCategory ? `/templates/${savedCategory.slug}` : "/templates",
    draftTemplate: {
      name: templateName,
      category,
      productType,
      sheetSize,
      source: {
        type: sourceType,
        url: sourceUrl || null,
        uploadedFile,
        uploadedVectorFile
      },
      notes,
      detectedSlots: detectedLayout.frames,
      detectedTextFields: [],
      nextSteps: [
        "Review detected rectangles against the uploaded reference.",
        "Adjust missed or wrong slots manually in the template maker.",
        "Open the public category to confirm the saved preview."
      ]
    }
  });
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function isSvgUpload(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}
