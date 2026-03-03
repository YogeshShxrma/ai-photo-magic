import React from "react";
import { motion } from "framer-motion";
import { type EnhancementParams } from "@/lib/imageProcessing";

interface EnhancementControlsProps {
  params: EnhancementParams;
  onChange: (params: EnhancementParams) => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-body text-muted-foreground">{label}</span>
        <span className="text-xs font-display font-semibold text-foreground tabular-nums w-10 text-right">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <div className="slider-track">
        <div
          className="slider-fill"
          style={{
            left: min < 0 ? "50%" : "0%",
            width: min < 0 ? `${Math.abs(value) / ((max - min) / 2) * 50}%` : `${percentage}%`,
            transform: min < 0 && value < 0 ? "translateX(-100%)" : undefined,
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 opacity-0 cursor-pointer absolute"
        style={{ marginTop: "-6px" }}
      />
    </div>
  );
};

const controls: { key: keyof EnhancementParams; label: string; min: number; max: number }[] = [
  { key: "brightness", label: "Brightness", min: -100, max: 100 },
  { key: "contrast", label: "Contrast", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100 },
  { key: "temperature", label: "Temperature", min: -100, max: 100 },
  { key: "highlights", label: "Highlights", min: -100, max: 100 },
  { key: "shadows", label: "Shadows", min: -100, max: 100 },
  { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
  { key: "clarity", label: "Clarity", min: 0, max: 100 },
  { key: "noise", label: "Noise Reduction", min: 0, max: 100 },
];

const EnhancementControls: React.FC<EnhancementControlsProps> = ({ params, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-5 space-y-4"
    >
      <h3 className="font-display font-semibold text-sm text-foreground">Adjustments</h3>
      <div className="space-y-5">
        {controls.map((ctrl) => (
          <div key={ctrl.key} className="relative">
            <SliderControl
              label={ctrl.label}
              value={params[ctrl.key]}
              min={ctrl.min}
              max={ctrl.max}
              onChange={(v) => onChange({ ...params, [ctrl.key]: v })}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EnhancementControls;
