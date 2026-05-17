import { describe, expect, it } from "vitest";
import { mergeUniqueFiles, removeFileAtIndex } from "@/components/start-upload-flow";

function makePhoto(name: string, lastModified: number) {
  return new File(["photo"], name, {
    lastModified,
    type: "image/jpeg"
  });
}

describe("start upload flow helpers", () => {
  it("keeps the first batch when more photos are added later", () => {
    const firstBatch = [makePhoto("one.jpg", 1), makePhoto("two.jpg", 2)];
    const secondBatch = [makePhoto("three.jpg", 3), makePhoto("four.jpg", 4)];

    expect(mergeUniqueFiles(firstBatch, secondBatch).map((file) => file.name)).toEqual([
      "one.jpg",
      "two.jpg",
      "three.jpg",
      "four.jpg"
    ]);
  });

  it("does not duplicate the same selected file twice", () => {
    const firstBatch = [makePhoto("one.jpg", 1)];
    const repeatedSelection = [makePhoto("one.jpg", 1), makePhoto("two.jpg", 2)];

    expect(mergeUniqueFiles(firstBatch, repeatedSelection).map((file) => file.name)).toEqual([
      "one.jpg",
      "two.jpg"
    ]);
  });

  it("removes only the chosen unwanted photo", () => {
    const files = [makePhoto("one.jpg", 1), makePhoto("two.jpg", 2), makePhoto("three.jpg", 3)];

    expect(removeFileAtIndex(files, 1).map((file) => file.name)).toEqual(["one.jpg", "three.jpg"]);
  });
});
