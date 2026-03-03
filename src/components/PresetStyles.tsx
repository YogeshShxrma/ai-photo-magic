import React from "react";
import { motion } from "framer-motion";
import { presetStyles, type EnhancementParams, defaultParams } from "@/lib/imageProcessing";

interface PresetStylesProps {
  activePreset: string | null;
  onSelect: (name: string, params: EnhancementParams) => void;
}

const PresetStyles: React.FC<PresetStylesProps> = ({ activePreset, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card p-5 space-y-4"
    >
      <h3 className="font-display font-semibold text-sm text-foreground">Presets</h3>
      <div className="grid grid-cols-3 gap-2">
        {presetStyles.map((preset) => (
          <button
            key={preset.name}
            onClick={() =>
              onSelect(preset.name, { ...defaultParams, ...preset.params })
            }
            className={`preset-card ${activePreset === preset.name ? "active" : ""}`}
          >
            <div className="text-xl mb-1">{preset.icon}</div>
            <div className="text-xs font-display font-medium text-foreground">{preset.name}</div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default PresetStyles;
