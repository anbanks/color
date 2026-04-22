import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import { generatePaletteContent } from "@/lib/generate-content";

const USER_LOCALES = ["en", "pt", "es"] as const;

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

  const palette = await db
    .select()
    .from(palettes)
    .where(eq(palettes.id, body.paletteId))
    .limit(1);

  if (palette.length === 0) {
    return Response.json({ error: "Palette not found" }, { status: 404 });
  }

  const existing = await db
    .select()
    .from(paletteContent)
    .where(eq(paletteContent.paletteId, body.paletteId))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ message: "Content already exists" }, { status: 200 });
  }

  const colors = JSON.parse(palette[0].colors) as string[];

  try {
    const result = await generatePaletteContent(env.AI, {
      colors,
      locales: USER_LOCALES,
    });

    let saved = 0;
    for (const locale of USER_LOCALES) {
      const fields = result.content[locale];
      if (!fields?.title) continue;
      await db.insert(paletteContent).values({
        id: createId(),
        paletteId: body.paletteId,
        locale,
        title: fields.title,
        description: fields.description || "",
        applications: fields.applications || "",
        psychology: fields.psychology || "",
      });
      saved++;
    }

    return Response.json({ success: true, locales: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
