import { and, asc, desc, eq, gt, inArray, like, isNull, or, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import {
  categories,
  dealImages,
  deals,
  locations,
  priceEntries,
  reports,
  stores,
  users,
  votes,
} from "@/db/schema";
import { Errors } from "@/lib/errors";
import type { PublicUser } from "@/server/auth";
import { dealCreateSchema, parsePriceToCents } from "@/lib/validation";
import type { ReportReason } from "@/lib/report-reasons";

export interface DealListItem {
  id: number;
  title: string;
  priceCents: number;
  originalPriceCents: number | null;
  currency: "TRY" | "GBP" | "EUR";
  status: "active" | "expired" | "reported" | "removed";
  createdAt: number;
  expiresAt: number | null;
  categoryName: string;
  categorySlug: string;
  locationName: string;
  locationSlug: string;
  storeName: string;
  score: number;
}

export interface DealListOptions {
  q?: string;
  categorySlug?: string;
  locationSlug?: string;
  sort?: "newest" | "top" | "hot" | "discount";
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

const scoreSubquery = sql<number>`(
  SELECT COALESCE(SUM(v.value), 0) FROM votes v WHERE v.deal_id = ${deals.id}
)`;

function listQuery(database: Db) {
  return database
    .select({
      id: deals.id,
      title: deals.title,
      priceCents: deals.priceCents,
      originalPriceCents: deals.originalPriceCents,
      currency: deals.currency,
      status: deals.status,
      createdAt: deals.createdAt,
      expiresAt: deals.expiresAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      locationName: locations.name,
      locationSlug: locations.slug,
      storeName: stores.name,
      score: scoreSubquery.as("score"),
    })
    .from(deals)
    .innerJoin(categories, eq(categories.id, deals.categoryId))
    .innerJoin(locations, eq(locations.id, deals.locationId))
    .innerJoin(stores, eq(stores.id, deals.storeId));
}

export async function listDeals(
  options: DealListOptions = {},
  database: Db = getDb()
): Promise<{ items: DealListItem[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE));

  const conditions = [];
  if (!options.includeInactive) {
    conditions.push(
      eq(deals.status, "active"),
      or(gt(deals.expiresAt, sql`(unixepoch())`), isNull(deals.expiresAt))
    );
  } else {
    conditions.push(inArray(deals.status, ["active", "expired"]));
  }
  if (options.q) {
    const pattern = `%${options.q.replace(/[%_\\]/g, " ")}%`;
    conditions.push(
      or(like(deals.title, pattern), like(stores.name, pattern), like(categories.name, pattern))
    );
  }
  if (options.categorySlug) conditions.push(eq(categories.slug, options.categorySlug));
  if (options.locationSlug) conditions.push(eq(locations.slug, options.locationSlug));

  const where = conditions.length ? and(...conditions) : undefined;
  let orderBy;
  if (options.sort === "top" || options.sort === "hot") {
    orderBy = [desc(scoreSubquery), desc(deals.createdAt)];
  } else if (options.sort === "discount") {
    orderBy = [
      desc(
        sql`COALESCE((${deals.originalPriceCents} - ${deals.priceCents}) * 100 / ${deals.originalPriceCents}, 0)`
      ),
      desc(deals.createdAt),
    ];
  } else {
    orderBy = [desc(deals.createdAt)];
  }

  const rows = await listQuery(database)
    .where(where)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalRow = database
    .select({ count: sql<number>`COUNT(*)` })
    .from(deals)
    .innerJoin(categories, eq(categories.id, deals.categoryId))
    .innerJoin(locations, eq(locations.id, deals.locationId))
    .innerJoin(stores, eq(stores.id, deals.storeId))
    .where(where)
    .get();

  return { items: rows, total: totalRow?.count ?? 0, page, pageSize };
}

export function getDealDetail(id: number, database: Db = getDb()) {
  if (!Number.isInteger(id) || id <= 0) throw Errors.badRequest("Geçersiz fırsat.");
  const row = database
    .select({
      deal: deals,
      categoryName: categories.name,
      locationName: locations.name,
      storeName: stores.name,
      authorName: sql<string>`(SELECT display_name FROM users u WHERE u.id = ${deals.authorId})`,
      upvotes: sql<number>`(SELECT COUNT(*) FROM votes v WHERE v.deal_id = ${deals.id} AND v.value = 1)`,
      downvotes: sql<number>`(SELECT COUNT(*) FROM votes v WHERE v.deal_id = ${deals.id} AND v.value = -1)`,
    })
    .from(deals)
    .innerJoin(categories, eq(categories.id, deals.categoryId))
    .innerJoin(locations, eq(locations.id, deals.locationId))
    .innerJoin(stores, eq(stores.id, deals.storeId))
    .where(eq(deals.id, id))
    .get();
  if (!row) throw Errors.notFound("Fırsat");

  const images = database
    .select({ filename: dealImages.filename })
    .from(dealImages)
    .where(eq(dealImages.dealId, id))
    .orderBy(asc(dealImages.sortOrder))
    .all();

  const priceHistory = database
    .select({ priceCents: priceEntries.priceCents, recordedAt: priceEntries.recordedAt })
    .from(priceEntries)
    .where(eq(priceEntries.dealId, id))
    .orderBy(asc(priceEntries.recordedAt))
    .all();

  return { ...row, images, priceHistory };
}

export async function createDeal(
  input: unknown,
  author: PublicUser,
  database: Db = getDb()
): Promise<{ id: number }> {
  const data = dealCreateSchema.parse(input);
  const priceCents = parsePriceToCents(data.price);
  if (priceCents <= 0) throw Errors.validation("Fiyat sıfırdan büyük olmalı.");

  let originalPriceCents: number | null = null;
  if (data.originalPrice) {
    originalPriceCents = parsePriceToCents(data.originalPrice);
    if (originalPriceCents <= priceCents) {
      throw Errors.validation("Eski fiyat, indirimli fiyattan büyük olmalıdır.");
    }
  }

  let expiresAt: number | null = null;
  if (data.expiresAt) {
    const ts = Math.floor(new Date(data.expiresAt).getTime() / 1000);
    const nowSec = Math.floor(Date.now() / 1000);
    if (ts <= nowSec) throw Errors.validation("Geçerlilik tarihi gelecekte olmalı.");
    if (ts > nowSec + 366 * 24 * 3600)
      throw Errors.validation("Geçerlilik tarihi en fazla 1 yıl sonrası olabilir.");
    expiresAt = ts;
  }

  const category = database
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .get();
  if (!category) throw Errors.validation("Geçersiz kategori.");

  const location = database
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.id, data.locationId))
    .get();
  if (!location) throw Errors.validation("Geçersiz konum.");

  const normalizedName = data.storeName.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
  let store = database
    .select({ id: stores.id })
    .from(stores)
    .where(and(eq(stores.normalizedName, normalizedName), eq(stores.locationId, data.locationId)))
    .get();
  if (!store) {
    store = database
      .insert(stores)
      .values({ name: data.storeName.trim(), normalizedName, locationId: data.locationId })
      .returning({ id: stores.id })
      .get();
  }

  const inserted = database
    .insert(deals)
    .values({
      authorId: author.id,
      title: data.title,
      description: data.description || null,
      priceCents,
      originalPriceCents,
      currency: data.currency,
      categoryId: data.categoryId,
      locationId: data.locationId,
      storeId: store.id,
      expiresAt,
    })
    .returning({ id: deals.id })
    .get();

  database
    .insert(priceEntries)
    .values({ dealId: inserted.id, priceCents, currency: data.currency })
    .run();

  if (data.imageFilenames && data.imageFilenames.length > 0) {
    for (let i = 0; i < data.imageFilenames.length; i++) {
      database
        .insert(dealImages)
        .values({
          dealId: inserted.id,
          filename: data.imageFilenames[i],
          sortOrder: i,
        })
        .run();
    }
  }

  return { id: inserted.id };
}

export async function deleteDeal(
  dealId: number,
  actor: PublicUser,
  database: Db = getDb()
): Promise<void> {
  const deal = database.select().from(deals).where(eq(deals.id, dealId)).get();
  if (!deal) throw Errors.notFound("Fırsat");
  if (deal.authorId !== actor.id && actor.role !== "admin") throw Errors.forbidden();
  database.delete(deals).where(eq(deals.id, dealId)).run();
}

export async function setVote(
  dealId: number,
  userId: number,
  value: 1 | -1 | 0,
  database: Db = getDb()
): Promise<{ upvotes: number; downvotes: number }> {
  const deal = database
    .select({ status: deals.status })
    .from(deals)
    .where(eq(deals.id, dealId))
    .get();
  if (!deal) throw Errors.notFound("Fırsat");
  if (deal.status !== "active")
    throw Errors.conflict("Yalnızca aktif fırsatlara oy verilebilir.");

  if (value === 0) {
    database.delete(votes).where(and(eq(votes.dealId, dealId), eq(votes.userId, userId))).run();
  } else {
    database
      .insert(votes)
      .values({ dealId, userId, value })
      .onConflictDoUpdate({
        target: [votes.userId, votes.dealId],
        set: { value },
      })
      .run();
  }

  return getVoteCounts(dealId, database);
}

export function getVoteCounts(dealId: number, database: Db = getDb()) {
  const rows = database
    .select({ value: votes.value, count: sql<number>`COUNT(*)` })
    .from(votes)
    .where(eq(votes.dealId, dealId))
    .groupBy(votes.value)
    .all();
  const upvotes = rows.find((r) => r.value === 1)?.count ?? 0;
  const downvotes = rows.find((r) => r.value === -1)?.count ?? 0;
  return { upvotes, downvotes };
}

export function getUserVote(
  dealId: number,
  userId: number,
  database: Db = getDb()
): 1 | -1 | 0 {
  const row = database
    .select({ value: votes.value })
    .from(votes)
    .where(and(eq(votes.dealId, dealId), eq(votes.userId, userId)))
    .get();
  if (!row) return 0;
  return row.value === 1 ? 1 : -1;
}

export function createReport(
  dealId: number,
  reporter: PublicUser,
  reason: ReportReason,
  details: string | null,
  database: Db = getDb()
): void {
  const deal = database
    .select({ id: deals.id, status: deals.status })
    .from(deals)
    .where(eq(deals.id, dealId))
    .get();
  if (!deal) throw Errors.notFound("Fırsat");

  const existing = database
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.dealId, dealId), eq(reports.userId, reporter.id)))
    .get();
  if (existing) throw Errors.conflict("Bu fırsatı zaten raporladınız.");

  database.insert(reports).values({ dealId, userId: reporter.id, reason, details }).run();

  const openCount = database
    .select({ count: sql<number>`COUNT(*)` })
    .from(reports)
    .where(and(eq(reports.dealId, dealId), eq(reports.status, "open")))
    .get();
  if ((openCount?.count ?? 0) >= 3 && deal.status === "active") {
    database
      .update(deals)
      .set({ status: "reported", updatedAt: sql`(unixepoch())` })
      .where(eq(deals.id, dealId))
      .run();
  }
}

export type ReportWithMeta = {
  id: number;
  dealId: number;
  dealTitle: string;
  dealStatus: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: number;
  reporterName: string;
};

export function listOpenReports(database: Db = getDb()): ReportWithMeta[] {
  return database
    .select({
      id: reports.id,
      dealId: reports.dealId,
      dealTitle: deals.title,
      dealStatus: deals.status,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: users.displayName,
    })
    .from(reports)
    .innerJoin(deals, eq(deals.id, reports.dealId))
    .innerJoin(users, eq(users.id, reports.userId))
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt))
    .all();
}

export function resolveReport(
  reportId: number,
  action: "dismiss" | "remove_deal",
  admin: PublicUser,
  database: Db = getDb()
): void {
  if (admin.role !== "admin") throw Errors.forbidden();
  const report = database.select().from(reports).where(eq(reports.id, reportId)).get();
  if (!report) throw Errors.notFound("Rapor");
  if (report.status !== "open") throw Errors.conflict("Bu rapor zaten çözümlenmiş.");

  if (action === "remove_deal") {
    database
      .update(deals)
      .set({ status: "removed", updatedAt: sql`(unixepoch())` })
      .where(eq(deals.id, report.dealId))
      .run();
    database.update(reports).set({ status: "resolved" }).where(eq(reports.id, reportId)).run();
  } else {
    database
      .update(reports)
      .set({ status: "dismissed", resolvedBy: admin.id, resolvedAt: sql`(unixepoch())` })
      .where(eq(reports.id, reportId))
      .run();
  }
}

export function expireDueDeals(nowSec: number = Math.floor(Date.now() / 1000), database: Db = getDb()): number {
  const result = database.run(
    sql`UPDATE deals SET status = 'expired', updated_at = ${nowSec}
        WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= ${nowSec}`
  );
  return result.changes;
}

export function isDealActive(
  deal: { status: string; expiresAt: number | null },
  nowSec: number = Math.floor(Date.now() / 1000)
): boolean {
  if (deal.status !== "active") return false;
  if (deal.expiresAt !== null && deal.expiresAt <= nowSec) return false;
  return true;
}
