import {
  and,
  asc,
  desc,
  eq,
  gte,
  gt,
  inArray,
  isNull,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
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
  status: "active" | "expired" | "sold_out" | "hidden" | "rejected" | "reported" | "removed";
  viewCount: number;
  isVerified: boolean;
  tags: string | null;
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
  minPriceCents?: number;
  maxPriceCents?: number;
  minDiscount?: number;
  sort?: "newest" | "top" | "hot" | "discount" | "price_asc" | "price_desc";
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

const scoreSubquery = sql<number>`(
  SELECT COALESCE(SUM(v.value), 0) FROM votes v WHERE v.deal_id = ${deals.id}
)`;

export function isDealActive(
  deal: { status: string; expiresAt?: number | null },
  nowSec: number = Math.floor(Date.now() / 1000)
): boolean {
  if (deal.status !== "active") return false;
  if (deal.expiresAt !== undefined && deal.expiresAt !== null && deal.expiresAt <= nowSec) {
    return false;
  }
  return true;
}

function listQuery(database: Db) {
  return database
    .select({
      id: deals.id,
      title: deals.title,
      priceCents: deals.priceCents,
      originalPriceCents: deals.originalPriceCents,
      currency: deals.currency,
      status: deals.status,
      viewCount: deals.viewCount,
      isVerified: deals.isVerified,
      tags: deals.tags,
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
    conditions.push(inArray(deals.status, ["active", "expired", "sold_out"]));
  }
  if (options.q) {
    const pattern = `%${options.q.replace(/[%_\\]/g, " ")}%`;
    conditions.push(
      or(like(deals.title, pattern), like(stores.name, pattern), like(categories.name, pattern))
    );
  }
  if (options.categorySlug) conditions.push(eq(categories.slug, options.categorySlug));
  if (options.locationSlug) conditions.push(eq(locations.slug, options.locationSlug));
  if (options.minPriceCents !== undefined && options.minPriceCents > 0) {
    conditions.push(gte(deals.priceCents, options.minPriceCents));
  }
  if (options.maxPriceCents !== undefined && options.maxPriceCents > 0) {
    conditions.push(lte(deals.priceCents, options.maxPriceCents));
  }
  if (options.minDiscount !== undefined && options.minDiscount > 0) {
    conditions.push(
      gte(
        sql`COALESCE((${deals.originalPriceCents} - ${deals.priceCents}) * 100 / ${deals.originalPriceCents}, 0)`,
        options.minDiscount
      )
    );
  }

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
  } else if (options.sort === "price_asc") {
    orderBy = [asc(deals.priceCents), desc(deals.createdAt)];
  } else if (options.sort === "price_desc") {
    orderBy = [desc(deals.priceCents), desc(deals.createdAt)];
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

  const formattedItems: DealListItem[] = rows.map((r) => ({
    ...r,
    isVerified: r.isVerified === 1,
  }));

  return { items: formattedItems, total: totalRow?.count ?? 0, page, pageSize };
}

export function incrementViewCount(dealId: number, database: Db = getDb()): void {
  if (!Number.isInteger(dealId) || dealId <= 0) return;
  database
    .update(deals)
    .set({ viewCount: sql`${deals.viewCount} + 1` })
    .where(eq(deals.id, dealId))
    .run();
}

export function getDealDetail(id: number, database: Db = getDb()) {
  if (!Number.isInteger(id) || id <= 0) throw Errors.badRequest("Geçersiz fırsat.");
  const row = database
    .select({
      deal: deals,
      categoryName: categories.name,
      categorySlug: categories.slug,
      locationName: locations.name,
      locationSlug: locations.slug,
      storeName: stores.name,
      storePhone: stores.phone,
      storeAddress: stores.address,
      authorName: users.displayName,
      authorId: users.id,
      score: scoreSubquery.as("score"),
    })
    .from(deals)
    .innerJoin(categories, eq(categories.id, deals.categoryId))
    .innerJoin(locations, eq(locations.id, deals.locationId))
    .innerJoin(stores, eq(stores.id, deals.storeId))
    .innerJoin(users, eq(users.id, deals.authorId))
    .where(eq(deals.id, id))
    .get();

  if (!row) throw Errors.notFound("Fırsat");

  const images = database
    .select({ id: dealImages.id, filename: dealImages.filename, sortOrder: dealImages.sortOrder })
    .from(dealImages)
    .where(eq(dealImages.dealId, id))
    .orderBy(dealImages.sortOrder)
    .all();

  const priceHistory = database
    .select({
      id: priceEntries.id,
      priceCents: priceEntries.priceCents,
      currency: priceEntries.currency,
      recordedAt: priceEntries.recordedAt,
    })
    .from(priceEntries)
    .where(eq(priceEntries.dealId, id))
    .orderBy(desc(priceEntries.recordedAt))
    .limit(10)
    .all();

  return {
    ...row.deal,
    deal: row.deal,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    locationName: row.locationName,
    locationSlug: row.locationSlug,
    storeName: row.storeName,
    storePhone: row.storePhone,
    storeAddress: row.storeAddress,
    authorName: row.authorName,
    authorId: row.authorId,
    score: row.score,
    isVerified: row.deal.isVerified === 1,
    images,
    priceHistory,
  };
}

export async function createDeal(
  input: unknown,
  author: PublicUser,
  database: Db = getDb()
): Promise<{ id: number }> {
  const data = dealCreateSchema.parse(input);
  const priceCents = parsePriceToCents(data.price);
  const originalPriceCents = data.originalPrice
    ? parsePriceToCents(data.originalPrice)
    : null;

  if (originalPriceCents !== null && originalPriceCents <= priceCents) {
    throw Errors.validation("Eski fiyat, indirimli fiyattan yüksek olmalıdır.");
  }

  const category = database
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .get();
  if (!category) throw Errors.notFound("Kategori");

  const location = database
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.id, data.locationId))
    .get();
  if (!location) throw Errors.notFound("Konum");

  const expiresAt = data.expiresAt ? Math.floor(new Date(data.expiresAt).getTime() / 1000) : null;
  const nowSec = Math.floor(Date.now() / 1000);
  const maxExpiresAt = nowSec + 365 * 86400;
  if (expiresAt && (expiresAt <= nowSec || expiresAt > maxExpiresAt)) {
    throw Errors.validation("Son geçerlilik tarihi 1 yıldan uzun olamaz.");
  }

  const normalizedName = data.storeName.trim().toLowerCase();
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

export function updateDealStatus(
  dealId: number,
  status: "active" | "expired" | "sold_out" | "hidden" | "rejected" | "reported" | "removed",
  user: PublicUser,
  database: Db = getDb()
): void {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const deal = database.select().from(deals).where(eq(deals.id, dealId)).get();
  if (!deal) throw Errors.notFound("Fırsat");

  if (user.role !== "admin" && deal.authorId !== user.id) {
    throw Errors.forbidden();
  }

  database.update(deals).set({ status }).where(eq(deals.id, dealId)).run();
}

export async function setVote(
  dealId: number,
  userId: number,
  value: 1 | -1 | 0,
  database: Db = getDb()
): Promise<{ upvotes: number; downvotes: number; userVote?: 1 | -1 | null }> {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const deal = database
    .select({ id: deals.id, authorId: deals.authorId, status: deals.status })
    .from(deals)
    .where(eq(deals.id, dealId))
    .get();
  if (!deal || deal.status === "removed") throw Errors.notFound("Fırsat");
  if (deal.status === "expired") {
    throw Errors.conflict("Süresi dolmuş fırsata oy verilemez.");
  }
  if (deal.authorId === userId) {
    throw Errors.badRequest("Kendi fırsatınıza oy veremezsiniz.");
  }

  const existing = database
    .select({ id: votes.id, value: votes.value })
    .from(votes)
    .where(and(eq(votes.dealId, dealId), eq(votes.userId, userId)))
    .get();

  if (value === 0) {
    if (existing) {
      database.delete(votes).where(eq(votes.id, existing.id)).run();
    }
  } else if (!existing) {
    database.insert(votes).values({ dealId, userId, value }).run();
  } else if (existing.value === value) {
    database.delete(votes).where(eq(votes.id, existing.id)).run();
  } else {
    database.update(votes).set({ value }).where(eq(votes.id, existing.id)).run();
  }

  return getVoteCounts(dealId, userId, database);
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
  return (row?.value as 1 | -1) ?? 0;
}

export function getVoteCounts(
  dealId: number,
  userIdOrDb?: number | Db,
  database?: Db
): { upvotes: number; downvotes: number; userVote?: 1 | -1 | null } {
  const db = (typeof userIdOrDb === "object" ? userIdOrDb : database) ?? getDb();
  const userId = typeof userIdOrDb === "number" ? userIdOrDb : undefined;

  const rows = db
    .select({ value: votes.value, count: sql<number>`COUNT(*)` })
    .from(votes)
    .where(eq(votes.dealId, dealId))
    .groupBy(votes.value)
    .all();

  let upvotes = 0;
  let downvotes = 0;
  for (const r of rows) {
    if (r.value === 1) upvotes = r.count;
    if (r.value === -1) downvotes = r.count;
  }

  if (userId !== undefined) {
    const u = db
      .select({ value: votes.value })
      .from(votes)
      .where(and(eq(votes.dealId, dealId), eq(votes.userId, userId)))
      .get();
    const userVote = (u?.value as 1 | -1) ?? null;
    return { upvotes, downvotes, userVote };
  }

  return { upvotes, downvotes };
}

export function createReport(
  dealId: number,
  userOrId: number | PublicUser,
  reason: ReportReason,
  details?: string | null,
  database: Db = getDb()
): { id: number } {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");
  const userId = typeof userOrId === "number" ? userOrId : userOrId.id;

  const deal = database
    .select({ id: deals.id, authorId: deals.authorId, status: deals.status })
    .from(deals)
    .where(eq(deals.id, dealId))
    .get();
  if (!deal || deal.status === "removed") throw Errors.notFound("Fırsat");
  if (deal.authorId === userId) {
    throw Errors.badRequest("Kendi fırsatınızı raporlayamazsınız.");
  }

  const existing = database
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.dealId, dealId), eq(reports.userId, userId)))
    .get();
  if (existing) {
    throw Errors.conflict("Bu fırsatı zaten raporladınız.");
  }

  const inserted = database
    .insert(reports)
    .values({
      dealId,
      userId,
      reason,
      details: details?.trim().slice(0, 500) || null,
    })
    .returning({ id: reports.id })
    .get();

  const countRow = database
    .select({ count: sql<number>`COUNT(*)` })
    .from(reports)
    .where(and(eq(reports.dealId, dealId), eq(reports.status, "open")))
    .get();

  if ((countRow?.count ?? 0) >= 3) {
    database.update(deals).set({ status: "reported" }).where(eq(deals.id, dealId)).run();
  }

  return { id: inserted.id };
}

export interface AdminReportItem {
  id: number;
  dealId: number;
  dealTitle: string;
  dealStatus: string;
  reason: ReportReason;
  details: string | null;
  reporterEmail: string;
  reporterName: string;
  createdAt: number;
}

export function listOpenReports(database: Db = getDb()): AdminReportItem[] {
  const rows = database
    .select({
      id: reports.id,
      dealId: reports.dealId,
      dealTitle: deals.title,
      dealStatus: deals.status,
      reason: reports.reason,
      details: reports.details,
      reporterEmail: users.email,
      reporterName: users.displayName,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .innerJoin(deals, eq(deals.id, reports.dealId))
    .innerJoin(users, eq(users.id, reports.userId))
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt))
    .all();

  return rows as AdminReportItem[];
}

export function resolveReport(
  reportId: number,
  action: "dismiss" | "remove_deal",
  adminUser: PublicUser,
  database: Db = getDb()
): { ok: true } {
  if (adminUser.role !== "admin") throw Errors.forbidden();

  const report = database
    .select({ id: reports.id, dealId: reports.dealId, status: reports.status })
    .from(reports)
    .where(eq(reports.id, reportId))
    .get();
  if (!report) throw Errors.notFound("Rapor");
  if (report.status !== "open") throw Errors.conflict("Bu rapor zaten çözülmüş.");

  const now = Math.floor(Date.now() / 1000);
  if (action === "dismiss") {
    database
      .update(reports)
      .set({ status: "dismissed", resolvedBy: adminUser.id, resolvedAt: now })
      .where(eq(reports.id, reportId))
      .run();

    const openRemaining = database
      .select({ count: sql<number>`COUNT(*)` })
      .from(reports)
      .where(and(eq(reports.dealId, report.dealId), eq(reports.status, "open")))
      .get();
    if ((openRemaining?.count ?? 0) === 0) {
      database
        .update(deals)
        .set({ status: "active" })
        .where(and(eq(deals.id, report.dealId), eq(deals.status, "reported")))
        .run();
    }
  } else if (action === "remove_deal") {
    database
      .update(reports)
      .set({ status: "resolved", resolvedBy: adminUser.id, resolvedAt: now })
      .where(eq(reports.id, reportId))
      .run();
    database
      .update(deals)
      .set({ status: "removed" })
      .where(eq(deals.id, report.dealId))
      .run();
  }

  return { ok: true };
}

export function expireDueDeals(
  nowTimestampOrDb?: number | Db,
  database?: Db
): number {
  const db = (typeof nowTimestampOrDb === "object" ? nowTimestampOrDb : database) ?? getDb();
  const nowTs = typeof nowTimestampOrDb === "number" ? nowTimestampOrDb : sql`(unixepoch())`;

  const result = db
    .update(deals)
    .set({ status: "expired" })
    .where(and(eq(deals.status, "active"), lte(deals.expiresAt, nowTs)))
    .run();
  return result.changes;
}

export async function deleteDeal(
  dealId: number,
  user: PublicUser,
  database: Db = getDb()
): Promise<void> {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const deal = database.select().from(deals).where(eq(deals.id, dealId)).get();
  if (!deal) throw Errors.notFound("Fırsat");

  if (user.role !== "admin" && deal.authorId !== user.id) {
    throw Errors.forbidden();
  }

  database.delete(deals).where(eq(deals.id, dealId)).run();
}

export type ReportWithMeta = AdminReportItem;

