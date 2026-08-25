import { eq, desc, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { stores, locations, deals, categories, users } from "@/db/schema";
import { Errors } from "@/lib/errors";
import type { DealListItem } from "@/server/deals";

const scoreSubquery = sql<number>`(
  SELECT COALESCE(SUM(v.value), 0) FROM votes v WHERE v.deal_id = ${deals.id}
)`;

const primaryImageSubquery = sql<string | null>`(
  SELECT di.filename FROM deal_images di WHERE di.deal_id = ${deals.id} ORDER BY di.sort_order ASC LIMIT 1
)`;

export interface StoreDetail {
  id: number;
  name: string;
  locationName: string;
  locationSlug: string;
  phone: string | null;
  address: string | null;
  isVerified: boolean;
  dealsCount: number;
}

export function getStoreDetail(storeId: number, database: Db = getDb()): StoreDetail {
  if (!Number.isInteger(storeId) || storeId <= 0) throw Errors.badRequest("Geçersiz mağaza.");

  const row = database
    .select({
      id: stores.id,
      name: stores.name,
      phone: stores.phone,
      address: stores.address,
      isVerified: stores.isVerified,
      locationName: locations.name,
      locationSlug: locations.slug,
      dealsCount: sql<number>`(SELECT COUNT(*) FROM deals d WHERE d.store_id = ${stores.id} AND d.status = 'active')`,
    })
    .from(stores)
    .innerJoin(locations, eq(locations.id, stores.locationId))
    .where(eq(stores.id, storeId))
    .get();

  if (!row) throw Errors.notFound("Mağaza");

  return {
    ...row,
    isVerified: row.isVerified === 1,
  };
}

export function listStoreDeals(storeId: number, database: Db = getDb()): DealListItem[] {
  if (!Number.isInteger(storeId) || storeId <= 0) throw Errors.badRequest("Geçersiz mağaza.");

  const rows = database
    .select({
      id: deals.id,
      storeId: deals.storeId,
      title: deals.title,
      priceCents: deals.priceCents,
      originalPriceCents: deals.originalPriceCents,
      currency: deals.currency,
      status: deals.status,
      viewCount: deals.viewCount,
      isVerified: deals.isVerified,
      couponCode: deals.couponCode,
      couponDiscount: deals.couponDiscount,
      tags: deals.tags,
      createdAt: deals.createdAt,
      expiresAt: deals.expiresAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      locationName: locations.name,
      locationSlug: locations.slug,
      storeName: stores.name,
      authorName: users.displayName,
      score: scoreSubquery.as("score"),
      imageFilename: primaryImageSubquery.as("image_filename"),
    })
    .from(deals)
    .innerJoin(categories, eq(categories.id, deals.categoryId))
    .innerJoin(locations, eq(locations.id, deals.locationId))
    .innerJoin(stores, eq(stores.id, deals.storeId))
    .innerJoin(users, eq(users.id, deals.authorId))
    .where(eq(deals.storeId, storeId))
    .orderBy(desc(deals.createdAt))
    .all();

  return rows.map((r) => ({
    ...r,
    isVerified: r.isVerified === 1,
  }));
}
