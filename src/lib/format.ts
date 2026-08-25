import type { Currency } from "./currency";

export function formatPrice(priceCents: number, currency: Currency): string {
  const value = priceCents / 100;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(value);
}

export const formatCurrency = formatPrice;

const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

export function formatRelativeTime(
  unixSec: number,
  nowSec: number = Math.floor(Date.now() / 1000)
): string {
  const diff = unixSec - nowSec;
  if (diff < -86400 * 30) {
    return formatDate(unixSec);
  }
  if (Math.abs(diff) < 60) return "az önce";
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

export const formatTimeAgo = formatRelativeTime;

export function formatDate(unixSec: number): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
    new Date(unixSec * 1000)
  );
}

export const formatAbsoluteDate = formatDate;
