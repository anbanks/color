import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import { generatePaletteContent } from "@/lib/generate-content";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { paletteId?: string };
  if (!body.paletteId) {
    return Response.json({ error: "paletteId required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Get palette
  const palette = await db
    .select()
    .from(palettes)
    .where(eq(palettes.id, body.paletteId))
    .limit(1);

  if (palette.length === 0) {
    return Response.json({ error: "Palette not found" }, { status: 404 });
  }

  // Check if content already exists
  const existing = await db
    .select()
    .from(paletteContent)
    .where(eq(paletteContent.paletteId, body.paletteId))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ message: "Content already exists" }, { status: 200 });
  }

  const colors = JSON.parse(palette[0].colors) as string[];
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const content = await generatePaletteContent(colors, apiKey);

    // Insert content for all 3 locales
    const locales = ["en", "pt", "es"] as const;
    for (const locale of locales) {
      await db.insert(paletteContent).values({
        id: createId(),
        paletteId: body.paletteId,
        locale,
        title: content[locale].title,
        description: content[locale].description,
        applications: content[locale].applications,
        psychology: content[locale].psychology,
      });
    }

    return Response.json({ success: true, locales: 3 }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
