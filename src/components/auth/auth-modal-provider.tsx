"use client";

import { createContext, useCallback, useContext, useState } from "react";

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

function getAuthFromUrl(): { open: boolean; view: AuthView } {
  if (typeof window === "undefined") return { open: false, view: "login" };
  const param = new URLSearchParams(window.location.search).get("auth");
  if (param === "login" || param === "register") {
    // Clean param from URL immediately
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.replaceState({}, "", url.pathname + url.search);
    return { open: true, view: param };
  }
  return { open: false, view: "login" };
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(() => getAuthFromUrl().open);
  const [view, setView] = useState<AuthView>(() => getAuthFromUrl().view);

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
