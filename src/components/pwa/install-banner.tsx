"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { LogoDrop } from "@/components/logo-drop";

const LS_KEY = "colorgrid_pwa_dismissed";
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(LS_KEY);
      if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 86400000) return;
    } catch {
      // ignore
    }

    // The inline head script already calls preventDefault() on
    // beforeinstallprompt and stashes it on window.__pwaPrompt so the
    // native Chrome mini-infobar never shows.
    const win = window as Window & { __pwaPrompt?: BeforeInstallPromptEvent | null };
    if (win.__pwaPrompt) {
      setDeferredPrompt(win.__pwaPrompt);
      setVisible(true);
      return;
    }

    // Fallback: event hasn't fired yet.
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(LS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const { t } = useLocale();

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="flex items-center gap-3 bg-white dark:bg-[#252525] rounded-2xl shadow-2xl shadow-black/15 ring-1 ring-black/5 dark:ring-white/10 px-4 py-3">
        <LogoDrop className="h-10 w-10 shrink-0 text-gray-900 dark:text-white" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
            Color Grid
          </p>
          <p className="text-[12px] text-gray-500 dark:text-white/50 leading-tight mt-0.5">
            {t.pwa.quickAccess}
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-medium rounded-lg cursor-pointer"
        >
          {t.pwa.install}
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white/70 cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
