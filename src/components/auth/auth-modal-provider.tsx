"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

  // Check URL param after mount (not during render)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("auth");
    if (param === "login" || param === "register") {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + url.search);
      setView(param);
      setOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
