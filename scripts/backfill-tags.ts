// Backfills the `palettes.tags` JSON column for every palette in the
// remote D1 database using the pure classifier in src/lib/classify-palette.ts.
//
// Usage:
//   npx tsx scripts/backfill-tags.ts           # dry run, prints sample
//   npx tsx scripts/backfill-tags.ts --apply   # generate SQL and push to D1

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyPalette } from "../src/lib/classify-palette";

const here = dirname(fileURLToPath(import.meta.url));
const sqlOutPath = resolve(here, "backfill-tags.sql");

interface Row {
  id: string;
  colors: string;
}

function runWrangler(command: string): string {
  return execSync(command, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function fetchPalettes(): Row[] {
  const out = runWrangler(
    `npx wrangler d1 execute color-db --remote --json --command "SELECT id, colors FROM palettes;"`
  );
  // Wrangler prints some startup text before the JSON body; find the first [ or {.
  const start = out.search(/[\[{]/);
  if (start < 0) throw new Error("No JSON in wrangler output");
  const json = JSON.parse(out.slice(start)) as Array<{ results: Row[] }>;
  return json[0]?.results ?? [];
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function main() {
  const apply = process.argv.includes("--apply");
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log("Fetching palettes from D1…");
  const rows = fetchPalettes();
  console.log(`Got ${rows.length} palettes.\n`);

  const updates: string[] = [];
  const samples: { id: string; colors: string[]; tags: string[] }[] = [];
  const tagCounts = new Map<string, number>();
  let skipped = 0;

  for (const row of rows) {
    let colors: string[];
    try {
      colors = JSON.parse(row.colors) as string[];
      if (!Array.isArray(colors) || !colors.length) throw new Error("empty");
    } catch {
      skipped++;
      continue;
    }
    const { colors: colorTags, tags: collectionTags } = classifyPalette(colors);
    const finalTags = [...colorTags, ...collectionTags];
    for (const t of finalTags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);

    const json = escapeSqlString(JSON.stringify(finalTags));
    updates.push(
      `UPDATE palettes SET tags = '${json}' WHERE id = '${escapeSqlString(row.id)}';`
    );
    if (samples.length < 12) {
      samples.push({ id: row.id, colors, tags: finalTags });
    }
  }

  console.log("Sample classifications:");
  for (const s of samples) {
    console.log(
      `  ${s.colors.join(" ").padEnd(42)}  →  ${s.tags.join(", ")}`
    );
  }
  console.log(`\nSkipped (invalid colors JSON): ${skipped}`);
  console.log(`Total UPDATEs: ${updates.length}`);

  const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log("\nTag frequency (top 30):");
  for (const [tag, count] of sorted.slice(0, 30)) {
    const pct = ((count / rows.length) * 100).toFixed(1);
    console.log(`  ${tag.padEnd(12)}  ${count.toString().padStart(5)}  ${pct}%`);
  }

  if (!apply) {
    console.log("\nDry run complete. Re-run with --apply to push to D1.");
    return;
  }

  mkdirSync(dirname(sqlOutPath), { recursive: true });
  writeFileSync(sqlOutPath, updates.join("\n") + "\n", "utf-8");
  console.log(`\nSQL written to ${sqlOutPath}`);
  console.log("Applying to remote D1 (this may take a minute)…");
  runWrangler(
    `npx wrangler d1 execute color-db --remote --file "${sqlOutPath}"`
  );
  console.log("Done.");
}

main();
