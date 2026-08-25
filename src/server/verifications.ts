import { eq, and, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { dealVerifications, deals } from "@/db/schema";
import { Errors } from "@/lib/errors";

export interface VerificationStats {
  verifiedActiveCount: number;
  soldOutCount: number;
  wrongPriceCount: number;
  userVerification: "verified_active" | "sold_out" | "wrong_price" | null;
}

export function getDealVerificationStats(
  dealId: number,
  userId?: number,
  database: Db = getDb()
): VerificationStats {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const counts = database
    .select({
      type: dealVerifications.type,
      count: sql<number>`COUNT(*)`,
    })
    .from(dealVerifications)
    .where(eq(dealVerifications.dealId, dealId))
    .groupBy(dealVerifications.type)
    .all();

  let verifiedActiveCount = 0;
  let soldOutCount = 0;
  let wrongPriceCount = 0;

  for (const c of counts) {
    if (c.type === "verified_active") verifiedActiveCount = c.count;
    if (c.type === "sold_out") soldOutCount = c.count;
    if (c.type === "wrong_price") wrongPriceCount = c.count;
  }

  let userVerification: "verified_active" | "sold_out" | "wrong_price" | null = null;
  if (userId) {
    const userRow = database
      .select({ type: dealVerifications.type })
      .from(dealVerifications)
      .where(and(eq(dealVerifications.dealId, dealId), eq(dealVerifications.userId, userId)))
      .get();
    if (userRow) {
      userVerification = userRow.type as "verified_active" | "sold_out" | "wrong_price";
    }
  }

  return {
    verifiedActiveCount,
    soldOutCount,
    wrongPriceCount,
    userVerification,
  };
}

export function setDealVerification(
  dealId: number,
  userId: number,
  type: "verified_active" | "sold_out" | "wrong_price",
  database: Db = getDb()
): VerificationStats {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const deal = database.select({ id: deals.id, status: deals.status }).from(deals).where(eq(deals.id, dealId)).get();
  if (!deal || deal.status === "removed") throw Errors.notFound("Fırsat");

  const existing = database
    .select({ id: dealVerifications.id, type: dealVerifications.type })
    .from(dealVerifications)
    .where(and(eq(dealVerifications.dealId, dealId), eq(dealVerifications.userId, userId)))
    .get();

  if (existing) {
    if (existing.type === type) {
      database.delete(dealVerifications).where(eq(dealVerifications.id, existing.id)).run();
    } else {
      database
        .update(dealVerifications)
        .set({ type })
        .where(eq(dealVerifications.id, existing.id))
        .run();
    }
  } else {
    database.insert(dealVerifications).values({ dealId, userId, type }).run();
  }

  return getDealVerificationStats(dealId, userId, database);
}
