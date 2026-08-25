import Link from "next/link";
import type { DealListItem } from "@/server/deals";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { MapPin, Store, Tag, Flame } from "lucide-react";

export function DealCard({ deal }: { deal: DealListItem }) {
  const isExpired =
    deal.status === "expired" ||
    (deal.expiresAt !== null && deal.expiresAt * 1000 < Date.now());

  const hasDiscount =
    deal.originalPriceCents !== null &&
    deal.originalPriceCents > deal.priceCents;

  const discountPercent = hasDiscount
    ? Math.round(
        ((deal.originalPriceCents! - deal.priceCents) /
          deal.originalPriceCents!) *
          100
      )
    : null;

  const isHot = deal.score >= 3;

  return (
    <Link
      href={`/firsat/${deal.id}`}
      className={`group relative block rounded-xl border bg-white p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isExpired
          ? "border-stone-200 opacity-60"
          : "border-stone-200 hover:border-teal-500"
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <h2 className="font-semibold leading-snug text-stone-900 group-hover:text-teal-900">
          {deal.title}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          {isExpired ? (
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
              Süresi doldu
            </span>
          ) : (
            <>
              {isHot && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                  <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  Sıcak
                </span>
              )}
              {deal.score > 0 && (
                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700 border border-teal-200/60">
                  +{deal.score}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-teal-800 tracking-tight">
          {formatPrice(deal.priceCents, deal.currency)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm font-medium text-stone-400 line-through">
              {formatPrice(deal.originalPriceCents!, deal.currency)}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              %{discountPercent} İndirim
            </span>
          </>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-stone-600 border-t border-stone-100 pt-3">
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
        <span className="ml-auto text-stone-400">{formatRelativeTime(deal.createdAt)}</span>
      </div>
    </Link>
  );
}
