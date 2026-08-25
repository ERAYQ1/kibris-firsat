"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Check, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

interface PriceAlertButtonProps {
  dealId: number;
  currentPriceCents: number;
  currency: "TRY" | "GBP" | "EUR";
  initialHasAlert?: boolean;
  initialTargetPriceCents?: number | null;
  variant?: "button" | "icon";
  className?: string;
}

export function PriceAlertButton({
  dealId,
  currentPriceCents,
  currency,
  initialHasAlert = false,
  initialTargetPriceCents = null,
  variant = "button",
  className = "",
}: PriceAlertButtonProps) {
  const router = useRouter();
  const [hasAlert, setHasAlert] = useState(initialHasAlert);
  const [targetPriceCents, setTargetPriceCents] = useState<number | null>(
    initialTargetPriceCents
  );
  const [isOpen, setIsOpen] = useState(false);
  const [inputPrice, setInputPrice] = useState(
    initialTargetPriceCents
      ? (initialTargetPriceCents / 100).toString()
      : Math.round((currentPriceCents * 0.9) / 100).toString()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check initial alert status from server on mount
    fetch(`/api/deals/${dealId}/alert`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.hasAlert) {
          setHasAlert(true);
          if (data.alert?.targetPriceCents) {
            setTargetPriceCents(data.alert.targetPriceCents);
            setInputPrice((data.alert.targetPriceCents / 100).toString());
          }
        }
      })
      .catch(() => {});
  }, [dealId]);

  async function handleSetAlert(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number.parseFloat(inputPrice.replace(",", "."));
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Lütfen geçerli bir hedef fiyat girin.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPrice: inputPrice }),
      });

      if (res.status === 401) {
        toast.error("Fiyat alarmı kurmak için lütfen giriş yapın.");
        router.push("/giris");
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Fiyat alarmı kurulamadı.");
        return;
      }

      setHasAlert(true);
      const newTarget = Math.round(priceNum * 100);
      setTargetPriceCents(newTarget);
      setIsOpen(false);
      toast.success(
        `Fiyat alarmı kuruldu! Fiyat ${formatCurrency(newTarget, currency)} veya altına düştüğünde bildirim alacaksınız.`
      );
    } catch {
      toast.error("Bir bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveAlert() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/alert`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Fiyat alarmı kaldırılamadı.");
        return;
      }

      setHasAlert(false);
      setTargetPriceCents(null);
      setIsOpen(false);
      toast.info("Fiyat alarmı kaldırıldı.");
    } catch {
      toast.error("Bir bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border transition cursor-pointer ${
            hasAlert
              ? "border-amber-400 bg-amber-50 text-amber-700 shadow-2xs"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 shadow-2xs"
          } ${className}`}
          title={hasAlert ? "Fiyat alarmı aktif" : "Fiyat alarmı kur"}
        >
          {hasAlert ? (
            <BellRing className="h-4 w-4 fill-amber-500 text-amber-600 animate-pulse" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
            hasAlert
              ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          } ${className}`}
        >
          {hasAlert ? (
            <>
              <BellRing className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
              <span>Alarm Aktif ({targetPriceCents ? formatCurrency(targetPriceCents, currency) : ""})</span>
            </>
          ) : (
            <>
              <Bell className="h-3.5 w-3.5 text-slate-500" />
              <span>Fiyat Alarmı Kur</span>
            </>
          )}
        </button>
      )}

      {/* Fiyat Alarmı Modalı */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950">Fiyat Düşüş Alarmı</h3>
                  <p className="text-[11px] text-slate-500">Hedef fiyatınıza düşünce haber verelim</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mevcut Fiyat:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(currentPriceCents, currency)}
                </span>
              </div>
              {hasAlert && targetPriceCents && (
                <div className="flex items-center justify-between text-amber-900 font-semibold pt-1 border-t border-slate-200">
                  <span>Kayıtlı Alarmınız:</span>
                  <span>{formatCurrency(targetPriceCents, currency)}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSetAlert} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Hedef Fiyat (₺)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    placeholder="Örn: 199.90"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-slate-950"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Fiyat bu rakama veya altına indiğinde platform içi bildirim alırsınız.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>{hasAlert ? "Alarmı Güncelle" : "Alarm Kur"}</span>
                </button>

                {hasAlert && (
                  <button
                    type="button"
                    onClick={handleRemoveAlert}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                    title="Alarmı Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
