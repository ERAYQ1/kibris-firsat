"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface Props {
  dealId: number;
  initialFavorited?: boolean;
  initialCount?: number;
  className?: string;
}

export function FavoriteButton({
  dealId,
  initialFavorited = false,
  initialCount = 0,
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

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
        favorited
          ? "border-rose-300 bg-rose-50 text-rose-600 shadow-2xs"
          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
      } ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-transform duration-200 ${
          favorited ? "fill-rose-500 text-rose-500 scale-110" : "text-stone-400"
        }`}
      />
      <span>{count > 0 ? count : "Favori"}</span>
    </button>
  );
}
