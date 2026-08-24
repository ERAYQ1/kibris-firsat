"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/report-reasons";

export function ReportButton({ dealId }: { dealId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Rapor gönderilemedi.");
      }
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
      setState("idle");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-stone-400 underline-offset-2 hover:text-stone-700 hover:underline"
      >
        Raporla
      </button>
    );
  }

  if (state === "done") {
    return <span className="text-sm text-teal-700">Raporunuz alındı, teşekkürler.</span>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
      className="w-full space-y-2 rounded-md border border-stone-200 p-3"
    >
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">Rapor nedeni</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm"
        >
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">Açıklama (isteğe bağlı)</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={500}
          rows={2}
          className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-md bg-stone-800 px-3 py-1.5 text-sm text-white hover:bg-stone-900 disabled:opacity-50"
        >
          Gönder
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
