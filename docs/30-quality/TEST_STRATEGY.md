# Test Strategy

Coach-picker refresh covers empty-to-active recovery without losing title/date/
purpose and clearing an unavailable selected/pinned coach before reloading.
Creation stays blocked until an active account is explicitly chosen. Local
synthetic people acceptance checks audited identities/profiles/legacy mappings,
primary player assignment, actual form readiness and preserved business hashes.
[Evidence](LOCAL_COACH_PLAYER_2026-10-19.md).

Training-plan form checks retain defaults, native datetime-local with no new
required/min/max, raw values/local ISO conversion, explicit button-only submit,
pending guard and reload ordering, text-only errors/retry, close/focus/draft and
active-club-COACH creation. Connected field hints and first-title selection are
asserted. Actual responsive QA covers short body scrolling/fixed actions, list
draft reopening and loaded edit values without retained writes.
[Evidence](TRAINING_PLAN_DIALOG_UX_2026-10-19.md).

Plan attachment dialog checks preserve selection across option pages and plan
creation, full saved facts/purpose, initial/return focus, explicit expected-version
write, active-COACH ownership, duplicate blocking, uncertain-write verification
and stale/error recovery. Actual short/narrow/mobile QA keeps fixed actions
visible without submitting retained writes.
[Evidence](ADD_DRILL_DIALOG_UX_2026-10-19.md).

ADR-0047 tests all21 five-match weekday combinations alongside all35 four-match
combinations. Cover24/24/24/72-hour gaps, asymmetric94-hour gaps, early kickoff
dates, neighboring weeks and exact positive phase sums. PostgreSQL two/three/four/
five-match preview/apply preserves preview-time pins, edited phases/agendas and
deletion tombstones. Five-match concurrency, same-date/cross-Monday changes, manual
collision and late-fault rollback remain atomic. Six-match rejection checks the
actual ceiling message. Restored UI proof preserves edited plans, academy and32
other fixtures. [Evidence](FIVE_MATCH_PROGRAM_2026-10-19.md).

ADR-0045 covers all35 four-match weekday combinations,48/48/48,24/24/96 and
24/72/48-hour gaps, neighboring-week preparation/recovery and valid phase totals.
PostgreSQL runs two/three/four-match preview/apply, preview time pins and manual
phase/agenda/deletion preservation. Four-match concurrent reschedule and late-fault
rollback, manual collision and five-match/same-day fallback remain atomic. Actual
restored UI must preserve edited plans, academy and33 other complete fixtures;
no retained fixture changes. [Evidence](FOUR_MATCH_PROGRAM_2026-10-19.md).

CDSK ADR-0046 adds a repository-owned profile CLI: eight Node tooling cases run
17 Python unittest cases against disposable projects (16 pass, one OS-privileged
symlink case skipped on Windows). Broken manifests, required-list removal, empty
documents/handoff, version/date/ADR errors and escaping paths must fail; a valid
fixture with spaces/BOM/CRLF/TBD passes without any file changes. The default local
wrapper and explicit override failure propagation run too. Rule scope is versioned
in [the profile](CDSK_0_1_0_PROFILE.md); [evidence](CDSK_LOCAL_VALIDATOR_2026-10-19.md).

Exercise detail checks cover full ordered instructions, exact-age summary/rules,
source attribution, deferred readonly board, expected-version/scope picker props
and trigger focus return. Verify PLAYER/no-group/no-variant disables attachment,
legacy/missing-board honesty, retry and stale scope/resource rejection. A React
context signal must drive mocked scope changes through RouterProvider. Actual
1440/1024/390/320 QA includes mobile steps, focus-mode entry/exit, source tab and
picker Escape without a retained write.
[Evidence](LIBRARY_DETAIL_UX_2026-10-19.md).

ADR-0044 adds three-match symmetric72/72, asymmetric48/96 and boundary24/120-hour
cycles, adjacent-week recovery, final-match recovery, positive phase sums and
collision-free generated intervals. PostgreSQL runs both two/three-match preview/
apply and manual time/content/deletion preservation; three-match concurrent saves
and late-audit rollback; four-match/same-day fallback and role/season rejection.
Fresh restored UI uses actual three fixtures, exact edited-plan/academy/34-other-
fixture preservation and an unchanged retained business snapshot.

ADR-0043 tests actual48/72/96/120-hour two-match intervals, kickoff-hour threshold
changes, MD+1/MD−1 combination, adjacent Mondays, early kickoff date correctness,
positive four-phase sums and unsupported three-match/same-day/sub24-hour contexts.
PostgreSQL exercises ten-team write-free preview, two-match apply, explicit preview
time pinning, phase/agenda/deletion preservation, cross-Monday rescheduling,
concurrent identical date saves, collision and late-audit rollback. Fresh restored
UI proof preserves both edited local plans, academy rows and35 other fixtures;
retained44-table comparison must remain identical. No real fixture is moved.

Windows root runner has eight actual CLI/exit/path regressions and pinned local
npm. Full root runs can continue after failures while preserving nonzero status;
missing explicit CDSK overrides fail; the default is now local. Isolated Prisma generation and fresh
quality type/build avoid locking the serving Windows DLL. Socket positive cases
cover both persistent and legacy modes independently of local env. History UI
assertions remain intact with a cached undo handle and current remounted scene
fields. State tests mock styling; visual layout remains browser QA. UI defaults
to15s; the large55-edit/50-undo scene case has a bounded60s budget.
[Evidence](QUALITY_GATE_WINDOWS_2026-10-19.md).

Library register checks cover a stable query identity during250ms search debounce,
combined source/advanced filters, cursor reset/retry/stale-scope exclusion and
explicit resolved-age preview with focus return. The shared preview must mount a
readonly board only after Saha selection and retain planning guards. Actual
1440/1024/390/320 browser checks cover Sheet/footer access, empty/reset, lower
pagers, native full description, preview/focus mode/Escape and correct detail ID.
[Evidence](LIBRARY_UX_2026-10-19.md).

ADR-0042 adds PostgreSQL coverage for kickoff-only updates preserving IDs/phases,
cross-Monday and adjacent-week changes, edited phases/meetings, deletion tombstones,
standalone collisions, same-date/concurrent replay, outside-season/role denial and
late-checkpoint rollback. Pin the planning clock to make historical protection
deterministic. UI tests verify date-only Turkey payload, double-submit guard,
server error retention, cancellation and stale scope unmount. Rehearse guarded
known-origin enrollment and zero-write replay on a fresh restored local copy;
verify retained enrollment changes no business row. No real fixture is moved to
test the interface.

Season extension additionally verifies partial season clipping and forbidden
out-of-season edits through PostgreSQL HTTP, real fixture weekday/kickoff changes,
next-week preparation and no invented opponent preparation during breaks.
Guarded operator tests cover exact targets, inclusive41-week enumeration, stable
request IDs and preservation failures. Rehearse the full season on a fresh restored
copy, compare all original rows and replay with zero writes before retained rollout.
Ten-team HTTP cases use a30-second budget; the service transaction limit is unchanged.
[Season evidence](SEASON_CLUB_PROGRAM_2026-10-19.md).

## Weekly program acceptance — ADR-0040

Exact loopback `ngcs_week_planning_test` is required by the HTTP suite; random
fixture IDs isolate runs without retained reset. Verify all ten ages, four phase
sums/instructions, no-fixture youth and match-relative senior schedules, current
coach assignment revocation, cross-club/player denial, durable/concurrent replay,
stale/overlap conflicts, late-fault full rollback and mixed chronological totals.
Browser QA uses restored disposable DB and separate4013/3135; covers actual all-team
apply, refresh result lookup, meeting create/edit/cancel-delete, age switching,
phase detail and1440/1024/390 widths. Retained operator only follows successful
rehearsal and explicit full-plan user approval.
[Evidence](WEEKLY_CLUB_PROGRAM_2026-10-19.md).


## Ready drill planning — 2026-10-19

Backend snapshot/actor/version tests and frontend shared-filter/preview/target
plan/create/uncertain-write/stale-response tests accompany dedicated PostgreSQL
HTTP 9/9. Clean and pre-snapshot legacy migration parity plus importer replay
are required. Actual login/API/PG browser checks cover desktop/tablet/mobile;
synthetic expert approvals are test fixtures only. Retained rollout is separate.
[Evidence](READY_DRILL_PLANNING_2026-10-19.md).

## Guided setup acceptance

Use exact loopback database `ngcs_club_setup_wizard_test` for
`test/club-setup.e2e-spec.ts`; the suite refuses other targets and never resets
retained data. Random request/fixture prefixes isolate runs. Cover current-role
denials, canonical/legacy parity, account-free staff, unchanged replay after
service recreation, concurrent submissions, conflict and complete rollback.
Frontend covers step validation/back, optional staff, retry/recovery, dirty
navigation and color contrast/reset. Browser QA uses separate ports and checks
logo upload, actual final POST, reload result lookup and responsive theme.
[Evidence](CLUB_SETUP_WIZARD_2026-10-19.md).

## Combined tactical acceptance — BL-058e.4, 2026-10-03

Four editor export/import regressions cover whole JSON, selected escaped SVG
and malformed/unknown input draft retention. Parameterized V1/V2 HTTP flows
cover club copy → phase snapshot → match, independent tokens, source isolation,
unchanged duration and flag-off/legacy safety. Full disposable HTTP 18/18;
migration deploy/status/diff clean. Actual route/API/PG browser flow uses synthetic
workspace/auth bootstrap, not a full login E2E. Three viewport captures plus
12-scene/1,500-element/50-undo single-run measurements are bounded observations,
not elite-club capacity or production FPS. Root quality 843/446/4 passed.
Repository acceptance closed; retained activation remains separately approved.
[Evidence](TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).

## Training tactical integration — BL-058e.3, 2026-09-26

Three new backend provenance cases, seven real-editor route cases and six
client-adapter cases cover full V2 snapshots, successful token advancement,
first-save undo, conflict retention, explicit identical-snapshot acknowledgement,
flag/permission failures, on-demand phase switching and PLAYER playback.
Existing V1/busy/stale/context guards remain tested. Two new disposable HTTP
scenarios exercise actual attach/save/isolation and stale/revoked source paths;
the complete tactical suite passes 16/16 with clean migration status/diff.
Browser uses real route/Konva with synthetic transport at three sizes; retained
DB writes and flag changes are not part of QA.
[Evidence](TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).

## Tactical drill integration — BL-058e.2, 2026-09-26

Atomic metadata/document save and source-checked club copies use unit, real-
editor route, client adapter and disposable PostgreSQL HTTP tests. HTTP 14/14
includes metadata-step fault injection proving board rollback and the two new
routes' byte/gzip limits. Synthetic browser QA covers three viewport sizes and
conflict retention; never use retained business records for these writes.
[Evidence](TACTICAL_DRILL_INTEGRATION_2026-09-26.md).

## Match tactical integration — BL-058e.1, 2026-09-26

Three backend metadata regressions preserve strict query/tenant/season boundaries
and prohibit board-JSON transfer. Seven resource-board tests cover successful
token adoption, conflict/flag/network draft retention, retry and readonly mode;
four real-editor route tests cover lazy loading, cancel/save/discard tab behavior,
conflict recovery and PLAYER role changes. Disposable PostgreSQL HTTP suite 9/9
includes metadata after V2, legacy 409, cross-tenant/PLAYER checks and independent
analysis writes. Browser uses real route/editor with synthetic memory transport;
it is not an authenticated browser-to-database E2E claim.
[Evidence](TACTICAL_MATCH_INTEGRATION_2026-09-26.md).

## Tactical playback — BL-058d, 2026-09-26

Eight clock-driven tests cover elapsed-time sampling, dropped frames, speed,
loop, seek, restart and timer cancellation. Seven component tests cover
explicit start, preview write lock, unchanged source save, readonly playback,
hidden/modal/unmount cleanup, reduced motion and dirty Save-and-leave recovery.
Real Konva in an isolated browser confirms exact interpolation and unchanged
source coordinates, keyboard seek and responsive layouts. No retained writes.
Root quality: 821 backend / 405 frontend / 4 Sites tests, all gates passed.
[Evidence and limitations](TACTICAL_PLAYBACK_2026-09-26.md).

## Tactical scene editor — BL-058c, 2026-09-19

36 focused component/core/client tests cover clean scene selection, whole-document
undo/save, 50 undo transitions, readonly/busy/conflict retention, modal focus and
keyboard isolation, strict timing/pitch/id limits, bounded import and exact token
propagation without a 409 retry. Synthetic headed canvas QA at 1672×941,
1024×900, 390×844 writes only browser memory. Real resource-bound route tokens,
snapshot/copy/match E2E and rollout remain BL-058e; playback is BL-058d.
[Evidence](TACTICAL_SCENE_EDITOR_2026-09-19.md).

## Tactical V2 API — BL-058b, 2026-09-19

New service regressions cover roles, source/ownership, strict input, canonical
tokens, snapshot provenance, default-off writes, legacy guards and cause-free
errors. Disposable PostgreSQL HTTP tests pass 8/8 with real JWT authorization,
simultaneous edits on all three resources, snapshot isolation, V1 regression,
500,000/500,001 domain and 600,000/600,001 HTTP bytes, gzip and old-client denial.
No retained reset/import or browser UI change. Next: BL-058c scene editor.
[Evidence](TACTICAL_V2_API_2026-09-19.md).

## Accepted tactical V2 — BL-058a, 2026-09-19

ADR-0036 A–D onaylandı. Ortak sentetik V1/V2 fixture seti, core derleme paritesi,
saf zaman motoru ve n/n+1 domain sınırları iki app'te 63'er testle doğrulandı.
[Kanıt](TACTICAL_V2_FOUNDATION_2026-09-19.md). HTTP gövde sınırı, token/CAS,
legacy downgrade, kaynak/snapshot, tenant ve üç viewport kapıları BL-058b–e'de
[sözleşmeye](../10-architecture/TACTICAL_ANIMATION_V2.md) göre uygulanacaktır.
Motor testi browser animasyonu veya yetkili persistence E2E kanıtı değildir.

## ADR-0032–0034 professional drill library — 2026-09-09

- DTO/unit coverage strict body/query allowlist, kaynak-lisans kuralları,
  self-review reddi, SystemAdmin-only publish ve sürümlü katalog projection'ını
  doğrular.
- Manifest validator 120 benzersiz kimlik/checksum, yaş başına 24 ana egzersiz,
  minimum 4/8/8/4 faz dağılımı, zorunlu içerik dizileri ve geçerli/boş olmayan
  TacticalBoardDocumentV1 arar.
- Temiz disposable PostgreSQL 16 deploy/status/diff; ikinci disposable DB'de
  beş legacy drill → beş published legacy version/varyant backfill'i doğrulanır.
- Disposable importer ilk çalışmada 120 DRAFT oluşturmalı, ikinci çalışmada
  `0 imported / 120 skipped` vermelidir. Retained veritabanı açık ayrı onay
  olmadan kullanılmaz.
- Frontend testleri yayınlanmış katalog, kaynak/yaş/amaç/zorluk filtreleri,
  detay/provenance ve yönetim statü aksiyonlarını kapsar. Exact-size browser QA
  uzman incelemesi/retained import öncesinde tamamlanmış sayılmaz.
- Yönetim UI regresyonu, yazarın kendi `IN_REVIEW` içeriğinde approve/reject
  kontrollerinin pasif ve açıklamalı olmasını, bağımsız reviewer'ın ise inceleme
  alanları ile aksiyonlara erişmesini doğrular.

## ADR-0031 Player 360 and player notes — 2026-09-09

- Backend unit tests cover strict query/body projection, account-independent
  Person notes, capability/tenant/active-team grants, ownership, version conflict,
  archive/restore, stable cursor totals, source-team share rejection and note-body
  audit privacy.
- Disposable PostgreSQL 16 HTTP E2E covers coach creation, teammate read-only
  visibility, author update, stale `409`, explicit new-team grant, receiving-team
  access, PLAYER/foreign-club denial, archive/restore, four retained revisions and
  self-scoped activity. Retained local notes are not used as destructive fixtures.
- Frontend regressions cover localized identity, URL tabs/filters, structured
  note Sheet, 4,000-character boundary, role visibility and assignment-dialog
  reset/pending semantics. Notes settle for 250 ms before reads; continuation
  appends only the current filter/cursor result.
- Authenticated Chrome checks cover Overview, note create, archive confirmation
  default focus, archived view, restore, Activity and journey-only date scope.
  Responsive layout is covered by 1100/720px breakpoints and component tests;
  formal WCAG and new exact-size responsive capture evidence remain `TBD`.
- Current evidence is maintained in
  [Player 360 verification](PLAYER_360_NOTES_VERIFICATION_2026-09-09.md).
- Root quality passes with 54 backend suites / 720 tests, 44 frontend files / 285
  tests and 4/4 Sites packaging tests; both builds, lint, typecheck, format, CDSK,
  125-file Markdown links and whitespace gates pass.

## ADR-0030 first-team roster center — 2026-09-09

- Backend unit testleri strict position/sort query allowlist'ini, version/sort
  bağlı opaque cursor'u, tekrar eden isimlerde `displayName + id` sınırını,
  tenant/capability ve PLAYER self-scope'u doğrular.
- Disposable PostgreSQL 16 HTTP E2E, filtre ve summary sonuçlarını, 1.000 oyuncunun
  isim sıralı eksiksiz dolaşımını, bozuk cursor'u, yabancı takım/kulüp ve revoke
  edilmiş grant reddini doğrular. Korunan yerel veritabanı temizlenmez.
- Frontend regresyonları A Takım doğrudan route'unu, route-preserving takım
  eşitlemesini, admin/coach/empty durumlarını, URL filtre/sıra/cursor davranışını,
  shared native tablo/kompakt kart ve Player 360/hızlı bağlantıları kapsar.
- Güncel sonuç ve sentetik sorgu ölçümü
  [doğrulama raporunda](FIRST_TEAM_ROSTER_CENTER_2026-09-09.md) kayıtlıdır.

## Local demo squads and canonical Squad read — 2026-09-09

- Güvenli fixture dry-run kulüp, sezon, beş takım ve 18 kişilik hedefleri yazım
  öncesinde gösterir; yazım yalnız local/demo/test/e2e veritaban adı ve explicit
  environment gate ile açılır.
- Postcondition sorgusu bir aktif A Takım, U12/U14/U16/U18 ve takım başına 18
  aktif oyuncu/tek sezon bağlantısını doğrular. 88 yeni sportif kişinin kullanıcı
  hesabı yoktur; iki mevcut U18 oyuncusu korunur.
- Aynı fixture ikinci kez çalıştırıldığında her takımda 18 önceki ve sıfır yeni
  oyuncu raporlar.
- Squad route testi canonical account-independent roster, tam oyuncu toplamı,
  cursor/global sıra, retry, boş sayfa, scope değişiminde stale response ve PLAYER
  okuma sınırını doğrular. Ayrıntı
  [yerel kadro raporundadır](LOCAL_DEMO_SQUADS_2026-09-09.md).
- Kök kalite sonucu backend 52 suite/706 test, frontend 42 dosya/279 test ve
  Sites 4/4'tür. Authenticated Chrome smoke; tek A Takım, dört altyapı kartı ve
  U12 canonical kadrosunda `18 / 18` görünür oyuncuyu doğrular.
- ADR-0029 regresyonu canonical A Takım/Altyapı rotalarını, sekme yokluğunu,
  legacy `view` redirect'ini ve her rotada yalnız doğru sidebar hedefinin aktif
  olmasını kapsar. Veri postcondition'ı 90/90 benzersiz ad, sıfır Demo/E2E
  placeholder, sıfır hesap/Person ad farkı ve ikinci çalışmada sıfır rename arar.

## ADR-0028 team lifecycle verification — 2026-09-08

- Backend unit coverage; serbest yaş etiketi doğrulaması, strict create/update
  projection, role/tenant/kategori sınırları, exact-season projection, eşzamanlı
  A Takım tekilliği, archive/restore ve geçmiş korunumu yollarını kapsar.
- Frontend testleri URL ile korunan iki sekme, yönetici/koç/oyuncu görünürlüğü,
  A Takım create koruması, academy create/edit/archive/restore Dialog/Sheet,
  cursor, stale-response, retry ve workspace fallback davranışını kapsar.
- Disposable PostgreSQL 16'da yedi migration deploy/status ve boş schema diff
  geçti. Team lifecycle HTTP E2E 3/3; backend toplamı 52 suite/706, frontend
  toplamı 42 dosya/276 testtir.
- Retained verinin disposable clone'unda migration öncesi/sonrası PlayerGroup ve
  Drill age-label hash'leri aynı kaldı. Korunan yerel takım kayıtları test için
  arşivlenmedi veya silinmedi.
- Canlı Chrome QA'da A Takım/Altyapı sekmeleri, create/edit/archive kontrolleri,
  açık geçmiş-koruma onayı ve arşiv Sheet'i mutation yapmadan incelendi. Ayrıntı
  [doğrulama raporundadır](TEAM_LIFECYCLE_VERIFICATION_2026-09-08.md).

## ADR-0027 account administration verification — 2026-09-08

- Backend unit coverage checks the strict account-page query parser, admin-only
  service boundary, system-admin club filtering and server-forced club-admin
  tenant scope.
- Frontend tests cover account directory rendering, both technical and sporting
  role matrices, coach redirect, club-admin invite scope and explicit suspension
  confirmation. Shell coverage verifies the admin navigation is role-visible.
- A disposable PostgreSQL 16 database received all six migrations and passed 21
  backend HTTP E2E tests, including two-club directory isolation, minimum response
  projection, system filtering and coach denial. Retained accounts were not
  mutated.
- Authenticated browser QA passed at 1440×1024, 1024×900 and 390×844; the invite
  Dialog opened with e-mail focus, disabled submit and keyboard-dismissable
  controls. The detected 6px mobile hero overflow was repaired and document width
  now equals the viewport. Capability grants remain read-only.
- Root quality result is recorded in the dedicated
  [verification report](ACCOUNT_ACCESS_ADMINISTRATION_2026-09-08.md).

## ADR-0026 training plan lifecycle verification — 2026-09-08

- Frontend targeted suites verify shared create/edit Dialog state, local
  datetime-to-ISO conversion, title/date gate, busy/error retention, explicit
  permanent-delete confirmation, cancel/focus return, no optimistic removal,
  current-cursor refresh, first-page delete recovery and PLAYER-hidden mutations.
- Primitive coverage verifies pointer/not-allowed classes while the existing
  keyboard Select, DropdownMenu, Tabs, Dialog and focus behavior remains active.
- Backend unit coverage verifies linked season-week mapping, atomic plan/DayPlan
  projection, invalid-date rollback, clear-date rejection, ordered relation
  deletion, intermediate-failure containment and exact-plan authorization.
- A disposable PostgreSQL 16 database received all six migrations and passed the
  HTTP create → phase/attendance → edit into another week → read projections →
  cross-tenant/PLAYER rejection → delete → zero related rows/catalog check. The
  temporary container was removed; retained local data was not mutated.
- Root quality passed with 663 backend, 268 frontend and 4 Sites tests; typecheck,
  lint, format, both builds, CDSK, Markdown and whitespace gates passed. The
  combined before/after visual review found no actionable P0/P1/P2 issue.
  Production rollout, schema migration and dependency changes are outside this
  delivery.

## ADR-0020 account delivery and recovery verification — 2026-09-06

- Config/unit: development/test operator default'u; production operator/missing
  config reddi; HTTPS origin, SMTP credential/port/timeout sınırı; fragment link,
  accepted-recipient kontrolü; no-token success, failure revoke/generic 503 ve
  break-glass exact-role/transaction davranışı doğrulandı.
- Frontend: invitation fragment'ı history'den temizlendi, public completion API
  çağrısı/success ve tokensız link fail-closed durumu test edildi.
- Root quality 35 backend suite/379 test, 7 frontend dosyası/23 test, iki build,
  Sites 4/4 ve bütün static/docs kapılarıyla geçti. İlk sandbox build'i preview
  loopback `EPERM` nedeniyle durdu; aynı kapı sandbox dışında tamamen geçti.
- Disposable PostgreSQL 16'da beş migration clean/repeat/status, boş schema diff ve
  fake SMTP success/no-token/public accept + failure revoke içeren backend E2E
  27/27 geçti. Break-glass prova sonucu ACTIVE/authVersion=1/audit=1 ve açık
  refresh/reset=0/0; container işlem sonunda kaldırıldı.
- Korunan yerel DB değiştirilmedi; mevcut frontend/backend HTTP smoke 200 kaldı.
  Gerçek SMTP provider/network ve production rollout test edilmedi (`TBD`).
- Playwright Chromium smoke'ta valid-fragment davet formu, fragment temizliği ve
  tokensız reset hata/disabled-submit durumu doğrulandı. İlk smoke'ta React Strict
  Mode çift-effect token kaybı bulundu; ref tabanlı tek tüketim ve public rotalarda
  gereksiz auth bootstrap'ını atlama düzeltmesinden sonra 401/fragment kaybı yoktu.
- Frontend production audit 0 bulgu verdi. Backend `--omit=dev` audit'i yalnız
  ADR-0016'da kabul edilmiş Prisma CLI/config `deepmerge-ts` zincirindeki üç high
  advisory'yi raporladı; yeni Nodemailer production bağımlılığı için bulgu yoktu.

## BL-024 onuncu yerel dilim / BL-038 — 2026-09-06

Training-plan create/update/delete, tek faz ekleme, faz listesini değiştirme ve
board snapshot lookup/write persistence yolları işlem türüne özel sabit olaylara
ve cause-free `{ statusCode: 500, message: "Internal server error" }` yanıtına
bağlandı. Transaction içindeki mevcut açık `BadRequestException` kontrolleri aynı
400 sonucuyla yeniden fırlatılır. Plan oluşturma sonrasındaki opsiyonel season-day
bağlantısı mevcut fail-soft davranışını ve ayrı `PLAN_SEASON_LINK_*` olaylarını
korur. Yeni genel exception filter, status veya retention politikası tanımlanmaz.

`training-plans.error-boundary.spec.ts` on bir testte gerçek Nest
`BaseExceptionFilter` üzerinden yedi ham persistence reddini ve dört explicit 400
koruma yolunu doğrular. Pre-patch hedefli koşuda yedi senaryo ham `Error` aldığı
için kırmızı; uygulama sonrasında beş training-plan suite'i 122/122 geçti. Mevcut
primary create-failure testi de yeni güvenli sınır ve season-link'e girilmeme
koşuluyla güncellendi. Backend typecheck temizdir.

`npm run quality`: 32 backend suite/371 test, 6 frontend dosyası/21 test, Sites
4/4; backend/frontend typecheck, lint, format, build, Markdown bağlantıları, CDSK
ve whitespace kapıları geçti.

Yalnız loopback'e bağlı, `--rm` ve
`ngcs.disposable=bl024-training-plan-errors` etiketli
`ngcs-bl024-training-plan-errors-e2e` PostgreSQL 16 container'ında üç migration
uygulandı; status güncel, canlı schema diff boş ve mevcut backend E2E 25/25 geçti.
Container ile otomatik oluşturulan anonim volume doğrulama sonunda silindi.
Korunan yerel çalışma DB'leri kullanılmadı. Frontend/API şeması/dependency
değişmediği için browser E2E tekrarlanmadı.

Son statik tarama onaylı MVP mutation controller'larında `any` body kalmadığını ve
çekirdek servislerin ham error/metadata loglamadığını doğruladı. Kalan `any`
mutation gövdeleri yalnız `SYSTEM_ADMIN` ile kapalı sağlık/ileri analitik
prototiplerindedir; BL-009 gizlilik/tenant kararı olmadan değiştirilmedi. Böylece
BL-024 ve F-008 onaylı MVP kapsamı için kapanır; global redaction/retention ve
outside-MVP politika işleri ayrı karar kapılarında kalır.

## BL-024 dokuzuncu yerel dilim / BL-037 — 2026-09-06

Season/week/day/match create, update, delete, toggle, tactical-board ve otomatik
hafta üretimi içindeki persistence/missing-record yolları işlem türüne özel sabit
olaylara ve cause-free `{ statusCode: 500, message: "Internal server error" }`
yanıtına bağlandı. Bu dar değişiklik yeni bir global exception filter veya hata
status politikası tanımlamaz; toggle/generate missing-record yollarının mevcut 500
status'u korunur. Day transaction içindeki açık `BadRequestException` kontrolleri
ham hata containment'ından ayrılarak aynı 400 sonucu üretmeye devam eder.

`seasons.error-boundary.spec.ts` sekiz testte gerçek Nest `BaseExceptionFilter`
üzerinden create/delete, week create/update, day transaction/toggle/delete, match
create/update/board/delete ve week-generation lookup/missing/write yollarını
doğrular. Pre-patch hedefli koşuda sekiz test grubu ham `Error` aldığı için kırmızı;
uygulama sonrasında üç season suite'i 42/42 geçti. Backend typecheck de temizdir.

`npm run quality`: 31 backend suite/360 test, 6 frontend dosyası/21 test, Sites
4/4; backend/frontend typecheck, lint, format, build, Markdown bağlantıları, CDSK
ve whitespace kapıları geçti.

Yalnız loopback'e bağlı, `--rm` ve `ngcs.disposable=bl024-season-errors` etiketli
`ngcs-bl024-season-errors-e2e` PostgreSQL 16 container'ında üç migration uygulandı;
status güncel, canlı schema diff boş ve mevcut backend E2E 25/25 geçti. Container
ile otomatik oluşturulan anonim volume doğrulama sonunda silindi. Korunan yerel
çalışma DB'leri kullanılmadı. Frontend/API şeması/dependency değişmediği için
browser E2E tekrarlanmadı.

## BL-024 sekizinci yerel dilim / BL-035 — 2026-09-06

Attendance service'in lookup, mevcut kayıt update ve yeni kayıt create persistence
hataları `ATTENDANCE_MARK_FAILED` sabit olayına ve cause-free generic 500'e
indirildi. Runtime DTO, controller'daki plan/oyuncu authorization sırası ve mevcut
başarılı find-then-update/create sonucu değişmedi.

Pre-patch üç regresyon; lookup'ta raw Prisma nesnesi, update/create'te raw `Error`
gördü. Post-patch gerçek Nest `BaseExceptionFilter` aynı yolları yalnız
`{ statusCode: 500, message: 'Internal server error' }`, tek sabit Logger çağrısı,
cause yokluğu ve sıfır `console.error` ile doğruladı. Üç yeni test eklendi; üç
attendance suite'i toplam 27/27 geçti.

`npm run quality`: 30 backend suite/351 test, 6 frontend dosyası/21 test, Sites
4/4, typecheck/lint/format/build, 65 Markdown/0 kırık link, CDSK ve diff geçti.
Yalnız loopback bağlı, named/kalıcı volume bağlanmayan auto-remove
`ngcs-bl024-attendance-errors-e2e` PostgreSQL 16 container'ında üç migration,
güncel status, boş schema diff ve mevcut backend 25/25 E2E tekrar geçti. Yeni HTTP
fixture eklenmedi; same-group attendance create/read akışı mevcut suite içinde
korundu. Geçici container/veriler kaldırıldı, yerel DB'lere dokunulmadı. Browser
E2E tekrarlanmadı; şema, migration, frontend ve dependency değişmedi.

Statik concurrency incelemesinde bulunan ayrı `findFirst` → create yarışı
ADR-0019/CR-014/BL-036 ile kapatıldı. `(planId, playerId)` unique constraint ve tek
upsert uygulanır. Retained envanter 0 satır/0 duplicate gösterdi; ayrı açık onayla
yerel çalışma DB'sine reset yapmadan migration uygulandı ve unique index doğrulandı.
Disposable PostgreSQL'de clean/repeat/status/empty-diff, duplicate fail-fast ve iki
satırın korunması ile concurrent HTTP sonunda tek kayıt doğrulandı; backend E2E
26/26 geçti.

## BL-024 yedinci yerel dilim / BL-034 — 2026-09-06

Repository body envanteri, MVP içindeki mutation controller'larında `any` gövde
kalmadığını; kalan `any` gövdelerin yalnız SYSTEM_ADMIN ile fail-closed tutulan
sağlık ve ileri analitik prototiplerinde olduğunu gösterdi. Bu dış kapsam yolları
gizlilik/tenant politikası onaylanmadan değiştirilmedi. Karar gerektirmeyen dilim
club update ile drill create/update/delete persistence sınırı ve drill gövde nesne
kontrolüne ayrıldı.

Pre-patch regresyonunda club update ile üç drill persistence hatası raw Error/Prisma
nesnesi olarak kaldı. Drill create/update için null body `TypeError`, array ve
primitive update ise mutation'a kadar ilerleyen davranış üretti. Post-patch 12 yeni
test; gerçek Nest `BaseExceptionFilter` üzerinden cause-free generic 500, yalnız
sabit `CLUB_UPDATE_FAILED`/`DRILL_*_FAILED` olayları, sıfır `console.error`,
null/array/primitive için 400/no-write ve update authorization-before-validation
sırasını doğrular. İlgili club/drill suite'leri 56/56 geçti.

İlk `npm run quality` frontend prerender preview'nin sandbox içinde loopback portu
açamaması (`listen EPERM 127.0.0.1`) nedeniyle build adımında durdu; aynı değişiklik
sandbox dışında tekrar çalıştırıldığında bütün kapı geçti: 29 backend suite/348
test, 6 frontend dosyası/21 test, Sites 4/4, typecheck/lint/format/build, 65
Markdown/0 kırık link, CDSK ve diff.

Yalnız loopback bağlı, named/kalıcı volume bağlanmayan ve auto-remove çalışan
`ngcs-bl024-drill-errors-e2e` PostgreSQL 16 container'ında üç migration uygulandı;
status güncel ve schema diff boştur. Yeni HTTP/Prisma testi malformed drill
create/update'un kayıt değiştirmediğini, bulunmayan club update ve bağlı drill
delete'in generic 500 verdiğini, drill ile plan bağının korunduğunu doğruladı.
Backend E2E 25/25 geçti. Geçici container/veriler kaldırıldı; korunan yerel DB'lere
dokunulmadı. Browser E2E tekrarlanmadı; şema, migration, frontend ve dependency
değişmedi.

## BL-024 altıncı yerel dilim / BL-033 — 2026-09-06

Grup update/delete ile üye add/remove hata yolları mevcut başarılı payload ve HTTP
status davranışını değiştirmeden sabit log olaylarına bağlandı. Duplicate add ve
missing remove yine generic 500'dür. Grup silmede üyelikler ile ana kayıt artık tek
Prisma transaction'ında silinir; ilişkili kaynak foreign key'i ana silmeyi
reddederse üyelikler geri alınır.

Pre-patch `groups.error-boundary.spec.ts` regresyonu transaction'ın bir kez
çağrılmasını beklerken `0` çağrı gördü; bu, üyelik silindikten sonra grup silme
başarısız olduğunda kısmi veri kaybı yolunu kanıtladı. Sonrasında 11 yeni
error-boundary testi; başarılı atomik sıra, invalid id erken reddi, update/delete
persistence ve add/remove lookup/duplicate/missing/write hatalarında gerçek Nest
`BaseExceptionFilter` üzerinden generic cause-free 500, tek sabit olay ve sıfır
`console.error` davranışını doğruladı. İlgili üç suite toplam 56/56 geçti.

Son `npm run quality`: 28 backend suite/336 test, 6 frontend dosyası/21 test,
Sites 4/4, typecheck/lint/format/build, 65 Markdown/0 kırık link, CDSK ve diff geçti.
Yalnız loopback bağlı, named/kalıcı volume bağlanmayan ve auto-remove çalışan
`ngcs-bl024-group-errors-e2e` PostgreSQL 16 container'ında üç migration
deploy/status ve boş schema diff doğrulandı. İlk DB
adı güvenlik kapısının gerektirdiği `test`/`e2e` ibaresini taşımadığı için app suite
geçmesine rağmen refresh-session suite'i başlamadan hedefi reddetti. Aynı disposable
container'da `ngcs_bl024_group_errors_e2e` oluşturulup bütün backend E2E yeniden
çalıştırıldı ve 24/24 geçti.

Yeni HTTP/Prisma senaryosu, mevcut plan/season foreign key'i nedeniyle reddedilen
grup silmeden sonra grup ve üye kümesinin değişmediğini; duplicate add ve missing
remove'un generic 500 verdiğini; bağımsız disposable grubun üyesiyle birlikte
başarıyla silindiğini doğrular. Geçici container/veriler kaldırıldı; korunan yerel
DB'lere dokunulmadı. Browser E2E tekrarlanmadı; frontend, Prisma şeması, migration
ve dependency değişmedi. Genel hata-status/redaction/retention politikası `TBD`.

## BL-024 beşinci yerel dilim / BL-032 — 2026-09-06

Kulüp create/update, iki grup-create yolu, grup update ve üyelik body'leri ortak
runtime parser ile controller/service sınırında doğrulanır. Yaş/kategori Prisma
enumları, `/groups` create'in null/boş/eksik kategori → `ALT_YAPI` default'u,
`/clubs/:id/groups` DB default'u, nullable club alanları ve boş ad davranışı korunur.
Yeni trim, uzunluk, URL veya global unknown-field politikası eklenmez.

F-010 pre-patch `clubs.validation.spec.ts` testi kırmızıydı: `POST /clubs`
kaynağındaki `id`, `createdAt`, nested `users.create` ve `groups.create` Prisma
Club create data'sına ulaştı. Explicit projection sonrasında tetik yeniden
üretilemedi. `POST /clubs` ve `/clubs/:id/groups` persistence hataları generic,
cause-free 500 + tek sabit log olayıyla sınırlandı.

`clubs.validation.spec.ts`, `groups.validation.spec.ts` ve mevcut group log testi
toplam 84/84 geçti. İlk aday incelemesi `/groups` body hedefinde kalan alanların
tenant kontrolünden önce parse edildiğini buldu; clubId-only parse eklendi. Unit ve
HTTP regresyonları yabancı geçerli clubId + malformed alanların 403 verdiğini,
servis/DB mutation'ına ulaşmadığını doğrular. Tek bağımsız review döngüsünde başka
somut mass-assignment veya fixed-event bypass bulunmadı.

Son `npm run quality`: 27 backend suite/325 test, 6 frontend dosyası/21 test,
Sites 4/4, typecheck/lint/format/build, 65 Markdown/0 kırık link, CDSK ve diff geçti.
İlk E2E çağrısı yalnız Supertest `.send(null)` TypeScript fixture imzasında uygulama
başlamadan durdu; fixture `{}` oldu. Son koşu, yalnız loopback bağlı volumesiz
`ngcs-bl024-club-group-e2e` PostgreSQL 16 üzerinde üç migration deploy/status,
boş schema diff ve 23/23 backend E2E ile geçti. Geçici container/veri kaldırıldı;
korunan yerel DB'lere dokunulmadı. Browser E2E yeniden çalıştırılmadı; frontend,
şema ve dependency değişmedi. Group update/delete ile duplicate/missing membership
framework hata yolları ve genel redaction/retention politikası bu dilimin dışındadır.

## BL-024 dördüncü yerel dilim / BL-031 — 2026-09-06

Sezon/hafta/gün/maç controller ve service girişleri mevcut alan sözleşmesiyle
runtime doğrulanır. Yeni ürün uzunluk/aralık politikası yoktur; Prisma Int sınırı,
date-only/local ISO/offset tarihleri, nullable/default alanlar, JSON şekilleri,
80 hafta sınırı ve serializable gün-plan grup kontrolü korunur.

F-009 pre-patch regresyonu `seasons.validation.spec.ts` içinde önce kırmızıydı:
`updateWeek` data'sına `seasonId`, `season.connect` ve `days.deleteMany` geçti.
Explicit field projection sonrasında aynı test ve toplam 33 season testi geçti.
31 yeni unit; bağımsız read-only patch review somut kalan bypass/regresyon bulmadı.
İlk root quality test dosyası Prettier düzeninde durdu; yalnız format düzeltildi.
Tekrar `npm run quality`: 25 backend suite/250 test, 6 frontend dosyası/21 test,
Sites 4/4, typecheck/lint/format/build, 65 Markdown/0 kırık link, CDSK ve diff geçti.

Yalnız yeni loopback bağlı, volumesiz disposable `ngcs-bl024-season-e2e`
PostgreSQL 16 üzerinde üç migration deploy/status geçti; schema diff boştur.
`TEST_DATABASE_URL` bu container'ın `ngcs_bl024_e2e` DB'sini hedefledi;
`E2E_ALLOW_DESTRUCTIVE_RESET=true npm run test:e2e -- --runInBand`: 22/22.
İki yeni HTTP/Prisma senaryosu `test/app.e2e-spec.ts` içindedir:

- Meşru sezon/hafta/gün/maç oluşturma, principal kimliği, varsayılanlar ve JSON
  null/array/object kalıcılığı; tarih offset ve null-date no-op.
- Hafta reparent/nested days create/delete alanlarının yazılmaması, başka kulüp
  sezonunun değişmemesi; maç create üzerinden invalid board/id enjekte edilememesi.
  Bozuk alanlar 400 ve writes yok; yetkisiz rol/çapraz kaynak erişimi 403 kalır.

Pre-patch DB exploit çalıştırılmadı; kırmızı unit ham alanların sink'e geçişini
kanıtlar, post-patch E2E gerçek Prisma/HTTP reddetme ve meşru kontrol kanıtıdır.
Test container ve geçici verileri kaldırıldı; korunan yerel demo DB'lere
dokunulmadı. Browser E2E yeniden çalıştırılmadı; şema/dependency değişmedi.
Bu dar kapsamlı doğrulamadır; group/club DTO ve framework log yolları açıktır.

## BL-024 üçüncü yerel dilim — 2026-09-05

Plan create/update runtime DTO, controller ve service girişlerini kapsayan
`training-plan.validation.spec.ts` 58 test ekler: malformed scalar/atomic-object
girdiler, nullable alanlar, gerçek offset'li tarihler, Int şema sınırları, principal
kimlik türetme, coach/admin farkı, assignment/club retleri, field projection,
serializable group-detach ve drill/day invariant'ları. Önceki invalid-date testi
artık plan create öncesi 400/no-query davranışını bekler; geçerli planın opsiyonel
season-link hata davranışı değişmez.

Backend typecheck ve hedefli 4 suite/111 test geçti. Repository kökünden
`npm run quality`: 24 backend suite/219 test, 6 frontend dosyası/21 test, Sites
4/4, iki build, typecheck/lint/format, CDSK, 65 Markdown/0 kırık link ve diff geçti.
İlk kalite çağrısı backend alt dizininde script bulunamadığı için başlamadı;
doğru kökten tekrar çalıştırıldı. Lint 0 hata/uyarı.

Yeni `ngcs-bl024-plan-e2e` PostgreSQL 16 container'ı yalnız loopback'e bağlandı,
kalıcı volume kullanılmadı. Üç migration temiz `ngcs_bl024_e2e` veritabanına deploy
edildi. Explicit disposable URL/reset flag ile `npm run test:e2e -- --runInBand`
20/20 geçti: eski tenant/group/session testlerine ek olarak malformed create/update
sonrası kayıt sayısı/içeriği değişmiyor; PLAYER create reddediliyor; koç sahipliği,
offset → UTC kaydı ve update null-clear doğrulanıyor. Migration status güncel,
canlı schema diff boş. Test container'ı işlem sonunda kaldırıldı.

Korunan `ngcs_local_session_dev` ve diğer DB'lere dokunulmadı. Yeni migration,
dependency veya frontend davranış değişikliği yok; browser E2E bu dilimde tekrar
çalıştırılmadı. Diğer DTO/framework log borcu BL-024 kapsamında açıktır.

## BL-024 ikinci yerel dilim — 2026-09-05

- `groups.service.spec.ts`: 4 başarılı/default category kontrolü ve 5 hata
  temsilinde (P2003 Error, ordinary Error, metadata object, null, string) gerçek
  Nest BaseExceptionFilter ile generic 500 zarfı, raw cause yokluğu, console
  çağrısı yokluğu ve yalnız sabit Logger olayı doğrulandı. Bu scoped raw-error
  yolu yeniden üretilemiyor; başarı result/payload/default korunur.
- `attendance.validation.spec.ts`: 16 bozuk body, iki geçerli durum, iki yetki
  reddi, servis create/update ve direct-service ret (23 test). Plan/player lookup
  öncesi parse, ardından eski resource authorization sırası korunur; bilinmeyen
  alanlar mutation'a aktarılmaz. PLAYER role guard mevcut testte korunur.
- `add-plan-drill.spec.ts`: 12 bozuk body, dört faz/optional notes, iki yetki
  reddi ve direct-service ret (19 test). Replace ile ortak validator kullanılır;
  plan yetkisi önce, source yetkisi geçerli girdide sonra çalışır.

İlk grup test denemesi mevcut TS lib'inde `Error.cause` tipinin bulunmaması
nedeniyle test çalışmadan başarısız oldu; assertion düzeltildi. Ardından backend
typecheck ve hedefli 6 suite/86 test geçti. Son root `npm run quality`: 23 backend
suite/161 test, 6 frontend dosyası/21 test, Sites 4/4, iki build, typecheck/lint/
format, CDSK, 65 Markdown/0 kırık link ve diff başarılı. Lint 0 hata/uyarı.
fix-finding bağımsız incelemesinde scoped grup log yolunda somut bypass/regresyon
bulunmadı; ayrı club-group create/framework log yolu açık borç olarak kaydedildi.

Testler mock Prisma ve gerçek Nest exception filter kullanır; HTTP transport,
DB/browser E2E veya migration tekrar çalıştırılmadı. Korunan yerel DB'ye mutation
yapılmadı. Global hata/redaction politikası karara bağlanmadı.

## BL-024 ilk yerel dilim — 2026-09-05

- `analytics.service.spec.ts`: altı modelin create/update yollarında kimlik/zaman
  ve player relation alanlarının elenmesi; sayı/tarih dönüşümleri, input nesnesinin
  değiştirilmemesi, null/undefined reddi ve Match allowlist'i (8 test).
- `training-plans.service.spec.ts`: normal gün bağlantısı; eksik sezon/hafta/plan;
  Error ve obje biçimindeki ham hata; invalid date; tarih/grup gate; primary create
  hatası; Pazar ve fallback notları (10 test). Logger argümanları yalnız sabit
  olaydır, console çağrısı yoktur. Mock Prisma ile iş akışı korunurken original
  metadata/raw-error log yolu test girdileriyle artık yeniden üretilemez.
- `training-plans.controller.spec.ts`: 19 bozuk body, boş/50-eleman sınırı, dört
  faz/optional notes, önce plan sonra kaynak yetkisi ve direct service validation
  (24 test). Controller'da eksik/null/drills-array olmayan body artık `.map()`
  TypeError'ı yerine BadRequestException üretir; mutation yapılmaz.

Doğrulama sırası: backend typecheck → hedefli üç suite/42 test → lint → root
`npm run quality`. Son tam kapı: backend 20 suite/110 test, frontend 6 dosya/21
test, Sites 4/4, iki build, typecheck/lint/format, 65 Markdown/0 kırık link, CDSK
ve `git diff --check` geçti. Backend/frontend lint 0 hata/uyarı; Prisma 7'ye
yönelik mevcut config deprecation bildirimi lint uyarısı değildir.
Bağımsız read-only log-patch incelemesi somut bypass/regresyon bulmadı.

Bu dilim HTTP transport, PostgreSQL veya browser E2E'si değildir; bunlar tekrar
çalıştırılmadı. Mock Prisma kullanıldı; korunan demo DB'ye mutation/migration
yapılmadı. BL-024 diğer DTO/log yolları ve production log politikası açık kalır.
Aşağıdaki tarihli önceki test sonuçları tarihsel kanıttır.

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

BL-043f.3 combines `E2E_DRILL_PAGE_FIXTURE=true` with
`E2E_TACTIC_PAGE_FIXTURE=true` to make 30 synthetic catalog records valid boards.
The first browser flow verifies 25+5 board pages, unchanged full totals, minimal
network projection and a second-page editor link at 1440/1024/390 px.
[Tactics verification](BL043_TACTICS_PAGINATION_2026-09-07.md).

BL-043f.1 `E2E_DRILL_PAGE_FIXTURE=true` adds 30 synthetic drills only to the
disposable browser seed. Together with `E2E_TRAINING_PAGE_FIXTURE=true`, the
extended first flow checks 35-drill pagination, category totals/reset, board
detail links and responsive controls. Unit and API tests separately cover JSON
omission, role parity, query validation, full totals and stale scope responses.
[Library evidence and remaining consumers](BL043_DRILL_LIBRARY_2026-09-06.md).

BL-043c fixture switches `E2E_HISTORY_FIXTURE=true` and
`E2E_PLAYER_PAGE_FIXTURE=true` add synthetic ended assignments and native players
only to the disposable browser seed. The dated roster/history test exercises
page-independent totals and 1440/1024/390 px controls. HTTP scale checks in
`player-page.e2e-spec.ts` traverse 3,001 roster / 603 history records, including
equal-date cursor ties, date cutoffs and current-grant revocation.
[Evidence and remaining limits](BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

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
Kapı backend typecheck öncesinde `prisma generate` çalıştırır; bu nedenle temiz
clone yalnız bağımlılık kurulumu sonrası önceden üretilmiş client'a güvenmez.

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

2026-09-04 taktik çalışma alanı doğrulamasında 14 backend unit suite / 48 test ve
2 frontend Vitest suite / 5 test geçti. Additive migration temiz PostgreSQL 16'da
uygulandı ve Prisma schema diff boştu. Playwright 2/2 senaryoda koç login → kulüp
egzersizi → plan snapshot → maç tahtası → ikinci kulüpten `403` zincirini ve beş
ana rotayı 1440/1024/390 genişliklerinde doğruladı. Frontend typecheck, lint,
production build ve 4/4 Sites worker testi geçti.

2026-09-05 MVP stabilizasyon doğrulamasında backend 15 unit suite / 54 test,
frontend 3 Vitest dosyası / 7 test ve 4/4 Sites testi geçti. Disposable PostgreSQL
16 üzerinde migration/status/schema diff temiz; backend E2E 9/9 ile dashboard
tenant izolasyonu, kesin group aggregate sınırı ve concurrent reset single-winner
davranışını doğruladı. Playwright 3/3 ile mevcut tactical zinciri ve responsive
rotalara ek olarak sidebar, browser back ve 390 px mobil dirty-navigation
korumasını doğruladı.

2026-09-05 ADR-0018 opt-in kalıcı oturum doğrulamasında root `npm run quality`
geçti: backend 17 suite / 68 unit, frontend 4 dosya / 13 test, 4/4 Sites, iki
build, typecheck/lint/format, CDSK, yerel bağlantılar ve diff kontrolleri.
Bilinen analytics 41 lint warning'i devam eder. Disposable PostgreSQL 16'da üç
migration deploy edildi; ikinci deploy no-op, status güncel ve canlı schema diff
boştu. Backend E2E 18/18; replay/family revoke, concurrent single-winner rotation,
idle/absolute expiry, logout izolasyonu, beş-session sınırı, status/access/password
revocation ve 30-day retention doğrulandı. Socket family revoke için sender ve
recipient unit testleri vardır. Browser suite aynı dedicated DB'de
`E2E_PERSISTENT_SESSIONS=true` ile 4/4, kapalı modda 3/3 (opt-in testi skipped)
geçti. Reload, yeni sekme, HttpOnly cookie, storage'da token yokluğu ve server
logout doğrulandı. React Router'ın sessionStorage scroll-position verisi credential
değildir; buna izin verilir. Runtime/migrator image build'leri de geçti; runtime
image RefreshSession sorgusu başarılı, migrator image tekrar deploy sonucu no-op.
Yerel uygulama veya production DB'sine migration uygulanmadı.

## Yerel etkileşimli smoke — 2026-09-05

Sonraki yerel çalışma oturumunda `ngcs_local_session_dev` ve açık session flag'leri
ile ayrı arka plan browser sekmesinde şu kontroller yapıldı:

- Yeni sekmede ve reload sonrasında login'e dönmeden takım/sezon verisi yüklendi.
- Hafta 31 Ağustos–6 Eylül → 7–13 Eylül → Bugün ile mevcut haftaya döndü;
  mevcut maç ilk haftada doğru gün/saatle göründü.
- Antrenmanlar ve Yoklama plan olmayan durumlarını açıklayıcı mesajla gösterdi.
- Kütüphane beş global egzersizi, Kadro iki oyuncuyu, Maç Detayı mevcut analiz,
  diziliş ve notları yükledi.
- Yeni taktik editöründe Oyuncu ekleme katman oluşturdu ve dirty durumuna geçti;
  Geri al boş taslağı geri getirdi. Kaydet kullanılmadı, iş verisi değiştirilmedi.
- Bulgu: Yeni kayıt henüz sunucuda yokken boş tahta “Kaydedildi” gösteriyor.
  Kaynak `tactical-board-editor.tsx:184,578`: saved başlangıcı seed ile eşit ve
  etiket yalnız dirty boolean'ına bağlı. `tactics-editor.tsx:234` yeni kayıt için
  persisted bilgisini aktarmıyor. BL-029/P3 açıldı; bu oturumda kod düzeltilmedi.

Bu sınırlı smoke tam E2E/kalite kapısı veya save/snapshot/katılım kalıcılığı
doğrulaması değildir. Test sekmesi kapatıldı; kullanıcının asıl sekmesi açık kaldı.

## BL-029 düzeltme doğrulaması — 2026-09-05

Ortak editör başlangıçta sunucuda kayıt bulunmasını dirty durumundan ayrı izler.
Yeni egzersiz, boş maç tahtası ve snapshot'sız plan kaynağı `initiallySaved=false`
aktarır; başarılı save sonrası kayıt durumu güncellenir. Henüz değişiklik yapılmamış
taslak için navigasyon engeli eklenmedi; mevcut dirty-navigation davranışı korundu.

Yedi editör-state/component testi (canvas mock): yeni taslak, mevcut kayıt,
her ikisinde dirty/undo/redo, asenkron save tamamlanmadan “kaydedildi” göstermeme,
hata/retry ve mevcut kayıtta hata sonrası dirty durumunun korunması geçti.
Browser'da yeni taslak → oyuncu ekle → undo durumları ve henüz tahta kaydı olmayan
maç ekranının “Henüz kaydedilmedi” etiketi doğrulandı; Kaydet kullanılmadı.
Plan snapshot'ı başlangıç bilgisinin bağlantısı kaynakta kontrol edildi; bu adımda
gerçek plan snapshot save E2E'si tekrar çalıştırılmadı.

Root `npm run quality` geçti: backend 17 suite/68 test, frontend 5 dosya/20 test,
Sites 4/4, iki build, typecheck/lint/format, CDSK, 65 Markdown/0 kırık link ve diff.
İlk denemelerde testin TypeScript/format sorunları giderildi; sandbox'ta frontend
prerender portu EPERM verdiğinden son başarılı kapı loopback izniyle çalıştırıldı.
Bilinen 41 analytics lint warning'i devam eder. API/şema/migration değişmedi;
veritabanı E2E suite'leri tekrar çalıştırılmadı. BL-029 kapatıldı.

## İlk yerel demo planı ve BL-030 — 2026-09-05

Kullanıcı tarih/süre/içeriği asistana devretti. Browser üzerinden, yalnız yerel
çalışma kopyasında “Demo • Ön Alan Baskısı ve Geçiş Oyunu” planı oluşturuldu:
7 Eylül 2026 18:00 Europe/Istanbul; 12 dk ısınma, 24 dk teknik, 30 dk taktik,
9 dk soğuma. Salt-okunur Prisma kontrolü toplam 75 dk, dört PlanDrill ve sıfır
attendance kaydını doğruladı. Browser yeniden açılışta fazları ve takvimde 75 dk'yı
gösterdi. Hiçbir oyuncu için gerçek katılım varsayılmadı.

Faz ekleme sonrası detayın yenilenmesine rağmen workspace listesinde eski 0 dk
kalması görüldü. `TrainingDetailRoute.addDrill` başarılı replace sonrası ortak
workspace reload'unu bekleyecek şekilde düzeltildi. Gerçek WorkspaceProvider ve
route'u, mocked API ile kullanan regresyon; sayfa reload'u yapmadan sonraki listede
güncel dakika/faz sayısını doğrular. Root quality geçti: 68 backend, 21 frontend
(6 dosya), Sites 4/4, iki build, typecheck/lint/format, CDSK/link/diff. Bilinen
41 analytics lint warning'i sürer. Migration/API değişmedi; DB E2E tekrar edilmedi.
