"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Clock, Play, RefreshCw, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface QueueState {
  counts: {
    pending: number;
    approved: number;
    published: number;
    rejected: number;
    readyToPublish: number;
  };
  rate: number;
  aiRate: number;
  lastRun: string | null;
  aiLastRun: string | null;
}

export function QueueClient() {
  const [state, setState] = useState<QueueState | null>(null);
  const [rateInput, setRateInput] = useState("");
  const [aiRateInput, setAiRateInput] = useState("");
  const [seedOpen, setSeedOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [aiLogs, setAiLogs] = useState<{ time: string; generated: number; errors: number; ids: string[] }[]>([]);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/queue", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as QueueState;
      setState(data);
      setRateInput(String(data.rate));
      setAiRateInput(String(data.aiRate));

      fetch("/api/admin/ai-log", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setAiLogs((d as { logs: typeof aiLogs }).logs || []))
        .catch(() => {});
    } catch {
      toast.error("Failed to load queue");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveRate = () => {
    const value = parseInt(rateInput, 10);
    if (!Number.isFinite(value) || value < 1 || value > 100) {
      toast.error("Rate must be between 1 and 100");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/queue/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: value }),
      });
      if (res.ok) {
        toast.success("Rate updated");
        load();
      } else {
        toast.error("Failed to update rate");
      }
    });
  };

  const drainNow = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/queue/drain", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { published: number };
        toast.success(`Published ${data.published} palette(s)`);
        load();
      } else {
        toast.error("Drain failed");
      }
    });
  };

  const seedFromPublished = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/queue/seed", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { moved: number | null };
        toast.success(
          data.moved !== null
            ? `Moved ${data.moved} palette(s) to queue`
            : "Moved palettes to queue"
        );
        load();
      } else {
        toast.error("Bulk move failed");
      }
    });
  };

  if (!state) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-4">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-14" />
            </div>
          ))}
        </div>
        <div className="border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-64" />
          <div className="flex gap-2 max-w-sm">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "In queue", value: state.counts.approved, tone: "approved" },
    { label: "Ready to publish", value: state.counts.readyToPublish, tone: "ready" },
    { label: "Awaiting AI", value: state.counts.approved - state.counts.readyToPublish, tone: "pending" },
    { label: "Published", value: state.counts.published, tone: "published" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-gray-500 dark:text-white/40">
                {c.label}
              </span>
            </div>
            <p className="text-[24px] font-bold text-gray-900 dark:text-white">
              {c.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500 dark:text-white/50" />
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
            Cron settings
          </h3>
        </div>
        <p className="text-[12px] text-gray-500 dark:text-white/40 mb-4">
          The publish cron runs every hour. It moves up to{" "}
          <span className="font-medium text-gray-700 dark:text-white/70">
            {state.rate}
          </span>{" "}
          palette(s) from the approved queue to published per run.
        </p>
        <div className="flex items-center gap-2 max-w-sm">
          <Input
            type="number"
            min={1}
            max={100}
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            className="h-10"
          />
          <Button onClick={saveRate} disabled={pending} className="h-10 px-4 cursor-pointer">
            Save rate
          </Button>
        </div>
        {state.lastRun && (
          <p className="text-[11px] text-gray-400 dark:text-white/30 mt-3">
            Last run: {new Date(state.lastRun).toLocaleString()}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500 dark:text-white/50" />
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
            AI Content Generation
          </h3>
        </div>
        <p className="text-[12px] text-gray-500 dark:text-white/40 mb-4">
          Runs every 5 minutes. Generates titles, descriptions, applications and psychology in 9 languages for{" "}
          <span className="font-medium text-gray-700 dark:text-white/70">{state.aiRate}</span>{" "}
          palette(s) per run. Only palettes with all 9 translations can be published.
        </p>
        <div className="flex items-center gap-2 max-w-sm">
          <Input
            type="number"
            min={1}
            max={10}
            value={aiRateInput}
            onChange={(e) => setAiRateInput(e.target.value)}
            className="h-10"
          />
          <Button
            onClick={() => {
              const value = parseInt(aiRateInput, 10);
              if (!Number.isFinite(value) || value < 1 || value > 10) {
                toast.error("Rate must be between 1 and 10");
                return;
              }
              startTransition(async () => {
                const res = await fetch("/api/admin/queue/rate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ aiRate: value }),
                });
                if (res.ok) { toast.success("AI rate updated"); load(); }
                else toast.error("Failed");
              });
            }}
            disabled={pending}
            className="h-10 px-4 cursor-pointer"
          >
            Save rate
          </Button>
        </div>
        {state.aiLastRun && (
          <p className="text-[11px] text-gray-400 dark:text-white/30 mt-3">
            Last run: {new Date(state.aiLastRun).toLocaleString()}
          </p>
        )}
      </div>

      {/* AI Generation Log */}
      {aiLogs.length > 0 && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-3">
            AI Generation Log
          </h3>
          <div className="max-h-[250px] overflow-y-auto space-y-1.5">
            {aiLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-[12px] py-1.5 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                <span className="text-gray-400 dark:text-white/30 tabular-nums shrink-0">
                  {new Date(log.time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={log.generated > 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-white/30"}>
                  {log.generated > 0 ? `✓ ${log.generated} generated` : "— skip"}
                </span>
                {log.errors > 0 && (
                  <span className="text-red-500 font-medium">✗ {log.errors} errors</span>
                )}
                {log.ids.length > 0 && (
                  <span className="text-gray-400 dark:text-white/25 truncate">
                    {log.ids.join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-5">
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-3">
          Manual actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={drainNow} disabled={pending} variant="outline" className="h-10 cursor-pointer">
            <Play className="h-4 w-4 mr-1.5" />
            Drain now ({state.rate})
          </Button>
          <Button onClick={load} disabled={pending} variant="outline" className="h-10 cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setSeedOpen(true)}
            disabled={pending}
            variant="outline"
            className="h-10 cursor-pointer text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
          >
            <ArrowDownToLine className="h-4 w-4 mr-1.5" />
            Move ALL published → queue
          </Button>
          <ConfirmDialog
            open={seedOpen}
            onOpenChange={setSeedOpen}
            title="Move all published to queue"
            description="This will hide ALL published palettes from the public feed until the cron republishes them gradually. Are you sure?"
            confirmLabel="Move all"
            destructive
            onConfirm={seedFromPublished}
          />
        </div>
        <p className="text-[11px] text-gray-400 dark:text-white/30 mt-3 max-w-2xl">
          Use the bulk move once when you want to switch an existing dataset
          to drip-publishing. After that, approve new palettes from
          /admin/palettes and the cron will drain them gradually.
        </p>
      </div>
    </div>
  );
}
