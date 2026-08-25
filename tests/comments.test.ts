import { describe, expect, it, beforeEach } from "vitest";
import { register } from "@/server/auth";
import { createDeal, deleteDeal } from "@/server/deals";
import { listComments, createComment, deleteComment } from "@/server/comments";
import type { PublicUser } from "@/server/auth";
import { createTestDb, seedCategoryAndLocation, dealIds } from "./helpers";

const futureIso = (secondsAhead: number) =>
  new Date(Date.now() + secondsAhead * 1000).toISOString();

const baseDeal = {
  title: "Süt ve peynir indirimi",
  price: "49.90",
  originalPrice: "75.00",
  currency: "TRY",
  storeName: "Lemar Market",
  expiresAt: futureIso(7 * 86400),
};

async function makeUser(db: ReturnType<typeof createTestDb>, name = "TestUser", role = "user"): Promise<PublicUser> {
  const { user } = await register(
    {
      email: `${name.toLowerCase()}${Math.random().toString(36).slice(2)}@t.local`,
      password: "Parola123456",
      displayName: name,
    },
    db
  );
  if (role === "admin") {
    user.role = "admin";
  }
  return user;
}

describe("comments system", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("kullanıcı bir fırsata yorum ekleyebilir ve listeleyebilir", async () => {
    const author = await makeUser(db, "Author");
    const commenter = await makeUser(db, "Commenter");
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal({ ...baseDeal, ...dealIds(ids) }, author, db);

    const comment = createComment(
      dealId,
      { content: "Bugün Lefkoşa şubesinden aldım, stok boldu." },
      commenter,
      db
    );

    expect(comment.id).toBeGreaterThan(0);
    expect(comment.content).toBe("Bugün Lefkoşa şubesinden aldım, stok boldu.");
    expect(comment.authorName).toBe("Commenter");

    const comments = listComments(dealId, db);
    expect(comments).toHaveLength(1);
    expect(comments[0].content).toBe("Bugün Lefkoşa şubesinden aldım, stok boldu.");
  });

  it("geçersiz/kısa yorum reddedilir", async () => {
    const user = await makeUser(db, "User");
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    expect(() => createComment(dealId, { content: " " }, user, db)).toThrow();
    expect(() => createComment(dealId, { content: "a" }, user, db)).toThrow();
  });

  it("olmayan veya silinmiş fırsata yorum yapılamaz", async () => {
    const user = await makeUser(db, "User");
    expect(() => createComment(9999, { content: "Geçerli içerik" }, user, db)).toThrow();
  });

  it("yorum sahibi kendi yorumunu silebilir", async () => {
    const user = await makeUser(db, "Owner");
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    const comment = createComment(dealId, { content: "Silinecek yorum" }, user, db);
    expect(listComments(dealId, db)).toHaveLength(1);

    deleteComment(comment.id, user, db);
    expect(listComments(dealId, db)).toHaveLength(0);
  });

  it("IDOR koruması: başka kullanıcı başkasının yorumunu silemez (403)", async () => {
    const owner = await makeUser(db, "Owner");
    const attacker = await makeUser(db, "Attacker");
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal({ ...baseDeal, ...dealIds(ids) }, owner, db);

    const comment = createComment(dealId, { content: "Önemli bilgi" }, owner, db);

    expect(() => deleteComment(comment.id, attacker, db)).toThrow();
    expect(listComments(dealId, db)).toHaveLength(1);
  });

  it("admin herhangi bir yorumu silebilir", async () => {
    const user = await makeUser(db, "User");
    const admin = await makeUser(db, "AdminUser", "admin");
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    const comment = createComment(dealId, { content: "Spam içerik" }, user, db);
    deleteComment(comment.id, admin, db);

    expect(listComments(dealId, db)).toHaveLength(0);
  });

  it("fırsat silindiğinde ona ait yorumlar cascade olarak silinir", async () => {
    const user = await makeUser(db, "User");
    const ids = await seedCategoryAndLocation(db);
    const { id: dealId } = await createDeal({ ...baseDeal, ...dealIds(ids) }, user, db);

    createComment(dealId, { content: "Yorum 1" }, user, db);
    createComment(dealId, { content: "Yorum 2" }, user, db);
    expect(listComments(dealId, db)).toHaveLength(2);

    await deleteDeal(dealId, user, db);
    expect(listComments(dealId, db)).toHaveLength(0);
  });
});
