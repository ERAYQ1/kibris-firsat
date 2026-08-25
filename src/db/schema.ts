import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

export const users = sqliteTable(
  "users",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    email: text({ length: 254 }).notNull(),
    passwordHash: text().notNull(),
    displayName: text({ length: 40 }).notNull(),
    role: text({ enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    avatar: text({ length: 120 }),
    bio: text({ length: 300 }),
    isBanned: integer().notNull().default(0),
    createdAt: integer().notNull().default(now),
  },
  (t) => [unique().on(t.email)]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text({ length: 64 }).notNull(),
    expiresAt: integer().notNull(),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique().on(t.tokenHash),
    index("idx_sessions_user").on(t.userId),
    index("idx_sessions_expires").on(t.expiresAt),
  ]
);

export const categories = sqliteTable(
  "categories",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    slug: text({ length: 60 }).notNull(),
    name: text({ length: 80 }).notNull(),
    sortOrder: integer().notNull().default(0),
  },
  (t) => [unique().on(t.slug)]
);

export const locations = sqliteTable(
  "locations",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    slug: text({ length: 60 }).notNull(),
    name: text({ length: 80 }).notNull(),
    parentId: integer(),
    sortOrder: integer().notNull().default(0),
  },
  (t) => [unique().on(t.slug)]
);

export const stores = sqliteTable(
  "stores",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text({ length: 80 }).notNull(),
    normalizedName: text({ length: 80 }).notNull(),
    locationId: integer()
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    phone: text({ length: 30 }),
    address: text({ length: 200 }),
    isVerified: integer().notNull().default(0),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique("uq_store_per_location").on(t.normalizedName, t.locationId),
    index("idx_stores_location").on(t.locationId),
  ]
);

export const deals = sqliteTable(
  "deals",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    authorId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text({ length: 120 }).notNull(),
    description: text({ length: 2000 }),
    priceCents: integer().notNull(),
    originalPriceCents: integer(),
    currency: text({ enum: ["TRY", "GBP", "EUR"] }).notNull(),
    categoryId: integer()
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    locationId: integer()
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    storeId: integer()
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    status: text({
      enum: ["active", "expired", "sold_out", "hidden", "rejected", "reported", "removed"],
    })
      .notNull()
      .default("active"),
    viewCount: integer().notNull().default(0),
    tags: text({ length: 200 }),
    contactInfo: text({ length: 100 }),
    isVerified: integer().notNull().default(0),
    expiresAt: integer(),
    createdAt: integer().notNull().default(now),
    updatedAt: integer().notNull().default(now),
  },
  (t) => [
    check("chk_price_positive", sql`${t.priceCents} > 0`),
    check(
      "chk_status_valid",
      sql`${t.status} IN ('active','expired','sold_out','hidden','rejected','reported','removed')`
    ),
    index("idx_deals_status_created").on(t.status, t.createdAt),
    index("idx_deals_category").on(t.categoryId),
    index("idx_deals_location").on(t.locationId),
    index("idx_deals_store").on(t.storeId),
    index("idx_deals_author").on(t.authorId),
    index("idx_deals_expires").on(t.expiresAt),
  ]
);

export const dealImages = sqliteTable(
  "deal_images",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    filename: text({ length: 80 }).notNull(),
    sortOrder: integer().notNull().default(0),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique().on(t.filename),
    index("idx_deal_images_deal").on(t.dealId),
  ]
);

export const votes = sqliteTable(
  "votes",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: integer().notNull(),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique("uq_vote_user_deal").on(t.userId, t.dealId),
    index("idx_votes_deal").on(t.dealId),
    check("chk_vote_value", sql`${t.value} IN (-1, 1)`),
  ]
);

export const favorites = sqliteTable(
  "favorites",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique("uq_favorite_user_deal").on(t.userId, t.dealId),
    index("idx_favorites_user").on(t.userId),
    index("idx_favorites_deal").on(t.dealId),
  ]
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text({ length: 120 }).notNull(),
    message: text({ length: 500 }).notNull(),
    link: text({ length: 200 }),
    isRead: integer().notNull().default(0),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    index("idx_notifications_user").on(t.userId, t.createdAt),
  ]
);

export const dealVerifications = sqliteTable(
  "deal_verifications",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text({ enum: ["verified_active", "sold_out", "wrong_price"] }).notNull(),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique("uq_verification_user_deal").on(t.userId, t.dealId),
    index("idx_verifications_deal").on(t.dealId),
  ]
);

export const reports = sqliteTable(
  "reports",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text({
      enum: [
        "fake",
        "wrong_price",
        "expired",
        "wrong_location",
        "wrong_store",
        "spam",
        "inappropriate",
      ],
    }).notNull(),
    details: text({ length: 500 }),
    status: text({ enum: ["open", "resolved", "dismissed"] })
      .notNull()
      .default("open"),
    resolvedBy: integer().references(() => users.id, { onDelete: "set null" }),
    resolvedAt: integer(),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    unique("uq_report_user_deal").on(t.userId, t.dealId),
    index("idx_reports_status").on(t.status, t.createdAt),
    index("idx_reports_deal").on(t.dealId),
  ]
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text({ length: 1000 }).notNull(),
    createdAt: integer().notNull().default(now),
  },
  (t) => [
    index("idx_comments_deal").on(t.dealId, t.createdAt),
    index("idx_comments_user").on(t.userId),
  ]
);

export const priceEntries = sqliteTable(
  "price_entries",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    dealId: integer()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    priceCents: integer().notNull(),
    currency: text({ enum: ["TRY", "GBP", "EUR"] }).notNull(),
    recordedAt: integer().notNull().default(now),
  },
  (t) => [index("idx_price_entries_deal").on(t.dealId, t.recordedAt)]
);

export const userRelations = relations(users, ({ many }) => ({
  deals: many(deals),
  favorites: many(favorites),
  notifications: many(notifications),
  comments: many(comments),
}));

export const dealRelations = relations(deals, ({ one, many }) => ({
  author: one(users, { fields: [deals.authorId], references: [users.id] }),
  category: one(categories, {
    fields: [deals.categoryId],
    references: [categories.id],
  }),
  location: one(locations, {
    fields: [deals.locationId],
    references: [locations.id],
  }),
  store: one(stores, { fields: [deals.storeId], references: [stores.id] }),
  images: many(dealImages),
  comments: many(comments),
  favorites: many(favorites),
  verifications: many(dealVerifications),
}));

export const storeRelations = relations(stores, ({ one, many }) => ({
  location: one(locations, { fields: [stores.locationId], references: [locations.id] }),
  deals: many(deals),
}));

export const favoriteRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  deal: one(deals, { fields: [favorites.dealId], references: [deals.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  deal: one(deals, { fields: [comments.dealId], references: [deals.id] }),
  author: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Store = typeof stores.$inferSelect;
