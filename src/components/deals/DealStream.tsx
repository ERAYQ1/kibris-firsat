"use client";

import { useState, useEffect } from "react";
import type { DealListItem } from "@/server/deals";
import { DealListItemCard } from "@/components/deals/DealListItemCard";
import { DealGridViewCard } from "@/components/deals/DealGridViewCard";
import { LayoutList, LayoutGrid, Flame, Sparkles, TrendingDown, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface DealStreamProps {
  deals: DealListItem[];
  total: number;
}

export function DealStream({ deals, total }: DealStreamProps) {
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "new";

  // Görünüm modu: list (varsayılan akış) veya grid
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kibris_firsat_view_mode");
      if (saved === "list" || saved === "grid") {
        setViewMode(saved);
      }
    } catch {
      // noop
    }
  }, []);

  function handleSetViewMode(mode: "list" | "grid") {
    setViewMode(mode);
    try {
      localStorage.setItem("kibris_firsat_view_mode", mode);
    } catch {
      // noop
    }
  }

  function getSortUrl(newSort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    return `/?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      {/* Üst Sıralama & Görünüm Değiştirici Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200/90 p-2 sm:px-4 sm:py-2.5 shadow-2xs">
        
        {/* Sıralama Sekmeleri */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href={getSortUrl("hot")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              currentSort === "hot"
                ? "bg-orange-500 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>En Sıcaklar</span>
          </Link>

          <Link
            href={getSortUrl("new")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              currentSort === "new"
                ? "bg-slate-950 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>En Yeniler</span>
          </Link>

          <Link
            href={getSortUrl("discount")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              currentSort === "discount"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>En Çok İndirim</span>
          </Link>
        </div>

        {/* Sağ: Fırsat Sayısı & Liste/Izgara Butonları */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            {total} fırsat bulundu
          </span>

          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => handleSetViewMode("list")}
              title="Liste Görünümü"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-950 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutList className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleSetViewMode("grid")}
              title="Izgara Görünümü"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-950 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Fırsatlar Akışı */}
      {deals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Aradığınız kriterde fırsat bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Filtreleri sıfırlayarak veya farklı bir arama yaparak tekrar deneyebilirsiniz.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
          >
            Filtreleri Temizle
          </Link>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3.5">
          {deals.map((deal) => (
            <DealListItemCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <DealGridViewCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
