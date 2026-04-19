"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type AuthView = "login" | "register";

interface AuthModalContextValue {
  open: boolean;
  view: AuthView;
  openAuth: (view?: AuthView) => void;
  closeAuth: () => void;
  switchView: (view: AuthView) => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  open: false,
  view: "login",
  openAuth: () => {},
  closeAuth: () => {},
  switchView: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Open modal when ?auth=login or ?auth=register is in URL
  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "register") {
      setView(authParam);
      setOpen(true);
      // Clean the URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  const openAuth = useCallback((v: AuthView = "login") => {
    setView(v);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  const switchView = useCallback((v: AuthView) => setView(v), []);

  return (
    <AuthModalContext value={{ open, view, openAuth, closeAuth, switchView }}>
      {children}
    </AuthModalContext>
  );
}
