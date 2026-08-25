import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import * as schema from "@/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export function createDb(filePath: string): Db {
  const sqlite = new Database(filePath);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("temp_store = MEMORY");
  sqlite.pragma("cache_size = -64000"); // 64 MB RAM cache

  if (filePath !== ":memory:") {
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("synchronous = NORMAL");
    sqlite.pragma("mmap_size = 268435456"); // 256 MB memory-mapped I/O
  }

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
