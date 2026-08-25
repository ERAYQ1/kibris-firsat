import { getDb } from "@/server/db";
import { stores, locations, deals, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { listLocations } from "@/server/meta";
import { CyprusDealsMap, type MapStoreItem } from "@/components/map/CyprusDealsMap";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fırsat Haritası — Kuzey Kıbrıs İndirim & Mağaza Haritası",
  description:
    "Lefkoşa, Girne, Gazimağusa, Güzelyurt, İskele ve Lefke'deki mağaza indirimlerini harita üzerinden canlı keşfedin.",
};

export default async function MapPage() {
  const db = getDb();
  const allLocations = listLocations(db);

  // Koordinatı olan ve fırsatı olan mağazaları çek
  const storeRows = db
    .select({
      id: stores.id,
      name: stores.name,
      phone: stores.phone,
      address: stores.address,
      latitude: stores.latitude,
      longitude: stores.longitude,
      isVerified: stores.isVerified,
      locationName: locations.name,
      locationSlug: locations.slug,
    })
    .from(stores)
    .innerJoin(locations, eq(locations.id, stores.locationId))
    .all();

  // Her mağazanın aktif fırsatlarını topla
  const mapStores: MapStoreItem[] = storeRows.map((st) => {
    const activeDeals = db
      .select({
        id: deals.id,
        title: deals.title,
        priceCents: deals.priceCents,
        originalPriceCents: deals.originalPriceCents,
        currency: deals.currency,
        couponCode: deals.couponCode,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(deals)
      .innerJoin(categories, eq(categories.id, deals.categoryId))
      .where(and(eq(deals.storeId, st.id), eq(deals.status, "active")))
      .all();

    return {
      ...st,
      isVerified: st.isVerified === 1,
      deals: activeDeals,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Harita Başlık Şeridi */}
      <div className="border-b border-slate-200/80 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" />
                <span>Kuzey Kıbrıs Konum Bazlı Keşif</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                İnteraktif Fırsat & Mağaza Haritası
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Girne, Lefkoşa, Gazimağusa ve diğer bölgelerdeki işletmelerin indirimlerini harita üzerinde konumlarına göre filtreleyin ve anında keşfedin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Harita Bileşeni */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <CyprusDealsMap stores={mapStores} locations={allLocations} />
      </div>
    </div>
  );
}
