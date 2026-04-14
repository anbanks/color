import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

// ── Users ─────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  password: text("password"),
  role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("verification_token_idx").on(table.identifier, table.token)]
);

// ── Palettes ──────────────────────────────────────────
export const palettes = sqliteTable("palettes", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  colors: text("colors").notNull(), // JSON: ["#FF5733","#33FF57","#3357FF","#F3FF33"]
  tags: text("tags"), // JSON: ["warm","vibrant"]
  status: text("status", {
    enum: ["pending", "approved", "rejected", "published"],
  })
    .notNull()
    .default("pending"),
  authorId: text("author_id").references(() => users.id),
  likesCount: integer("likes_count").notNull().default(0),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Palette SEO Content (AI-generated) ────────────────
export const paletteContent = sqliteTable("palette_content", {
  id: text("id").primaryKey(),
  paletteId: text("palette_id")
    .notNull()
    .references(() => palettes.id, { onDelete: "cascade" }),
  locale: text("locale", {
    enum: ["en", "pt", "es", "fr", "de", "it", "ja", "zh"],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  applications: text("applications").notNull(),
  psychology: text("psychology").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── Likes ─────────────────────────────────────────────
export const likes = sqliteTable(
  "likes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paletteId: text("palette_id")
      .notNull()
      .references(() => palettes.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("like_unique_idx").on(table.userId, table.paletteId)]
);

// ── Collections ───────────────────────────────────────
export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collectionPalettes = sqliteTable(
  "collection_palettes",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    paletteId: text("palette_id")
      .notNull()
      .references(() => palettes.id, { onDelete: "cascade" }),
    addedAt: integer("added_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("collection_palette_unique_idx").on(
      table.collectionId,
      table.paletteId
    ),
  ]
);
