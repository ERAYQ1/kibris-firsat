import { describe, expect, it, beforeEach } from "vitest";
import { register } from "@/server/auth";
import { createDeal, createReport, listOpenReports, resolveReport } from "@/server/deals";
import type { PublicUser } from "@/server/auth";
import { createTestDb, seedCategoryAndLocation, dealIds } from "./helpers";

async function makeUser(db: ReturnType<typeof createTestDb>, tag: string): Promise<PublicUser> {
  process.env.ADMIN_EMAILS = "";
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

async function setupWithDeal(db: ReturnType<typeof createTestDb>) {
  const author = await makeUser(db, "author");
  const ids = await seedCategoryAndLocation(db);
  const { id } = await createDeal(
    {
      title: "Raporlanacak test fırsat ilanı",
      price: "50.00",
      currency: "TRY",
      storeName: "Test Mağaza",
      ...dealIds(ids),
    },
    author,
    db
  );
  return { dealId: id };
}

describe("reporting", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    delete process.env.ADMIN_EMAILS;
  });

  it("kullanıcı fırsatı raporlayabilir", async () => {
    const { dealId } = await setupWithDeal(db);
    const reporter = await makeUser(db, "rep");

    createReport(dealId, reporter, "fake", "Bu fiyat sahte", db);

    const open = listOpenReports(db);
    expect(open).toHaveLength(1);
    expect(open[0].reason).toBe("fake");
  });

  it("aynı kullanıcı aynı fırsatı iki kez raporlayamaz", async () => {
    const { dealId } = await setupWithDeal(db);
    const reporter = await makeUser(db, "dup");

    createReport(dealId, reporter, "spam", null, db);
    expect(() => createReport(dealId, reporter, "fake", null, db)).toThrow(/zaten/);
  });

  it("olmayan fırsat raporlanamaz", async () => {
    const reporter = await makeUser(db, "nf");
    expect(() => createReport(999999, reporter, "spam", null, db)).toThrow(/bulunamadı/);
  });

  it("3 açık rapordan sonra fırsat incelemeye alınır (reported)", async () => {
    const { dealId } = await setupWithDeal(db);
    for (const tag of ["r1", "r2", "r3"]) {
      const r = await makeUser(db, tag);
      createReport(dealId, r, "wrong_price", null, db);
    }
    const detail = (
      await import("@/server/deals")
    ).getDealDetail(dealId, db);
    expect(detail.deal.status).toBe("reported");
  });
});

describe("report resolution (admin)", () => {
  let db: ReturnType<typeof createTestDb>;
  let admin: PublicUser;

  beforeEach(async () => {
    db = createTestDb();
    process.env.ADMIN_EMAILS = "adm@t.local";
    admin = (
      await register(
        { email: "adm@t.local", password: "Parola123456", displayName: "AD" },
        db
      )
    ).user;
    delete process.env.ADMIN_EMAILS;
  });

  it("admin raporu reddedebilir (dismiss)", async () => {
    const { dealId } = await setupWithDeal(db);
    const reporter = await makeUser(db, "dis");
    createReport(dealId, reporter, "spam", null, db);
    const [report] = listOpenReports(db);

    resolveReport(report.id, "dismiss", admin, db);
    expect(listOpenReports(db)).toHaveLength(0);

    const detail = (await import("@/server/deals")).getDealDetail(dealId, db);
    expect(detail.deal.status).toBe("active");
  });

  it("admin raporu 'fırsatı kaldır' ile sonuçlandırabilir", async () => {
    const { dealId } = await setupWithDeal(db);
    const reporter = await makeUser(db, "rm");
    createReport(dealId, reporter, "fake", null, db);
    const [report] = listOpenReports(db);

    resolveReport(report.id, "remove_deal", admin, db);
    expect(listOpenReports(db)).toHaveLength(0);

    const detail = (await import("@/server/deals")).getDealDetail(dealId, db);
    expect(detail.deal.status).toBe("removed");
  });

  it("çözümlenmiş rapor tekrar çözülemez", async () => {
    const { dealId } = await setupWithDeal(db);
    const reporter = await makeUser(db, "again");
    createReport(dealId, reporter, "spam", null, db);
    const [report] = listOpenReports(db);

    resolveReport(report.id, "dismiss", admin, db);
    expect(() => resolveReport(report.id, "dismiss", admin, db)).toThrow(/zaten/);
  });

  it("normal kullanıcı admin aksiyonu alamaz (authorization)", async () => {
    const { dealId } = await setupWithDeal(db);
    const reporter = await makeUser(db, "norm");
    createReport(dealId, reporter, "spam", null, db);
    const [report] = listOpenReports(db);

    const attacker = await makeUser(db, "attacker");
    expect(() => resolveReport(report.id, "remove_deal", attacker, db)).toThrow();
  });
});
