import { describe, expect, it } from "vitest";
import { getTemplateEditorLayout } from "@/data/template-layouts";

const cutSheetCases = [
  {
    slug: "a4-9-polaroid-cut-sheet",
    expectedCount: 9,
    columns: 3,
    rows: 3
  },
  {
    slug: "a4-8-landscape-cut-sheet",
    expectedCount: 8,
    columns: 2,
    rows: 4
  }
];

describe("cut-sheet slot geometry", () => {
  cutSheetCases.forEach(({ slug, expectedCount, columns, rows }) => {
    it(`${slug} uses exact equal cells inside the sheet`, () => {
      const slots = getTemplateEditorLayout(slug).slots;
      const expectedWidth = 1 / columns;
      const expectedHeight = 1 / rows;

      expect(slots).toHaveLength(expectedCount);

      slots.forEach((slot) => {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.width).toBeGreaterThan(0);
        expect(slot.height).toBeGreaterThan(0);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1);
        expect(slot.y + slot.height).toBeLessThanOrEqual(1);
        expect(slot.width).toBeCloseTo(expectedWidth, 6);
        expect(slot.height).toBeCloseTo(expectedHeight, 6);
      });

      slots.forEach((slot, index) => {
        slots.slice(index + 1).forEach((otherSlot) => {
          const overlapsHorizontally =
            slot.x < otherSlot.x + otherSlot.width && otherSlot.x < slot.x + slot.width;
          const overlapsVertically =
            slot.y < otherSlot.y + otherSlot.height && otherSlot.y < slot.y + slot.height;

          expect(overlapsHorizontally && overlapsVertically).toBe(false);
        });
      });
    });
  });
});
