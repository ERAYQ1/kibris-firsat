"use client";

import Link from "next/link";
import type { DealListItem } from "@/server/deals";
import { CardVoteMeter } from "@/components/deals/CardVoteMeter";
import { DealVisual } from "@/components/deals/DealVisual";
import { DealPrice } from "@/components/deals/DealPrice";
import { LiveCountdown } from "@/components/deals/LiveCountdown";
import { CouponBadge } from "@/components/deals/CouponBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { MapPin, Store, Eye, ArrowUpRight } from "lucide-react";

interface DealGridViewCardProps {
  deal: DealListItem;
}

export function DealGridViewCard({ deal }: DealGridViewCardProps) {
  let discountPercent = 0;
  let savingsCents = 0;
  if (deal.originalPriceCents && deal.originalPriceCents > deal.priceCents) {
    savingsCents = deal.originalPriceCents - deal.priceCents;
    discountPercent = Math.round((savingsCents / deal.originalPriceCents) * 100);
  }

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Üst Görsel / Showcase Alanı */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
          <Link href={`/firsat/${deal.id}`} className="block h-full w-full">
            <DealVisual
              imageFilename={deal.imageFilename}
              title={deal.title}
              categorySlug={deal.categorySlug}
              categoryName={deal.categoryName}
              storeName={deal.storeName}
              aspect="wide"
            />
          </Link>

          {/* İndirim Rozeti */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-black text-white shadow-sm">
              -%{discountPercent}
            </div>
          )}

          {/* Favori Butonu */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <FavoriteButton dealId={deal.id} variant="icon" />
          </div>
        </div>

        {/* Gövde Bilgi Alanı */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Mağaza & Konum Satırı */}
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <Link
              href={`/magaza/${deal.storeId}`}
              className="inline-flex items-center gap-1 font-bold text-slate-800 hover:text-amber-700 transition truncate max-w-[140px]"
            >
              <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{deal.storeName}</span>
              {deal.isVerified && <VerifiedBadge type="compact" />}
            </Link>

            <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400" />
              {deal.locationName}
            </span>
          </div>

          {/* Fırsat Başlığı */}
          <Link
            href={`/firsat/${deal.id}`}
            className="block group-hover:text-amber-900 transition"
          >
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-10">
              {deal.title}
            </h3>
          </Link>

          {/* Kupon Kodu (Varsa) */}
          {deal.couponCode && (
            <div className="pt-0.5">
              <CouponBadge
                code={deal.couponCode}
                discountDescription={deal.couponDiscount}
                variant="compact"
              />
            </div>
          )}

          {/* Kalan Süre & Fiyat Alanı */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <LiveCountdown expiresAt={deal.expiresAt} status={deal.status} />

            {savingsCents > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50">
                ₺{(savingsCents / 100).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} Tasarruf
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <DealPrice
              priceCents={deal.priceCents}
              originalPriceCents={deal.originalPriceCents}
              currency={deal.currency}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Alt Bilgi Barı: Oylama Metresi + Görüntülenme + Aksiyon */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-500 gap-2">
        <CardVoteMeter
          dealId={deal.id}
          initialScore={deal.score}
          orientation="horizontal"
        />

        <div className="flex items-center gap-2 text-[11px] font-medium shrink-0">
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Eye className="h-3.5 w-3.5" />
            {deal.viewCount}
          </span>

          <Link
            href={`/firsat/${deal.id}`}
            aria-label="Fırsatı Gör"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition shadow-2xs"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
