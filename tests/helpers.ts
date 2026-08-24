import { createDb, runMigrations, type Db } from "@/server/db";
import { categories, locations } from "@/db/schema";
import { eq, or, like } from "drizzle-orm";

export function createTestDb(): Db {
  const db = createDb(":memory:");
  runMigrations(db);
  return db;
}

export const VALID_PASSWORD = "Parola123456";

let counter = 0;

export interface SeededRefs {
  categoryId: number;
  locationId: number;
  categorySlug: string;
  locationSlug: string;
}

export function dealIds(refs: SeededRefs): { categoryId: number; locationId: number } {
  return { categoryId: refs.categoryId, locationId: refs.locationId };
}

export async function seedCategoryAndLocation(db: Db): Promise<SeededRefs> {
  counter += 1;
  const categorySlug = `test-kategori-${counter}`;
  const locationSlug = `test-konum-${counter}`;
  const category = db
    .insert(categories)
    .values({ slug: categorySlug, name: `Test Kategori ${counter}`, sortOrder: counter })
    .returning({ id: categories.id })
    .get();
  const location = db
    .insert(locations)
    .values({ slug: locationSlug, name: `Test Konum ${counter}`, sortOrder: counter })
    .returning({ id: locations.id })
    .get();
  return {
    categoryId: category.id,
    locationId: location.id,
    categorySlug,
    locationSlug,
  };
}

export async function getSeededLocationCount(db: Db): Promise<number> {
  return db
    .select({ id: locations.id })
    .from(locations)
    .where(or(eq(locations.slug, ""), like(locations.slug, "%")))
    .all().length;
}
