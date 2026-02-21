"use client";

import { useState, useCallback } from "react";
import { AsciiConverter } from "@/components/ascii-converter";
import { UploadZone } from "@/components/upload-zone";
import { Header } from "@/components/header";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleImage = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
    setFileName("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        {!image ? (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-10">
            <div className="text-center animate-fade-up">
              <h1 className="font-mono text-3xl sm:text-4xl font-light tracking-tight text-foreground">
                Image <span className="text-accent">→</span> ASCII
              </h1>
              <p className="mt-3 text-muted text-sm font-mono tracking-wide">
                Drop an image. Get characters.
              </p>
            </div>

            <div className="w-full animate-fade-up-delay">
              <UploadZone onImage={handleImage} />
            </div>

            <div className="flex gap-8 text-[11px] font-mono text-muted/50 uppercase tracking-[0.2em] animate-fade-up-delay-2">
              <span>png</span>
              <span>jpg</span>
              <span>webp</span>
              <span>gif</span>
            </div>
          </div>
        ) : (
          <AsciiConverter
            imageSrc={image}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
