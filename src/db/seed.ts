import { createId } from "@paralleldrive/cuid2";

const palettes = [
  { colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"], tags: ["vibrant", "fresh"] },
  { colors: ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB"], tags: ["corporate", "bold"] },
  { colors: ["#F8B500", "#FF6F61", "#5B5EA6", "#9B2335"], tags: ["warm", "sunset"] },
  { colors: ["#FAD0C4", "#FFD1FF", "#A1C4FD", "#C2E9FB"], tags: ["pastel", "soft"] },
  { colors: ["#0F0C29", "#302B63", "#24243E", "#1A1A2E"], tags: ["dark", "night"] },
  { colors: ["#56AB2F", "#A8E063", "#F7DC6F", "#F0B27A"], tags: ["nature", "earth"] },
  { colors: ["#FF9A9E", "#FECFEF", "#FFDDE1", "#FFF1EB"], tags: ["pink", "pastel"] },
  { colors: ["#667EEA", "#764BA2", "#F093FB", "#F5576C"], tags: ["gradient", "vibrant"] },
  { colors: ["#1A1A2E", "#16213E", "#0F3460", "#E94560"], tags: ["dark", "accent"] },
  { colors: ["#F5F5DC", "#D4A574", "#8B7355", "#4A3728"], tags: ["earth", "warm"] },
];

export function generateSeedSQL(): string {
  const statements: string[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (const p of palettes) {
    const id = createId();
    const slug = p.colors.map((c) => c.replace("#", "").toLowerCase()).join("-");
    statements.push(
      `INSERT INTO palettes (id, slug, colors, tags, status, likes_count, published_at, created_at) VALUES ('${id}', '${slug}', '${JSON.stringify(p.colors)}', '${JSON.stringify(p.tags)}', 'published', ${Math.floor(Math.random() * 100)}, ${now}, ${now});`
    );
  }

  return statements.join("\n");
}

// Run directly: npx tsx src/db/seed.ts
if (typeof require !== "undefined" && require.main === module) {
  console.log(generateSeedSQL());
}
