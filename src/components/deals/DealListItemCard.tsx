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
import { formatTimeAgo } from "@/lib/format";
import { MapPin, Store, Eye, ArrowRight } from "lucide-react";

interface DealListItemCardProps {
  deal: DealListItem;
}

export function DealListItemCard({ deal }: DealListItemCardProps) {
  let discountPercent = 0;
  let savingsCents = 0;
  if (deal.originalPriceCents && deal.originalPriceCents > deal.priceCents) {
    savingsCents = deal.originalPriceCents - deal.priceCents;
    discountPercent = Math.round((savingsCents / deal.originalPriceCents) * 100);
  }

  return (
    <article className="group relative rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center sm:items-stretch gap-3.5 sm:gap-5">
        
        {/* 1. DİKEY SICAKLIK OY METRESİ (Yalnızca Masaüstü/Tablet sm+) */}
        <div className="hidden sm:flex shrink-0">
          <CardVoteMeter
            dealId={deal.id}
            initialScore={deal.score}
            orientation="vertical"
            className="w-13 self-stretch justify-around py-2"
          />
        </div>

        {/* 2. GÖRSEL / SHOWCASE KARTI */}
        <div className="relative shrink-0 w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-2xs">
          <Link href={`/firsat/${deal.id}`} className="block h-full w-full">
            <DealVisual
              imageFilename={deal.imageFilename}
              title={deal.title}
              categorySlug={deal.categorySlug}
              categoryName={deal.categoryName}
              storeName={deal.storeName}
              aspect="square"
              className="h-full w-full"
            />
          </Link>

          {/* İndirim Rozeti */}
          {discountPercent > 0 && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 rounded-md sm:rounded-lg bg-rose-600 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-black text-white shadow-sm">
              -%{discountPercent}
            </div>
          )}

          {/* Favori Butonu (Yalnızca masaüstü görsel köşesinde) */}
          <div className="hidden sm:block absolute top-2 right-2">
            <FavoriteButton dealId={deal.id} variant="icon" />
          </div>
        </div>

        {/* 3. ORTA İÇERİK BLOĞU */}
        <div className="flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5 min-w-0">
          <div>
            {/* Üst Bilgi Satırı */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mb-1">
              <Link
                href={`/magaza/${deal.storeId}`}
                className="inline-flex items-center gap-1 font-bold text-slate-800 hover:text-amber-700 transition truncate max-w-[130px]"
              >
                <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{deal.storeName}</span>
                {deal.isVerified && <VerifiedBadge type="compact" />}
              </Link>

              <span className="text-slate-300">•</span>

              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <MapPin className="h-3 w-3 text-slate-400" />
                {deal.locationName}
              </span>

              <span className="text-slate-300 hidden sm:inline">•</span>

              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {formatTimeAgo(deal.createdAt)}
              </span>
            </div>

            {/* Fırsat Başlığı */}
            <Link
              href={`/firsat/${deal.id}`}
              className="block group-hover:text-amber-900 transition"
            >
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                {deal.title}
              </h3>
            </Link>

            {/* Kupon Kodu Rozeti (Varsa) */}
            {deal.couponCode && (
              <div className="mt-1.5">
                <CouponBadge
                  code={deal.couponCode}
                  discountDescription={deal.couponDiscount}
                  variant="compact"
                />
              </div>
            )}

            {/* Mobilde Fiyat Satırı */}
            <div className="sm:hidden flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <DealPrice
                  priceCents={deal.priceCents}
                  originalPriceCents={deal.originalPriceCents}
                  currency={deal.currency}
                  size="sm"
                />
                {savingsCents > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200/50">
                    ₺{(savingsCents / 100).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} Tasarruf
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <FavoriteButton dealId={deal.id} variant="icon" />
              </div>
            </div>
          </div>

          {/* Alt Bilgi Şeridi (Masaüstü) */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <LiveCountdown expiresAt={deal.expiresAt} status={deal.status} />

            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Eye className="h-3.5 w-3.5" />
                {deal.viewCount}
              </span>

              <span className="text-slate-300">•</span>

              <span className="text-slate-500">
                Paylaşan: <strong className="text-slate-700 font-semibold">{deal.authorName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 4. SAĞ FİYAT & AKSİYON KOLONU (Yalnızca Masaüstü sm+) */}
        <div className="hidden sm:flex shrink-0 flex-col items-end justify-center gap-3 pl-4 border-l border-slate-100 min-w-[150px]">
          <div className="text-right">
            <DealPrice
              priceCents={deal.priceCents}
              originalPriceCents={deal.originalPriceCents}
              currency={deal.currency}
              size="lg"
            />

            {savingsCents > 0 && (
              <div className="mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50 inline-block">
                ₺{(savingsCents / 100).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} Tasarruf
              </div>
            )}
          </div>

          <Link
            href={`/firsat/${deal.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition group-hover:bg-amber-600"
          >
            <span>Fırsatı Gör</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}
