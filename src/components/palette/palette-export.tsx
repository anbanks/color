"use client";

import { useState } from "react";
import { Code } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface PaletteExportProps {
  paletteId: string;
}

const FORMATS = [
  { key: "css", label: "CSS Variables" },
  { key: "scss", label: "SCSS Variables" },
  { key: "tailwind", label: "Tailwind Config" },
  { key: "json", label: "JSON" },
];

const triggerClass =
  "inline-flex items-center justify-center h-[36px] w-[36px] rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer";

const dropdownItemClass =
  "w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors";

const drawerItemClass =
  "w-full text-left px-6 py-3.5 text-[15px] text-gray-800 dark:text-white/85 active:bg-gray-100 dark:active:bg-white/10 transition-colors cursor-pointer border-b border-gray-100 dark:border-white/[0.06] last:border-0";

export function PaletteExport({ paletteId }: PaletteExportProps) {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleExport = (format: string) => {
    setOpen(false);
    setDrawerOpen(false);
    const url = `/api/palettes/${paletteId}/export?format=${format}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.click();
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const handleClick = () => {
    if (window.innerWidth < 768) {
      setDrawerOpen(true);
    } else {
      setOpen(!open);
    }
  };

  return (
    <div className="relative">
      <button onClick={handleClick} className={triggerClass} title="Export" aria-label="Export">
        <Code className="h-[15px] w-[15px]" />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl shadow-black/10 ring-1 ring-black/5 dark:ring-white/10 p-1.5">
            {FORMATS.map((f) => (
              <button key={f.key} onClick={() => handleExport(f.key)} className={dropdownItemClass}>
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Mobile drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Export</DrawerTitle>
          </DrawerHeader>
          <div className="pb-[env(safe-area-inset-bottom)]">
            {FORMATS.map((f) => (
              <button key={f.key} onClick={() => handleExport(f.key)} className={drawerItemClass}>
                {f.label}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
