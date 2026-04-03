import { isValidLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/locale-context";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    title: {
      default: t.site.title,
      template: `%s | Color`,
    },
    description: t.site.description,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`])
      ),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <LocaleProvider locale={locale as Locale} dictionary={dictionary}>
      <div className="max-w-[1540px] mx-auto">
        {children}
      </div>
    </LocaleProvider>
  );
}
