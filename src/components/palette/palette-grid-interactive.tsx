"use client";

import { PaletteCard } from "./palette-card";

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
  createdAt?: string;
}

interface PaletteGridInteractiveProps {
  palettes: Palette[];
}

function timeAgo(date?: string): string {
  if (!date) return "";
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week";
  if (weeks < 5) return `${weeks} weeks`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(days / 365);
  if (years === 1) return "1 year";
  return `${years} years`;
}

export function PaletteGridInteractive({ palettes }: PaletteGridInteractiveProps) {
  if (palettes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-[16px]">No palettes found</p>
        <p className="text-[13px] mt-1">Try a different filter or create one!</p>
      </div>
    );
  }

  return (
    <div className="feed-grid">
      {palettes.map((palette) => (
        <PaletteCard
          key={palette.id}
          id={palette.id}
          slug={palette.slug}
          colors={palette.colors}
          likesCount={palette.likesCount}
          timeAgo={timeAgo(palette.createdAt)}
        />
      ))}
    </div>
  );
}
