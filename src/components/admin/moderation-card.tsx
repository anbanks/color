"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ModerationCardProps {
  id: string;
  colors: string[];
  status: string;
  createdAt: string;
}

export function ModerationCard({ id, colors, status, createdAt }: ModerationCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAction = (action: "approved" | "rejected") => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/palettes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        });
        if (res.ok) {
          toast.success(`Palette ${action}`);

          // Trigger AI content generation on approval
          if (action === "approved") {
            fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paletteId: id }),
            }).then(() => {
              toast.success("AI content generated");
            }).catch(() => {
              toast.error("Content generation failed");
            });
          }

          router.refresh();
        } else {
          toast.error("Action failed");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      {/* Color preview */}
      <div className="rounded-lg overflow-hidden">
        {colors.map((color, i) => (
          <div
            key={i}
            className="h-10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{new Date(createdAt).toLocaleDateString()}</span>
        <span className="capitalize">{status}</span>
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-green-600 hover:bg-green-50"
            onClick={() => handleAction("approved")}
            disabled={isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-500 hover:bg-red-50"
            onClick={() => handleAction("rejected")}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
