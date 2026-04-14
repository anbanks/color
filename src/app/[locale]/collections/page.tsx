"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { Suspense } from "react";

interface Collection {
  id: string;
  name: string;
  count: number;
}

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const { locale, t } = useLocale();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => setCollections(data as Collection[]))
      .catch(() => {});
  }, []);

  const openCollection = (col: Collection) => {
    setSelected(col.id);
    setSelectedName(col.name);
    fetch(`/api/collections/${col.id}`)
      .then((r) => r.json())
      .then((data) => setPalettes((data as { palettes: Palette[] }).palettes))
      .catch(() => {});
  };

  const deleteCollection = (colId: string) => {
    startTransition(async () => {
      try {
        await fetch(`/api/collections/${colId}`, { method: "DELETE" });
        setCollections(collections.filter((c) => c.id !== colId));
        toast.success(t.collections.deleted);
        if (selected === colId) {
          setSelected(null);
          setPalettes([]);
        }
      } catch {
        toast.error("Failed to delete");
      }
    });
  };

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
        <main className="flex-1 min-w-0 px-5 pt-[6px] pb-8 box-border">
          <h1 className="text-[17px] font-semibold text-gray-800 dark:text-white mb-6">{t.collections.title}</h1>

        {selected ? (
          <div>
            <button
              onClick={() => { setSelected(null); setPalettes([]); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-white/70 mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.collections.backToCollections}
            </button>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white/80 mb-6">{selectedName}</h2>
            <PaletteGrid palettes={palettes} />
          </div>
        ) : (
          <div>
            {collections.length === 0 ? (
              <div className="text-center py-20 text-gray-400 dark:text-white/40">
                <p className="text-lg">{t.collections.empty}</p>
                <p className="text-sm mt-1">
                  {t.collections.emptyHint}
                </p>
                <Link href={`/${locale}`}>
                  <Button variant="outline" className="mt-4">{t.collections.browse}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((col) => (
                  <div
                    key={col.id}
                    className="border border-gray-100 dark:border-white/10 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer group"
                  >
                    <div onClick={() => openCollection(col)} className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-white">{col.name}</h3>
                      <p className="text-sm text-gray-400 dark:text-white/40 mt-1">
                        {col.count} {t.menu.palettes.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(col.id);
                        }}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
