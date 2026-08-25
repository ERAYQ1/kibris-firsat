import { createDb, runMigrations, type Db } from "@/server/db";
import { categories, locations, users } from "@/db/schema";
import { register, type PublicUser } from "@/server/auth";
import { eq, or, like } from "drizzle-orm";

export function createTestDb(): Db {
  const db = createDb(":memory:");
  runMigrations(db);
  return db;
}

export const VALID_PASSWORD = "Parola123456";

let counter = 0;

export async function makeUser(
  db: Db,
  email?: string,
  role: "user" | "admin" = "user"
): Promise<PublicUser> {
  counter += 1;
  const userEmail = email ?? `user${counter}@test.local`;
  const { user } = await register(
    { email: userEmail, password: VALID_PASSWORD, displayName: `User ${counter}` },
    db
  );
  if (role === "admin") {
    db.update(users).set({ role: "admin" }).where(eq(users.id, user.id)).run();
    user.role = "admin";
  }
  return user;
}

export async function makeAdmin(db: Db): Promise<PublicUser> {
  return makeUser(db, undefined, "admin");
}

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
