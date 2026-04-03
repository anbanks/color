"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { X } from "lucide-react";
import { MaterialIcon } from "@/components/ui/material-icon";
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100/80">
      <div className="px-5 sm:px-8 h-[60px] flex items-center gap-5">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0 group">
          <span className="text-[26px] group-hover:scale-105 transition-transform">🎨</span>
          <span className="text-[17px] font-bold text-gray-900 tracking-[-0.01em] hidden sm:inline">
            Color
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-[640px] mx-auto relative">
          <div className="relative flex items-center h-[42px] border border-gray-200/80 rounded-full bg-[#fafafa] hover:bg-white hover:border-gray-300 focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all">
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
              <MaterialIcon name="search" size={18} weight={300} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
              <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wide mb-3">Collections</p>
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

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors outline-none shrink-0">
            <MaterialIcon name="more_horiz" size={22} weight={400} className="text-gray-700" />
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
    </header>
  );
}
