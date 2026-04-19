"use client";

import { useState } from "react";
import { Code, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaletteExportProps {
  paletteId: string;
}

const FORMATS = [
  { key: "css", label: "CSS Variables" },
  { key: "scss", label: "SCSS Variables" },
  { key: "tailwind", label: "Tailwind Config" },
  { key: "json", label: "JSON" },
];

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
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center h-[36px] w-[36px] rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer"
        title="Export"
        aria-label="Export"
      >
        <Code className="h-[15px] w-[15px]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl shadow-black/10 ring-1 ring-black/5 dark:ring-white/10 p-1.5">
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
        </>
      )}
    </div>
  );
}
