"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { CategoryOption, LocationOption } from "@/server/meta";
import { CURRENCIES } from "@/lib/currency";
import { toast } from "sonner";
import {
  Tag,
  MapPin,
  Store,
  Calendar,
  FileText,
  Banknote,
  Sparkles,
  UploadCloud,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  categories: CategoryOption[];
  locations: LocationOption[];
}

export function DealForm({ categories, locations }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length + selectedFiles.length > 5) {
      toast.error("En fazla 5 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} boyutu 5 MB'tan büyük.`);
        continue;
      }
      validFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  }

  function handleRemoveImage(index: number) {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const expiresRaw = String(form.get("expiresAt") ?? "");
    const originalPriceRaw = String(form.get("originalPrice") ?? "");

    try {
      // 1. Görseller varsa önce /api/uploads'a yükle
      const imageFilenames: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const imgFormData = new FormData();
          imgFormData.append("image", file);
          const uploadRes = await fetch("/api/uploads", {
            method: "POST",
            body: imgFormData,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => null);
            throw new Error(errData?.error?.message ?? "Fotoğraf yüklenemedi.");
          }

          const { filename } = (await uploadRes.json()) as { filename: string };
          imageFilenames.push(filename);
        }
      }

      // 2. Fırsatı kaydet
      const payload = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        price: String(form.get("price") ?? ""),
        originalPrice: originalPriceRaw || undefined,
        currency: String(form.get("currency") ?? ""),
        categoryId: Number(form.get("categoryId")),
        locationId: Number(form.get("locationId")),
        storeName: String(form.get("storeName") ?? ""),
        imageFilenames: imageFilenames.length > 0 ? imageFilenames : undefined,
        ...(expiresRaw ? { expiresAt: new Date(expiresRaw).toISOString() } : {}),
      };

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
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
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

      {/* Görsel Yükleme Bölümü */}
      <div>
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
          <ImageIcon className="h-4 w-4 text-teal-600" />
          Fırsat Fotoğrafı / Fiyat Etiketi (Opsiyonel - Max 5 adet)
        </span>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-5 text-center transition hover:border-teal-500 hover:bg-teal-50/30"
        >
          <UploadCloud className="h-8 w-8 text-stone-400" />
          <p className="mt-1 text-sm font-medium text-stone-700">
            Fotoğraf seçmek için tıklayın
          </p>
          <p className="text-xs text-stone-400">JPEG, PNG veya WebP (Max 5 MB)</p>
        </div>

        {previewUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previewUrls.map((url, i) => (
              <div key={i} className="group relative aspect-square rounded-lg border border-stone-200 overflow-hidden">
                <img
                  src={url}
                  alt={`Önizleme ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-90 hover:bg-black transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200"
        >
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
