import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");

const dbPath = process.env.DATABASE_PATH ?? "./data/app.db";
if (dbPath === ":memory:") {
  console.error("DATABASE_PATH=:memory: kalıcı veri için kullanılamaz.");
  process.exit(1);
}

const dir = path.dirname(dbPath);
if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./drizzle" });
console.log(`Migrasyonlar uygulandı: ${dbPath}`);
