import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analyzePhoto: vi.fn(),
  chooseTemplateForProject: vi.fn(),
  createGuestProject: vi.fn(),
  getPublicTemplateBySlug: vi.fn(),
  saveOriginalPhoto: vi.fn()
}));

vi.mock("@/lib/photo-analyzer", () => ({
  analyzePhoto: mocks.analyzePhoto
}));

vi.mock("@/lib/storage", () => ({
  getStorageProvider: () => ({
    saveOriginalPhoto: mocks.saveOriginalPhoto
  })
}));

vi.mock("@/lib/project-store", () => ({
  chooseTemplateForProject: mocks.chooseTemplateForProject,
  createGuestProject: mocks.createGuestProject,
  createGuestToken: () => "guest-token",
  createProjectCode: () => "MTG-TEST"
}));

vi.mock("@/lib/public-template-store", () => ({
  getPublicTemplateBySlug: mocks.getPublicTemplateBySlug
}));

describe("project start route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.analyzePhoto.mockResolvedValue({
      widthPx: 1200,
      heightPx: 1600,
      orientation: "PORTRAIT",
      aspectRatio: 0.75,
      fileSizeBytes: 24,
      estimatedPrintQuality: "GOOD",
      brightnessScore: 0.8,
      sharpnessScore: 0.8,
      qualityWarnings: []
    });
    mocks.saveOriginalPhoto.mockResolvedValue({
      url: "local://projects/MTG-TEST/photo.jpg"
    });
    mocks.createGuestProject.mockResolvedValue({
      guestToken: "guest-token",
      projectCode: "MTG-TEST",
      persistence: "local"
    });
    mocks.chooseTemplateForProject.mockResolvedValue({
      guestToken: "guest-token",
      projectCode: "MTG-TEST",
      persistence: "local"
    });
  });

  it("rejects Graduation upload-first projects without a selected product", async () => {
    const { POST } = await import("@/app/api/projects/start/route");
    const response = await POST(makeStartRequest({ category: "graduation" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Choose a Graduation product before uploading.");
    expect(mocks.createGuestProject).not.toHaveBeenCalled();
    expect(mocks.getPublicTemplateBySlug).not.toHaveBeenCalled();
  });

  it("allows direct starts with a Graduation product template", async () => {
    mocks.getPublicTemplateBySlug.mockResolvedValue({
      slug: "graduation-water-bottle-label",
      categoryId: "graduation"
    });

    const { POST } = await import("@/app/api/projects/start/route");
    const response = await POST(
      makeStartRequest({
        category: "graduation",
        templateSlug: "graduation-water-bottle-label"
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.redirectTo).toBe("/project/guest-token/editor");
    expect(mocks.createGuestProject).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "graduation",
        photos: expect.arrayContaining([
          expect.objectContaining({
            fileName: "photo.jpg",
            originalUrl: "local://projects/MTG-TEST/photo.jpg"
          })
        ])
      })
    );
    expect(mocks.chooseTemplateForProject).toHaveBeenCalledWith({
      guestToken: "guest-token",
      templateSlug: "graduation-water-bottle-label"
    });
  });
});

function makeStartRequest({ category, templateSlug }: { category: string; templateSlug?: string }) {
  const formData = new FormData();
  formData.set("category", category);
  if (templateSlug) {
    formData.set("templateSlug", templateSlug);
  }
  formData.append(
    "photos",
    new File([new Uint8Array([1, 2, 3])], "photo.jpg", {
      type: "image/jpeg"
    })
  );

  return new Request("http://localhost/api/projects/start", {
    method: "POST",
    body: formData
  });
}
