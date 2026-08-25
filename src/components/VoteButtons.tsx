"use client";

import { useState } from "react";

interface Props {
  dealId: number;
  initialValue?: 1 | -1 | 0;
}

export function VoteButtons({ dealId, initialValue = 0 }: Props) {
  const [vote, setVote] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(next: 1 | -1) {
    setPending(true);
    setError(null);
    const newValue = vote === next ? 0 : next;
    try {
      const res = await fetch(`/api/deals/${dealId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Oy verilemedi.");
      }
      setVote(newValue);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => submit(1)}
        disabled={pending}
        aria-pressed={vote === 1}
        aria-label="İyi fırsat"
        className={`rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-50 ${
          vote === 1
            ? "border-teal-600 bg-teal-50 text-teal-700"
            : "border-stone-300 bg-white hover:border-teal-500"
        }`}
      >
        👍 İyi fırsat
      </button>
      <button
        type="button"
        onClick={() => submit(-1)}
        disabled={pending}
        aria-pressed={vote === -1}
        aria-label="Kötü fırsat"
        className={`rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-50 ${
          vote === -1
            ? "border-red-400 bg-red-50 text-red-600"
            : "border-stone-300 bg-white hover:border-red-300"
        }`}
      >
        👎 Kötü fırsat
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
