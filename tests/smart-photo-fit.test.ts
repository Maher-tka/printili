import { describe, expect, it } from "vitest";
import {
  calculateSmartPhotoPlacement,
  getSlotTargetAspectRatio,
  shouldAutoRotatePhoto,
  shouldRepairUnsafePolaroidRotation
} from "@/lib/smart-photo-fit";
import type { UploadedProjectPhoto } from "@/lib/project-store";
import type { TemplateSlotSeed } from "@/types/templates";

const portraitSlot: TemplateSlotSeed = {
  id: "portrait-polaroid",
  x: 0,
  y: 0,
  width: 0.2,
  height: 0.32,
  shape: "rect",
  role: "thumbnail",
  preferredOrientation: "portrait",
  zIndex: 1,
  borderRadius: 0.04,
  allowBlurFill: true,
  allowSmartCrop: true
};

const wideSlot: TemplateSlotSeed = {
  ...portraitSlot,
  id: "wide-slot",
  width: 0.5,
  height: 0.22,
  preferredOrientation: "landscape"
};

function photo(
  widthPx: number,
  heightPx: number
): Pick<UploadedProjectPhoto, "aspectRatio" | "heightPx" | "widthPx"> {
  return {
    widthPx,
    heightPx,
    aspectRatio: widthPx / heightPx
  };
}

describe("smart photo fit", () => {
  it("auto-rotates only when the rotated ratio is clearly better", () => {
    expect(
      shouldAutoRotatePhoto({
        photoAspectRatio: 16 / 9,
        frameAspectRatio: 9 / 16
      })
    ).toBe(true);
    expect(
      shouldAutoRotatePhoto({
        photoAspectRatio: 1.1,
        frameAspectRatio: 1
      })
    ).toBe(false);
  });

  it("does not rotate normal landscape photos sideways inside portrait polaroids", () => {
    expect(
      shouldAutoRotatePhoto({
        photoAspectRatio: 16 / 9,
        frameAspectRatio: getSlotTargetAspectRatio(portraitSlot, "a4-9-polaroid-cut-sheet"),
        templateSlug: "a4-9-polaroid-cut-sheet"
      })
    ).toBe(false);

    const placement = calculateSmartPhotoPlacement({
      photo: photo(1600, 900),
      slot: portraitSlot,
      templateSlug: "a4-9-polaroid-cut-sheet"
    });

    expect(placement.rotation).toBe(0);
    expect(placement.fitMode).toBe("contain_blur");
  });

  it("does not rotate portrait photos sideways inside landscape polaroid windows", () => {
    expect(
      shouldAutoRotatePhoto({
        photoAspectRatio: 450 / 566,
        frameAspectRatio: getSlotTargetAspectRatio(wideSlot, "a4-9-polaroid-cut-sheet"),
        templateSlug: "a4-9-polaroid-cut-sheet"
      })
    ).toBe(false);

    const placement = calculateSmartPhotoPlacement({
      photo: photo(450, 566),
      slot: wideSlot,
      templateSlug: "a4-9-polaroid-cut-sheet"
    });

    expect(placement.rotation).toBe(0);
  });

  it("uses the polaroid photo window as the target ratio", () => {
    expect(getSlotTargetAspectRatio(portraitSlot, "a4-9-polaroid-cut-sheet")).toBeCloseTo(
      (portraitSlot.width * 0.88) / (portraitSlot.height * 0.76)
    );
  });

  it("chooses blur fill for a very mismatched image", () => {
    const placement = calculateSmartPhotoPlacement({
      photo: photo(4000, 700),
      slot: portraitSlot,
      templateSlug: "poster"
    });

    expect(placement.fitMode).toBe("contain_blur");
    expect(placement.blurBackground).toBe(true);
  });

  it("protects detected face focus in smart crop", () => {
    const placement = calculateSmartPhotoPlacement({
      faceFocus: {
        focusX: 62,
        focusY: 35
      },
      photo: photo(900, 1600),
      slot: wideSlot,
      templateSlug: "poster"
    });

    expect(placement.focusX).toBe(62);
    expect(placement.focusY).toBe(35);
  });

  it("uses blur fill instead of aggressive crop when detected faces are near an edge", () => {
    const placement = calculateSmartPhotoPlacement({
      faceFocus: {
        faceCount: 1,
        focusX: 86,
        focusY: 36
      },
      photo: photo(900, 1600),
      slot: wideSlot,
      templateSlug: "poster"
    });

    expect(placement.fitMode).toBe("contain_blur");
    expect(placement.blurBackground).toBe(true);
  });

  it("falls back safely when a slot disallows blur fill and smart crop", () => {
    const lockedSlot: TemplateSlotSeed = {
      ...portraitSlot,
      allowBlurFill: false,
      allowSmartCrop: false
    };

    const placement = calculateSmartPhotoPlacement({
      photo: photo(4000, 700),
      slot: lockedSlot,
      templateSlug: "poster"
    });

    expect(placement.fitMode).toBe("cover");
    expect(placement.blurBackground).toBe(false);
  });

  it("repairs old unsafe polaroid rotations saved by the earlier ratio-only rule", () => {
    expect(
      shouldRepairUnsafePolaroidRotation({
        photo: photo(1600, 900),
        placement: {
          blurBackground: false,
          fitMode: "cover",
          focusX: 50,
          focusY: 50,
          offsetX: 0,
          offsetY: 0,
          rotation: 90,
          zoom: 1.009
        },
        slot: portraitSlot,
        templateSlug: "a4-9-polaroid-cut-sheet"
      })
    ).toBe(true);
  });
});
