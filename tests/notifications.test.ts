import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, makeUser } from "./helpers";
import {
  createNotification,
  listNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
} from "@/server/notifications";

describe("notifications service", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("bildirim oluşturur ve okunmamış sayısını döndürür", async () => {
    const user = await makeUser(db);
    createNotification(user.id, "Yeni İndirim!", "Girne'de %40 indirim başladı.", "/firsat/1", db);

    const items = listNotifications(user.id, db);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Yeni İndirim!");
    expect(items[0].isRead).toBe(false);

    const unread = getUnreadNotificationCount(user.id, db);
    expect(unread).toBe(1);
  });

  it("tek bildirimi okundu olarak işaretler", async () => {
    const user = await makeUser(db);
    createNotification(user.id, "Fiyat Düştü", "Takip ettiğin ürünün fiyatı düştü.", undefined, db);

    const items = listNotifications(user.id, db);
    markAsRead(items[0].id, user.id, db);

    const unread = getUnreadNotificationCount(user.id, db);
    expect(unread).toBe(0);
  });

  it("tüm bildirimleri okundu olarak işaretler", async () => {
    const user = await makeUser(db);
    createNotification(user.id, "Bildirim 1", "Mesaj 1", undefined, db);
    createNotification(user.id, "Bildirim 2", "Mesaj 2", undefined, db);

    expect(getUnreadNotificationCount(user.id, db)).toBe(2);
    markAllAsRead(user.id, db);
    expect(getUnreadNotificationCount(user.id, db)).toBe(0);
  });
});
