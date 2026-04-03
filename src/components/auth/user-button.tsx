"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "./sign-in-button";
import { LogOut, Plus, Bookmark } from "lucide-react";
import Link from "next/link";

export function UserButton() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <SignInButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="gap-2">
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href="/create" className="flex items-center w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Palette
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/collections" className="flex items-center w-full">
            <Bookmark className="h-4 w-4 mr-2" />
            My Collections
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
