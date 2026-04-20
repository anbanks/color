"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LogEntry {
  time: string;
  generated: number;
  errors: number;
  ids: string[];
  model?: string;
  rate?: number;
  details?: {
    id: string;
    colors: string[];
    localesSaved: string[];
    title?: string;
    prompt?: string;
    request?: object;
    response?: string;
    httpStatus?: number;
  }[];
  errorDetails?: { id: string; error: string }[];
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/ai-log", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const t = setTimeout(() => {
          setLogs((d as { logs: LogEntry[] }).logs || []);
          setLoading(false);
        }, 0);
        return () => clearTimeout(t);
      })
      .catch(() => setTimeout(() => setLoading(false), 0));
  };

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-20" />
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Logs</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">AI content generation history — last 50 runs</p>
        </div>
        <Button variant="outline" onClick={load} className="cursor-pointer">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {logs.length === 0 ? (
        <p className="text-center py-16 text-gray-400">No logs yet</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="bg-[#ffffff] dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg overflow-hidden">
              {/* Summary row */}
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[12px] text-gray-400 dark:text-white/30 tabular-nums shrink-0 w-[130px]">
                  {new Date(log.time).toLocaleString()}
                </span>
                <span className={cn(
                  "text-[13px] font-medium shrink-0 w-[60px]",
                  log.generated > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400"
                )}>
                  {log.generated > 0 ? `✓ ${log.generated}` : "—"}
                </span>
                {log.errors > 0 && (
                  <span className="text-[13px] text-red-500 font-medium shrink-0">✗ {log.errors}</span>
                )}
                <span className="text-[12px] text-gray-500 dark:text-white/50 font-mono truncate">
                  {log.ids.length > 0 ? log.ids.join(", ") : "no palettes"}
                </span>
                {log.model && (
                  <span className="ml-auto text-[11px] text-gray-400 dark:text-white/25 shrink-0 hidden sm:block">
                    {log.model.split("/").pop()?.replace(":free", "")}
                  </span>
                )}
                <span className="text-gray-300 dark:text-white/20 shrink-0">
                  {expanded === i ? "▲" : "▼"}
                </span>
              </button>

              {/* Expanded details */}
              {expanded === i && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] px-4 py-3 space-y-3 bg-gray-50/50 dark:bg-white/[0.01]">
                  {/* Meta */}
                  <div className="flex gap-4 text-[11px] text-gray-400 dark:text-white/30">
                    {log.model && <span>Model: <span className="text-gray-600 dark:text-white/60 font-mono">{log.model}</span></span>}
                    {log.rate && <span>Rate: <span className="text-gray-600 dark:text-white/60">{log.rate}/run</span></span>}
                  </div>

                  {/* Success details */}
                  {log.details?.map((d, j) => (
                    <div key={j} className="border border-gray-200/60 dark:border-white/[0.06] rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono font-medium text-gray-700 dark:text-white/70">{d.id}</span>
                        <div className="flex gap-[2px] h-[18px] rounded overflow-hidden w-[60px]">
                          {d.colors.map((c, ci) => (
                            <div key={ci} className="flex-1 h-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        {d.title && (
                          <span className="text-[12px] text-gray-600 dark:text-white/60 italic truncate">{d.title}</span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {d.localesSaved.map((l) => (
                          <span key={l} className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                            {l.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-white/30">
                        {d.httpStatus && (
                          <span className={d.httpStatus === 200 ? "text-green-600" : "text-red-500"}>
                            HTTP {d.httpStatus}
                          </span>
                        )}
                      </div>
                      {d.prompt && (
                        <details className="text-[11px]">
                          <summary className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline font-medium">→ Request (prompt)</summary>
                          <pre className="mt-1 p-2 rounded bg-blue-50 dark:bg-blue-900/10 text-gray-700 dark:text-white/60 overflow-x-auto whitespace-pre-wrap break-all text-[10px] max-h-[200px] overflow-y-auto border border-blue-100 dark:border-blue-900/20">
                            {d.prompt}
                          </pre>
                          {d.request && (
                            <pre className="mt-1 p-2 rounded bg-blue-50 dark:bg-blue-900/10 text-gray-600 dark:text-white/50 text-[10px] border border-blue-100 dark:border-blue-900/20">
                              {JSON.stringify(d.request, null, 2)}
                            </pre>
                          )}
                        </details>
                      )}
                      {d.response && (
                        <details className="text-[11px]">
                          <summary className="text-green-600 dark:text-green-400 cursor-pointer hover:underline font-medium">← Response</summary>
                          <pre className="mt-1 p-2 rounded bg-green-50 dark:bg-green-900/10 text-gray-700 dark:text-white/60 overflow-x-auto whitespace-pre-wrap break-all text-[10px] max-h-[300px] overflow-y-auto border border-green-100 dark:border-green-900/20">
                            {d.response}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}

                  {/* Error details */}
                  {log.errorDetails?.map((e, j) => (
                    <div key={j} className="border border-red-200 dark:border-red-900/30 rounded-lg p-3">
                      <span className="text-[12px] font-mono font-medium text-red-600 dark:text-red-400">{e.id}</span>
                      <pre className="mt-1 text-[11px] text-red-500 whitespace-pre-wrap break-all">{e.error}</pre>
                    </div>
                  ))}

                  {!log.details?.length && !log.errorDetails?.length && (
                    <p className="text-[12px] text-gray-400 italic">No detailed data for this run</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
