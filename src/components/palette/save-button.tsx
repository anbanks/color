"use client";

import { useState, useEffect, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

interface Collection {
  id: string;
  name: string;
  count: number;
}

interface SaveButtonProps {
  paletteId: string;
  variant?: "compact" | "full";
}

export function SaveButton({ paletteId, variant = "compact" }: SaveButtonProps) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  useEffect(() => {
    if (open) {
      fetch("/api/collections")
        .then((r) => r.json())
        .then((data) => setCollections(data as Collection[]))
        .catch(() => {});
    }
  }, [open]);

  const createAndAdd = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim() }),
        });
        const col = (await res.json()) as { id: string; name: string };

        await fetch(`/api/collections/${col.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", paletteId }),
        });

        toast.success(`${t.collections.saveToCollection}: ${col.name}`);
        setSaved(true);
        setNewName("");
        setOpen(false);
      } catch {
        toast.error("Failed to save");
      }
    });
  };

  const addToCollection = (colId: string, colName: string) => {
    startTransition(async () => {
      try {
        await fetch(`/api/collections/${colId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", paletteId }),
        });
        toast.success(`${t.collections.saveToCollection}: ${colName}`);
        setSaved(true);
        setOpen(false);
      } catch {
        toast.error("Failed to save");
      }
    });
  };

  const openDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={openDialog}
        className={cn(
          "inline-flex items-center justify-center h-[38px] rounded-[10px] border text-[14px] cursor-pointer transition-all duration-200 select-none shrink-0",
          variant === "full" ? "px-[14px] gap-[6px]" : "w-[38px]",
          saved
            ? "border-transparent text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
            : "border-[#ececec] dark:border-white/15 text-black/90 dark:text-white/80 hover:text-black dark:hover:text-white"
        )}
        title={t.collections.saveToCollection}
      >
        <Bookmark
          className={cn("h-[16px] w-[16px]", saved && "fill-current")}
          strokeWidth={saved ? 2 : 1.5}
        />
        {variant === "full" && <span>{t.collections.saveToCollection}</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.collections.saveToCollection}</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5 mt-2">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => addToCollection(col.id, col.name)}
                disabled={isPending}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white/80"
              >
                {col.name}
                <span className="text-gray-400 dark:text-white/40 ml-1">({col.count})</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.collections.newCollection}
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createAndAdd();
                }
              }}
            />
            <Button
              size="sm"
              onClick={createAndAdd}
              disabled={isPending || !newName.trim()}
            >
              {t.collections.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
