import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "css";

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const row = await db.select().from(palettes).where(eq(palettes.id, id)).limit(1);
  if (!row[0]) return Response.json({ error: "Not found" }, { status: 404 });

  const colors = JSON.parse(row[0].colors) as string[];
  const slug = row[0].slug;

  switch (format) {
    case "css": {
      const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}\n`;
      return new Response(css, {
        headers: { "Content-Type": "text/css", "Content-Disposition": `attachment; filename="${slug}.css"` },
      });
    }
    case "json": {
      const json = JSON.stringify({ name: slug, colors }, null, 2);
      return new Response(json, {
        headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${slug}.json"` },
      });
    }
    case "tailwind": {
      const config = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${colors.map((c, i) => `          '${i + 1}': '${c}',`).join("\n")}\n        },\n      },\n    },\n  },\n};\n`;
      return new Response(config, {
        headers: { "Content-Type": "text/javascript", "Content-Disposition": `attachment; filename="${slug}.tailwind.js"` },
      });
    }
    case "scss": {
      const scss = colors.map((c, i) => `$color-${i + 1}: ${c};`).join("\n") + "\n";
      return new Response(scss, {
        headers: { "Content-Type": "text/x-scss", "Content-Disposition": `attachment; filename="${slug}.scss"` },
      });
    }
    default:
      return Response.json({ error: "Invalid format. Use: css, json, tailwind, scss" }, { status: 400 });
  }
}
