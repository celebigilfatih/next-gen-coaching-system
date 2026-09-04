# Test Strategy

## Risk-based Test Layers

- Unit: domain/service davranışı ve güvenlik sınırları.
- Integration: Prisma/PostgreSQL, migration ve module sözleşmeleri.
- End-to-end: login, antrenman planlama, katılım ve taktik analiz çekirdek akışları.
- Security: rol/tenant negatif senaryoları, secret ve hassas response kontrolleri.
- Frontend: ADR-0009 uyarınca TypeScript kontrolü, salt-okunur lint, Vitest/Testing
  Library unit/component, production build ve koç kritik yolu için Playwright E2E.

## Commands

- **Repository quality:** `npm run quality`
- **Repository typecheck:** `npm run typecheck`
- **Repository lint:** `npm run lint`
- **Repository unit tests:** `npm test`
- **Repository build:** `npm run build`
- **Markdown links:** `npm run docs:check`
- **CDSK:** `npm run cdsk:check`
- **Backend unit:** `cd apps/backend && npm test`
- **Backend e2e:** Dedicated DB ile `TEST_DATABASE_URL=... E2E_ALLOW_DESTRUCTIVE_RESET=true npm run test:e2e`
- **Backend build:** `cd apps/backend && npm run build`
- **Format check:** `npm run format:check`
- **Frontend typecheck:** `cd apps/frontend && npm run typecheck`
- **Frontend lint:** `cd apps/frontend && npm run lint`
- **Frontend format:** `cd apps/frontend && npm run format:check`
- **Frontend unit/component:** `cd apps/frontend && npm test`
- **Frontend browser E2E:** Dedicated DB ile
  `E2E_DATABASE_URL=... E2E_ALLOW_DESTRUCTIVE_RESET=true E2E_COACH_PASSWORD=... npm run test:e2e`
- **Frontend build:** `cd apps/frontend && npm run build`
- **Frontend Sites paketi:** `cd apps/frontend && npm run test:sites`
- **Backend typecheck:** `cd apps/backend && npm run typecheck`
- **Backend salt-okunur lint:** `cd apps/backend && npm run lint`
- **Backend format:** `cd apps/backend && npm run format:check`

## Test Data and Isolation

E2E suite yalnızca çağıranın verdiği dedicated ve silinebilir `TEST_DATABASE_URL`
ile, ayrıca `E2E_ALLOW_DESTRUCTIVE_RESET=true` açık onayı varken çalıştırılır. Bu
iki koşul kodda fail-closed uygulanır. Suite ilgili tabloları temizler; retained,
shared veya production veritabanında çalıştırılmaz. Son doğrulamada ephemeral
PostgreSQL 16 kullanıldı ve container testten sonra kaldırıldı.

## Release Gates

- CDSK ve dokümantasyon kontrolleri.
- İlgili lint/typecheck/test/build kontrolleri.
- Migration ve rollback doğrulaması (veri değişikliğinde).
- Kritik güvenlik ve tenant izolasyonu testleri.

`npm run quality` non-destructive, fail-fast varsayılan kapıdır. Dedicated
PostgreSQL gerektiren backend/browser E2E testleri yalnız açık reset onayı ve ilgili
environment değişkenleriyle ayrı `npm run test:e2e` komutunda çalıştırılır.

2026-09-01 doğrulamasında 12 unit suite / 40 test geçti. Dedicated veritabanı E2E
suite'indeki 7 test; önceki cross-club ve meşru aynı-grup akışlarına ek olarak
invitation-only provisioning, token replay, suspension, HTTP session revocation,
password reset, unsafe role change ve audit davranışını doğruladı. Migration
ephemeral PostgreSQL 16 üzerinde uygulandı; Prisma status güncel ve schema diff boştu.

2026-09-01 frontend doğrulamasında typecheck, lint, format check, 1 Vitest suite / 2
test, production build ve 4 Sites worker testi geçti. In-app browser ile 1487 ×
1058 masaüstü ve 900 × 1024 tablet görünümü; katılım, maç analizi ve login rotası
doğrulandı. Console error/warning görülmedi; `apps/frontend/design-qa.md` sonucu
`passed`.

2026-09-01 gerçek frontend/backend browser E2E doğrulamasında clean-baseline
migration dedicated `ngcs_e2e` PostgreSQL 16 veritabanına uygulandı. Playwright
senaryosu koç girişini, atanmış takım ve sezonun API'den yüklenmesini, antrenman
planının oluşturulup sezon haftasına bağlanmasını ve iki oyuncunun katılımının
kalıcılaştırılıp API'den yeniden okunmasını doğruladı. Bağımsız ikinci senaryo sezon
maçını açıp rakip/taktik analiz JSON'u, diziliş ve koç notunu kalıcılaştırdı; salt
okunur SQL kontrolü 1 maç ve güncel analiz/not değerlerini doğruladı. Üçüncü
senaryo yaş grubuna uygun katalogdan dört faz drill'i seçip faz notunu kaydetti;
SQL kontrolü 4 `PlanDrill`, 75 dakikalık `TrainingPlan` ve senkron 75 dakikalık
`DayPlan` değerini doğruladı: 3/3 test geçti. Backend E2E 7/7 içinde yeni endpoint
için cross-club 403 ve aynı-grup başarılı replace kanıtlandı. Runner, explicit reset
onayı olmayan veya veritabanı adı `e2e`/`test` içermeyen hedefleri fail-closed
reddeder.

2026-09-01 repository kalite doğrulamasında kök `npm run quality`; backend/frontend
typecheck, salt-okunur lint ve format, 40 backend unit, 2 frontend unit, iki build,
4 Sites testi, 52 Markdown dosyasında 0 kırık link, CDSK ve `git diff --check`
adımlarını tek akışta geçti. Backend lint 0 hata ve legacy analytics adapter'ında
41 görünür unused-variable uyarısı raporladı. Backend kalite build'i izlenen `dist`
yerine `node_modules/.cache/ngcs-quality-build` çıktısını kullanır.
