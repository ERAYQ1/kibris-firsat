import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  type?: "store" | "deal" | "compact";
  className?: string;
}

export function VerifiedBadge({ type = "compact", className }: VerifiedBadgeProps) {
  if (type === "store") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/80 select-none",
          className
        )}
        title="Bu işletme Kıbrıs Fırsat editörleri tarafından doğrulanmıştır."
      >
        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
        Doğrulanmış İşletme
      </span>
    );
  }

  if (type === "deal") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/80 select-none",
          className
        )}
        title="Bu fırsatın fiyat ve stok doğrulaması yapılmıştır."
      >
        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
        Fiyat Doğrulandı
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex text-emerald-600", className)}
      title="Doğrulanmış"
    >
      <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100" />
    </span>
  );
}
