"use client";

import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "./sign-in-button";
import { LogOut, Plus, Bookmark } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { useLocalePath } from "@/hooks/use-locale-path";
import Link from "next/link";

export function UserButton() {
  const { data: session } = useSession();
  const { t } = useLocale();
  const lp = useLocalePath();

  if (!session?.user) {
    return <SignInButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors outline-none">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {session.user.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <span className="text-sm text-gray-700 hidden sm:inline">
          {session.user.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href={lp("/create")} className="flex items-center w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t.palette.createTitle}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={lp("/collections")} className="flex items-center w-full">
            <Bookmark className="h-4 w-4 mr-2" />
            {t.collections.title}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
