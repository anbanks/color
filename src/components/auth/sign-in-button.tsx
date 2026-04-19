"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";
import { useAuthModal } from "./auth-modal-provider";

export function SignInButton() {
  const { t } = useLocale();
  const { openAuth } = useAuthModal();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-gray-500 hover:text-gray-700 cursor-pointer"
      onClick={() => openAuth("login")}
    >
      {t.auth.login}
    </Button>
  );
}
