import { createRequire } from "node:module";
import sharp from "sharp";

export type DetectedTemplateFrame = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect";
  role: "hero" | "supporting";
  zIndex: number;
  confidence: number;
};

export type TemplateShapeDetection = {
  canvas: {
    width: number;
    height: number;
  };
  frames: DetectedTemplateFrame[];
};

type ImageDataLike = {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
};

type PixelSample = {
  r: number;
  g: number;
  b: number;
  saturation: number;
  luminance: number;
};

type GridComponent = {
  cells: number;
  minColumn: number;
  maxColumn: number;
  minRow: number;
  maxRow: number;
};

const maxAnalysisSide = 1200;
const require = createRequire(import.meta.url);

export async function detectTemplateShapesFromImage(
  buffer: Buffer
): Promise<TemplateShapeDetection> {
  const { data, info } = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: maxAnalysisSide,
      height: maxAnalysisSide,
      fit: "inside",
      withoutEnlargement: true
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const imageData: ImageDataLike = {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels
  };
  const textureFrames = detectRectangularPhotoRegions(imageData);
  const openCvFrames = await detectRectangularPhotoRegionsWithOpenCv(imageData);

  return {
    canvas: {
      width: info.width,
      height: info.height
    },
    frames: shouldUseOpenCvFrames(textureFrames, openCvFrames) ? openCvFrames : textureFrames
  };
}

export function detectTemplateShapesFromSvg(source: string | Buffer): TemplateShapeDetection {
  const svg = Buffer.isBuffer(source) ? source.toString("utf8") : source;
  const canvas = parseSvgCanvas(svg);
  const classStyles = parseSvgClassStyles(svg);
  const rects = parseSvgRects(svg, classStyles);
  const photoRects = selectPhotoSlotRects(rects, canvas);
  const largestRect = photoRects.reduce<SvgRectCandidate | null>(
    (largest, rect) => (!largest || rect.area > largest.area ? rect : largest),
    null
  );

  return {
    canvas,
    frames: photoRects
      .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
      .map((rect, index) => ({
        id: `photo_${String(index + 1).padStart(2, "0")}`,
        x: roundSvgValue(rect.x),
        y: roundSvgValue(rect.y),
        width: roundSvgValue(rect.width),
        height: roundSvgValue(rect.height),
        shape: "rect",
        role: rect === largestRect ? "hero" : "supporting",
        zIndex: index + 1,
        confidence: 99
      }))
  };
}

function detectRectangularPhotoRegions(imageData: ImageDataLike): DetectedTemplateFrame[] {
  const { width, height } = imageData;
  const { grid, columns, rows, cellSize } = createPhotoCandidateGrid(imageData);
  const components = findComponents(grid, columns, rows);
  const imageArea = width * height;
  const minDimension = Math.max(32, Math.min(width, height) * 0.055);
  const minArea = imageArea * 0.018;
  const maxArea = imageArea * 0.45;
  const rawFrames = components
    .map((component) => componentToFrame(component, grid, columns, cellSize, width, height))
    .filter((frame) => frame.width >= minDimension && frame.height >= minDimension)
    .filter((frame) => frame.area >= minArea && frame.area <= maxArea)
    .filter((frame) => frame.aspect >= 0.18 && frame.aspect <= 5.2)
    .filter((frame) => frame.density >= 0.5)
    .filter((frame) => !isLikelyCaptionBlock(frame, width, height))
    .filter((frame) => !touchesMostOfTheOuterCanvas(frame, width, height));
  const uniqueFrames = sortFramesByReadingOrder(removeDuplicateFrames(rawFrames)).slice(0, 80);
  const largestFrame = uniqueFrames.reduce<RawDetectedFrame | null>(
    (largest, frame) => (!largest || frame.area > largest.area ? frame : largest),
    null
  );

  return uniqueFrames.map((frame, index) => ({
    id: `photo_${String(index + 1).padStart(2, "0")}`,
    x: Math.round(frame.x),
    y: Math.round(frame.y),
    width: Math.round(frame.width),
    height: Math.round(frame.height),
    shape: "rect",
    role: frame === largestFrame ? "hero" : "supporting",
    zIndex: index + 1,
    confidence: Math.round(clamp(frame.density * 100, 18, 98))
  }));
}

async function detectRectangularPhotoRegionsWithOpenCv(
  imageData: ImageDataLike
): Promise<DetectedTemplateFrame[]> {
  try {
    const rawFrames = await findOpenCvPhotoRectangles(imageData);

    return toDetectedFrames(rawFrames, 96);
  } catch (error) {
    console.warn("OpenCV template shape detection failed; using texture detector.", error);
    return [];
  }
}

async function findOpenCvPhotoRectangles(imageData: ImageDataLike): Promise<RawDetectedFrame[]> {
  const { cv } = await getOpenCvRuntime();
  const { width, height } = imageData;
  const imageArea = width * height;
  const minDimension = Math.max(18, Math.min(width, height) * 0.038);
  const minArea = imageArea * 0.0035;
  const maxArea = imageArea * 0.62;
  const mask = cv.matFromArray(
    height,
    width,
    cv.CV_8UC1,
    Array.from(createOpenCvPhotoMask(imageData))
  );
  const closeKernel = cv.Mat.ones(2, 2, cv.CV_8U);
  const openKernel = cv.Mat.ones(2, 2, cv.CV_8U);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  try {
    cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, closeKernel);
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, openKernel);
    cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const rawFrames: RawDetectedFrame[] = [];

    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const rect = cv.boundingRect(contour);
      const contourArea = cv.contourArea(contour);
      const area = rect.width * rect.height;
      const density = contourArea / Math.max(1, area);
      const aspect = rect.width / Math.max(1, rect.height);

      contour.delete();

      if (
        rect.width < minDimension ||
        rect.height < minDimension ||
        area < minArea ||
        area > maxArea ||
        density < 0.38 ||
        aspect < 0.22 ||
        aspect > 5.8 ||
        touchesMostOfTheOuterCanvas({ ...rect, area, aspect, density }, width, height) ||
        isLikelyCaptionBlock({ ...rect, area, aspect, density }, width, height)
      ) {
        continue;
      }

      rawFrames.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        area,
        aspect,
        density
      });
    }

    return sortFramesByReadingOrder(removeDuplicateFrames(rawFrames)).slice(0, 120);
  } finally {
    mask.delete();
    closeKernel.delete();
    openKernel.delete();
    contours.delete();
    hierarchy.delete();
  }
}

function createOpenCvPhotoMask(imageData: ImageDataLike) {
  const { data, width, height, channels } = imageData;
  const background = estimateBackgroundColor(imageData);
  const mask = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dataIndex = (y * width + x) * channels;
      const r = data[dataIndex];
      const g = data[dataIndex + 1];
      const b = data[dataIndex + 2];
      const alpha = channels > 3 ? data[dataIndex + 3] : 255;
      const saturation = getSaturation(r, g, b);
      const luminance = getLuminance(r, g, b);
      const distanceFromPaper = colorDistance(r, g, b, background);
      const isWhiteGutter =
        luminance > 220 && saturation < 55 && (luminance > 228 || distanceFromPaper < 85);

      mask[y * width + x] = !isWhiteGutter && alpha > 32 ? 255 : 0;
    }
  }

  return mask;
}

function toDetectedFrames(rawFrames: RawDetectedFrame[], confidence: number) {
  const orderedFrames = sortFramesByReadingOrder(rawFrames).slice(0, 120);
  const largestFrame = orderedFrames.reduce<RawDetectedFrame | null>(
    (largest, frame) => (!largest || frame.area > largest.area ? frame : largest),
    null
  );

  return orderedFrames.map((frame, index) => ({
    id: `photo_${String(index + 1).padStart(2, "0")}`,
    x: Math.round(frame.x),
    y: Math.round(frame.y),
    width: Math.round(frame.width),
    height: Math.round(frame.height),
    shape: "rect" as const,
    role: frame === largestFrame ? ("hero" as const) : ("supporting" as const),
    zIndex: index + 1,
    confidence
  }));
}

function shouldUseOpenCvFrames(
  textureFrames: DetectedTemplateFrame[],
  openCvFrames: DetectedTemplateFrame[]
) {
  if (openCvFrames.length < 4) {
    return false;
  }

  if (textureFrames.length < 4 || openCvFrames.length >= textureFrames.length + 2) {
    return true;
  }

  return openCvFrames.length >= 8;
}

type SvgStyle = {
  fill?: string;
  stroke?: string;
};

type SvgRectCandidate = {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  className: string;
  fill?: string;
  stroke?: string;
};

function parseSvgCanvas(svg: string) {
  const svgTag = svg.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const viewBox = getSvgAttribute(svgTag, "viewBox");

  if (viewBox) {
    const numbers = viewBox
      .trim()
      .split(/[\s,]+/)
      .map((value) => Number.parseFloat(value))
      .filter(Number.isFinite);

    if (numbers.length >= 4 && numbers[2] > 0 && numbers[3] > 0) {
      return {
        width: roundSvgValue(numbers[2]),
        height: roundSvgValue(numbers[3])
      };
    }
  }

  const width = parseSvgNumber(getSvgAttribute(svgTag, "width"), 1080);
  const height = parseSvgNumber(getSvgAttribute(svgTag, "height"), 1350);

  return {
    width: roundSvgValue(width),
    height: roundSvgValue(height)
  };
}

function parseSvgClassStyles(svg: string) {
  const classStyles = new Map<string, SvgStyle>();
  const styleBlockRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let styleBlockMatch: RegExpExecArray | null;

  while ((styleBlockMatch = styleBlockRegex.exec(svg))) {
    const ruleRegex = /([^{}]+)\{([^}]*)\}/g;
    let ruleMatch: RegExpExecArray | null;

    while ((ruleMatch = ruleRegex.exec(styleBlockMatch[1]))) {
      const style = parseStyleDeclarations(ruleMatch[2]);
      const selectors = ruleMatch[1].split(",");

      for (const selector of selectors) {
        const className = selector.trim().match(/^\.([a-zA-Z0-9_-]+)$/)?.[1];

        if (!className) {
          continue;
        }

        classStyles.set(className, {
          ...classStyles.get(className),
          ...style
        });
      }
    }
  }

  return classStyles;
}

function parseSvgRects(svg: string, classStyles: Map<string, SvgStyle>) {
  const rects: SvgRectCandidate[] = [];
  const rectRegex = /<rect\b[^>]*\/?>/gi;
  let rectMatch: RegExpExecArray | null;

  while ((rectMatch = rectRegex.exec(svg))) {
    const tag = rectMatch[0];
    const className = getSvgAttribute(tag, "class") ?? "";
    const mergedClassStyle = className
      .split(/\s+/)
      .filter(Boolean)
      .reduce<SvgStyle>(
        (style, name) => ({
          ...style,
          ...classStyles.get(name)
        }),
        {}
      );
    const inlineStyle = parseStyleDeclarations(getSvgAttribute(tag, "style") ?? "");
    const transform = parseTranslateTransform(getSvgAttribute(tag, "transform") ?? "");
    const x = parseSvgNumber(getSvgAttribute(tag, "x"), 0) + transform.x;
    const y = parseSvgNumber(getSvgAttribute(tag, "y"), 0) + transform.y;
    const width = parseSvgNumber(getSvgAttribute(tag, "width"), 0);
    const height = parseSvgNumber(getSvgAttribute(tag, "height"), 0);

    if (width <= 0 || height <= 0) {
      continue;
    }

    const fill = getSvgAttribute(tag, "fill") ?? inlineStyle.fill ?? mergedClassStyle.fill;
    const stroke = getSvgAttribute(tag, "stroke") ?? inlineStyle.stroke ?? mergedClassStyle.stroke;

    rects.push({
      x,
      y,
      width,
      height,
      area: width * height,
      className,
      fill,
      stroke
    });
  }

  return rects;
}

function selectPhotoSlotRects(
  rects: SvgRectCandidate[],
  canvas: { width: number; height: number }
) {
  const canvasArea = canvas.width * canvas.height;
  const minArea = canvasArea * 0.006;
  const maxArea = canvasArea * 0.55;
  const candidates = rects
    .filter((rect) => rect.area >= minArea && rect.area <= maxArea)
    .filter((rect) => !isGuideRect(rect, canvasArea));
  const darkStrokeRects = candidates.filter(hasDarkStroke);
  const slotRects = darkStrokeRects.length
    ? darkStrokeRects
    : candidates.filter((rect) => hasSlotLikeStyling(rect));

  return removeDuplicateSvgRects(slotRects);
}

function isGuideRect(rect: SvgRectCandidate, canvasArea: number) {
  return rect.area > canvasArea * 0.55 || hasGuideStroke(rect);
}

function hasSlotLikeStyling(rect: SvgRectCandidate) {
  return hasDarkStroke(rect) || (isNoFill(rect.fill) && !hasGuideStroke(rect));
}

function hasDarkStroke(rect: SvgRectCandidate) {
  const color = parseCssColor(rect.stroke);

  return Boolean(color && color.r <= 70 && color.g <= 70 && color.b <= 70);
}

function hasGuideStroke(rect: SvgRectCandidate) {
  const color = parseCssColor(rect.stroke);

  return Boolean(color && color.r >= 170 && color.g <= 100 && color.b <= 140);
}

function removeDuplicateSvgRects(rects: SvgRectCandidate[]) {
  return [...rects]
    .sort((a, b) => b.area - a.area)
    .reduce<SvgRectCandidate[]>((uniqueRects, rect) => {
      const duplicate = uniqueRects.some((existingRect) => {
        const overlap = overlapRatio(
          { ...existingRect, aspect: 1, density: 1 },
          { ...rect, aspect: 1, density: 1 }
        );

        return overlap > 0.88;
      });

      return duplicate ? uniqueRects : [...uniqueRects, rect];
    }, []);
}

function getSvgAttribute(tag: string, name: string) {
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*["']([^"']+)["']`, "i");

  return tag.match(pattern)?.[1];
}

function parseStyleDeclarations(value: string): SvgStyle {
  return value
    .split(";")
    .map((declaration) => declaration.split(":"))
    .reduce<SvgStyle>((style, [property, rawValue]) => {
      const key = property?.trim().toLowerCase();
      const declarationValue = rawValue?.trim();

      if (key === "fill" || key === "stroke") {
        return {
          ...style,
          [key]: declarationValue
        };
      }

      return style;
    }, {});
}

function parseTranslateTransform(value: string) {
  const match = value.match(/translate\(\s*([+-]?\d*\.?\d+)(?:[\s,]+([+-]?\d*\.?\d+))?\s*\)/i);

  if (!match) {
    return { x: 0, y: 0 };
  }

  return {
    x: Number.parseFloat(match[1]) || 0,
    y: Number.parseFloat(match[2] ?? "0") || 0
  };
}

function parseSvgNumber(value: string | undefined, fallback: number) {
  const number = Number.parseFloat(String(value ?? "").replace("px", ""));

  return Number.isFinite(number) ? number : fallback;
}

function parseCssColor(value: string | undefined) {
  const color = value?.trim().toLowerCase();

  if (!color || color === "none" || color === "transparent") {
    return null;
  }

  if (color === "black") {
    return { r: 0, g: 0, b: 0 };
  }

  if (color === "red") {
    return { r: 255, g: 0, b: 0 };
  }

  const shortHex = color.match(/^#([0-9a-f]{3})$/i);

  if (shortHex) {
    const [, hex] = shortHex;

    return {
      r: Number.parseInt(hex[0] + hex[0], 16),
      g: Number.parseInt(hex[1] + hex[1], 16),
      b: Number.parseInt(hex[2] + hex[2], 16)
    };
  }

  const hex = color.match(/^#([0-9a-f]{6})$/i);

  if (hex) {
    return {
      r: Number.parseInt(hex[1].slice(0, 2), 16),
      g: Number.parseInt(hex[1].slice(2, 4), 16),
      b: Number.parseInt(hex[1].slice(4, 6), 16)
    };
  }

  const rgb = color.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);

  if (rgb) {
    return {
      r: Number.parseInt(rgb[1], 10),
      g: Number.parseInt(rgb[2], 10),
      b: Number.parseInt(rgb[3], 10)
    };
  }

  return null;
}

function isNoFill(value: string | undefined) {
  const fill = value?.trim().toLowerCase();

  return !fill || fill === "none" || fill === "transparent";
}

function roundSvgValue(value: number) {
  return Math.round(value * 1000) / 1000;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type RawDetectedFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  aspect: number;
  density: number;
};

type OpenCvRuntimeHolder = {
  cv: ReadyOpenCvRuntime;
};

type OpenCvMat = {
  delete: () => void;
};

type OpenCvContour = OpenCvMat;

type OpenCvMatVector = {
  delete: () => void;
  get: (index: number) => OpenCvContour;
  size: () => number;
};

type OpenCvRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OpenCvMatConstructor = {
  new (): OpenCvMat;
  ones: (rows: number, cols: number, type: number) => OpenCvMat;
};

type ReadyOpenCvRuntime = {
  CHAIN_APPROX_SIMPLE: number;
  CV_8U: number;
  CV_8UC1: number;
  MORPH_CLOSE: number;
  MORPH_OPEN: number;
  RETR_EXTERNAL: number;
  Mat: OpenCvMatConstructor;
  MatVector: new () => OpenCvMatVector;
  boundingRect: (contour: OpenCvContour) => OpenCvRect;
  contourArea: (contour: OpenCvContour) => number;
  findContours: (
    image: OpenCvMat,
    contours: OpenCvMatVector,
    hierarchy: OpenCvMat,
    mode: number,
    method: number
  ) => void;
  matFromArray: (rows: number, cols: number, type: number, array: number[]) => OpenCvMat;
  morphologyEx: (src: OpenCvMat, dst: OpenCvMat, op: number, kernel: OpenCvMat) => void;
};

type LoadingOpenCvRuntime = Partial<ReadyOpenCvRuntime> & {
  onRuntimeInitialized?: () => void;
};

let openCvRuntimePromise: Promise<OpenCvRuntimeHolder> | null = null;

async function getOpenCvRuntime(): Promise<OpenCvRuntimeHolder> {
  if (!openCvRuntimePromise) {
    openCvRuntimePromise = resolveOpenCvRuntime(require("@techstark/opencv-js") as unknown);
  }

  return openCvRuntimePromise;
}

async function resolveOpenCvRuntime(runtime: unknown): Promise<OpenCvRuntimeHolder> {
  if (runtime instanceof Promise) {
    return { cv: (await runtime) as ReadyOpenCvRuntime };
  }

  const candidate = runtime as LoadingOpenCvRuntime;

  if (isReadyOpenCvRuntime(candidate)) {
    return { cv: candidate };
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    const settle = () => {
      if (settled) {
        return;
      }

      settled = true;
      clearInterval(interval);
      resolve();
    };
    const interval = setInterval(() => {
      if (isReadyOpenCvRuntime(candidate)) {
        settle();
      }
    }, 10);

    candidate.onRuntimeInitialized = settle;

    if (isReadyOpenCvRuntime(candidate)) {
      settle();
    }
  });

  return { cv: candidate as ReadyOpenCvRuntime };
}

function isReadyOpenCvRuntime(runtime: LoadingOpenCvRuntime): runtime is ReadyOpenCvRuntime {
  return Boolean(runtime.Mat && runtime.MatVector && runtime.matFromArray);
}

function createPhotoCandidateGrid(imageData: ImageDataLike) {
  const { data, width, height, channels } = imageData;
  const cellSize = clamp(Math.round(Math.max(width, height) / 240), 3, 8);
  const columns = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const background = estimateBackgroundColor(imageData);
  const grid = new Uint8Array(columns * rows);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const xStart = column * cellSize;
      const yStart = row * cellSize;
      const xEnd = Math.min(width, xStart + cellSize);
      const yEnd = Math.min(height, yStart + cellSize);
      let count = 0;
      let distanceSum = 0;
      let saturationSum = 0;
      let luminanceSum = 0;
      let luminanceSquaredSum = 0;

      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          const index = (y * width + x) * channels;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const saturation = getSaturation(r, g, b);
          const luminance = getLuminance(r, g, b);

          distanceSum += colorDistance(r, g, b, background);
          saturationSum += saturation;
          luminanceSum += luminance;
          luminanceSquaredSum += luminance * luminance;
          count += 1;
        }
      }

      const avgDistance = distanceSum / count;
      const avgSaturation = saturationSum / count;
      const avgLuminance = luminanceSum / count;
      const variance = luminanceSquaredSum / count - avgLuminance * avgLuminance;
      const texture = Math.sqrt(Math.max(0, variance));
      const isPlainLightGap = avgLuminance > 208 && avgSaturation < 28 && texture < 20;
      const isUniformDarkFrame = avgLuminance < 52 && avgSaturation < 20 && texture < 14;
      const hasPhotoTexture = texture > 7 || avgSaturation > 22;
      const differsFromPaper = avgDistance > 28 || avgSaturation > 18 || texture > 10;

      if (hasPhotoTexture && differsFromPaper && !isPlainLightGap && !isUniformDarkFrame) {
        grid[row * columns + column] = 1;
      }
    }
  }

  return {
    grid: closeSmallGaps(grid, columns, rows),
    columns,
    rows,
    cellSize
  };
}

function closeSmallGaps(grid: Uint8Array, columns: number, rows: number) {
  const next = new Uint8Array(grid);

  for (let row = 1; row < rows - 1; row += 1) {
    for (let column = 1; column < columns - 1; column += 1) {
      const index = row * columns + column;

      if (grid[index]) {
        continue;
      }

      const horizontal = grid[index - 1] && grid[index + 1];
      const vertical = grid[index - columns] && grid[index + columns];

      if (horizontal || vertical) {
        next[index] = 1;
      }
    }
  }

  return next;
}

function findComponents(grid: Uint8Array, columns: number, rows: number) {
  const visited = new Uint8Array(grid.length);
  const components: GridComponent[] = [];

  for (let start = 0; start < grid.length; start += 1) {
    if (!grid[start] || visited[start]) {
      continue;
    }

    const queue = [start];
    let pointer = 0;
    let minColumn = columns;
    let maxColumn = 0;
    let minRow = rows;
    let maxRow = 0;
    let cells = 0;

    visited[start] = 1;

    while (pointer < queue.length) {
      const index = queue[pointer];
      pointer += 1;
      cells += 1;

      const row = Math.floor(index / columns);
      const column = index % columns;
      minColumn = Math.min(minColumn, column);
      maxColumn = Math.max(maxColumn, column);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);

      for (const nextIndex of [index - 1, index + 1, index - columns, index + columns]) {
        if (nextIndex < 0 || nextIndex >= grid.length) {
          continue;
        }

        const nextRow = Math.floor(nextIndex / columns);
        const nextColumn = nextIndex % columns;
        const isWrappedNeighbor = Math.abs(nextColumn - column) > 1 || Math.abs(nextRow - row) > 1;

        if (isWrappedNeighbor || !grid[nextIndex] || visited[nextIndex]) {
          continue;
        }

        visited[nextIndex] = 1;
        queue.push(nextIndex);
      }
    }

    components.push({
      cells,
      minColumn,
      maxColumn,
      minRow,
      maxRow
    });
  }

  return components;
}

function componentToFrame(
  component: GridComponent,
  grid: Uint8Array,
  columns: number,
  cellSize: number,
  imageWidth: number,
  imageHeight: number
): RawDetectedFrame {
  const x = component.minColumn * cellSize;
  const y = component.minRow * cellSize;
  const right = Math.min(imageWidth, (component.maxColumn + 1) * cellSize);
  const bottom = Math.min(imageHeight, (component.maxRow + 1) * cellSize);
  const width = right - x;
  const height = bottom - y;
  const totalCells =
    (component.maxColumn - component.minColumn + 1) * (component.maxRow - component.minRow + 1);
  const density = countComponentCells(grid, columns, component) / Math.max(1, totalCells);

  return {
    x,
    y,
    width,
    height,
    area: width * height,
    aspect: width / Math.max(height, 1),
    density
  };
}

function countComponentCells(grid: Uint8Array, columns: number, component: GridComponent) {
  let cells = 0;

  for (let row = component.minRow; row <= component.maxRow; row += 1) {
    for (let column = component.minColumn; column <= component.maxColumn; column += 1) {
      cells += grid[row * columns + column] ? 1 : 0;
    }
  }

  return cells;
}

function estimateBackgroundColor(imageData: ImageDataLike) {
  const { width, height } = imageData;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 70));
  const samples: PixelSample[] = [];

  for (let x = 0; x < width; x += step) {
    samples.push(pixelAt(imageData, x, 0));
    samples.push(pixelAt(imageData, x, height - 1));
  }

  for (let y = 0; y < height; y += step) {
    samples.push(pixelAt(imageData, 0, y));
    samples.push(pixelAt(imageData, width - 1, y));
  }

  samples.sort((a, b) => b.luminance - a.luminance);
  const source = samples.slice(0, Math.max(1, Math.floor(samples.length * 0.28)));

  return {
    r: average(source, "r"),
    g: average(source, "g"),
    b: average(source, "b")
  };
}

function pixelAt(imageData: ImageDataLike, x: number, y: number): PixelSample {
  const { data, width, channels } = imageData;
  const index = (y * width + x) * channels;
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];

  return {
    r,
    g,
    b,
    saturation: getSaturation(r, g, b),
    luminance: getLuminance(r, g, b)
  };
}

function removeDuplicateFrames(frames: RawDetectedFrame[]) {
  return [...frames]
    .sort((a, b) => b.area - a.area)
    .reduce<RawDetectedFrame[]>((uniqueFrames, frame) => {
      const duplicate = uniqueFrames.some(
        (existingFrame) => overlapRatio(existingFrame, frame) > 0.68
      );

      return duplicate ? uniqueFrames : [...uniqueFrames, frame];
    }, []);
}

function sortFramesByReadingOrder(frames: RawDetectedFrame[]) {
  const medianHeight = getMedian(frames.map((frame) => frame.height));
  const rowTolerance = Math.max(3, medianHeight * 0.38);

  return [...frames].sort((a, b) => {
    if (Math.abs(a.y - b.y) <= rowTolerance) {
      return a.x - b.x;
    }

    return a.y - b.y;
  });
}

function overlapRatio(a: RawDetectedFrame, b: RawDetectedFrame) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (right <= left || bottom <= top) {
    return 0;
  }

  const overlap = (right - left) * (bottom - top);

  return overlap / Math.min(a.area, b.area);
}

function isLikelyCaptionBlock(frame: RawDetectedFrame, imageWidth: number, imageHeight: number) {
  return (
    (frame.y > imageHeight * 0.82 &&
      frame.width > imageWidth * 0.28 &&
      frame.height < imageHeight * 0.18) ||
    (frame.y > imageHeight * 0.84 && frame.height < imageHeight * 0.16)
  );
}

function touchesMostOfTheOuterCanvas(
  frame: RawDetectedFrame,
  imageWidth: number,
  imageHeight: number
) {
  const touchesHorizontalEdges = frame.x <= 2 && frame.x + frame.width >= imageWidth - 2;
  const touchesVerticalEdges = frame.y <= 2 && frame.y + frame.height >= imageHeight - 2;

  return touchesHorizontalEdges || touchesVerticalEdges;
}

function colorDistance(
  r: number,
  g: number,
  b: number,
  color: { r: number; g: number; b: number }
) {
  const dr = r - color.r;
  const dg = g - color.g;
  const db = b - color.b;

  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getSaturation(r: number, g: number, b: number) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function getLuminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function average<T extends keyof PixelSample>(items: PixelSample[], key: T) {
  return items.reduce((sum, item) => sum + Number(item[key]), 0) / Math.max(1, items.length);
}

function getMedian(values: number[]) {
  if (!values.length) {
    return 0;
  }

  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2) {
    return sortedValues[middle];
  }

  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
