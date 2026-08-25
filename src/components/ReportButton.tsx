"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/report-reasons";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { Flag, Send } from "lucide-react";

export function ReportButton({ dealId }: { dealId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });

      if (res.status === 401) {
        toast.error("Rapor göndermek için giriş yapmalısınız.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Rapor gönderilemedi.");
      }

      toast.success("Şikayetiniz editörlerimize iletildi. Teşekkür ederiz.");
      setOpen(false);
      setDetails("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Bildir</span>
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Fırsatı Şikayet Et"
        description="Fiyat sahte, stok bitmiş veya yanıltıcı içerik mi var? Bize bildirin."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Şikayet Nedeni *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Gördüğünüz hatalı durumu kısaca belirtin..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Gönderiliyor..." : "Raporu Gönder"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
