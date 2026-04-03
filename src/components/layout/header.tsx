import Link from "next/link";
import { NavCategories } from "./nav-categories";
import { UserButton } from "@/components/auth/user-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-gray-800 tracking-tight">
          Color
        </Link>

        <NavCategories />

        <UserButton />
      </div>
    </header>
  );
}
