"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReportWithMeta } from "@/server/deals";
import { toast } from "sonner";
import { Trash2, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const REASON_LABELS: Record<string, string> = {
  fake: "Sahte fırsat",
  wrong_price: "Yanlış fiyat",
  expired: "Süresi dolmuş",
  wrong_location: "Yanlış konum",
  wrong_store: "Yanlış mağaza",
  spam: "Spam",
  inappropriate: "Uygunsuz içerik",
};

export function AdminReportList({ reports }: { reports: ReportWithMeta[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function act(reportId: number, action: "dismiss" | "remove_deal") {
    setPendingId(reportId);
    try {
      const res = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "İşlem başarısız.");
      }
      toast.success(action === "remove_deal" ? "Fırsat yayından kaldırıldı." : "Rapor reddedildi.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setPendingId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
        Şu an incelenmeyi bekleyen açık rapor bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-200/80">
                {REASON_LABELS[r.reason] ?? r.reason}
              </span>
              <span className="text-xs text-slate-400">Rapor #{r.id}</span>
            </div>

            <p className="text-sm font-bold text-slate-900">
              <Link
                href={`/firsat/${r.dealId}`}
                target="_blank"
                className="hover:underline inline-flex items-center gap-1 text-slate-950"
              >
                {r.dealTitle}
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </Link>
            </p>

            {r.details && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                “{r.details}”
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              Raporlayan: <span className="font-semibold text-slate-600">{r.reporterName}</span> ({r.reporterEmail})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={pendingId === r.id}
              onClick={() => act(r.id, "remove_deal")}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Fırsatı Kaldır
            </button>

            <button
              type="button"
              disabled={pendingId === r.id}
              onClick={() => act(r.id, "dismiss")}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Raporu Reddet
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
