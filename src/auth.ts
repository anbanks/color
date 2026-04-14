import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/en/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const { getCloudflareContext } = await import("@opennextjs/cloudflare");
          const { getDb } = await import("./db");
          const { users } = await import("./db/schema");
          const { eq } = await import("drizzle-orm");
          const { compare } = await import("bcryptjs");

          const { env } = await getCloudflareContext({ async: true });
          const db = getDb(env.DB);

          const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          const user = result[0];
          if (!user || !user.password) return null;

          const valid = await compare(password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email && !token.role) {
        try {
          const { getCloudflareContext } = await import("@opennextjs/cloudflare");
          const { getDb } = await import("./db");
          const { users } = await import("./db/schema");
          const { eq } = await import("drizzle-orm");
          const { env } = await getCloudflareContext({ async: true });
          const db = getDb(env.DB);
          const rows = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, token.email as string))
            .limit(1);
          token.role = rows[0]?.role ?? "user";
        } catch {
          token.role = "user";
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      (session.user as { role?: string }).role = (token.role as string) ?? "user";
      return session;
    },
  },
});
