import Link from "next/link";
import { listDeals, type DealListOptions } from "@/server/deals";
import { listCategories, listLocations, listPopularStores } from "@/server/meta";
import { DealStream } from "@/components/deals/DealStream";
import { CategoryRibbon } from "@/components/navigation/CategoryRibbon";
import { DealFilterSidebar, MobileFilterModal } from "@/components/filters/DealFilterSidebar";
import { TopStoresWidget } from "@/components/widgets/TopStoresWidget";
import { CommunityStatsWidget } from "@/components/widgets/CommunityStatsWidget";
import { X } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. STICKY KATEGORİ ŞERİDİ */}
      <CategoryRibbon categories={categories} totalDealsCount={total} />

      {/* 2. ANA PAZARYERİ DÜZENİ (4 KOLON SOL PANEL + 8 KOLON GENİŞ FIRSAT AKIŞI) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SOL KOLON: FİLTRE PANELİ & POPÜLER İŞLETMELER (4 Kolon) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <DealFilterSidebar locations={locations} />
            </div>

            <TopStoresWidget stores={topStores} />
            <CommunityStatsWidget totalDeals={total} />
          </aside>

          {/* SAĞ KOLON: ANA FIRSAT AKIŞI (8 Kolon — Geniş, Okunabilir ve Ferah) */}
          <main className="lg:col-span-8 space-y-4">
            {/* Mobil Filtre Butonu & Aktif Filtre Rozetleri */}
            <div className="flex flex-wrap items-center justify-between gap-2 lg:hidden">
              <MobileFilterModal locations={locations} />
              <span className="text-xs font-bold text-slate-500">{total} fırsat</span>
            </div>

            {/* Aktif Filtre Rozetleri */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white border border-slate-200/90 p-3 shadow-2xs">
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

            {/* İnteraktif Fırsat Akışı (Liste/Izgara & Sıralama) */}
            <DealStream deals={deals} total={total} />
          </main>

        </div>
      </div>
    </div>
  );
}
