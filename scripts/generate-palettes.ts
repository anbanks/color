// Generates ~2000 original color palettes using color theory algorithms.
// Each palette is auto-tagged by the classifier and inserted into D1
// with status "approved" so the publish cron releases them gradually.
//
// Usage: npx tsx scripts/generate-palettes.ts [--apply]

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { classifyPalette } from "../src/lib/classify-palette";
import { createId } from "@paralleldrive/cuid2";

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

const palettes: string[][] = [];
const seen = new Set<string>();

function add(colors: string[]) {
  const key = colors.map(c => c.toUpperCase()).sort().join(",");
  if (seen.has(key)) return;
  seen.add(key);
  palettes.push(colors);
}

// 1. Complementary (2 hues 180° apart, 4 shades)
for (let i = 0; i < 200; i++) {
  const h1 = rand(0, 360);
  const h2 = (h1 + 180) % 360;
  const s = rand(40, 90);
  add([
    hslToHex(h1, s, rand(35, 55)),
    hslToHex(h1, s, rand(60, 80)),
    hslToHex(h2, s, rand(35, 55)),
    hslToHex(h2, s, rand(60, 80)),
  ]);
}

// 2. Analogous (hues 30° apart)
for (let i = 0; i < 200; i++) {
  const h = rand(0, 360);
  const s = rand(35, 85);
  add([
    hslToHex(h - 30, s, rand(40, 65)),
    hslToHex(h, s, rand(40, 65)),
    hslToHex(h + 30, s, rand(40, 65)),
    hslToHex(h + 60, s, rand(50, 75)),
  ]);
}

// 3. Triadic (120° apart)
for (let i = 0; i < 150; i++) {
  const h = rand(0, 360);
  const s = rand(45, 85);
  const l = rand(40, 65);
  add([
    hslToHex(h, s, l),
    hslToHex(h + 120, s, l + rand(-10, 10)),
    hslToHex(h + 240, s, l + rand(-10, 10)),
    hslToHex(h, s * 0.5, rand(80, 92)),
  ]);
}

// 4. Monochromatic (same hue, varying L)
for (let i = 0; i < 150; i++) {
  const h = rand(0, 360);
  const s = rand(30, 80);
  add([
    hslToHex(h, s, rand(20, 30)),
    hslToHex(h, s, rand(40, 50)),
    hslToHex(h, s, rand(60, 70)),
    hslToHex(h, s, rand(80, 90)),
  ]);
}

// 5. Split-complementary
for (let i = 0; i < 150; i++) {
  const h = rand(0, 360);
  const s = rand(45, 85);
  add([
    hslToHex(h, s, rand(40, 60)),
    hslToHex(h + 150, s, rand(40, 60)),
    hslToHex(h + 210, s, rand(40, 60)),
    hslToHex(h, s * 0.4, rand(85, 95)),
  ]);
}

// 6. Pastel variations
for (let i = 0; i < 200; i++) {
  const h = rand(0, 360);
  add([
    hslToHex(h, rand(30, 55), rand(78, 90)),
    hslToHex(h + rand(40, 90), rand(30, 55), rand(78, 90)),
    hslToHex(h + rand(120, 200), rand(30, 55), rand(78, 90)),
    hslToHex(h + rand(240, 320), rand(30, 55), rand(78, 90)),
  ]);
}

// 7. Dark/moody
for (let i = 0; i < 150; i++) {
  const h = rand(0, 360);
  const s = rand(20, 60);
  add([
    hslToHex(h, s, rand(8, 18)),
    hslToHex(h + rand(20, 60), s, rand(15, 28)),
    hslToHex(h + rand(80, 160), s, rand(20, 35)),
    hslToHex(h + rand(10, 40), s * 0.6, rand(35, 50)),
  ]);
}

// 8. Earth tones
for (let i = 0; i < 150; i++) {
  add([
    hslToHex(rand(15, 45), rand(25, 55), rand(25, 40)),
    hslToHex(rand(25, 50), rand(20, 45), rand(45, 60)),
    hslToHex(rand(35, 95), rand(15, 40), rand(55, 70)),
    hslToHex(rand(30, 60), rand(20, 50), rand(75, 88)),
  ]);
}

// 9. Warm sunset
for (let i = 0; i < 100; i++) {
  add([
    hslToHex(rand(0, 20), rand(70, 95), rand(45, 60)),
    hslToHex(rand(20, 40), rand(75, 95), rand(55, 70)),
    hslToHex(rand(40, 55), rand(80, 95), rand(60, 75)),
    hslToHex(rand(280, 330), rand(40, 70), rand(30, 50)),
  ]);
}

// 10. Cool ocean/sky
for (let i = 0; i < 100; i++) {
  add([
    hslToHex(rand(180, 220), rand(50, 80), rand(25, 40)),
    hslToHex(rand(185, 210), rand(45, 75), rand(45, 60)),
    hslToHex(rand(170, 200), rand(40, 70), rand(65, 80)),
    hslToHex(rand(190, 215), rand(30, 55), rand(85, 95)),
  ]);
}

// 11. Neon/vibrant
for (let i = 0; i < 100; i++) {
  const h = rand(0, 360);
  add([
    hslToHex(h, rand(85, 100), rand(50, 60)),
    hslToHex(h + rand(60, 120), rand(85, 100), rand(50, 60)),
    hslToHex(h + rand(180, 240), rand(85, 100), rand(50, 60)),
    hslToHex(h + rand(30, 60), rand(80, 95), rand(40, 55)),
  ]);
}

// 12. Wedding/soft
for (let i = 0; i < 80; i++) {
  add([
    hslToHex(rand(330, 360), rand(15, 35), rand(88, 95)),
    hslToHex(rand(30, 50), rand(20, 45), rand(85, 93)),
    hslToHex(rand(0, 30), rand(10, 30), rand(90, 97)),
    hslToHex(rand(40, 55), rand(30, 60), rand(60, 75)),
  ]);
}

// 13. Halloween
for (let i = 0; i < 50; i++) {
  add([
    hslToHex(rand(20, 35), rand(80, 100), rand(50, 60)),
    hslToHex(rand(270, 290), rand(40, 70), rand(25, 40)),
    hslToHex(0, 0, rand(5, 15)),
    hslToHex(rand(45, 55), rand(70, 95), rand(45, 60)),
  ]);
}

// 14. Christmas
for (let i = 0; i < 50; i++) {
  add([
    hslToHex(rand(0, 10), rand(70, 90), rand(35, 50)),
    hslToHex(rand(120, 150), rand(50, 80), rand(25, 40)),
    hslToHex(rand(40, 50), rand(70, 95), rand(50, 65)),
    hslToHex(0, 0, rand(90, 98)),
  ]);
}

// 15. Coffee/warm neutrals
for (let i = 0; i < 60; i++) {
  add([
    hslToHex(rand(20, 35), rand(30, 55), rand(18, 30)),
    hslToHex(rand(25, 40), rand(25, 50), rand(35, 50)),
    hslToHex(rand(30, 45), rand(20, 40), rand(60, 75)),
    hslToHex(rand(35, 50), rand(15, 35), rand(85, 93)),
  ]);
}

// 16. Space/cosmic
for (let i = 0; i < 50; i++) {
  add([
    hslToHex(rand(230, 270), rand(30, 60), rand(8, 18)),
    hslToHex(rand(260, 300), rand(40, 70), rand(20, 35)),
    hslToHex(rand(180, 220), rand(50, 80), rand(40, 55)),
    hslToHex(rand(40, 60), rand(60, 90), rand(65, 80)),
  ]);
}

// 17. Skin tones
for (let i = 0; i < 40; i++) {
  add([
    hslToHex(rand(15, 30), rand(40, 65), rand(80, 90)),
    hslToHex(rand(18, 32), rand(35, 55), rand(65, 78)),
    hslToHex(rand(20, 35), rand(30, 50), rand(45, 60)),
    hslToHex(rand(15, 28), rand(25, 45), rand(30, 42)),
  ]);
}

console.log(`Generated ${palettes.length} unique palettes`);

// Classify + build SQL
const statements: string[] = [];
const now = Math.floor(Date.now() / 1000);

for (const colors of palettes) {
  const id = createId();
  const slug = colors.map(c => c.replace("#", "").toLowerCase()).join("-");
  const { colors: colorTags, tags: collTags } = classifyPalette(colors);
  const allTags = [...colorTags, ...collTags];

  const colorsJson = JSON.stringify(colors).replace(/'/g, "''");
  const tagsJson = JSON.stringify(allTags).replace(/'/g, "''");

  statements.push(
    `INSERT OR IGNORE INTO palettes (id, slug, colors, tags, status, created_at) VALUES ('${id}', '${slug}', '${colorsJson}', '${tagsJson}', 'approved', ${now});`
  );
}

console.log(`SQL statements: ${statements.length}`);

const apply = process.argv.includes("--apply");
const sqlPath = "scripts/generate-palettes.sql";
writeFileSync(sqlPath, statements.join("\n") + "\n");
console.log(`Written to ${sqlPath}`);

if (!apply) {
  // Show tag distribution sample
  const tagDist: Record<string, number> = {};
  for (const colors of palettes) {
    const { colors: ct, tags: tt } = classifyPalette(colors);
    [...ct, ...tt].forEach(t => { tagDist[t] = (tagDist[t] || 0) + 1; });
  }
  const sorted = Object.entries(tagDist).sort((a, b) => b[1] - a[1]);
  console.log("\nTag distribution (top 40):");
  sorted.slice(0, 40).forEach(([t, c]) => {
    console.log(`  ${t.padEnd(18)} ${c} (${Math.round(c / palettes.length * 100)}%)`);
  });
  console.log("\nDry run. Use --apply to push to D1.");
} else {
  console.log("Pushing to D1...");
  execSync(`npx wrangler d1 execute color-db --remote --file "${sqlPath}"`, {
    stdio: "inherit",
  });
  console.log("Done!");
}
