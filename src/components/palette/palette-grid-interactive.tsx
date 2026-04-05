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
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when initial palettes change (route change)
  useEffect(() => {
    setPalettes(initialPalettes);
    setCursor(null);
    setHasMore(true);
    setInitialized(false);
  }, [initialPalettes]);

  // Get initial cursor from SSR data
  useEffect(() => {
    if (!initialized && initialPalettes.length > 0) {
      const last = initialPalettes[initialPalettes.length - 1];
      if (sort === "popular") {
        setCursor(String(last.likesCount));
      } else if (sort !== "random" && last.createdAt) {
        setCursor(String(Math.floor(new Date(last.createdAt).getTime() / 1000)));
      }
      setInitialized(true);
    }
  }, [initialPalettes, sort, initialized]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor || sort === "random") return;
    setLoading(true);

    try {
      const res = await fetch(`/api/palettes?sort=${sort}&cursor=${cursor}`);
      const data = (await res.json()) as {
        palettes: Palette[];
        nextCursor: string | null;
        hasMore: boolean;
      };

      setPalettes((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPalettes = data.palettes.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPalettes];
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursor, sort]);

  // Intersection Observer — trigger loadMore when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "600px" } // Start loading 600px before reaching bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (palettes.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-[16px]">No palettes found</p>
        <p className="text-[13px] mt-1">Try a different filter or create one!</p>
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

        {/* Skeleton loading */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <PaletteSkeleton key={`sk-${i}`} />
          ))}
      </div>

      {/* Sentinel — Intersection Observer trigger */}
      {hasMore && sort !== "random" && (
        <div ref={sentinelRef} className="h-[1px] w-full" />
      )}
    </>
  );
}
