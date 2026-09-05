# Next Generation Coaching System

Bu proje **CDSK 0.1.0** standardını kullanır.

## Proje özeti

- **Problem:** Sezon ve antrenman takibi ile taktik analiz süreçlerini dijital
  ortama taşımak.
- **İlk hedef:** Sezon bağlamında antrenman planlama, katılım/takip ve taktik
  analiz için dar bir MVP oluşturmak.
- **Mevcut durum:** NestJS/Prisma backend prototipi mevcuttur. Güncel çalışma
  bağlamı için [`PROJECT_BOOT.md`](PROJECT_BOOT.md) okunmalıdır.
- **MVP review:** `1b831e0` tabanlı stabilizasyon için 2026-09-05 remediation
  hükmü **Pass**; F-001–F-006 kapalı, açık P0/P1 yoktur. Kanıt için
  [`MVP_REVIEW_2026-09-05.md`](docs/30-quality/MVP_REVIEW_2026-09-05.md) okunmalıdır.

## Repository başlangıç sırası

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/00-product/CONSTITUTION.md`](docs/00-product/CONSTITUTION.md)
3. [`PROJECT_BOOT.md`](PROJECT_BOOT.md)
4. Ürün, mimari ve ilgili ADR belgeleri
5. [`CHANGELOG.md`](CHANGELOG.md)

## Mevcut teknik yapı

- `apps/backend`: NestJS 11, Prisma 6 ve PostgreSQL kullanan backend.
- ADR-0018 kalıcı oturumu varsayılan kapalı flag'lerle uygular. Opt-in modda reload
  oturumu yeniler ve çıkış server family'yi revoke eder; yerel kurulum ve migration
  sırası [runbook](docs/40-operations/RUNBOOK.md) içindedir.
- `apps/frontend`: React 19/React Router SPA; shadcn/Radix, Tailwind, Phosphor ve
  React-Konva tabanlı “Koç Operasyon Masası”. Genel Bakış, Hafta, Antrenmanlar,
  Egzersiz Kütüphanesi, Taktik Tahtası, Maçlar, Kadro, Yoklama ve Ayarlar rotaları
  ile kulüp egzersizi, plan snapshot'ı ve maç tahtası uçtan uca çalışır.
- `docker-compose.yml`: Doğrulanmış PostgreSQL ve runtime-only backend servisini;
  açık `operations` profili altında ayrı migrator job'unu tanımlar. İki artifact
  aynı backend Dockerfile, revision ve lockfile'dan üretilir.

## Doğrulanmış geliştirme komutları

Repository kökünde doğrulanmış non-destructive kalite kapısı:

```bash
npm run quality
```

Bu komut backend/frontend typecheck, salt-okunur lint ve format, unit test, build,
Sites worker, Markdown bağlantı, CDSK ve `git diff --check` adımlarını fail-fast
çalıştırır. CDSK checkout'u varsayılan sibling konumda değilse
`CDSK_VALIDATOR=/path/to/validate_project.py` verilir. Dedicated veritabanı isteyen
E2E testleri bu komuta bilinçli olarak dahil değildir.

Backend dizininde:

```bash
npm ci
npm run start:dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Frontend dizininde:

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:e2e
npm run build
npm run test:sites
```

Frontend browser E2E, yalnız dedicated ve silinebilir PostgreSQL hedefiyle çalışır;
zorunlu environment değişkenleri `apps/frontend/README.md` içinde tanımlıdır.

CDSK yapısı yerel kit ile şöyle doğrulanır:

```bash
python3 /Users/fatih/Dev/cdsk/scripts/validate_project.py .
```

Bu doğrulama yolu yerel CDSK checkout'una bağlıdır; taşınabilir validator modeli
`TBD`.
