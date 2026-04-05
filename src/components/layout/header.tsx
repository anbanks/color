"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { X, Search, MoreHorizontal, Sun, Moon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const SEARCH_COLORS = [
  { name: "Blue", hex: "#5B9BD5" },
  { name: "Teal", hex: "#2BBBB0" },
  { name: "Mint", hex: "#7DDDB3" },
  { name: "Green", hex: "#5CB85C" },
  { name: "Sage", hex: "#9CAF88" },
  { name: "Yellow", hex: "#F0D264" },
  { name: "Beige", hex: "#E8D8B8" },
  { name: "Brown", hex: "#8B6914" },
  { name: "Orange", hex: "#D4922A" },
  { name: "Peach", hex: "#E8927C" },
  { name: "Red", hex: "#E8524A" },
  { name: "Maroon", hex: "#800000" },
  { name: "Pink", hex: "#E88CB4" },
  { name: "Purple", hex: "#B47CC7" },
  { name: "Navy", hex: "#2C3E7B" },
  { name: "Black", hex: "#333333" },
  { name: "Grey", hex: "#CCCCCC" },
  { name: "White", hex: "#F5F5F0" },
];

const SEARCH_COLLECTIONS = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Gradient",
  "Sunset", "Sky", "Sea", "Kids", "Skin", "Food", "Cream",
  "Coffee", "Wedding", "Christmas", "Halloween",
];

export function Header() {
  const { locale } = useLocale();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Detect active tag from URL /palettes/[tag]
  const tagMatch = pathname.match(/\/palettes\/([^/]+)/);
  const activeTag = tagMatch ? tagMatch[1] : null;

  const selectTag = (tag: string) => {
    router.push(`/${locale}/palettes/${tag.toLowerCase()}`);
    setSearchOpen(false);
    setQuery("");
  };

  const clearTag = () => {
    router.push(`/${locale}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-10 bg-white dark:bg-[#1a1a1a] border-b border-transparent dark:border-white/[0.06]" style={{ padding: "10px 0" }}>
      <div className="site-container flex items-center">
        {/* Logo — .left min-width:200px */}
        <div className="min-w-[200px] shrink-0 hidden md:block px-5 box-border">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <span className="text-[26px] group-hover:scale-105 transition-transform">🎨</span>
            <span className="text-[17px] font-bold text-gray-900 dark:text-white tracking-[-0.01em]">
              Color
            </span>
          </Link>
        </div>
        {/* Logo mobile */}
        <div className="md:hidden pl-4 pr-2">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <span className="text-[24px]">🎨</span>
            <span className="text-[16px] font-bold text-gray-900 dark:text-white">Color</span>
          </Link>
        </div>

        {/* Search — .middle width:100% */}
        <div className="w-full relative px-5 box-border">
          <div className="relative flex items-center h-[42px] border border-gray-200/80 dark:border-white/10 rounded-full bg-[#fafafa] dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-gray-300 dark:focus-within:border-white/20 focus-within:shadow-sm transition-all">
            {activeTag ? (
              <div className="flex items-center ml-3">
                <span className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-[3px] rounded-full text-[13px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-[7px] h-[7px] rounded-full bg-emerald-400" />
                  {activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}
                  <button onClick={clearTag} className="ml-0.5 p-0.5 rounded-full hover:bg-emerald-100 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            ) : (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-gray-400" strokeWidth={1.5} />
            )}
            <input
              type="text"
              placeholder={activeTag ? "Add tag" : "Search palettes"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) selectTag(query.trim());
                if (e.key === "Escape") setSearchOpen(false);
              }}
              className={`w-full h-full pr-4 text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent ${activeTag ? "pl-2.5" : "pl-[42px]"}`}
            />
            {activeTag && (
              <button onClick={clearTag} className="pr-3.5 text-gray-400 hover:text-gray-500 transition-colors">
                <X className="h-[15px] w-[15px]" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {searchOpen && !activeTag && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-gray-200/80 rounded-2xl shadow-xl shadow-black/[0.06] p-5 z-50">
              {/* Colors */}
              <p className="text-[14px] font-semibold text-gray-900 mb-3">Colors</p>
              <div className="flex flex-wrap gap-[7px] mb-6">
                {SEARCH_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onMouseDown={(e) => { e.preventDefault(); selectTag(c.name); }}
                    className="inline-flex items-center gap-[7px] px-3 py-[6px] text-[13px] border border-gray-200 rounded-full text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all"
                  >
                    <span className="w-[13px] h-[13px] rounded-full shrink-0 border border-black/[0.06]" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Collections */}
              <p className="text-[14px] font-semibold text-gray-900 mb-3">Collections</p>
              <div className="flex flex-wrap gap-[7px]">
                {SEARCH_COLLECTIONS.map((tag) => (
                  <button
                    key={tag}
                    onMouseDown={(e) => { e.preventDefault(); selectTag(tag); }}
                    className="px-3.5 py-[7px] text-[13px] border border-gray-200 rounded-full text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Menu — .right min-width:340px */}
        <div className="min-w-[340px] max-w-[340px] shrink-0 hidden xl:flex items-center justify-end gap-1.5 px-5 box-border">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-[38px] px-[10px] rounded-full flex items-center gap-[5px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors outline-none text-[13px] text-gray-500 dark:text-white/60">
              <Globe className="h-[15px] w-[15px]" strokeWidth={1.5} />
              {locale.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl shadow-xl shadow-black/[0.06] border-gray-200/80 p-1.5">
              {[
                { code: "en", label: "English" },
                { code: "pt", label: "Português" },
                { code: "es", label: "Español" },
              ].map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  className={cn("rounded-lg px-3 py-2 text-[13px] cursor-pointer", locale === lang.code && "font-medium")}
                  onClick={() => {
                    const segments = pathname.split("/");
                    segments[1] = lang.code;
                    router.push(segments.join("/"));
                  }}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-[38px] w-[38px] rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px] text-yellow-400" strokeWidth={1.5} />
            ) : (
              <Moon className="h-[18px] w-[18px] text-gray-500" strokeWidth={1.5} />
            )}
          </button>

          {/* Avatar quando logado */}
          {session?.user && (
            <div className="h-[32px] w-[32px] rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[13px] font-semibold text-gray-500 dark:text-white/70">
              {session.user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-0.5 outline-none">
              <div className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="h-[20px] w-[20px] text-gray-700 dark:text-white/70" strokeWidth={2} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl shadow-black/[0.06] border-gray-200/80 p-1.5">
              <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]">
                <Link href={`/${locale}`} className="w-full">Palettes</Link>
              </DropdownMenuItem>
              {session?.user ? (
                <>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]">
                    <Link href={`/${locale}/create`} className="w-full">Create</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]">
                    <Link href={`/${locale}/collections`} className="w-full">Collection</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]">
                    <Link href={`/${locale}/admin`} className="w-full">Admin</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]" onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]">
                  <Link href={`/${locale}/login`} className="w-full">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
