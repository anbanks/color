"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { AuthModal } from "@/components/auth/auth-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme" disableTransitionOnChange>
      <SessionProvider>
        <AuthModalProvider>
          {children}
          <AuthModal />
        </AuthModalProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
