"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";

export function SignInButton() {
  const { locale, t } = useLocale();

  return (
    <Link href={`/${locale}/login`}>
      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
        {t.auth.login}
      </Button>
    </Link>
  );
}
