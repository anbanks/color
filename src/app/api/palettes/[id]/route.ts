import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string };

  if (!body.status || !["approved", "rejected"].includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  if (body.status === "approved") {
    // Approve = publish directly
    await db
      .update(palettes)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(palettes.id, id));
  } else {
    await db
      .update(palettes)
      .set({ status: body.status as "rejected" })
      .where(eq(palettes.id, id));
  }

  return Response.json({ success: true });
}
