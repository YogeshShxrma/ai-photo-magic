/**
 * Local dataset mapping detected emotions and skin tones to recommended filters/presets.
 * This serves as the knowledge base for emotion-based filter suggestions.
 */

import { type EnhancementParams, defaultParams } from "./imageProcessing";

export type Emotion = "happy" | "sad" | "angry" | "surprised" | "neutral" | "fearful" | "disgusted" | "contempt";
export type SkinTone = "fair" | "light" | "medium" | "olive" | "tan" | "dark";

export interface EmotionProfile {
  emotion: Emotion;
  label: string;
  emoji: string;
  description: string;
}

export interface SkinToneProfile {
  tone: SkinTone;
  label: string;
  colorHex: string;
  brightnessAdjust: number;   // base brightness offset
  warmthAdjust: number;       // base temperature offset
  saturationAdjust: number;   // base saturation offset
}

export interface FilterRecommendation {
  presetName: string;
  confidence: number;  // 0-1 how well it matches
  reason: string;
  params: EnhancementParams;
}

// ─── Emotion Profiles ───
export const emotionProfiles: EmotionProfile[] = [
  { emotion: "happy", label: "Happy", emoji: "😊", description: "Joyful, smiling expression detected" },
  { emotion: "sad", label: "Sad", emoji: "😢", description: "Melancholic or downcast expression detected" },
  { emotion: "angry", label: "Angry", emoji: "😠", description: "Intense or frustrated expression detected" },
  { emotion: "surprised", label: "Surprised", emoji: "😲", description: "Astonished or shocked expression detected" },
  { emotion: "neutral", label: "Neutral", emoji: "😐", description: "Calm, composed expression detected" },
  { emotion: "fearful", label: "Fearful", emoji: "😨", description: "Anxious or worried expression detected" },
  { emotion: "disgusted", label: "Disgusted", emoji: "🤢", description: "Displeased expression detected" },
  { emotion: "contempt", label: "Contempt", emoji: "😏", description: "Dismissive or smug expression detected" },
];

// ─── Skin Tone Profiles ───
export const skinToneProfiles: SkinToneProfile[] = [
  { tone: "fair", label: "Fair", colorHex: "#FFE0BD", brightnessAdjust: -5, warmthAdjust: -5, saturationAdjust: -5 },
  { tone: "light", label: "Light", colorHex: "#F1C27D", brightnessAdjust: 0, warmthAdjust: 0, saturationAdjust: 0 },
  { tone: "medium", label: "Medium", colorHex: "#E0AC69", brightnessAdjust: 5, warmthAdjust: 5, saturationAdjust: 5 },
  { tone: "olive", label: "Olive", colorHex: "#C68642", brightnessAdjust: 5, warmthAdjust: -5, saturationAdjust: 5 },
  { tone: "tan", label: "Tan", colorHex: "#8D5524", brightnessAdjust: 8, warmthAdjust: 5, saturationAdjust: 8 },
  { tone: "dark", label: "Dark", colorHex: "#5C3A1E", brightnessAdjust: 12, warmthAdjust: 8, saturationAdjust: 10 },
];

// ─── Emotion → Filter Mapping Dataset ───
// Each emotion maps to an ordered list of recommended filter configs
const emotionFilterDataset: Record<Emotion, Omit<FilterRecommendation, "params">[]> = {
  happy: [
    { presetName: "Warm Glow", confidence: 0.95, reason: "Warm tones amplify joyful expressions" },
    { presetName: "Instagram", confidence: 0.88, reason: "Vibrant colors match happy energy" },
    { presetName: "Golden Hour", confidence: 0.85, reason: "Soft golden light enhances smiles" },
    { presetName: "Studio", confidence: 0.75, reason: "Clean, polished look for portraits" },
  ],
  sad: [
    { presetName: "Moody Blue", confidence: 0.93, reason: "Cool tones convey melancholic mood" },
    { presetName: "Film Noir", confidence: 0.87, reason: "High contrast B&W adds emotional depth" },
    { presetName: "Moody", confidence: 0.82, reason: "Dark shadows express somber feeling" },
    { presetName: "Desaturated", confidence: 0.78, reason: "Muted colors match subdued emotion" },
  ],
  angry: [
    { presetName: "High Contrast", confidence: 0.92, reason: "Bold contrast matches intense emotion" },
    { presetName: "Cinematic", confidence: 0.86, reason: "Dramatic toning suits strong expressions" },
    { presetName: "Film Noir", confidence: 0.80, reason: "Dark aesthetic conveys intensity" },
    { presetName: "HDR", confidence: 0.75, reason: "Enhanced details emphasize expression" },
  ],
  surprised: [
    { presetName: "Vivid Pop", confidence: 0.91, reason: "Bright, saturated tones match excitement" },
    { presetName: "HDR", confidence: 0.85, reason: "Enhanced detail captures the moment" },
    { presetName: "Studio", confidence: 0.78, reason: "Clear, sharp look for expressive shots" },
    { presetName: "Instagram", confidence: 0.72, reason: "Eye-catching look for the expression" },
  ],
  neutral: [
    { presetName: "Studio", confidence: 0.90, reason: "Clean, professional look for calm portraits" },
    { presetName: "Portrait", confidence: 0.87, reason: "Flattering, natural skin tones" },
    { presetName: "Cinematic", confidence: 0.80, reason: "Subtle drama without overpowering" },
    { presetName: "Natural", confidence: 0.75, reason: "True-to-life color reproduction" },
  ],
  fearful: [
    { presetName: "Moody", confidence: 0.92, reason: "Dark atmosphere matches anxiety" },
    { presetName: "Cool Blue", confidence: 0.86, reason: "Cold tones evoke unease" },
    { presetName: "Desaturated", confidence: 0.80, reason: "Washed out look reflects worry" },
    { presetName: "Film Noir", confidence: 0.76, reason: "Noir shadows create tension" },
  ],
  disgusted: [
    { presetName: "Vintage", confidence: 0.88, reason: "Retro toning softens harsh expression" },
    { presetName: "Desaturated", confidence: 0.83, reason: "Subdued palette reduces intensity" },
    { presetName: "Cinematic", confidence: 0.77, reason: "Professional grading balances mood" },
    { presetName: "Cool Blue", confidence: 0.72, reason: "Cool tones create artistic distance" },
  ],
  contempt: [
    { presetName: "Cinematic", confidence: 0.91, reason: "Film-like grading suits confident pose" },
    { presetName: "Film Noir", confidence: 0.86, reason: "Classic noir matches smug aesthetic" },
    { presetName: "Moody", confidence: 0.80, reason: "Dark tones enhance the attitude" },
    { presetName: "High Contrast", confidence: 0.74, reason: "Strong contrast for strong expression" },
  ],
};

// ─── Filter Parameter Definitions (local dataset) ───
const filterParamsDataset: Record<string, EnhancementParams> = {
  "Warm Glow": { ...defaultParams, brightness: 12, contrast: 8, saturation: 18, temperature: 35, highlights: -10, shadows: 15, sharpness: 10, clarity: 15, noise: 0 },
  "Instagram": { ...defaultParams, brightness: 15, contrast: 10, saturation: 25, temperature: 10, highlights: 0, shadows: 0, sharpness: 0, clarity: 0, noise: 0 },
  "Golden Hour": { ...defaultParams, brightness: 8, contrast: 5, saturation: 15, temperature: 40, highlights: -15, shadows: 20, sharpness: 5, clarity: 10, noise: 0 },
  "Studio": { ...defaultParams, brightness: 10, contrast: 15, saturation: 5, temperature: 0, highlights: 0, shadows: 0, sharpness: 30, clarity: 20, noise: 0 },
  "Moody Blue": { ...defaultParams, brightness: -10, contrast: 20, saturation: -15, temperature: -35, highlights: -20, shadows: -15, sharpness: 10, clarity: 25, noise: 0 },
  "Film Noir": { ...defaultParams, brightness: -10, contrast: 50, saturation: -100, temperature: 0, highlights: 0, shadows: -35, sharpness: 20, clarity: 0, noise: 0 },
  "Moody": { ...defaultParams, brightness: -15, contrast: 35, saturation: -20, temperature: 0, highlights: -25, shadows: -30, sharpness: 0, clarity: 30, noise: 0 },
  "Desaturated": { ...defaultParams, brightness: 5, contrast: 10, saturation: -40, temperature: -5, highlights: -5, shadows: 5, sharpness: 10, clarity: 15, noise: 0 },
  "High Contrast": { ...defaultParams, brightness: 0, contrast: 45, saturation: 10, temperature: 0, highlights: -15, shadows: -20, sharpness: 25, clarity: 35, noise: 0 },
  "Cinematic": { ...defaultParams, brightness: 0, contrast: 25, saturation: -15, temperature: -10, highlights: 10, shadows: -20, sharpness: 0, clarity: 0, noise: 0 },
  "HDR": { ...defaultParams, brightness: 0, contrast: 40, saturation: 20, temperature: 0, highlights: -20, shadows: 30, sharpness: 0, clarity: 50, noise: 0 },
  "Portrait": { ...defaultParams, brightness: 8, contrast: 5, saturation: -5, temperature: 0, highlights: 0, shadows: 0, sharpness: 15, clarity: 0, noise: 30 },
  "Natural": { ...defaultParams, brightness: 3, contrast: 5, saturation: 5, temperature: 3, highlights: 0, shadows: 5, sharpness: 10, clarity: 10, noise: 10 },
  "Vivid Pop": { ...defaultParams, brightness: 10, contrast: 20, saturation: 40, temperature: 5, highlights: -10, shadows: 10, sharpness: 20, clarity: 25, noise: 0 },
  "Vintage": { ...defaultParams, brightness: 5, contrast: -10, saturation: -30, temperature: 20, highlights: 0, shadows: 0, sharpness: 0, clarity: 0, noise: 15 },
  "Cool Blue": { ...defaultParams, brightness: 0, contrast: 15, saturation: 10, temperature: -40, highlights: -10, shadows: 0, sharpness: 0, clarity: 20, noise: 0 },
};

/**
 * Given a detected emotion and skin tone, produce ranked filter recommendations
 * with parameters adjusted for the skin tone.
 */
export function getFilterRecommendations(
  emotion: Emotion,
  skinTone: SkinTone
): FilterRecommendation[] {
  const emotionFilters = emotionFilterDataset[emotion] || emotionFilterDataset.neutral;
  const toneProfile = skinToneProfiles.find((p) => p.tone === skinTone) || skinToneProfiles[1];

  return emotionFilters.map((filter) => {
    const baseParams = filterParamsDataset[filter.presetName] || { ...defaultParams };

    // Adjust parameters based on skin tone
    const adjustedParams: EnhancementParams = {
      ...baseParams,
      brightness: clamp(baseParams.brightness + toneProfile.brightnessAdjust, -100, 100),
      temperature: clamp(baseParams.temperature + toneProfile.warmthAdjust, -100, 100),
      saturation: clamp(baseParams.saturation + toneProfile.saturationAdjust, -100, 100),
    };

    return {
      ...filter,
      params: adjustedParams,
    };
  });
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
