"use client";

import { PaletteCard } from "./palette-card";
import { PaletteSkeleton } from "./palette-skeleton";
import { useState, useEffect, useRef, useCallback } from "react";

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
  createdAt?: string;
}

interface PaletteGridInteractiveProps {
  palettes: Palette[];
  sort?: string;
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

export function PaletteGridInteractive({ palettes: initialPalettes, sort = "new" }: PaletteGridInteractiveProps) {
  const [palettes, setPalettes] = useState<Palette[]>(initialPalettes);
  const [page, setPage] = useState(1); // Page 0 is SSR
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset on route change
  useEffect(() => {
    setPalettes(initialPalettes);
    setPage(1);
    setHasMore(initialPalettes.length >= 24);
    setLoading(false);
  }, [initialPalettes]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || sort === "random") return;
    setLoading(true);

    try {
      const res = await fetch(`/api/palettes?sort=${sort}&page=${page}`);
      const data = (await res.json()) as {
        palettes: Palette[];
        hasMore: boolean;
      };

      if (data.palettes.length > 0) {
        setPalettes((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const fresh = data.palettes.filter((p) => !ids.has(p.id));
          return [...prev, ...fresh];
        });
        setPage((p) => p + 1);
      }
      setHasMore(data.hasMore);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, sort, page]);

  // Intersection Observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "800px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (palettes.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="flex gap-2 mb-6">
          {["#E8E8E8", "#D4D4D4", "#C0C0C0", "#ACACAC"].map((c, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full dark:opacity-20"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <p className="text-[17px] font-medium text-gray-400 dark:text-white/25">
          No palettes found
        </p>
        <p className="text-[13px] text-gray-300 dark:text-white/15 mt-1">
          Try a different filter or create your own
        </p>
      </div>
    );
  }

  return (
    <>
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
        {loading && Array.from({ length: 4 }).map((_, i) => <PaletteSkeleton key={`sk${i}`} />)}
      </div>
      {hasMore && sort !== "random" && <div ref={sentinelRef} className="h-px" />}
    </>
  );
}
