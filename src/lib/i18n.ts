import en from "@/messages/en.json";
import pt from "@/messages/pt.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import de from "@/messages/de.json";
import it from "@/messages/it.json";
import ja from "@/messages/ja.json";
import zh from "@/messages/zh.json";
import hi from "@/messages/hi.json";

export const locales = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, typeof en> = { en, pt, es, fr, de, it, ja, zh, hi };

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
