import { eq, and, desc, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { favorites, deals, categories, locations, stores } from "@/db/schema";
import { Errors } from "@/lib/errors";
import type { DealListItem } from "@/server/deals";

const scoreSubquery = sql<number>`(
  SELECT COALESCE(SUM(v.value), 0) FROM votes v WHERE v.deal_id = ${deals.id}
)`;

export function isFavorited(dealId: number, userId: number, database: Db = getDb()): boolean {
  if (!Number.isInteger(dealId) || !Number.isInteger(userId)) return false;
  const row = database
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.dealId, dealId), eq(favorites.userId, userId)))
    .get();
  return Boolean(row);
}

export function getFavoriteCount(dealId: number, database: Db = getDb()): number {
  if (!Number.isInteger(dealId)) return 0;
  const row = database
    .select({ count: sql<number>`COUNT(*)` })
    .from(favorites)
    .where(eq(favorites.dealId, dealId))
    .get();
  return row?.count ?? 0;
}

export function toggleFavorite(
  dealId: number,
  userId: number,
  database: Db = getDb()
): { favorited: boolean; count: number } {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const deal = database.select({ id: deals.id }).from(deals).where(eq(deals.id, dealId)).get();
  if (!deal) throw Errors.notFound("Fırsat");

  const existing = database
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.dealId, dealId), eq(favorites.userId, userId)))
    .get();

  if (existing) {
    database.delete(favorites).where(eq(favorites.id, existing.id)).run();
    const count = getFavoriteCount(dealId, database);
    return { favorited: false, count };
  } else {
    database.insert(favorites).values({ dealId, userId }).run();
    const count = getFavoriteCount(dealId, database);
    return { favorited: true, count };
  }
}

export function listUserFavorites(userId: number, database: Db = getDb()): DealListItem[] {
  if (!Number.isInteger(userId) || userId <= 0) throw Errors.badRequest("Geçersiz kullanıcı.");

  const rows = database
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
    .from(favorites)
    .innerJoin(deals, eq(deals.id, favorites.dealId))
    .innerJoin(categories, eq(categories.id, deals.categoryId))
    .innerJoin(locations, eq(locations.id, deals.locationId))
    .innerJoin(stores, eq(stores.id, deals.storeId))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .all();

  return rows.map((r) => ({
    ...r,
    isVerified: r.isVerified === 1,
  }));
}
