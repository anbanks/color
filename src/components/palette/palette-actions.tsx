"use client";

import { Download, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";

interface PaletteActionsProps {
  slug: string;
  colors: string[];
}

function downloadImage(colors: string[], slug: string) {
  const w = 1200;
  const stripH = Math.round(w / colors.length);
  const h = stripH * colors.length;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * stripH, w, stripH);
  });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

const btnClass =
  "inline-flex items-center justify-center h-[36px] w-[36px] rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer";

export function PaletteActions({ slug, colors }: PaletteActionsProps) {
  const { t } = useLocale();

  return (
    <>
      <button
        onClick={() => downloadImage(colors, slug)}
        className={btnClass}
        title={t.single.image}
        aria-label={t.single.image}
      >
        <Download className="h-[15px] w-[15px]" />
      </button>
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}${window.location.pathname}`
          );
          toast.success("Link copied!");
        }}
        className={btnClass}
        title={t.single.link}
        aria-label={t.single.link}
      >
        <Link2 className="h-[15px] w-[15px]" />
      </button>
    </>
  );
}
