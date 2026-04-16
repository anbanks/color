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

export function PaletteActions({ slug, colors }: PaletteActionsProps) {
  const { t } = useLocale();

  const handleDownload = () => downloadImage(colors, slug);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied!");
    });
  };

  return (
    <>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-[6px] h-[34px] px-[14px] rounded-full border-[1.5px] border-gray-300 dark:border-white/20 text-[14px] text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer"
      >
        <Download className="h-4 w-4" />
        {t.single.image}
      </button>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-[6px] h-[34px] px-[14px] rounded-full border-[1.5px] border-gray-300 dark:border-white/20 text-[14px] text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer"
      >
        <Link2 className="h-4 w-4" />
        {t.single.link}
      </button>
    </>
  );
}
