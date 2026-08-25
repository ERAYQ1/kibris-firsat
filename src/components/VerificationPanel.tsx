"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, PackageX } from "lucide-react";
import { toast } from "sonner";

interface Props {
  dealId: number;
}

export function VerificationPanel({ dealId }: Props) {
  const [stats, setStats] = useState<{
    verifiedActiveCount: number;
    soldOutCount: number;
    wrongPriceCount: number;
    userVerification: "verified_active" | "sold_out" | "wrong_price" | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/deals/${dealId}/verify`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => null);
  }, [dealId]);

  async function handleVerify(type: "verified_active" | "sold_out" | "wrong_price") {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.status === 401) {
        toast.error("Doğrulama yapmak için giriş yapmalısınız.");
        return;
      }

      if (!res.ok) throw new Error();

      const data = await res.json();
      setStats(data);
      toast.success("Topluluk teyidiniz kaydedildi!");
    } catch {
      toast.error("İşlem yapılamadı.");
    } finally {
      setLoading(false);
    }
  }

  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
            Topluluk Güven & Doğrulama
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            Fırsatı mağazada gördün mü? Topluluğu bilgilendir.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => handleVerify("verified_active")}
          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
            stats.userVerification === "verified_active"
              ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
              : "border-stone-200 bg-stone-50/50 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/30"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-1" />
          <span>Fiyat Doğru</span>
          <span className="text-[11px] font-normal text-stone-500">
            ({stats.verifiedActiveCount} teyit)
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleVerify("sold_out")}
          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
            stats.userVerification === "sold_out"
              ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
              : "border-stone-200 bg-stone-50/50 text-stone-700 hover:border-amber-300 hover:bg-amber-50/30"
          }`}
        >
          <PackageX className="h-4 w-4 text-amber-600 mb-1" />
          <span>Stok Bitti</span>
          <span className="text-[11px] font-normal text-stone-500">
            ({stats.soldOutCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleVerify("wrong_price")}
          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
            stats.userVerification === "wrong_price"
              ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
              : "border-stone-200 bg-stone-50/50 text-stone-700 hover:border-rose-300 hover:bg-rose-50/30"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-600 mb-1" />
          <span>Fiyat Yanlış</span>
          <span className="text-[11px] font-normal text-stone-500">
            ({stats.wrongPriceCount})
          </span>
        </button>
      </div>
    </div>
  );
}
