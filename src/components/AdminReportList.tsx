"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReportWithMeta } from "@/server/deals";

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
  const [error, setError] = useState<string | null>(null);

  async function act(reportId: number, action: "dismiss" | "remove_deal") {
    setPendingId(reportId);
    setError(null);
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
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setPendingId(null);
    }
  }

  if (reports.length === 0) {
    return <p className="text-sm text-stone-500">Açık rapor yok.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {reports.map((r) => (
        <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="font-medium">
            #{r.dealId} —{" "}
            <a href={`/firsat/${r.dealId}`} className="text-teal-700 hover:underline">
              {r.dealTitle}
            </a>
          </p>
          <p className="mt-1 text-sm">
            Nedeni: <strong>{REASON_LABELS[r.reason] ?? r.reason}</strong>
          </p>
          {r.details && <p className="mt-1 text-sm text-stone-600">“{r.details}”</p>}
          <p className="mt-1 text-xs text-stone-400">
            Raporlayan: {r.reporterName} · Fırsat durumu: {r.dealStatus}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pendingId === r.id}
              onClick={() => act(r.id, "remove_deal")}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Fırsatı Kaldır
            </button>
            <button
              type="button"
              disabled={pendingId === r.id}
              onClick={() => act(r.id, "dismiss")}
              className="rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 disabled:opacity-50"
            >
              Raporu Reddet
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
