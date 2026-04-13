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
  status: string;
  likesCount: number;
  createdAt: string;
}

interface PaletteTableProps {
  palettes: PaletteRow[];
  showActions?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  published: "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
};

export function PaletteTable({ palettes }: PaletteTableProps) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<PaletteRow | null>(null);

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
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40 w-[200px]">{t.admin.table.palette}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.slug}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.status}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40 text-right">{t.admin.table.likes}</TableHead>
              <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.date}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {palettes.map((p) => (
              <TableRow
                key={p.id}
                className="border-gray-200/60 dark:border-white/[0.06] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                onClick={() => setEditing(p)}
              >
                <TableCell>
                  <div className="flex gap-[2px] h-[32px] rounded-[4px] overflow-hidden w-[140px]">
                    {p.colors.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-[13px] font-mono text-gray-600 dark:text-white/50">
                  {p.slug.substring(0, 20)}...
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[11px] font-medium", statusColors[p.status])}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px] text-right text-gray-700 dark:text-white/70 font-medium">
                  {p.likesCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-[13px] text-gray-500 dark:text-white/40">
                  {new Date(p.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
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
