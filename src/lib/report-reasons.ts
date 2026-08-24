export const REPORT_REASONS = [
  { value: "fake", label: "Sahte fırsat" },
  { value: "wrong_price", label: "Yanlış fiyat" },
  { value: "expired", label: "Süresi dolmuş" },
  { value: "wrong_location", label: "Yanlış konum" },
  { value: "wrong_store", label: "Yanlış mağaza" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Uygunsuz içerik" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export function isReportReason(v: unknown): v is ReportReason {
  return REPORT_REASONS.some((r) => r.value === v);
}
