import { isValidLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/locale-context";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { SITE_URL, SITE_NAME } from "@/lib/site";
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

  const ogLocaleMap: Record<Locale, string> = {
    en: "en_US",
    pt: "pt_BR",
    es: "es_ES",
  };

  return {
    title: {
      default: t.site.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: t.site.description,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: `${SITE_URL}/${locale}`,
      title: t.site.title,
      description: t.site.description,
      locale: ogLocaleMap[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => ogLocaleMap[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: t.site.title,
      description: t.site.description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}`])),
        "x-default": `${SITE_URL}/en`,
      },
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
      <div className="site-container pb-[80px] md:pb-0">
        {children}
      </div>
      <MobileTabs />
    </LocaleProvider>
  );
}
