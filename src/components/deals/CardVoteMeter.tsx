"use client";

import { useState } from "react";
import { Plus, Minus, Flame, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CardVoteMeterProps {
  dealId: number;
  initialScore: number;
  initialUserVote?: 1 | -1 | 0;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function CardVoteMeter({
  dealId,
  initialScore,
  initialUserVote = 0,
  orientation = "vertical",
  className = "",
}: CardVoteMeterProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(initialUserVote);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleVote(value: 1 | -1) {
    if (isPending) return;
    setIsPending(true);

    const nextVote: 1 | -1 | 0 = userVote === value ? 0 : value;
    const diff = nextVote - userVote;
    const optimisticScore = score + diff;

    setScore(optimisticScore);
    setUserVote(nextVote);

    try {
      const res = await fetch(`/api/deals/${dealId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: nextVote }),
      });

      if (res.status === 401) {
        toast.error("Oy kullanabilmek için lütfen giriş yapın.");
        setScore(initialScore);
        setUserVote(initialUserVote);
        router.push("/giris");
        return;
      }

      if (!res.ok) {
        setScore(initialScore);
        setUserVote(initialUserVote);
        toast.error("Oy kaydedilemedi.");
        return;
      }

      const json = await res.json();
      if (json.data?.score !== undefined) {
        setScore(json.data.score);
      }
    } catch {
      setScore(initialScore);
      setUserVote(initialUserVote);
      toast.error("Bağlantı hatası.");
    } finally {
      setIsPending(false);
    }
  }

  // Sıcaklık teması
  const isSuperHot = score >= 100;
  const isHot = score > 0;
  const isCold = score < 0;

  const tempColor = isSuperHot
    ? "text-rose-600 font-black"
    : isHot
    ? "text-orange-600 font-extrabold"
    : isCold
    ? "text-sky-600 font-extrabold"
    : "text-slate-600 font-bold";

  const bgStyles = isHot
    ? "bg-orange-50/70 border-orange-200/80"
    : isCold
    ? "bg-sky-50/70 border-sky-200/80"
    : "bg-slate-50 border-slate-200/80";

  if (orientation === "horizontal") {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-xl border p-1 shadow-2xs ${bgStyles} ${className}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVote(1);
          }}
          disabled={isPending}
          aria-label="Sıcaklık artır"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition active:scale-90 cursor-pointer ${
            userVote === 1
              ? "bg-orange-500 text-white shadow-2xs"
              : "bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-900 border border-slate-200/60"
          }`}
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
        </button>

        <div className="flex items-center gap-1 px-2 text-xs select-none">
          {isHot ? (
            <Flame className={`h-3.5 w-3.5 ${isSuperHot ? "text-rose-600 animate-pulse fill-rose-500" : "text-orange-600 fill-orange-500"}`} />
          ) : isCold ? (
            <Snowflake className="h-3.5 w-3.5 text-sky-600" />
          ) : null}
          <span className={tempColor}>{score > 0 ? `+${score}°` : `${score}°`}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVote(-1);
          }}
          disabled={isPending}
          aria-label="Sıcaklık düşür"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition active:scale-90 cursor-pointer ${
            userVote === -1
              ? "bg-sky-600 text-white shadow-2xs"
              : "bg-white text-slate-700 hover:bg-sky-100 hover:text-sky-900 border border-slate-200/60"
          }`}
        >
          <Minus className="h-3.5 w-3.5 stroke-[3]" />
        </button>
      </div>
    );
  }

  // Dikey (Vertical) Dealabs / HotUKDeals tarzı
  return (
    <div
      className={`flex flex-col items-center justify-between rounded-2xl border p-1 shadow-2xs select-none ${bgStyles} ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote(1);
        }}
        disabled={isPending}
        title="Fırsat Çok İyi (+1)"
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-90 cursor-pointer ${
          userVote === 1
            ? "bg-orange-500 text-white shadow-xs"
            : "bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-900 border border-slate-200/70"
        }`}
      >
        <Plus className="h-4 w-4 stroke-[3]" />
      </button>

      <div className="py-2 text-center">
        {isHot ? (
          <Flame
            className={`mx-auto h-4 w-4 ${
              isSuperHot
                ? "text-rose-600 fill-rose-500 animate-bounce"
                : "text-orange-600 fill-orange-500"
            }`}
          />
        ) : isCold ? (
          <Snowflake className="mx-auto h-4 w-4 text-sky-600" />
        ) : null}
        <span className={`text-xs block mt-0.5 ${tempColor}`}>
          {score > 0 ? `+${score}°` : `${score}°`}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote(-1);
        }}
        disabled={isPending}
        title="Fiyat Pahalı (-1)"
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-90 cursor-pointer ${
          userVote === -1
            ? "bg-sky-600 text-white shadow-xs"
            : "bg-white text-slate-700 hover:bg-sky-100 hover:text-sky-900 border border-slate-200/70"
        }`}
      >
        <Minus className="h-4 w-4 stroke-[3]" />
      </button>
    </div>
  );
}
