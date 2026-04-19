"use client";

import { useState } from "react";
import { Code } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface PaletteExportProps {
  paletteId: string;
}

const FORMATS = [
  { key: "css", label: "CSS Variables" },
  { key: "scss", label: "SCSS Variables" },
  { key: "tailwind", label: "Tailwind Config" },
  { key: "json", label: "JSON" },
];

const btnClass =
  "inline-flex items-center justify-center h-[36px] w-[36px] rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer";

const itemClass =
  "w-full text-left px-4 py-3 text-[14px] text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors";

export function PaletteExport({ paletteId }: PaletteExportProps) {
  const [open, setOpen] = useState(false);

  const handleExport = (format: string) => {
    setOpen(false);
    const url = `/api/palettes/${paletteId}/export?format=${format}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.click();
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={btnClass}
        title="Export"
        aria-label="Export"
      >
        <Code className="h-[15px] w-[15px]" />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <div className="hidden md:block">
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl shadow-black/10 ring-1 ring-black/5 dark:ring-white/10 p-1.5">
            {FORMATS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleExport(f.key)}
                className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="md:hidden rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Export</SheetTitle>
          </SheetHeader>
          <div className="-mx-4">
            {FORMATS.map((f) => (
              <button key={f.key} onClick={() => handleExport(f.key)} className={itemClass}>
                {f.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
