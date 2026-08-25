import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreDetail, listStoreDeals } from "@/server/stores";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { MapPin, Phone, ArrowLeft, Tag } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isInteger(storeId) || storeId <= 0) return { title: "Mağaza Bulunamadı" };

  try {
    const store = getStoreDetail(storeId);
    return {
      title: `${store.name} (${store.locationName}) Fırsatları | Kıbrıs Fırsat`,
      description: `${store.name} mağazasındaki en son indirimler ve kampanyalar.`,
    };
  } catch {
    return { title: "Mağaza Bulunamadı" };
  }
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isInteger(storeId) || storeId <= 0) notFound();

  let store;
  let deals;
  try {
    store = getStoreDetail(storeId);
    deals = listStoreDeals(storeId);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Fırsatlara Dön
      </Link>

      {/* Mağaza Başlık Kartı */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white font-black text-2xl shadow-md">
              {store.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                  {store.name}
                </h1>
                {store.isVerified && <VerifiedBadge type="store" />}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {store.locationName}
                </span>
                {store.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {store.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4.5 py-2.5 text-center min-w-[110px]">
            <span className="block text-xl font-black text-slate-950">{deals.length}</span>
            <span className="text-[11px] font-semibold text-slate-500">Aktif Fırsat</span>
          </div>
        </div>
      </div>

      {/* Mağazanın Fırsatları */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-amber-600" />
            {store.name} Kampanya ve İndirimleri ({deals.length})
          </h2>
        </div>

        {deals.length === 0 ? (
          <EmptyState
            title="Bu işletme için şu an aktif fırsat bulunmuyor."
            description="İşletmenin yeni bir indirimini gördüyseniz ilk siz ekleyebilirsiniz."
            actionText="Fırsat Ekle"
            actionHref="/firsat/yeni"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
