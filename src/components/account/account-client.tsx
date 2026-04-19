"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AvatarUpload } from "./avatar-upload";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
];

interface AccountClientProps {
  user: { name: string | null; email: string | null; image: string | null };
}

export function AccountClient({ user }: AccountClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, t } = useLocale();
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [profilePending, startProfileTransition] = useTransition();

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error(t.account.nameEmailRequired);
      return;
    }
    startProfileTransition(async () => {
      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        });
        const data = (await res.json()) as { error?: string };
        if (res.ok) {
          toast.success(t.account.profileUpdated);
          router.refresh();
        } else {
          toast.error(data.error || "Failed");
        }
      } catch {
        toast.error("Failed");
      }
    });
  };

  const switchLocale = (code: string) => {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
    setLangOpen(false);
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error(t.account.passwordMismatch);
      return;
    }
    if (next.length < 6) {
      toast.error(t.account.passwordTooShort);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword: current, newPassword: next }),
        });
        const data = (await res.json()) as { error?: string };
        if (res.ok) {
          toast.success(t.account.passwordChanged);
          setCurrent("");
          setNext("");
          setConfirm("");
        } else {
          toast.error(data.error || "Failed");
        }
      } catch {
        toast.error("Failed");
      }
    });
  };

  const active = LANGUAGES.find((l) => l.code === locale);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">
          {t.account.title}
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-white/40 mt-0.5">
          {t.account.subtitle}
        </p>
      </div>

      {/* Profile */}
      <section className="border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5 mb-5">
        <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">
          {t.account.profile}
        </h2>
        <div className="mb-5">
          <AvatarUpload initialImage={user.image} name={user.name} />
        </div>
        <form onSubmit={submitProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-[12px] text-gray-500 dark:text-white/40">
                {t.account.name}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[12px] text-gray-500 dark:text-white/40">
                {t.account.email}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={profilePending} size="lg" className="min-w-[140px]">
              {profilePending ? t.account.saving : t.account.save}
            </Button>
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5 mb-5">
        <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">
          {t.account.changePassword}
        </h2>
        <form onSubmit={submitPassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current" className="text-[12px] text-gray-500 dark:text-white/40">
                {t.account.currentPassword}
              </Label>
              <Input
                id="current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="mt-1 h-10"
                required
              />
            </div>
            <div>
              <Label htmlFor="next" className="text-[12px] text-gray-500 dark:text-white/40">
                {t.account.newPassword}
              </Label>
              <Input
                id="next"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="mt-1 h-10"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm" className="text-[12px] text-gray-500 dark:text-white/40">
                {t.account.confirmNewPassword}
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 h-10"
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} size="lg" className="min-w-[140px]">
              {pending ? t.account.updating : t.account.update}
            </Button>
          </div>
        </form>
      </section>

      {/* Theme */}
      <section className="border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5 mb-5">
        <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">
          {t.account.theme}
        </h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="min-w-24"
          >
            <Sun className="mr-1.5 size-4" />
            {t.account.light}
          </Button>
          <Button
            type="button"
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="min-w-24"
          >
            <Moon className="mr-1.5 size-4" />
            {t.account.dark}
          </Button>
        </div>
      </section>

      {/* Language */}
      <section className="border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-5">
        <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">
          {t.account.language}
        </h2>
        <Popover open={langOpen} onOpenChange={setLangOpen}>
          <PopoverTrigger
            className="flex items-center justify-between w-full max-w-xs h-10 px-3 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[14px] text-gray-800 dark:text-white/90 hover:border-gray-300 dark:hover:border-white/25 transition-colors cursor-pointer outline-none"
          >
            {active?.label ?? locale}
            <ChevronsUpDown className="ml-2 size-4 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t.account.searchLanguage} />
              <CommandList>
                <CommandEmpty>{t.account.noResults}</CommandEmpty>
                <CommandGroup>
                  {LANGUAGES.map((lang) => (
                    <CommandItem
                      key={lang.code}
                      value={`${lang.code} ${lang.label}`}
                      onSelect={() => switchLocale(lang.code)}
                      className={cn(
                        "cursor-pointer",
                        locale === lang.code && "font-medium"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          locale === lang.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {lang.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </section>

      {/* Danger zone */}
      <section className="border border-red-200 dark:border-red-900/30 rounded-xl p-5">
        <h2 className="text-[14px] font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-white/40 mb-4">
          Permanently delete your account and all associated data.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
          onClick={() => setDeleteOpen(true)}
        >
          Delete Account
        </Button>
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Account"
          description="Are you sure? This will permanently delete your account and all associated data. This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            fetch("/api/account/delete", { method: "POST" }).then(() => {
              signOut({ callbackUrl: "/" });
            });
          }}
        />
      </section>
    </div>
  );
}
