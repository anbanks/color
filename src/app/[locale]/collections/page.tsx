"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { PaletteCard } from "@/components/palette/palette-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { Suspense } from "react";

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
}

export default function CollectionsPage() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale, t } = useLocale();

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((data) => {
        setPalettes((data as { palettes: Palette[] }).palettes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <div className="flex">
        <div className="min-w-[200px] shrink-0 hidden md:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)] overflow-y-auto scrollbar-hide">
            <Suspense>
              <Sidebar />
            </Suspense>
          </div>
        </div>
        <main className="flex-1 min-w-0 pt-[6px] pb-8 box-border">
          <h1 className="text-[17px] font-semibold text-gray-800 dark:text-white px-5 mb-3">
            {t.collections.title}
          </h1>
          {!loading && palettes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 dark:text-white/40">
              <p className="text-lg">{t.collections.empty}</p>
              <p className="text-sm mt-1">{t.collections.emptyHint}</p>
              <Link href={`/${locale}`}>
                <Button variant="outline" className="mt-4">
                  {t.collections.browse}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="feed-grid">
              {palettes.map((p) => (
                <PaletteCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  colors={p.colors}
                  likesCount={p.likesCount}
                  initialSaved={true}
                />
              ))}
            </div>
          )}
        </main>
        <div className="min-w-[340px] max-w-[340px] shrink-0 hidden xl:block px-5 box-border">
          <div className="sticky top-[70px] h-[calc(100vh-90px)]">
            <Suspense>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
