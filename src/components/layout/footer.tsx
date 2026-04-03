"use client";

import { useLocale } from "@/lib/locale-context";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

export function Footer() {
  const { locale, t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <footer className="mt-auto border-t border-gray-50 py-10">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-gray-400">
          &copy; {new Date().getFullYear()} Color. {t.footer.rights}
        </p>
        <div className="flex items-center gap-1.5">
          <Globe className="h-[13px] w-[13px] text-gray-400 mr-1" />
          {Object.entries(localeLabels).map(([code, label]) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={cn(
                "px-2 py-1 text-[12px] rounded-md transition-colors",
                locale === code
                  ? "text-gray-800 font-medium bg-gray-50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
