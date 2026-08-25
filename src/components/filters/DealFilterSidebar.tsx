"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Flame,
  Clock,
  Percent,
  ArrowUpDown,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface LocationItem {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
}

interface DealFilterSidebarProps {
  locations: LocationItem[];
}

export function DealFilterSidebar({ locations }: DealFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const currentLocation = searchParams.get("location") || "";
  const currentMinDiscount = searchParams.get("minDiscount") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const hasActiveFilters = Boolean(
    currentLocation || currentMinDiscount || currentMinPrice || currentMaxPrice || (currentSort && currentSort !== "newest")
  );

  function updateQuery(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(overrides)) {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    params.delete("page"); // reset page
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({
      minPrice: minPriceInput ? String(minPriceInput) : null,
      maxPrice: maxPriceInput ? String(maxPriceInput) : null,
    });
  }

  function handleReset() {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/");
  }

  return (
    <aside className="space-y-6">
      {/* Filtre Başlığı & Temizle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-amber-600" />
          <span>Filtreler</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Temizle
          </button>
        )}
      </div>

      {/* 1. Sıralama Seçenekleri */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Sıralama
        </h4>
        <div className="space-y-1">
          {[
            { id: "hot", label: "En Sıcak Fırsatlar", icon: <Flame className="h-3.5 w-3.5 text-amber-500" /> },
            { id: "newest", label: "En Yeniler", icon: <Clock className="h-3.5 w-3.5 text-slate-400" /> },
            { id: "discount", label: "En Çok İndirim (%)", icon: <Percent className="h-3.5 w-3.5 text-rose-500" /> },
            { id: "price_asc", label: "Fiyata Göre: Artan", icon: <ArrowUpDown className="h-3.5 w-3.5 text-emerald-500" /> },
            { id: "price_desc", label: "Fiyata Göre: Azalan", icon: <ArrowUpDown className="h-3.5 w-3.5 text-blue-500" /> },
          ].map((item) => {
            const isSelected = currentSort === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateQuery({ sort: item.id === "newest" ? null : item.id })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-950 font-bold text-white shadow-xs"
                    : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Kıbrıs Şehirleri / Bölgeler */}
      <div className="space-y-2.5 border-t border-slate-200/80 pt-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Bölge / Şehir
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateQuery({ location: null })}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
              !currentLocation
                ? "bg-amber-50 font-bold text-amber-900 border border-amber-200/80"
                : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-600" />
              <span>Tüm Kıbrıs</span>
            </span>
            {!currentLocation && <span className="text-[10px] font-extrabold text-amber-700">✓</span>}
          </button>

          {locations.map((loc) => {
            const isSelected = currentLocation === loc.slug;
            return (
              <button
                key={loc.slug}
                type="button"
                onClick={() => updateQuery({ location: isSelected ? null : loc.slug })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-950 font-bold text-white shadow-xs"
                    : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{loc.name}</span>
                </span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Minimum İndirim Oranı */}
      <div className="space-y-2.5 border-t border-slate-200/80 pt-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Minimum İndirim
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: "20", label: "%20+" },
            { value: "30", label: "%30+" },
            { value: "50", label: "%50+" },
          ].map((disc) => {
            const isSelected = currentMinDiscount === disc.value;
            return (
              <button
                key={disc.value}
                type="button"
                onClick={() => updateQuery({ minDiscount: isSelected ? null : disc.value })}
                className={`rounded-xl py-1.5 text-center text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {disc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Fiyat Aralığı (TL) */}
      <div className="space-y-2.5 border-t border-slate-200/80 pt-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Fiyat Aralığı (₺)
        </h4>
        <form onSubmit={handlePriceSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl border border-slate-300 bg-white py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            Filtrele
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileFilterModal({ locations }: { locations: LocationItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex lg:hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 cursor-pointer"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
        <span>Filtrele</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                <span>Filtreler ve Sıralama</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div onClick={() => setIsOpen(false)}>
              <DealFilterSidebar locations={locations} />
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-2xl bg-slate-950 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
            >
              Sonuçları Gör
            </button>
          </div>
        </div>
      )}
    </>
  );
}
