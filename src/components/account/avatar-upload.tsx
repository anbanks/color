"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";

interface AvatarUploadProps {
  initialImage: string | null;
  name: string | null;
}

// Client-side downscale so the request body is small and the server doesn't
// need an image pipeline (no Sharp in Workers).
function resizeToJpeg(file: File, maxDim = 512, quality = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.max(1, Math.round(img.width * ratio));
      const h = Math.max(1, Math.round(img.height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("resize failed"));
            return;
          }
          resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });
}

export function AvatarUpload({ initialImage, name }: AvatarUploadProps) {
  const router = useRouter();
  const { t } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(initialImage);
  const [pending, startTransition] = useTransition();
  const initial = (name ?? "?").trim().charAt(0).toUpperCase();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t.account.invalidImage);
      return;
    }
    startTransition(async () => {
      try {
        const resized = await resizeToJpeg(file);
        const form = new FormData();
        form.append("file", resized);
        const res = await fetch("/api/account/avatar", { method: "POST", body: form });
        const data = (await res.json()) as { image?: string; error?: string };
        if (!res.ok || !data.image) {
          toast.error(data.error ?? "Failed");
          return;
        }
        setImage(data.image);
        toast.success(t.account.avatarUpdated);
        router.refresh();
      } catch {
        toast.error("Failed");
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/account/avatar", { method: "DELETE" });
        if (!res.ok) {
          toast.error("Failed");
          return;
        }
        setImage(null);
        toast.success(t.account.avatarRemoved);
        router.refresh();
      } catch {
        toast.error("Failed");
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[72px] w-[72px] rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden text-[28px] font-semibold text-gray-500 dark:text-white/70 shrink-0">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="mr-1.5 size-4" />
            {image ? t.account.changePhoto : t.account.uploadPhoto}
          </Button>
          {image && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={handleRemove}
              className="cursor-pointer text-gray-500 hover:text-red-600"
            >
              <Trash2 className="mr-1.5 size-4" />
              {t.account.removePhoto}
            </Button>
          )}
        </div>
        <p className="text-[12px] text-gray-400 dark:text-white/35">PNG, JPG or WebP · max 2 MB</p>
      </div>
    </div>
  );
}
