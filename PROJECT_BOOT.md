# Next Generation Coaching System — Project Boot

- **Document version:** 1.8
- **CDSK version:** 0.1.0
- **Last updated:** 2026-09-04

> Bu belge güncel çalışma özetidir. Bilinmeyen alan `TBD`, geçersiz alan kısa
> gerekçeyle `N/A` bırakılır.

## Project Compass

- **North star:** Futbol sezonu, antrenman ve taktik çalışma akışlarını tek bir
  izlenebilir dijital çalışma alanında toplamak.
- **Current mission:** Dar MVP sınırını ve mevcut backend prototipini güvenilir
  repository bağlamına oturtmak.
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

- **Phase:** M3 ortak taktik çalışma alanı tamamlandı; production kararları bekleniyor.
- **Version:** Ürün sürümü `TBD`.
- **Active milestone:** M0–M3 tamamlandı; sonraki release/production milestone'u `TBD`.
- **Current focus:** Proposed ADR-0010 içindeki production origin ve kalıcı oturum
  yaklaşımını açık kullanıcı kararına sunmak; uygulama henüz onaylı değildir.
- **Critical risks:** Production operasyonlarının belirsizliği; sağlık/ileri analitik
  için onaysız veri politikası; frontend kalıcı oturum kararının bulunmaması;
  analytics adapter'ındaki 41 görünür lint uyarısı, e-posta/recovery eksikliği ve
  Prisma CLI dependency advisory'leri.
- **Blocking decisions:** ADR-0010 seçeneği; ardından exact domain/provider,
  session lifetime/retention ve production operasyon girdileri.
- **Last status update:** 2026-09-04

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
  PostgreSQL 16 üzerinde uygulandı ve schema diff boş doğrulandı.
- **Deployment model:** Docker Compose tanımı var; production modeli `TBD`.
- **Frontend:** React 19/React Router Framework Mode SPA, shadcn/Radix, Tailwind,
  Phosphor ve React-Konva. “Koç Operasyon Masası” kimliğiyle Hafta,
  Antrenmanlar, Taktik Tahtası, Kadro ve Maçlar rotaları; kulüp egzersizi, plan
  snapshot'ı ve maç tahtası gerçek REST API'ye bağlıdır.

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
| Production origin ve kalıcı tarayıcı oturumu | Proposed; explicit approval required | ADR-0010 |
| Rotalı shadcn koç çalışma alanı | Accepted; implemented | ADR-0011 |
| Kapsamlı egzersiz ve taktik tahta sözleşmesi | Accepted; implemented | ADR-0012 |

## 6. AI Context

- **Purpose:** Repository gerçeklerini koruyarak küçük ve doğrulanabilir değişiklikler yapmak.
- **Constraints:** Bilinmeyeni tahmin etme; kritik kararı onaysız uygulama; secret
  veya kişisel veriyi kalıcı bağlama alma.
- **Open questions:** Başarı metrikleri, ölçülebilir erişilebilirlik hedefi,
  ADR-0010 kararı, e-posta delivery/recovery, production
  migration sahibi, sağlık retention/audit ve production modeli.
- **Recent decisions:** CDSK 0.1.0, dar MVP kapsamı, ADR-0004 auth/bootstrap tabanı,
  ADR-0003 monorepo topolojisi, ADR-0005 rol/tenant sınırı, ADR-0006 migration süreci
  ADR-0007 çekirdek eylem matrisi, ADR-0008 davet tabanlı hesap yaşam döngüsü
  ADR-0009 koç öncelikli frontend, ADR-0011 rotalı shadcn yüzeyi ve ADR-0012
  kapsamlı egzersiz/taktik belge kararı kabul edildi. ADR-0010 aynı site origin ve
  dönen refresh-session yaklaşımını `Proposed` olarak sunar.
- **Recently completed:** Temiz Prisma baseline; current-database principal; HTTP ve
  Socket.IO kulüp/grup authorization; cross-club negatif testleri; passwordHash,
  throttling ve bounded season generation güvenlik tabanı; kırık frontend gitlink'inin
  framework-neutral monorepo workspace'ine dönüştürülmesi; invitation, suspension,
  password reset, session revocation ve security audit akışları; seçilen görsel
  yönle çalışan ve QA'dan geçen koç frontend dikey dilimi; gerçek API'ye bağlı
  beş rotalı responsive frontend; 15 araç/11 saha türü, 6 formasyon, history,
  import/export ve explicit save içeren ortak tahta; kulüp drill ownership'i;
  plan snapshot'ı; maç tahtası; iki kulüplü Playwright E2E.

## 7. Current Priorities

1. ADR-0010'daki aynı site frontend/API origin ve kalıcı session önerisini açık
   kullanıcı kararıyla kabul veya reddetmek.
2. Kabul edilirse exact domain/provider, session lifetime/retention, secret,
   readiness, observability ve backup girdilerini implementation öncesi kapatmak.
3. E-posta operasyonlarını ve sağlık veri politikasını karara bağlamak.

## 8. Known Constraints

- `apps/frontend` çalışan prototiptir; bearer JWT bellekle sınırlı olduğu için sayfa
  yenilemede oturum kaybı kabul edilmiş geçici kısıttır.
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
- [x] Backend bağımlılıkları kuruldu; 14 unit suite / 48 test ve build geçti.
- [x] Frontend typecheck, lint, format, unit/component, production build ve Sites
  worker testleri geçti; masaüstü/tablet browser ve görsel QA sonucu `passed`.
- [x] Dedicated PostgreSQL 16 üzerinde koç login–kulüp egzersizi–plan snapshot–maç
  tahtası–cross-tenant ret Playwright E2E ve responsive rota kontrolleri 2/2 geçti.
- [x] Kök `npm run quality` komutu typecheck, salt-okunur lint/format, unit test,
  build, Sites, Markdown link, CDSK ve diff kontrolleriyle geçti.
- [x] Kapanış handoff'u güncellendi.

## 11. AI Handoff

- **Session summary:** `origin/main` tabanında güvenli repository uzlaştırması
  yapıldı. Beş rotalı shadcn koç masası, React-Konva ortak tahta, kulüp/grup drill
  yetkisi, plan snapshot ve maç tahtası uygulandı; clean migration, unit/build ve
  iki kulüplü browser E2E ile doğrulandı.
- **Documents updated:** ADR-0011/0012, requirements, roadmap/milestones, backlog,
  mimari/veri/güvenlik/API/test belgeleri, README, changelog ve Project Boot.
- **Decisions recorded:** ADR-0011 ve ADR-0012 Accepted/implemented. ADR-0010
  Proposed ve açık kullanıcı onayı bekliyor. Exact domain/provider, token
  süreleri, retention, secret ve production operasyon sözleşmeleri `TBD`.
- **Remaining risk:** Backend legacy analytics adapter'ında 41 görünür lint uyarısı;
  memory-only auth nedeniyle reload'da oturum kaybı; e-posta/recovery ve audit
  retention; sağlık/ileri analitik veri politikası; dependency advisory'leri ve
  production operasyon sözleşmesi.
- **Recommended next step:** Fast-forward teslim sonrası ADR-0010 Option 1'i kabul
  veya reddetmek; kabul edilirse `TBD` production girdilerini kapatmadan session
  migration veya auth uygulamasına geçmemek.

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
