import { type EnhancementParams } from "./imageProcessing";

interface ImageStats {
  meanLuminance: number;
  stdLuminance: number;
  meanR: number;
  meanG: number;
  meanB: number;
  meanSaturation: number;
  highlights: number; // % of pixels above 200 luminance
  shadows: number;    // % of pixels below 50 luminance
}

function analyzeCanvas(canvas: HTMLCanvasElement): ImageStats {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  // Sample at reduced resolution for speed
  const sampleScale = Math.min(1, 256 / Math.max(w, h));
  const sw = Math.round(w * sampleScale);
  const sh = Math.round(h * sampleScale);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = sw;
  tempCanvas.height = sh;
  const tCtx = tempCanvas.getContext("2d")!;
  tCtx.drawImage(canvas, 0, 0, sw, sh);

  const { data } = tCtx.getImageData(0, 0, sw, sh);
  const pixelCount = sw * sh;

  let sumLum = 0;
  let sumR = 0, sumG = 0, sumB = 0;
  let sumSat = 0;
  let highlightPixels = 0;
  let shadowPixels = 0;
  const luminances: number[] = new Array(pixelCount);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const idx = i / 4;
    luminances[idx] = lum;
    sumLum += lum;
    sumR += r;
    sumG += g;
    sumB += b;

    // Saturation via min/max
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    sumSat += sat;

    if (lum > 200) highlightPixels++;
    if (lum < 50) shadowPixels++;
  }

  const meanLum = sumLum / pixelCount;

  let sumSqDiff = 0;
  for (let i = 0; i < pixelCount; i++) {
    const diff = luminances[i] - meanLum;
    sumSqDiff += diff * diff;
  }

  return {
    meanLuminance: meanLum,
    stdLuminance: Math.sqrt(sumSqDiff / pixelCount),
    meanR: sumR / pixelCount,
    meanG: sumG / pixelCount,
    meanB: sumB / pixelCount,
    meanSaturation: sumSat / pixelCount,
    highlights: highlightPixels / pixelCount,
    shadows: shadowPixels / pixelCount,
  };
}

export interface AutoEnhanceResult {
  params: EnhancementParams;
  description: string;
}

export function localAutoEnhance(canvas: HTMLCanvasElement): AutoEnhanceResult {
  const stats = analyzeCanvas(canvas);
  const notes: string[] = [];

  let brightness = 0, contrast = 0, saturation = 0, temperature = 0;
  let highlights = 0, shadows = 0, sharpness = 0, clarity = 0, noise = 0;

  // Brightness correction
  if (stats.meanLuminance < 80) {
    const boost = Math.round(15 + (80 - stats.meanLuminance) * 0.3);
    brightness = Math.min(30, boost);
    shadows = Math.min(25, Math.round(boost * 0.6));
    notes.push("boosted brightness for dark image");
  } else if (stats.meanLuminance > 180) {
    brightness = -Math.min(20, Math.round((stats.meanLuminance - 180) * 0.4));
    highlights = -15;
    notes.push("reduced brightness for overexposed image");
  }

  // Contrast correction
  if (stats.stdLuminance < 40) {
    contrast = Math.round(20 + (40 - stats.stdLuminance) * 0.5);
    contrast = Math.min(35, contrast);
    clarity = Math.min(30, Math.round(contrast * 0.7));
    notes.push("enhanced contrast for flat image");
  } else if (stats.stdLuminance > 80) {
    contrast = -Math.min(15, Math.round((stats.stdLuminance - 80) * 0.3));
    notes.push("softened harsh contrast");
  }

  // Saturation correction
  if (stats.meanSaturation < 0.25) {
    saturation = Math.round(15 + (0.25 - stats.meanSaturation) * 40);
    saturation = Math.min(25, saturation);
    notes.push("boosted saturation");
  } else if (stats.meanSaturation > 0.7) {
    saturation = -Math.min(15, Math.round((stats.meanSaturation - 0.7) * 30));
    notes.push("reduced oversaturation");
  }

  // Color cast / temperature
  const rbDiff = stats.meanR - stats.meanB;
  if (Math.abs(rbDiff) > 15) {
    temperature = -Math.round(rbDiff * 0.4);
    temperature = Math.max(-20, Math.min(20, temperature));
    notes.push(rbDiff > 0 ? "corrected warm cast" : "corrected cool cast");
  }

  // Sharpness — low std can indicate soft image
  if (stats.stdLuminance < 55) {
    sharpness = Math.min(25, Math.round((55 - stats.stdLuminance) * 0.5));
  }

  // Noise — high shadow percentage often means noisy shadows
  if (stats.shadows > 0.3) {
    noise = Math.min(20, Math.round(stats.shadows * 30));
    notes.push("applied noise reduction");
  }

  const description = notes.length > 0
    ? "Auto-enhanced: " + notes.join(", ") + "."
    : "Image looks well-balanced. Minor refinements applied.";

  // If nothing needed, apply gentle enhancement
  if (notes.length === 0) {
    contrast = 5;
    clarity = 10;
    sharpness = 10;
    saturation = 5;
  }

  return {
    params: { brightness, contrast, saturation, temperature, highlights, shadows, sharpness, clarity, noise },
    description,
  };
}
