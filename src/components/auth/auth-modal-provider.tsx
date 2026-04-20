"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

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
  const checked = useRef(false);

  // Check URL param after hydration (runs once on first render in browser)
  if (typeof window !== "undefined" && !checked.current) {
    checked.current = true;
    const param = new URLSearchParams(window.location.search).get("auth");
    if (param === "login" || param === "register") {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + url.search);
      // Schedule open after hydration completes
      setTimeout(() => {
        setView(param);
        setOpen(true);
      }, 0);
    }
  }

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
