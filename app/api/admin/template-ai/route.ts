import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

  return NextResponse.json({
    status: "draft_extraction_ready",
    message:
      "First version intake complete. Connect a vision model here to convert the reference into a real template draft.",
    draftTemplate: {
      name: templateName,
      category,
      productType,
      sheetSize,
      source: {
        type: sourceType,
        url: sourceUrl || null,
        uploadedFile:
          referenceImage instanceof File && referenceImage.size > 0
            ? {
                name: referenceImage.name,
                size: referenceImage.size,
                type: referenceImage.type
              }
            : null
      },
      notes,
      suggestedSlots: [
        { x: 0.08, y: 0.12, width: 0.4, height: 0.32, shape: "rect", role: "hero" },
        { x: 0.52, y: 0.12, width: 0.4, height: 0.32, shape: "rect", role: "supporting" },
        { x: 0.08, y: 0.5, width: 0.84, height: 0.34, shape: "rect", role: "supporting" }
      ],
      suggestedTextFields: [
        { key: "title", label: "Title", x: 0.08, y: 0.04, width: 0.84, height: 0.06 },
        { key: "caption", label: "Caption", x: 0.08, y: 0.88, width: 0.84, height: 0.06 }
      ],
      nextSteps: [
        "Review detected geometry in the admin studio.",
        "Adjust slots and text fields manually.",
        "Save as inactive draft template before publishing."
      ]
    }
  });
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}
