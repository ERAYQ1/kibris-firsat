---
name: sqlite-perf-pack
description: SQLite performance guidelines, indexing, and connection flags.
---

SQLite & Drizzle Performance Rules:
- PRAGMAs: `journal_mode = WAL`, `synchronous = NORMAL`, `foreign_keys = ON`, `busy_timeout = 5000`.
- Indexes: Add composite index on any query with filter + sort (e.g. `idx_deals_status_created`).
- Pagination: Cursor-based `where(and(eq(status, 'active'), lt(createdAt, cursor)))` over offset.
- Projections: Select only needed columns when returning lists.
