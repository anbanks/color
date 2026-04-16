import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export const runtime = "edge";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function publicUrl(key: string) {
  return `/api/assets/${key}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large (max 2 MB)" }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type];
  // Bust the CDN cache on every upload by appending a timestamp.
  const key = `avatars/${session.user.id}-${Date.now()}.${ext}`;

  const { env } = await getCloudflareContext({ async: true });
  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  // Purge the previous avatar so the bucket doesn't accumulate orphans.
  const db = getDb(env.DB);
  const previous = await db
    .select({ image: users.image })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const prevImage = previous[0]?.image;
  if (prevImage && prevImage.startsWith("/api/assets/avatars/")) {
    const prevKey = prevImage.replace("/api/assets/", "");
    if (prevKey !== key) {
      await env.STORAGE.delete(prevKey).catch(() => {});
    }
  }

  const url = publicUrl(key);
  await db.update(users).set({ image: url }).where(eq(users.id, session.user.id));

  return Response.json({ image: url });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const current = await db
    .select({ image: users.image })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const image = current[0]?.image;
  if (image && image.startsWith("/api/assets/avatars/")) {
    const key = image.replace("/api/assets/", "");
    await env.STORAGE.delete(key).catch(() => {});
  }

  await db.update(users).set({ image: null }).where(eq(users.id, session.user.id));
  return Response.json({ image: null });
}
