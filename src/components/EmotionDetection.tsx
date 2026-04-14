import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Emotion,
  type SkinTone,
  type FilterRecommendation,
  emotionProfiles,
  skinToneProfiles,
  getFilterRecommendations,
} from "@/lib/emotionFilterMap";
import { type EnhancementParams, imageToBase64 } from "@/lib/imageProcessing";

interface EmotionDetectionProps {
  sourceCanvas: HTMLCanvasElement | null;
  onApplyFilter: (name: string, params: EnhancementParams) => void;
}

interface DetectionResult {
  faceDetected: boolean;
  emotion: Emotion;
  emotionConfidence: number;
  skinTone: SkinTone;
  description: string;
  recommendations: FilterRecommendation[];
}

const EmotionDetection: React.FC<EmotionDetectionProps> = ({ sourceCanvas, onApplyFilter }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = useCallback(async () => {
    if (!sourceCanvas) return;
    setIsDetecting(true);
    setError(null);
    setResult(null);

    try {
      const base64 = imageToBase64(sourceCanvas, 512);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-emotion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64 }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Detection failed");
      }

      const data = await response.json();

      if (!data.faceDetected) {
        setError("No face detected in the image. Try a photo with a visible face.");
        return;
      }

      const emotion = data.emotion as Emotion;
      const skinTone = data.skinTone as SkinTone;
      const recommendations = getFilterRecommendations(emotion, skinTone);

      setResult({
        faceDetected: true,
        emotion,
        emotionConfidence: data.emotionConfidence || 0.8,
        skinTone,
        description: data.description || "",
        recommendations,
      });
    } catch (err) {
      console.error("Emotion detection error:", err);
      setError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setIsDetecting(false);
    }
  }, [sourceCanvas]);

  const emotionProfile = result ? emotionProfiles.find((e) => e.emotion === result.emotion) : null;
  const toneProfile = result ? skinToneProfiles.find((t) => t.tone === result.skinTone) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-primary" />
          Emotion Detection
        </h3>
      </div>

      <Button
        onClick={handleDetect}
        disabled={isDetecting || !sourceCanvas}
        variant="outline"
        size="sm"
        className="w-full gap-2"
      >
        {isDetecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing Face...
          </>
        ) : (
          <>
            <ScanFace className="w-4 h-4" />
            Detect Emotion & Suggest Filters
          </>
        )}
      </Button>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {result && emotionProfile && toneProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Detection results */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-2xl">{emotionProfile.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-semibold text-foreground">
                    {emotionProfile.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(result.emotionConfidence * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: toneProfile.colorHex }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {toneProfile.label} skin tone
                  </span>
                </div>
              </div>
            </div>

            {result.description && (
              <p className="text-xs text-muted-foreground italic">{result.description}</p>
            )}

            {/* Recommended filters */}
            <div className="space-y-2">
              <h4 className="text-xs font-display font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Suggested Filters
              </h4>
              <div className="space-y-1.5">
                {result.recommendations.map((rec) => (
                  <button
                    key={rec.presetName}
                    onClick={() => onApplyFilter(rec.presetName, rec.params)}
                    className="w-full text-left p-2.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-medium text-foreground group-hover:text-primary transition-colors">
                        {rec.presetName}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {Math.round(rec.confidence * 100)}% match
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      {rec.reason}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmotionDetection;
