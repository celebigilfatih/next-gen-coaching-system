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

Bu koşullar sağlanmadan aşağıdaki komut çalıştırılmaz:

```bash
cd apps/backend
npm run prisma:migrate:deploy
```

## Stop and Recovery

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
  bulunduğunu doğrula. JWT bellekte tutulduğu için reload sonrası yeniden giriş
  beklenen geçici davranıştır.
- Prisma tablo/model hatası: temiz baseline status ve schema diff'ini dedicated
  PostgreSQL üzerinde doğrula; retained veritabanına doğrudan `db push` uygulama.

## Escalation and Ownership

Ürün, operasyon, veri ve güvenlik sahipleri `TBD`.
