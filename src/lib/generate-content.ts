import OpenAI from "openai";

interface PaletteContentResult {
  title: string;
  description: string;
  applications: string;
  psychology: string;
}

interface AllLocalesResult {
  en: PaletteContentResult;
  pt: PaletteContentResult;
  es: PaletteContentResult;
}

export async function generatePaletteContent(
  colors: string[],
  apiKey: string
): Promise<AllLocalesResult> {
  const openai = new OpenAI({ apiKey });

  const prompt = `You are a color theory expert. Given this palette: ${colors.join(", ")}.

Generate content in 3 languages (English, Portuguese, Spanish) with:
1. A creative title (max 60 chars)
2. A description (150-200 words about the palette's mood, style, and best use cases)
3. Practical applications (3-5 bullet points, each on a new line starting with "•")
4. Color psychology analysis (100-150 words)

Return JSON with this exact structure:
{
  "en": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "pt": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "es": { "title": "...", "description": "...", "applications": "...", "psychology": "..." }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content generated");

  return JSON.parse(content) as AllLocalesResult;
}
