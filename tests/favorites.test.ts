import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, makeUser, seedCategoryAndLocation } from "./helpers";
import { createDeal } from "@/server/deals";
import {
  toggleFavorite,
  isFavorited,
  getFavoriteCount,
  listUserFavorites,
} from "@/server/favorites";

describe("favorites service", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("fırsatı favoriye ekler ve çıkarır (toggle)", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal(
      {
        title: "Test Fırsat Favori",
        price: "99.90",
        currency: "TRY",
        categoryId: ids.categoryId,
        locationId: ids.locationId,
        storeName: "Lemar",
      },
      user,
      db
    );

    // 1. Favoriye Ekle
    const res1 = toggleFavorite(dealId, user.id, db);
    expect(res1.favorited).toBe(true);
    expect(res1.count).toBe(1);
    expect(isFavorited(dealId, user.id, db)).toBe(true);
    expect(getFavoriteCount(dealId, db)).toBe(1);

    // 2. Favoriden Çıkar
    const res2 = toggleFavorite(dealId, user.id, db);
    expect(res2.favorited).toBe(false);
    expect(res2.count).toBe(0);
    expect(isFavorited(dealId, user.id, db)).toBe(false);
  });

  it("kullanıcının favori fırsatlarını listeler", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal(
      {
        title: "Özel Favori Fırsatı",
        price: "150.00",
        currency: "TRY",
        categoryId: ids.categoryId,
        locationId: ids.locationId,
        storeName: "Erülkü",
      },
      user,
      db
    );

    toggleFavorite(dealId, user.id, db);
    const favs = listUserFavorites(user.id, db);
    expect(favs).toHaveLength(1);
    expect(favs[0].title).toBe("Özel Favori Fırsatı");
  });

  it("olmayan fırsat favorilenemez (404)", async () => {
    const user = await makeUser(db);
    expect(() => toggleFavorite(99999, user.id, db)).toThrow();
  });
});
