import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH ?? "./data/app.db";
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");

const cityList = [
  { slug: "lefkosa", name: "Lefkoşa", order: 1 },
  { slug: "girne", name: "Girne", order: 2 },
  { slug: "gazimagusa", name: "Gazimağusa", order: 3 },
  { slug: "guzelyurt", name: "Güzelyurt", order: 4 },
  { slug: "iskele", name: "İskele", order: 5 },
];

const categories = [
  ["market", "Market", 1],
  ["elektronik", "Elektronik", 2],
  ["giyim", "Giyim & Aksesuar", 3],
  ["restoran-kafe", "Restoran & Kafe", 4],
  ["ev-yasam", "Ev & Yaşam", 5],
  ["kozmetik", "Kozmetik & Kişisel Bakım", 6],
  ["bebek", "Bebek & Çocuk", 7],
  ["spor", "Spor & Outdoor", 8],
  ["diger", "Diğer", 99],
];

for (const c of cityList) {
  sqlite
    .prepare(
      `INSERT OR IGNORE INTO locations (slug, name, sort_order) VALUES (?, ?, ?)`
    )
    .run(c.slug, c.name, c.order);
}

for (const [slug, name, order] of categories) {
  sqlite
    .prepare(
      `INSERT OR IGNORE INTO categories (slug, name, sort_order) VALUES (?, ?, ?)`
    )
    .run(slug, name, order);
}

console.log("Seed tamamlandı: konumlar ve kategoriler hazır.");
