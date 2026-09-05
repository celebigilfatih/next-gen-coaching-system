# Next Generation Coaching System — Project Boot

- **Document version:** 2.7
- **CDSK version:** 0.1.0
- **Last updated:** 2026-09-05

> Bu belge güncel çalışma özetidir. Bilinmeyen alan `TBD`, geçersiz alan kısa
> gerekçeyle `N/A` bırakılır.

## Project Compass

- **North star:** Futbol sezonu, antrenman ve taktik çalışma akışlarını tek bir
  izlenebilir dijital çalışma alanında toplamak.
- **Current mission:** Dar MVP'yi, runtime/migrator artifact'larını ve ADR-0018
  opt-in kalıcı oturumu doğrulayarak M4 production girdilerini toplamak.
- **Success signal:** Antrenörün sezon bağlamında antrenman planlayabilmesi,
  katılımı takip edebilmesi ve taktik analiz kaydı oluşturabilmesi.
- **Accepted trade-offs:** Mevcut sağlık, ileri analitik ve scouting modülleri
  silinmez ancak onaylı MVP kapsamına alınmaz.

## 1. Project Identity

- **Project name:** Next Generation Coaching System
- **Problem statement:** Sezon ve antrenman takibi ile taktik analiz süreçlerini
  dijital ortama taşımak.
- **Target users:** Birincil persona takım/grup ataması bulunan futbol antrenörü
  (`COACH`); destekleyici teknik roller SYSTEM_ADMIN, CLUB_ADMIN ve PLAYER.
- **Success criteria:** Ürün metrikleri ve ölçüm yöntemi `TBD`.
- **MVP goal:** Sezon bağlamında antrenman planlama, katılım/takip ve taktik analiz.
- **Explicit non-goals:** İlk MVP'de sağlık yönetimi, ileri performans analitiği,
  scouting, video dosya yönetimi ve AI destekli analiz bağlayıcı kapsam değildir.

## 2. Current Status

- **Phase:** M3.2 stabilizasyonu, ADR-0017 artifact ayrımı ve ADR-0018 opt-in oturum tamamlandı;
  2026-09-05 remediation review hükmü **Pass**.
- **Version:** Ürün sürümü `TBD`.
- **Active milestone:** M4 production session hazırlığı; zorunlu girdiler, owner ve
  hedef tarih `TBD`.
- **Current focus:** ADR-0010/0018 production rollout girdileri ve BL-024 log/DTO/lint
  borcunu hazırlamak; doğrulanmış artifact'lar için production registry,
  orchestrator ve DB rol sınırlarını belirlemek.
- **Critical risks:** Kalıcı oturum varsayılan kapalı; production deployment, ayrı
  runtime/migrator DB rolleri, secret, readiness, backup ve observability modeli;
  sağlık/ileri analitik gizlilik politikası. Prisma advisory'si ADR-0016
  koşullarıyla geçici kabul edilmiştir; ADR-0017 runtime image bu CLI/config
  zincirini taşımaz.
- **Blocking decisions:** Exact production domain/provider, proxy/secret modeli,
  operasyon sahibi, security audit ve sağlık verisi retention politikası `TBD`.
  Session lifetime ve refresh-record retention ADR-0018 ile onaylanmıştır.
- **Last status update:** 2026-09-05

## 3. Repository Navigation

1. `AGENTS.md`
2. `docs/00-product/CONSTITUTION.md`
3. `PROJECT_BOOT.md`
4. `README.md`
5. `docs/00-product/PRODUCT_SPEC.md`, `SCOPE.md`, `ROADMAP.md`
6. `docs/10-architecture/`
7. `docs/50-decisions/`
8. Quality ve operations belgeleri
9. `CHANGELOG.md`

## 4. Architecture Snapshot

- **Layers:** NestJS controller/service/module yapısı, Prisma erişim katmanı.
- **Main integrations:** PostgreSQL ve Socket.IO; başka dış servis doğrulanmadı.
- **AI components:** N/A — repository'de AI çalışma zamanı doğrulanmadı.
- **Data/storage:** PostgreSQL; baseline ve additive taktik-tahta migration'ı temiz
  PostgreSQL 16 üzerinde uygulandı. ADR-0018 üçüncü additive RefreshSession
  migration'ını ekler; deploy/status ve canlı schema diff doğrulandı.
- **Deployment model:** Docker Compose backend için runtime-only target, açık
  operations profili için ayrı migrator target kullanır; production registry,
  orchestrator ve credential modeli `TBD`.
- **Frontend:** React 19/React Router Framework Mode SPA, shadcn/Radix, Tailwind,
  Phosphor ve React-Konva. “Koç Operasyon Masası” kimliğiyle Genel Bakış, Hafta,
  Antrenmanlar, Egzersiz Kütüphanesi, Taktik Tahtası, Maçlar, Kadro, Yoklama ve
  Ayarlar rotaları; kulüp egzersizi, plan snapshot'ı ve maç tahtası gerçek REST
  API'ye bağlıdır. Mobil alt navigasyon beş ana görevi korur; destek rotaları tam
  menü Sheet'i içindedir.

## 5. Decision Snapshot

| Decision | Status | ADR / source |
|---|---|---|
| CDSK 0.1.0 kullanımı | Accepted | `docs/50-decisions/ADR-0001-cdsk-adoption.md` |
| Dar MVP sınırı | Accepted | `docs/50-decisions/ADR-0002-mvp-boundary.md` |
| Frontend repository topolojisi | Accepted; monorepo workspace reserved | ADR-0003 |
| Authentication/bootstrap güvenlik tabanı | Accepted | ADR-0004 |
| SYSTEM_ADMIN / CLUB_ADMIN rol ve tenant sınırı | Accepted | ADR-0005 |
| Prisma uzlaştırma ve rol geçiş yaklaşımı | Accepted; clean baseline verified | ADR-0006 |
| Çekirdek kaynak yetkilendirme matrisi | Accepted; unit/E2E verified | ADR-0007 |
| Davet tabanlı hesap yaşam döngüsü | Accepted; migration/unit/E2E verified | ADR-0008 |
| Koç öncelikli web frontend ve ilk akış | Accepted; vertical slice verified | ADR-0009 |
| Production origin ve kalıcı tarayıcı oturumu | Accepted; rollout inputs TBD; amended by ADR-0018 | ADR-0010 |
| Rotalı shadcn koç çalışma alanı | Accepted; implemented | ADR-0011 |
| Kapsamlı egzersiz ve taktik tahta sözleşmesi | Accepted; implemented | ADR-0012 |
| Genişletilmiş koç navigasyonu ve shadcn shell | Accepted; implemented | ADR-0013 |
| Grup izolasyonu ve gerçek zamanlı olay alıcıları | Accepted; verified | ADR-0014 |
| Atomik recovery ve güvenli SVG serialization | Accepted; verified | ADR-0015 |
| Prisma CLI advisory risk disposition | Accepted; production re-review required | ADR-0016 |
| Runtime ve migrator image ayrımı | Accepted; image/migration/runtime/E2E verified | ADR-0017 |
| Provider-neutral kalıcı oturum | Accepted; opt-in implementation; default disabled | ADR-0018 |

## 6. AI Context

- **Purpose:** Repository gerçeklerini koruyarak küçük ve doğrulanabilir değişiklikler yapmak.
- **Constraints:** Bilinmeyeni tahmin etme; kritik kararı onaysız uygulama; secret
  veya kişisel veriyi kalıcı bağlama alma.
- **Open questions:** Başarı metrikleri, ölçülebilir erişilebilirlik hedefi,
  ADR-0010 production rollout girdileri, e-posta delivery/recovery, production
  migration sahibi, sağlık retention/audit ve production modeli.
- **Recent decisions:** CDSK 0.1.0, dar MVP kapsamı, ADR-0004 auth/bootstrap tabanı,
  ADR-0003 monorepo topolojisi, ADR-0005 rol/tenant sınırı, ADR-0006 migration süreci
  ADR-0007 çekirdek eylem matrisi, ADR-0008 davet tabanlı hesap yaşam döngüsü
  ADR-0009 koç öncelikli frontend, ADR-0011 rotalı shadcn yüzeyi ve ADR-0012
  kapsamlı egzersiz/taktik belge kararı, ADR-0013 genişletilmiş koç navigasyonu,
  ADR-0014 kesin group/recipient sınırı, ADR-0015 atomik reset/güvenli SVG ve
  ADR-0016 Prisma advisory geçici risk disposition ve ADR-0017 runtime/migrator
  artifact ayrımı kabul edildi. ADR-0010
  aynı site origin ve dönen refresh-session yaklaşımı olarak Option 1'i kabul eder.
  ADR-0018 provider-neutral uygulamayı ve 15m access/7d idle/30d absolute,
  beş family/30d refresh-record retention politikasını kabul eder; rollout `TBD`.
- **Recently completed:** Temiz Prisma baseline; current-database principal; HTTP ve
  Socket.IO kulüp/grup authorization; cross-club negatif testleri; passwordHash,
  throttling ve bounded season generation güvenlik tabanı; kırık frontend gitlink'inin
  framework-neutral monorepo workspace'ine dönüştürülmesi; invitation, suspension,
  password reset, session revocation ve security audit akışları; seçilen görsel
  yönle çalışan ve QA'dan geçen koç frontend dikey dilimi; gerçek API'ye bağlı
  beş rotalı responsive frontend; 15 araç/11 saha türü, 6 formasyon, history,
  import/export ve explicit save içeren ortak tahta; kulüp drill ownership'i;
  plan snapshot'ı; maç tahtası; iki kulüplü Playwright E2E; shadcn üst çubuk ve
  gruplu dokuz masaüstü menüsü; gerçek workspace verisiyle Genel Bakış, Egzersiz
  Kütüphanesi, Yoklama ve Ayarlar destek rotaları; 390 px mobil tam menü.
  Dokuz rotalı masaüstü UI audit'i ve düzeltilmiş mobil kütüphane kanıtı ayrıca
  kaydedildi; mobil ana görev sırası ADR-0011 ile bire bir hizalandı. Bu kanıtlar
  sıralı ve düzenlenebilir bir [Figma audit panosuna](https://www.figma.com/design/SsL9HvCQTqzyM0z3nbriMW)
  da taşındı; on ekran görüntüsü ile ürün fontları yerleştirme sonrasında doğrulandı.
  F-001–F-006; tenant-safe dashboard, kesin group aggregate sınırı, güncel
  recipient Socket yayını, dirty-navigation koruması, single-winner reset ve
  güvenli SVG serialization ile kapatıldı. Prisma advisory zinciri statik
  triyajda hosted runtime için `not_actionable` bulundu; BL-025 ADR-0016 ile
  kapatıldı. BL-026/ADR-0017 kapsamında Prisma CLI/config/test/build zincirini
  taşımayan runtime-only image ile yalnız migration ağacını ve CLI'yi taşıyan ayrı
  migrator target oluşturuldu. Clean PostgreSQL 16 migration/idempotency, runtime
  HTTP 200 smoke, unprivileged user ve dependency inventory doğrulandı.
  ADR-0018 ile hash-only RefreshSession, atomik rotation/replay, exact origin/CSRF
  header, family-bound HTTP/Socket erişimi, lifecycle revoke, frontend reload ve
  server logout uygulandı. Flag'ler varsayılan kapalıdır.
- **Latest review:** `1b831e0` tabanlı stabilizasyon çalışma ağacında root quality,
  PostgreSQL 16 migration/schema diff, backend 9/9 E2E ve frontend 3/3 Playwright
  E2E geçti; açık P0/P1 kalmadığı için remediation hükmü **Pass**. ADR-0017
  sonrasında aynı root quality ve E2E kapıları tekrar geçti. Kanıt:
  `docs/30-quality/MVP_REVIEW_2026-09-05.md`.
  ADR-0018 sonrasında root quality, 68 backend / 13 frontend unit, backend 18/18
  E2E, browser opt-in 4/4 ve flag-off 3/3 tekrar geçti; üç migration deploy/status
  güncel ve canlı schema diff boştur. Runtime/migrator image build'leri geçti.

## 7. Current Priorities

1. ADR-0010/0018 için exact domain/provider, proxy/secret, staging ve operasyon
   sahibini belirlemek; onaylı session politikasıyla rollout hazırlamak.
2. Kabul edilmiş runtime/migrator artifact'ları için provider, registry,
   orchestrator, signing/SBOM ve ayrı DB-role girdilerini tamamlamak.
3. BL-024 structured/redacted logging, DTO ve analytics lint borcunu planlamak.
4. Sağlık/ileri analitik politikası ile formal WCAG ve başarı metriklerini ayrı
   onay kapılarında karara bağlamak.

## 8. Known Constraints

- `apps/frontend` çalışan prototiptir; bearer JWT bellekle sınırlı olduğu için sayfa
  yenilemede oturum kaybı varsayılan flag-off davranışıdır. Opt-in modda HttpOnly
  refresh cookie ile oturum yenilenir; production için açılmamıştır.
- Production, gizlilik ve sağlık verisi kararları açık onay gerektirir.
- Backend unit test/build çalışır. E2E suite destructive cleanup yaptığı için yalnız
  caller-supplied dedicated ve silinebilir veritabanında çalıştırılır.

## 9. Working Agreements

- Önce repository ve dokümantasyon doğrulaması.
- Kritik karar için Proposed ADR ve açık onay.
- Her anlamlı değişiklikte changelog ve kısa AI handoff güncellemesi.
- Mevcut kullanıcı değişikliklerini ve git geçmişini koruma.

## 10. Exit Checklist

### Definition of Ready

- [x] Amaç ve başlangıç kabul kriterleri açık.
- [x] Mevcut repository ve ilgili belgeler incelendi.
- [x] Belirsizlikler ve onay kapıları işaretlendi.
- [x] ADR ihtiyacı değerlendirildi.
- [x] CDSK doğrulama yöntemi tanımlandı.

### Definition of Done

- [x] Resmî CDSK validator geçiyor.
- [x] Yerel belge bağlantıları ve `git diff --check` geçiyor.
- [x] Prisma clean baseline ephemeral PostgreSQL 16 üzerinde uygulandı; status güncel
  ve schema diff boş doğrulandı. Frontend topolojisi ADR-0003 ile düzeltildi.
- [x] Backend bağımlılıkları kuruldu; 17 unit suite / 68 test ve build geçti.
- [x] Frontend typecheck, lint, format, unit/component, production build ve Sites
  worker testleri geçti; masaüstü/tablet browser ve görsel QA sonucu `passed`.
- [x] Frontend 4 Vitest dosyası / 13 test geçti.
- [x] Dedicated PostgreSQL 16 üzerinde backend tenant/group/reset/session E2E
  18/18 ve koç/dirty-navigation/session Playwright opt-in 4/4, flag-off 3/3 geçti.
- [x] Kök `npm run quality` komutu typecheck, salt-okunur lint/format, unit test,
  build, Sites, Markdown link, CDSK ve diff kontrolleriyle geçti.
- [x] Kapanış handoff'u güncellendi.
- [x] Tam MVP review için aynı revision'da quality, disposable migration/schema
  diff, backend/frontend E2E ve responsive runtime audit tekrarlandı.
- [x] MVP kabul kapısı geçiyor; F-001–F-006 kapalı ve remediation hükmü **Pass**.

## 11. AI Handoff

- **Session summary:** Kullanıcı onaylı ADR-0018 provider-neutral kalıcı oturum
  paketi uygulandı. Additive migration, rotation/replay ve family revoke, frontend
  bootstrap/logout doğrulandı. Backend E2E 18/18; browser opt-in 4/4 ve flag-off
  3/3 (opt-in testi skipped). Production rollout yapılmadı; flag'ler kapalıdır.
- **Documents updated:** ADR-0014–0017, review raporu, BL-017–BL-026, CR-009–012,
  requirements, mimari güvenlik/veri/API/entegrasyon belgeleri, operations,
  roadmap, milestone, changelog ve handoff; ADR-0018, BL-027, CR-013 ve session
  API/veri/operations sözleşmesi eklendi.
- **Decisions recorded:** Dashboard `GLOBAL + own club`; aggregate'lerde kesin
  group sınırı; Socket operasyon olaylarında güncel group/resource alıcısı;
  password reset'te transaction içi conditional single-winner claim; Prisma CLI
  advisory'si hosted runtime için geçici `not_actionable` risk kabulü; serving
  runtime ile migration artifact'ının ayrılması; default-disabled persistent
  session, 15m/7d/30d/beş-family ve 30d refresh-record retention.
- **Remaining risk:** Log/DTO/lint borcu, production provider,
  registry/orchestrator, ayrı DB rolleri, readiness ve operasyon sözleşmesi M4
  riski olarak sürer.
- **Recommended next step:** ADR-0010/0018 rollout girdilerini ve doğrulanmış
  artifact'ların production registry/orchestrator/DB-role sözleşmesini tamamlamak.

## Revision History

| Version | Date | Summary |
|---|---|---|
| 0.1 | 2026-08-31 | CDSK başlangıç bağlamı oluşturuldu |
| 0.2 | 2026-08-31 | İlk güvenlik containment ve test tabanı kaydedildi |
| 0.3 | 2026-08-31 | ADR-0004 Accepted olarak kaydedildi |
| 0.4 | 2026-08-31 | ADR-0005 rol/tenant sınırı Accepted olarak kaydedildi |
| 0.5 | 2026-08-31 | Prisma drift envanteri ve Proposed ADR-0006 kaydedildi |
| 0.6 | 2026-08-31 | ADR-0006 kabul edildi; migration uygulama adımı ayrıştırıldı |
| 0.7 | 2026-08-31 | Temiz Prisma baseline ve yeni rol enum'u doğrulandı |
| 0.8 | 2026-08-31 | ADR-0007 çekirdek authorization matrisi ve negatif E2E doğrulandı |
| 0.9 | 2026-08-31 | ADR-0003 monorepo topolojisi uygulandı; kırık gitlink kaldırıldı |
| 1.0 | 2026-09-01 | ADR-0008 invitation lifecycle ve session revocation doğrulandı |
| 1.1 | 2026-09-01 | ADR-0009 koç öncelikli frontend teknolojisi ve ilk akışı kabul edildi |
| 1.2 | 2026-09-01 | Koç frontend dikey dilimi ve browser/design QA tamamlandı |
| 1.3 | 2026-09-01 | Gerçek login–plan–katılım API entegrasyonu ve browser E2E doğrulandı |
| 1.4 | 2026-09-01 | Gerçek maç taktik analizi API entegrasyonu ve ikinci browser E2E doğrulandı |
| 1.5 | 2026-09-01 | Fazlı drill/not kalıcılığı ve üçüncü browser E2E doğrulandı |
| 1.6 | 2026-09-01 | Tekrarlanabilir kök kalite kapısı geçti; BL-005/BL-006 tamamlandı |
| 1.7 | 2026-09-01 | Production origin ve kalıcı session için Proposed ADR-0010 hazırlandı |
| 1.8 | 2026-09-04 | Rotalı shadcn çalışma alanı, scoped drills ve ortak taktik tahta doğrulandı |
| 1.9 | 2026-09-05 | ADR-0010 Option 1 kabul edildi; M4 zorunlu girdileri görünürleştirildi |
| 2.0 | 2026-09-05 | shadcn shell dokuz masaüstü menüsü ve dört MVP destek rotasıyla genişletildi |
| 2.1 | 2026-09-05 | dokuz rota UI audit'i tamamlandı; mobil sıra ve kütüphane sekmeleri düzeltildi |
| 2.2 | 2026-09-05 | doğrulanmış UI audit kanıtı düzenlenebilir Figma panosuna taşındı |
| 2.3 | 2026-09-05 | tam MVP review Fail hükmü, bulgular ve remediation backlog'u kaydedildi |
| 2.4 | 2026-09-05 | A–D stabilizasyonu tamamlandı; F-001–F-006 kapandı ve remediation review Pass oldu |
| 2.5 | 2026-09-05 | Prisma advisory geçici risk kabulü kaydedildi; runtime/migrator ayrımı Proposed oldu |
| 2.6 | 2026-09-05 | ADR-0017 kabul edildi; runtime-only backend ve ayrı migrator artifact'ı doğrulandı |
| 2.7 | 2026-09-05 | ADR-0018 opt-in kalıcı oturum, additive migration ve browser reload/logout doğrulandı |
