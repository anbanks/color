"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/locale-context";
import { PaletteEditModal } from "./palette-edit-modal";
import { cn } from "@/lib/utils";

interface PaletteRow {
  id: string;
  slug: string;
  colors: string[];
  tags?: string[];
  status: string;
  likesCount: number;
  createdAt: string;
}

interface PaletteTableProps {
  palettes: PaletteRow[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  approved: "bg-indigo-50 text-indigo-600 border border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  published: "bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-red-50 text-red-600 border border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

export function PaletteTable({ palettes }: PaletteTableProps) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<PaletteRow | null>(null);

  const statusLabels: Record<string, string> = {
    pending: t.admin.pending,
    approved: t.admin.scheduled,
    published: t.admin.published,
    rejected: t.admin.rejected,
  };

  if (palettes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-white/30">
        <p className="text-[15px]">{t.admin.noPalettes}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200/60 dark:border-white/[0.06]">
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.date}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.palette}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">Tags</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.status}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40 text-right">{t.admin.table.likes}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {palettes.map((p) => {
              const date = new Date(p.createdAt);
              const dateStr = date.toLocaleDateString();
              const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <TableRow
                  key={p.id}
                  className="border-gray-200/60 dark:border-white/[0.06] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => setEditing(p)}
                >
                  <TableCell className="text-[13px] text-gray-500 dark:text-white/40 whitespace-nowrap">
                    <div>{dateStr}</div>
                    <div className="text-[11px] text-gray-400 dark:text-white/25">{timeStr}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-[2px] h-[32px] rounded-[4px] overflow-hidden w-[140px]">
                      {p.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {(p.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-1.5 py-[1px] text-[10px] font-medium rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[11px] font-medium", statusColors[p.status])}>
                      {statusLabels[p.status] || p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-right text-gray-700 dark:text-white/70 font-medium">
                    {p.likesCount.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <PaletteEditModal
          palette={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
