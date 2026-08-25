# CLAUDE.md — Kıbrıs Fırsat

Claude Code için çalışma kuralları. Tam bağlam için `AGENTS.md` ve `ARCHITECTURE.md`
temel referanslardır; bu dosya onlarla çelişmez, sadece Claude'a özgü davranış disiplinini zorunlu kılar.

## Zorunlu Davranışlar

1. **Inspect before modify:** Herhangi bir dosyayı değiştirmeden önce güncel halini oku.
   Bellekte kalan eski içerikle çalışma.
2. **Search before create:** Yeni dosya/bileşen/fonksiyon yazmadan önce benzerini ara
   (Grep/Glob). Var olanı genlet, kopya oluşturma.
3. **Reuse before duplicate:** Ortak mantık (validasyon, format, hata tipleri) `src/lib`
   ve `src/server` altındadır; yeniden yazma.
4. **Minimal changes:** İstenen görevle ilgisiz refactor, rename, yeniden biçimlendirme yapma.
5. **Secure implementation:** Güvenlik kuralları AGENTS.md §Güvenlik Kuralları'dır.
   Client'tan gelen kritik alanlara güvenme; tüm input'u server-side doğrula.
6. **Test before completion:** Görev bitmeden ilgili testleri çalıştır
   (`npm test`, servis bazında yeni test ekle).
7. **Verify build:** Geniş değişimde sırayla: `npm run typecheck && npm run lint && npm test`.
   UI/şema değişiminde ayrıca `npm run build`. Şema değişiminde `db:generate` + migration incele.
8. **Inspect git diff:** Commit öncesi ve iş sonunda `git status` + `git diff` tara:
   debug kodu, console.log, secret, ilgisiz dosya.
9. **Never claim unverified success:** Çalıştırmadığın/doğrulamadığın hiçbir şeyi
   "çalışıyor", "tamamlandı" diye raporlama; doğrulanamayanı açıkça belirt.

## Hızlı Komut Referansı

```bash
npm run dev | build | start
npm test            # vitest run
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run db:generate # schema → migration
npm run db:migrate  # migration uygula
npm run db:seed     # kategori+konum seed
```

## Proje Yapısı Özeti

- İş mantığı `src/server/*.ts` servislerinde (`db` parametreli, HTTP'siz test edilebilir).
- Route handler'lar ince: cookie oku → servis çağır → `handleApiError` ile hata map'le.
- Şema `src/db/schema.ts`; migration'lar `drizzle/` (elle düzenlenmez).
- Testler `tests/`, `:memory:` SQLite + gerçek migration'larla.
