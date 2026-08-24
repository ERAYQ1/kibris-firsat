import Link from "next/link";
import type { DealListItem } from "@/server/deals";
import { formatPrice, formatRelativeTime } from "@/lib/format";

export function DealCard({ deal }: { deal: DealListItem }) {
  const isExpired =
    deal.status === "expired" ||
    (deal.expiresAt !== null && deal.expiresAt * 1000 < Date.now());

  return (
    <Link
      href={`/firsat/${deal.id}`}
      className={`block rounded-lg border bg-white p-4 transition-colors hover:border-teal-600 ${
        isExpired ? "border-stone-200 opacity-60" : "border-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium leading-snug text-stone-900">{deal.title}</h2>
        {isExpired ? (
          <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">
            Süresi doldu
          </span>
        ) : (
          deal.score > 0 && (
            <span className="shrink-0 rounded bg-teal-50 px-1.5 py-0.5 text-xs font-medium text-teal-700">
              +{deal.score}
            </span>
          )
        )}
      </div>
      <p className="mt-2 text-xl font-bold text-teal-800">
        {formatPrice(deal.priceCents, deal.currency)}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-500">
        <span>{deal.storeName}</span>
        <span aria-hidden>·</span>
        <span>{deal.locationName}</span>
        <span aria-hidden>·</span>
        <span>{deal.categoryName}</span>
      </div>
      <p className="mt-1 text-xs text-stone-400">{formatRelativeTime(deal.createdAt)}</p>
    </Link>
  );
}
