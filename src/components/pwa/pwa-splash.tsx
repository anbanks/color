"use client";

import { useEffect, useState } from "react";
import { LogoDrop } from "@/components/logo-drop";

export function PwaSplash() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;

    try {
      if (sessionStorage.getItem("colorgrid_splash_seen")) return;
      sessionStorage.setItem("colorgrid_splash_seen", "1");
    } catch {
      return;
    }

    setShow(true);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const hideTimer = setTimeout(() => setShow(false), 1800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] transition-opacity duration-400 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <LogoDrop className="h-20 w-20 text-gray-900 dark:text-white" />
      <span className="mt-4 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Color Grid
      </span>
    </div>
  );
}
