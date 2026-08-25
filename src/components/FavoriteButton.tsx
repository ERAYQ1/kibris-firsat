"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  dealId: number;
  initialFavorited?: boolean;
  initialCount?: number;
  variant?: "icon" | "pill";
  className?: string;
}

export function FavoriteButton({
  dealId,
  initialFavorited = false,
  initialCount = 0,
  variant = "icon",
  className = "",
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/deals/${dealId}/favorite`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFavorited(data.favorited);
          setCount(data.count);
        }
      })
      .catch(() => null);
  }, [dealId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    // Optimistic UI
    const prevFavorited = favorited;
    const prevCount = count;
    setFavorited(!prevFavorited);
    setCount(prevFavorited ? Math.max(0, prevCount - 1) : prevCount + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/favorite`, {
        method: "POST",
      });

      if (res.status === 401) {
        setFavorited(prevFavorited);
        setCount(prevCount);
        toast.error("Favorilere eklemek için giriş yapmalısınız.");
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data = (await res.json()) as { favorited: boolean; count: number };
      setFavorited(data.favorited);
      setCount(data.count);
      toast.success(
        data.favorited ? "Favorilere eklendi ❤️" : "Favorilerden çıkarıldı"
      );
    } catch {
      setFavorited(prevFavorited);
      setCount(prevCount);
      toast.error("Favori işlemi gerçekleştirilemedi.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md shadow-xs transition-all active:scale-90",
          favorited
            ? "bg-rose-50 border border-rose-200 text-rose-600"
            : "bg-white/90 border border-slate-200/80 text-slate-400 hover:text-slate-700 hover:bg-white",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            favorited ? "fill-rose-500 text-rose-500 scale-110" : "hover:scale-110"
          )}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition active:scale-95",
        favorited
          ? "border-rose-300 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          favorited ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400"
        )}
      />
      <span>{count > 0 ? `${count} Favori` : "Favoriye Ekle"}</span>
    </button>
  );
}
