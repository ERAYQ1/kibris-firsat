# CONTEXT.md — Kıbrıs Fırsat Domain Glossary

Ubiquitous domain model and shared terminology for Kıbrıs Fırsat codebase.

## 1. Core Domain Concepts

### Deal (Fırsat)
- An active or past price reduction/promotional offer for a product or service in Northern Cyprus.
- **Status Lifecycle**: `active` (yayında/geçerli), `expired` (süresi dolmuş), `sold_out` (stok bitmiş), `hidden` (gizlenmiş/admin tarafından kaldırılmış).
- **Monetary Model**: Integer kuruş/cents (e.g. `24990` = ₺249,90). Currency enum: `TRY`, `GBP`, `EUR`. No floating-point math.

### Store (İşletme / Mağaza)
- Physical or online retail, supermarket, cafe, or service business operating in Northern Cyprus.
- May carry an `isVerified` badge indicating a community-trusted or authenticated merchant.

### Location (Konum / Şehir)
- The 6 official administrative districts of Northern Cyprus:
  1. `Lefkoşa`
  2. `Girne`
  3. `Gazimağusa`
  4. `Güzelyurt`
  5. `İskele`
  6. `Lefke`

### Category (Kategori)
- High-level taxonomy for filtering: Market, Restoran, Kafe, Elektronik, Giyim, Kozmetik, Otomotiv, Ev & Yaşam, Eğlence, Hizmet, Seyahat, Eğitim, Diğer.

### Verification (Topluluk Teyidi)
- Crowdsourced real-time status confirmations (`active`, `expired`, `sold_out`, `wrong_price`).

### Vote & Score (Oy & Sıcaklık)
- Single-vote per user per deal (+1 or -1). Sum is the net vote score.

### User & Session (Kullanıcı & Oturum)
- Roles: `user` (standart üye), `admin` (yönetici/moderatör).
- Session: SHA-256 hashed token stored in SQLite `sessions`, delivered via httpOnly cookie.
