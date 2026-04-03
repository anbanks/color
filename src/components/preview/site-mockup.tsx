"use client";

import { getContrastColor } from "@/lib/color-utils";

interface SiteMockupProps {
  colors: string[];
}

export function SiteMockup({ colors }: SiteMockupProps) {
  const bg = colors[0] || "#ffffff";
  const nav = colors[1] || "#333333";
  const accent = colors[2] || "#0066ff";
  const text = colors[3] || "#111111";
  const navText = getContrastColor(nav);
  const accentText = getContrastColor(accent);
  const bgText = getContrastColor(bg);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
      <div
        className="rounded-xl overflow-hidden shadow-sm border border-gray-100 text-xs"
        style={{ backgroundColor: bg }}
      >
        {/* Nav */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: nav }}
        >
          <span className="font-semibold" style={{ color: navText === "white" ? "#fff" : "#000" }}>
            Brand
          </span>
          <div className="flex gap-3" style={{ color: navText === "white" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>
            <span>Home</span>
            <span>About</span>
            <span>Contact</span>
          </div>
        </div>

        {/* Hero */}
        <div className="px-4 py-6 text-center">
          <h2
            className="text-base font-bold mb-1"
            style={{ color: text }}
          >
            Welcome to our site
          </h2>
          <p
            className="text-[10px] mb-3 opacity-70"
            style={{ color: text }}
          >
            A beautiful experience crafted with care
          </p>
          <button
            className="px-4 py-1.5 rounded-full text-[10px] font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: accent, color: accentText === "white" ? "#fff" : "#000" }}
          >
            Get Started
          </button>
        </div>

        {/* Cards */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-lg p-3 border"
              style={{
                borderColor: bgText === "white" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                backgroundColor: bgText === "white" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              }}
            >
              <div
                className="w-full h-8 rounded mb-2"
                style={{ backgroundColor: accent, opacity: 0.15 }}
              />
              <div
                className="text-[10px] font-medium mb-0.5"
                style={{ color: text }}
              >
                Card Title {n}
              </div>
              <div
                className="text-[9px] opacity-50"
                style={{ color: text }}
              >
                Short description here
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center">
        Color 1: Background · Color 2: Navigation · Color 3: Accent · Color 4: Text
      </p>
    </div>
  );
}
