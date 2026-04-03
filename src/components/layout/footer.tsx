"use client";

import { useLocale } from "@/lib/locale-context";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

const localeLabels: Record<string, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

export function Footer() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <footer className="mt-auto py-8 text-center text-sm text-gray-400">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Color. {locale === "pt" ? "Todos os direitos reservados." : locale === "es" ? "Todos los derechos reservados." : "All rights reserved."}</p>
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5" />
          {Object.entries(localeLabels).map(([code, label]) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={`text-xs transition-colors ${
                locale === code
                  ? "text-gray-700 font-medium"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
