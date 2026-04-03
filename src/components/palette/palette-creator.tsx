"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaletteCard } from "./palette-card";
import { toast } from "sonner";
import { Shuffle } from "lucide-react";

const SUGGESTED_TAGS = [
  "warm", "cool", "pastel", "vibrant", "dark", "earth",
  "sunset", "ocean", "forest", "neon", "minimal", "retro",
];

function randomHex(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

export function PaletteCreator() {
  const router = useRouter();
  const [colors, setColors] = useState<string[]>([
    randomHex(), randomHex(), randomHex(), randomHex(),
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateColor = (index: number, value: string) => {
    const next = [...colors];
    next[index] = value;
    setColors(next);
  };

  const randomize = () => {
    setColors([randomHex(), randomHex(), randomHex(), randomHex()]);
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    const validHex = /^#[0-9a-fA-F]{6}$/;
    if (colors.some((c) => !validHex.test(c))) {
      toast.error("All colors must be valid HEX codes");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/palettes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colors, tags }),
        });

        if (res.ok) {
          toast.success("Palette submitted for moderation!");
          router.push("/");
        } else {
          const data = (await res.json()) as { error?: string };
          toast.error(data.error || "Failed to create palette");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Preview */}
      <div className="pointer-events-none">
        <PaletteCard
          id="preview"
          slug="preview"
          colors={colors}
          likesCount={0}
        />
      </div>

      {/* Color pickers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Colors</h3>
          <Button variant="ghost" size="sm" onClick={randomize}>
            <Shuffle className="h-4 w-4 mr-1.5" />
            Randomize
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {colors.map((color, i) => (
            <div key={i} className="space-y-2">
              <div
                className="h-20 rounded-lg cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <Input
                value={color.toUpperCase()}
                onChange={(e) => updateColor(i, e.target.value)}
                className="font-mono text-xs text-center h-8"
                maxLength={7}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">
          Tags <span className="text-gray-400 font-normal">({tags.length}/5)</span>
        </h3>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                {tag} ×
              </button>
            ))}
          </div>
        )}

        {/* Tag input */}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(tagInput);
            }
          }}
          placeholder="Type a tag and press Enter"
          className="h-9 text-sm"
          disabled={tags.length >= 5}
        />

        {/* Suggested tags */}
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="px-2 py-0.5 text-xs rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
              disabled={tags.length >= 5}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full"
        size="lg"
      >
        {isPending ? "Submitting..." : "Submit Palette"}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Your palette will be reviewed before publishing.
      </p>
    </div>
  );
}
