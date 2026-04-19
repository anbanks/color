"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogoDrop } from "@/components/logo-drop";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { locale, t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t.account.passwordMismatch);
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        toast.success(t.account.passwordChanged);
        router.push(`/${locale}/login`);
      } else {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error || "Failed");
      }
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#1a1a1a] px-4">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex flex-col items-center text-center">
          <Link href={`/${locale}`} className="logo flex items-center gap-2.5">
            <LogoDrop className="h-[38px] w-[38px] shrink-0 text-gray-900 dark:text-white" />
            <span className="text-[26px] font-semibold tracking-tight text-gray-900 dark:text-white">Color Grid</span>
          </Link>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-2">
            {token ? "Set a new password" : "Reset your password"}
          </p>
        </div>

        {!token && !sent && (
          <form onSubmit={handleForgot} className="space-y-4">
            <label htmlFor="reset-email" className="sr-only">{t.auth.email}</label>
            <Input id="reset-email" type="email" placeholder={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            <Button type="submit" className="w-full h-11 cursor-pointer" disabled={isPending}>
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}

        {!token && sent && (
          <p className="text-center text-sm text-gray-500 dark:text-white/50">
            If an account with that email exists, we sent a reset link. Check your inbox.
          </p>
        )}

        {token && (
          <form onSubmit={handleReset} className="space-y-4">
            <label htmlFor="new-pw" className="sr-only">{t.account.newPassword}</label>
            <Input id="new-pw" type="password" placeholder={t.account.newPassword} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11" />
            <label htmlFor="confirm-pw" className="sr-only">{t.account.confirmNewPassword}</label>
            <Input id="confirm-pw" type="password" placeholder={t.account.confirmNewPassword} value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} className="h-11" />
            <Button type="submit" className="w-full h-11 cursor-pointer" disabled={isPending}>
              {isPending ? t.account.updating : t.account.update}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 dark:text-white/40">
          <Link href={`/${locale}/login`} className="text-gray-700 dark:text-white/80 font-medium hover:underline">
            {t.auth.signInLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
