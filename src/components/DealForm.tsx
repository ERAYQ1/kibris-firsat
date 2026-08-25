"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CategoryOption, LocationOption } from "@/server/meta";
import { CURRENCIES } from "@/lib/currency";
import { toast } from "sonner";
import { Tag, MapPin, Store, Calendar, FileText, Banknote, Sparkles } from "lucide-react";

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
    const originalPriceRaw = String(form.get("originalPrice") ?? "");
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      price: String(form.get("price") ?? ""),
      originalPrice: originalPriceRaw || undefined,
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
      toast.success("Fırsat başarıyla paylaşıldı!");
      router.push(`/firsat/${created.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
      setError(msg);
      toast.error(msg);
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-2xs outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
          <Sparkles className="h-4 w-4 text-teal-600" />
          Fırsat Başlığı *
        </span>
        <input
          name="title"
          required
          minLength={5}
          maxLength={120}
          className={inputClass}
          placeholder="Örn: 5 kg Osmancık Pirinçte Şok İndirim"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
            <Banknote className="h-4 w-4 text-teal-600" />
            İndirimli Fiyat *
          </span>
          <input
            name="price"
            required
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]{1,2})?"
            className={inputClass}
            placeholder="99,90"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-600">
            Eski Fiyat (Opsiyonel)
          </span>
          <input
            name="originalPrice"
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]{1,2})?"
            className={inputClass}
            placeholder="149,90"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-stone-800">
            Para Birimi *
          </span>
          <select name="currency" required defaultValue="TRY" className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
            <Tag className="h-4 w-4 text-teal-600" />
            Kategori *
          </span>
          <select name="categoryId" required className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
            <MapPin className="h-4 w-4 text-teal-600" />
            Konum / Şehir *
          </span>
          <select name="locationId" required className={inputClass}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
          <Store className="h-4 w-4 text-teal-600" />
          Mağaza / Restoran Adı *
        </span>
        <input
          name="storeName"
          required
          minLength={2}
          maxLength={80}
          className={inputClass}
          placeholder="Örn: Lemar Market (Lefkoşa) veya Gloria Jean's"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
          <FileText className="h-4 w-4 text-stone-500" />
          Detay & Açıklama (İsteğe Bağlı)
        </span>
        <textarea
          name="description"
          maxLength={2000}
          rows={3}
          className={inputClass}
          placeholder="Hangi reyon veya şubede? Kampanya şartı var mı? (Örn: Sadece bugün geçerli)"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
          <Calendar className="h-4 w-4 text-stone-500" />
          Son Geçerlilik Tarihi (İsteğe Bağlı)
        </span>
        <input type="datetime-local" name="expiresAt" className={inputClass} />
      </label>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50"
      >
        {pending ? "Fırsat Paylaşılıyor…" : "Fırsatı Paylaş"}
      </button>
    </form>
  );
}
