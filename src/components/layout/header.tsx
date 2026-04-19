"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { X, Search, MoreHorizontal, Sun, Moon, Globe, ChevronDown, User, LogOut, Plus, Bookmark } from "lucide-react";
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
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogoDrop } from "@/components/logo-drop";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tagLabel, colorLabel, COLOR_SLUGS, TAG_SLUGS } from "@/lib/tag-labels";

const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
];

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
  const { locale, t } = useLocale();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { openAuth } = useAuthModal();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Detect active tag from URL /palettes/[tag]
  const tagMatch = pathname.match(/\/palettes\/([^/]+)/);
  const activeTagSlug = tagMatch ? tagMatch[1] : null;
  const activeTag = activeTagSlug;

  // Translate the slug to the current locale display name.
  const activeTagLabel = (() => {
    if (!activeTagSlug) return "";
    const cap = activeTagSlug.charAt(0).toUpperCase() + activeTagSlug.slice(1);
    if ((COLOR_SLUGS as readonly string[]).includes(cap)) return colorLabel(cap, locale);
    if ((TAG_SLUGS as readonly string[]).includes(cap)) return tagLabel(cap, locale);
    return cap;
  })();

  const selectTag = (tag: string) => {
    router.push(`/${locale}/palettes/${tag.toLowerCase()}`);
    setSearchOpen(false);
    setQuery("");
  };

  const clearTag = () => {
    router.push(`/${locale}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-10 bg-white dark:bg-[#1a1a1a]" style={{ padding: "10px 0" }}>
      <div className="site-container flex items-center">
        {/* Logo — .left min-width:200px */}
        <div className="min-w-[200px] shrink-0 hidden md:block px-5 box-border">
          <Link href={`/${locale}`} className="logo flex items-center gap-2.5 group">
            <LogoDrop className="h-[30px] w-[30px] shrink-0 text-gray-900 dark:text-white" />
            <span className="text-[19px] font-semibold tracking-tight text-gray-900 dark:text-white">Color Grid</span>
          </Link>
        </div>
        {/* Logo mobile — icon only */}
        <div className="md:hidden pl-4 pr-2 shrink-0">
          <Link href={`/${locale}`} className="logo flex items-center">
            <LogoDrop className="h-[28px] w-[28px] shrink-0 text-gray-900 dark:text-white" />
          </Link>
        </div>

        {/* Search — always visible on desktop, full width */}
        <div className="w-full px-5 box-border">
          <div className="relative">
            <div className="relative flex items-center h-[42px] border border-gray-200/80 dark:border-white/10 rounded-full bg-[#fafafa] dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-gray-300 dark:focus-within:border-white/20 transition-all">
              {activeTag ? (
                <div className="flex items-center ml-3">
                  <span className="inline-flex items-center gap-1 pl-3 pr-1 py-[3px] rounded-full text-[13px] font-medium bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white/90 border border-gray-200 dark:border-white/15">
                    {activeTagLabel}
                    <button
                      onClick={clearTag}
                      aria-label="Clear filter"
                      className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Clear filter</span>
                    </button>
                  </span>
                </div>
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-gray-500 dark:text-white/50" strokeWidth={1.5} />
              )}
              <input
                type="text"
                placeholder={activeTag ? t.search.addTag : t.search.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) selectTag(query.trim());
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                className={`w-full h-full pr-4 text-[14px] text-gray-700 dark:text-white/90 placeholder:text-gray-500 dark:placeholder:text-white/40 focus:outline-none bg-transparent ${activeTag ? "pl-2.5" : "pl-[42px]"}`}
              />
              {activeTag && (
                <button
                  onClick={clearTag}
                  aria-label="Clear search"
                  className="pr-3.5 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-[15px] w-[15px]" aria-hidden="true" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>

            {searchOpen && !activeTag && (
              <div className="fixed md:absolute top-[64px] md:top-[calc(100%+6px)] left-0 right-0 md:left-0 md:right-0 bg-white dark:bg-[#252525] border-t md:border border-gray-200/80 dark:border-white/10 rounded-none md:rounded-2xl shadow-xl shadow-black/[0.06] p-5 z-50 max-h-[calc(100vh-64px-62px)] md:max-h-none overflow-y-auto">
                <p className="text-[14px] font-semibold text-gray-900 dark:text-white mb-3">{t.search.colors}</p>
                <div className="flex flex-wrap gap-[7px] mb-6">
                  {SEARCH_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onMouseDown={(e) => { e.preventDefault(); selectTag(c.name); }}
                      className="inline-flex items-center gap-[7px] px-3 py-[6px] text-[13px] border border-gray-200 dark:border-white/15 rounded-full text-gray-700 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                      <span className="w-[13px] h-[13px] rounded-full shrink-0 border border-black/[0.06]" style={{ backgroundColor: c.hex }} />
                      {colorLabel(c.name, locale)}
                    </button>
                  ))}
                </div>
                <p className="text-[14px] font-semibold text-gray-900 dark:text-white mb-3">{t.search.collections}</p>
                <div className="flex flex-wrap gap-[7px]">
                  {SEARCH_COLLECTIONS.map((tag) => (
                    <button
                      key={tag}
                      onMouseDown={(e) => { e.preventDefault(); selectTag(tag); }}
                      className="px-3.5 py-[7px] text-[13px] border border-gray-200 dark:border-white/15 rounded-full text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white transition-all cursor-pointer"
                    >
                      {tagLabel(tag, locale)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu — right side (profile/more always, lang/theme xl+) */}
        <div className="shrink-0 flex items-center justify-end gap-1.5 px-3 md:px-5 box-border xl:min-w-[340px] xl:max-w-[340px]">
          {/* Language selector — xl+ only */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Language"
              className="h-[38px] px-[10px] rounded-full hidden xl:flex items-center gap-[5px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors outline-none text-[13px] text-gray-500 dark:text-white/60 cursor-pointer"
            >
              <Globe className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
              {locale.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl shadow-black/[0.06] border-gray-200/80 dark:border-white/10 dark:bg-[#252525] p-1.5">
              <ScrollArea className="h-[260px] pr-2">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    className={cn("rounded-lg px-3 py-2 text-[13px] cursor-pointer", locale === lang.code && "font-medium bg-gray-50 dark:bg-white/[0.04]")}
                    onClick={() => {
                      const segments = pathname.split("/");
                      segments[1] = lang.code;
                      router.push(segments.join("/"));
                    }}
                  >
                    {lang.label}
                    {locale === lang.code && <span className="ml-auto text-[11px] text-gray-400">✓</span>}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle — xl+ only */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-[38px] w-[38px] rounded-full hidden xl:flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px] text-yellow-400" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-gray-500" strokeWidth={1.5} aria-hidden="true" />
            )}
            <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
          </button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t.menu.myAccount}
                className="group flex items-center gap-1.5 ml-1 pl-1 pr-2 h-[38px] rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors outline-none cursor-pointer"
              >
                <div className="h-[30px] w-[30px] rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[13px] font-semibold text-gray-500 dark:text-white/70" aria-hidden="true">
                  {session.user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <ChevronDown className="h-[15px] w-[15px] text-gray-500 dark:text-white/50 transition-transform duration-200 group-data-[popup-open]:rotate-180" strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">{t.menu.myAccount}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl shadow-black/[0.06] border-gray-200/80 dark:border-white/10 dark:bg-[#252525] p-1.5">
                {(session.user as { role?: string }).role === "admin" && (
                  <>
                    <DropdownMenuItem
                      render={<Link href={`/${locale}/admin`} />}
                      className="rounded-lg px-3 py-2 text-[13px] cursor-pointer"
                    >
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      {t.menu.admin}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  render={<Link href={`/${locale}/create`} />}
                  className="rounded-lg px-3 py-2 text-[13px] cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2 text-gray-500" />
                  {t.palette.createTitle}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={`/${locale}/collections`} />}
                  className="rounded-lg px-3 py-2 text-[13px] cursor-pointer"
                >
                  <Bookmark className="h-4 w-4 mr-2 text-gray-500" />
                  {t.collections.title}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={`/${locale}/account`} />}
                  className="rounded-lg px-3 py-2 text-[13px] cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  {t.menu.myAccount}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg px-3 py-2 text-[13px] cursor-pointer text-red-600 dark:text-red-400"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.menu.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Menu"
                className="flex items-center gap-0.5 outline-none cursor-pointer"
              >
                <div className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <MoreHorizontal className="h-[20px] w-[20px] text-gray-700 dark:text-white/70" strokeWidth={2} aria-hidden="true" />
                </div>
                <span className="sr-only">Menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl shadow-black/[0.06] border-gray-200/80 dark:border-white/10 dark:bg-[#252525] p-1.5">
                <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px]">
                  <Link href={`/${locale}`} className="w-full">{t.menu.palettes}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg px-3 py-2 text-[13px] cursor-pointer"
                  onClick={() => openAuth("login")}
                >
                  {t.menu.login}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="xl:hidden" />
                <DropdownMenuItem
                  className="xl:hidden rounded-lg px-3 py-2 text-[13px] cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2 text-yellow-400" /> : <Moon className="h-4 w-4 mr-2 text-gray-500" />}
                  {theme === "dark" ? "Light" : "Dark"}
                </DropdownMenuItem>
                <div className="xl:hidden">
                  <ScrollArea className="max-h-[220px]">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        className={cn("rounded-lg px-3 py-2 text-[13px] cursor-pointer", locale === lang.code && "font-medium")}
                        onClick={() => {
                          const segments = pathname.split("/");
                          segments[1] = lang.code;
                          router.push(segments.join("/"));
                        }}
                      >
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        {lang.label}
                        {locale === lang.code && <span className="ml-auto text-[11px] text-gray-400">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
