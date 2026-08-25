import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const crypto = require("node:crypto");

const dbPath = process.env.DATABASE_PATH ?? "./data/app.db";
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");

const cityList = [
  { slug: "lefkosa", name: "Lefkoşa", order: 1 },
  { slug: "girne", name: "Girne", order: 2 },
  { slug: "gazimagusa", name: "Gazimağusa", order: 3 },
  { slug: "guzelyurt", name: "Güzelyurt", order: 4 },
  { slug: "iskele", name: "İskele", order: 5 },
  { slug: "lefke", name: "Lefke", order: 6 },
];

const categories = [
  ["market", "Market", 1],
  ["restoran-kafe", "Restoran & Kafe", 2],
  ["elektronik", "Elektronik", 3],
  ["giyim", "Giyim & Aksesuar", 4],
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

// Demo Kullanıcı (Eğer yoksa)
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync("KibrisFirsat123!", salt, 64).toString("hex");
const passwordHash = `${salt}:${hash}`;

sqlite
  .prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash, display_name, role) VALUES (1, ?, ?, ?, ?)`
  )
  .run("admin@kibrisfirsat.com", passwordHash, "Kıbrıs Editör", "admin");

// Mağazalar
const storeList = [
  { name: "Erülkü Süpermarket", normalized: "erulku supermarket", locationId: 1 },
  { name: "Lemar Market (Ortaköy)", normalized: "lemar market ortakoy", locationId: 1 },
  { name: "Şokmar Girne", normalized: "sokmar girne", locationId: 2 },
  { name: "Eziç Premier Restoran", normalized: "ezic premier restoran", locationId: 2 },
  { name: "Önder AVM Mağusa", normalized: "onder avm magusa", locationId: 3 },
  { name: "Gloria Jean's Coffees", normalized: "gloria jeans coffees", locationId: 1 },
];

for (const s of storeList) {
  sqlite
    .prepare(
      `INSERT OR IGNORE INTO stores (name, normalized_name, location_id) VALUES (?, ?, ?)`
    )
    .run(s.name, s.normalized, s.locationId);
}

// Örnek Gerçekçi Kıbrıs Fırsatları
const sampleDeals = [
  {
    title: "5 Litre Yudum Ayçiçek Yağı İndirimi",
    description: "Erülkü Süpermarket haftalık katalog indirimi. Stoklarla sınırlı, kişi başı max 2 adet.",
    priceCents: 24990,
    originalPriceCents: 34990,
    currency: "TRY",
    categoryId: 1, // Market
    locationId: 1, // Lefkoşa
    storeId: 1, // Erülkü
  },
  {
    title: "Koop Süt Taze Hellim 1 KG",
    description: "Lemar Ortaköy şubesinde taze gelen partide özel fiyat.",
    priceCents: 18900,
    originalPriceCents: 24000,
    currency: "TRY",
    categoryId: 1, // Market
    locationId: 1, // Lefkoşa
    storeId: 2, // Lemar
  },
  {
    title: "Öğle Menüsü: Tavuklu Wrap + İçecek + Patates",
    description: "Hafta içi 12:00 - 15:00 arası tüm şubelerde geçerli öğle yemeği fırsatı.",
    priceCents: 22000,
    originalPriceCents: 32000,
    currency: "TRY",
    categoryId: 2, // Restoran
    locationId: 2, // Girne
    storeId: 4, // Eziç
  },
  {
    title: "Large Boy Iced Latte Alana Cookie %50 İndirimli",
    description: "Lefkoşa Dereboyu şubesinde geçerlidir. Kampanya ay sonuna kadar devam ediyor.",
    priceCents: 14000,
    originalPriceCents: 21000,
    currency: "TRY",
    categoryId: 2, // Kafe
    locationId: 1, // Lefkoşa
    storeId: 6, // Gloria Jeans
  },
];

for (const d of sampleDeals) {
  const existing = sqlite.prepare("SELECT id FROM deals WHERE title = ?").get(d.title);
  if (!existing) {
    const inserted = sqlite
      .prepare(
        `INSERT INTO deals (author_id, title, description, price_cents, original_price_cents, currency, category_id, location_id, store_id, status)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
      )
      .run(
        d.title,
        d.description,
        d.priceCents,
        d.originalPriceCents,
        d.currency,
        d.categoryId,
        d.locationId,
        d.storeId
      );

    sqlite
      .prepare(
        `INSERT INTO price_entries (deal_id, price_cents, currency) VALUES (?, ?, ?)`
      )
      .run(inserted.lastInsertRowid, d.priceCents, d.currency);

    // Başlangıç oyları (+3 ve +5 upvote)
    sqlite
      .prepare(`INSERT OR IGNORE INTO votes (deal_id, user_id, value) VALUES (?, 1, 1)`)
      .run(inserted.lastInsertRowid);
  }
}

console.log("Seed tamamlandı: Konumlar, kategoriler, mağazalar ve örnek Kıbrıs fırsatları hazır.");
