"use client";

import { useLocale } from "@/lib/locale-context";

export function RightPanel() {
  const { t } = useLocale();

  return (
    <div>
      <h2 className="text-[22px] font-bold text-gray-900 dark:text-white leading-snug">
        {t.rightPanel.title}
      </h2>
      <p className="text-[14px] text-gray-500 dark:text-white/50 mt-2 leading-relaxed">
        {t.rightPanel.description}
      </p>

      <div className="mt-8 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 p-4 text-center">
        <p className="text-[11px] text-gray-300 dark:text-white/20 uppercase tracking-wider">Ad Space</p>
      </div>
    </div>
  );
}
