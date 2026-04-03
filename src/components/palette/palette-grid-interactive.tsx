"use client";

import { useState } from "react";
import { PaletteCard } from "./palette-card";
import { PaletteExpanded } from "./palette-expanded";

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
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week";
  return `${weeks} weeks`;
}

export function PaletteGridInteractive({ palettes }: PaletteGridInteractiveProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (palettes.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No palettes yet</p>
        <p className="text-sm mt-1">Be the first to create one!</p>
      </div>
    );
  }

  const expanded = expandedId ? palettes.find((p) => p.id === expandedId) : null;

  if (expanded) {
    return (
      <PaletteExpanded
        palette={expanded}
        onClose={() => setExpandedId(null)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
      {palettes.map((palette) => (
        <PaletteCard
          key={palette.id}
          id={palette.id}
          slug={palette.slug}
          colors={palette.colors}
          likesCount={palette.likesCount}
          timeAgo={timeAgo(palette.createdAt)}
          onExpand={setExpandedId}
        />
      ))}
    </div>
  );
}
