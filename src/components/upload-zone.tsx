"use client";

import { useCallback, useState, useRef } from "react";

interface UploadZoneProps {
  onImage: (file: File) => void;
}

export function UploadZone({ onImage }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onImage(file);
      }
    },
    [onImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        relative w-full aspect-[16/9] rounded-2xl border-2 border-dashed
        flex flex-col items-center justify-center gap-4 cursor-pointer
        transition-all duration-300 group
        ${
          isDragging
            ? "border-accent bg-accent/5 scale-[1.02]"
            : "border-border upload-idle hover:bg-surface"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Icon */}
      <div
        className={`
        w-12 h-12 rounded-xl border flex items-center justify-center
        transition-all duration-300
        ${
          isDragging
            ? "border-accent/40 bg-accent/10"
            : "border-border group-hover:border-accent/30 bg-surface"
        }
      `}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-colors duration-300 ${
            isDragging ? "text-accent" : "text-muted group-hover:text-accent/70"
          }`}
        >
          <path
            d="M10 3v10m0-10L6.5 6.5M10 3l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 13v2a2 2 0 002 2h10a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <p
          className={`font-mono text-sm transition-colors duration-300 ${
            isDragging ? "text-accent" : "text-muted group-hover:text-foreground"
          }`}
        >
          {isDragging ? "Release to convert" : "Click or drag an image"}
        </p>
        <p className="font-mono text-[11px] text-muted/40 mt-1">
          Max 10MB
        </p>
      </div>
    </div>
  );
}
