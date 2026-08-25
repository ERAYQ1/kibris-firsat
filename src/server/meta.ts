import { asc, desc, isNull, eq, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { categories, locations, stores } from "@/db/schema";

export interface CategoryOption {
  id: number;
  slug: string;
  name: string;
  dealsCount?: number;
}

export interface LocationOption {
  id: number;
  slug: string;
  name: string;
  dealsCount?: number;
}

export interface PopularStoreItem {
  id: number;
  name: string;
  locationName: string;
  locationSlug: string;
  isVerified: boolean;
  dealsCount: number;
}

export function listCategories(database: Db = getDb()): CategoryOption[] {
  const rows = database
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      dealsCount: sql<number>`(SELECT COUNT(*) FROM deals d WHERE d.category_id = ${categories.id} AND d.status = 'active')`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();

  return rows;
}

export function listLocations(database: Db = getDb()): LocationOption[] {
  const rows = database
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      dealsCount: sql<number>`(SELECT COUNT(*) FROM deals d WHERE d.location_id = ${locations.id} AND d.status = 'active')`,
    })
    .from(locations)
    .where(isNull(locations.parentId))
    .orderBy(asc(locations.sortOrder), asc(locations.name))
    .all();

  return rows;
}

export function listPopularStores(limit = 6, database: Db = getDb()): PopularStoreItem[] {
  const rows = database
    .select({
      id: stores.id,
      name: stores.name,
      locationName: locations.name,
      locationSlug: locations.slug,
      isVerified: stores.isVerified,
      dealsCount: sql<number>`(SELECT COUNT(*) FROM deals d WHERE d.store_id = ${stores.id} AND d.status = 'active')`,
    })
    .from(stores)
    .innerJoin(locations, eq(locations.id, stores.locationId))
    .orderBy(desc(sql`(SELECT COUNT(*) FROM deals d WHERE d.store_id = ${stores.id} AND d.status = 'active')`))
    .limit(limit)
    .all();

  return rows.map((r) => ({
    ...r,
    isVerified: r.isVerified === 1,
  }));
}
