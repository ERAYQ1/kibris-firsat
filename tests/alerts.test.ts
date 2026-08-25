import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, makeUser, seedCategoryAndLocation, dealIds } from "./helpers";
import type { Db } from "@/server/db";
import { createDeal, updateDealPrice } from "@/server/deals";
import {
  setPriceAlert,
  getAlertForDeal,
  removePriceAlert,
  getUserAlerts,
  checkAndTriggerPriceAlerts,
} from "@/server/alerts";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Price Alerts Service Integration Tests", () => {
  let db: Db;

  beforeEach(() => {
    db = createTestDb();
  });

  it("sets a price alert for an active deal successfully", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: dealId } = await createDeal(
      {
        title: "Test İndirimli Ürün",
        price: "100.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Test Mağaza",
      },
      author,
      db
    );

    const alert = setPriceAlert(
      {
        userId: subscriber.id,
        dealId,
        targetPriceCents: 8000, // 80 TL
      },
      db
    );

    expect(alert.id).toBeDefined();
    expect(alert.userId).toBe(subscriber.id);
    expect(alert.dealId).toBe(dealId);
    expect(alert.targetPriceCents).toBe(8000);
    expect(alert.isTriggered).toBe(false);
  });

  it("rejects price alert with non-positive target price", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: dealId } = await createDeal(
      {
        title: "Test Ürün 2",
        price: "100.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Test Mağaza",
      },
      author,
      db
    );

    expect(() =>
      setPriceAlert(
        {
          userId: subscriber.id,
          dealId,
          targetPriceCents: 0,
        },
        db
      )
    ).toThrow("Hedef fiyat sıfırdan büyük olmalıdır.");
  });

  it("updates existing price alert if user sets it again", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: dealId } = await createDeal(
      {
        title: "Test Ürün 3",
        price: "150.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Test Mağaza",
      },
      author,
      db
    );

    setPriceAlert({ userId: subscriber.id, dealId, targetPriceCents: 12000 }, db);
    const updated = setPriceAlert({ userId: subscriber.id, dealId, targetPriceCents: 10000 }, db);

    expect(updated.targetPriceCents).toBe(10000);

    const current = getAlertForDeal(subscriber.id, dealId, db);
    expect(current?.targetPriceCents).toBe(10000);
  });

  it("removes a price alert successfully", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: dealId } = await createDeal(
      {
        title: "Test Ürün 4",
        price: "200.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Test Mağaza",
      },
      author,
      db
    );

    setPriceAlert({ userId: subscriber.id, dealId, targetPriceCents: 15000 }, db);
    const removed = removePriceAlert(subscriber.id, dealId, db);
    expect(removed).toBe(true);

    const current = getAlertForDeal(subscriber.id, dealId, db);
    expect(current).toBeNull();
  });

  it("lists all active alerts for a user with deal details", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: deal1 } = await createDeal(
      {
        title: "Fırsat 1",
        price: "100.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Mağaza A",
      },
      author,
      db
    );

    const { id: deal2 } = await createDeal(
      {
        title: "Fırsat 2",
        price: "200.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Mağaza B",
      },
      author,
      db
    );

    setPriceAlert({ userId: subscriber.id, dealId: deal1, targetPriceCents: 9000 }, db);
    setPriceAlert({ userId: subscriber.id, dealId: deal2, targetPriceCents: 18000 }, db);

    const userAlerts = getUserAlerts(subscriber.id, db);
    expect(userAlerts.length).toBe(2);
    expect(userAlerts.some((a) => a.dealTitle === "Fırsat 1")).toBe(true);
    expect(userAlerts.some((a) => a.dealTitle === "Fırsat 2")).toBe(true);
  });

  it("triggers notification when deal price drops below target price", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: dealId } = await createDeal(
      {
        title: "Özel İndirimli Telefon",
        price: "1000.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Teknoloji Dünyası",
      },
      author,
      db
    );

    // Alarm: 800 TL veya altına düşünce haber ver
    setPriceAlert({ userId: subscriber.id, dealId, targetPriceCents: 80000 }, db);

    // Fiyat 850 TL'ye indi (tetiklenmemeli)
    const triggered1 = checkAndTriggerPriceAlerts(dealId, 85000, db);
    expect(triggered1).toBe(0);

    let userNotifs = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, subscriber.id))
      .all();
    expect(userNotifs.length).toBe(0);

    // Fiyat 750 TL'ye indi (tetiklenmeli!)
    const triggered2 = checkAndTriggerPriceAlerts(dealId, 75000, db);
    expect(triggered2).toBe(1);

    userNotifs = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, subscriber.id))
      .all();
    expect(userNotifs.length).toBe(1);
    expect(userNotifs[0].title).toContain("Fiyat Düştü");
    expect(userNotifs[0].message).toContain("Özel İndirimli Telefon");

    // Alarm tekrar tetiklenmemeli (isTriggered = 1)
    const triggered3 = checkAndTriggerPriceAlerts(dealId, 70000, db);
    expect(triggered3).toBe(0);
  });

  it("updateDealPrice updates price history and triggers alerts", async () => {
    const author = await makeUser(db);
    const subscriber = await makeUser(db);
    const refs = await seedCategoryAndLocation(db);

    const { id: dealId } = await createDeal(
      {
        title: "Akıllı Saat",
        price: "500.00",
        currency: "TRY",
        ...dealIds(refs),
        storeName: "Saatçi",
      },
      author,
      db
    );

    setPriceAlert({ userId: subscriber.id, dealId, targetPriceCents: 40000 }, db);

    const res = await updateDealPrice(dealId, 35000, author, db);
    expect(res.newPriceCents).toBe(35000);
    expect(res.triggeredAlertsCount).toBe(1);

    const userNotifs = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, subscriber.id))
      .all();
    expect(userNotifs.length).toBe(1);
  });
});
