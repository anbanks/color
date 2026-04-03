"use client";

import { useState, useEffect, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  count: number;
}

interface SaveButtonProps {
  paletteId: string;
}

export function SaveButton({ paletteId }: SaveButtonProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

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

        toast.success(`Saved to "${col.name}"`);
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
        toast.success(`Saved to "${colName}"`);
        setOpen(false);
      } catch {
        toast.error("Failed to save");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <Bookmark className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => addToCollection(col.id, col.name)}
              disabled={isPending}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                "hover:bg-gray-50 text-gray-700"
              )}
            >
              {col.name}
              <span className="text-gray-400 ml-1">({col.count})</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New collection name"
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
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
