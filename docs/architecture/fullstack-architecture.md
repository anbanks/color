# Full-Stack Architecture — Color

## 1. Visao Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Workers  │  │   D1     │  │   R2     │  │  KV     │ │
│  │ (Next.js)│  │ (SQLite) │  │ (Images) │  │ (Cache) │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
│       └──────────────┴──────────────┴──────────────┘      │
│                          │                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Cron Triggers (Drip Publishing)         │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  OpenAI API │
                    │ (Geracao IA)│
                    └─────────────┘
```

**Principio:** 100% Cloudflare. Zero servidores externos. Tudo roda na borda.

## 2. Stack Definitiva

| Camada | Tecnologia | Servico Cloudflare |
|--------|------------|-------------------|
| Runtime | Next.js 15 (App Router) | Cloudflare Workers (via @opennextjs/cloudflare) |
| Banco de Dados | Drizzle ORM + SQLite | Cloudflare D1 |
| Storage (imagens/OG) | — | Cloudflare R2 |
| Cache | — | Cloudflare KV |
| Cron Jobs | Drip Publishing | Cloudflare Cron Triggers |
| DNS + CDN | — | Cloudflare (proxy) |
| UI | Tailwind CSS + shadcn/ui + Lucide | — |
| Auth | Auth.js v5 (Google + GitHub) | Sessions em D1 |
| Geracao de Conteudo | OpenAI API | — |

## 3. Estrutura de Rotas (App Router)

```
app/
├── layout.tsx                          # Root layout (fonte Inter, metadata global)
├── page.tsx                            # Home — grid de paletas (Trending)
├── globals.css                         # Tailwind base
│
├── [locale]/                           # i18n: en | pt | es
│   ├── layout.tsx                      # Locale layout (hreflang tags)
│   ├── page.tsx                        # Home localizada
│   │
│   ├── palette/
│   │   └── [slug]/
│   │       └── page.tsx                # Pagina individual da paleta (SEO)
│   │
│   ├── palettes/
│   │   └── page.tsx                    # Listagem com filtros/categorias
│   │
│   ├── collections/
│   │   └── page.tsx                    # Colecoes do usuario (protegida)
│   │
│   └── create/
│       └── page.tsx                    # Criar paleta (protegida)
│
├── admin/
│   ├── layout.tsx                      # Admin layout (protegido, role check)
│   ├── page.tsx                        # Dashboard admin
│   └── palettes/
│       └── page.tsx                    # Moderar paletas pendentes
│
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts                # Auth.js endpoints
│   │
│   ├── palettes/
│   │   ├── route.ts                    # GET (listar), POST (criar)
│   │   └── [id]/
│   │       ├── route.ts                # GET (detalhe), PATCH (admin: aprovar/rejeitar)
│   │       └── like/
│   │           └── route.ts            # POST (curtir/descurtir)
│   │
│   ├── collections/
│   │   ├── route.ts                    # GET (listar), POST (criar colecao)
│   │   └── [id]/
│   │       └── route.ts               # PATCH (add/remove paleta), DELETE
│   │
│   ├── generate/
│   │   └── route.ts                    # POST (gerar textos via OpenAI — admin only)
│   │
│   ├── cron/
│   │   └── publish/
│   │       └── route.ts                # Cron Trigger: publica paletas da fila
│   │
│   └── sitemap/
│       └── route.ts                    # Sitemap dinamico XML
│
├── sitemap.ts                          # Next.js sitemap generator
└── robots.ts                           # robots.txt
```

## 4. Schema do Banco de Dados (Cloudflare D1 + Drizzle)

```typescript
// src/db/schema.ts

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ── Usuarios ──────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),                    // cuid2
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
  role: text('role', { enum: ['user', 'admin'] }).default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),                   // oauth
  provider: text('provider').notNull(),           // google | github
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// ── Paletas ───────────────────────────────────────────
export const palettes = sqliteTable('palettes', {
  id: text('id').primaryKey(),                    // cuid2
  slug: text('slug').notNull().unique(),           // hex1-hex2-hex3-hex4
  colors: text('colors').notNull(),                // JSON: ["#FF5733","#33FF57","#3357FF","#F3FF33"]
  tags: text('tags'),                              // JSON: ["warm","vibrant","sunset"]
  status: text('status', {
    enum: ['pending', 'approved', 'rejected', 'published']
  }).default('pending'),
  authorId: text('author_id').references(() => users.id),
  likesCount: integer('likes_count').default(0),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── Conteudo SEO (gerado por IA) ──────────────────────
export const paletteContent = sqliteTable('palette_content', {
  id: text('id').primaryKey(),
  paletteId: text('palette_id').notNull().references(() => palettes.id, { onDelete: 'cascade' }),
  locale: text('locale', { enum: ['en', 'pt', 'es'] }).notNull(),
  title: text('title').notNull(),                  // "Sunset Warmth Palette"
  description: text('description').notNull(),      // Descricao da paleta
  applications: text('applications').notNull(),    // Aplicacoes praticas (markdown)
  psychology: text('psychology').notNull(),         // Psicologia das cores (markdown)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── Likes ─────────────────────────────────────────────
export const likes = sqliteTable('likes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  paletteId: text('palette_id').notNull().references(() => palettes.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── Colecoes ──────────────────────────────────────────
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const collectionPalettes = sqliteTable('collection_palettes', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  paletteId: text('palette_id').notNull().references(() => palettes.id, { onDelete: 'cascade' }),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
});
```

## 5. Servicos Cloudflare — Detalhamento

### 5.1 Cloudflare Workers (Runtime)

Next.js 15 roda como Worker via `@opennextjs/cloudflare`.

```
// wrangler.toml (gerado pelo adaptador)
name = "color"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "color-db"
database_id = "<auto>"

[[kv_namespaces]]
binding = "CACHE"
id = "<auto>"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "color-assets"

[triggers]
crons = ["0 */4 * * *"]  # A cada 4 horas — publica ~5 paletas
```

### 5.2 Cloudflare D1 (Banco de Dados)

- SQLite distribuido na borda
- Latencia ~0ms para leitura
- Drizzle ORM para type-safety
- Migrations via `drizzle-kit`

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

### 5.3 Cloudflare KV (Cache)

Usado para cache de dados frequentes:

| Chave | Valor | TTL |
|-------|-------|-----|
| `palettes:trending` | JSON com top 50 paletas | 5 min |
| `palettes:popular` | JSON com paletas mais curtidas | 10 min |
| `palette:{slug}:content:{locale}` | Conteudo SEO da paleta | 1 hora |
| `sitemap:index` | Sitemap XML | 1 hora |

### 5.4 Cloudflare R2 (Storage)

Usado para armazenar:
- Imagens OG (Open Graph) geradas por paleta para compartilhamento social
- Assets estaticos se necessario

### 5.5 Cloudflare Cron Triggers (Drip Publishing)

```typescript
// app/api/cron/publish/route.ts
export async function GET(request: Request) {
  // Verificar header de autenticacao do Cron Trigger
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Buscar paletas aprovadas ainda nao publicadas (limit 5)
  const palettes = await db
    .select()
    .from(schema.palettes)
    .where(eq(schema.palettes.status, 'approved'))
    .orderBy(schema.palettes.createdAt)
    .limit(5);

  // Atualizar status para 'published' e definir publishedAt
  for (const palette of palettes) {
    await db
      .update(schema.palettes)
      .set({
        status: 'published',
        publishedAt: new Date(),
      })
      .where(eq(schema.palettes.id, palette.id));
  }

  // Invalidar cache KV
  await env.CACHE.delete('palettes:trending');
  await env.CACHE.delete('palettes:popular');

  return Response.json({ published: palettes.length });
}
```

## 6. Autenticacao (Auth.js v5)

```typescript
// src/auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDb(process.env.DB)),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
```

## 7. Geracao de Conteudo (OpenAI)

```typescript
// src/lib/generate-content.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePaletteContent(
  colors: string[],
  locale: 'en' | 'pt' | 'es'
) {
  const prompt = `You are a color theory expert. Given the palette: ${colors.join(', ')}.
Write in ${locale === 'en' ? 'English' : locale === 'pt' ? 'Portuguese' : 'Spanish'}:
1. A creative title (max 60 chars)
2. A description (150-200 words)
3. Practical applications (3-5 bullet points)
4. Color psychology analysis (100-150 words)

Return JSON: { title, description, applications, psychology }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

## 8. Internacionalizacao (i18n)

### Estrategia de Rotas

```
colorsite.com/en/palette/sunset-warmth     → English
colorsite.com/pt/palette/sunset-warmth     → Portugues
colorsite.com/es/palette/sunset-warmth     → Espanol
```

### Middleware de Locale

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'pt', 'es'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignorar api, _next, assets
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return;
  }

  // Verificar se ja tem locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!hasLocale) {
    // Detectar idioma do navegador
    const acceptLang = request.headers.get('accept-language') || '';
    const detected = locales.find((l) => acceptLang.includes(l)) || defaultLocale;
    return NextResponse.redirect(new URL(`/${detected}${pathname}`, request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### Hreflang Tags

```typescript
// app/[locale]/palette/[slug]/page.tsx
export function generateMetadata({ params }) {
  return {
    alternates: {
      languages: {
        en: `/en/palette/${params.slug}`,
        pt: `/pt/palette/${params.slug}`,
        es: `/es/palette/${params.slug}`,
      },
    },
  };
}
```

## 9. Estrutura de Componentes

```
src/
├── components/
│   ├── ui/                        # shadcn/ui (Button, Dialog, etc.)
│   ├── layout/
│   │   ├── header.tsx             # Header fixo, clean
│   │   ├── footer.tsx             # Footer minimalista
│   │   └── nav-categories.tsx     # Tags: Trending, Popular, New, Random
│   │
│   ├── palette/
│   │   ├── palette-card.tsx       # Card com 4 faixas de cor
│   │   ├── palette-grid.tsx       # Grid responsivo de cards
│   │   ├── palette-detail.tsx     # Visualizacao detalhada
│   │   ├── palette-creator.tsx    # Formulario de criacao
│   │   ├── color-strip.tsx        # Faixa individual de cor
│   │   ├── copy-button.tsx        # Botao copiar HEX/RGB/HSL
│   │   ├── like-button.tsx        # Coracao com contador
│   │   └── contrast-checker.tsx   # Verificador WCAG
│   │
│   ├── preview/
│   │   └── site-mockup.tsx        # Mini-preview de interface
│   │
│   ├── seo/
│   │   └── palette-content.tsx    # Conteudo SEO abaixo da dobra
│   │
│   └── admin/
│       ├── moderation-card.tsx    # Card de moderacao
│       └── moderation-list.tsx    # Lista de paletas pendentes
│
├── lib/
│   ├── utils.ts                   # cn() e helpers gerais
│   ├── color-utils.ts             # Conversao HEX/RGB/HSL, contraste WCAG
│   ├── generate-content.ts        # Integracao OpenAI
│   └── generate-slug.ts           # Gerar slug a partir das cores
│
├── db/
│   ├── schema.ts                  # Schema Drizzle (tabelas)
│   ├── index.ts                   # Conexao D1
│   └── migrations/                # Drizzle migrations
│
├── auth.ts                        # Configuracao Auth.js
├── middleware.ts                   # i18n middleware
│
└── hooks/
    ├── use-keyboard-nav.ts        # Navegacao por teclado
    ├── use-copy-color.ts          # Hook de copia com feedback
    └── use-infinite-scroll.ts     # Scroll infinito na listagem
```

## 10. Performance e SEO

### Estrategia de Renderizacao

| Pagina | Metodo | Motivo |
|--------|--------|--------|
| Home (grid) | SSR + KV Cache | Conteudo dinamico, cache na borda |
| Paleta individual | ISR (revalidate: 3600) | Conteudo quase estatico, SEO critico |
| Criar paleta | Client-side | Interativo, protegido por auth |
| Admin | Client-side | Protegido, sem necessidade de SEO |
| Sitemap | ISR (revalidate: 3600) | Atualiza a cada hora |

### Core Web Vitals

- **LCP < 1.5s:** Paletas sao texto/CSS puro (sem imagens pesadas)
- **CLS = 0:** Layout fixo, sem shifts
- **INP < 100ms:** Interacoes leves (copiar, curtir)

### SEO Checklist

- [x] Paginas individuais por paleta com URL semantica
- [x] Conteudo rico abaixo da dobra (descricao, aplicacoes, psicologia)
- [x] Hreflang tags para 3 idiomas
- [x] Sitemap dinamico
- [x] robots.txt configurado
- [x] OG images por paleta (R2)
- [x] Schema.org structured data (CreativeWork)
- [x] Drip publishing para freshness

## 11. Deploy e CI/CD

```bash
# Desenvolvimento local
npm run dev                    # Next.js dev server
npx wrangler d1 migrations apply color-db --local  # Migrations locais

# Deploy
npx opennextjs-cloudflare build   # Build para Cloudflare
npx wrangler deploy               # Deploy para Workers

# Banco de dados
npx drizzle-kit generate          # Gerar migrations
npx wrangler d1 migrations apply color-db --remote  # Aplicar no D1 remoto
```

## 12. Variaveis de Ambiente

```
# .dev.vars (Cloudflare local) / Cloudflare Dashboard (producao)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
AUTH_SECRET=                  # openssl rand -base64 32
CRON_SECRET=                  # Secret para autenticar Cron Triggers
```

## 13. Decisoes Arquiteturais

| Decisao | Escolha | Motivo |
|---------|---------|--------|
| Runtime | Cloudflare Workers | Latencia zero, edge-first |
| Banco | D1 (SQLite) | Nativo do Cloudflare, zero config |
| ORM | Drizzle | Unico ORM compativel com Edge + D1 |
| Cache | KV | Nativo, sub-ms reads na borda |
| Storage | R2 | S3-compatible, zero egress fees |
| Auth | Auth.js v5 | Edge-compatible, login social facil |
| UI | shadcn/ui | Componentes copy-paste, sem dependencia runtime |
| LLM | OpenAI gpt-4o-mini | Barato, rapido, bom para textos curtos |
| i18n | Route-based | Melhor para SEO do que cookie/header |
| Cron | Cron Triggers | Nativo Cloudflare, sem infra extra |
