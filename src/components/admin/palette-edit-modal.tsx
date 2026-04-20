"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface PaletteEditModalProps {
  palette: {
    id: string;
    slug: string;
    colors: string[];
    status: string;
    likesCount: number;
  };
  onClose: () => void;
}

const statuses = ["pending", "published", "rejected"] as const;

interface SeoContent {
  title: string;
  description: string;
  applications: string;
  psychology: string;
}

export function PaletteEditModal({ palette, onClose }: PaletteEditModalProps) {
  const [colors, setColors] = useState<string[]>([...palette.colors]);
  const [status, setStatus] = useState(palette.status);
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [seoByLocale, setSeoByLocale] = useState<Record<string, SeoContent | null>>({});
  const [seoLocale, setSeoLocale] = useState("en");
  const [seoLoading, setSeoLoading] = useState(true);
  const router = useRouter();
  const { t } = useLocale();

  const seo = seoByLocale[seoLocale] ?? null;
  const setSeo = (val: SeoContent | null) => {
    setSeoByLocale((prev) => ({ ...prev, [seoLocale]: val }));
  };

  const LOCALES = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"] as const;

  // Load all locale content on mount
  useEffect(() => {
    const load = async () => {
      const result: Record<string, SeoContent | null> = {};
      await Promise.all(
        LOCALES.map(async (loc) => {
          try {
            const res = await fetch(`/api/admin/palette-content?id=${palette.id}&locale=${loc}`);
            const data = (await res.json()) as { content?: SeoContent };
            result[loc] = data.content || null;
          } catch {
            result[loc] = null;
          }
        })
      );
      setSeoByLocale(result);
      setSeoLoading(false);
    };
    load();
  }, [palette.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateColor = (index: number, value: string) => {
    const next = [...colors];
    next[index] = value;
    setColors(next);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        if (status !== palette.status) {
          await fetch(`/api/palettes/${palette.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: status === "published" ? "approved" : status }),
          });
        }
        // Save SEO content for all edited locales
        for (const loc of LOCALES) {
          const content = seoByLocale[loc];
          if (content) {
            await fetch("/api/admin/palette-content", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paletteId: palette.id, locale: loc, ...content }),
            });
          }
        }
        toast.success("Saved");
        router.refresh();
        onClose();
      } catch {
        toast.error("Error");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await fetch(`/api/palettes/${palette.id}`, { method: "DELETE" });
        toast.success("Deleted");
        router.refresh();
        onClose();
      } catch {
        toast.error("Error");
      }
    });
  };

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/generate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paletteId: palette.id }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; sample?: string };
        if (data.ok) {
          toast.success(`AI content generated: "${data.sample}"`);
          // Reload all locales
          const result: Record<string, SeoContent | null> = {};
          await Promise.all(
            LOCALES.map(async (loc) => {
              try {
                const r2 = await fetch(`/api/admin/palette-content?id=${palette.id}&locale=${loc}`);
                const d2 = (await r2.json()) as { content?: SeoContent };
                result[loc] = d2.content || null;
              } catch { result[loc] = null; }
            })
          );
          setSeoByLocale(result);
        } else {
          toast.error(data.error || "Failed");
        }
      } catch {
        toast.error("Failed");
      }
    });
  };

  const statusLabels: Record<string, string> = {
    pending: t.admin.pending,
    published: t.admin.published,
    rejected: t.admin.rejected,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto border border-gray-200/60 dark:border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-white">
            {t.admin.table.palette}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Colors */}
          <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.06]">
            {colors.map((color, i) => {
              const heights = ["41%", "26%", "18%", "15%"];
              return (
                <div
                  key={i}
                  className="relative cursor-pointer"
                  style={{ backgroundColor: color, height: heights[i] ? `${parseInt(heights[i]) * 2}px` : "30px" }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(i, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="absolute bottom-1 left-2 text-[11px] font-mono text-white/60 pointer-events-none">
                    {color.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-medium transition-all border cursor-pointer",
                    status === s
                      ? s === "published"
                        ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400"
                        : s === "pending"
                        ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                      : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}
                >
                  {statusLabels[s] || s}
                </button>
              ))}
            </div>
          </div>

          {/* SEO Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35">
                SEO Content
              </label>
              <button
                onClick={handleGenerate}
                disabled={isPending}
                className="text-[12px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Generating..." : "✨ Generate AI"}
              </button>
            </div>

            <div className="flex gap-1 mb-3 flex-wrap">
              {LOCALES.map((loc) => {
                const has = !!seoByLocale[loc];
                return (
                  <button
                    key={loc}
                    onClick={() => setSeoLocale(loc)}
                    className={cn(
                      "px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors",
                      seoLocale === loc
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : has
                        ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/15"
                        : "text-gray-400 dark:text-white/25 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    {loc.toUpperCase()}
                    {has && <span className="ml-0.5 text-green-500">•</span>}
                  </button>
                );
              })}
            </div>

            {seoLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : seo ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 dark:text-white/35">Title</label>
                  <input
                    type="text"
                    value={seo.title}
                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                    className="w-full h-9 px-3 mt-0.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 focus:outline-none focus:border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 dark:text-white/35">Description</label>
                  <textarea
                    value={seo.description}
                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 mt-0.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 focus:outline-none focus:border-gray-300 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 dark:text-white/35">Applications</label>
                  <textarea
                    value={seo.applications}
                    onChange={(e) => setSeo({ ...seo, applications: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 mt-0.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 focus:outline-none focus:border-gray-300 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 dark:text-white/35">Psychology</label>
                  <textarea
                    value={seo.psychology}
                    onChange={(e) => setSeo({ ...seo, psychology: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 mt-0.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 focus:outline-none focus:border-gray-300 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-[13px] text-gray-400 dark:text-white/30 border border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                No content yet — click &quot;✨ Generate AI&quot; to create
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-[12px] text-gray-400 dark:text-white/30">
            <span>ID: {palette.id}</span>
            <span>{t.admin.table.likes}: {palette.likesCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] sticky bottom-0 bg-white dark:bg-[#1e1e1e]">
          <button
            onClick={() => setDeleteOpen(true)}
            disabled={isPending}
            className="text-[14px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {locale === "pt" ? "Excluir" : locale === "es" ? "Eliminar" : "Delete"}
          </button>
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete palette"
            description="This palette will be permanently deleted. This action cannot be undone."
            confirmLabel="Delete"
            destructive
            onConfirm={handleDelete}
          />
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-white/10 text-white text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-white/15 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving..." : locale === "pt" ? "Salvar" : locale === "es" ? "Guardar" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
