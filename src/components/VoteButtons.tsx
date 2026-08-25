"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  dealId: number;
  initialValue?: 1 | -1 | 0;
}

export function VoteButtons({ dealId, initialValue = 0 }: Props) {
  const [vote, setVote] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(next: 1 | -1) {
    if (pending) return;
    setPending(true);
    const newValue = vote === next ? 0 : next;

    try {
      const res = await fetch(`/api/deals/${dealId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });

      if (res.status === 401) {
        toast.error("Oy vermek için giriş yapmalısınız.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Oy verilemedi.");
      }

      setVote(newValue);
      toast.success(
        newValue === 1
          ? "Fırsatı beğendiniz! 👍"
          : newValue === -1
          ? "Geri bildiriminiz kaydedildi. 👎"
          : "Oyunuz geri çekildi."
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => submit(1)}
        disabled={pending}
        aria-pressed={vote === 1}
        aria-label="İyi fırsat"
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
          vote === 1
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <ThumbsUp className={`h-3.5 w-3.5 ${vote === 1 ? "fill-emerald-600 text-emerald-600" : "text-slate-400"}`} />
        <span>İyi Fiyat</span>
      </button>

      <button
        type="button"
        onClick={() => submit(-1)}
        disabled={pending}
        aria-pressed={vote === -1}
        aria-label="Kötü fırsat"
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
          vote === -1
            ? "border-rose-300 bg-rose-50 text-rose-800 shadow-2xs"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <ThumbsDown className={`h-3.5 w-3.5 ${vote === -1 ? "fill-rose-600 text-rose-600" : "text-slate-400"}`} />
        <span>Pahalı</span>
      </button>
    </div>
  );
}
