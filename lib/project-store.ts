import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  EstimatedPrintQuality,
  FitMode,
  PhotoOrientation,
  ProjectStatus,
  SheetSize,
  TemplateCategory
} from "@/lib/generated/prisma/client";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";
import {
  assertLocalJsonFallbackAllowed,
  handleDatabaseFailure,
  hasConfiguredDatabaseUrl
} from "@/lib/runtime-config";
import type { SheetSize as CustomerSheetSize, TemplateCategoryId } from "@/types/templates";

export type UploadedProjectPhoto = {
  id?: string;
  fileName: string;
  originalUrl: string;
  widthPx: number | null;
  heightPx: number | null;
  orientation: PhotoOrientation | null;
  aspectRatio: number | null;
  fileSizeBytes: number;
  estimatedPrintQuality: EstimatedPrintQuality;
  brightnessScore: number | null;
  sharpnessScore: number | null;
  qualityWarnings: string[];
};

export type ProjectPlacementSummary = {
  id: string;
  photoId: string;
  slotId: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  focusX: number;
  focusY: number;
  blurBackground: boolean;
  fitMode: EditableFitMode;
};

export const editableFitModes = [
  "cover",
  "contain",
  "contain_blur",
  "smart_crop",
  "face_priority",
  "subject_priority"
] as const;

export type EditableFitMode = (typeof editableFitModes)[number];

export const implementedFitModes = [
  "cover",
  "contain",
  "contain_blur",
  "smart_crop"
] as const satisfies readonly EditableFitMode[];

export type ImplementedFitMode = (typeof implementedFitModes)[number];

export function isImplementedFitMode(value: string): value is ImplementedFitMode {
  return implementedFitModes.includes(value as ImplementedFitMode);
}

export type GuestProjectSummary = {
  id: string;
  guestToken: string;
  projectCode: string;
  category: TemplateCategoryId;
  sheetSize: CustomerSheetSize;
  status: string;
  chosenTemplateId?: string | null;
  chosenTemplateSlug?: string | null;
  expiresAt: string;
  createdAt: string;
  photos: UploadedProjectPhoto[];
  placements: ProjectPlacementSummary[];
  textValues: Record<string, string>;
  designApproved: boolean;
  clientApprovedPreview: boolean;
  persistence: "database" | "local";
};

type CreateGuestProjectInput = {
  category: TemplateCategoryId;
  sheetSize: CustomerSheetSize;
  photos: UploadedProjectPhoto[];
  guestToken?: string;
  projectCode?: string;
};

type AddProjectPhotosInput = {
  guestToken: string;
  photos: UploadedProjectPhoto[];
};

type LocalProjectRecord = GuestProjectSummary;

const localStorePath = path.join(process.cwd(), ".local-storage", "projects.json");

const categoryToPrisma: Record<TemplateCategoryId, TemplateCategory> = {
  baby: TemplateCategory.BABY,
  couple: TemplateCategory.COUPLE,
  birthday: TemplateCategory.BIRTHDAY,
  family: TemplateCategory.FAMILY,
  wedding: TemplateCategory.WEDDING,
  cut_sheet: TemplateCategory.CUT_SHEET,
  graduation: TemplateCategory.GRADUATION,
  custom: TemplateCategory.CUSTOM
};

const prismaToCategory: Record<TemplateCategory, TemplateCategoryId> = {
  [TemplateCategory.BABY]: "baby",
  [TemplateCategory.COUPLE]: "couple",
  [TemplateCategory.BIRTHDAY]: "birthday",
  [TemplateCategory.FAMILY]: "family",
  [TemplateCategory.WEDDING]: "wedding",
  [TemplateCategory.CUT_SHEET]: "cut_sheet",
  [TemplateCategory.GRADUATION]: "graduation",
  [TemplateCategory.CUSTOM]: "custom"
};

const sheetSizeToPrisma: Record<CustomerSheetSize, SheetSize> = {
  A4: SheetSize.A4,
  A3: SheetSize.A3,
  custom: SheetSize.CUSTOM
};

const prismaToSheetSize: Record<SheetSize, CustomerSheetSize> = {
  [SheetSize.A4]: "A4",
  [SheetSize.A3]: "A3",
  [SheetSize.CUSTOM]: "custom"
};

export async function createGuestProject(input: CreateGuestProjectInput) {
  const guestToken = input.guestToken ?? createGuestToken();
  const projectCode = input.projectCode ?? createProjectCode();
  const expiresAt = getDefaultProjectExpiry();

  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const project = await prisma.project.create({
        data: {
          guestToken,
          projectCode,
          category: categoryToPrisma[input.category],
          sheetSize: sheetSizeToPrisma[input.sheetSize],
          status: ProjectStatus.DRAFT,
          designApproved: false,
          clientApprovedPreview: false,
          expiresAt,
          photos: {
            create: input.photos.map((photo) => ({
              fileName: photo.fileName,
              originalUrl: photo.originalUrl,
              widthPx: photo.widthPx,
              heightPx: photo.heightPx,
              orientation: photo.orientation,
              aspectRatio: photo.aspectRatio,
              fileSizeBytes: photo.fileSizeBytes,
              estimatedPrintQuality: photo.estimatedPrintQuality,
              brightnessScore: photo.brightnessScore,
              sharpnessScore: photo.sharpnessScore,
              qualityWarnings: photo.qualityWarnings
            }))
          }
        },
        include: {
          chosenTemplate: {
            select: {
              slug: true
            }
          },
          photos: {
            orderBy: {
              uploadedAt: "asc"
            }
          },
          placements: {
            orderBy: {
              createdAt: "asc"
            }
          },
          textValues: true
        }
      });

      return toSummary(project, "database");
    } catch (error) {
      handleDatabaseFailure("Database project creation failed", error);
    }
  }

  return saveLocalProject({
    id: randomUUID(),
    guestToken,
    projectCode,
    category: input.category,
    sheetSize: input.sheetSize,
    status: "draft",
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    photos: input.photos,
    placements: [],
    textValues: {},
    designApproved: false,
    clientApprovedPreview: false,
    persistence: "local"
  });
}

export async function getGuestProject(guestToken: string): Promise<GuestProjectSummary | null> {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const project = await prisma.project.findUnique({
        where: {
          guestToken
        },
        include: {
          chosenTemplate: {
            select: {
              slug: true
            }
          },
          photos: {
            orderBy: {
              uploadedAt: "asc"
            }
          },
          placements: {
            orderBy: {
              createdAt: "asc"
            }
          },
          textValues: true
        }
      });

      return project ? toSummary(project, "database") : null;
    } catch (error) {
      handleDatabaseFailure("Database project lookup failed", error);
    }
  }

  const store = await readLocalStore();

  const project = store.find((project) => project.guestToken === guestToken);

  return project ? withLocalDefaults(project) : null;
}

export async function addPhotosToGuestProject({ guestToken, photos }: AddProjectPhotosInput) {
  if (photos.length === 0) {
    return getGuestProject(guestToken);
  }

  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const project = await prisma.project.findUnique({
        where: {
          guestToken
        },
        select: {
          id: true
        }
      });

      if (!project) {
        return null;
      }

      await prisma.projectPhoto.createMany({
        data: photos.map((photo) => ({
          projectId: project.id,
          fileName: photo.fileName,
          originalUrl: photo.originalUrl,
          widthPx: photo.widthPx,
          heightPx: photo.heightPx,
          orientation: photo.orientation,
          aspectRatio: photo.aspectRatio,
          fileSizeBytes: photo.fileSizeBytes,
          estimatedPrintQuality: photo.estimatedPrintQuality,
          brightnessScore: photo.brightnessScore,
          sharpnessScore: photo.sharpnessScore,
          qualityWarnings: photo.qualityWarnings
        }))
      });

      return getGuestProject(guestToken);
    } catch (error) {
      handleDatabaseFailure("Database project photo update failed", error);
    }
  }

  return updateLocalProject(guestToken, (project) => {
    const existingPhotos = project.photos.map((photo, index) => ({
      ...photo,
      id: photo.id ?? `local-photo-${index + 1}`
    }));
    const nextPhotos = photos.map((photo, index) => ({
      ...photo,
      id: photo.id ?? `local-photo-${existingPhotos.length + index + 1}`
    }));

    return {
      ...project,
      photos: [...existingPhotos, ...nextPhotos]
    };
  });
}

export async function chooseTemplateForProject({
  guestToken,
  templateSlug
}: {
  guestToken: string;
  templateSlug: string;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const [project, template] = await Promise.all([
        prisma.project.findUnique({
          where: {
            guestToken
          },
          include: {
            photos: {
              orderBy: {
                uploadedAt: "asc"
              }
            }
          }
        }),
        prisma.template.findUnique({
          where: {
            slug: templateSlug
          },
          include: {
            slots: {
              orderBy: {
                zIndex: "asc"
              }
            }
          }
        })
      ]);

      if (!project) {
        return null;
      }

      if (!template) {
        throw new Error("Template is not seeded in the database yet. Run npm run db:seed.");
      }

      const placements = createDefaultPlacementInputs({
        photoIds: project.photos.map((photo) => photo.id),
        slotIds: template.slots.map((slot) => slot.id)
      });

      const updatedProject = await prisma.project.update({
        where: {
          id: project.id
        },
        data: {
          chosenTemplateId: template.id,
          sheetSize: template.sheetSize,
          status: ProjectStatus.TEMPLATE_SELECTED,
          placements: {
            deleteMany: {},
            create: placements.map((placement) => ({
              photo: {
                connect: {
                  id: placement.photoId
                }
              },
              slot: {
                connect: {
                  id: placement.slotId
                }
              },
              zoom: placement.zoom,
              offsetX: placement.offsetX,
              offsetY: placement.offsetY,
              rotation: placement.rotation,
              focusX: placement.focusX,
              focusY: placement.focusY,
              blurBackground: placement.blurBackground,
              fitMode: FitMode.COVER
            }))
          },
          textValues: {
            deleteMany: {}
          }
        },
        include: {
          chosenTemplate: {
            select: {
              slug: true
            }
          },
          photos: {
            orderBy: {
              uploadedAt: "asc"
            }
          },
          placements: {
            orderBy: {
              createdAt: "asc"
            }
          },
          textValues: true
        }
      });

      return toSummary(updatedProject, "database", template.slug);
    } catch (error) {
      handleDatabaseFailure("Database template selection failed", error);
    }
  }

  return chooseLocalTemplate({ guestToken, templateSlug });
}

export function createGuestToken() {
  return randomBytes(32).toString("base64url");
}

export function createProjectCode() {
  return `MTG-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function getDefaultProjectExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt;
}

async function saveLocalProject(project: LocalProjectRecord) {
  assertLocalJsonFallbackAllowed("Project");
  const store = await readLocalStore();
  store.push(project);
  await mkdir(path.dirname(localStorePath), { recursive: true });
  await writeFile(localStorePath, JSON.stringify(store, null, 2));

  return project;
}

async function chooseLocalTemplate({
  guestToken,
  templateSlug
}: {
  guestToken: string;
  templateSlug: string;
}) {
  assertLocalJsonFallbackAllowed("Project");
  const store = await readLocalStore();
  const projectIndex = store.findIndex((project) => project.guestToken === guestToken);

  if (projectIndex === -1) {
    return null;
  }

  const project = store[projectIndex];
  const photoIds = project.photos.map((photo, index) => photo.id ?? `local-photo-${index + 1}`);
  const template = await getPublicTemplateBySlug(templateSlug);

  if (!template) {
    throw new Error("Template was not found in the public template library.");
  }

  const layout = await getPublicTemplateEditorLayout(template.slug);

  const updatedProject: LocalProjectRecord = {
    ...project,
    status: "template_selected",
    chosenTemplateId: template.id,
    chosenTemplateSlug: template.slug,
    sheetSize: template.sheetSize,
    photos: project.photos.map((photo, index) => ({
      ...photo,
      id: photoIds[index]
    })),
    placements: createDefaultPlacementInputs({
      photoIds,
      slotIds: layout.slots.map((slot) => slot.id)
    }),
    textValues: {}
  };

  store[projectIndex] = updatedProject;
  await mkdir(path.dirname(localStorePath), { recursive: true });
  await writeFile(localStorePath, JSON.stringify(store, null, 2));

  return updatedProject;
}

async function readLocalStore(): Promise<LocalProjectRecord[]> {
  assertLocalJsonFallbackAllowed("Project");

  try {
    return JSON.parse(await readFile(localStorePath, "utf8")) as LocalProjectRecord[];
  } catch {
    return [];
  }
}

function withLocalDefaults(project: LocalProjectRecord): LocalProjectRecord {
  return {
    ...project,
    placements: (project.placements ?? []).map(withPlacementDefaults),
    textValues: project.textValues ?? {},
    designApproved: project.designApproved ?? false,
    clientApprovedPreview: project.clientApprovedPreview ?? false
  };
}

function toSummary(
  project: {
    id: string;
    guestToken: string;
    projectCode: string;
    category: TemplateCategory;
    sheetSize: SheetSize;
    status: ProjectStatus;
    chosenTemplateId?: string | null;
    chosenTemplate?: {
      slug: string;
    } | null;
    expiresAt: Date;
    createdAt: Date;
    designApproved?: boolean;
    clientApprovedPreview?: boolean;
    photos: Array<{
      id: string;
      fileName: string;
      originalUrl: string;
      widthPx: number | null;
      heightPx: number | null;
      orientation: PhotoOrientation | null;
      aspectRatio: unknown;
      fileSizeBytes: number | null;
      estimatedPrintQuality: EstimatedPrintQuality;
      brightnessScore: unknown;
      sharpnessScore: unknown;
      qualityWarnings: string[];
    }>;
    placements?: Array<{
      id: string;
      photoId: string;
      slotId: string;
      zoom: unknown;
      offsetX: unknown;
      offsetY: unknown;
      rotation: unknown;
      focusX?: unknown;
      focusY?: unknown;
      blurBackground?: boolean | null;
      fitMode: FitMode;
    }>;
    textValues?: Array<{
      fieldKey: string;
      value: string;
    }>;
  },
  persistence: "database" | "local",
  chosenTemplateSlug?: string | null
): GuestProjectSummary {
  return {
    id: project.id,
    guestToken: project.guestToken,
    projectCode: project.projectCode,
    category: prismaToCategory[project.category],
    sheetSize: prismaToSheetSize[project.sheetSize],
    status: project.status.toLowerCase(),
    chosenTemplateId: project.chosenTemplateId ?? null,
    chosenTemplateSlug: chosenTemplateSlug ?? project.chosenTemplate?.slug ?? null,
    expiresAt: project.expiresAt.toISOString(),
    createdAt: project.createdAt.toISOString(),
    persistence,
    photos: project.photos.map((photo) => ({
      id: photo.id,
      fileName: photo.fileName,
      originalUrl: photo.originalUrl,
      widthPx: photo.widthPx,
      heightPx: photo.heightPx,
      orientation: photo.orientation,
      aspectRatio: photo.aspectRatio === null ? null : Number(photo.aspectRatio),
      fileSizeBytes: photo.fileSizeBytes ?? 0,
      estimatedPrintQuality: photo.estimatedPrintQuality,
      brightnessScore: photo.brightnessScore === null ? null : Number(photo.brightnessScore),
      sharpnessScore: photo.sharpnessScore === null ? null : Number(photo.sharpnessScore),
      qualityWarnings: photo.qualityWarnings
    })),
    placements: (project.placements ?? []).map((placement) => ({
      id: placement.id,
      photoId: placement.photoId,
      slotId: placement.slotId,
      zoom: Number(placement.zoom),
      offsetX: Number(placement.offsetX),
      offsetY: Number(placement.offsetY),
      rotation: Number(placement.rotation),
      focusX: normalizePlacementPercent(placement.focusX, 50),
      focusY: normalizePlacementPercent(placement.focusY, 50),
      blurBackground: placement.blurBackground ?? placement.fitMode === FitMode.CONTAIN_BLUR,
      fitMode: fromPrismaFitMode(placement.fitMode)
    })),
    textValues: Object.fromEntries(
      (project.textValues ?? []).map((textValue) => [textValue.fieldKey, textValue.value])
    ),
    designApproved: project.designApproved ?? false,
    clientApprovedPreview: project.clientApprovedPreview ?? false
  };
}

export function createDefaultPlacementInputs({
  photoIds,
  slotIds
}: {
  photoIds: string[];
  slotIds: string[];
}): ProjectPlacementSummary[] {
  return slotIds.slice(0, photoIds.length).map((slotId, index) => ({
    id: `placement-${index + 1}`,
    photoId: photoIds[index],
    slotId,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    focusX: 50,
    focusY: 50,
    blurBackground: false,
    fitMode: "cover"
  }));
}

export async function updateProjectPlacement({
  guestToken,
  placementId,
  slotId,
  zoom,
  offsetX,
  offsetY,
  rotation,
  focusX,
  focusY,
  blurBackground,
  fitMode,
  photoId
}: {
  guestToken: string;
  placementId?: string;
  slotId?: string;
  photoId?: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  focusX: number;
  focusY: number;
  blurBackground: boolean;
  fitMode: EditableFitMode;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const project = await prisma.project.findUnique({
        where: {
          guestToken
        },
        select: {
          id: true,
          placements: {
            select: {
              id: true,
              slotId: true
            }
          }
        }
      });

      const placement = project?.placements.find((item) =>
        placementId ? item.id === placementId : item.slotId === slotId
      );

      if (!project || (!placement && (!slotId || !photoId))) {
        return null;
      }

      if (placement) {
        await prisma.projectPlacement.update({
          where: {
            id: placement.id
          },
          data: {
            zoom,
            offsetX,
            offsetY,
            rotation,
            focusX,
            focusY,
            blurBackground,
            fitMode: toPrismaFitMode(fitMode),
            ...(photoId ? { photo: { connect: { id: photoId } } } : {})
          }
        });
      } else {
        await prisma.projectPlacement.create({
          data: {
            projectId: project.id,
            slotId: slotId!,
            photoId: photoId!,
            zoom,
            offsetX,
            offsetY,
            rotation,
            focusX,
            focusY,
            blurBackground,
            fitMode: toPrismaFitMode(fitMode)
          }
        });
      }

      return getGuestProject(guestToken);
    } catch (error) {
      handleDatabaseFailure("Database placement update failed", error);
    }
  }

  return updateLocalProject(guestToken, (project) => {
    const placementIndex = project.placements.findIndex((placement) =>
      placementId ? placement.id === placementId : placement.slotId === slotId
    );

    if (placementIndex === -1 && (!slotId || !photoId)) {
      return null;
    }

    const placements = [...project.placements];
    if (placementIndex === -1) {
      placements.push({
        id: `placement-${placements.length + 1}`,
        slotId: slotId!,
        photoId: photoId!,
        zoom,
        offsetX,
        offsetY,
        rotation,
        focusX,
        focusY,
        blurBackground,
        fitMode
      });
    } else {
      placements[placementIndex] = {
        ...placements[placementIndex],
        zoom,
        offsetX,
        offsetY,
        rotation,
        focusX,
        focusY,
        blurBackground,
        fitMode,
        photoId: photoId ?? placements[placementIndex].photoId
      };
    }

    return {
      ...project,
      status: "editing",
      placements
    };
  });
}

export async function deleteProjectPlacement({
  guestToken,
  placementId,
  slotId
}: {
  guestToken: string;
  placementId?: string;
  slotId?: string;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const project = await prisma.project.findUnique({
        where: {
          guestToken
        },
        select: {
          placements: {
            select: {
              id: true,
              slotId: true
            }
          }
        }
      });
      const placement = project?.placements.find((item) =>
        placementId ? item.id === placementId : item.slotId === slotId
      );

      if (!placement) {
        return null;
      }

      await prisma.projectPlacement.delete({
        where: {
          id: placement.id
        }
      });

      return getGuestProject(guestToken);
    } catch (error) {
      handleDatabaseFailure("Database placement delete failed", error);
    }
  }

  return updateLocalProject(guestToken, (project) => ({
    ...project,
    status: "editing",
    placements: project.placements.filter((placement) =>
      placementId ? placement.id !== placementId : placement.slotId !== slotId
    )
  }));
}

export async function updateProjectTextValue({
  guestToken,
  fieldKey,
  value
}: {
  guestToken: string;
  fieldKey: string;
  value: string;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      const project = await prisma.project.findUnique({
        where: {
          guestToken
        },
        select: {
          id: true
        }
      });

      if (!project) {
        return null;
      }

      await prisma.projectTextValue.upsert({
        where: {
          projectId_fieldKey: {
            projectId: project.id,
            fieldKey
          }
        },
        update: {
          value
        },
        create: {
          projectId: project.id,
          fieldKey,
          value
        }
      });

      return getGuestProject(guestToken);
    } catch (error) {
      handleDatabaseFailure("Database text update failed", error);
    }
  }

  return updateLocalProject(guestToken, (project) => ({
    ...project,
    status: "editing",
    textValues: {
      ...project.textValues,
      [fieldKey]: value
    }
  }));
}

export async function updateProjectApproval({
  guestToken,
  designApproved,
  clientApprovedPreview
}: {
  guestToken: string;
  designApproved?: boolean;
  clientApprovedPreview?: boolean;
}) {
  if (hasConfiguredDatabaseUrl()) {
    try {
      const prisma = await getPrismaClient();
      await prisma.project.update({
        where: { guestToken },
        data: {
          ...(typeof designApproved === "boolean" ? { designApproved } : {}),
          ...(typeof clientApprovedPreview === "boolean" ? { clientApprovedPreview } : {})
        }
      });

      return getGuestProject(guestToken);
    } catch (error) {
      handleDatabaseFailure("Database project approval update failed", error);
    }
  }

  return updateLocalProject(guestToken, (project) => ({
    ...project,
    ...(typeof designApproved === "boolean" ? { designApproved } : {}),
    ...(typeof clientApprovedPreview === "boolean" ? { clientApprovedPreview } : {})
  }));
}

async function updateLocalProject(
  guestToken: string,
  update: (project: LocalProjectRecord) => LocalProjectRecord | null
) {
  assertLocalJsonFallbackAllowed("Project");
  const store = await readLocalStore();
  const projectIndex = store.findIndex((project) => project.guestToken === guestToken);

  if (projectIndex === -1) {
    return null;
  }

  const updatedProject = update(withLocalDefaults(store[projectIndex]));

  if (!updatedProject) {
    return null;
  }

  store[projectIndex] = updatedProject;
  await mkdir(path.dirname(localStorePath), { recursive: true });
  await writeFile(localStorePath, JSON.stringify(store, null, 2));

  return updatedProject;
}

function fromPrismaFitMode(fitMode: FitMode): EditableFitMode {
  if (fitMode === FitMode.CONTAIN) {
    return "contain";
  }

  if (fitMode === FitMode.CONTAIN_BLUR) {
    return "contain_blur";
  }

  if (fitMode === FitMode.SMART_CROP) {
    return "smart_crop";
  }

  if (fitMode === FitMode.FACE_PRIORITY) {
    return "face_priority";
  }

  if (fitMode === FitMode.SUBJECT_PRIORITY) {
    return "subject_priority";
  }

  return "cover";
}

function toPrismaFitMode(fitMode: EditableFitMode) {
  if (fitMode === "contain") {
    return FitMode.CONTAIN;
  }

  if (fitMode === "contain_blur") {
    return FitMode.CONTAIN_BLUR;
  }

  if (fitMode === "smart_crop") {
    return FitMode.SMART_CROP;
  }

  if (fitMode === "face_priority") {
    return FitMode.FACE_PRIORITY;
  }

  if (fitMode === "subject_priority") {
    return FitMode.SUBJECT_PRIORITY;
  }

  return FitMode.COVER;
}

function withPlacementDefaults(placement: ProjectPlacementSummary): ProjectPlacementSummary {
  return {
    ...placement,
    focusX: normalizePlacementPercent(placement.focusX, 50),
    focusY: normalizePlacementPercent(placement.focusY, 50),
    blurBackground: placement.blurBackground ?? placement.fitMode === "contain_blur"
  };
}

function normalizePlacementPercent(value: unknown, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, numeric));
}

async function getPrismaClient() {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
}
