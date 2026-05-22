export type TextAlignment = "left" | "center" | "right";

export type EditableTextStyle = {
  fontFamily: string;
  fontStack: string;
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  align: TextAlignment;
};

export type HandwritingFontOption = {
  label: string;
  family: string;
  fontStack: string;
};

export type TextStyleProperty = "fontFamily" | "fontSize" | "color" | "bold" | "italic" | "align";

export const POLAROID_TEMPLATE_SLUG = "a4-9-polaroid-cut-sheet";

export const handwritingFontOptions: HandwritingFontOption[] = [
  fontOption("Dancing Script"),
  fontOption("Caveat"),
  fontOption("Pacifico"),
  fontOption("Great Vibes"),
  fontOption("Sacramento"),
  fontOption("Satisfy"),
  fontOption("Patrick Hand"),
  fontOption("Indie Flower"),
  fontOption("Shadows Into Light"),
  fontOption("Amatic SC"),
  fontOption("Kalam"),
  fontOption("Permanent Marker"),
  fontOption("Gloria Hallelujah"),
  fontOption("Homemade Apple"),
  fontOption("Just Another Hand"),
  fontOption("Reenie Beanie"),
  fontOption("Covered By Your Grace"),
  fontOption("Rock Salt"),
  fontOption("Nothing You Could Do"),
  fontOption("Short Stack"),
  fontOption("Architects Daughter"),
  fontOption("Coming Soon"),
  fontOption("Gochi Hand"),
  fontOption("Handlee"),
  fontOption("Mali"),
  fontOption("Schoolbell"),
  fontOption("Neucha"),
  fontOption("Pangolin"),
  fontOption("Swanky and Moo Moo"),
  fontOption("Sue Ellen Francisco"),
  fontOption("Waiting for the Sunrise"),
  fontOption("Nanum Pen Script"),
  fontOption("Gaegu"),
  fontOption("Hi Melody"),
  fontOption("Yeon Sung"),
  fontOption("Gamja Flower"),
  fontOption("Single Day"),
  fontOption("Zeyada"),
  fontOption("La Belle Aurore"),
  fontOption("Parisienne"),
  fontOption("Allura"),
  fontOption("Alex Brush"),
  fontOption("Tangerine"),
  fontOption("Qwigley"),
  fontOption("Herr Von Muellerhoff"),
  fontOption("Mrs Saint Delafield"),
  fontOption("Dawning of a New Day"),
  fontOption("Cedarville Cursive"),
  fontOption("Mr De Haviland"),
  fontOption("The Girl Next Door")
];

export const textColorOptions = ["#2d2926", "#161616", "#d87355", "#8a5a44", "#b24b5a", "#ffffff"];

export const handwritingFontStylesheetHref = `https://fonts.googleapis.com/css2?${handwritingFontOptions
  .map((font) => `family=${encodeURIComponent(font.family).replaceAll("%20", "+")}`)
  .join("&")}&display=swap`;

export function getPolaroidCaptionTextKey(slotId: string) {
  return `caption:${slotId}`;
}

export function getPolaroidCaptionStyleScope(slotId: string) {
  return `caption:${slotId}`;
}

export function getTextStyleValueKey(scope: string, property: TextStyleProperty) {
  return `__textStyle:${scope}:${property}`;
}

export function getEditableTextStyle({
  defaultFontSize = 18,
  scope,
  textValues
}: {
  defaultFontSize?: number;
  scope: string;
  textValues: Record<string, string>;
}): EditableTextStyle {
  const fontFamily = getValidFontFamily(
    textValues[getTextStyleValueKey(scope, "fontFamily")] ?? handwritingFontOptions[0].family
  );
  const font = getHandwritingFontOption(fontFamily);
  const fontSize = clampNumber(
    Number(textValues[getTextStyleValueKey(scope, "fontSize")]),
    8,
    96,
    defaultFontSize
  );
  const color = getValidColor(textValues[getTextStyleValueKey(scope, "color")]);
  const align = getValidAlignment(textValues[getTextStyleValueKey(scope, "align")]);

  return {
    fontFamily: font.family,
    fontStack: font.fontStack,
    fontSize,
    color,
    isBold: textValues[getTextStyleValueKey(scope, "bold")] === "1",
    isItalic: textValues[getTextStyleValueKey(scope, "italic")] === "1",
    align
  };
}

export function getHandwritingFontOption(fontFamily: string) {
  return (
    handwritingFontOptions.find((font) => font.family === fontFamily) ?? handwritingFontOptions[0]
  );
}

function fontOption(family: string): HandwritingFontOption {
  return {
    label: family,
    family,
    fontStack: `"${family}", "Brush Script MT", "Segoe Script", cursive`
  };
}

function getValidFontFamily(value: string) {
  return handwritingFontOptions.some((font) => font.family === value)
    ? value
    : handwritingFontOptions[0].family;
}

function getValidColor(value: string | undefined) {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }

  return textColorOptions[0];
}

function getValidAlignment(value: string | undefined): TextAlignment {
  if (value === "left" || value === "right") {
    return value;
  }

  return "center";
}

function clampNumber(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
