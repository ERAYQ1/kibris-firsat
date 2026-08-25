import Link from "next/link";
import type { DealListItem } from "@/server/deals";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DealPrice } from "@/components/deals/DealPrice";
import { LiveCountdown } from "@/components/deals/LiveCountdown";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import {
  MapPin,
  Store,
  Tag,
  Eye,
  Flame,
  ArrowUpRight,
  ShoppingBag,
  UtensilsCrossed,
  Laptop,
  Shirt,
  Sparkle,
  Package,
  Car,
} from "lucide-react";

interface DealCardProps {
  deal: DealListItem;
}

const CATEGORY_THEMES: Record<
  string,
  { bg: string; icon: React.ReactNode; text: string }
> = {
  market: {
    bg: "from-emerald-50 to-emerald-100/60",
    text: "text-emerald-800",
    icon: <ShoppingBag className="h-10 w-10 text-emerald-600/80 stroke-[1.5]" />,
  },
  "restoran-kafe": {
    bg: "from-amber-50 to-orange-100/60",
    text: "text-amber-800",
    icon: <UtensilsCrossed className="h-10 w-10 text-amber-600/80 stroke-[1.5]" />,
  },
  restoran: {
    bg: "from-amber-50 to-orange-100/60",
    text: "text-amber-800",
    icon: <UtensilsCrossed className="h-10 w-10 text-amber-600/80 stroke-[1.5]" />,
  },
  elektronik: {
    bg: "from-blue-50 to-indigo-100/60",
    text: "text-blue-800",
    icon: <Laptop className="h-10 w-10 text-blue-600/80 stroke-[1.5]" />,
  },
  giyim: {
    bg: "from-purple-50 to-pink-100/60",
    text: "text-purple-800",
    icon: <Shirt className="h-10 w-10 text-purple-600/80 stroke-[1.5]" />,
  },
  kozmetik: {
    bg: "from-rose-50 to-pink-100/60",
    text: "text-rose-800",
    icon: <Sparkle className="h-10 w-10 text-rose-600/80 stroke-[1.5]" />,
  },
  "ev-yasam": {
    bg: "from-teal-50 to-cyan-100/60",
    text: "text-teal-800",
    icon: <Package className="h-10 w-10 text-teal-600/80 stroke-[1.5]" />,
  },
  otomotiv: {
    bg: "from-slate-100 to-slate-200/80",
    text: "text-slate-800",
    icon: <Car className="h-10 w-10 text-slate-600/80 stroke-[1.5]" />,
  },
};

export function DealCard({ deal }: DealCardProps) {
  const isHot = deal.score >= 5;

  let discountPercent = 0;
  let savingsCents = 0;
  if (deal.originalPriceCents && deal.originalPriceCents > deal.priceCents) {
    savingsCents = deal.originalPriceCents - deal.priceCents;
    discountPercent = Math.round((savingsCents / deal.originalPriceCents) * 100);
  }

  const theme = CATEGORY_THEMES[deal.categorySlug] || {
    bg: "from-slate-50 to-slate-100",
    text: "text-slate-800",
    icon: <Tag className="h-10 w-10 text-slate-400 stroke-[1.5]" />,
  };

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Üst Görsel Alanı (16:10 Oran) */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
          <Link href={`/firsat/${deal.id}`} className="block h-full w-full">
            {deal.imageFilename ? (
              <img
                src={`/api/images/${deal.imageFilename}`}
                alt={deal.title}
                className="h-full w-full object-cover group-hover:scale-103 transition duration-300"
              />
            ) : (
              <div
                className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${theme.bg} p-4 transition duration-300 group-hover:scale-103`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-2xs border border-white/60">
                  {theme.icon}
                </div>
              </div>
            )}
          </Link>

          {/* İndirim & Sıcak Rozetleri (Sol Üst) */}
          <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1 pointer-events-none z-10">
            {discountPercent > 0 && (
              <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-black text-white shadow-2xs tracking-tight">
                -%{discountPercent}
              </span>
            )}
            {isHot && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-2xs">
                <Flame className="h-3 w-3 fill-slate-950 text-slate-950" />
                <span>Sıcak</span>
              </span>
            )}
          </div>

          {/* Favori Butonu (Sağ Üst) */}
          <div className="absolute right-2.5 top-2.5 z-20">
            <FavoriteButton dealId={deal.id} />
          </div>
        </div>

        {/* İçerik Alanı */}
        <div className="p-4 space-y-2.5">
          {/* Mağaza & Şehir Başlığı */}
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-800 truncate">{deal.storeName}</span>
              {deal.isVerified && <VerifiedBadge type="compact" />}
            </div>
            <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400" />
              {deal.locationName}
            </span>
          </div>

          {/* Fırsat Başlığı */}
          <Link href={`/firsat/${deal.id}`} className="block group-hover:text-amber-900 transition">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-10">
              {deal.title}
            </h3>
          </Link>

          {/* Fiyat Alanı */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <DealPrice
              priceCents={deal.priceCents}
              originalPriceCents={deal.originalPriceCents}
              currency={deal.currency}
              size="md"
            />

            {savingsCents > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50">
                ₺{(savingsCents / 100).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Tasarruf
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alt Bilgi Barı */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
        <LiveCountdown expiresAt={deal.expiresAt} status={deal.status} />

        <div className="flex items-center gap-2.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 text-slate-400" title="Görüntülenme">
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
            title="Topluluk Skoru"
          >
            {deal.score > 0 ? `+${deal.score}` : deal.score}
          </span>
          <Link
            href={`/firsat/${deal.id}`}
            aria-label="Fırsatı Gör"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition shadow-2xs"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
