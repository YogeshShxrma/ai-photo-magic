import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ProcessingOverlayProps {
  isProcessing: boolean;
  message?: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ isProcessing, message = "AI is analyzing your image..." }) => {
  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="glass-card processing-pulse p-10 flex flex-col items-center gap-6 max-w-sm"
      >
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="font-display font-semibold text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
        </div>

        {/* Scan line animation */}
        <div className="w-full h-1 rounded-full overflow-hidden bg-muted">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProcessingOverlay;
