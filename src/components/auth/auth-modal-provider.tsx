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

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");

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
