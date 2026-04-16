"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { classifyPalette } from "@/lib/classify-palette";

const SUGGESTION_COLORS = [
  "Blue", "Teal", "Mint", "Green", "Sage", "Yellow", "Beige", "Brown",
  "Orange", "Peach", "Red", "Maroon", "Pink", "Purple", "Navy", "Black",
  "Grey", "White",
];

const SUGGESTION_COLLECTIONS = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Gradient",
  "Sunset", "Sky", "Sea", "Kids", "Skin", "Food", "Cream",
  "Coffee", "Wedding", "Christmas", "Halloween",
];

const ALL_SUGGESTIONS = [...SUGGESTION_COLORS, ...SUGGESTION_COLLECTIONS];
const MAX_TAGS = 5;

const DEFAULT_COLORS = ["#c0c0c0", "#b8b8b8", "#d0d0d0", "#d8d8d8"];

export function PaletteCreator() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Tags the user explicitly dismissed — we won't re-suggest these even if
  // the color set still implies them.
  const dismissed = useRef<Set<string>>(new Set());
  // Tags that were added automatically (vs manually). Used so we can strip
  // them out when colors change, instead of the user having to prune.
  const autoTags = useRef<Set<string>>(new Set());
  const touched = useRef(false);

  const updateColor = (index: number, value: string) => {
    touched.current = true;
    const next = [...colors];
    next[index] = value;
    setColors(next);
  };

  // Recompute suggestions whenever the color set changes. Merge into the
  // current tags, preserving the user's manual additions and removals.
  useEffect(() => {
    if (!touched.current) return;
    const { colors: colorTags, tags: collectionTags } = classifyPalette(colors);
    const suggested = [...colorTags, ...collectionTags].filter(
      (tag) => !dismissed.current.has(tag)
    );
    setTags((prev) => {
      const manual = prev.filter((t) => !autoTags.current.has(t));
      const nextAuto = new Set<string>();
      const merged: string[] = [];
      for (const tag of manual) merged.push(tag);
      for (const tag of suggested) {
        if (merged.length >= MAX_TAGS) break;
        if (!merged.includes(tag)) {
          merged.push(tag);
          nextAuto.add(tag);
        }
      }
      autoTags.current = nextAuto;
      return merged;
    });
  }, [colors]);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= MAX_TAGS) {
      toast.error(`Max ${MAX_TAGS} tags`);
      return;
    }
    // Manual addition clears any prior dismissal, and stops the tag from
    // being counted as "auto" so future color changes won't yank it.
    dismissed.current.delete(tag);
    autoTags.current.delete(tag);
    setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    dismissed.current.add(tag);
    autoTags.current.delete(tag);
    setTags(tags.filter((t) => t !== tag));
  };

  const filteredSuggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    const pool = ALL_SUGGESTIONS.filter((s) => !tags.includes(s));
    if (!q) return pool.slice(0, 12);
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
  }, [tagInput, tags]);

  const handleSubmit = () => {
    startTransition(async () => {
      try {
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

      {/* Tags */}
      <div className="max-w-lg mx-auto mt-6 text-left">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] w-full pl-10 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 focus-within:border-gray-300 dark:focus-within:border-white/25 transition-colors">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-[3px] rounded-full text-[12px] font-medium bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white/85 border border-gray-200 dark:border-white/15"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={tags.length === 0 ? t.creator.addTags : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                  removeTag(tags[tags.length - 1]);
                }
              }}
              className="flex-1 min-w-[120px] h-7 text-sm bg-transparent placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none text-gray-800 dark:text-white/90"
            />
          </div>
        </div>

        {/* Suggestions */}
        {focused && filteredSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                }}
                className={cn(
                  "px-3 py-[5px] text-[12px] border rounded-full transition-all cursor-pointer",
                  "border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/60",
                  "hover:border-gray-300 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-6 px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {isPending ? t.creator.submitting : t.creator.submit}
      </button>
    </div>
  );
}
