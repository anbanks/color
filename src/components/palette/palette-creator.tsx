"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";
import { Search } from "lucide-react";

export function PaletteCreator() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [colors, setColors] = useState<string[]>([
    "#c0c0c0", "#b8b8b8", "#d0d0d0", "#d8d8d8",
  ]);
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateColor = (index: number, value: string) => {
    const next = [...colors];
    next[index] = value;
    setColors(next);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
        const res = await fetch("/api/palettes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colors, tags }),
        });

        if (res.ok) {
          toast.success("Palette submitted!");
          router.push(`/${locale}`);
        } else {
          const data = (await res.json()) as { error?: string };
          toast.error(data.error || "Failed to create");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{t.creator.title}</h1>
      <p className="text-sm text-gray-400 dark:text-white/40 mt-1 mb-8">
        {t.creator.subtitle}
      </p>

      {/* Color strips */}
      <div className="rounded-xl overflow-hidden shadow-sm mx-auto max-w-lg">
        {colors.map((color, i) => (
          <div
            key={i}
            className="h-[90px] relative cursor-pointer"
            style={{ backgroundColor: color }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => updateColor(i, e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Tags input */}
      <div className="relative max-w-lg mx-auto mt-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t.creator.addTags}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-6 px-8 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending ? t.creator.submitting : t.creator.submit}
      </button>
    </div>
  );
}
