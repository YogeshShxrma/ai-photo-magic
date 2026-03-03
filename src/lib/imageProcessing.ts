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

  // Temperature as hue-rotate approximation
  const hueRotate = params.temperature * 0.3;

  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.filter = "none";

  // Pixel-level adjustments for highlights, shadows, sharpness, clarity, noise
  if (params.highlights !== 0 || params.shadows !== 0 || params.sharpness > 0 || params.clarity > 0 || params.noise > 0) {
    const imageData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      // Highlights & shadows
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      if (params.highlights !== 0 && luminance > 0.5) {
        const factor = 1 + (params.highlights / 100) * (luminance - 0.5) * 2;
        r = Math.min(255, r * factor);
        g = Math.min(255, g * factor);
        b = Math.min(255, b * factor);
      }

      if (params.shadows !== 0 && luminance < 0.5) {
        const factor = 1 + (params.shadows / 100) * (0.5 - luminance) * 2;
        r = Math.min(255, r * factor);
        g = Math.min(255, g * factor);
        b = Math.min(255, b * factor);
      }

      // Noise reduction (simple averaging with neighbors - simplified)
      if (params.noise > 0) {
        const noiseReduction = params.noise / 200;
        r = r * (1 - noiseReduction) + 128 * noiseReduction * 0.1 + r * 0.9 * noiseReduction;
        g = g * (1 - noiseReduction) + 128 * noiseReduction * 0.1 + g * 0.9 * noiseReduction;
        b = b * (1 - noiseReduction) + 128 * noiseReduction * 0.1 + b * 0.9 * noiseReduction;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);

    // Sharpness using unsharp mask approximation
    if (params.sharpness > 0 || params.clarity > 0) {
      const amount = (params.sharpness + params.clarity) / 200;
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = amount * 0.3;
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
