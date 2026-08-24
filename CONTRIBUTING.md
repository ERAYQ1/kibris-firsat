# Katkı Rehberi — Kıbrıs Fırsat

Katkılarınız için teşekkürler! Aşağıdaki kurallar inceleme sürecini hızlandırır.

## Geliştirme Ortamı

```bash
npm install
cp .env.example .env
npm run db:migrate && npm run db:seed
npm run dev
```

Node 20+ önerilir. Yerel SQLite dosyası (`data/`) repoya girmez.

## Dal Stratejisi

- `main` her zaman çalışır ve deploy edilebilir durumda olmalı.
- Özellikler için kısa ömürlü dal açın: `feat/ozet-kebab-case`, düzeltmeler için `fix/...`.
- Doğrudan `main`e push yapmayın; değişiklikleri PR ile getirin.

## Commit Kuralları

Conventional Commits biçimi kullanılır:

```
feat: fırsat aramaya mağaza filtresi ekle
fix: oy değiştirmede skor çift sayımı
test: IDOR senaryoları için kapsama ekle
docs: kurulum adımlarını güncelle
chore: bağımlılık yükseltmeleri
```

- Bir commit = tek amaç. Karışık değişiklikleri bölün.
- Commit öncesi `git diff` ile debug kodu, secret ve ilgisiz dosya tarayın.

## Pull Request Kuralları

PR açmadan önce:

1. `npm run typecheck` — hatasız geçmeli.
2. `npm run lint` — hatasız geçmeli.
3. `npm test` — tüm testler geçmeli (başarısız test skip edilmez).
4. Şema değişikliği varsa: `npm run db:generate` + migration SQL'i PR'a dahil edin,
   veri kaybı riski olan işlemleri PR açıklamasında belirtin.
5. UI değişikliği varsa: `npm run build` alın, mobil görünümü kontrol edin.

PR açıklamasında şunları belirtin: neyin değiştiği, neden değiştiği, nasıl doğrulandığı.

## Kod İncelemesi

İncelemede sırasıyla bakılır: doğruluk → güvenlik → test kapsamı → sürdürülebilirlik →
performans. Aşağıdakiler otomatik red sebebidir:

- Client'tan gelen `userId`, `role`, `status`, ownership alanlarına güvenen kod
- Server-side validasyonu atlayan yeni endpoint
- String birleştirmeyle kurulmuş SQL
- Secret içeren diff veya log'lanan parola/token
- Açıklamasız `any`, dead code, kullanılmayan import

## Testler

- Yeni servis davranışı → en az happy path + yetki reddi + edge case testi.
- Testler `tests/` altında, `:memory:` SQLite + gerçek migration ile yazılır.
- Hata veren test gizlenmez; ya düzeltilir ya davranış tartışılır.

## Güvenlik Sorunları

Güvenlik açığını **public issue olarak açmayın**. [SECURITY.md](SECURITY.md)'deki
bildirim kanalını kullanın.

## Hata Bildirimi

Issue'da şunları paylaşın: yeniden üretim adımları, beklenen/gerçekleşen davranış,
ortam bilgisi (OS, Node sürümü) ve varsa konsol çıktısı. Hassas veri (parola, token,
kişisel içerik) paylaşmayın.
