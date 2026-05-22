import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getExportPathForOrderFile,
  getPrintDimensions,
  isPathInsideDirectory,
  sanitizeExportOrderNumber
} from "@/lib/print-export";
import type { TemplateSeed } from "@/types/templates";

function template(size: TemplateSeed["sheetSize"], orientation: TemplateSeed["orientation"]) {
  return {
    sheetSize: size,
    orientation,
    dpi: 300
  } as TemplateSeed;
}

describe("print export geometry", () => {
  it("calculates A4 and A3 print dimensions at 300 DPI", () => {
    expect(getPrintDimensions(template("A4", "portrait"))).toMatchObject({
      widthMm: 210,
      heightMm: 297,
      widthPx: 2480,
      heightPx: 3508
    });
    expect(getPrintDimensions(template("A4", "landscape"))).toMatchObject({
      widthMm: 297,
      heightMm: 210,
      widthPx: 3508,
      heightPx: 2480
    });
    expect(getPrintDimensions(template("A3", "portrait"))).toMatchObject({
      widthMm: 297,
      heightMm: 420,
      widthPx: 3508,
      heightPx: 4961
    });
    expect(getPrintDimensions(template("A3", "landscape"))).toMatchObject({
      widthMm: 420,
      heightMm: 297,
      widthPx: 4961,
      heightPx: 3508
    });
  });

  it("calculates custom graduation product dimensions", () => {
    expect(
      getPrintDimensions({
        ...template("custom", "landscape"),
        widthMm: 200,
        heightMm: 40
      })
    ).toMatchObject({
      widthMm: 200,
      heightMm: 40,
      widthPx: 2362,
      heightPx: 472
    });
  });
});

describe("print export path safety", () => {
  it("sanitizes order numbers and creates stable output paths", () => {
    expect(sanitizeExportOrderNumber("../ORD 2026:*")).toBe("---ORD-2026--");
    expect(getExportPathForOrderFile("ORD-2026-ABC", "print")).toContain(
      path.join("ORD-2026-ABC", "print.pdf")
    );
  });

  it("rejects paths outside the export root", () => {
    const root = path.resolve("C:/printili/exports");

    expect(isPathInsideDirectory(root, path.resolve(root, "ORD-1", "print.pdf"))).toBe(true);
    expect(isPathInsideDirectory(root, path.resolve(root, "..", "secret.txt"))).toBe(false);
  });
});
