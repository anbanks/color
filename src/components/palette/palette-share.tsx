"use client";

import { useState } from "react";
import { Share2, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface PaletteShareProps {
  slug: string;
}

const triggerClass =
  "inline-flex items-center justify-center h-[36px] w-[36px] rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer";

const dropdownItemClass =
  "w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13px] text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors";

const drawerItemClass =
  "w-full flex items-center gap-4 text-left px-6 py-3.5 text-[15px] text-gray-800 dark:text-white/85 active:bg-gray-100 dark:active:bg-white/10 transition-colors cursor-pointer border-b border-gray-100 dark:border-white/[0.06] last:border-0";

export function PaletteShare({ slug }: PaletteShareProps) {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : `https://colorgrid.co/en/palette/${slug}`;

  const options = [
    {
      label: "Copy link",
      icon: <Link2 className="h-4 w-4" />,
      action: () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      },
    },
    {
      label: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      action: () =>
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank"),
    },
    {
      label: "X (Twitter)",
      icon: <span className="text-[13px] font-bold w-4 text-center">𝕏</span>,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this color palette")}`,
          "_blank"
        ),
    },
    {
      label: "Pinterest",
      icon: <span className="text-[13px] font-bold w-4 text-center">P</span>,
      action: () =>
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
          "_blank"
        ),
    },
  ];

  const handleClick = () => {
    if (window.innerWidth < 768) {
      setDrawerOpen(true);
    } else {
      setOpen(!open);
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
    setDrawerOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={handleClick} className={triggerClass} title="Share" aria-label="Share">
        <Share2 className="h-[15px] w-[15px]" />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl shadow-black/10 ring-1 ring-black/5 dark:ring-white/10 p-1.5">
            {options.map((opt) => (
              <button key={opt.label} onClick={() => handleAction(opt.action)} className={dropdownItemClass}>
                <span className="w-4 h-4 flex items-center justify-center shrink-0">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Mobile drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Share</DrawerTitle>
          </DrawerHeader>
          <div className="pb-[env(safe-area-inset-bottom)]">
            {options.map((opt) => (
              <button key={opt.label} onClick={() => handleAction(opt.action)} className={drawerItemClass}>
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
