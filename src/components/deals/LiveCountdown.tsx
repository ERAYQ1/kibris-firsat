"use client";

import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveCountdownProps {
  expiresAt?: number | null;
  status?: string;
  className?: string;
}

export function LiveCountdown({ expiresAt, status, className }: LiveCountdownProps) {
  if (status === "expired") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600", className)}>
        <AlertCircle className="h-3 w-3 shrink-0" />
        Fırsat sona erdi
      </span>
    );
  }

  if (!expiresAt) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const diffSec = expiresAt - nowSec;

  if (diffSec <= 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600", className)}>
        <AlertCircle className="h-3 w-3 shrink-0" />
        Fırsat sona erdi
      </span>
    );
  }

  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);

  let text = "";
  let isUrgent = false;

  if (days > 0) {
    text = `${days} gün kaldı`;
    isUrgent = days <= 2;
  } else if (hours > 0) {
    text = `${hours} saat kaldı`;
    isUrgent = true;
  } else {
    text = "Bugün sona eriyor";
    isUrgent = true;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold select-none",
        isUrgent ? "text-amber-700 font-bold" : "text-slate-500",
        className
      )}
    >
      <Clock className={cn("h-3 w-3 shrink-0", isUrgent && "text-amber-600 animate-pulse")} />
      {text}
    </span>
  );
}
