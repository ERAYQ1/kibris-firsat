"use client";

import { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CouponBadgeProps {
  code: string;
  discountDescription?: string | null;
  className?: string;
  variant?: "compact" | "full";
}

export function CouponBadge({
  code,
  discountDescription,
  className = "",
  variant = "full",
}: CouponBadgeProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Kupon kodu kopyalandı: ${code}`);

    setTimeout(() => {
      setCopied(false);
    }, 2500);
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/80 px-2 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer ${className}`}
        title="Kupon kodunu kopyalamak için tıklayın"
      >
        <Ticket className="h-3 w-3 text-amber-600 shrink-0" />
        <span className="font-mono tracking-wider">{code}</span>
        {copied ? (
          <Check className="h-3 w-3 text-emerald-600" />
        ) : (
          <Copy className="h-2.5 w-2.5 text-amber-600 opacity-60" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/60 p-3.5 shadow-2xs ${className}`}
    >
      {/* Sol kupon çentiği dekoru */}
      <div className="absolute -left-2.5 top-1/2 -mt-2.5 h-5 w-5 rounded-full border-r-2 border-amber-300 bg-white" />
      {/* Sağ kupon çentiği dekoru */}
      <div className="absolute -right-2.5 top-1/2 -mt-2.5 h-5 w-5 rounded-full border-l-2 border-amber-300 bg-white" />

      <div className="flex items-center gap-3 pl-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-900">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
              İndirim Kuponu
            </span>
            {discountDescription && (
              <span className="rounded-md bg-amber-200/70 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                {discountDescription}
              </span>
            )}
          </div>
          <p className="font-mono text-sm font-black tracking-widest text-slate-950">
            {code}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
          copied
            ? "bg-emerald-600 text-white"
            : "bg-slate-950 text-white hover:bg-slate-800 active:scale-95"
        }`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Kopyalandı!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-amber-400" />
            <span>Kodu Kopyala</span>
          </>
        )}
      </button>
    </div>
  );
}
