import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import * as schema from "@/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export function createDb(filePath: string): Db {
  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema, casing: "snake_case" });
}

export function resolveDatabasePath(): string {
  const configured = process.env.DATABASE_PATH ?? "./data/app.db";
  if (configured === ":memory:") return configured;
  return path.resolve(configured);
}

export function runMigrations(db: Db): void {
  migrate(db, { migrationsFolder: "./drizzle" });
}

const globalForDb = globalThis as unknown as { __kfDb?: Db };

export function getDb(): Db {
  if (!globalForDb.__kfDb) {
    globalForDb.__kfDb = createDb(resolveDatabasePath());
    runMigrations(globalForDb.__kfDb);
  }
  return globalForDb.__kfDb;
}
