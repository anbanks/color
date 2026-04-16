// Pure palette classifier — turns an array of hex colors into a set of
// color tags (Blue, Pink, Navy, …) and collection tags (Pastel, Warm, …).
// Used by:
//   - the creator (auto-suggest tags when colors change)
//   - the backfill script for existing palettes

export type HSL = { h: number; s: number; l: number };

export function hexToHsl(hex: string): HSL {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0;
  let sat = 0;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hue = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      default:
        hue = (r - g) / d + 4;
    }
    hue *= 60;
  }
  return { h: hue, s: sat * 100, l: l * 100 };
}

// Color centroids in HSL space. Hue dominates, S and L tune it.
const COLOR_CENTROIDS: { name: string; h: number; s: number; l: number }[] = [
  { name: "Red", h: 0, s: 75, l: 50 },
  { name: "Maroon", h: 0, s: 60, l: 28 },
  { name: "Orange", h: 28, s: 85, l: 55 },
  { name: "Peach", h: 18, s: 75, l: 80 },
  { name: "Brown", h: 25, s: 50, l: 32 },
  { name: "Beige", h: 38, s: 35, l: 82 },
  { name: "Yellow", h: 52, s: 85, l: 60 },
  { name: "Sage", h: 95, s: 22, l: 60 },
  { name: "Green", h: 120, s: 55, l: 42 },
  { name: "Mint", h: 150, s: 55, l: 78 },
  { name: "Teal", h: 175, s: 60, l: 45 },
  { name: "Blue", h: 210, s: 75, l: 55 },
  { name: "Navy", h: 220, s: 70, l: 25 },
  { name: "Purple", h: 280, s: 55, l: 50 },
  { name: "Pink", h: 335, s: 70, l: 78 },
];

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function classifyColor(hex: string): string {
  const { h, s, l } = hexToHsl(hex);

  // Neutrals first — these don't have a meaningful hue.
  if (l < 15) return "Black";
  if (l > 92 && s < 25) return "White";
  if (s < 12) return "Grey";

  // Find closest centroid in weighted HSL space.
  let bestName = COLOR_CENTROIDS[0].name;
  let bestDist = Infinity;
  for (const c of COLOR_CENTROIDS) {
    const dH = hueDistance(h, c.h) / 180;
    const dS = Math.abs(s - c.s) / 100;
    const dL = Math.abs(l - c.l) / 100;
    const d = dH * 2.8 + dS * 0.8 + dL * 1.4;
    if (d < bestDist) {
      bestDist = d;
      bestName = c.name;
    }
  }
  return bestName;
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function std(arr: number[]): number {
  if (!arr.length) return 0;
  const m = avg(arr);
  return Math.sqrt(avg(arr.map((x) => (x - m) ** 2)));
}

export interface ClassifyResult {
  colors: string[];
  tags: string[];
}

// Priority order for trimming the collection tag set — more specific/rare
// tags come first so they survive when we cap at maxCollectionTags.
const COLLECTION_PRIORITY = [
  "Gradient",
  "Rainbow",
  "Neon",
  "Sunset",
  "Sky",
  "Sea",
  "Gold",
  "Coffee",
  "Cream",
  "Nature",
  "Earth",
  "Pastel",
  "Vintage",
  "Dark",
  "Light",
  "Warm",
  "Cold",
  "Summer",
  "Fall",
  "Winter",
  "Spring",
];

export function classifyPalette(hexes: string[]): ClassifyResult {
  if (!hexes.length) return { colors: [], tags: [] };

  const hsls = hexes.map(hexToHsl);

  // 1. Color tags — one per distinct category that appears in the palette.
  const colorSet = new Set<string>();
  for (const hex of hexes) colorSet.add(classifyColor(hex));

  // 2. Collection tags — heuristic-driven aggregate features.
  const avgL = avg(hsls.map((x) => x.l));
  const avgS = avg(hsls.map((x) => x.s));
  const stdL = std(hsls.map((x) => x.l));
  const stdH = std(
    // Use a hue projection that wraps around the circle so reds near 0/360
    // don't blow up the deviation.
    hsls.map((x) => x.h)
  );

  const isWarm = (h: number) => h >= 315 || h <= 75;
  const isCold = (h: number) => h >= 165 && h <= 255;
  const isGreenish = (h: number) => h >= 75 && h <= 165;

  const chromatic = hsls.filter((x) => x.s >= 12 && x.l >= 15 && x.l <= 92);
  const warmRatio = chromatic.length
    ? chromatic.filter((x) => isWarm(x.h)).length / chromatic.length
    : 0;
  const coldRatio = chromatic.length
    ? chromatic.filter((x) => isCold(x.h)).length / chromatic.length
    : 0;
  const greenRatio = chromatic.length
    ? chromatic.filter((x) => isGreenish(x.h)).length / chromatic.length
    : 0;

  const tags = new Set<string>();

  // Light / Dark
  if (avgL < 32) tags.add("Dark");
  if (avgL > 78) tags.add("Light");

  // Pastel — bright but soft, low variation in lightness
  if (avgL >= 70 && avgS >= 15 && avgS <= 60 && stdL < 18) tags.add("Pastel");

  // Cream — very light AND desaturated
  if (avgL >= 82 && avgS <= 32) tags.add("Cream");

  // Neon — at least one very saturated color on a generally saturated palette
  if (
    avgS >= 70 &&
    avgL >= 42 &&
    avgL <= 78 &&
    hsls.some((x) => x.s >= 85 && x.l >= 40 && x.l <= 70)
  ) {
    tags.add("Neon");
  }

  // Warm / Cold
  if (warmRatio >= 0.6 && coldRatio < 0.3) tags.add("Warm");
  if (coldRatio >= 0.6 && warmRatio < 0.3) tags.add("Cold");

  // Vintage — desaturated mid-tones, not already Pastel
  if (avgS < 42 && avgL >= 36 && avgL <= 70 && !tags.has("Pastel")) {
    tags.add("Vintage");
  }

  // Nature — greens dominate, or greens + browns/oranges
  if (
    greenRatio >= 0.5 ||
    (greenRatio >= 0.25 &&
      hsls.some((x) => x.h >= 15 && x.h <= 45 && x.s >= 25 && x.l < 55))
  ) {
    tags.add("Nature");
  }

  // Earth — desaturated warm tones (browns, beiges, sage)
  const earthy = hsls.filter(
    (x) => x.h >= 15 && x.h <= 95 && x.s <= 55 && x.l <= 72
  ).length;
  if (earthy >= Math.ceil(hsls.length * 0.6)) tags.add("Earth");

  // Sky — most colors are light blues
  const skyLike = hsls.filter(
    (x) => x.h >= 185 && x.h <= 230 && x.l >= 60 && x.s >= 20
  ).length;
  if (skyLike >= Math.ceil(hsls.length * 0.6)) tags.add("Sky");

  // Sea — teal / deep blues
  const seaLike = hsls.filter(
    (x) => x.h >= 170 && x.h <= 225 && x.l >= 22 && x.l <= 60 && x.s >= 28
  ).length;
  if (!tags.has("Sky") && seaLike >= Math.ceil(hsls.length * 0.5)) {
    tags.add("Sea");
  }

  // Sunset — warm gradient (reds to oranges to pinks/purples)
  const sunsetLike = hsls.filter(
    (x) => (x.h >= 0 && x.h <= 55) || (x.h >= 290 && x.h <= 360)
  ).length;
  if (sunsetLike >= Math.ceil(hsls.length * 0.75) && avgS >= 40 && avgL >= 40) {
    tags.add("Sunset");
  }

  // Rainbow — high hue diversity across 60-degree buckets
  const uniqueHueBuckets = new Set(
    chromatic.map((x) => Math.floor(x.h / 60))
  );
  if (uniqueHueBuckets.size >= 4 && chromatic.length >= 4) {
    tags.add("Rainbow");
  }

  // Gradient — monochromatic with varying lightness
  if (
    chromatic.length === hsls.length &&
    stdH < 22 &&
    stdL > 14 &&
    uniqueHueBuckets.size <= 2
  ) {
    tags.add("Gradient");
  }

  // Gold — at least one gold-ish color
  if (
    hsls.some(
      (x) => x.h >= 38 && x.h <= 52 && x.s >= 55 && x.l >= 40 && x.l <= 65
    )
  ) {
    tags.add("Gold");
  }

  // Coffee — warm earth browns dominate
  const coffeeLike = hsls.filter(
    (x) => x.h >= 18 && x.h <= 42 && x.s >= 20 && x.s <= 60 && x.l >= 18 && x.l <= 55
  ).length;
  if (coffeeLike >= Math.ceil(hsls.length * 0.75)) tags.add("Coffee");

  // Seasons — mutually exclusive in practice; require clear warm/cold bias.
  if (
    warmRatio >= 0.55 &&
    coldRatio < 0.2 &&
    avgL >= 55 &&
    avgS >= 52 &&
    !tags.has("Pastel") &&
    !tags.has("Vintage")
  ) {
    tags.add("Summer");
  }
  if (
    warmRatio >= 0.55 &&
    coldRatio < 0.25 &&
    avgL >= 30 &&
    avgL <= 58 &&
    avgS >= 28 &&
    avgS <= 70
  ) {
    tags.add("Fall");
  }
  if (coldRatio >= 0.55 && warmRatio < 0.2 && avgL <= 58) tags.add("Winter");
  if (
    tags.has("Pastel") &&
    uniqueHueBuckets.size >= 2 &&
    (greenRatio >= 0.2 || warmRatio >= 0.3)
  ) {
    tags.add("Spring");
  }

  // Cap collection tags by priority (max 4 per palette, to keep signals clean)
  const sortedTags = COLLECTION_PRIORITY.filter((t) => tags.has(t)).slice(0, 4);

  return {
    colors: Array.from(colorSet),
    tags: sortedTags,
  };
}
