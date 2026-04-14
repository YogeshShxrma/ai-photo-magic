

## Plan: Replace AI API Call with Local Auto-Enhancement Logic

### What Changes
Replace the Supabase edge function call in `handleAiEnhance` with a **local image analysis algorithm** that runs entirely client-side using Canvas pixel data. No API calls, no Supabase dependency for auto-enhance.

### How It Works
1. **Create `src/lib/localAutoEnhance.ts`** — a pure client-side function that:
   - Reads pixel data from the source canvas
   - Computes a histogram (per-channel min, max, mean, standard deviation)
   - Analyzes brightness, contrast, saturation, and color temperature from the statistics
   - Returns optimal `EnhancementParams` based on rules:
     - **Dark image** (low mean luminance) → increase brightness/shadows
     - **Low contrast** (narrow histogram spread) → boost contrast/clarity
     - **Desaturated** → slight saturation bump
     - **Color cast** (R/B channel imbalance) → temperature correction
     - **Low detail variance** → increase sharpness
   - Returns a description string summarizing what was detected

2. **Update `src/pages/Index.tsx`** — replace the `fetch` call in `handleAiEnhance` with a call to the local analysis function. Remove the Supabase URL/key references. Keep the processing overlay for UX consistency (runs in ~50ms but feels intentional).

### Technical Details

The local analyzer will compute:
- **Luminance histogram** using standard coefficients (0.2126R + 0.7152G + 0.0722B)
- **Channel means** for R, G, B to detect color casts
- **Standard deviation** of luminance for contrast assessment
- **Saturation sampling** by converting pixels to HSL

Parameter mapping rules (example):
| Metric | Condition | Adjustment |
|--------|-----------|------------|
| Mean luminance < 80 | Dark | brightness +15-30 |
| Mean luminance > 180 | Bright | brightness -10-20, highlights -15 |
| Std dev < 40 | Flat | contrast +20-35, clarity +25 |
| Low saturation avg | Washed out | saturation +15-25 |
| R-B diff > 15 | Warm cast | temperature -10-20 |

### Files Modified
- **New**: `src/lib/localAutoEnhance.ts`
- **Edit**: `src/pages/Index.tsx` — swap API call for local function

### What Stays the Same
- All presets, manual sliders, before/after, download — unchanged
- Emotion detection still uses Supabase (separate feature)
- The edge function files remain but won't be called for auto-enhance

