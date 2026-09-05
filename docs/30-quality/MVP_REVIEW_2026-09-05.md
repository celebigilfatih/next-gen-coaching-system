# NGCS Tam MVP Review — 2026-09-05

> **Güncel durum: PASS.** Bu raporun ilk review bulguları tarihsel kanıt olarak
> korunur. `1b831e0` tabanlı `codex/mvp-stabilization` çalışma ağacında F-001–F-006
> ADR-0014/0015 kapsamında kapatılmış ve kabul kapıları yeniden çalıştırılmıştır.

## Yönetici özeti

- **Güncel hüküm: PASS.** İncelenen
  `1b831e087b727b80bfed0d47005bb0b95fa0852f` revision'ının ilk hükmü bir P0,
  üç P1, üç P2 ve bir P3 nedeniyle **FAIL** idi. Onaylanan remediation sonrasında
  açık P0/P1 kalmadı; F-001–F-006 kapandı, F-007/F-008 sürdürülebilirlik backlog'u
  olarak devam ediyor.
- İlk review'da kalite kapıları geçtiği halde testlerin kapsamadığı erişim ve
  veri-kaybı yolları hükmü düşürmüştü; bunlar artık doğrudan regresyon testleriyle
  korunuyor.
- İlk review'daki filtresiz `recentDrills`, cross-group aggregate, club-wide
  Socket recipient ve dirty React Router navigation yolları remediation ile
  kapatıldı.
- İlk review salt-okunurdu. Bu belgenin sonundaki remediation re-review ise
  kullanıcı onaylı kod ve sözleşme değişikliklerini ayrıca doğrular.
- M4 production hosting/session/retention/observability/backup kararları MVP
  hükmüne katılmamış, ayrı production riski olarak tutulmuştur.
- Review sonrasında onaylanan ADR-0017 runtime/migrator artifact ayrımı aynı kalite
  ve E2E kapılarıyla doğrulanmıştır; production rollout girdileri hâlâ M4 riskidir.

## Kapsam ve yöntem

| Alan | İncelenen kanıt |
|---|---|
| Baseline | `origin/main` ve çalışma revision'ı aynı: `1b831e0`; başlangıçta çalışma ağacı temiz |
| Ürün | Constitution, Product Spec, Scope, Roadmap, REQ-001–011, M0–M4 |
| Kararlar | Accepted ADR-0001–0017; ADR-0010'ın M4 sınırı ve ADR-0016/0017 production koşulları |
| Backend | Bütün controller'lar, Socket.IO gateway, authorization service, lifecycle akışları, tactical validator |
| Veri | Prisma schema, iki migration, foreign key/unique ilişkileri, transaction yolları |
| Frontend | Dokuz rota, shell/guard/workspace, kritik formlar, taktik editörü ve responsive runtime |
| Test | Backend unit/E2E, frontend unit/Sites/Playwright, gereksinim ve negatif-dal eşlemesi |
| Güvenlik | Repository-wide source scan, secret/log/dependency kontrolleri ve seçili dinamik doğrulamalar |

Review hükmü kullanıcının kabul ettiği kurala göre verilmiştir: tenant ihlali,
authentication bypass, veri kaybı riski, migration hatası veya çekirdek MVP akışı
çalışmıyorsa **Fail**. Aşağıdaki bulgu ayrıntıları ilk review'ın tarihsel kanıtıdır;
güncel kapanış durumu “Review sonrası kabul kontrolü” bölümündedir.

## Kalite kapıları

| Kapı | Sonuç | Kanıt / not |
|---|---|---|
| `npm run quality` | Pass | Backend/frontend typecheck, lint, format, unit, build, Sites, link, CDSK ve diff kontrolleri geçti |
| Backend unit | Pass | 15 suite / 54 test |
| Frontend unit | Pass | 3 dosya / 7 test |
| Frontend Sites | Pass | 4 / 4 |
| PostgreSQL 16 migration deploy | Pass | Disposable `ngcs_review_e2e`; iki migration uygulandı |
| Prisma migration status | Pass | Database schema up to date |
| Live DB → schema diff | Pass | Boş diff |
| Migrations → schema diff | Pass | Shadow DB üzerinde boş diff |
| Backend E2E | Pass | 9 / 9; yalnız disposable DB; tenant/group/reset concurrency dahil |
| Frontend Playwright E2E | Pass | 3 / 3; tactical zincir, responsive rotalar ve dirty navigation |
| Frontend production dependencies | Pass | `npm audit --omit=dev`: 0 |
| Backend production dependencies | Pass for runtime artifact; accepted repository risk | ADR-0016: repository-local audit optional-peer zincirinde 3 entry gösterir; ADR-0017 runtime install'i 0 ve image inventory zinciri içermez |
| Runtime/migrator artifact ayrımı | Pass | Ayrı target'lar; runtime CLI/config/test/source içermez, migrator HTTP uygulaması içermez; clean apply + idempotency + HTTP 200 smoke geçti |
| Secret örüntüleri | Pass | İzlenen gerçek key/token bulunmadı; yalnız örnek ve test denylist değerleri |
| Browser console | Pass | Denetlenen akışlarda error/warn görülmedi |

İlk `npm run quality` çağrısında Vite preview sandbox `listen EPERM` ile durdu;
aynı kapı gerekli yerel port izniyle tekrar çalıştırıldığında bütünüyle geçti. Bu,
uygulama hatası değil ortam kısıtı olarak sınıflandırıldı.

## Gereksinim izlenebilirliği

| Requirement | Kod / davranış kanıtı | Test / runtime kanıtı | Review durumu |
|---|---|---|---|
| REQ-001 | Season/group scoped training plan controller/service | Backend E2E ve gerçek frontend akışı | Implemented |
| REQ-002 | Atomik `replaceDrills`, faz/sıra ve plan detail include | Unit + frontend E2E | Implemented; ADR-0014 group invariant verified |
| REQ-003 | Plan/player scoped attendance controller/service | Backend E2E, `/app/attendance` runtime | Implemented |
| REQ-004 | Match tactical board ve plan snapshot endpoint'leri | Frontend tactical zincir E2E | Implemented |
| REQ-005 | Current-user JWT, authorization service, tenant/group negatif yolları | Cross-club/group E2E + Socket unit | **Implemented: F-001/F-002/F-003 closed** |
| REQ-006 | CDSK manifest ve zorunlu belgeler | Validator + Markdown link kapısı | Implemented |
| REQ-007 | Invitation, suspension, authVersion, reset ve audit | Lifecycle unit/E2E | Implemented; F-005 closed |
| REQ-008 | Login, app shell, week/training/attendance akışı | Playwright + dokuz rota runtime | Implemented |
| REQ-009 | `TacticalBoardDocumentV1`, Konva tools/history/import/export | Unit/E2E + tarayıcı etkileşimi | **Implemented: F-004/F-006 closed** |
| REQ-010 | Scoped drill create/update, owner ve mass-assignment | Unit/E2E negatif yolları | Implemented; ADR-0014 aggregate invariant verified |
| REQ-011 | Dashboard/library/attendance/settings ve beş ana görev | 1440/1024/390 runtime | Implemented |

REQ-005 ve REQ-009 ilk review'da `Partial` durumuna indirilmişti; remediation
kanıtlarıyla yeniden `Implemented` durumuna getirildi.

## HTTP ve Socket.IO yetki matrisi

| Yüzey | Authentication | Rol | Tenant / kaynak kapsamı | Review sonucu |
|---|---|---|---|---|
| `GET /` | Public | N/A | Sağlık dışı kök yanıt | Uygun |
| `POST /auth/login` | Public | N/A | Kimlik bilgisi + throttle | Uygun |
| `GET /auth/me` | JWT | Tümü | Güncel DB principal | Uygun |
| Invitation accept, reset complete | Public token | N/A | Hash, süre, replay ve conditional claim | Uygun; F-005 kapalı |
| Invitation create/revoke, user access/suspend/reactivate/reset/revoke, audit | JWT | SYSTEM_ADMIN / scoped CLUB_ADMIN; self yolları ayrı | Hedef kullanıcı ve kulüp scope | Seri yollar uygun; F-005 |
| `GET /users`, `players`, `by-email`, `:id` | JWT | Sistem, kulüp ve group-aware roller | Self/club/shared-group projection | Uygun |
| Health logs/status ve coach notes | JWT | SYSTEM_ADMIN | MVP dışı fail-closed | Uygun; politika M4/TBD |
| Clubs create/list/update/groups | JWT | Create SYSTEM_ADMIN; yönetim system/own CLUB_ADMIN | Current club veya global system | Uygun |
| Groups CRUD/member yolları | JWT | SYSTEM_ADMIN / own CLUB_ADMIN; view için assigned COACH | Club/group membership | Uygun |
| Drills read/create/update/delete | JWT | GLOBAL yalnız SYSTEM_ADMIN; CLUB own admin/assigned owner coach | Visibility + club/group/creator | Uygun; aggregate ADR-0014 ile kapalı |
| Training plans read/create/update/delete/drills/board | JWT | System, own club admin, assigned coach; player view | Plan club/group ve linked resource | Uygun |
| Attendance read/write | JWT | Manage için system/admin/coach; PLAYER self/group read | Plan + player group | Uygun |
| Seasons/weeks/days/matches | JWT | System/admin/assigned coach; player view | Season club/group | Uygun; day-plan invariant transaction içinde |
| `GET /stats/dashboard` | JWT | SYSTEM_ADMIN / CLUB_ADMIN | Global + caller club, minimum projection | Uygun; F-001 kapalı |
| Analytics CRUD ve match adapter | JWT | SYSTEM_ADMIN | MVP dışı fail-closed | Yetki uygun; F-007 DTO/log borcu |
| Socket connect + `user:join` | JWT | Tümü | Current DB user/authVersion, group rooms | Uygun |
| Socket attendance/plan/drill events | JWT | Sender resource manage | Per-emit current recipient ve minimum payload | Uygun; F-003 kapalı |

Mass-assignment açısından drill `scope`, `clubId`, `groupId` ve `createdById`
değerleri sunucu tarafından türetilir; kullanıcıdan gelen sahiplik alanları
doğrudan yazılmaz. Mevcut negatif testler çapraz kulüp, oyuncu yazma ve başka
koçun kaydını sahiplenme yollarını reddetmektedir.

## Veri, migration ve tactical belge doğrulaması

- Temiz PostgreSQL 16 üzerinde migration deploy/status ve her iki yönlü schema
  diff boş geçti. Review sırasında migration oluşturulmadı veya değiştirilmedi.
- `DrillScope`, drill club/group/creator ilişkileri, `PlanDrill.boardSnapshot` ve
  `Match.tacticalBoard` migration ile schema arasında uyumludur.
- `TacticalBoardDocumentV1` kök ve element allowlist'i, canonical pitch, numeric
  sınırlar, benzersiz id, 250 element ve 100 KB sınırını uygular. Ad hoc doğrulamada
  251 element ve 100 KB üzeri belge reddedildi.
- Kaynak drill değişikliğinin plan snapshot'ını etkilememesi ve maç tahtasının
  `opponentAnalysis` alanından ayrı tutulması model ve E2E'de doğrulandı.
- İlk review'da validator `color` alanını yalnız uzunlukla sınırlıyordu. Güncel
  validator canonical hex renk kabul eder; exporter bütün dinamik XML bağlamlarını
  escape eder ve F-006 regresyon testiyle kapalıdır.

## Frontend ve kullanıcı akışları

Dokuz rota gerçek yerel fixture ile incelendi: `/app/dashboard`, `/app/week`,
`/app/trainings`, `/app/library`, `/app/tactics`, `/app/matches`, `/app/squad`,
`/app/attendance`, `/app/settings`. Route guard ve memory-only session davranışı
kaynakta doğrulandı. Beş ana görev 1440 px, 1024 px ve 390 px'de adreslenebilir;
body horizontal overflow görülmedi. Haftalık kart şeridi dar görünümde bilinçli
yatay kaydırmadır.

Login → hafta → antrenman → egzersiz → katılım akışının API bağlantıları ve
loading/error/empty yüzeyleri mevcuttur. Kulüp egzersizi → plan snapshot → maç
tahtası zinciri E2E'de kalıcılaştırıldı ve ikinci kulüp okuması reddedildi.

Taktik editöründe araç ekleme, undo/redo ve kirli durum runtime'da çalıştı. İlk
review'da iç `Kütüphane` bağlantısı yerel history'yi uyarısız kaybediyordu. Güncel
ortak editor blocker'ı sidebar, browser back ve mobil navigasyonda kaydet/at/iptal
seçeneklerini zorunlu kılar; F-004 Playwright ile kapalıdır.

## İlk review bulguları — tarihsel, F-001–F-006 kapalı

### F-001 — P0 — Dashboard çapraz-tenant drill sızıntısı

- **Güncel durum:** Closed — ADR-0014 ve iki-kulüplü E2E ile doğrulandı.

- **Konum:** `apps/backend/src/stats/stats.service.ts:57`; giriş
  `apps/backend/src/stats/stats.controller.ts:14`.
- **Requirement:** REQ-005.
- **Etki:** Bir `CLUB_ADMIN`, başka kulüplerin en yeni drill kayıtlarını `jsonData`,
  `clubId`, `groupId` ve creator metadata ile alabilir.
- **Kanıt / yeniden üretim:** `recentTrainings` scoped `where` kullanırken
  `recentDrills = prisma.drill.findMany({ take: 5, orderBy: ... })` filtresizdir.
  İki kulüplü fixture'da Kulüp A admini için dashboard çağrısı Kulüp B'nin daha
  yeni drill'ini döndürür.
- **Öneri:** Caller-derived görünürlük predicate'i ve minimum projection uygula;
  SYSTEM_ADMIN davranışını açıkça tanımla.
- **Eksik test:** İki kulübün drill'leriyle dashboard tenant izolasyonu.

### F-002 — P1 — Aynı kulüpte gruplar arası aggregate bağlama

- **Güncel durum:** Closed — kesin group invariant ve iki-gruplu E2E ile doğrulandı.

- **Konum:** `apps/backend/src/training-plans/training-plans.controller.ts:149`,
  `apps/backend/src/seasons/seasons.controller.ts:149`.
- **Requirement:** REQ-002, REQ-005, REQ-010.
- **Etki:** İki gruba erişen admin/koç, Grup B drill veya planını Grup A
  aggregate'ine bağlayabilir; yalnız Grup A'yı görebilen kullanıcı nested içeriği
  okuyabilir.
- **Kanıt / yeniden üretim:** Destination ve source ayrı ayrı authorize edilir;
  plan-drill için group equality hiç, season-day için yalnız club equality kontrol
  edilir.
- **Öneri:** Aynı-group invariant'ını transaction içinde zorunlu kıl veya
  club-wide paylaşımı Proposed ADR/security change request ile açıkça onaylat.
- **Eksik test:** İki grup için plan↔drill ve season day↔training plan negatif E2E.

### F-003 — P1 — Socket.IO recipient scope kulüp geneli

- **Güncel durum:** Closed — current-recipient group/resource filtresi unit testle doğrulandı.

- **Konum:** `apps/backend/src/events/events.gateway.ts:76`, `:122`, `:142`, `:160`.
- **Requirement:** REQ-005.
- **Etki:** Aynı kulübün ilgisiz gruplarındaki PLAYER/COACH bağlantıları presence,
  plan, attendance ve drill olaylarının id/ad/rol/raw payload bilgisini alabilir.
- **Kanıt / yeniden üretim:** Her bağlantı yalnız `club:<clubId>` odasına katılır;
  sender resource authorization sonrasında emit aynı kulüp odasına yapılır.
- **Öneri:** Group/resource room üyeliği, recipient authorization ve payload
  minimization. Gerçekten club-wide olması gereken olayları ayrı sözleşmede tanımla.
- **Eksik test:** İki gruplu Socket.IO listener izolasyonu; grup dışı alıcı hiçbir
  operasyon olayını görmemeli.

### F-004 — P1 — İç navigasyonda kaydedilmemiş taktik kaybı

- **Güncel durum:** Closed — router blocker ve Playwright senaryosu ile doğrulandı.

- **Konum:** `apps/frontend/src/components/tactics/tactical-board-editor.tsx:216`,
  `apps/frontend/src/routes/tactics-editor.tsx:135`,
  `apps/frontend/src/routes/app-layout.tsx:232`.
- **Requirement:** REQ-009.
- **Etki:** Koç, olağan sidebar/mobile/back/search navigasyonuyla kaydedilmemiş
  taktik çalışmasını uyarısız kaybeder.
- **Kanıt / yeniden üretim:** Editörde element ekle → “Kaydedilmemiş değişiklik”
  görünür → iç `Kütüphane` linkine bas → dialog yok, rota değişir, history unmount
  ile kaybolur. Kaynakta yalnız `beforeunload` vardır; router blocker yoktur.
- **Öneri:** Ortak editor surface'lerinde React Router navigation blocker ve açık
  Kaydet/At/İptal dialog'u; browser unload korumasını da sürdür.
- **Eksik test:** Sidebar, mobile nav, back ve programmatic navigate için dirty
  state Playwright/component testleri.

### F-005 — P2 — Password reset single-winner değil

- **Güncel durum:** Closed — conditional claim unit ve concurrent PostgreSQL E2E ile doğrulandı.

- **Konum:** `apps/backend/src/accounts/account-lifecycle.service.ts:286`.
- **Requirement:** REQ-007.
- **Etki:** Geçerli reset tokenı sahibi, iki completion veya reissue/change-password
  yarışıyla son yazan parola davranışı ve recovery rollback üretebilir.
- **Kanıt / yeniden üretim:** Transaction tokenı okur ve doğrular; row lock veya
  conditional claim olmadan user'ı, ardından tokenı id ile günceller. PostgreSQL
  READ COMMITTED interleaving iki isteğin de kontrolü geçmesine izin verir.
- **Öneri:** Conditional single-winner claim, row lock veya serializable + retry;
  parola mutation'ı ancak claim kazanan işlemde yapılmalı.
- **Eksik test:** Barrier-controlled concurrent completion, reissue ve
  change-password yarışları. Seri replay testi yarış kanıtı değildir.

### F-006 — P2 — SVG export attribute enjeksiyonu

- **Güncel durum:** Closed — canonical renk ve XML escaping unit testleriyle doğrulandı.

- **Konum:** `apps/backend/src/tactics/tactical-board.ts:130`,
  `apps/frontend/src/components/tactics/tactical-board-editor.tsx:1192`.
- **Requirement:** REQ-009.
- **Etki:** Yetkili kötü niyetli içerik, kullanıcının dışa aktarılan SVG'yi aktif
  document olarak açıp etkilemesi halinde event attribute çalıştırabilir.
- **Kanıt / yeniden üretim:** 22 karakterlik `red\" onclick=\"alert(1)` color değeri
  validator tarafından kabul edildi; Blob SVG içinde `onclick` attribute oluştu ve
  yerel Chromium'da tıklamayla çalıştı. NGCS DOM'una doğrudan XSS gösterilmedi.
- **Öneri:** Canonical color allowlist ve bütün dinamik SVG attribute/text değerleri
  için XML context escaping.
- **Eksik test:** Backend/frontend color negatifleri, exporter XML parse testi ve
  browser execution regresyonu.

### F-007 — P2 — Kritik negatif dallarda otomasyon kapsamı eksik

- **Güncel durum:** Closed for F-001–F-006 — BL-023 tamamlandı; daha geniş DTO/log
  kapsamı BL-024 altında planlıdır.

- **Konum:** `apps/backend/test/app.e2e-spec.ts`,
  `apps/frontend/tests/mvp.spec.ts`, `apps/frontend/src/lib/tactical-board.test.ts`.
- **Requirement:** REQ-005, REQ-007, REQ-009, REQ-010.
- **Etki:** Kalite kapısı yeşil olsa da F-001–F-006 sınıfındaki regresyonları
  yakalamaz; “Implemented” kanıtı doğrudan endpoint/requirement matrisi için eksik
  kalır.
- **Kanıt:** Board testleri 251 element ve bir formation yolunu kapsar; 250/100 KB
  sınırı, malformed import, dirty SPA navigation, SVG escaping, stats two-club,
  same-club two-group, Socket recipient ve reset concurrency testleri yoktur.
- **Öneri:** Önce P0/P1 düzeltmelerine bağlı negatif suite; ardından sınır ve
  concurrency testlerini root kalite veya dedicated E2E kapısına bağla.
- **Eksik test:** Yukarıdaki her bulgunun acceptance kriteri.

### F-008 — P3 — Belge, log ve lint görünür borcu

- **Güncel durum:** Open — BL-024; MVP Pass hükmünü düşürmeyen sürdürülebilirlik
  borcudur.

- **Konum:** `docs/10-architecture/INTEGRATIONS.md`,
  `apps/backend/src/training-plans/training-plans.service.ts`,
  `apps/backend/src/analytics/analytics.service.ts`.
- **Requirement:** REQ-006 / sürdürülebilirlik.
- **Etki:** Mimari belge frontend'in Socket.IO kullandığını ima ederken kaynakta
  `io()` consumer yoktur; operational loglar plan/club/season metadata ve raw error
  yazabilir; analytics adapter 41 lint warning üretir.
- **Kanıt:** Dependency mevcut fakat frontend Socket client çağrısı yok; kalite
  kapısı 0 error / 41 warning ile geçer.
- **Öneri:** Belgeyi “backend capability; frontend consumer yok” diye düzelt;
  structured/redacted logging ve analytics cleanup backlog'u uygula.
- **Eksik test:** Log redaction assertions ve gerçek zamanlı client varsa contract
  testleri.

## Production riskleri — M4, MVP hükmü dışında

- Varsayılan kapalı modda bearer JWT yalnız bellekte; reload oturumu kaybeder.
  ADR-0018 opt-in kalıcı session, lifetime, rotation, CSRF ve refresh-record
  retention uygulamasını doğruladı. Exact production domain/provider, rollout
  ve security-audit retention girdileri hâlâ `TBD`.
- Backend audit'inde Prisma → `@prisma/config` → `deepmerge-ts` zincirinde 3 high
  advisory vardır. ADR-0016 triyajı bunu hosted runtime için `not_actionable`
  sınıflandırmış ve production öncesi yeniden inceleme koşuluyla geçici kabul
  etmiştir; otomatik breaking downgrade uygulanmamıştır. Repository-local
  `npm audit --omit=dev` optional-peer metadata nedeniyle bu girdileri göstermeye
  devam eder. ADR-0017 runtime install'i development/optional paketleri dışarıda
  bırakarak sıfır audit bulgusu vermiş ve image inventory zincirin yokluğunu
  doğrulamıştır.
- Runtime-only ve migrator artifact ayrımı uygulanmış, clean migration/idempotency,
  runtime startup ve aynı disposable DB üzerinde E2E ile doğrulanmıştır. Production
  secret injection, ayrı DB rolleri, registry/orchestrator, readiness, centralized
  redaction, backup/restore ve observability modeli `TBD`.
- Sağlık, scouting ve ileri analitik yolları yalnız SYSTEM_ADMIN ile fail-closed;
  privacy, retention, audit sahibi ve kullanım politikası onaylanmadan MVP'ye
  alınmamalıdır.
- Formal WCAG hedefi, browser matrisi, release tarihi ve başarı metrikleri `TBD`.

## İlk review onay kapıları ve uygulanan sıra

1. **F-001** doğrudan güvenlik düzeltmesi ve iki-kulüplü regresyon testiyle kapatılmalı.
2. **F-002/F-003** için aynı-club farklı-group paylaşım politikası güvenlik/veri
   sözleşmesini etkiler; Proposed ADR veya change request hazırlanıp onaylanmalıdır.
3. **F-004** public sözleşme değiştirmeden router-level discard dialog'u ile
   kapatılabilir; ortak editor embedding'leri birlikte test edilmelidir.
4. **F-005/F-006** güvenlik düzeltmeleri bağımsız, geri alınabilir değişiklikler ve
   negatif testlerle uygulanmalıdır. F-005 transaction yaklaşımı veri kararıdır.
5. P0/P1 kapandıktan sonra aynı disposable DB kapıları yeniden çalıştırılmalı;
   açık P0/P1 kalmazsa review hükmü yeniden verilmelidir.

Kullanıcı A–D kararlarını açıkça onayladı. F-001–F-003 ADR-0014, F-005/F-006
ADR-0015 kapsamında uygulandı; CR-009/010 onaylı ve doğrulanmış duruma getirildi.
F-004 public sözleşme değiştirmeyen ortak editor blocker'ıyla kapatıldı.

## Review sonrası kabul kontrolü

| Kriter | Durum |
|---|---|
| Açık P0/P1 yok | Pass |
| Root quality | Pass |
| Clean migration/schema diff | Pass |
| Kritik backend/frontend E2E | Pass — backend 9/9, frontend 3/3 |
| CDSK/link/diff | Pass |
| Uygulama kodu değişmedi | N/A — bu bölüm remediation re-review'dur |

Sonuç **PASS**: F-001–F-006'nın özgün tetikleyicileri artık yeniden üretilemiyor;
global/same-tenant, same-group, normal save ve tek reset-kazanan davranışları
korunuyor. Production/M4 riskleri ve F-008 kapsamındaki log/DTO/lint borcu bu MVP
hükmünün dışında kalmaya devam eder.

## ADR-0018 sonrası doğrulama eki

2026-09-05: Default-disabled provider-neutral kalıcı session uygulamasından sonra
root quality geçti (backend 68 unit, frontend 13 test, Sites 4/4, build, lint,
typecheck/format, CDSK/link/diff). Disposable PostgreSQL 16'da üçüncü additive
migration ve tekrar deploy başarılı; status güncel, canlı schema diff boş.
Backend E2E 18/18, browser opt-in 4/4 ve flag-off 3/3 geçti. Rotation/replay,
concurrent refresh/login, lifecycle revoke, expiry/retention, reload/yeni sekme ve
server logout doğrulandı. Runtime ve migrator artifact'ları yeniden build edildi.
Önceki review bulguları yeniden açılmadı; bu ek production güvenlik onayı veya yeni
bir tam repository audit'i değildir. Production rollout yapılmadı. Bilinen
41 analytics warning'i ve ayrı operasyon onay kapıları açık kalır.
