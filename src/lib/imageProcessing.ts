export interface EnhancementParams {
  brightness: number;    // -100 to 100
  contrast: number;      // -100 to 100
  saturation: number;    // -100 to 100
  temperature: number;   // -100 to 100
  highlights: number;    // -100 to 100
  shadows: number;       // -100 to 100
  sharpness: number;     // 0 to 100
  clarity: number;       // 0 to 100
  noise: number;         // 0 to 100 (reduction)
}

export const defaultParams: EnhancementParams = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  highlights: 0,
  shadows: 0,
  sharpness: 0,
  clarity: 0,
  noise: 0,
};

export interface PresetStyle {
  name: string;
  icon: string;
  params: Partial<EnhancementParams>;
}

export const presetStyles: PresetStyle[] = [
  { name: "Cinematic", icon: "🎬", params: { contrast: 25, saturation: -15, temperature: -10, shadows: -20, highlights: 10 } },
  { name: "HDR", icon: "🌄", params: { contrast: 40, saturation: 20, clarity: 50, shadows: 30, highlights: -20 } },
  { name: "Studio", icon: "📸", params: { brightness: 10, contrast: 15, saturation: 5, sharpness: 30, clarity: 20 } },
  { name: "Instagram", icon: "✨", params: { brightness: 15, contrast: 10, saturation: 25, temperature: 10 } },
  { name: "Portrait", icon: "👤", params: { brightness: 8, contrast: 5, saturation: -5, sharpness: 15, noise: 30 } },
  { name: "Landscape", icon: "🏔️", params: { contrast: 20, saturation: 30, clarity: 40, sharpness: 20, highlights: -10 } },
  { name: "Vintage", icon: "📼", params: { brightness: 5, contrast: -10, saturation: -30, temperature: 20, noise: 15 } },
  { name: "B&W", icon: "⬛", params: { saturation: -100, contrast: 30, clarity: 25, sharpness: 15 } },
  { name: "Warm Sunset", icon: "🌅", params: { brightness: 10, saturation: 20, temperature: 45, highlights: -15, shadows: 15 } },
  { name: "Cool Blue", icon: "❄️", params: { saturation: 10, temperature: -40, contrast: 15, clarity: 20, highlights: -10 } },
  { name: "Moody", icon: "🌑", params: { brightness: -15, contrast: 35, saturation: -20, shadows: -30, highlights: -25, clarity: 30 } },
  { name: "Film Noir", icon: "🎞️", params: { saturation: -100, contrast: 50, brightness: -10, shadows: -35, sharpness: 20 } },
];

export function applyEnhancements(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  params: EnhancementParams
): void {
  const ctx = targetCanvas.getContext("2d");
  if (!ctx) return;

  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;

  // Apply CSS filters for brightness, contrast, saturation
  const brightness = 1 + params.brightness / 100;
  const contrast = 1 + params.contrast / 100;
  const saturate = 1 + params.saturation / 100;

  // Temperature: warm shifts toward amber, cool toward blue
  const hueRotate = params.temperature * 0.3;

  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.filter = "none";

  // Pixel-level adjustments
  if (params.highlights !== 0 || params.shadows !== 0 || params.sharpness > 0 || params.clarity > 0 || params.noise > 0 || params.temperature !== 0) {
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Temperature split-tone: add warmth/coolness via channel shift
    const tempShift = params.temperature * 0.15;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      // Temperature: shift red/blue channels
      if (tempShift !== 0) {
        r = Math.min(255, Math.max(0, r + tempShift));
        b = Math.min(255, Math.max(0, b - tempShift));
      }

      // Highlights & shadows with smooth curves
      const luminance = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;

      if (params.highlights !== 0) {
        // Smooth rolloff for highlights (affects bright pixels)
        const mask = Math.max(0, (luminance - 0.5) * 2);
        const amount = (params.highlights / 100) * mask * mask;
        r = Math.min(255, Math.max(0, r + r * amount * 0.3));
        g = Math.min(255, Math.max(0, g + g * amount * 0.3));
        b = Math.min(255, Math.max(0, b + b * amount * 0.3));
      }

      if (params.shadows !== 0) {
        // Smooth rolloff for shadows (affects dark pixels)
        const mask = Math.max(0, (0.5 - luminance) * 2);
        const amount = (params.shadows / 100) * mask * mask;
        r = Math.min(255, Math.max(0, r + (255 - r) * amount * 0.3));
        g = Math.min(255, Math.max(0, g + (255 - g) * amount * 0.3));
        b = Math.min(255, Math.max(0, b + (255 - b) * amount * 0.3));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Noise reduction via box blur blend
    if (params.noise > 0) {
      const strength = params.noise / 100;
      const blurred = new Uint8ClampedArray(data.length);
      blurred.set(data);
      const radius = Math.max(1, Math.round(strength * 2));

      for (let y = radius; y < h - radius; y++) {
        for (let x = radius; x < w - radius; x++) {
          let sr = 0, sg = 0, sb = 0, count = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4;
              sr += data[idx]; sg += data[idx + 1]; sb += data[idx + 2];
              count++;
            }
          }
          const idx = (y * w + x) * 4;
          blurred[idx] = data[idx] * (1 - strength) + (sr / count) * strength;
          blurred[idx + 1] = data[idx + 1] * (1 - strength) + (sg / count) * strength;
          blurred[idx + 2] = data[idx + 2] * (1 - strength) + (sb / count) * strength;
        }
      }
      for (let i = 0; i < data.length; i++) data[i] = blurred[i];
    }

    ctx.putImageData(imageData, 0, 0);

    // Unsharp mask for sharpness & clarity
    if (params.sharpness > 0 || params.clarity > 0) {
      const amount = ((params.sharpness * 0.6 + params.clarity * 0.4) / 100) * 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = amount;
      ctx.drawImage(targetCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  }
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      type,
      quality
    );
  });
}

export function imageToBase64(canvas: HTMLCanvasElement, maxSize = 512): string {
  const tempCanvas = document.createElement("canvas");
  const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height, 1);
  tempCanvas.width = canvas.width * scale;
  tempCanvas.height = canvas.height * scale;
  const ctx = tempCanvas.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
  return tempCanvas.toDataURL("image/jpeg", 0.7);
}
