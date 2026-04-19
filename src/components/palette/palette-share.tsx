"use client";

import { useState } from "react";
import { Share2, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface PaletteShareProps {
  slug: string;
}

const btnClass =
  "inline-flex items-center justify-center h-[36px] w-[36px] rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer";

const itemClass =
  "w-full flex items-center gap-3 text-left px-4 py-3 text-[14px] text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors";

export function PaletteShare({ slug }: PaletteShareProps) {
  const [open, setOpen] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : `https://colorgrid.co/en/palette/${slug}`;

  const options = [
    {
      label: "Copy link",
      icon: Link2,
      action: () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      },
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      action: () =>
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank"),
    },
    {
      label: "X (Twitter)",
      icon: () => <span className="text-[14px] font-bold w-4 text-center">𝕏</span>,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this color palette")}`,
          "_blank"
        ),
    },
    {
      label: "Pinterest",
      icon: () => <span className="text-[14px] font-bold w-4 text-center">P</span>,
      action: () =>
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
          "_blank"
        ),
    },
  ];

  const renderOptions = () =>
    options.map((opt) => {
      const Icon = opt.icon;
      return (
        <button
          key={opt.label}
          onClick={() => {
            opt.action();
            setOpen(false);
          }}
          className={itemClass}
        >
          <Icon className="h-4 w-4" />
          {opt.label}
        </button>
      );
    });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={btnClass}
        title="Share"
        aria-label="Share"
      >
        <Share2 className="h-[15px] w-[15px]" />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <div className="hidden md:block">
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl shadow-black/10 ring-1 ring-black/5 dark:ring-white/10 p-1.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.label}
                  onClick={() => {
                    opt.action();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13px] text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="md:hidden rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Share</SheetTitle>
          </SheetHeader>
          <div className="-mx-4">{renderOptions()}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
