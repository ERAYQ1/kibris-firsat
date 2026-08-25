import Link from "next/link";
import { listDeals, type DealListOptions } from "@/server/deals";
import { listCategories, listLocations, listPopularStores } from "@/server/meta";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryRibbon } from "@/components/navigation/CategoryRibbon";
import { DealFilterSidebar, MobileFilterModal } from "@/components/filters/DealFilterSidebar";
import { TopStoresWidget } from "@/components/widgets/TopStoresWidget";
import { CommunityStatsWidget } from "@/components/widgets/CommunityStatsWidget";
import {
  Flame,
  Clock,
  Percent,
  Search,
  X,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kıbrıs Fırsat — Kuzey Kıbrıs İndirim & Fiyat Keşif Platformu",
  description:
    "Kuzey Kıbrıs genelindeki market, restoran, kafe ve teknoloji indirimlerini keşfedin, tasarruf edin ve toplulukla paylaşın.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    minDiscount?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const query = sp.q?.trim() || "";
  const categorySlug = sp.category?.trim() || "";
  const locationSlug = sp.location?.trim() || "";
  const sort = (sp.sort?.trim() || "newest") as DealListOptions["sort"];
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);

  const minPrice = sp.minPrice ? Number.parseInt(sp.minPrice, 10) * 100 : undefined;
  const maxPrice = sp.maxPrice ? Number.parseInt(sp.maxPrice, 10) * 100 : undefined;
  const minDiscount = sp.minDiscount ? Number.parseInt(sp.minDiscount, 10) : undefined;

  const dealsResult = await listDeals({
    q: query || undefined,
    categorySlug: categorySlug || undefined,
    locationSlug: locationSlug || undefined,
    minPriceCents: minPrice,
    maxPriceCents: maxPrice,
    minDiscount,
    sort,
    page,
    pageSize: 18,
  });

  const categories = listCategories();
  const locations = listLocations().map((l) => ({ ...l, sortOrder: 0 }));
  const topStores = listPopularStores();

  const { items: deals, total } = dealsResult;
  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const activeLocation = locations.find((l) => l.slug === locationSlug);

  const hasActiveFilters = Boolean(
    query || categorySlug || locationSlug || minPrice || maxPrice || minDiscount || (sort && sort !== "newest")
  );

  function createTabUrl(targetSort: string) {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (categorySlug) p.set("category", categorySlug);
    if (locationSlug) p.set("location", locationSlug);
    if (sp.minPrice) p.set("minPrice", sp.minPrice);
    if (sp.maxPrice) p.set("maxPrice", sp.maxPrice);
    if (sp.minDiscount) p.set("minDiscount", sp.minDiscount);
    if (targetSort !== "newest") p.set("sort", targetSort);
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. STICKY KATEGORİ ŞERİDİ */}
      <CategoryRibbon categories={categories} totalDealsCount={total} />

      {/* 2. ANA PAZARYERİ DÜZENİ (3 KOLON) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SOL KOLON: FİLTRE PANELİ (3 Kolon) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
              <DealFilterSidebar locations={locations} />
            </div>
          </div>

          {/* ORTA KOLON: FIRSAT AKIŞI & LİSTE (lg:col-span-9 veya xl:col-span-6) */}
          <main className="lg:col-span-9 xl:col-span-6 space-y-4">
            {/* Üst Sekmeler & Aktif Filtre Çipleri */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                {/* Hızlı Tab Filtreleri */}
                <div className="flex items-center gap-1">
                  <Link
                    href={createTabUrl("hot")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      sort === "hot"
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    <span>En Sıcaklar</span>
                  </Link>

                  <Link
                    href={createTabUrl("newest")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      sort === "newest" || !sort
                        ? "bg-slate-950 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>En Yeniler</span>
                  </Link>

                  <Link
                    href={createTabUrl("discount")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      sort === "discount"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Percent className="h-3.5 w-3.5" />
                    <span>En Çok İndirim</span>
                  </Link>
                </div>

                {/* Sağ: Mobil Filtre Butonu & Sonuç Sayısı */}
                <div className="flex items-center gap-2">
                  <MobileFilterModal locations={locations} />
                  <span className="text-xs font-bold text-slate-500">
                    {total} fırsat
                  </span>
                </div>
              </div>

              {/* Aktif Filtre Rozetleri */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-400">Filtreler:</span>
                  {query && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                      "{query}"
                    </span>
                  )}
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 border border-amber-200">
                      {activeCategory.name}
                    </span>
                  )}
                  {activeLocation && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                      📍 {activeLocation.name}
                    </span>
                  )}
                  {minDiscount && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
                      %{minDiscount}+ İndirim
                    </span>
                  )}
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition ml-auto"
                  >
                    <X className="h-3 w-3" />
                    Temizle
                  </Link>
                </div>
              )}
            </div>

            {/* Fırsat Kartları Listesi */}
            {deals.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8 text-slate-400" />}
                title="Aramanızla eşleşen fırsat bulunamadı."
                description="Farklı anahtar kelimeler deneyebilir veya filtreleri sıfırlayabilirsiniz."
                actionText="Tüm Fırsatları Göster"
                actionHref="/"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </main>

          {/* SAĞ KOLON: İŞLETME & TOPLULUK WIDGETLARI (3 Kolon, XL Ekranlar) */}
          <div className="hidden xl:block xl:col-span-3 space-y-5 sticky top-24">
            <TopStoresWidget stores={topStores} />
            <CommunityStatsWidget totalDeals={total} />
          </div>

        </div>
      </div>
    </div>
  );
}
