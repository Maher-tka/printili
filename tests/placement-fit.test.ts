import { describe, expect, it } from "vitest";
import {
  getEffectivePlacementControls,
  getSmartCropSuggestion,
  normalizeEditableFitModeForSlot
} from "@/lib/placement-fit";
import type { ProjectPlacementSummary, UploadedProjectPhoto } from "@/lib/project-store";
import type { TemplateSlotSeed } from "@/types/templates";

const wideHeroSlot: TemplateSlotSeed = {
  id: "wide-hero",
  x: 0,
  y: 0,
  width: 0.72,
  height: 0.32,
  shape: "rect",
  role: "hero",
  preferredOrientation: "landscape",
  zIndex: 1,
  borderRadius: 0.04,
  allowBlurFill: true,
  allowSmartCrop: true
};

const portraitPhoto = {
  aspectRatio: 0.5,
  heightPx: 2400,
  widthPx: 1200
};

describe("placement fit helpers", () => {
  it("biases smart crop upward for a portrait photo in a wide frame", () => {
    const suggestion = getSmartCropSuggestion({
      photo: portraitPhoto,
      slot: wideHeroSlot
    });

    expect(suggestion.zoom).toBeGreaterThan(1);
    expect(suggestion.offsetY).toBeGreaterThan(0);
    expect(suggestion.offsetX).toBe(0);
  });

  it("keeps smart crop neutral when a slot opts out", () => {
    const suggestion = getSmartCropSuggestion({
      photo: portraitPhoto,
      slot: {
        ...wideHeroSlot,
        allowSmartCrop: false
      }
    });

    expect(suggestion).toEqual({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0
    });
  });

  it("applies smart crop as an additive fit mode without overwriting manual controls", () => {
    const placement: ProjectPlacementSummary = {
      id: "placement-1",
      photoId: "photo-1",
      slotId: wideHeroSlot.id,
      fitMode: "smart_crop",
      zoom: 1.1,
      offsetX: 2,
      offsetY: 4,
      rotation: 5
    };

    const controls = getEffectivePlacementControls({
      placement,
      photo: portraitPhoto as UploadedProjectPhoto,
      slot: wideHeroSlot
    });

    expect(controls.zoom).toBeGreaterThan(placement.zoom);
    expect(controls.offsetX).toBe(placement.offsetX);
    expect(controls.offsetY).toBeGreaterThan(placement.offsetY);
    expect(controls.rotation).toBe(placement.rotation);
  });

  it("normalizes unfinished face and subject modes back to cover", () => {
    expect(normalizeEditableFitModeForSlot("face_priority", wideHeroSlot)).toBe("cover");
    expect(normalizeEditableFitModeForSlot("subject_priority", wideHeroSlot)).toBe("cover");
    expect(
      normalizeEditableFitModeForSlot("smart_crop", { ...wideHeroSlot, allowSmartCrop: false })
    ).toBe("cover");
  });
});
