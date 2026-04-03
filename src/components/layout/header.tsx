"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { Search, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SEARCH_TAGS = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Gradient",
  "Sunset", "Sky", "Sea", "Coffee", "Wedding",
];

export function Header() {
  const { locale } = useLocale();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const selectTag = (tag: string) => {
    router.push(`/${locale}/palettes/${tag.toLowerCase()}`);
    setSearchOpen(false);
    setQuery("");
  };

  const clearTag = () => {
    router.push(`/${locale}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🎨</span>
          <span className="text-lg font-bold text-gray-800 hidden sm:inline">Color</span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-auto relative">
          <div className="relative flex items-center border border-gray-200 rounded-full bg-gray-50/50 hover:bg-white focus-within:bg-white focus-within:border-gray-300 transition-colors">
            {activeTag ? (
              <div className="flex items-center gap-1 ml-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}
                  <button onClick={clearTag} className="ml-0.5 hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
            <input
              type="text"
              placeholder={activeTag ? "Add tag" : "Search palettes"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  selectTag(query.trim());
                }
              }}
              className={`w-full h-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent ${activeTag ? "pl-2" : "pl-10"}`}
            />
            {activeTag && (
              <button onClick={clearTag} className="pr-3 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {searchOpen && !activeTag && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
              <p className="text-xs font-semibold text-gray-800 mb-3">Collections</p>
              <div className="flex flex-wrap gap-2">
                {SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectTag(tag);
                    }}
                    className="px-3.5 py-1.5 text-sm border border-gray-200 rounded-full text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
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
          <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-gray-50 transition-colors outline-none shrink-0">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>
              <Link href={`/${locale}`} className="w-full">Palettes</Link>
            </DropdownMenuItem>
            {session?.user ? (
              <>
                <DropdownMenuItem>
                  <Link href={`/${locale}/create`} className="w-full">Create</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/${locale}/collections`} className="w-full">Collection</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/${locale}/admin`} className="w-full">Admin</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem>
                <Link href={`/${locale}/login`} className="w-full">Login</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
