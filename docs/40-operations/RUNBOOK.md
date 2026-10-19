# Runbook

## Tactical V2 rollout guard — BL-058b

`TACTICAL_V2_WRITES_ENABLED` defaults to false; only exact `true` enables new
V2 writes on the dedicated document PUTs. Leave it off in retained/production
environments until the scene editor, integrated UI/QA and explicit rollout
gate are complete. No migration is needed for this slice.

Rollback disables new V2 writes but MUST retain V2 GET support, token checks
and legacy overwrite/read guards. Never downgrade an existing V2 record to
V1 or deploy a V1-only backend over data containing V2. The feature flag is
not a substitute for role/tenant checks. Global editorial remains V1-only.
[Verification and disposable test guard](../30-quality/TACTICAL_V2_API_2026-09-19.md).

## Professional drill starter pack

- Salt okunur doğrulama: `npm run content:drills:validate`.
- Manifest yeniden üretimi: `npm run content:drills:generate`; sonuç tekrar
  validator'dan geçmeli ve review diff'i incelenmelidir.
- Import varsayılan olarak dry-run'dır. Yazım yalnız açıkça disposable/onaylı
  hedefte `NGCS_ALLOW_CONTENT_IMPORT=true` ve aktif SystemAdmin e-postasıyla
  `npm --prefix apps/backend run content:drills:import -- --apply --actor-email <email>`
  biçiminde çalıştırılır.
- Import kayıtları `DRAFT` bırakır. Reviewer `TBD` ise submit/approve/publish
  operasyonu yapılmaz. Production veya retained local import ayrı açık onaydır.

## P0.1b compatibility rollout

Requires the existing six migrations, including sporting foundation. Pause old
group/season/member writers while rolling out the adapter. After migration/backfill
and application switch, an authenticated SYSTEM_ADMIN or own CLUB_ADMIN calls
`GET /sporting/legacy-parity?clubId=...`; require IN_SYNC with all counts zero.
Verify membership add/remove, historical roster denial after revocation, workspace
scope changes and old training/match flows. The approved local target
`ngcs_local_session_dev` completed this rollout on 2026-09-06 after a private
backup/restore rehearsal: six migrations current, both clubs IN_SYNC, legacy
rows unchanged, retained-session browser smoke passed. Production is not deployed.
See [local evidence and backup location](../30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).

If parity is DRIFT, retain the data and investigate the exact mapping. Do not
reseed, delete history or restore revoked role grants. Application rollback keeps
all sporting tables but old writers no longer synchronize them; close sporting
reads/writes until a reviewed forward repair and parity check succeeds. See
[compatibility contract](../10-architecture/P01B_COMPATIBILITY_CUTOVER.md).

## Prerequisites

- Node.js/npm sürüm politikası `TBD`; package dosyalarında `engines` alanı yok.
- PostgreSQL; Docker Compose imajı `postgres:16-alpine`.
- Backend için `DATABASE_URL` ve production'da güçlü `JWT_SECRET`.

## Setup and Start

```bash
cd apps/backend
npm ci
npm run prisma:generate
npm run start:dev
```

Repository-wide non-destructive kalite kontrolü kökten çalıştırılır:

```bash
npm run quality
```

CDSK checkout'u sibling `../cdsk` konumunda değilse `CDSK_VALIDATOR` ile validator
dosyası belirtilir. E2E bu komuta dahil değildir; dedicated database ve açık reset
onayı gerektiren `npm run test:e2e` ayrı çalıştırılır.

Varsayılan backend portu `4000`. Uygulama container'ı migration çalıştırmaz.
ADR-0017 uyarınca Compose backend servisi Dockerfile'ın `runtime` target'ını
kullanır. Bu target yalnız production/serving bağımlılıklarını, derlenmiş uygulamayı
ve üretilmiş Prisma Client'ı taşır; Prisma CLI, migration/source ağacı, test/build
araçları ve seed scriptlerini taşımaz.

İlk `SYSTEM_ADMIN`, yalnız veritabanında hiç sistem yöneticisi yokken ve migration
uygulandıktan sonra explicit operator adımıyla oluşturulur. Credential komut
geçmişine veya repository dosyasına yazılmaz:

```bash
DATABASE_URL=... BOOTSTRAP_ADMIN_EMAIL=... BOOTSTRAP_ADMIN_PASSWORD=... node ensure-admin.js
```

Sonraki tüm hesaplar authenticated invitation API'siyle oluşturulur. Development/test
varsayılanı `ACCOUNT_DELIVERY_MODE=operator` olup ham invitation/password-reset
tokenı `Cache-Control: no-store` taşıyan yetkili yanıtta bir kez gösterir; loglanmaz.
Production yalnız `smtp` kabul eder. `ACCOUNT_PUBLIC_BASE_URL`, SMTP host/port,
secure seçimi ve gönderici zorunludur; credentials birlikte sağlanır, timeout
varsayılanı 10 saniyedir. Provider/account/domain ve secret injection sahibi M4'te
`TBD`dir. SMTP kabulü inbox teslim garantisi değildir.

Public linkler `/accept-invitation#token=...` ve `/reset-password#token=...`
biçimindedir. Frontend fragment'ı belleğe aldıktan sonra URL'den kaldırır. Anonim
“parolamı unuttum” akışı yoktur; reset issuance hâlen yetkili admin işlemidir.

## Controlled Migration Deployment

`npm run prisma:migrate:deploy` yalnızca ADR-0006 koşulları sağlandığında ayrı bir
deployment adımı olarak çalıştırılır. Ön koşullar:

- hedef environment ve veri sahibi doğrulanmış;
- backup ve restore provası kanıtlanmış;
- migration SQL'i review edilmiş ve izole PostgreSQL üzerinde denenmiş;
- rollback/uyumluluk penceresi onaylanmış.

ADR-0017 kapsamında komut aynı revision ve lockfile'dan üretilen ayrı `migrator`
artifact/job içinde çalıştırılır; serving runtime'a migration credential ve Prisma
CLI verilmez. Yerel Compose doğrulaması için:

```bash
docker compose --profile operations run --rm migrator
```

Migrator'ın ikinci çalışması beklenen biçimde `No pending migrations to apply`
döndürmelidir. Production'da runtime ve migrator için ayrı en-az-yetkili DB rolleri,
job retry/failure politikası ve gözlemlenebilirlik sahibi `TBD`.

Bu koşullar sağlanmadan aşağıdaki komut çalıştırılmaz:

```bash
cd apps/backend
npm run prisma:migrate:deploy
```

## Stop and Recovery

### Break-glass system-admin recovery (ADR-0020)

Önce additive `20260906010000_add_system_admin_recovery_audit` migration'ı ayrı
migrator kapısıyla uygulanır. Komut yalnız checkout/maintenance ortamındadır;
serving runtime image içinde bulunmaz. Hedef mevcut `SYSTEM_ADMIN` olmalı, yeni
parola en az 12 karakter ve approval referansı tek satır/1–200 karakter olmalıdır.
Değerleri shell history, ticket çıktısı veya repository dosyasına yazma:

```bash
DATABASE_URL=... \
RECOVERY_ADMIN_EMAIL=... \
RECOVERY_ADMIN_PASSWORD=... \
RECOVERY_APPROVAL_REFERENCE=... \
RECOVERY_CONFIRM=RECOVER_SYSTEM_ADMIN \
npm run recover:system-admin
```

Başarılı işlem hesabı `ACTIVE` yapar, authVersion'ı artırır, bütün açık refresh
session/reset tokenlarını iptal eder ve token/PII içermeyen audit kaydı yazar.
Komut yalnız sabit başarı/başarısızlık mesajı verir. Approval referansının kaynağı,
iki-kişi onayı, DB maintenance rolü ve prova sahibi `TBD`dir; production'da bu
girdiler onaylanmadan çalıştırılmaz.

### Opt-in persistent sessions (ADR-0018)

Önce `20260905000000_add_refresh_sessions` migration'ını ayrı migrator adımıyla
uygula. Yeni backend, feature kapalı olsa da lifecycle revocation için bu tabloyu
kullanır. Her iki flag varsayılan kapalıdır. Yalnız doğrulanmış yerel/test ortamında:

```bash
# Backend ortamı (örnek development origin):
PERSISTENT_SESSIONS_ENABLED=true
FRONTEND_ORIGIN=http://localhost:3132
# Frontend build/dev ortamı:
VITE_PERSISTENT_SESSIONS_ENABLED=true
```

Production `FRONTEND_ORIGIN` tam HTTPS origin olmalıdır; path, wildcard ve eksik
origin reddedilir. Production cookie `__Host-ngcs_refresh`, localhost test cookie
`ngcs_refresh` adını kullanır. Aynı localhost host'undaki farklı portlar cookie
paylaşır; E2E ayrı browser context kullanır, kişisel browser oturumuyla karıştırma.

Access 15 dakika, refresh idle 7 gün ve absolute 30 gündür. Yeni login beş aktif
family sınırında en eskiyi düşürür. İptal/expiry kayıtları 30 gün sonra startup,
saatlik ve login temizliğine girer; başarısız cleanup yalnız sabit hata mesajı
yazar. Scheduler süreç içidir, kalıcı merkezi job değildir; operations rollout
monitoring'i ayrıca tanımlanmalıdır. Security audit retention `TBD` kalır.

Rollback iki flag'i kapatıp frontend'i yeniden build etmektir; family-bound JWT
kapalı modda reddedilir. Sonraki re-enable öncesi retained family'leri revoke et
veya ilgili kullanıcıların authVersion'ını artır. Additive tablo/enum korunur.
Refresh transport hatasında kullanıcıya retry gösterilir; logout transport hatası
başarılı çıkış gibi sunulmaz. Web Locks olmayan tarayıcılarda eşzamanlı sekme
refresh'i güvenli ret ve yeniden girişle sonuçlanabilir.

Yerel geliştirme süreci terminalden durdurulur. Servis recovery, veri restore ve
production rollback prosedürleri `TBD`.

Frontend yerel geliştirme ve gerçek API bağlantısı:

```bash
cd apps/frontend
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```

Vite geliştirme portu strict olarak `3132`'dir. Port doluysa rastgele başka bir
porta geçmez; önce o sürecin sahibi belirlenip güvenli biçimde durdurulmalıdır.

Browser E2E komutu ve dedicated veritabanı güvenlik koşulları
`apps/frontend/README.md` içinde kayıtlıdır. Fixture plan/katılım ve sezon maçı
taktik analiz senaryolarıyla birlikte yaş grubuna uygun drill kataloğu ve dört fazlı
plan-drill kalıcılığını aynı izole test veritabanında doğrular.

## Common Incidents

### Güncel yerel çalışma — 2026-09-05

Kullanıcı production yerine yerelde devam etmeyi seçti. `ngcs-postgres` container'ı
içindeki önceki `ngcs_local_test` DB'si korunarak `ngcs_local_session_dev` kopyası
oluşturuldu. `20260905000000_add_refresh_sessions` yalnız kopyaya deploy edildi;
üç migration güncel. Bu DB artık etkileşimli yerel çalışma verisidir, test adı
taşıyan kaynak DB veya E2E seed/reset hedefi olarak kullanılmaz.

Frontend `http://localhost:3001`, backend `http://localhost:4000` adresinde dev
süreçleri olarak başlatıldı. Backend development modunda exact frontend origin,
frontend doğru API origin'i ve iki process flag'i `true` kullanır. Repository
env örneklerindeki `false` varsayılanları değişmedi; production ayarı uygulanmadı.
JWT secret dosyaya yazılmadı: development process-local secret kullanılır;
backend restart eski access tokenlarını geçersiz kılar, refresh kaydı korunur.
Doğru yerel koç hesabının parolası daha sonra explicit kullanıcı onayıyla yalnız
kopyada sıfırlandı; authVersion artırıldı, refresh/reset kayıtları iptal edildi ve
audit kaydı oluşturuldu. Diğer hesaplar ve kaynak DB değiştirilmedi. Credential
bu belgeye yazılmaz; yeni parola ile giriş kullanıcı tarafından tamamlanmalıdır.

### Yerel frontend port standardizasyonu — 2026-09-08

Canonical geliştirme frontend'i `http://localhost:3132`, backend'i
`http://localhost:4000` adresindedir. Vite strict portu ve browser E2E varsayılanı
3132 olarak hizalanmıştır. Persistent session açıkken backend exact
`FRONTEND_ORIGIN=http://localhost:3132`, frontend ise
`VITE_PERSISTENT_SESSIONS_ENABLED=true` kullanır. HTTP ve Socket.IO aynı merkezi
origin resolver'ını tüketir; wildcard CORS kullanılmaz. Mevcut
`ngcs_local_session_dev` hedefi salt-okunur metadata sorgusuyla çözüldü;
migration, seed, reset veya iş verisi yazımı başlatılmadı. Backend çalışırken
normal session lifecycle temizliği gerçekleşebilir. Credential ve process-local
JWT secret dosyaya yazılmaz.

2026-09-08 kullanıcı onayıyla yalnız retained yerel koç hesabı aynı operator
sınırıyla yeniden sıfırlandı. `COACH`/`ACTIVE`/club kapsamı korundu,
`authVersion` 3 oldu, iki eski refresh family iptal edildi ve tokensız audit
yazıldı. Canonical 3132 frontend'inde normal login geçti; işlem sonrasında yalnız
yeni browser oturumu açıktır. Yeni parola yalnız kullanıcıya verildi ve dosyaya
yazılmadı.

### Tanılama

- `jest: command not found`: backend bağımlılıklarını `npm ci` ile kur.
- Frontend login sonrası veri yükleme hatası: backend'in `4000` portunda çalıştığını,
  `VITE_API_BASE_URL` değerini ve tarayıcı origin'inin backend CORS listesinde
  bulunduğunu doğrula. Kalıcı oturum flag'leri kapalıysa reload sonrası yeniden
  giriş beklenir; açıksa exact origin/header ve migration durumunu doğrula.
- Prisma tablo/model hatası: temiz baseline status ve schema diff'ini dedicated
  PostgreSQL üzerinde doğrula; retained veritabanına doğrudan `db push` uygulama.

## Escalation and Ownership

Ürün, operasyon, veri ve güvenlik sahipleri `TBD`.

## P0.1 sporting-foundation rollback

Retained ortamda P0.1 sonrası hata görülürse yeni sporting assignment yazılarını
durdur, önceki uygulama revision'ına dön ve yeni tabloları yerinde bırak. Legacy
`PlayerGroup`, `GroupMember` ve `Season` yolları additive migration tarafından
silinmez. Veri taşıyan ortamda tablo/enum drop etme; doğrulanmış forward-fix
migration hazırla. Migration öncesi ve sonrası Person/User, Team/PlayerGroup,
TeamSeason/Season ve `PLAYER_GROUP_BACKFILL_V1` reconciliation sayıları kaydedilir.
