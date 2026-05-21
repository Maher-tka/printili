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
  fitMode: EditableFitMode;
};

export const editableFitModes = [
  "cover",
  "contain_blur",
  "smart_crop",
  "face_priority",
  "subject_priority"
] as const;

export type EditableFitMode = (typeof editableFitModes)[number];

export const implementedFitModes = [
  "cover",
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

type LocalProjectRecord = GuestProjectSummary;

const localStorePath = path.join(process.cwd(), ".local-storage", "projects.json");

const categoryToPrisma: Record<TemplateCategoryId, TemplateCategory> = {
  baby: TemplateCategory.BABY,
  couple: TemplateCategory.COUPLE,
  birthday: TemplateCategory.BIRTHDAY,
  family: TemplateCategory.FAMILY,
  wedding: TemplateCategory.WEDDING,
  cut_sheet: TemplateCategory.CUT_SHEET,
  custom: TemplateCategory.CUSTOM
};

const prismaToCategory: Record<TemplateCategory, TemplateCategoryId> = {
  [TemplateCategory.BABY]: "baby",
  [TemplateCategory.COUPLE]: "couple",
  [TemplateCategory.BIRTHDAY]: "birthday",
  [TemplateCategory.FAMILY]: "family",
  [TemplateCategory.WEDDING]: "wedding",
  [TemplateCategory.CUT_SHEET]: "cut_sheet",
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
    placements: project.placements ?? [],
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

      if (!project || !placement) {
        return null;
      }

      await prisma.projectPlacement.update({
        where: {
          id: placement.id
        },
        data: {
          zoom,
          offsetX,
          offsetY,
          rotation,
          fitMode: toPrismaFitMode(fitMode),
          ...(photoId ? { photo: { connect: { id: photoId } } } : {})
        }
      });

      return getGuestProject(guestToken);
    } catch (error) {
      handleDatabaseFailure("Database placement update failed", error);
    }
  }

  return updateLocalProject(guestToken, (project) => {
    const placementIndex = project.placements.findIndex((placement) =>
      placementId ? placement.id === placementId : placement.slotId === slotId
    );

    if (placementIndex === -1) {
      return null;
    }

    const placements = [...project.placements];
    placements[placementIndex] = {
      ...placements[placementIndex],
      zoom,
      offsetX,
      offsetY,
      rotation,
      fitMode,
      photoId: photoId ?? placements[placementIndex].photoId
    };

    return {
      ...project,
      status: "editing",
      placements
    };
  });
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

async function getPrismaClient() {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
}
