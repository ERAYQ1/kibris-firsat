import Link from "next/link";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import type { DealListItem } from "@/server/deals";
import { Flame, MapPin, Store, Tag } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";

interface Props {
  deal: DealListItem;
}

export function DealCard({ deal }: Props) {
  const isHot = deal.score >= 5;

  let discountPercent = 0;
  if (deal.originalPriceCents && deal.originalPriceCents > deal.priceCents) {
    discountPercent = Math.round(
      ((deal.originalPriceCents - deal.priceCents) / deal.originalPriceCents) * 100
    );
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <Link href={`/firsat/${deal.id}`} className="flex-1">
            <h2 className="font-semibold leading-snug text-stone-900 transition group-hover:text-teal-900 line-clamp-2">
              {deal.title}
            </h2>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            {isHot && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-500/20">
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                Sıcak
              </span>
            )}
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                deal.score > 0
                  ? "bg-teal-50 text-teal-700 border border-teal-200/60"
                  : deal.score < 0
                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {deal.score > 0 ? `+${deal.score}` : deal.score}
            </span>
          </div>
        </div>

        {/* Fiyat & İndirim Rozeti */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-teal-800 tracking-tight">
            {formatPrice(deal.priceCents, deal.currency)}
          </span>
          {deal.originalPriceCents && deal.originalPriceCents > deal.priceCents && (
            <>
              <span className="text-sm font-medium text-stone-400 line-through">
                {formatPrice(deal.originalPriceCents, deal.currency)}
              </span>
              {discountPercent > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  %{discountPercent} İndirim
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alt Bilgi & Butonlar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 font-medium text-stone-700">
            <Store className="h-3.5 w-3.5 text-stone-400" />
            {deal.storeName}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-stone-400" />
            {deal.locationName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-stone-400" />
            {deal.categoryName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FavoriteButton dealId={deal.id} />
          <span className="text-stone-400 text-[11px]">
            {formatTimeAgo(deal.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
