# Next Generation Coaching System

Bu proje **CDSK 0.1.0** standardını kullanır.

## Proje özeti

- **Problem:** Sezon ve antrenman takibi ile taktik analiz süreçlerini dijital
  ortama taşımak.
- **İlk hedef:** Sezon bağlamında antrenman planlama, katılım/takip ve taktik
  analiz için dar bir MVP oluşturmak.
- **Mevcut durum:** NestJS/Prisma backend prototipi mevcuttur. Güncel çalışma
  bağlamı için [`PROJECT_BOOT.md`](PROJECT_BOOT.md) okunmalıdır.

## Repository başlangıç sırası

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/00-product/CONSTITUTION.md`](docs/00-product/CONSTITUTION.md)
3. [`PROJECT_BOOT.md`](PROJECT_BOOT.md)
4. Ürün, mimari ve ilgili ADR belgeleri
5. [`CHANGELOG.md`](CHANGELOG.md)

## Mevcut teknik yapı

- `apps/backend`: NestJS 11, Prisma 6 ve PostgreSQL kullanan backend.
- `apps/frontend`: ADR-0003 ile normal monorepo workspace'i; ADR-0009 ile onaylanan
  koç öncelikli React/TypeScript ve React Router SPA. Login, haftalık antrenman,
  fazlı drill seçimi/notu, katılım ve gerçek season/match API'sine bağlı maç taktik
  notu dikey dilimi çalışır; görsel QA ve 3/3 browser E2E geçmiştir.
- `docker-compose.yml`: Doğrulanmış PostgreSQL ve backend servislerini tanımlar.

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
