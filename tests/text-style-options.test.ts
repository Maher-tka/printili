import { describe, expect, it } from "vitest";
import {
  getEditableTextStyle,
  getPolaroidCaptionStyleScope,
  getPolaroidCaptionTextKey,
  getTextStyleValueKey,
  handwritingFontOptions
} from "../lib/text-style-options";

describe("text style options", () => {
  it("offers 50 handwriting font choices", () => {
    expect(handwritingFontOptions).toHaveLength(50);
    expect(handwritingFontOptions.map((font) => font.family)).toContain("Dancing Script");
    expect(handwritingFontOptions.map((font) => font.family)).toContain("Caveat");
    expect(handwritingFontOptions.map((font) => font.family)).toContain("Great Vibes");
  });

  it("normalizes editable text style values", () => {
    const scope = getPolaroidCaptionStyleScope("slot-1");
    const style = getEditableTextStyle({
      scope,
      textValues: {
        [getTextStyleValueKey(scope, "fontFamily")]: "Pacifico",
        [getTextStyleValueKey(scope, "fontSize")]: "24",
        [getTextStyleValueKey(scope, "color")]: "#d87355",
        [getTextStyleValueKey(scope, "bold")]: "1",
        [getTextStyleValueKey(scope, "italic")]: "1",
        [getTextStyleValueKey(scope, "align")]: "right"
      }
    });

    expect(style).toMatchObject({
      align: "right",
      color: "#d87355",
      fontFamily: "Pacifico",
      fontSize: 24,
      isBold: true,
      isItalic: true
    });
  });

  it("uses stable keys for polaroid caption text", () => {
    expect(getPolaroidCaptionTextKey("a4-9-polaroid-cut-sheet-slot-1")).toBe(
      "caption:a4-9-polaroid-cut-sheet-slot-1"
    );
  });
});
