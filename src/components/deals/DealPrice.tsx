import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

interface DealPriceProps {
  priceCents: number;
  originalPriceCents?: number | null;
  currency?: "TRY" | "GBP" | "EUR";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function DealPrice({
  priceCents,
  originalPriceCents,
  currency = "TRY",
  size = "md",
  className,
}: DealPriceProps) {
  let discountPercent = 0;
  if (originalPriceCents && originalPriceCents > priceCents) {
    discountPercent = Math.round(
      ((originalPriceCents - priceCents) / originalPriceCents) * 100
    );
  }

  const sizeStyles = {
    sm: {
      price: "text-base font-extrabold text-slate-950",
      oldPrice: "text-xs text-slate-400 line-through font-medium",
      badge: "text-[10px] px-1.5 py-0.5 rounded-md",
    },
    md: {
      price: "text-xl font-black text-slate-950 tracking-tight",
      oldPrice: "text-xs font-semibold text-slate-400 line-through",
      badge: "text-[11px] px-2 py-0.5 rounded-md font-extrabold",
    },
    lg: {
      price: "text-2xl font-black text-slate-950 tracking-tight",
      oldPrice: "text-sm font-semibold text-slate-400 line-through",
      badge: "text-xs px-2.5 py-1 rounded-lg font-extrabold",
    },
    xl: {
      price: "text-3xl sm:text-4xl font-black text-slate-950 tracking-tight",
      oldPrice: "text-base sm:text-lg font-medium text-slate-400 line-through",
      badge: "text-xs sm:text-sm px-3 py-1 rounded-lg font-black",
    },
  }[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={sizeStyles.price}>
        {formatPrice(priceCents, currency)}
      </span>

      {originalPriceCents && originalPriceCents > priceCents && (
        <>
          <span className={sizeStyles.oldPrice}>
            {formatPrice(originalPriceCents, currency)}
          </span>
          {discountPercent > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-1 bg-rose-500 text-white shadow-2xs",
                sizeStyles.badge
              )}
            >
              <TrendingDown className="h-3 w-3 shrink-0" />
              %{discountPercent}
            </span>
          )}
        </>
      )}
    </div>
  );
}
