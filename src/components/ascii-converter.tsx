"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AsciiConverterProps {
  imageSrc: string;
  fileName: string;
  onReset: () => void;
}

const CHAR_SETS = {
  standard: " .,:;i1tfLCG08@",
  blocks: " ░▒▓█",
  minimal: " .:░█",
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
};

type CharSetKey = keyof typeof CHAR_SETS;

export function AsciiConverter({
  imageSrc,
  fileName,
  onReset,
}: AsciiConverterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ascii, setAscii] = useState<string>("");
  const [width, setWidth] = useState<number>(120);
  const [charSet, setCharSet] = useState<CharSetKey>("standard");
  const [inverted, setInverted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(4);
  const [colored, setColored] = useState(false);
  const [colorData, setColorData] = useState<string[][]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const generateAscii = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    const aspectRatio = img.height / img.width;
    // Characters are ~2x taller than wide, so compensate
    const height = Math.round(width * aspectRatio * 0.45);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const chars = CHAR_SETS[charSet];

    let result = "";
    const colors: string[][] = [];

    for (let y = 0; y < height; y++) {
      let row = "";
      const colorRow: string[] = [];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
        const normalizedBrightness = inverted
          ? 1 - brightness / 255
          : brightness / 255;
        const charIndex = Math.floor(normalizedBrightness * (chars.length - 1));
        row += chars[charIndex];
        colorRow.push(`rgb(${r},${g},${b})`);
      }
      result += row + "\n";
      colors.push(colorRow);
    }

    setAscii(result);
    setColorData(colors);
  }, [width, charSet, inverted]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      generateAscii();
    };
    img.src = imageSrc;
  }, [imageSrc, generateAscii]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [ascii]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([ascii], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.split(".")[0]}-ascii.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [ascii, fileName]);

  const handleDownloadImage = useCallback(() => {
    const lines = ascii.split("\n").filter((l) => l.length > 0);
    if (lines.length === 0) return;

    const charWidth = 6;
    const charHeight = 8;
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = lines[0].length * charWidth;
    renderCanvas.height = lines.length * charHeight;
    const ctx = renderCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#08080a";
    ctx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    ctx.font = `${charHeight}px monospace`;
    ctx.textBaseline = "top";

    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        if (colored && colorData[y]?.[x]) {
          ctx.fillStyle = colorData[y][x];
        } else {
          ctx.fillStyle = "#a1e89a";
        }
        ctx.fillText(lines[y][x], x * charWidth, y * charHeight);
      }
    }

    const url = renderCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.split(".")[0]}-ascii.png`;
    a.click();
  }, [ascii, fileName, colored, colorData]);

  const renderColoredAscii = () => {
    const lines = ascii.split("\n");
    return lines.map((line, y) => (
      <div key={y} style={{ height: `${fontSize * 1.2}px` }}>
        {line.split("").map((char, x) => (
          <span
            key={x}
            style={{
              color: colorData[y]?.[x] || "#a1e89a",
            }}
          >
            {char}
          </span>
        ))}
      </div>
    ));
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-up">
      <canvas ref={canvasRef} className="hidden" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="font-mono text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M11 1L5 8l6 7" />
            </svg>
            back
          </button>
          <span className="text-border">|</span>
          <span className="font-mono text-[11px] text-muted/60 truncate max-w-[200px]">
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-hover font-mono text-[11px] text-muted hover:text-foreground transition-all"
          >
            {copied ? "copied!" : "copy"}
          </button>
          <button
            onClick={handleDownload}
            className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-hover font-mono text-[11px] text-muted hover:text-foreground transition-all"
          >
            .txt
          </button>
          <button
            onClick={handleDownloadImage}
            className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-hover font-mono text-[11px] text-muted hover:text-foreground transition-all"
          >
            .png
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 rounded-xl border border-border bg-surface/50">
        {/* Width */}
        <div className="flex items-center gap-3">
          <label className="font-mono text-[11px] text-muted uppercase tracking-wider">
            Width
          </label>
          <input
            type="range"
            min={40}
            max={200}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-24"
          />
          <span className="font-mono text-[11px] text-accent w-8 text-right">
            {width}
          </span>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-3">
          <label className="font-mono text-[11px] text-muted uppercase tracking-wider">
            Size
          </label>
          <input
            type="range"
            min={2}
            max={10}
            step={0.5}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-20"
          />
          <span className="font-mono text-[11px] text-accent w-6 text-right">
            {fontSize}
          </span>
        </div>

        {/* Char set */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-[11px] text-muted uppercase tracking-wider">
            Chars
          </label>
          <div className="flex gap-1">
            {(Object.keys(CHAR_SETS) as CharSetKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setCharSet(key)}
                className={`h-7 px-2.5 rounded-md font-mono text-[10px] transition-all ${
                  charSet === key
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-transparent hover:border-border"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Invert toggle */}
        <button
          onClick={() => setInverted(!inverted)}
          className={`h-7 px-2.5 rounded-md font-mono text-[10px] transition-all ${
            inverted
              ? "bg-accent/15 text-accent border border-accent/30"
              : "text-muted/60 hover:text-muted border border-transparent hover:border-border"
          }`}
        >
          invert
        </button>

        {/* Color toggle */}
        <button
          onClick={() => setColored(!colored)}
          className={`h-7 px-2.5 rounded-md font-mono text-[10px] transition-all ${
            colored
              ? "bg-accent/15 text-accent border border-accent/30"
              : "text-muted/60 hover:text-muted border border-transparent hover:border-border"
          }`}
        >
          color
        </button>
      </div>

      {/* ASCII Output */}
      <div className="relative rounded-xl border border-border bg-surface/30 overflow-auto glow">
        <div className="scanlines absolute inset-0 pointer-events-none z-10 rounded-xl" />
        <div className="p-6 overflow-x-auto">
          {colored ? (
            <div
              className="font-mono whitespace-pre leading-none"
              style={{ fontSize: `${fontSize}px`, letterSpacing: "0.05em" }}
            >
              {renderColoredAscii()}
            </div>
          ) : (
            <pre
              className="ascii-output"
              style={{ fontSize: `${fontSize}px` }}
            >
              {ascii}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
