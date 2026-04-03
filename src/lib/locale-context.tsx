"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./i18n";
import en from "@/messages/en.json";

type Dictionary = typeof en;

const LocaleContext = createContext<{ locale: Locale; t: Dictionary }>({
  locale: "en",
  t: en,
});

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
