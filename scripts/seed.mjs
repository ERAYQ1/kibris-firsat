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
  ["otomotiv", "Otomotiv & Yakıt", 9],
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
  { name: "Erülkü Süpermarket", normalized: "erulku supermarket", locationSlug: "lefkosa", phone: "0392 232 40 00", address: "Lefkoşa - Gazimağusa Anayolu, Demirhan", isVerified: 1 },
  { name: "Lemar Market (Ortaköy)", normalized: "lemar market ortakoy", locationSlug: "lefkosa", phone: "0392 223 66 00", address: "Ali Rıza Efendi Cad., Ortaköy, Lefkoşa", isVerified: 1 },
  { name: "Şokmar Girne", normalized: "sokmar girne", locationSlug: "girne", phone: "0392 815 12 34", address: "Karaoğlanoğlu Cad., Girne", isVerified: 1 },
  { name: "Eziç Premier Restoran", normalized: "ezic premier restoran", locationSlug: "girne", phone: "0392 815 88 88", address: "Uğur Mumcu Cad., Girne", isVerified: 1 },
  { name: "Önder AVM Mağusa", normalized: "onder avm magusa", locationSlug: "gazimagusa", phone: "0392 366 50 50", address: "İsmet İnönü Bulvarı, Gazimağusa", isVerified: 1 },
  { name: "Gloria Jean's Coffees", normalized: "gloria jeans coffees", locationSlug: "lefkosa", phone: "0392 228 10 10", address: "Mehmet Akif Cad. (Dereboyu), Lefkoşa", isVerified: 1 },
  { name: "Starling Süpermarket", normalized: "starling supermarket", locationSlug: "girne", phone: "0392 822 30 00", address: "Alsancak, Girne", isVerified: 1 },
  { name: "Sharaf Store Elektronik", normalized: "sharaf store elektronik", locationSlug: "lefkosa", phone: "0392 444 80 08", address: "Bedrettin Demirel Cad., Lefkoşa", isVerified: 1 },
  { name: "Mr. Pound Cyprus", normalized: "mr pound cyprus", locationSlug: "lefkosa", phone: "0392 223 99 99", address: "Taşkınköy, Lefkoşa", isVerified: 0 },
];

for (const s of storeList) {
  const loc = sqlite.prepare("SELECT id FROM locations WHERE slug = ?").get(s.locationSlug);
  if (loc) {
    sqlite
      .prepare(
        `INSERT INTO stores (name, normalized_name, location_id, phone, address, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(normalized_name, location_id) DO UPDATE SET phone=excluded.phone, address=excluded.address, is_verified=excluded.is_verified`
      )
      .run(s.name, s.normalized, loc.id, s.phone, s.address, s.isVerified);
  }
}

// Örnek Gerçekçi Kıbrıs Fırsatları
const sampleDeals = [
  {
    title: "5 Litre Yudum Ayçiçek Yağı İndirimi",
    description: "Erülkü Süpermarket haftalık katalog indirimi. Stoklarla sınırlı, kişi başı max 2 adet.",
    priceCents: 24990,
    originalPriceCents: 34990,
    currency: "TRY",
    categorySlug: "market",
    locationSlug: "lefkosa",
    storeName: "Erülkü Süpermarket",
    isVerified: 1,
    viewCount: 420,
    expiresAt: Math.floor(Date.now() / 1000) + 3 * 86400,
  },
  {
    title: "Koop Süt Taze Hellim 1 KG",
    description: "Lemar Ortaköy şubesinde taze gelen partide özel fiyat.",
    priceCents: 18900,
    originalPriceCents: 24000,
    currency: "TRY",
    categorySlug: "market",
    locationSlug: "lefkosa",
    storeName: "Lemar Market (Ortaköy)",
    isVerified: 1,
    viewCount: 310,
    expiresAt: Math.floor(Date.now() / 1000) + 5 * 86400,
  },
  {
    title: "Apple AirPods Pro 2. Nesil (Type-C)",
    description: "Sharaf Store Lefkoşa şubesinde sınırlı stokla resmi distribütör garantili dev indirim.",
    priceCents: 649900,
    originalPriceCents: 899900,
    currency: "TRY",
    categorySlug: "elektronik",
    locationSlug: "lefkosa",
    storeName: "Sharaf Store Elektronik",
    isVerified: 1,
    viewCount: 1250,
    expiresAt: Math.floor(Date.now() / 1000) + 4 * 86400,
  },
  {
    title: "Öğle Menüsü: Tavuklu Wrap + İçecek + Patates",
    description: "Hafta içi 12:00 - 15:00 arası tüm şubelerde geçerli öğle yemeği fırsatı.",
    priceCents: 22000,
    originalPriceCents: 32000,
    currency: "TRY",
    categorySlug: "restoran-kafe",
    locationSlug: "girne",
    storeName: "Eziç Premier Restoran",
    isVerified: 1,
    viewCount: 540,
    expiresAt: Math.floor(Date.now() / 1000) + 7 * 86400,
  },
  {
    title: "Large Boy Iced Latte Alana Cookie %50 İndirimli",
    description: "Lefkoşa Dereboyu şubesinde geçerlidir. Kampanya ay sonuna kadar devam ediyor.",
    priceCents: 14000,
    originalPriceCents: 21000,
    currency: "TRY",
    categorySlug: "restoran-kafe",
    locationSlug: "lefkosa",
    storeName: "Gloria Jean's Coffees",
    isVerified: 1,
    viewCount: 290,
    expiresAt: Math.floor(Date.now() / 1000) + 10 * 86400,
  },
  {
    title: "Starling İthal Kaşar Peyniri 500g",
    description: "Girne Alsancak şubesinde özel indirimli fiyat.",
    priceCents: 11500,
    originalPriceCents: 16500,
    currency: "TRY",
    categorySlug: "market",
    locationSlug: "girne",
    storeName: "Starling Süpermarket",
    isVerified: 0,
    viewCount: 180,
    expiresAt: Math.floor(Date.now() / 1000) + 2 * 86400,
  },
  {
    title: "Önder AVM Paşabahçe 6'lı Çay Bardağı Seti",
    description: "Gazimağusa şubesinde züccaciye reyonunda %40 indirim.",
    priceCents: 14900,
    originalPriceCents: 24900,
    currency: "TRY",
    categorySlug: "ev-yasam",
    locationSlug: "gazimagusa",
    storeName: "Önder AVM Mağusa",
    isVerified: 1,
    viewCount: 220,
    expiresAt: Math.floor(Date.now() / 1000) + 8 * 86400,
  },
  {
    title: "Şokmar Girne Mangal Kömürü 5 KG",
    description: "Hafta sonu mangal keyfi için özel parti meşe kömürü indirimi.",
    priceCents: 9900,
    originalPriceCents: 14500,
    currency: "TRY",
    categorySlug: "market",
    locationSlug: "girne",
    storeName: "Şokmar Girne",
    isVerified: 1,
    viewCount: 390,
    expiresAt: Math.floor(Date.now() / 1000) + 6 * 86400,
  },
];

for (const d of sampleDeals) {
  const cat = sqlite.prepare("SELECT id FROM categories WHERE slug = ?").get(d.categorySlug);
  const loc = sqlite.prepare("SELECT id FROM locations WHERE slug = ?").get(d.locationSlug);
  const st = sqlite.prepare("SELECT id FROM stores WHERE name = ?").get(d.storeName);

  if (cat && loc && st) {
    const existing = sqlite.prepare("SELECT id FROM deals WHERE title = ?").get(d.title);
    if (!existing) {
      const inserted = sqlite
        .prepare(
          `INSERT INTO deals (author_id, title, description, price_cents, original_price_cents, currency, category_id, location_id, store_id, status, is_verified, view_count, expires_at)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
        )
        .run(
          d.title,
          d.description,
          d.priceCents,
          d.originalPriceCents,
          d.currency,
          cat.id,
          loc.id,
          st.id,
          d.isVerified,
          d.viewCount,
          d.expiresAt
        );

      sqlite
        .prepare(
          `INSERT INTO price_entries (deal_id, price_cents, currency) VALUES (?, ?, ?)`
        )
        .run(inserted.lastInsertRowid, d.priceCents, d.currency);

      sqlite
        .prepare(`INSERT OR IGNORE INTO votes (deal_id, user_id, value) VALUES (?, 1, 1)`)
        .run(inserted.lastInsertRowid);
    }
  }
}

console.log("Seed başarıyla tamamlandı: 6 şehir, 10 kategori, 9 mağaza ve zengin Kıbrıs fırsatları hazır.");
