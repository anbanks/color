"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { Search, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { locale } = useLocale();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 shrink-0"
        >
          <span className="text-2xl">🎨</span>
          <span className="text-lg font-semibold text-gray-800 hidden sm:inline">
            Color
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search palettes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  router.push(`/${locale}?tag=${query.trim().toLowerCase()}`);
                  setSearchOpen(false);
                  setQuery("");
                }
              }}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50/50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
            />
          </div>

          {/* Search dropdown */}
          {searchOpen && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
              <p className="text-xs font-medium text-gray-500 mb-2">Collections</p>
              <div className="flex flex-wrap gap-2">
                {["Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark", "Warm", "Cold", "Summer", "Fall", "Winter", "Nature", "Earth", "Sunset", "Ocean", "Rainbow", "Gradient"].map((tag) => (
                  <button
                    key={tag}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      router.push(`/${locale}?tag=${tag.toLowerCase()}`);
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-full text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-gray-50 transition-colors outline-none">
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
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>
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
