import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!body.currentPassword || !body.newPassword) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (body.newPassword.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const user = rows[0];

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.password) {
    return Response.json(
      { error: "Password change not available for social login accounts" },
      { status: 400 }
    );
  }

  const valid = await compare(body.currentPassword, user.password);
  if (!valid) {
    return Response.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  const hashed = await hash(body.newPassword, 12);
  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.id, user.id));

  return Response.json({ success: true });
}
