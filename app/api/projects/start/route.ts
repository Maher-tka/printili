import { NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/photo-analyzer";
import { SheetSize as PrismaSheetSize } from "@/lib/generated/prisma/client";
import {
  createGuestProject,
  createGuestToken,
  createProjectCode,
  chooseTemplateForProject,
  type UploadedProjectPhoto
} from "@/lib/project-store";
import { getStorageProvider } from "@/lib/storage";
import type { TemplateCategoryId } from "@/types/templates";

const maxPhotoSizeBytes = 12 * 1024 * 1024;
const maxPhotoCount = 40;
const allowedCategories: TemplateCategoryId[] = [
  "baby",
  "couple",
  "birthday",
  "family",
  "wedding",
  "cut_sheet",
  "graduation",
  "custom"
];

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const category = formData.get("category");
  const templateSlug = formData.get("templateSlug");
  const files = formData.getAll("photos").filter((value): value is File => value instanceof File);

  const fieldError = validateFields(category, files);

  if (fieldError) {
    return NextResponse.json({ message: fieldError }, { status: 400 });
  }

  const guestToken = createGuestToken();
  const projectCode = createProjectCode();
  const storage = getStorageProvider();
  const photos: UploadedProjectPhoto[] = [];

  try {
    for (const file of files) {
      validatePhoto(file);

      const buffer = Buffer.from(await file.arrayBuffer());
      const analysis = await analyzePhoto({
        buffer,
        fileName: file.name,
        fileSizeBytes: file.size,
        sheetSize: PrismaSheetSize.A4
      });
      const storedPhoto = await storage.saveOriginalPhoto({
        projectCode,
        fileName: file.name,
        contentType: file.type,
        buffer
      });

      photos.push({
        fileName: file.name,
        originalUrl: storedPhoto.url,
        widthPx: analysis.widthPx,
        heightPx: analysis.heightPx,
        orientation: analysis.orientation,
        aspectRatio: analysis.aspectRatio,
        fileSizeBytes: analysis.fileSizeBytes,
        estimatedPrintQuality: analysis.estimatedPrintQuality,
        brightnessScore: analysis.brightnessScore,
        sharpnessScore: analysis.sharpnessScore,
        qualityWarnings: analysis.qualityWarnings
      });
    }

    const project = await createGuestProject({
      category: category as TemplateCategoryId,
      sheetSize: "custom",
      guestToken,
      projectCode,
      photos
    });
    const selectedProject =
      typeof templateSlug === "string" && templateSlug.trim()
        ? await chooseTemplateForProject({
            guestToken: project.guestToken,
            templateSlug: templateSlug.trim()
          })
        : null;

    return NextResponse.json({
      projectCode: project.projectCode,
      guestToken: project.guestToken,
      persistence: project.persistence,
      redirectTo: selectedProject
        ? `/project/${project.guestToken}/editor`
        : `/project/${project.guestToken}/suggestions`
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "We could not upload those photos. Please try again."
      },
      { status: 400 }
    );
  }
}

function validateFields(category: FormDataEntryValue | null, files: File[]) {
  if (typeof category !== "string" || !allowedCategories.includes(category as TemplateCategoryId)) {
    return "Choose a gift category before uploading your photos.";
  }

  if (files.length === 0) {
    return "Add at least one photo to start your project.";
  }

  if (files.length > maxPhotoCount) {
    return `Upload ${maxPhotoCount} photos or fewer for now.`;
  }

  return null;
}

function validatePhoto(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image file. Please upload photos only.`);
  }

  if (file.size > maxPhotoSizeBytes) {
    throw new Error(`${file.name} is larger than 12 MB. Please choose a smaller photo.`);
  }
}
