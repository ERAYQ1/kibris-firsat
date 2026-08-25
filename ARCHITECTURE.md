# ARCHITECTURE.md — Kıbrıs Fırsat

Bu belge, **Kıbrıs Fırsat** uygulamasının mimari yapısını, güvenlik katmanlarını, veri modellerini ve servis kalıplarını özetler. LLM / Claude Code için hızlı ve token-tasarruflu başvuru kaynağıdır.

---

## 1. Mimari Katmanlar ve Sorumluluklar

```
Client (Browser)
   ↓ HTTP Request (Cookies, JSON, FormData)
Route Handlers (`src/app/api/**/route.ts`)
   ├─ 1. Origin (CSRF) Doğrulaması (`assertSameOrigin`)
   ├─ 2. Rate Limiting (`rateGuard`)
   ├─ 3. Input Doğrulama (`src/lib/validation.ts` - Zod .strict())
   ├─ 4. Session/Auth Çözümleme (`getCurrentUser`)
   └─ 5. Hata Yakalama (`handleApiError`)
         ↓
Service Layer (`src/server/*.ts`)
   ├─ `auth.ts`         → Kayıt, giriş, oturum yönetimi, şifreleme
   ├─ `deals.ts`        → Fırsat CRUD, oylama (+1/-1), raporlama, süre dolumu
   ├─ `images.ts`       → MIME magic-byte doğrulama, güvenli disk yazma/okuma
   ├─ `meta.ts`         → Kategori, konum ve mağaza sorguları
   └─ `db.ts`           → SQLite bağlantısı ve Drizzle instance
         ↓
Database (`src/db/schema.ts` / SQLite / Drizzle ORM)
```

---

## 2. Temel Tasarım İlkeleri & Servis Kalıbı

1. **İnce Route Handler (Thin Orchestrators):**
   - Route handler'lar iş mantığı İÇERMEZ. Sadece cookie okur, input doğrular, ilgili servisi çağırır ve yanıtı döner.
2. **Saf & Test Edilebilir Servisler:**
   - `src/server/*.ts` fonksiyonları parametre olarak `db` (Drizzle client) kabul eder.
   - Bu sayede testler (`tests/*.test.ts`) HTTP sunucusuna ihtiyaç duymadan, gerçek migration'lar uygulanmış `:memory:` SQLite üzerinde çalışır.
3. **Parasal Değerler (Financial Invariant):**
   - Para miktarları ASLA float olarak tutulmaz; daima **kuruş cinsinden tam sayı (`priceCents: integer`)** olarak saklanır.
   - Para birimleri enum: `TRY`, `GBP`, `EUR`. Otomatik kur dönüşümü yapılmaz.

---

## 3. Veritabanı Şeması İlişkileri (10 Tablo)

- **`users`**: `id`, `email` (unique), `passwordHash` (scrypt), `displayName`, `role` (`user` | `admin`), `createdAt`.
- **`sessions`**: `id`, `userId` (FK -> users, CASCADE), `tokenHash` (SHA-256 unique), `expiresAt`, `createdAt`.
- **`categories`**: `id`, `slug` (unique), `name`, `sortOrder`.
- **`locations`**: `id`, `slug` (unique), `name`, `parentId`, `sortOrder`.
- **`stores`**: `id`, `name`, `normalizedName`, `locationId` (FK -> locations, RESTRICT), unique(`normalizedName`, `locationId`).
- **`deals`**: `id`, `authorId` (FK -> users), `title`, `description`, `priceCents`, `currency`, `categoryId`, `locationId`, `storeId`, `status` (`active` | `expired` | `reported` | `removed`), `expiresAt`, `createdAt`, `updatedAt`.
- **`dealImages`**: `id`, `dealId` (FK -> deals, CASCADE), `filename` (UUID unique), `sortOrder`.
- **`votes`**: `id`, `dealId` (FK -> deals, CASCADE), `userId` (FK -> users, CASCADE), `value` (-1 veya +1), unique(`userId`, `dealId`).
- **`reports`**: `id`, `dealId` (FK -> deals, CASCADE), `userId` (FK -> users, CASCADE), `reason`, `details`, `status` (`open` | `resolved` | `dismissed`), `resolvedBy`, `resolvedAt`.
- **`priceEntries`**: `id`, `dealId` (FK -> deals, CASCADE), `priceCents`, `currency`, `recordedAt`.

---

## 4. Güvenlik ve Yetkilendirme Modeli

- **Parola Güvenliği:** Node `crypto.scrypt` + rastgele 16 bayt salt + sabit zamanlı karşılaştırma (`timingSafeEqual`).
- **Oturum Yönetimi:** 
  - Token istemcide `httpOnly`, `sameSite=lax`, `path=/` çerezinde tutulur.
  - Veritabanında ise sadece token'ın `SHA-256` özeti saklanır.
  - Login/Register işlemlerinde eski oturumlar kapatılır ve token rotate edilir.
- **CSRF Koruması:** Mutation (POST, PUT, DELETE) içeren tüm endpoint'lerde `assertSameOrigin(req)` zorunludur.
- **Rate Limiting:** IP veya kullanıcı token'ı bazlı in-memory token-bucket algoritması (`src/lib/rate-limit.ts`).
- **IDOR Koruması:** Fırsat silme, güncelleme ve rapor çözümleme yetkileri doğrudan servis katmanında (`authorId === user.id` veya `user.role === 'admin'`) kontrol edilir.
- **Görsel Güvenliği:**
  - MIME türü dosya uzantısına göre değil, dosyanın ilk baytlarına (Magic Bytes: JPEG, PNG, WebP) bakılarak doğrulanır.
  - Maksimum dosya boyutu: 5 MB.
  - Dosyalar diskte rastgele üretilen UUID ile saklanır; orijinal dosya adı asla kullanılmaz.
  - Servis edilirken `X-Content-Type-Options: nosniff` başlığı eklenir.

---

## 5. Hata Yönetimi Standardı

Tüm route handler'lar tek bir hata yakalama mekanizmasını kullanır:
- Servis katmanında `AppError` (`NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `ValidationError`) fırlatılır.
- Route handler `catch (err)` bloğunda `handleApiError(err)` çağırır.
- Yanıt formatı: `{ error: { code: string, message: string } }` (HTTP status code ile birlikte).
- Stack trace, SQL sorguları veya sunucu dizinleri dışarıya ASLA sızdırılmaz.
