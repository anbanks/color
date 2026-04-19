"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

export function PaletteEditModal({ palette, onClose }: PaletteEditModalProps) {
  const [colors, setColors] = useState<string[]>([...palette.colors]);
  const [status, setStatus] = useState(palette.status);
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const { locale, t } = useLocale();

  const updateColor = (index: number, value: string) => {
    const next = [...colors];
    next[index] = value;
    setColors(next);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Update status
        if (status !== palette.status) {
          await fetch(`/api/palettes/${palette.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: status === "published" ? "approved" : status }),
          });
        }
        toast.success(t.admin.published ? "Saved" : "Saved");
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

  const statusLabels: Record<string, string> = {
    pending: t.admin.pending,
    published: t.admin.published,
    rejected: t.admin.rejected,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden border border-gray-200/60 dark:border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-white">
            {t.admin.table.palette}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
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
                  style={{ backgroundColor: color, height: heights[i] ? `${parseInt(heights[i]) * 2.5}px` : "40px" }}
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
            <label className="block text-[13px] font-medium text-gray-700 dark:text-white/60 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-medium transition-all border",
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

          {/* Info */}
          <div className="flex items-center justify-between text-[12px] text-gray-400 dark:text-white/30">
            <span>ID: {palette.id}</span>
            <span>{t.admin.table.likes}: {palette.likesCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
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
            className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-white/10 text-white text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            {locale === "pt" ? "Salvar" : locale === "es" ? "Guardar" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

