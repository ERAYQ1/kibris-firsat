export const CURRENCIES = ["TRY", "GBP", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}
