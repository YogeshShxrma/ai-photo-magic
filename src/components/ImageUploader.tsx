import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  onImageLoad: (img: HTMLImageElement) => void;
  hasImage: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoad, hasImage }) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload a JPG, PNG, or WEBP image.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 10MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => onImageLoad(img);
      img.onerror = () => setError("Failed to load image.");
      img.src = url;
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (hasImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <label
        className={`upload-zone flex flex-col items-center justify-center p-16 gap-6 ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileInput}
        />

        <motion.div
          animate={dragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          {dragging ? (
            <ImageIcon className="w-10 h-10 text-primary" />
          ) : (
            <Upload className="w-10 h-10 text-primary" />
          )}
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-lg font-display font-semibold text-foreground">
            {dragging ? "Drop your image here" : "Drag & drop your image"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse · JPG, PNG, WEBP · Max 10MB
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-destructive text-sm"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </motion.div>
  );
};

export default ImageUploader;
