"use client";

import { useLocale } from "@/lib/locale-context";

export function RightPanel() {
  const { t } = useLocale();

  return (
    <div>
      <h2 className="text-[22px] font-bold text-gray-900 leading-snug">
        Color Palettes for Designers and Artists
      </h2>
      <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
        {t.site.description}
      </p>

      {/* Ad placeholder */}
      <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center">
        <p className="text-[11px] text-gray-300 uppercase tracking-wider">Ad Space</p>
      </div>
    </div>
  );
}
