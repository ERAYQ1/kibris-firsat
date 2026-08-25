import { describe, expect, it, beforeEach } from "vitest";
import { register } from "@/server/auth";
import {
  createDeal,
  listDeals,
  getDealDetail,
  deleteDeal,
  isDealActive,
  expireDueDeals,
} from "@/server/deals";
import type { PublicUser } from "@/server/auth";
import { createTestDb, seedCategoryAndLocation, dealIds } from "./helpers";

const futureIso = (secondsAhead: number) =>
  new Date(Date.now() + secondsAhead * 1000).toISOString();

const baseDeal = {
  title: "5 kg pirinç süper fiyatla",
  price: "249.90",
  currency: "TRY",
  storeName: "X Market",
  expiresAt: futureIso(7 * 86400),
};

async function makeUser(db: ReturnType<typeof createTestDb>, name = "AA"): Promise<PublicUser> {
  const { user } = await register(
    {
      email: `${name.toLowerCase()}${Math.random().toString(36).slice(2)}@t.local`,
      password: "Parola123456",
      displayName: name,
    },
    db
  );
  return user;
}

describe("deal creation", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    process.env.ADMIN_EMAILS = "";
  });

  it("geçerli veriyle fırsat oluşturulur, fiyat kuruşa çevrilir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    const detail = getDealDetail(id, db);
    expect(detail.deal.priceCents).toBe(24990);
    expect(detail.deal.status).toBe("active");
    expect(detail.deal.authorId).toBe(user.id);
    expect(detail.storeName).toBe("X Market");
  });

  it("fiyat geçmişine ilk kayıt düşülür", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);
    expect(getDealDetail(id, db).priceHistory).toHaveLength(1);
  });

  it("eski fiyat belirtildiğinde kaydedilir ve indirim oranı hesaplanabilir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal(
      { ...baseDeal, price: "99.90", originalPrice: "149.90", ...dealIds(ids) },
      user,
      db
    );
    const detail = getDealDetail(id, db);
    expect(detail.deal.priceCents).toBe(9990);
    expect(detail.deal.originalPriceCents).toBe(14990);
  });

  it("eski fiyat indirimli fiyattan küçük veya eşitse reddedilir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    await expect(
      createDeal(
        { ...baseDeal, price: "100.00", originalPrice: "90.00", ...dealIds(ids) },
        user,
        db
      )
    ).rejects.toThrow();
  });

  it("görsel dosya adları ile fırsat oluşturulduğunda dealImages tablosuna kaydedilir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal(
      {
        ...baseDeal,
        imageFilenames: ["12345678-1234-1234-1234-123456789abc.jpg"],
        ...dealIds(ids),
      },
      user,
      db
    );
    const detail = getDealDetail(id, db);
    expect(detail.images).toHaveLength(1);
    expect(detail.images[0].filename).toBe("12345678-1234-1234-1234-123456789abc.jpg");
  });

  it("virgüllü fiyat kabul edilir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal(
      { ...baseDeal, price: "249,90", ...dealIds(ids) },
      user,
      db
    );
    expect(getDealDetail(id, db).deal.priceCents).toBe(24990);
  });

  it("aynı mağaza ve konum için ikinci kez store oluşturulmaz", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);
    await createDeal(
      { ...baseDeal, title: "Aynı markette başka bir ürün fırsatı", ...dealIds(ids) },
      user,
      db
    );
    const { stores } = await import("@/db/schema");
    const rows = db.select().from(stores).all();
    expect(rows).toHaveLength(1);
  });

  it.each([
    [{ title: "" }, "boş başlık"],
    [{ title: "ab" }, "kısa başlık"],
    [{ price: "-5" }, "negatif fiyat"],
    [{ price: "0" }, "sıfır fiyat"],
    [{ price: "abc" }, "geçersiz fiyat"],
    [{ currency: "USD" }, "desteklenmeyen para birimi"],
    [{ categoryId: 99999 }, "olmayan kategori"],
    [{ locationId: 99999 }, "olmayan konum"],
    [{ expiresAt: new Date(Date.now() - 3600_000).toISOString() }, "geçmiş tarih"],
    [{ expiresAt: new Date(Date.now() + 400 * 86400_000).toISOString() }, "1 yıldan uzun"],
    [{ extraField: "x" }, "bilinmeyen alan (mass assignment)"],
    ] as unknown as Array<[Record<string, unknown>]>)(
      "geçersiz girdi reddedilir: %s",
      async (override) => {
        const user = await makeUser(db);
        const ids = await seedCategoryAndLocation(db);
        const input = { ...baseDeal, ...dealIds(ids), ...override };
        await expect(createDeal(input, user, db)).rejects.toBeTruthy();
      }
    );
  });

describe("deal ownership & deletion", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    process.env.ADMIN_EMAILS = "";
  });

  it("sahibi fırsatını silebilir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    await deleteDeal(id, user, db);
    expect(() => getDealDetail(id, db)).toThrow(/bulunamadı/);
  });

  it("başka kullanıcı ID değiştirerek silemez (IDOR)", async () => {
    const owner = await makeUser(db, "Owner");
    const attacker = await makeUser(db, "Attacker");
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal({ ...baseDeal, ...dealIds(ids) }, owner, db);

    await expect(deleteDeal(id, attacker, db)).rejects.toMatchObject({ status: 403 });
    expect(getDealDetail(id, db).deal.id).toBe(id);
  });

  it("admin başkasının fırsatını silebilir", async () => {
    process.env.ADMIN_EMAILS = "adm@t.local";
    const admin = (await register(
      { email: "adm@t.local", password: "Parola123456", displayName: "AD" },
      db
    )).user;
    delete process.env.ADMIN_EMAILS;

    const owner = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal({ ...baseDeal, ...dealIds(ids) }, owner, db);

    await deleteDeal(id, admin, db);
    expect(() => getDealDetail(id, db)).toThrow(/bulunamadı/);
  });
});

describe("deal listing", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    process.env.ADMIN_EMAILS = "";
  });

  it("süresi geçmiş fırsatlar aktif listede görünmez", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const activeId = (await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db)).id;
    const shortLivedId = (
      await createDeal(
        {
          ...baseDeal,
          title: "Kısa süreli kampanya ilanı burada",
          ...dealIds(ids),
          expiresAt: futureIso(1),
        },
        user,
        db
      )
    ).id;
    expireDueDeals(Math.floor(Date.now() / 1000) + 5, db);

    const list = await listDeals({}, db);
    const listedIds = list.items.map((i) => i.id);
    expect(listedIds).toContain(activeId);
    expect(listedIds).not.toContain(shortLivedId);
  });

  it("arama başlık üzerinden çalışır", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    await createDeal({ ...baseDeal, title: "Kulaklık fırsatı süper fiyat", ...dealIds(ids) }, user, db);
    await createDeal(
      { ...baseDeal, title: "Pirinç kampanyası devam ediyor", ...dealIds(ids) },
      user,
      db
    );

    const hits = await listDeals({ q: "kulaklık" }, db);
    expect(hits.total).toBe(1);
    expect(hits.items[0].title).toContain("Kulaklık");

    const none = await listDeals({ q: "olmayan-ürün-xyz" }, db);
    expect(none.total).toBe(0);
  });

  it("SQL injection denemesi aramada güvenli şekilde işlenir", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    const result = await listDeals({ q: "' OR 1=1 --" }, db);
    expect(result.total).toBe(0);
  });

  it("sayfalama çalışır ve limit uygulanır", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    for (let i = 0; i < 25; i++) {
      await createDeal(
        { ...baseDeal, title: `Fırsat ilan numarası ${i} burada`, ...dealIds(ids) },
        user,
        db
      );
    }
    const page1 = await listDeals({ pageSize: 10 }, db);
    const page3 = await listDeals({ pageSize: 10, page: 3 }, db);
    expect(page1.items).toHaveLength(10);
    expect(page3.items).toHaveLength(5);
    expect(page1.total).toBe(25);
  });

  it("kategori filtresi diğer kategoriyi dışlar", async () => {
    const user = await makeUser(db);
    const first = await seedCategoryAndLocation(db);
    const second = await seedCategoryAndLocation(db);
    await createDeal({ ...baseDeal, ...dealIds(first) }, user, db);

    const filtered = await listDeals({ categorySlug: second.categorySlug }, db);
    expect(filtered.total).toBe(0);
    const matched = await listDeals({ categorySlug: first.categorySlug }, db);
    expect(matched.total).toBe(1);
  });
});

describe("expiration", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    process.env.ADMIN_EMAILS = "";
  });

  it("expireDueDeals süresi geçenleri expired yapar", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal(
      {
        ...baseDeal,
        title: "Bir dakikada bitecek olan fırsat",
        ...dealIds(ids),
        expiresAt: futureIso(1),
      },
      user,
      db
    );

    expireDueDeals(Math.floor(Date.now() / 1000) + 5, db);
    const detail = getDealDetail(id, db);
    expect(detail.deal.status).toBe("expired");
    expect(isDealActive(detail.deal)).toBe(false);
  });

  it("expiresAt null olan fırsat aktif kalır", async () => {
    const user = await makeUser(db);
    const ids = await seedCategoryAndLocation(db);
    const { id } = await createDeal(
      { ...baseDeal, expiresAt: undefined, ...dealIds(ids) },
      user,
      db
    );

    expireDueDeals(Math.floor(Date.now() / 1000) + 99999, db);
    expect(getDealDetail(id, db).deal.status).toBe("active");
  });
});
