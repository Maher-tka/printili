import { NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/photo-analyzer";
import { SheetSize as PrismaSheetSize } from "@/lib/generated/prisma/client";
import {
  addPhotosToGuestProject,
  getGuestProject,
  type UploadedProjectPhoto
} from "@/lib/project-store";
import { getStorageProvider } from "@/lib/storage";

const maxPhotoSizeBytes = 12 * 1024 * 1024;
const maxProjectPhotoCount = 40;

export const runtime = "nodejs";

type AddProjectPhotosRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function POST(request: Request, { params }: AddProjectPhotosRouteProps) {
  const { guestToken } = await params;
  const project = await getGuestProject(guestToken);

  if (!project || new Date(project.expiresAt) < new Date()) {
    return NextResponse.json(
      { message: "This private project link is no longer available." },
      { status: 404 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("photos").filter((value): value is File => value instanceof File);
  const returnTo = normalizeReturnTo(formData.get("returnTo"));
  const fieldError = validateFiles({
    existingPhotoCount: project.photos.length,
    files
  });

  if (fieldError) {
    return NextResponse.json({ message: fieldError }, { status: 400 });
  }

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
        sheetSize: project.sheetSize === "A3" ? PrismaSheetSize.A3 : PrismaSheetSize.A4
      });
      const storedPhoto = await storage.saveOriginalPhoto({
        projectCode: project.projectCode,
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

    const updatedProject = await addPhotosToGuestProject({
      guestToken,
      photos
    });

    if (!updatedProject) {
      return NextResponse.json({ message: "This private project was not found." }, { status: 404 });
    }

    return NextResponse.json({
      addedPhotoCount: photos.length,
      photoCount: updatedProject.photos.length,
      redirectTo:
        returnTo === "editor" && updatedProject.chosenTemplateSlug
          ? `/project/${guestToken}/editor`
          : `/project/${guestToken}/suggestions`
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "We could not add those photos. Please try again."
      },
      { status: 400 }
    );
  }
}

function normalizeReturnTo(value: FormDataEntryValue | null) {
  return value === "editor" ? "editor" : "suggestions";
}

function validateFiles({
  existingPhotoCount,
  files
}: {
  existingPhotoCount: number;
  files: File[];
}) {
  if (files.length === 0) {
    return "Choose at least one photo to add.";
  }

  if (existingPhotoCount + files.length > maxProjectPhotoCount) {
    const remaining = Math.max(0, maxProjectPhotoCount - existingPhotoCount);

    return remaining === 0
      ? `This project already has ${maxProjectPhotoCount} photos.`
      : `Add ${remaining} photo${remaining === 1 ? "" : "s"} or fewer for now.`;
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
