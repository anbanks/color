import { PaletteFeed } from "@/components/palette/palette-feed";
import { getPalettesByTag } from "@/lib/get-palettes";
import { locales, getDictionary, type Locale } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";
import { localeUrl, localeAlternates } from "@/lib/locale-url";
import { tagLabel, colorLabel, COLOR_SLUGS, TAG_SLUGS } from "@/lib/tag-labels";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string; locale: string }>;
}

function translateTag(slug: string, locale: string): string {
  const cap = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
  if ((COLOR_SLUGS as readonly string[]).includes(cap)) return colorLabel(cap, locale);
  if ((TAG_SLUGS as readonly string[]).includes(cap)) return tagLabel(cap, locale);
  return cap;
}

// Localized description templates
const descTemplates: Record<string, (tags: string) => string> = {
  en: (t) => `Discover beautiful ${t} color palettes for your next design project.`,
  pt: (t) => `Descubra paletas de cores ${t} para seu próximo projeto de design.`,
  es: (t) => `Descubre hermosas paletas de colores ${t} para tu próximo proyecto.`,
  fr: (t) => `Découvrez de magnifiques palettes de couleurs ${t} pour votre prochain projet.`,
  de: (t) => `Entdecken Sie schöne ${t} Farbpaletten für Ihr nächstes Designprojekt.`,
  it: (t) => `Scopri bellissime palette di colori ${t} per il tuo prossimo progetto.`,
  ja: (t) => `${t}のカラーパレットを発見しましょう。`,
  zh: (t) => `发现精美的${t}调色板，为您的下一个设计项目提供灵感。`,
  hi: (t) => `अपने अगले डिज़ाइन प्रोजेक्ट के लिए ${t} रंग पैलेट खोजें।`,
};

const palettesWord: Record<string, string> = {
  en: "Color Palettes", pt: "Paletas de Cores", es: "Paletas de Colores",
  fr: "Palettes de Couleurs", de: "Farbpaletten", it: "Palette di Colori",
  ja: "カラーパレット", zh: "调色板", hi: "रंग पैलेट",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag, locale } = await params;
  const parts = tag.split("-");
  const translated = parts.map(p => translateTag(p, locale));
  const titleLabel = translated.join(" & ");
  const pw = palettesWord[locale] || palettesWord.en;
  const title = `${titleLabel} ${pw}`;
  const descFn = descTemplates[locale] || descTemplates.en;
  const description = descFn(translated.join(locale === "ja" || locale === "zh" ? "・" : " & "));
  const canonical = localeUrl(locale, `/palettes/${tag}`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localeAlternates(locales, `/palettes/${tag}`),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      locale,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const palettes = await getPalettesByTag(tag);
  return <PaletteFeed palettes={palettes} />;
}
