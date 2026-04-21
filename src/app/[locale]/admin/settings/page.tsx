"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Key, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Settings {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  AI_PROVIDER: string;
  AI_PAUSED: string;
}

interface ModelOption {
  id: string;
  name: string;
  free: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ RESEND_API_KEY: "", RESEND_FROM_EMAIL: "", OPENROUTER_API_KEY: "", OPENROUTER_MODEL: "", OPENAI_API_KEY: "", OPENAI_MODEL: "gpt-4o-mini", AI_PROVIDER: "openrouter", AI_PAUSED: "false" });
  const [loading, setLoading] = useState(true);
  const [resendPending, startResendTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [testPending, startTestTransition] = useTransition();
  const [aiTestPending, startAiTestTransition] = useTransition();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const { settings: s } = data as { settings: Settings };
        setSettings(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("https://openrouter.ai/api/v1/models")
      .then((r) => r.json())
      .then((raw) => {
        const data = raw as { data?: { id: string; name: string; pricing?: { prompt?: string; completion?: string } }[] };
        const all = (data.data || [])
          .filter((m) => !m.id.includes("lyria") && !m.id.includes("elephant"))
          .map((m) => ({
            id: m.id,
            name: m.name,
            free: m.pricing?.prompt === "0" && m.pricing?.completion === "0",
          }))
          .sort((a, b) => (a.free === b.free ? a.name.localeCompare(b.name) : a.free ? -1 : 1));
        setModels(all);
      })
      .catch(() => {});
  }, []);

  const saveSettings = (transition: typeof startResendTransition, label: string) => {
    transition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success(`${label} saved`);
      else toast.error("Failed to save");
    });
  };

  const handleTest = () => {
    if (!testEmail) { toast.error("Enter an email"); return; }
    startTestTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      if (res.ok) toast.success("Test email sent (check inbox)");
      else toast.error("Failed");
    });
  };

  if (loading) return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <Skeleton className="h-6 w-28 mb-2" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-5 w-5 rounded" />
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-3">
          <div><Skeleton className="h-3 w-14 mb-1" /><Skeleton className="h-10 w-full" /></div>
          <div><Skeleton className="h-3 w-20 mb-1" /><Skeleton className="h-10 w-full" /></div>
        </div>
        <div className="flex justify-end"><Skeleton className="h-10 w-24" /></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
      <p className="text-sm text-gray-500 dark:text-white/40 mb-8">Configure integrations and API keys.</p>

      {/* Resend Card */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Mail className="h-5 w-5 text-gray-900 dark:text-white" />
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Resend</h2>
            <p className="text-[12px] text-gray-400 dark:text-white/40">Email service for password reset and notifications</p>
          </div>
          <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${settings.RESEND_API_KEY ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50"}`}>
            {settings.RESEND_API_KEY ? "Connected" : "Not configured"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="resend-key" className="text-[12px] text-gray-500 dark:text-white/40 flex items-center gap-1.5">
              <Key className="h-3 w-3" /> API Key
            </Label>
            <Input
              id="resend-key"
              type="password"
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.RESEND_API_KEY}
              onChange={(e) => setSettings({ ...settings, RESEND_API_KEY: e.target.value })}
              className="mt-1 h-10 font-mono text-[13px]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Get your key at{" "}
              <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                resend.com/api-keys
              </a>
            </p>
          </div>

          <div>
            <Label htmlFor="resend-from" className="text-[12px] text-gray-500 dark:text-white/40 flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> From Address
            </Label>
            <Input
              id="resend-from"
              type="text"
              placeholder="Color Grid <noreply@colorgrid.co>"
              value={settings.RESEND_FROM_EMAIL}
              onChange={(e) => setSettings({ ...settings, RESEND_FROM_EMAIL: e.target.value })}
              className="mt-1 h-10 text-[13px]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Must be a verified domain in Resend. Leave empty for default.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => saveSettings(startResendTransition, "Resend")} disabled={resendPending} className="min-w-[120px] cursor-pointer">
              {resendPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Email */}
      {settings.RESEND_API_KEY && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <Send className="h-4 w-4 text-gray-500 dark:text-white/60" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Test Email</h2>
              <p className="text-[12px] text-gray-400 dark:text-white/40">Send a test password reset email to verify the configuration</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="h-10 text-[13px]"
            />
            <Button variant="outline" onClick={handleTest} disabled={testPending} className="shrink-0 cursor-pointer">
              {testPending ? "Sending..." : "Send Test"}
            </Button>
          </div>
        </div>
      )}

      {/* AI Provider + Pause */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles className="h-5 w-5 text-gray-900 dark:text-white" />
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">AI Content Generation</h2>
          <button
            onClick={() => {
              const next = settings.AI_PAUSED === "true" ? "false" : "true";
              setSettings({ ...settings, AI_PAUSED: next });
              saveSettings(startAiTransition, next === "true" ? "AI paused" : "AI resumed");
            }}
            className={cn("ml-auto px-3 py-1 text-[12px] font-medium rounded-full cursor-pointer transition-colors",
              settings.AI_PAUSED === "true"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}
          >
            {settings.AI_PAUSED === "true" ? "⏸ Paused" : "▶ Active"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[12px] text-gray-500 dark:text-white/40">Provider</Label>
            <select
              value={settings.AI_PROVIDER || "openrouter"}
              onChange={(e) => setSettings({ ...settings, AI_PROVIDER: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 cursor-pointer focus:outline-none"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => saveSettings(startAiTransition, "AI settings")} disabled={aiPending} className="min-w-[120px] cursor-pointer">
              {aiPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* OpenRouter Card */}
      <div className={cn("border rounded-xl p-5 mb-6", settings.AI_PROVIDER === "openrouter" ? "border-green-200 dark:border-green-900/30" : "border-gray-200 dark:border-white/10 opacity-60")}>
        <div className="flex items-center gap-2.5 mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">OpenRouter</h2>
            <p className="text-[12px] text-gray-400 dark:text-white/40">Free models available, no credit card needed</p>
          </div>
          <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${settings.OPENROUTER_API_KEY ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50"}`}>
            {settings.OPENROUTER_API_KEY ? "Connected" : "Not configured"}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="openrouter-key" className="text-[12px] text-gray-500 dark:text-white/40 flex items-center gap-1.5">
              <Key className="h-3 w-3" /> API Key
            </Label>
            <Input id="openrouter-key" type="password" placeholder="sk-or-..." value={settings.OPENROUTER_API_KEY} onChange={(e) => setSettings({ ...settings, OPENROUTER_API_KEY: e.target.value })} className="mt-1 h-10 font-mono text-[13px]" />
            <p className="text-[11px] text-gray-400 mt-1">
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">openrouter.ai/keys</a>
            </p>
          </div>
          <div>
            <Label className="text-[12px] text-gray-500 dark:text-white/40">Model</Label>
            <select value={settings.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free"} onChange={(e) => setSettings({ ...settings, OPENROUTER_MODEL: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 cursor-pointer focus:outline-none">
              {models.length === 0 && <option>Loading models...</option>}
              {models.filter(m => m.free).length > 0 && <optgroup label="Free">{models.filter(m => m.free).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
              {models.filter(m => !m.free).length > 0 && <optgroup label="Paid">{models.filter(m => !m.free).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            {settings.OPENROUTER_API_KEY && (
              <Button variant="outline" disabled={aiTestPending} className="cursor-pointer" onClick={() => { startAiTestTransition(async () => { const res = await fetch("/api/admin/test-openai", { method: "POST" }); const data = (await res.json()) as { ok: boolean; error?: string; model?: string }; if (data.ok) toast.success(`Connected — ${data.model}`); else toast.error(data.error || "Failed"); }); }}>
                {aiTestPending ? "Testing..." : "Test"}
              </Button>
            )}
            <Button onClick={() => saveSettings(startAiTransition, "OpenRouter")} disabled={aiPending} className="min-w-[100px] cursor-pointer">{aiPending ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>

      {/* OpenAI Card */}
      <div className={cn("border rounded-xl p-5 mb-6", settings.AI_PROVIDER === "openai" ? "border-green-200 dark:border-green-900/30" : "border-gray-200 dark:border-white/10 opacity-60")}>
        <div className="flex items-center gap-2.5 mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">OpenAI</h2>
            <p className="text-[12px] text-gray-400 dark:text-white/40">GPT models — requires credit card</p>
          </div>
          <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${settings.OPENAI_API_KEY ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50"}`}>
            {settings.OPENAI_API_KEY ? "Connected" : "Not configured"}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="openai-key" className="text-[12px] text-gray-500 dark:text-white/40 flex items-center gap-1.5">
              <Key className="h-3 w-3" /> API Key
            </Label>
            <Input id="openai-key" type="password" placeholder="sk-..." value={settings.OPENAI_API_KEY} onChange={(e) => setSettings({ ...settings, OPENAI_API_KEY: e.target.value })} className="mt-1 h-10 font-mono text-[13px]" />
            <p className="text-[11px] text-gray-400 mt-1">
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">platform.openai.com/api-keys</a>
            </p>
          </div>
          <div>
            <Label className="text-[12px] text-gray-500 dark:text-white/40">Model</Label>
            <select value={settings.OPENAI_MODEL || "gpt-4o-mini"} onChange={(e) => setSettings({ ...settings, OPENAI_MODEL: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[13px] text-gray-800 dark:text-white/85 cursor-pointer focus:outline-none">
              <optgroup label="Recommended">
                <option value="gpt-4o-mini">GPT-4o Mini (~$0.15/1M tokens)</option>
                <option value="gpt-4o">GPT-4o (~$2.50/1M tokens)</option>
              </optgroup>
              <optgroup label="Other">
                <option value="gpt-4-turbo">GPT-4 Turbo (~$10/1M tokens)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (~$0.50/1M tokens)</option>
              </optgroup>
            </select>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSettings(startAiTransition, "OpenAI")} disabled={aiPending} className="min-w-[100px] cursor-pointer">{aiPending ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
