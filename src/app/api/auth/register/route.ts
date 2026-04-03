import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!body.email?.trim() || !body.password || !body.name?.trim()) {
    return Response.json({ error: "Name, email and password are required" }, { status: 400 });
  }

  if (body.password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const name = body.name.trim();

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Check if email already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await hash(body.password, 12);

  await db.insert(users).values({
    id: createId(),
    name,
    email,
    password: hashedPassword,
  });

  return Response.json({ success: true }, { status: 201 });
}
