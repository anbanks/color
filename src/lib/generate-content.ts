export const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

export interface PaletteContent {
  title: string;
  description: string;
  applications: string;
  psychology: string;
}

export type LocaleContentMap = Record<string, PaletteContent>;

export const ALL_LOCALES = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"] as const;
export type Locale = (typeof ALL_LOCALES)[number];

const LOCALES_PER_CALL = 3;
const PER_CALL_MAX_TOKENS = 1500;

export interface GeneratePaletteOptions {
  colors: string[];
  locales?: readonly string[];
  maxTokensPerCall?: number;
  temperature?: number;
}

export interface GeneratePaletteResult {
  content: LocaleContentMap;
  raw: string;
  request: {
    model: string;
    max_tokens: number;
    temperature: number;
    locales_per_call: number;
    calls: number;
  };
  chunkErrors: { locales: string[]; error: string }[];
}

export function buildPaletteContentPrompt(colors: string[], locales: readonly string[]): string {
  const example = locales
    .map((l) => `  "${l}": { "title": "...", "description": "...", "applications": "...", "psychology": "..." }`)
    .join(",\n");
  return `You are a color palette expert. Given these 4 hex colors: ${colors.join(", ")}

Generate content for this palette in ${locales.length} language${locales.length === 1 ? "" : "s"} (${locales.join(", ")}). Return ONLY a JSON object (no markdown fences):

{
${example}
}

Rules:
- title: Creative 2-4 word name, NOT "Color Palette", NOT hex codes
- description: 1-2 sentence SEO description. INCLUDE the hex codes in the description.
- applications: 1-2 sentences about practical uses
- psychology: 1-2 sentences about psychological effect
- Each field in its respective language
- Valid JSON only`;
}

function extractJson(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    text = text.slice(first, last + 1);
  }
  return text;
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function generatePaletteContent(
  ai: Ai,
  options: GeneratePaletteOptions,
): Promise<GeneratePaletteResult> {
  const locales = options.locales ?? ALL_LOCALES;
  const maxTokens = options.maxTokensPerCall ?? PER_CALL_MAX_TOKENS;
  const temperature = options.temperature ?? 0.6;
  const groups = chunk(locales, LOCALES_PER_CALL);

  const merged: LocaleContentMap = {};
  const rawParts: string[] = [];
  const chunkErrors: { locales: string[]; error: string }[] = [];

  for (const group of groups) {
    const prompt = buildPaletteContentPrompt(options.colors, group);
    try {
      const response = (await ai.run(WORKERS_AI_MODEL, {
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature,
      })) as { response?: string };

      const raw = response.response?.trim() ?? "";
      rawParts.push(`# ${group.join(",")}\n${raw}`);

      if (!raw) {
        chunkErrors.push({ locales: [...group], error: "empty response" });
        continue;
      }

      const parsed = JSON.parse(extractJson(raw)) as LocaleContentMap;
      for (const locale of group) {
        const item = parsed[locale];
        if (item?.title) {
          merged[locale] = {
            title: item.title,
            description: item.description || "",
            applications: item.applications || "",
            psychology: item.psychology || "",
          };
        }
      }
    } catch (e) {
      chunkErrors.push({ locales: [...group], error: (e as Error).message });
    }
  }

  if (Object.keys(merged).length === 0) {
    const firstErr = chunkErrors[0]?.error ?? "no content generated";
    throw new Error(`Workers AI produced no valid locales: ${firstErr}`);
  }

  return {
    content: merged,
    raw: rawParts.join("\n\n---\n\n"),
    request: {
      model: WORKERS_AI_MODEL,
      max_tokens: maxTokens,
      temperature,
      locales_per_call: LOCALES_PER_CALL,
      calls: groups.length,
    },
    chunkErrors,
  };
}
