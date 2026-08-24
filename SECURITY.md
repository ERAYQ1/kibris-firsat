# Güvenlik Politikası

## Desteklenen Sürümler

| Sürüm | Destek |
| --- | --- |
| `main` dalı (güncel) | ✅ Güvenlik düzeltmeleri buraya gelir |
| Eski sürüm etiketleri | ❌ Desteklenmez |

## Zafiyet Bildirimi

Güvenlik açığı tespit ederseniz **public issue açmayın ve detayları paylaşmayın**.

Bildirim kanalı henüz ayrılmamış durumda; uydurma bir iletişim adresi vermek yerine
geçici olarak repodaki bir maintainer ile iletişime geçin. Kalıcı kanal
(security.txt / güvenlik e-postası) belirlendiğinde bu dosya güncellenecektir.

Bildiriminize şunları ekleyin:

- Açığın türü ve etkisi (örn. IDOR, XSS, yetkilendirme atlatma)
- Yeniden üretim adımları veya PoC
- Etkilenen endpoint/dosya
- Varsa önerilen çözüm

**Sorumlu açıklama:** Bildirim doğrulanana kadar açığın detaylarını public olarak
paylaşmayın. Doğrulanan zafiyetler için düzeltme yayınlanana kadar makul bir süre
(90 güne kadar) beklemenizi rica ederiz; katkınızda belirtilmenizi memnuniyetle karşılarız.

## Güvenlik Beklentileri (Tasarım Garantileri)

Bu proje aşağıdaki ilkelerle yazılır; bunları ihlal eden davranış bir zafiyettir:

1. Tüm input'lar server-side Zod ile doğrulanır; client'tan gelen kimlik/rol/sahiplik
   alanlarına asla güvenilmez.
2. SQL yalnızca Drizzle parametreli sorgularla kurulur.
3. Parolalar scrypt ile hash'lenir; session token'lar DB'de yalnızca SHA-256 özetiyle
   tutulur; cookie httpOnly + sameSite=lax (+ production'da secure) ayarlıdır.
4. Mutation endpoint'lerinde origin doğrulaması (CSRF) ve rate limit uygulanır.
5. Görsel yüklemelerde MIME magic-byte kontrolü, 5 MB sınırı ve rastgele UUID dosya adı
   kullanılır; orijinal dosya adına güvenilmez.
6. Hata yanıtlarında stack trace, SQL, dosya yolu veya env değeri sızmaz.
7. IDOR'a karşı sahiplik kontrolleri servis katmanında yapılır.

## Secret Yönetimi

- Secret'lar yalnızca `.env` içinde tutulur; `.env` repoya girmez (`.gitignore`).
- Repoda secret tespit ederseniz derhal bildirin; ilgili credential rotate edilmelidir.
- `.env.example` yalnızca açıklama ve örnek değer içerir.

## Bağımlılık Güvenliği

- Yeni bağımlılık eklerken gerekçesi CONTRIBUTING.md'deki kurala göre değerlendirilir:
  framework sağlıyor mu → mevcut dep sağlıyor mu → stdlib/native yeterli mi.
- Bilinen zafiyeti olan sürümler kullanılmaz; `npm audit` çıktısı PR'larda göz önünde
  bulundurulur.
