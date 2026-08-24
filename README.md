# Kıbrıs Fırsat

Kıbrıs'ta yaşayanların uygun fiyatlı ürün, hizmet ve kampanyaları birbirleriyle
paylaştığı; topluluk oyu ve raporuyla doğrulandığı bir **fırsat keşif platformu**.

> Bu bir ilan sitesi değildir: keşif + paylaşım + topluluk doğrulaması + fiyat takibi.

## Problem

Kıbrıs'ta güncel fiyat bilgisi dağınık ve güvenilmez. Market/kampanya fırsatları
sosyal medyada kayboluyor, doğrulanamıyor ve fiyatlar zaman içinde takip edilemiyor.

## Çözüm

- Kullanıcı gördüğü fırsatı (ürün, fiyat, mağaza, konum, geçerlilik) paylaşır.
- Topluluk 👍/👎 oylarıyla fırsatın kalitesini işaretler.
- Yanıltıcı içerik raporlama akışıyla moderatör denetimine düşer.
- Her ilan fiyat geçmişine kaydedilir; zamanla ürün bazlı fiyat takibi mümkün olur.
- Süresi geçen fırsatlar otomatik `expired` durumuna geçer ve aktif akışta gösterilmez.

## Özellikler (MVP)

- E-posta/şifre ile kayıt-giriş (scrypt hash, DB session, httpOnly cookie)
- Fırsat oluşturma (başlık, açıklama, fiyat kuruş bazlı, TRY/GBP/EUR, kategori,
  konum, mağaza, geçerlilik tarihi)
- Liste + arama (başlık/mağaza/kategori) + konum & kategori filtresi + sayfalama
- Fırsat detayı, topluluk skoru, oy verme/geri çekme
- Raporlama (sahte, yanlış fiyat, spam vb. 7 neden) + admin moderasyon paneli
  (fırsatı kaldır / raporu reddet)
- Güvenli görsel yükleme (magic-byte MIME kontrolü, 5 MB sınırı, UUID dosya adı)
- Otomatik süre bitirme (`expireDueDeals`), fiyat geçmişi kaydı
- Temel rol modeli: `user` / `admin` (ADMIN_EMAILS ile bootstrap)

## Teknoloji

| Katman | Seçim | Neden |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript strict | Full-stack tek repo, SSR, tip güvenliği |
| Veritabanı | SQLite + Drizzle ORM | Zero-config, parametreli sorgu, taşınabilir migration |
| Stil | Tailwind CSS v4 | Hızlı, tutarlı, minimal UI |
| Validasyon | Zod | Server-side şema doğrulama |
| Auth | Node stdlib `crypto.scrypt` | Ek dependency olmadan güvenli hash |
| Test | Vitest | Hızlı, `:memory:` SQLite ile gerçek entegrasyon testi |

## Mimari

```
src/
  db/schema.ts     # Drizzle şeması (users, sessions, categories, locations,
                   #  stores, deals, deal_images, votes, reports, price_entries)
  lib/             # Saf yardımcılar: validation, password, rate-limit, format…
  server/          # Servis katmanı: auth.ts, deals.ts, images.ts, meta.ts
  app/api/         # İnce route handler'lar (cookie → servis → hata map)
  app/             # Sayfalar: ana akış, /firsat/[id], /firsat/yeni, /giris, /admin
  components/      # Client bileşenleri: formlar, oy, rapor
tests/             # Vitest entegrasyon testleri (:memory: DB + gerçek migration)
drizzle/           # Üretilmiş SQL migration'ları
scripts/           # migrate.mjs, seed.mjs
```

İş mantığı HTTP'den bağımsız servis fonksiyonlarında durur (`db` parametre alır);
route handler'lar yalnızca orkestrasyon yapar.

## Kurulum

```bash
npm install
cp .env.example .env        # değerleri gerektiği gibi düzenleyin
npm run db:migrate
npm run db:seed             # 5 şehir + 9 kategori
npm run dev                 # http://localhost:3000
```

Admin yapmak için `.env` içinde `ADMIN_EMAILS=sen@ornek.com` tanımlayın ve o e-postayla
kayıt olun (ilk kayıt anında rol atanır).

## Environment Değişkenleri

`.env.example` dosyasına bakın: `DATABASE_PATH`, `UPLOAD_DIR`, `ADMIN_EMAILS`, `APP_URL`.
Gerçek secret repoya yazılmaz.

## Geliştirme

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest run (95+ test)
npm run build       # production build
```

Şema değişikliğinde: `schema.ts` → `npm run db:generate` → üretilen SQL'i incele →
`npm run db:migrate`.

## Test

Testler gerçek migration'larla kurulan `:memory:` SQLite üzerinde çalışır; mock DB yoktur.
Kapsam önceliği: authentication → authorization/IDOR → deal creation → voting/reporting →
expiration. Edge case'ler (boş/geçersiz input, tekrarlı istek, yetkisiz erişim, boundary
değerler) dahildir.

## Deployment Notları

- Production'da `NODE_ENV=production`: cookie `secure` bayrağı alır, hata detayları gizlenir.
- `DATABASE_PATH` ve `UPLOAD_DIR` kalıcı volume'a işaret etmeli; SQLite yedeği dosya
  kopyasıyla alınabilir.
- Statik dosya/image servisi uygulama içinde `/api/images/*` üzerinden yapılır;
  yüksek trafikte CDN/object storage'a taşınması planlanmalıdır.
- Rate limit MVP'de in-memory'dir; çok instance'lı kurulumda Redis benzeri paylaşımlı
  store gerekir.

## Güvenlik

Güvenlik açığı bildirimleri için [SECURITY.md](SECURITY.md)'ye bakın.

## Yol Haritası

Fiyat karşılaştırma görünümleri, kullanıcı alert'leri ("1000 TL altı kulaklık"),
e-posta/Telegram bildirimleri, itibar sistemi ve gelişmiş arama MVP sonrası planlanmıştır.
Mevcut olmayan özellikler dokümantasyonda var gibi gösterilmez.

## Katkı

[CONTRIBUTING.md](CONTRIBUTING.md) kurallarını okuyun.

## Lisans

[MIT](LICENSE)
