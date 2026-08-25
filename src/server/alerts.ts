import { and, eq, desc } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { deals, priceAlerts, notifications, stores } from "@/db/schema";
import { formatCurrency } from "@/lib/format";

export interface SetPriceAlertInput {
  userId: number;
  dealId: number;
  targetPriceCents: number;
}

export interface UserAlertItem {
  id: number;
  dealId: number;
  targetPriceCents: number;
  isTriggered: boolean;
  createdAt: number;
  dealTitle: string;
  dealCurrentPriceCents: number;
  dealCurrency: "TRY" | "GBP" | "EUR";
  storeName: string;
}

export function setPriceAlert(
  input: SetPriceAlertInput,
  database: Db = getDb()
) {
  if (input.targetPriceCents <= 0) {
    throw new Error("Hedef fiyat sıfırdan büyük olmalıdır.");
  }

  const deal = database
    .select({ id: deals.id, title: deals.title, priceCents: deals.priceCents, status: deals.status })
    .from(deals)
    .where(eq(deals.id, input.dealId))
    .get();

  if (!deal) {
    throw new Error("Fırsat bulunamadı.");
  }

  if (deal.status !== "active") {
    throw new Error("Sadece aktif fırsatlar için fiyat alarmı kurulabilir.");
  }

  const existing = database
    .select()
    .from(priceAlerts)
    .where(and(eq(priceAlerts.userId, input.userId), eq(priceAlerts.dealId, input.dealId)))
    .get();

  if (existing) {
    database
      .update(priceAlerts)
      .set({
        targetPriceCents: input.targetPriceCents,
        isTriggered: 0,
      })
      .where(eq(priceAlerts.id, existing.id))
      .run();

    return {
      id: existing.id,
      userId: input.userId,
      dealId: input.dealId,
      targetPriceCents: input.targetPriceCents,
      isTriggered: false,
    };
  }

  const inserted = database
    .insert(priceAlerts)
    .values({
      userId: input.userId,
      dealId: input.dealId,
      targetPriceCents: input.targetPriceCents,
      isTriggered: 0,
    })
    .returning()
    .get();

  return {
    id: inserted.id,
    userId: inserted.userId,
    dealId: inserted.dealId,
    targetPriceCents: inserted.targetPriceCents,
    isTriggered: inserted.isTriggered === 1,
  };
}

export function getAlertForDeal(
  userId: number,
  dealId: number,
  database: Db = getDb()
) {
  const alert = database
    .select()
    .from(priceAlerts)
    .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.dealId, dealId)))
    .get();

  if (!alert) return null;
  return {
    ...alert,
    isTriggered: alert.isTriggered === 1,
  };
}

export function removePriceAlert(
  userId: number,
  dealId: number,
  database: Db = getDb()
): boolean {
  const result = database
    .delete(priceAlerts)
    .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.dealId, dealId)))
    .run();

  return result.changes > 0;
}

export function getUserAlerts(
  userId: number,
  database: Db = getDb()
): UserAlertItem[] {
  const rows = database
    .select({
      id: priceAlerts.id,
      dealId: priceAlerts.dealId,
      targetPriceCents: priceAlerts.targetPriceCents,
      isTriggered: priceAlerts.isTriggered,
      createdAt: priceAlerts.createdAt,
      dealTitle: deals.title,
      dealCurrentPriceCents: deals.priceCents,
      dealCurrency: deals.currency,
      storeName: stores.name,
    })
    .from(priceAlerts)
    .innerJoin(deals, eq(deals.id, priceAlerts.dealId))
    .innerJoin(stores, eq(stores.id, deals.storeId))
    .where(eq(priceAlerts.userId, userId))
    .orderBy(desc(priceAlerts.createdAt))
    .all();

  return rows.map((r) => ({
    ...r,
    isTriggered: r.isTriggered === 1,
  }));
}

export function checkAndTriggerPriceAlerts(
  dealId: number,
  currentPriceCents: number,
  database: Db = getDb()
) {
  const deal = database
    .select({ id: deals.id, title: deals.title, currency: deals.currency })
    .from(deals)
    .where(eq(deals.id, dealId))
    .get();

  if (!deal) return 0;

  const matchingAlerts = database
    .select()
    .from(priceAlerts)
    .where(
      and(
        eq(priceAlerts.dealId, dealId),
        eq(priceAlerts.isTriggered, 0)
      )
    )
    .all()
    .filter((a) => currentPriceCents <= a.targetPriceCents);

  const formattedPrice = formatCurrency(currentPriceCents, deal.currency);

  for (const alert of matchingAlerts) {
    database
      .update(priceAlerts)
      .set({ isTriggered: 1 })
      .where(eq(priceAlerts.id, alert.id))
      .run();

    database
      .insert(notifications)
      .values({
        userId: alert.userId,
        title: "🎉 Fiyat Düştü! Hedef Fiyata Ulaşıldı",
        message: `Takip ettiğiniz "${deal.title}" fırsatının fiyatı ${formattedPrice} seviyesine indi.`,
        link: `/firsat/${deal.id}`,
        isRead: 0,
      })
      .run();
  }

  return matchingAlerts.length;
}
