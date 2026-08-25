import Link from "next/link";
import type { DealListItem } from "@/server/deals";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DealPrice } from "@/components/deals/DealPrice";
import { LiveCountdown } from "@/components/deals/LiveCountdown";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { MapPin, Store, Tag, Eye, Flame, ArrowUpRight } from "lucide-react";

interface DealCardProps {
  deal: DealListItem;
}

export function DealCard({ deal }: DealCardProps) {
  const isHot = deal.score >= 5;

  let discountPercent = 0;
  if (deal.originalPriceCents && deal.originalPriceCents > deal.priceCents) {
    discountPercent = Math.round(
      ((deal.originalPriceCents - deal.priceCents) / deal.originalPriceCents) * 100
    );
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg">
      <div>
        {/* Üst Görsel Alanı (16:10 Oran) */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
          <Link href={`/firsat/${deal.id}`} className="block h-full w-full">
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200/80 text-slate-400 group-hover:scale-105 transition duration-300">
              <Tag className="h-10 w-10 text-slate-300 stroke-[1.5]" />
            </div>
          </Link>

          {/* İndirim Rozeti (Sol Üst) */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 pointer-events-none">
            {discountPercent > 0 && (
              <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-black text-white shadow-sm tracking-tight">
                -%{discountPercent} İNDİRİM
              </span>
            )}
            {isHot && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-black text-slate-950 shadow-sm">
                <Flame className="h-3 w-3 fill-slate-950 text-slate-950" />
                Sıcak Fırsat
              </span>
            )}
          </div>

          {/* Favori Butonu (Sağ Üst) */}
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton dealId={deal.id} />
          </div>
        </div>

        {/* İçerik Alanı */}
        <div className="p-4.5 space-y-3">
          {/* Kategori & Şehir */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
              <Tag className="h-3 w-3 text-slate-400" />
              {deal.categoryName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400" />
              {deal.locationName}
            </span>
          </div>

          {/* Başlık */}
          <Link href={`/firsat/${deal.id}`} className="block group-hover:text-amber-900 transition">
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-10">
              {deal.title}
            </h3>
          </Link>

          {/* İşletme */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-medium truncate text-slate-700">{deal.storeName}</span>
            {deal.isVerified && <VerifiedBadge type="compact" />}
          </div>

          {/* Fiyat Alanı */}
          <div className="pt-1 border-t border-slate-100">
            <DealPrice
              priceCents={deal.priceCents}
              originalPriceCents={deal.originalPriceCents}
              currency={deal.currency}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Alt Bilgi Barı */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500">
        <LiveCountdown expiresAt={deal.expiresAt} status={deal.status} />

        <div className="flex items-center gap-2.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Eye className="h-3 w-3" />
            {deal.viewCount}
          </span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-md ${
              deal.score > 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : deal.score < 0
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {deal.score > 0 ? `+${deal.score}` : deal.score}
          </span>
          <Link
            href={`/firsat/${deal.id}`}
            aria-label="Fırsatı Gör"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
