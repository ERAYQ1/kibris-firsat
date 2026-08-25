# AGENTS.md — Kıbrıs Fırsat

Coding agent'lar (OpenCode, Claude Code vb.) için ana çalışma kuralları.

## Proje Özeti

Kıbrıs Fırsat: Kıbrıs'taki kullanıcıların uygun fiyatlı ürün/hizmet fırsatlarını
paylaştığı, topluluk oyu ve raporuyla doğrulandığı bir fırsat keşif platformu.
İlan sitesi değil; **keşif + paylaşım + topluluk doğrulaması + fiyat takibi** ürünüdür.

## Stack

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 15 (App Router, React 19, TypeScript strict) |
| Veritabanı | SQLite + Drizzle ORM (`casing: snake_case`) |
| Stil | Tailwind CSS v4 |
| Validasyon | Zod (server-side, her input) |
| Auth | Node `crypto.scrypt` + DB session token + httpOnly cookie |
| Test | Vitest (node ortamı, :memory: SQLite) |

Ek dependency eklemeden önce sırayla: framework sağlıyor mu → mevcut dep sağlıyor mu → stdlib/native yeterli mi?

## Mimari

```
src/
  db/schema.ts        # Drizzle şeması — tek doğruluk kaynağı
  lib/                # Saf yardımcılar (validation, password, format, rate-limit…)
  server/             # Sunucu katmanı: db, auth, deals, meta, images servisleri
    auth.ts           #   register/login/session/requireUser/requireAdmin
    deals.ts          #   CRUD, listeleme, oy, rapor, expire
  app/api/            # Route handler'lar İNCE kalır: cookie oku → servisi çağır → hata map'le
  app/                # Sayfalar (server component), /firsat/[id] vb.
  components/         # Client bileşenler (form, vote, report)
tests/                # Vitest — servis seviyesi entegrasyon testleri (:memory: DB)
scripts/              # migrate.mjs, seed.mjs (plain node ESM)
drizzle/              # Üretilmiş migration SQL — elle DÜZENLEME
```

**Servis deseni:** iş mantığı `src/server/*.ts` içinde, `db` parametresiyle çalışır.
Route handler'lar ve sayfalar sadece orkestrasyon yapar. Bu, HTTP olmadan test yazılmasını sağlar.

## Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run
npm run db:migrate   # migrasyonları uygula
npm run db:seed      # kategori + konum tohumla
npm run db:generate  # schema değişince migration üret
```

## Kod Standartları

- TypeScript strict; `any` yasak, gereksizse `unknown` + daraltma.
- Yorum yok (kod kendini açıklamalı); karmaşık güvenlik kararı dışında yorum yazma.
- Magic value yok → sabitlere çıkar. Dead code, kullanılmayan import bırakma.
- Fonksiyonlar küçük ve tek amaçlı; UI Türkçe, kod İngilizce isimlendirme.
- Route handler'da try/catch + `handleApiError` tek pattern. Hatalar sessizce yutulmaz.

## Güvenlik Kuralları (ihlal = red)

1. **Tüm input server-side Zod ile doğrulanır.** Client'tan gelen `userId`, `role`,
   `status`, ownership gibi alanlar ASLA güvenilir değildir; author/session'dan alınır.
2. **SQL:** sadece Drizzle parametreli sorgular. String birleştirme ile SQL kurulmaz.
3. **Auth:** scrypt hash, timingSafeEqual. Session token DB'de SHA-256 olarak tutulur,
   cookie httpOnly+sameSite=lax+secure(prod). Login'de eski session rotate edilir.
4. **Authorization:** mutation'larda `requireUser`/`requireAdmin`; sahiplik kontrolü serviste.
5. **Mutation endpoint'lerde** `assertSameOrigin` (CSRF) + rate limit zorunlu.
6. **Upload:** MIME magic-byte doğrulaması (JPEG/PNG/WebP), max 5 MB, rastgele UUID dosya adı,
   original filename asla kullanılmaz. Servis eden route nosniff + sabit Content-Type döner.
7. **Hata response'unda** stack trace, SQL, dosya yolu, env değeri gösterilmez.
8. **Loglama:** password/token/secret log'lanmaz.
9. Secret kaynak koda veya repoya yazılamaz; `.env.example` güncel tutulur.

## Veritabanı Kuralları

- Şema değişikliği: `schema.ts` düzenle → `db:generate` → migration'ı incele → `db:migrate`.
- Migration dosyaları commit sonrası düzenlenmez; geri alınamaz işlem (DROP, tip değişimi)
  içeren migration'da veri kaybı analizi yapmadan push etme.
- FK'lar explicit ON DELETE davranışı belirtir (cascade: votes/reports/sessions/images;
  restrict: users→deals). Yeni tabloda index + unique constraint düşün.
- Para **kuruş (integer)** saklanır; float kullanma. Currency enum: TRY, GBP, EUR.
  Otomatik kur dönüşümü yapılmaz.

## Test Kuralları

- Yeni servis fonksiyonu → en az happy path + yetki/red + edge case testi.
- Testler `:memory:` DB + gerçek migration'larla çalışır; mock DB yok.
- Öncelik: auth > authorization/IDOR > deal creation > voting/reporting > expiration.
- Değişiklikten sonra en az `npm test` + `npm run typecheck`; geniş değişimde lint + build.
- Başarısız test gizlenmez; skip/todo bırakılmaz.

## Git Kuralları

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Commit öncesi `git diff` ile debug kodu, secret, ilgisiz dosya tara.
- Force push ve history rewrite yasak. `.env`, `data/`, `node_modules/` commit edilemez.

## Agent İş Akışı

ANALYZE → PLAN → IMPLEMENT → TEST → REVIEW → FIX → VERIFY

1. Değiştirmeden önce ilgili dosyayı oku; benzer çözüm varsa yeniden yazma.
2. Minimal diff; çalışan kodu sebepsiz değiştirme; istenmeyen dosya dokunma.
3. Bitirmede: ilgili test/typecheck/lint/build çalıştır, sonucu raporla.
4. Doğrulanmamış şeyi "çalışıyor" diye raporlama. Öncelik:
   CORRECTNESS > SECURITY > TESTING > MAINTAINABILITY > PERFORMANCE > TOKEN EFFICIENCY.

## Definition of Done

- [ ] Implementasyon tamamlandı, security maddeleri kontrol edildi
- [ ] İlgili testler geçti (sayısıyla birlikte raporlandı)
- [ ] typecheck geçti; kapsam gerektiriyorsa lint + build geçti
- [ ] Secret eklenmedi; gereksiz dependency eklenmedi
- [ ] İlgisiz dosya değişmedi; `git status`/`git diff` kontrol edildi
- [ ] Gerekliyse dokümantasyon güncellendi

## Agent Skills

### Issue tracker
GitHub Issues (`ERAYQ1/kibris-firsat`). See `docs/agents/issue-tracker.md`.

### Domain docs
Single-context (`src/`, `src/db/schema.ts`, `src/server/`). See `docs/agents/domain.md`.

## MCP Servers (`.agents/mcp_config.json`, `mcp.json`)

1. **GitHub MCP (`@modelcontextprotocol/server-github`)**: Repo inceleme, PR, issue ve dosya yönetimi.
2. **Context7 MCP (`@upstash/context7-mcp`)**: Güncel framework (Next.js 15, React 19, Drizzle, Tailwind v4) dokümantasyonu çekme.
3. **Playwright MCP (`@playwright/mcp@latest`)**: E2E tarayıcı otomasyonu, sayfa doğrulama ve UI testleri.


