import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import { isValidLocale, defaultLocale } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Color Magic — Discover Beautiful Color Palettes",
    template: "%s | Color Magic",
  },
  description:
    "Discover, create and share beautiful color palettes. A curated collection of color inspiration for designers and developers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const headerLocale = hdrs.get("x-locale") ?? "";
  const lang = isValidLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
