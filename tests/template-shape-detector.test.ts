import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  detectTemplateShapesFromImage,
  detectTemplateShapesFromSvg
} from "../lib/template-shape-detector";

describe("template shape detector", () => {
  it("detects rectangular photo regions and ignores text-like marks", async () => {
    const buffer = await sharp(
      Buffer.from(`
        <svg width="600" height="460" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="460" fill="#111111"/>
          <rect x="48" y="18" width="504" height="400" fill="#f8f7f1"/>
          <rect x="80" y="54" width="118" height="136" fill="#8b6249"/>
          <rect x="80" y="202" width="118" height="134" fill="#5f8d7a"/>
          <rect x="210" y="54" width="190" height="282" fill="#b7795c"/>
          <rect x="412" y="54" width="118" height="136" fill="#7a8eb0"/>
          <rect x="412" y="202" width="118" height="134" fill="#909a53"/>
          <text x="230" y="386" font-family="Georgia" font-size="34" fill="#222222">Happy Family</text>
        </svg>
      `)
    )
      .png()
      .toBuffer();
    const result = await detectTemplateShapesFromImage(buffer);

    expect(result.frames).toHaveLength(5);
    expect(result.frames.filter((frame) => frame.role === "hero")).toHaveLength(1);
    expect(result.frames.some((frame) => frame.y > 340)).toBe(false);
  });

  it("extracts exact photo rectangles from an SVG layout and ignores guide boxes", () => {
    const result = detectTemplateShapesFromSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28">
        <defs>
          <style>
            .st0 { stroke: #000; }
            .st0, .st1 { fill: none; stroke-miterlimit: 10; }
            .st1 { stroke: #ee1c4e; }
          </style>
        </defs>
        <rect class="st1" x="43.73" y="16.84" width="754.42" height="561.6"/>
        <rect class="st0" x="84.71" y="71.07" width="171.13" height="195.23"/>
        <rect class="st0" x="84.71" y="287.39" width="171.13" height="195.23"/>
        <rect class="st0" x="581.83" y="71.07" width="171.13" height="195.23"/>
        <rect class="st0" x="581.83" y="287.39" width="171.13" height="195.23"/>
        <rect class="st0" x="275.72" y="71.07" width="285.62" height="411.56"/>
      </svg>
    `);

    expect(result.canvas).toEqual({ width: 841.89, height: 595.28 });
    expect(result.frames).toHaveLength(5);
    expect(result.frames[1]).toMatchObject({
      x: 275.72,
      y: 71.07,
      width: 285.62,
      height: 411.56,
      role: "hero"
    });
    expect(result.frames.some((frame) => frame.width > 700)).toBe(false);
  });

  it("uses OpenCV contours for dense collage grids with many small photos", async () => {
    const smallRects = [
      [24, 16],
      [96, 16],
      [168, 16],
      [240, 16],
      [312, 16],
      [24, 88],
      [96, 88],
      [312, 88],
      [384, 88],
      [24, 160],
      [96, 160],
      [312, 160],
      [384, 160],
      [24, 304],
      [96, 304],
      [168, 304]
    ];
    const photoRects = [
      ...smallRects.map(
        ([x, y], index) =>
          `<rect x="${x}" y="${y}" width="64" height="64" fill="${
            index % 2 ? "#8ab1c9" : "#b66a54"
          }"/>`
      ),
      `<rect x="168" y="88" width="136" height="208" fill="#6ba7bd"/>`
    ].join("");
    const buffer = await sharp(
      Buffer.from(`
        <svg width="480" height="390" xmlns="http://www.w3.org/2000/svg">
          <rect width="480" height="390" fill="#fbfaf6"/>
          ${photoRects}
          <text x="48" y="365" font-family="Georgia" font-size="28" fill="#222222">Personal Message</text>
        </svg>
      `)
    )
      .png()
      .toBuffer();
    const result = await detectTemplateShapesFromImage(buffer);

    expect(result.frames.length).toBeGreaterThanOrEqual(16);
    expect(result.frames.filter((frame) => frame.role === "hero")).toHaveLength(1);
    const heroFrame = result.frames.find((frame) => frame.role === "hero");

    expect(heroFrame?.x).toBeCloseTo(168, -1);
    expect(heroFrame?.y).toBeCloseTo(88, -1);
    expect(heroFrame?.width).toBeCloseTo(136, -1);
    expect(heroFrame?.height).toBeCloseTo(208, -1);
    expect(result.frames.some((frame) => frame.y > 330)).toBe(false);
  });
});
