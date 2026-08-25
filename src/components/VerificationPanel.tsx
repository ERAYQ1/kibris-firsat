"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, PackageX, ShieldCheck } from "lucide-react";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Topluluk Fiyat & Stok Doğrulaması
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bu fırsatı mağazada veya online olarak teyit ettin mi?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => handleVerify("verified_active")}
          className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition active:scale-95 ${
            stats.userVerification === "verified_active"
              ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-1" />
          <span>Fiyat Doğru</span>
          <span className="text-[10px] font-normal text-slate-500">
            ({stats.verifiedActiveCount} teyit)
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleVerify("sold_out")}
          className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition active:scale-95 ${
            stats.userVerification === "sold_out"
              ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20"
              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40"
          }`}
        >
          <PackageX className="h-4 w-4 text-amber-600 mb-1" />
          <span>Stok Bitti</span>
          <span className="text-[10px] font-normal text-slate-500">
            ({stats.soldOutCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleVerify("wrong_price")}
          className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-bold transition active:scale-95 ${
            stats.userVerification === "wrong_price"
              ? "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20"
              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-600 mb-1" />
          <span>Fiyat Yanlış</span>
          <span className="text-[10px] font-normal text-slate-500">
            ({stats.wrongPriceCount})
          </span>
        </button>
      </div>
    </div>
  );
}
