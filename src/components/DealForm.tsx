"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CategoryOption, LocationOption } from "@/server/meta";
import { CURRENCIES } from "@/lib/currency";

interface Props {
  categories: CategoryOption[];
  locations: LocationOption[];
}

export function DealForm({ categories, locations }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const expiresRaw = String(form.get("expiresAt") ?? "");
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      price: String(form.get("price") ?? ""),
      currency: String(form.get("currency") ?? ""),
      categoryId: Number(form.get("categoryId")),
      locationId: Number(form.get("locationId")),
      storeName: String(form.get("storeName") ?? ""),
      ...(expiresRaw ? { expiresAt: new Date(expiresRaw).toISOString() } : {}),
    };
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Fırsat kaydedilemedi.");
      }
      const created = (await res.json()) as { id: number };
      router.push(`/firsat/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Başlık *</span>
        <input name="title" required minLength={5} maxLength={120} className={inputClass}
          placeholder="Örn: 5 kg pirinç kampanyada" />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="col-span-2 block">
          <span className="mb-1 block text-sm font-medium">Fiyat *</span>
          <input name="price" required inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?"
            className={inputClass} placeholder="249,90" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Para birimi *</span>
          <select name="currency" required defaultValue="TRY" className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Kategori *</span>
          <select name="categoryId" required className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Konum *</span>
          <select name="locationId" required className={inputClass}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Mağaza *</span>
        <input name="storeName" required minLength={2} maxLength={80} className={inputClass}
          placeholder="Örn: X Market" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Açıklama</span>
        <textarea name="description" maxLength={2000} rows={4} className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Geçerlilik tarihi</span>
        <input type="datetime-local" name="expiresAt" className={inputClass} />
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Fırsatı Paylaş"}
      </button>
    </form>
  );
}
