# ADR-0020: Hesap e-postası teslimi ve break-glass recovery

- **Status:** Accepted
- **Date:** 2026-09-06
- **Owners / approvers:** User approved Option A on 2026-09-06; named security/operations owner TBD
- **Supersedes / superseded by:** Extends ADR-0008; does not change ADR-0018 session policy
- **Related:** BL-011, CR-015, ADR-0004, ADR-0008, ADR-0017, ADR-0018

## Context

Mevcut davet ve yönetici tarafından başlatılan parola sıfırlama akışları güvenli,
tek kullanımlık ham tokenı yalnız oluşturma yanıtında yetkili yöneticiye döndürür.
Repository'de e-posta taşıyıcısı, public kabul/reset frontend rotası veya teslimat
durumu yoktur. Bu nedenle tokenın hedef kullanıcıya out-of-band aktarımı tamamen
operatör sorumluluğundadır ve mailbox sahipliği doğrulanmaz.

Kök `ensure-admin.js`, yalnız hiç `SYSTEM_ADMIN` satırı yokken ilk yöneticiyi
oluşturur. Mevcut sistem yöneticilerinin parolası kaybolur veya tamamı askıya
alınırsa authenticated recovery yolu yoktur. Uygulama içinden anonim self-service
reset eklemek ise enumeration, abuse ve teslimat bağımlılığını genişletir.

Provider, production domain, bütçe, veri bölgesi ve operasyon sahibi `TBD`dir.
Karar bunları tahmin etmeden vendor-neutral bir taşıma ve fail-closed operasyon
sınırı tanımlamalıdır.

## Decision — Option A

### Delivery modes and API

- `ACCOUNT_DELIVERY_MODE=operator|smtp` kullanılsın. Development/test varsayılanı
  `operator`; production yalnız `smtp` ile başlayabilsin. Bilinmeyen değer veya
  eksik zorunlu SMTP/public-URL girdisi startup'ı fail-closed durdursun.
- `operator` modu mevcut admin-only tek-seferlik token yanıtını korusun, bütün token
  yanıtlarına `Cache-Control: no-store` eklensin ve production'da reddedilsin.
- `smtp` modu vendor-neutral bir delivery port ve SMTP adapter kullansın. Ham token
  JSON yanıtına, DB'ye, audit metadata'sına veya loga yazılmasın. Provider marka ve
  hesap seçimi ayrı M4 girdisi olarak `TBD` kalsın.
- Davet ve reset oluşturma transaction'ı tamamlandıktan sonra mesaj senkron olarak
  SMTP sunucusuna teslim edilsin. Teslim reddi veya timeout'ta yeni token revoke
  edilsin ve istemci cause-free generic `503` alsın. Retry yeni token üretip önceki
  açık tokenları mevcut ADR-0008 davranışıyla revoke etsin.
- SMTP kabulü inbox teslim garantisi olarak sunulmasın. Bounce/complaint webhook'u,
  provider dashboard'u ve uzun süreli delivery event retention'ı `TBD` kalsın.

### Public completion pages

- Frontend'e authentication gerektirmeyen `/accept-invitation` ve
  `/reset-password` rotaları eklensin; yalnız mevcut public completion API'lerini
  kullansın.
- E-posta linkleri tokenı URL fragment'ında taşısın. SPA tokenı belleğe aldıktan
  sonra fragment'ı history'den hemen temizlesin; token telemetry, console, error
  message, storage veya referrer'a yazılmasın. Sayfalar `no-referrer` ve görünür
  success/error/retry durumları kullansın.
- Invitation e-postasının alınması mailbox erişimi için MVP verification kanıtı
  sayılsın. Anonim “parolamı unuttum” veya kullanıcı-enumerating endpoint eklenmesin;
  normal password reset hâlen yetkili admin tarafından başlatılsın.

### Break-glass system-admin recovery

- İlk yönetici bootstrap'ı değişmeden kalsın. Mevcut bir yöneticiyi kurtarmak için
  ayrı `recover-system-admin.js` bakım komutu eklensin.
- Komut yalnız tam e-postası verilen mevcut `SYSTEM_ADMIN` hesabını hedeflesin;
  kullanıcı oluşturamasın, başka rolü yükseltemesin veya club ilişkisini değiştiremesin.
- En az 12 karakter yeni parola, açık confirm değeri ve kişisel/sır içermeyen
  `RECOVERY_APPROVAL_REFERENCE` zorunlu olsun. Bu referansın kaynağı ve iki-kişi
  onayı gibi organizasyon süreci `TBD`dir; repository bunu doğrulanmış gibi sunmasın.
- Tek transaction; parolayı değiştirip hesabı `ACTIVE` yapsın, `authVersion`
  değerini artırsın, bütün refresh session ve açık reset tokenlarını revoke etsin
  ve yalnız kontrollü referans taşıyan `SYSTEM_ADMIN_RECOVERED` audit olayı yazsın.
- Komut hedef e-posta, parola, token, connection string veya raw exception loglamasın.
  Runtime image'a eklenmesin; yalnız ayrı, kısa ömürlü maintenance işlemi ve
  migrator seviyesindeki kontrollü DB yetkisiyle çalıştırılsın.

## Alternatives

1. **A — SMTP + synchronous fail-closed delivery + targeted break-glass
   (recommended):** Vendor seçimini erteler, raw tokenı kalıcılaştırmaz ve mevcut
   lifecycle sözleşmesini küçük bir yüzeyle tamamlar.
2. **B — Şifreli transactional outbox ve async worker:** Daha güçlü retry sunar;
   fakat raw token için encryption-key yaşam döngüsü, worker, retention ve yeni
   operasyon yükü gerektirir. İlk teslim için önerilmez; ihtiyaç kanıtlanırsa ayrı ADR.
3. **C — Belirli provider HTTP API'sine doğrudan bağlan:** Provider/bütçe/bölge
   bilinmediği için önerilmez ve vendor lock-in yaratır.
4. **D — Operator token handoff ile devam et:** Yerel/test fallback'i olarak kalır;
   production mailbox doğrulaması ve güvenli kullanıcı teslimi ihtiyacını çözmez.

## Data, Security and Failure Boundaries

- Additive migration yalnız `SecurityAuditAction.SYSTEM_ADMIN_RECOVERED` enum
  değerini ekler; delivery outbox veya raw-token kolonu eklenmez.
- SMTP credential yalnız secret injection ile verilir. Config, recipient ve link
  loglanmaz; yapılandırma dokümanında gerçek değer bulunmaz.
- Delivery adapter injection ile unit test edilir; gerçek provider/network kalite
  kapısında kullanılmaz. E2E fake SMTP sink ile mesaj linkini, token yokluğunu,
  failure revoke'u ve public completion akışını doğrular.
- E-posta provider'ının veri işleyen rolü, bölgesi, DPA'sı, maliyeti ve retention'ı
  provider seçimi sırasında ayrıca onaylanır.

## Rollout and Rollback

Önce additive audit enum migration'ı, ardından backend, public frontend rotaları ve
en son `smtp` konfigürasyonu etkinleştirilir. Staging'de delivery success/failure,
expired/revoked/replayed token, no-token response ve break-glass provası geçmeden
production açılmaz.

Rollback production'da ham token yanıtını açmaz: delivery issuance geçici olarak
durdurulur, mevcut tokenlar doğal expiry/revoke davranışını korur ve önceki güvenli
backend sürümüne dönülür. `SYSTEM_ADMIN_RECOVERED` enum değeri ve audit kayıtları
korunur. Operator modu yalnız development/test içindir.

## Approval Record

Kullanıcı 2026-09-06 tarihinde Option A'yı açıkça onayladı. Vendor-neutral adapter,
public completion rotaları, additive audit migration ve break-glass scripti bu
karara göre uygulanır. Provider hesabı, ücretli kaynak, DNS, korunan yerel DB'ye
migration ve production rollout bu onaya dahil değildir.

## Implementation Evidence

- Root quality: 35 backend suite/379 test, 7 frontend dosyası/23 test, iki build,
  Sites 4/4, typecheck/lint/format, 67 Markdown/0 kırık link, CDSK ve diff geçti.
- Disposable PostgreSQL 16: beş migration clean deploy, repeat no-op, güncel
  status ve boş live-schema diff geçti; fake SMTP acceptance/no-token/public
  completion ve delivery-failure revoke dahil backend E2E 27/27 geçti.
- Aynı disposable hedefte break-glass prova sonucu `ACTIVE`, authVersion artışı,
  tek recovery audit ve 0 açık refresh/reset kaydıyla doğrulandı; hedef kaldırıldı.
- Gerçek Chromium smoke, development Strict Mode'da ilk fragment tüketiminin ikinci
  effect geçişinde kaybolduğunu yakaladı. Token ref ile tek tüketim korunarak
  düzeltildi; URL fragment'sız kaldı, form tokenı korudu, public rotalar auth refresh
  çağrısı yapmadı ve tokensız reset görünür hata + disabled submit ile kapandı.
- Production dependency audit yalnız ADR-0016'da kabul edilmiş Prisma CLI →
  `@prisma/config` → `deepmerge-ts` development zincirindeki üç high advisory'yi
  raporladı; Nodemailer için production advisory bulunmadı. Frontend production
  audit'i 0 bulguyla geçti.
- Korunan yerel DB değiştirilmedi. Çalışan frontend/backend HTTP 200 kaldı;
  provider hesabı veya production kaynağı oluşturulmadı.
