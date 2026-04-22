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

export interface GeneratePaletteOptions {
  colors: string[];
  locales?: readonly string[];
  maxTokens?: number;
  temperature?: number;
}

export interface GeneratePaletteResult {
  content: LocaleContentMap;
  raw: string;
  request: {
    model: string;
    max_tokens: number;
    temperature: number;
  };
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

export async function generatePaletteContent(
  ai: Ai,
  options: GeneratePaletteOptions,
): Promise<GeneratePaletteResult> {
  const locales = options.locales ?? ALL_LOCALES;
  const maxTokens = options.maxTokens ?? 2000;
  const temperature = options.temperature ?? 0.7;
  const prompt = buildPaletteContentPrompt(options.colors, locales);

  const response = (await ai.run(WORKERS_AI_MODEL, {
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature,
  })) as { response?: string };

  const raw = response.response?.trim() ?? "";
  if (!raw) {
    throw new Error("Workers AI returned empty response");
  }

  let parsed: LocaleContentMap;
  try {
    parsed = JSON.parse(extractJson(raw)) as LocaleContentMap;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${(e as Error).message}`);
  }

  return {
    content: parsed,
    raw,
    request: { model: WORKERS_AI_MODEL, max_tokens: maxTokens, temperature },
  };
}
