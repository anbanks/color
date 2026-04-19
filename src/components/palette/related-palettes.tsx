"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaletteCard } from "./palette-card";
import { useLocale } from "@/lib/locale-context";

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
}

interface RelatedPalettesProps {
  initial: Palette[];
  excludeId: string;
}

export function RelatedPalettes({ initial, excludeId }: RelatedPalettesProps) {
  const { t } = useLocale();
  const [palettes, setPalettes] = useState<Palette[]>(initial);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/palettes?sort=random&limit=12&exclude=${excludeId}`
      );
      if (!res.ok) { setHasMore(false); return; }
      const data = (await res.json()) as {
        palettes: { id: string; slug: string; colors: string[]; likesCount: number }[];
      };
      if (!data.palettes?.length) { setHasMore(false); return; }
      setPalettes((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const fresh = data.palettes.filter((p) => !ids.has(p.id));
        return [...prev, ...fresh];
      });
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, excludeId]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (!palettes.length) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-white px-5 mb-3">
        {t.single.relatedPalettes}
      </h2>
      <div className="feed-grid">
        {palettes.map((p) => (
          <PaletteCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            colors={p.colors}
            likesCount={p.likesCount}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinel} className="h-10 flex items-center justify-center">
          {loading && (
            <div className="h-5 w-5 border-2 border-gray-300 dark:border-white/20 border-t-gray-600 dark:border-t-white/60 rounded-full animate-spin" />
          )}
        </div>
      )}
    </section>
  );
}
