# Runbook

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

Sonraki tüm hesaplar authenticated invitation API'siyle oluşturulur. Ham invitation
ve password-reset tokenı hassas, tek seferlik response'tur; loglanmaz.

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

### Opt-in persistent sessions (ADR-0018)

Önce `20260905000000_add_refresh_sessions` migration'ını ayrı migrator adımıyla
uygula. Yeni backend, feature kapalı olsa da lifecycle revocation için bu tabloyu
kullanır. Her iki flag varsayılan kapalıdır. Yalnız doğrulanmış yerel/test ortamında:

```bash
# Backend ortamı (örnek development origin):
PERSISTENT_SESSIONS_ENABLED=true
FRONTEND_ORIGIN=http://localhost:3001
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

Browser E2E komutu ve dedicated veritabanı güvenlik koşulları
`apps/frontend/README.md` içinde kayıtlıdır. Fixture plan/katılım ve sezon maçı
taktik analiz senaryolarıyla birlikte yaş grubuna uygun drill kataloğu ve dört fazlı
plan-drill kalıcılığını aynı izole test veritabanında doğrular.

## Common Incidents

- `jest: command not found`: backend bağımlılıklarını `npm ci` ile kur.
- Frontend login sonrası veri yükleme hatası: backend'in `4000` portunda çalıştığını,
  `VITE_API_BASE_URL` değerini ve tarayıcı origin'inin backend CORS listesinde
  bulunduğunu doğrula. Kalıcı oturum flag'leri kapalıysa reload sonrası yeniden
  giriş beklenir; açıksa exact origin/header ve migration durumunu doğrula.
- Prisma tablo/model hatası: temiz baseline status ve schema diff'ini dedicated
  PostgreSQL üzerinde doğrula; retained veritabanına doğrudan `db push` uygulama.

## Escalation and Ownership

Ürün, operasyon, veri ve güvenlik sahipleri `TBD`.
