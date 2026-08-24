import { asc, eq } from "drizzle-orm";
import { db as appDb, type Db } from "@/server/db";
import { categories, locations } from "@/db/schema";

export interface CategoryOption {
  id: number;
  slug: string;
  name: string;
}

export interface LocationOption {
  id: number;
  slug: string;
  name: string;
}

export function listCategories(database: Db = appDb): CategoryOption[] {
  return database
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();
}

export function listLocations(database: Db = appDb): LocationOption[] {
  return database
    .select({ id: locations.id, slug: locations.slug, name: locations.name })
    .from(locations)
    .where(isNull(locations.parentId))
    .orderBy(asc(locations.sortOrder), asc(locations.name))
    .all();
}
