"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
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

export function PaletteTable({ palettes, showActions = true }: PaletteTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  const handleAction = (id: string, status: "approved" | "rejected") => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/palettes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          toast.success(`Palette ${status}`);
          router.refresh();
        }
      } catch {
        toast.error("Action failed");
      }
    });
  };

  if (palettes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-white/30">
        <p className="text-[15px]">{t.admin.noPalettes}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200/60 dark:border-white/[0.06]">
            <TableHead className="text-[13px] text-gray-500 dark:text-white/40 w-[200px]">{t.admin.table.palette}</TableHead>
            <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.slug}</TableHead>
            <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.status}</TableHead>
            <TableHead className="text-[13px] text-gray-500 dark:text-white/40 text-right">{t.admin.table.likes}</TableHead>
            <TableHead className="text-[13px] text-gray-500 dark:text-white/40">{t.admin.table.date}</TableHead>
            {showActions && <TableHead className="text-[13px] text-gray-500 dark:text-white/40 text-right">{t.admin.table.actions}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {palettes.map((p) => (
            <TableRow key={p.id} className="border-gray-200/60 dark:border-white/[0.06]">
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
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {p.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
                          onClick={() => handleAction(p.id, "approved")}
                          disabled={isPending}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => handleAction(p.id, "rejected")}
                          disabled={isPending}
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
