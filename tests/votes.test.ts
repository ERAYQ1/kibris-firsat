import { describe, expect, it, beforeEach } from "vitest";
import { register } from "@/server/auth";
import { createDeal, setVote, getVoteCounts, getUserVote } from "@/server/deals";
import { createTestDb, seedCategoryAndLocation, dealIds } from "./helpers";


async function setupWithDeal(db: ReturnType<typeof createTestDb>) {
  process.env.ADMIN_EMAILS = "";
  const { user } = await register(
    {
      email: `v${Math.random().toString(36).slice(2)}@t.local`,
      password: "Parola123456",
      displayName: "Voter",
    },
    db
  );
  const ids = await seedCategoryAndLocation(db);
  const { id } = await createDeal(
    {
      title: "Oy verilecek test fırsat ilanı",
      price: "100.00",
      currency: "TRY",
      storeName: "Test Market",
      ...dealIds(ids),
    },
    user,
    db
  );
  return { author: user, dealId: id };
}

async function makeUser(db: ReturnType<typeof createTestDb>, tag: string) {
  const { user } = await register(
    {
      email: `${tag}${Math.random().toString(36).slice(2)}@t.local`,
      password: "Parola123456",
      displayName: tag.toUpperCase(),
    },
    db
  );
  return user;
}

describe("voting", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    process.env.ADMIN_EMAILS = "";
  });

  it("kullanıcı olumlu oy verebilir", async () => {
    const { dealId } = await setupWithDeal(db);
    const voter = await makeUser(db, "up");
    const counts = await setVote(dealId, voter.id, 1, db);
    expect(counts.upvotes).toBe(1);
    expect(counts.downvotes).toBe(0);
    expect(getUserVote(dealId, voter.id, db)).toBe(1);
  });

  it("aynı kullanıcı ikinci kez oy veremez — oyu güncellenir (unique constraint)", async () => {
    const { dealId } = await setupWithDeal(db);
    const voter = await makeUser(db, "dup");

    await setVote(dealId, voter.id, 1, db);
    const counts = await setVote(dealId, voter.id, -1, db);

    expect(counts.upvotes).toBe(0);
    expect(counts.downvotes).toBe(1);
  });

  it("oy 0 yapılırsa geri çekilir", async () => {
    const { dealId } = await setupWithDeal(db);
    const voter = await makeUser(db, "zero");

    await setVote(dealId, voter.id, 1, db);
    const counts = await setVote(dealId, voter.id, 0, db);
    expect(counts.upvotes).toBe(0);
    expect(getUserVote(dealId, voter.id, db)).toBe(0);
  });

  it("birden çok kullanıcının oyları toplanır", async () => {
    const { dealId } = await setupWithDeal(db);
    const u1 = await makeUser(db, "ua");
    const u2 = await makeUser(db, "ub");
    const u3 = await makeUser(db, "uc");

    await setVote(dealId, u1.id, 1, db);
    await setVote(dealId, u2.id, 1, db);
    await setVote(dealId, u3.id, -1, db);

    expect(await getVoteCounts(dealId, db)).toEqual({ upvotes: 2, downvotes: 1 });
  });

  it("olmayan fırsata oy verilemez", async () => {
    const voter = await makeUser(db, "nf");
    await expect(setVote(999999, voter.id, 1, db)).rejects.toMatchObject({ status: 404 });
  });

  it("expired fırsata oy verilemez", async () => {
    const { dealId } = await setupWithDeal(db);
    const { sql } = await import("drizzle-orm");
    const { expireDueDeals } = await import("@/server/deals");

    db.run(sql`UPDATE deals SET expires_at = unixepoch() - 10 WHERE id = ${dealId}`);
    expireDueDeals(Math.floor(Date.now() / 1000) + 1, db);

    const voter = await makeUser(db, "ex");
    await expect(setVote(dealId, voter.id, 1, db)).rejects.toMatchObject({ status: 409 });
  });
});
