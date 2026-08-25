import Link from "next/link";
import { getStoreDetail, listStoreDeals } from "@/server/stores";
import { DealCard } from "@/components/DealCard";
import { Store, MapPin, Phone, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  const store = getStoreDetail(storeId);
  const deals = listStoreDeals(storeId);

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Fırsatlara Dön
      </Link>

      {/* Mağaza Başlık Kartı */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md">
              <Store className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">{store.name}</h1>
                {store.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Doğrulanmış İşletme
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  {store.locationName}
                </span>
                {store.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-stone-400" />
                    {store.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-teal-50 px-4 py-2 text-center text-teal-900">
            <span className="block text-xl font-black">{deals.length}</span>
            <span className="text-xs font-semibold">Aktif Fırsat</span>
          </div>
        </div>
      </div>

      {/* Mağazanın Fırsatları */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          {store.name} Kampanya ve İndirimleri
        </h2>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-xs text-stone-400">
            Bu mağaza için şu an aktif fırsat bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
