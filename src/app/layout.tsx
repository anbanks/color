import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import { GAPageView } from "@/components/analytics/ga-pageview";
import { isValidLocale, defaultLocale } from "@/lib/i18n";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Discover Beautiful Color Palettes | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Discover, create and share beautiful color palettes. A curated collection of color inspiration for designers and developers.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Discover Beautiful Color Palettes`,
    description:
      "Discover, create and share beautiful color palettes. A curated collection of color inspiration for designers and developers.",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Discover Beautiful Color Palettes`,
    description:
      "Discover, create and share beautiful color palettes. A curated collection of color inspiration for designers and developers.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const headerLocale = hdrs.get("x-locale") ?? "";
  const lang = isValidLocale(headerLocale) ? headerLocale : defaultLocale;

  let gaId = "";
  try {
    const { env } = await getCloudflareContext({ async: true });
    gaId = (await env.CACHE.get("settings:GA_MEASUREMENT_ID")) || "";
  } catch {
    // CACHE not available (e.g. during local build) — skip GA
  }

  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(typeof __name==='undefined'){globalThis.__name=function(f,n){try{Object.defineProperty(f,'name',{value:n,configurable:true})}catch(e){}return f}}" +
              ";if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}" +
              ";window.__pwaPrompt=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaPrompt=e})",
          }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}', { send_page_view: false });`}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </Providers>
        {gaId && (
          <Suspense fallback={null}>
            <GAPageView measurementId={gaId} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
