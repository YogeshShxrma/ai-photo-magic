import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, RotateCcw, Wand2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ImageUploader";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import EnhancementControls from "@/components/EnhancementControls";
import PresetStyles from "@/components/PresetStyles";
import EmotionDetection from "@/components/EmotionDetection";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import {
  type EnhancementParams,
  defaultParams,
  applyEnhancements,
  imageToCanvas,
  canvasToBlob,
} from "@/lib/imageProcessing";
import { localAutoEnhance } from "@/lib/localAutoEnhance";

const Index = () => {
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [params, setParams] = useState<EnhancementParams>(defaultParams);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const enhancedCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

  const applyAndUpdate = useCallback(
    (newParams: EnhancementParams, canvas: HTMLCanvasElement | null = sourceCanvas) => {
      if (!canvas) return;
      const target = enhancedCanvasRef.current;
      applyEnhancements(canvas, target, newParams);
      setEnhancedUrl(target.toDataURL("image/png"));
    },
    [sourceCanvas]
  );

  const handleImageLoad = useCallback(
    (img: HTMLImageElement) => {
      const canvas = imageToCanvas(img);
      setSourceCanvas(canvas);
      setOriginalUrl(canvas.toDataURL("image/png"));
      setParams(defaultParams);
      setActivePreset(null);
      setAiDescription(null);
      setHasImage(true);

      // Apply default (no changes) to show enhanced
      const target = enhancedCanvasRef.current;
      applyEnhancements(canvas, target, defaultParams);
      setEnhancedUrl(target.toDataURL("image/png"));
    },
    []
  );

  const handleParamsChange = useCallback(
    (newParams: EnhancementParams) => {
      setParams(newParams);
      setActivePreset(null);
      applyAndUpdate(newParams);
    },
    [applyAndUpdate]
  );

  const handlePresetSelect = useCallback(
    (name: string, presetParams: EnhancementParams) => {
      setActivePreset(name);
      setParams(presetParams);
      applyAndUpdate(presetParams);
    },
    [applyAndUpdate]
  );

  const handleAiEnhance = useCallback(() => {
    if (!sourceCanvas) return;
    setIsProcessing(true);
    // Small delay for UX feedback
    setTimeout(() => {
      try {
        const result = localAutoEnhance(sourceCanvas);
        setParams(result.params);
        setActivePreset(null);
        setAiDescription(result.description);
        applyAndUpdate(result.params);
      } catch (err) {
        console.error("Auto-enhance error:", err);
        setAiDescription("Auto-enhance failed. Try manual adjustments or a preset.");
      } finally {
        setIsProcessing(false);
      }
    }, 300);
  }, [sourceCanvas, applyAndUpdate]);

  const handleDownload = useCallback(async () => {
    if (!sourceCanvas) return;
    const target = document.createElement("canvas");
    applyEnhancements(sourceCanvas, target, params);
    const blob = await canvasToBlob(target, "image/png");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhanced-image.png";
    a.click();
    URL.revokeObjectURL(url);
  }, [sourceCanvas, params]);

  const handleReset = useCallback(() => {
    setParams(defaultParams);
    setActivePreset(null);
    setAiDescription(null);
    applyAndUpdate(defaultParams);
  }, [applyAndUpdate]);

  const handleNewImage = useCallback(() => {
    setSourceCanvas(null);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    setParams(defaultParams);
    setActivePreset(null);
    setAiDescription(null);
    setHasImage(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        <ProcessingOverlay isProcessing={isProcessing} />
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">
              AI Photo Enhancer <span className="text-primary">Pro</span>
            </h1>
          </div>
          {hasImage && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleNewImage}>
                New Image
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!hasImage ? (
          /* Landing / Upload state */
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 max-w-xl"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Enhance Photos with{" "}
                <span className="glow-text">AI Power</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Upload any image and let AI analyze and enhance it instantly.
                Fine-tune with manual controls or choose from pro presets.
              </p>
            </motion.div>

            <ImageUploader onImageLoad={handleImageLoad} hasImage={hasImage} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 text-muted-foreground text-sm"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI-Powered
              </div>
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-accent" />
                Pro Presets
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                Full Resolution
              </div>
            </motion.div>
          </div>
        ) : (
          /* Editor state */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main preview area */}
            <div className="flex-1 space-y-4">
              {originalUrl && enhancedUrl && (
                <BeforeAfterSlider originalSrc={originalUrl} enhancedSrc={enhancedUrl} />
              )}

              {/* AI Enhance button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAiEnhance}
                  disabled={isProcessing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Auto-Enhance
                </Button>
                {aiDescription && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-muted-foreground italic"
                  >
                    {aiDescription}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Sidebar controls */}
            <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
              <EmotionDetection
                sourceCanvas={sourceCanvas}
                onApplyFilter={(name, filterParams) => {
                  setActivePreset(name);
                  setParams(filterParams);
                  applyAndUpdate(filterParams);
                }}
              />
              <PresetStyles activePreset={activePreset} onSelect={handlePresetSelect} />
              <EnhancementControls params={params} onChange={handleParamsChange} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
