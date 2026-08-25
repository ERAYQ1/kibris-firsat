"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { CategoryOption, LocationOption } from "@/server/meta";
import { CURRENCIES } from "@/lib/currency";
import { toast } from "sonner";
import {
  Tag,
  Store,
  Sparkles,
  UploadCloud,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

interface Props {
  categories: CategoryOption[];
  locations: LocationOption[];
}

export function DealForm({ categories, locations }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [currency, setCurrency] = useState<"TRY" | "GBP" | "EUR">("TRY");
  const [locationId, setLocationId] = useState<number>(locations[0]?.id || 1);
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Calculations
  const numPrice = Number.parseFloat(price) || 0;
  const numOrig = Number.parseFloat(originalPrice) || 0;
  let discountPercent = 0;
  if (numOrig > numPrice && numPrice > 0) {
    discountPercent = Math.round(((numOrig - numPrice) / numOrig) * 100);
  }

  const selectedCategory = categories.find((c) => c.id === Number(categoryId));
  const selectedLocation = locations.find((l) => l.id === Number(locationId));

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      toast.error("Lütfen geçerli bir başlık girin.");
      return;
    }
    if (!price || numPrice <= 0) {
      toast.error("Lütfen geçerli bir fiyat girin.");
      return;
    }
    if (!storeName.trim()) {
      toast.error("Lütfen mağaza/işletme adı girin.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      // 1. Fotoğrafları yükle
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

      // 2. Fırsatı oluştur
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        price,
        originalPrice: originalPrice || undefined,
        currency,
        categoryId: Number(categoryId),
        locationId: Number(locationId),
        storeName: storeName.trim(),
        storePhone: storePhone.trim() || undefined,
        storeAddress: storeAddress.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        imageFilenames: imageFilenames.length > 0 ? imageFilenames : undefined,
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

      const { id } = (await res.json()) as { id: number };
      toast.success("Fırsat başarıyla paylaşıldı! 🎉");
      router.push(`/firsat/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fırsat kaydedilemedi.";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  const steps = [
    { num: 1, label: "Temel Bilgiler" },
    { num: 2, label: "Fiyat & İndirim" },
    { num: 3, label: "Mağaza & Konum" },
    { num: 4, label: "Fotoğraflar" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sol: Step Form Alanı (7 Kolon) */}
      <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Adım İlerleme Çubuğu */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition ${
                  currentStep === s.num
                    ? "bg-slate-950 text-white shadow-sm"
                    : currentStep > s.num
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {currentStep > s.num ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
              </button>
              <span
                className={`text-xs font-semibold hidden md:inline-block ${
                  currentStep === s.num ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className="h-0.5 w-6 bg-slate-100 hidden sm:block mx-1" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ADIM 1: Temel Bilgiler */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Fırsat Başlığı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 5 Litre Yudum Ayçiçek Yağı İndirimi"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 text-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Fırsat Açıklaması & Şartlar (İsteğe bağlı)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Kampanya koşulları, kişi başı limit veya geçerlilik detayları..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* ADIM 2: Fiyat & İndirim */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    İndirimli Fiyat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="249.90"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Para Birimi</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as "TRY" | "GBP" | "EUR")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold outline-none focus:border-slate-950"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c === "TRY" ? "₺ TL" : c === "GBP" ? "£ GBP" : "€ EUR"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Eski (Normal) Fiyat (İsteğe bağlı)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="349.90"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
                {discountPercent > 0 && (
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    ✓ Otomatik hesaplanan indirim: %{discountPercent} İndirim
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ADIM 3: Mağaza & Konum */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Şehir <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-slate-950"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Mağaza / İşletme Adı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Örn: Erülkü Süpermarket"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    İşletme Telefonu (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="Örn: 0392 223 45 67"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Son Geçerlilik Tarihi (İsteğe bağlı)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950 text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mağaza Adresi / Şube (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Örn: Dereboyu Caddesi No: 42"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-950"
                />
              </div>
            </div>
          )}

          {/* ADIM 4: Fotoğraf Yükleme */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:border-slate-950 hover:bg-white cursor-pointer transition"
              >
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Fotoğrafları buraya sürükleyin veya seçin
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Maksimum 5 fotoğraf, her biri max 5 MB (JPEG, PNG, WebP)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-2">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={url}
                      className="group relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      <img src={url} alt="Önizleme" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-1 top-1 rounded-full bg-slate-950/80 p-1 text-white hover:bg-rose-600 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buton Kontrolleri */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                İleri
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 active:scale-95 transition shadow-sm disabled:opacity-50"
              >
                {pending ? "Yayınlanıyor..." : "Fırsatı Yayınla 🚀"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sağ: LIVE PREVIEW KARTI (5 Kolon) */}
      <div className="lg:col-span-5 space-y-3 sticky top-20 hidden lg:block">
        <div className="flex items-center justify-between px-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Canlı Önizleme
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Sitede böyle görünecek
          </span>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-md">
          {/* Görsel Alanı */}
          <div className="relative aspect-16/10 w-full bg-slate-100 border-b border-slate-100 flex items-center justify-center">
            {previewUrls.length > 0 ? (
              <img
                src={previewUrls[0]}
                alt="Önizleme"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Tag className="h-10 w-10 text-slate-300 stroke-1" />
                <span className="text-[11px] mt-1 font-medium">Fotoğraf Yok</span>
              </div>
            )}

            {discountPercent > 0 && (
              <span className="absolute left-3 top-3 rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-black text-white shadow-sm">
                -%{discountPercent} İNDİRİM
              </span>
            )}
          </div>

          {/* İçerik */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-600">
                {selectedCategory?.name || "Kategori"}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {selectedLocation?.name || "Lefkoşa"}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {title || "Fırsat Başlığı Buraya Gelecek"}
            </h3>

            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Store className="h-3.5 w-3.5 text-slate-400" />
              {storeName || "İşletme Adı"}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">
                {price ? `${price} ₺` : "0.00 ₺"}
              </span>
              {numOrig > numPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {originalPrice} ₺
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Önizleme modu</span>
            <span>0 Görüntülenme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
