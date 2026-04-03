"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn } from "lucide-react";

export function SignInButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          <LogIn className="h-4 w-4 mr-1.5" />
          Login
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => signIn("google")}>
          Continue with Google
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signIn("github")}>
          Continue with GitHub
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
