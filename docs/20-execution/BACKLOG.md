# Backlog

## Hazır egzersiz çizim revizyonu — 2026-10-27

| ID     | İş                                                                                 | Öncelik / durum                                                                          | Kabul kanıtı                                                                                                                                                                         | Sonuç                                                                                                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-077 | Hazır egzersizlerde çalışma ile eşleşen çizimler — REQ-023/027, ADR-0034/0039/0048 | **P2 — yerel kabul tamamlandı**. Her yaş24 organizasyon, aynı120 kimlikte yeni v2 yayın. | 14 çizim regresyonu, operator11 PostgreSQL, backup/restore ve43-tablo koruması, canonical browser ve kök18/18. [Yayın](../30-quality/DRILL_DIAGRAM_LOCAL_PUBLICATION_2026-10-27.md). | **Tamamlandı —2026-10-27 yerel120 v2 PUBLISHED**. Kullanıcının yeni named/same-account onayı ADR-0048; v1 geçmişi,55 hazır plan kopyası ve bütün planlar korunur. Production/sonraki revizyonlar kapsam dışı. |

## BL-068 — Beş maçlı yoğun fikstür (Implemented, 2026-10-19)

ADR-0047 / CR-034 / REQ-033. Five SENIOR fixtures accepted through existing
pairwise planning, preserving manual content/time/deletion and atomic writes.
Backend918/focused48/PostgreSQL HTTP21 pass, including all21 weekday combinations,
hour asymmetry, adjacent weeks, pins, concurrency and late-fault rollback.

## BL-067 — Dört maçlı yoğun fikstür (Implemented, 2026-10-19)

ADR-0045 / CR-033 / REQ-032. Four SENIOR fixtures accepted with actual-hour
adaptation and manual content/time/deletion protection. Backend913/focused43/
PostgreSQL HTTP19, including all35 weekday combinations, actual apply, cross-
Monday, concurrency, conflict and late-fault rollback pass. No migration.

## BL-066 — Üç maçlı yoğun fikstür (Implemented, 2026-10-19)

ADR-0044 / CR-032 / REQ-031. Three SENIOR fixtures supported in preview/apply and
enrolled date reconciliation; existing elapsed-hour presets, full manual/time/
deletion protection, concurrency and atomic rollback retained. Backend908 /
focused38 / PostgreSQL HTTP17 and restored UI proof pass. No migration.

## BL-065 — İki maçlı mikro döngü (Implemented, 2026-10-19)

ADR-0043 / CR-031 / REQ-030. Two-match SENIOR templates use actual kickoff hours,
compressed recovery/preparation and combined briefings. Manual phase/agenda/time
changes and deletion/exclusion tombstones remain; preview times pin on apply.
Unit/PostgreSQL transaction and restored UI verification cover interval changes,
cross-Monday, concurrent replay, conflict and late-fault rollback. No migration.

BL-027 local reactivation follow-up,2026-10-19: approved reload-persistence fix
complete using existing ADR-0018 flags. Actual reload/new-tab login preservation,
backend18/frontend20/dedicated HTTP9 verified. Production inputs remain BL-013/028;
no new source/model/migration or changed lifetime policy.
[Evidence](../30-quality/SESSION_PERSISTENCE_LOCAL_2026-10-19.md).

## BL-064 — Fikstüre bağlı otomatik program (Implemented, 2026-10-19)

ADR-0042 / CR-030 / REQ-029. Same-transaction date/program reconciliation, adjacent
weeks, complete-fingerprint protection of manual changes and durable deletion
tombstones. Explicit exclusions/history/completion/attendance remain protected.
Shared season lock and Serializable retry; conflicts/congested weeks fail without
partial writes. Authorized match-date dialog and result counts; guarded enrollment
preserves known local business rows. No migration/new scheduler.

BL-063 subsequent approved season extension complete: all41 weeks/ten teams,
2009 new physical sessions/504 meetings/1026 rest entries; original1963 rows across44
tables unchanged, retained replay adds zero. Fixture-free development and season
clipping verified; no migration/new API. Backend893/HTTP8/operator4 pass.
[Evidence](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

## BL-063 — Haftalık kulüp programı (Implemented; approved local rollout, 2026-10-19)

ADR-0040 / CR-029 / REQ-028. Unified chronological, paginated training/match/day
calendar; manual event/agenda management; editable preview and atomic multi-team
age-specific weekly programs. Actor-bound durable replay, per-team/week duplicate
protection, stale calendar and overlap rejection. Four actual phases and original
CLUB exercises per physical session, no fabricated global publication or players.
Approved Spor Manage 19–25 October local rollout: 51 physical sessions, 204 phases,
13 meetings, 26 rest entries across ten teams; existing 36 matches preserved.
Full backend 890 / frontend 478 / Sites 4; dedicated HTTP 7; browser responsive
and create/reload/edit flows verified. Root Windows/CDSK limits remain BL-061.
[Evidence](../30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).

## BL-062 — Hazır egzersizlerden planlama (Implemented; local publication complete, 2026-10-19)

ADR-0039 / CR-028 / REQ-027. Shared filters, preview, target-plan/create flow,
version-bound content/board snapshots and exact-age frozen totals implemented.
Backend 869 / Sites 4; frontend 473 pass / one existing undo timeout
(isolated rerun passes); disposable HTTP 9/9, clean and legacy
migration and idempotent import verified. Windows root quality/CDSK limitations
remain BL-061. Separately approved retained snapshot migration/import completed:
120 created, replay 0 created, backup restore and 38-table preservation verified.
Publication and Fatih Çelebigil's named approval are recorded. ADR-0041's local
same-account exception was explicitly accepted; all 120 are now PUBLISHED with
360 truthful transition audits. Dedicated maintenance tests 10/10 pass; new
backup/restore and 43-table preservation verified; publication replay writes zero.
Ordinary API review guards and production/future-review gates remain unchanged.
[Local publication](../30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).
Actual retained browser acceptance also passes: A Takım library/existing-plan
and in-plan preview/add, two authorized entries, total 121 / 6, correct copies and
day duration, original/other plans preserved, duplicate selection excluded.
[Browser evidence](../30-quality/READY_DRILL_RETAINED_BROWSER_2026-10-19.md).
Tablet/mobile follow-up also verified with two authorized retained attachments
on19 May:45→103min,4→6 entries. Responsive filter scrolling/touch size/overflow
and selected-plan identification corrected; focused19/19 and persistence pass.
[Responsive evidence](../30-quality/READY_DRILL_RESPONSIVE_BROWSER_2026-10-19.md).
[Evidence](../30-quality/READY_DRILL_PLANNING_2026-10-19.md).

## BL-061 — Windows quality runner ve validator taşınabilirliği (Done; root 17/17 verified, 2026-10-19)

- Priority: P2. Owner: TBD. Kalite araçları; uygulama davranışı değişmez.
- Global npm/Windows spawn engeli yerel npm12.2.0 + Node CLI çözümüyle giderildi.
  Fail-fast korunur; continue-on-error tüm aşamaları dener ve nonzero döner.
  LF checkout/EOL-auto politikası, izole Prisma kalite client/type/build ve
  yerel oturum ayarından bağımsız Socket testleri uygulandı.
- Kabul: Windows'ta gerçek npm executable çözümü, checkout EOL politikası ve
  ADR-0046 ile onaylanan repository içi CDSK proje profili belgelenir; workspace kapıları korunur. Toplu dosya
  biçimleme veya validator sonucunu taklit etme çözüm değildir.
- Önceki koşu16/17 geçti; dış kaynak eksikliği CDSK'yi durdurdu. Kullanıcının
  sonraki açık isteğiyle ADR-0046 yerel modeli onayladı: standard0.1.0 korunur,
  mevcut manifest/Boot/ADR sözleşmesi denetlenir; upstream eşdeğerliği iddia edilmez.
  Sekiz araç testi ve17 Python vaka (16 başarılı/bir Windows symlink yetki atlaması)
  geçti; yerel CDSK36 belge/46 ADR'de başarılı. Tam kapı17/17 ve exit0:
  backend913/frontend509/Sites4/araç8, tür/lint/biçim/derleme/178-belge bağlantıları
  ve whitespace başarılı. ADR numara çakışması yerel doğrulayıcı tarafından
  yakalandı; bu karar0046 oldu, dört maçlı program0045 olarak korundu.
  [Yeni kanıt](../30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md),
  [önceki koşu](../30-quality/QUALITY_GATE_WINDOWS_2026-10-19.md).

## BL-060 — Rehberli ilk kulüp kurulumu (Implemented, 2026-10-19)

- ADR-0037/0038 ve CR-027 açıkça onaylandı. Kulüp/logo/renk → sezon → tek
  A Takım ve altyapı → isteğe bağlı teknik kadro → kontrol akışı /app/setup'ta.
- Tek atomik final write; aktöre bağlı kalıcı replay/conflict/status; role/tenant,
  rollback ve eşzamanlı HTTP testleri; gerçek desktop/tablet/mobile QA tamamlandı.
- Teknik kişi/görev hesabı ve erişim grant'i oluşturmaz; davetler ayrı kalır.
  Renk migration'ı özel backup/restore sonrası ayrıca onayla yerel DB'ye uygulandı.
- [Kanıt](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md). Production rollout ve
  genel personel/sonraki sezon yönetimi bu dilimin kapsamında değildir.

## BL-059 — Workspace-aware pre-commit routing (Open, 2026-10-19)

- Priority: P2. Owner: TBD. Publication tooling only; runtime scope unchanged.
- Existing lint-staged invokes root ESLint for backend/frontend and CommonJS
  scripts. Browser globals and `require` are incorrectly rejected even though
  each workspace has its own lint configuration and quality commands.
- Acceptance: route staged files to their actual workspace configuration;
  preserve staged/user changes and validate browser, backend and Node scripts;
  no blanket lint exclusions, global hook disable or unrelated formatting.
- Current workaround: explicit `npm run quality`, script syntax checks and a
  command-scoped hook skip for the requested publication. No runtime fix applied.

## BL-058 — Sahne ve zaman çizelgesi (Implemented; local activation complete)

- Priority: P1 — profesyonel tahta yönünün sonraki önerilen dilimi. Owner: TBD.
- Dependencies: ADR-0036 A–D Accepted, CR-026, REQ-025; mevcut BL-057/V1 korunur.
- A–D açıkça onaylandı. BL-058a validator/saf zaman motoru uygulanıp hedefli
  63 backend + 63 frontend testiyle doğrulandı; bütün animasyon tamamlanmadı.
- Sıra: a) validator/zaman sözleşmesi, b) V2-aware API ve atomik token koruması,
  c) sahne editörü/undo, d) oynatıcı, e) snapshot/maç/export entegrasyonu ve QA.
- Kabul: V1 regresyonu, strict limitler, eski client overwrite reddi, tenant ve
  eşzamanlı yazım, snapshot izolasyonu, üç viewport, disposable E2E ve root quality.
- [Sözleşme ve kapılar](../10-architecture/TACTICAL_ANIMATION_V2.md).
- Production, retained veri dönüşümü/yazımı ve global editorial V2 bu tasarım
  onayla yetkilendirilmez. BL-058b API/token/legacy koruması uygulandı;
  disposable PostgreSQL HTTP 8/8 geçti. V2 yazımı varsayılan kapalıdır.
  BL-058c opt-in sahne editörü/undo, tam belge açık kaydı ve token istemcileri
  uygulandı; 36 hedefli test ve sentetik üç viewport QA geçti.
  BL-058d oynatıcı da uygulandı: 15 yeni test, üç viewport sentetik canvas QA.
  BL-058e.1 maç route metadata/token/dirty sekme entegrasyonu uygulandı;
  disposable HTTP 9/9 geçti. Retained V2 yazımı kapalı kalır.
- BL-058e.2 egzersiz metadata/create/kulüp kopyası uygulandı; atomik metadata/
  belge yazımı, sunucu kaynak/yetki kontrolü ve mobil taşma düzeltmesi eklendi.
  Disposable HTTP 14/14; migration status/diff temiz.
- BL-058e.3 antrenman fazı tam V1/V2 snapshot entegrasyonu uygulandı. Açık
  faz okuması, kaynak yetkisi/izolasyon, token çakışması, belirsiz kayıt
  doğrulaması ve ilk kayıtta undo korunur. Disposable HTTP 16/16; üç viewport
  sentetik browser QA ve root quality (843 backend / 442 frontend / 4 Sites) geçti.
- BL-058e.4 birleşik kabul geçti: V1/V2 kulüp kopyası → plan snapshot → maç,
  kaynak izolasyonu, JSON bütün sahneler ve PNG/SVG seçili sabit sahne.
  Disposable HTTP 18/18; gerçek route/API/PG browser akışı, üç viewport ve
  12 sahne/1.500 eleman/50 undo ölçümü; root quality 843/446/4 geçti.
- Repository uygulama/kabul kapısı kapalı. Kullanıcının 2026-10-19 isteğiyle
  yalnız Windows yerel retained ortamında kontrollü V2 aktivasyonu yapıldı.
  Yedek/restore ve ayrı pilot kayıt doğrulandı; toplu dönüşüm yoktur.
  Varsayılan flag kapalı kalır; production/sportif pilot ayrıca onay gerektirir.
  Owner/pilot ve production performans hedefi TBD; offline/video/3D bu teslimle kapanmaz.
- [Yerel aktivasyon kanıtı](../30-quality/TACTICAL_LOCAL_ROLLOUT_2026-10-19.md).
- [BL-058e.4 kanıtı](../30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).
- [BL-058e.3 kanıtı](../30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).
- [BL-058e.2 kanıtı](../30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).
- [BL-058e.1 kanıtı](../30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).
- [BL-058d kanıtı](../30-quality/TACTICAL_PLAYBACK_2026-09-26.md).
- [BL-058c kanıtı](../30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).
- [BL-058b kanıtı](../30-quality/TACTICAL_V2_API_2026-09-19.md).
- [BL-058a kanıtı](../30-quality/TACTICAL_V2_FOUNDATION_2026-09-19.md).

## BL-057 — Profesyonel taktik stüdyosu (2026-09-19)

2026-10-20 follow-up completes all nine shared-art equipment actions with flag,
ladder and marker. Existing dimensions/history/export behavior are retained.
[Evidence](../30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

2026-10-20 equipment family implemented from user-selected second concept:
six labeled horizontal actions, matching shared pitch art, mobile48px targets/
keyboard scrolling and vector export parity. Existing document/history contract
and other drawing tools remain.
[Evidence](../30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

2026-10-20 approved extension implemented: eleven illustrative pitch templates,
proportional single-scene anchor/arrow/line edits and one-step undo/fit; oversized
equipment rejects safely. Modern shared artwork and compact title/back toolbar
reclaim pitch space. V1/V2/schema/API and multi-scene pitch lock are preserved.
Authenticated desktop/tablet/mobile and named synthetic save/reload verified;
IAB downloaded-file inspection remains limited.
[Evidence](../30-quality/TACTICAL_PITCH_MODERN_2D_2026-10-20.md).

Increment 3 implemented: explicit existing-slot name assignment, confirmation,
number clearing, geometry preservation and one-step undo; unchanged V1.
[Evidence](../30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).
Next actionable step: scene/animation contract design and approval, not schema
implementation without an Accepted decision.
Sözleşme BL-058 / Accepted ADR-0036 içinde onaylanmıştır; BL-058a temel dilimi uygulanmıştır.

Increment 2 implemented: paged real-roster name snapshots (not Person binding),
multi-selection, bounded unit translation/copy/delete and atomic undo timeline.
Live A Team roster read and synthetic canvas drag/undo verified.
[Evidence](../30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).
Remaining: persistent identities/named units, animation, offline and 3D.

- Priority: P1 — user-approved; Owner: TBD.
- Dependencies: ADR-0035, CR-025, REQ-024; existing ADR-0012 V1 contract.
- First slice implemented: pitch-first 2D layout, shirt/disc presentation,
  shared equipment geometry, zoom/pan/fit, inspector/focus controls and compact
  metadata. Existing save/dirty/permissions and API remain unchanged.
- Acceptance: unit/export regression, typecheck/lint/format/build, isolated
  1672/1024/390 responsive QA; authenticated integrated route QA remains open.
- Next slices: roster binding/group tools, animation, offline match-day and
  optional 3D. Their data/security contracts require separate decisions.
- [Verification](../30-quality/TACTICAL_STUDIO_2026-09-19.md).

## Current UI migration — 2026-09-07

| ID     | Outcome                                                               | Priority                   | Owner | Dependencies                                                    | Acceptance criteria                                                                                                                                                                                                               | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | --------------------------------------------------------------------- | -------------------------- | ----- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BL-047 | Incremental NGCS shadcn design-system convergence                     | P2 — current user priority | TBD   | ADR-0011/0013; user UI migration brief                          | Classified inventory; semantic tokens; per-phase behavior/responsive gates; shared layouts/forms/data patterns; only proven unused CSS removed; no API/domain regression                                                          | In progress — phases 1–5 passed with 102 added tests; shared data states, full/compact pagination and four football-card catalogs verified. Phases 6–8 open. [Plan](UI_MIGRATION_PLAN.md), [latest evidence](../30-quality/UI_FOOTBALL_CARDS_2026-09-07.md)                                                                                                                                                                                                                                |
| BL-048 | Page-by-page migration to the approved 2026-09-07 white visual system | P2 — current user priority | TBD   | User screenshots; BL-047; available authenticated local runtime | Shared shell + Dashboard, then Teams and Matches, matched viewport screenshots, real API-only content, keyboard/mobile checks, `design-qa.md` passed before each slice closes                                                     | Done — Dashboard, Teams, Matches, Week, Trainings/detail, Library/Tactical Board/editor, Match detail, Players, Player 360, Squad, Attendance and Settings passed visual QA with retained exact-size desktop/tablet/mobile evidence and real API-only content. Pagination, visibility, import/export, dirty navigation, dated assignments, session behavior and permissions are preserved; no API/schema/data change. Next: product gap audit. [QA](../../design-qa.md).                   |
| BL-049 | Training plan edit, atomic permanent delete and catalogue UI repair   | P1 — user-approved         | TBD   | ADR-0026, CR-018, existing plan authorization                   | Edit sends only title/date/notes; linked DayPlan stays atomic; confirmed delete removes DayPlan/Attendance/PlanDrill/plan in one transaction; PLAYER/cross-tenant denied; cursor, focus, error and responsive UI regressions pass | Done — targeted unit/frontend suites, disposable PostgreSQL lifecycle E2E, root quality (663 backend, 268 frontend, 4 Sites) and combined visual QA passed; no schema/dependency/retained-data change.                                                                                                                                                                                                                                                                                     |
| BL-050 | Admin account directory and permission-management surface             | P1 — user-requested        | TBD   | ADR-0005/0008/0023/0027, CR-019                                 | Minimum-projection paged directory; SYSTEM_ADMIN platform and CLUB_ADMIN tenant scope; invite/access/status/reset/session actions; COACH/PLAYER denial; read-only sporting capability matrix; responsive and negative tests pass  | Done — backend/frontend unit tests, disposable PostgreSQL HTTP E2E and 1440/1024/390 browser QA passed; no schema/dependency/retained-data change.                                                                                                                                                                                                                                                                                                                                         |
| BL-051 | A Takım tekilliği ve altyapı takım yaşam döngüsü                      | P1 — user-approved         | TBD   | ADR-0022/0023/0028, CR-020                                      | Tek aktif A Takım; exact-season atomik create; yönetici academy edit/archive/restore; geçmiş korunumu; serbest kademe etiketi; coach/player salt-okunur; role/tenant/UI/migration kapıları geçer                                  | Done — 706 backend ve 276 frontend test, disposable PostgreSQL 16 migration/diff ve 3/3 lifecycle E2E geçti; retained-data clone hash'leri korundu; canlı Chrome QA mutation yapmadan geçti. [Evidence](../30-quality/TEAM_LIFECYCLE_VERIFICATION_2026-09-08.md).                                                                                                                                                                                                                          |
| BL-052 | Yerel A Takım ve U12/U14/U16/U18 kadrolarını kur                      | P1 — user-requested        | TBD   | ADR-0022/0028, BL-051                                           | Beş takım seçili sezona bağlı; her biri 18 aktif oyuncu; mevcut U18 oyuncuları korunur; sentetik kişiler hesap/PII üretmez; kurulum atomik ve tekrarlanabilir; Kadro canonical roster okur                                        | Done — 1 A Takım + 4 altyapı, 90 toplam aktif oyuncu; ikinci çalıştırma 0 yeni kayıt; frontend canonical Kadro testi ve veri postcondition sorguları geçti. [Evidence](../30-quality/LOCAL_DEMO_SQUADS_2026-09-09.md).                                                                                                                                                                                                                                                                     |
| BL-053 | A Takım/Altyapı navigasyonunu ayır ve kadro adlarını doğallaştır      | P1 — user-requested        | TBD   | ADR-0029, CR-021, BL-051/052                                    | İki ayrı sidebar/mobile route; sekmesiz dizin; legacy redirect; tek aktif menü; 90 benzersiz sentetik ad; hesap/PII/API/schema değişmez; route/data/idempotency/browser kapıları geçer                                            | Done — canonical A Takım/Altyapı rotaları, eski URL redirect'i, Chrome QA ve root quality 706/279/4 ile doğrulandı; 90/90 benzersiz ad, 0 Demo/E2E placeholder ve ikinci çalıştırmada 0 rename. [Evidence](../30-quality/LOCAL_DEMO_SQUADS_2026-09-09.md).                                                                                                                                                                                                                                 |
| BL-054 | A Takımı doğrudan kadro merkezine ve ortak oyuncu dizinine geçir      | P1 — user-approved         | TBD   | ADR-0022/0023/0030, CR-022, BL-053                              | Route-preserving scope sync; responsive native tablo/kart; URL arama/pozisyon/sıra; deterministik opaque cursor; tam ve self-scope özetleri; Player 360 ve hızlı bağlantılar; kalite/QA kapıları geçer                            | Implemented — strict backend cursor/scope, frontend route/liste regresyonları, disposable HTTP E2E, root quality ve canlı Chrome route/control smoke geçti; yeniden login sonrası 1672/1024/390 matched visual gate açık. Schema/migration/dependency/data değişmedi. [Evidence](../30-quality/FIRST_TEAM_ROSTER_CENTER_2026-09-09.md).                                                                                                                                                    |
| BL-055 | Player 360 ve oyuncu notlarını etkinleştir                            | P1 — user-approved         | TBD   | ADR-0022/0023/0031, CR-023                                      | Person bağlı not; URL sekme/filtre; capability/tenant/grant; revision/409; arşiv/restore; gövde-log gizliliği; activity ve responsive QA; migration/quality kapıları geçer                                                        | Implemented in repository and retained local DB — additive migration, 2 disposable PostgreSQL E2E, authenticated Chrome desktop flow and root quality (720 backend / 285 frontend / 4 Sites) pass. Responsive breakpoints/tests pass; new exact-size responsive capture remains TBD. [Evidence](../30-quality/PLAYER_360_NOTES_VERIFICATION_2026-09-09.md).                                                                                                                                |
| BL-056 | Profesyonel egzersiz kütüphanesi ve 120 içerik paketi                 | P1 — user-approved         | TBD   | ADR-0032–0034, CR-024, REQ-023                                  | Sürümlü model/yaş varyantı/kaynak; review/publish yetkisi; yayınlanmış katalog/detay/yönetim UI; 120 özgün DRAFT manifest; dry-run/idempotency; migration/backfill/test/docs kapıları                                             | In progress — foundation, local additive migration and 120 DRAFT manifest implemented; root quality, clean migration/diff, 5-record legacy backfill and disposable import pass. Separate user approval sonrası retained DB importu da idempotent geçti: 120 DRAFT, 5 unchanged PUBLISHED legacy, 120 audit event. Named expert review, 3×40 sporting approval waves, publication and exact-size browser QA remain TBD. [Evidence](../30-quality/PROFESSIONAL_DRILL_LIBRARY_2026-09-09.md). |

Phase 2 current primitive interaction gate is complete: 12 new tests, quality
655/164 and local Select/Dropdown/Tooltip/notification/tool-list keyboard checks.
[Evidence](../30-quality/UI_PRIMITIVES_VERIFICATION_2026-09-07.md).
Phase 3 pilot complete: shared layout on Dashboard/Settings, mobile menu name and
avatar visibility, native/asChild action typography scoped to PageActions; eight
new tests, quality 655/172 and responsive/keyboard checks passed.
Phase 4A account forms passed: 16 new tests, shadcn inputs/actions, shared field
and error presentation; native validation/token/session behavior retained.
Phase 4B.1 new-plan dialog passed: shared fields/error, scoped footer typography,
short-screen scroll, nine new tests and quality 655/197. No handler/API change.
Phase 4B.2 sporting assignment passed: shared FormField/native select and footer,
local short-screen scroll; unchanged handler, catalogs, required date (no min/max),
errors and reopening. Fifteen new tests, 24 targeted, quality 655/212; matched
responsive and keyboard checks without a real assignment write.
Phase 5A passed: shared data states on Players/Teams and shared pagination on
those directories plus the assignment adapter. Fourteen new tests, 26 targeted,
quality 655/226; matched responsive list and mobile empty-result checks.
Cursor/search/total/retry/permission behavior remains unchanged; no CSS deletion.
Phase 5B compact pagination passed: workspace commit-on-success and assignment
request-time cursor policies remain distinct; selection, busy/retry and visibility
preserved. Fifteen new/39 targeted tests and quality 655/241 plus four Sites
tests passed; no state/API/CSS rewrite.
Phase 5C and phase 5 passed: one FootballCard composition serves training, match,
library and tactics catalogs while route links, boardless non-link behavior,
metadata, totals and permissions remain unchanged. Four new/34 targeted tests,
quality 655/245 and responsive browser checks passed; eight proven card-only
selector blocks were removed.
Week passed phase 6. Next: Trainings and training detail. Other layout/shell consumers remain phase 6. Long overflowing board
lists remain phase 6/8 verification, not claimed by jsdom or the current fixture.
These visible audit findings predate the token migration; acceptance requires
named keyboard-accessible controls and consistent field separation without
changing validation. BL-043 pilot acceptance, BL-044/009 and M4 remain separate.

| ID     | Outcome                                        | Priority | Dependencies                             | Acceptance criteria                                                                                                                   | Status                                                                                                                                             |
| ------ | ---------------------------------------------- | -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-001 | CDSK başlangıç bağlamı                         | P0       | CDSK 0.1.0                               | Validator ve belge kontrolleri geçer                                                                                                  | Done                                                                                                                                               |
| BL-002 | Frontend kaynağı/topolojisi kararı             | P0       | Repository kanıtı ve owner onayı         | ADR karara bağlanır, gitlink bilinçli yönetilir                                                                                       | Done — monorepo workspace reserved                                                                                                                 |
| BL-003 | Prisma şeması/migration uzlaştırma planı       | P0       | Hedef DB ve veri durumu                  | Drift raporu, rollback ve onaylı ADR                                                                                                  | Done — clean baseline verified                                                                                                                     |
| BL-004 | Rol/yetki ve tenant izolasyonu                 | P0       | ADR-0005, BL-003                         | Negatif yetki testleri dahil onaylı eylem matrisi ve uygulama                                                                         | Done — ADR-0007 verified                                                                                                                           |
| BL-005 | Tekrarlanabilir kalite kapısı                  | P1       | Bağımlılık kurulumu                      | Lint, typecheck, test, build ve CDSK tek akışta geçer                                                                                 | Done — root quality gate verified                                                                                                                  |
| BL-006 | Dar MVP uçtan uca teslimi                      | P1       | BL-002–BL-005                            | Onaylı çekirdek senaryolar geçer                                                                                                      | Done — 3/3 core browser flows and root gate pass                                                                                                   |
| BL-007 | Kritik auth/bootstrap güvenlik tabanı          | P0       | ADR-0004                                 | Public privilege escalation, known JWT fallback, automatic admin seed ve passwordHash response yolları kapanır; unit test/build geçer | Done                                                                                                                                               |
| BL-008 | Hesap provisioning ve rol yaşam döngüsü kararı | P0       | BL-004, ADR-0004                         | Public kayıt/invitation, club assignment, first-admin ve role change politikası onaylanır                                             | Done — ADR-0008 verified                                                                                                                           |
| BL-009 | Sağlık ve ileri analitik erişim politikası     | P1       | Gizlilik/veri sahibi, ADR-0007           | Sağlık retention/audit ve analitik tenant sahipliği onaylanır; negatif testler eklenir                                                | Backlog — outside MVP                                                                                                                              |
| BL-010 | Frontend teknoloji ve ilk ürün akışı           | P0       | Persona, ADR-0003, backend API           | Framework/runtime, ilk ekran akışı, auth sözleşmesi ve kalite kapıları onaylanır                                                      | Done — ADR-0009 accepted                                                                                                                           |
| BL-011 | E-posta teslimi ve hesap recovery              | P1       | Provider/operations owner, ADR-0008/0020 | Davet/reset teslimi, verification ve admin-yok recovery süreci onaylanır                                                              | Done for vendor-neutral implementation — SMTP adapter, public completion and audited recovery verified; provider/production rollout remains M4 TBD |
| BL-012 | Koç frontend dikey dilimi                      | P0       | ADR-0009, görsel yön seçimi, BL-005      | Login, haftalık sezon, antrenman planı ve katılım akışı onaylı görsel hedefle çalışır                                                 | Done — real API and browser E2E verified                                                                                                           |
| BL-013 | Production origin ve kalıcı tarayıcı oturumu   | P0       | ADR-0010/0018, production/security owner | BL-027 uygulaması onaylı domain/provider/proxy/secret sözleşmesiyle staging ve rollout kapılarını geçer                               | In progress — provider-neutral implementation under BL-027; production inputs TBD                                                                  |
| BL-014 | Beş rotalı shadcn koç çalışma alanı            | P0       | ADR-0009, ADR-0011                       | Hafta, antrenman, taktik, kadro ve maç rotaları responsive kalite kapılarından geçer                                                  | Done — route/browser verified                                                                                                                      |
| BL-015 | Kulüp egzersizi ve ortak taktik tahta          | P0       | ADR-0012, BL-014                         | Sürümlü belge, tenant/sahiplik, plan snapshot ve maç tahtası uçtan uca doğrulanır                                                     | Done — unit/migration/E2E verified                                                                                                                 |
| BL-016 | Koç destek navigasyonunu genişlet              | P1       | ADR-0013, BL-014                         | Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve Ayarlar gerçek bağlamla açılır; masaüstü/mobil shell QA'dan geçer                       | Done — browser/design QA verified                                                                                                                  |

## 2026-09-05 MVP review backlog

Kaynak: [`MVP_REVIEW_2026-09-05.md`](../30-quality/MVP_REVIEW_2026-09-05.md).
Owner bilgisi doğrulanmadığı için bütün yeni işler `TBD` bırakılmıştır.

| ID     | Finding / outcome                                    | Priority | Owner | Dependencies                                            | Acceptance criteria                                                                                                                                                                               | Status                                                                                                                                                                 |
| ------ | ---------------------------------------------------- | -------- | ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-017 | Dashboard recent drill tenant izolasyonu             | P0       | TBD   | F-001, ADR-0005/0007/0014                               | İki kulüplü E2E'de CLUB_ADMIN yalnız global/kendi kulüp drill'lerini ve onaylı projection'ı görür                                                                                                 | Done — E2E verified                                                                                                                                                    |
| BL-018 | Aggregate ilişkilerinde group invariant              | P1       | TBD   | F-002, ADR-0014                                         | Plan↔drill ve season day↔plan farklı group bağlantıları reddedilir; bağlı plan sonradan sınır dışına taşınamaz                                                                                  | Done — E2E verified                                                                                                                                                    |
| BL-019 | Socket.IO recipient authorization                    | P1       | TBD   | F-003, ADR-0014                                         | Group B PLAYER/COACH, Group A presence/plan/attendance/drill payload'larını almaz                                                                                                                 | Done — current-recipient unit verified                                                                                                                                 |
| BL-020 | Taktik editörü iç navigasyon kayıp koruması          | P1       | TBD   | F-004                                                   | Sidebar, mobile nav, back ve programmatic navigate kirli durumda açık discard onayı olmadan rotayı değiştirmez                                                                                    | Done — Playwright verified                                                                                                                                             |
| BL-021 | Password reset single-winner transaction             | P2       | TBD   | F-005, ADR-0015                                         | Eşzamanlı iki completion'da yalnız biri başarılıdır; kaybeden parola/audit yazamaz                                                                                                                | Done — unit and PostgreSQL E2E verified                                                                                                                                |
| BL-022 | Tactical SVG güvenli serialization                   | P2       | TBD   | F-006, ADR-0015                                         | Canonical color allowlist ve XML escaping testleri geçer; enjeksiyon girdisi reddedilir                                                                                                           | Done — backend/frontend unit verified                                                                                                                                  |
| BL-023 | Kritik negatif test matrisi                          | P2       | TBD   | BL-017–BL-022                                           | Stats tenant, iki-group aggregate, Socket recipient, reset concurrency, board SVG ve dirty navigation testleri kalite kapısına bağlanır                                                           | Done for F-001–F-006; broader approved-MVP DTO/log coverage completed by BL-024                                                                                        |
| BL-024 | Log redaction, DTO ve analytics lint temizliği       | P3       | TBD   | F-008, observability owner                              | Raw error/operational metadata politikaya uygun redacted; kritik body'ler DTO ile doğrulanır; analytics warning'leri kapanır                                                                      | Done for approved MVP — analytics lint/DTO inventory and scoped mutation containment verified; global policy and outside-MVP prototypes remain separate decision gates |
| BL-025 | Prisma production advisory kararı                    | P2       | TBD   | M4, ADR-0016                                            | 3 high advisory için kanıtlı upgrade/downgrade/acceptance kararı ve lockfile audit kanıtı kaydedilir                                                                                              | Done — not_actionable runtime triage; temporary risk accepted                                                                                                          |
| BL-026 | Runtime ve migrator image ayrımı                     | P1       | TBD   | ADR-0017, CR-012                                        | Runtime image Prisma CLI/test/build paketlerini içermez; ayrı migrator aynı revision/lockfile ile yalnız onaylı deploy migration'ını çalıştırır                                                   | Done — image inventory, clean migration/idempotency, runtime smoke and E2E verified                                                                                    |
| BL-027 | Provider-neutral kalıcı oturum uygulaması            | P1       | TBD   | ADR-0018, CR-013                                        | Default-disabled flag; 15m/7d/30d/five-family policy; CSRF/origin, atomic rotation/replay, logout/lifecycle, retention, reload ve quality doğrulanır                                              | Done — quality, migration, backend 18/18 E2E, browser opt-in 4/4 and flag-off 3/3 verified                                                                             |
| BL-028 | M4 staging/rollout sözleşmesi ve rollback kapıları   | P1 — M4  | TBD   | BL-013, ADR-0010/0017/0018, kullanıcı altyapı girdileri | Provider/origin/owner ve operasyon kararları onaylanır; readiness, ayrı DB yetkisi, flag-off production CORS, proxy/rate-limit, restore/rollback staging kanıtları kaydedilir                     | Input required — [karar girdileri](../40-operations/M4_ROLLOUT_INPUTS.md); implementation not approved                                                                 |
| BL-029 | Yeni taktik taslağında doğru kayıt durumu            | P3       | TBD   | Yerel browser smoke; ortak TacticalBoardEditor          | Yeni kayıt kaydetmeden “Kaydedildi” göstermez; başarılı save sonrası doğru durum, hata/dirty/undo ve mevcut tahta durumları regresyonla korunur                                                   | Done — 7 component regressions, new-draft/match browser smoke and root quality passed; API/schema unchanged                                                            |
| BL-030 | Faz ekleme sonrası ortak plan süre/faz özeti         | P2       | TBD   | Yerel demo plan akışı; WorkspaceProvider                | Drill ekleme sonrası ortak liste/takvim verisi reload beklemeden güncellenir; route/context regresyonu geçer                                                                                      | Done — successful mutation refreshes workspace; regression and root quality passed                                                                                     |
| BL-031 | Sezon mutation nested-write / mass-assignment sınırı | P0       | TBD   | F-009, ADR-0007/0012/0014                               | Hafta create/update yalnız izinli alanları yazar; reparent ve nested days işlemleri geçmez; maç create tahta validator'ını atlayamaz; meşru akış ve iki-kulüplü negatif HTTP testleri geçer       | Done — field projection, 33 focused tests and disposable PostgreSQL 22/22 E2E verified                                                                                 |
| BL-032 | Kulüp create mass-assignment ve grup DTO sınırı      | P1       | TBD   | F-010, ADR-0007                                         | POST /clubs yalnız name/logo/description yazar; nested ilişki/kimlik/timestamp geçmez; grup enum/default/member ve auth-before-validation sözleşmeleri ile sabit hata logları unit/HTTP testlidir | Done — 84 focused tests, independent review and disposable PostgreSQL 23/23 E2E verified                                                                               |
| BL-033 | Atomik grup silme ve mutation hata containment'ı     | P1       | TBD   | F-011, BL-024, ADR-0007                                 | Foreign-key nedeniyle grup silme başarısızsa üyelikler korunur; başarılı silme ikisini de kaldırır; update/delete ve duplicate/missing üyelik yolları generic cause-free 500 + sabit olay üretir  | Done — 11 new error-boundary tests, 56 focused group tests and disposable PostgreSQL 24/24 E2E verified                                                                |
| BL-034 | Kulüp update ve drill mutation hata/body sınırı      | P2       | TBD   | F-012, BL-024, ADR-0007/0012                            | Club update ve drill create/update/delete persistence hataları fixed-event generic 500'dür; null/array/primitive drill body 400 olur; update authorization sırası korunur                         | Done — 12 new regressions, 56 focused club/drill tests and disposable PostgreSQL 25/25 E2E verified                                                                    |
| BL-035 | Attendance mutation hata containment'ı               | P3       | TBD   | BL-024, ADR-0007                                        | Lookup/update/create persistence hataları generic cause-free 500 + tek sabit olaydır; valid create/update ve authorization davranışı korunur                                                      | Done — 3 new error-boundary tests, 27 focused attendance tests, root quality and disposable PostgreSQL 25/25 E2E verified                                              |
| BL-036 | Attendance tekillik ve atomik upsert kararı          | P2       | TBD   | F-013, CR-014, ADR-0019, data owner                     | `(planId, playerId)` duplicate envanteri ve temizleme kuralı; unique constraint; concurrent mark sonucu/son-yazım politikası; forward/rollback migration kanıtı                                   | Done — 0-row retained inventory and local additive rollout; fail-fast/clean migration evidence, 24 focused unit and concurrent PostgreSQL 26/26 E2E verified           |
| BL-037 | Season mutation hata containment'ı                   | P3       | TBD   | BL-024, ADR-0007/0012/0014                              | Season/week/day/match persistence ve missing-record framework yolları generic cause-free 500 + sabit olay üretir; explicit 400 doğrulama ve başarılı akışlar korunur                              | Done — 8 new error-boundary tests, 42 focused season tests, root quality and disposable PostgreSQL 25/25 E2E verified                                                  |
| BL-038 | Training-plan mutation hata containment'ı            | P3       | TBD   | BL-024, ADR-0007/0012/0014                              | Plan create/update/delete, add/replace drill ve board snapshot persistence hataları generic cause-free 500 + sabit olay üretir; explicit 400, fail-soft link ve başarılı akışlar korunur          | Done — 11 new error-boundary tests, 122 focused training-plan tests, root quality and disposable PostgreSQL 25/25 E2E verified                                         |

## Kalan genel eksikliklerin sırası — yerel çalışma

BL-024'ün onaylı MVP kapsamı tamamlandı. Sıradaki işler karar kapılarıdır; owner
`TBD`. Yerel kullanıcı DB kopyası korunur; production rollout beklemede kalır.

1. **Tamamlanan BL-024 dilimi:** Analytics adapter'ın 41 unused-variable uyarısı
   mevcut alan eleme/sayı/tarih dönüşümleri korunarak kaldırıldı. Planın opsiyonel
   sezon bağlantısındaki ham hata ve kaynak metadata logları yalnız sabit Nest
   Logger olaylarına indirildi; debug-only sezon/hafta sorguları kaldırıldı.
   `PUT /training-plans/:id/drills` mevcut servis kurallarını (50 faz, drillId,
   phase, integer order, notes) controller'da `.map()` öncesinde ortak runtime DTO
   parser'ıyla uygular. Plan ve drill yetkisi ile service-level kontrol korunur.
2. **Tamamlanan ikinci dilim:** `GroupsService.create` raw console ve Nest'in
   yeniden ham hata loglama yolu tek sabit `GROUP_CREATE_FAILED` olayına indirildi;
   generic HTTP 500 yanıtı ve category default'u korundu. Attendance mevcut
   `PRESENT/ABSENT`, planId/playerId türleriyle doğrulanır; add-drill replace ile
   aynı faz/order/notes kurallarını kullanır. Controller ve servis girişleri ile
   yetki reddi testlidir. Bu dilim global exception/redaction politikası değildir.
3. **Tamamlanan üçüncü dilim:** Plan create/update controller ve service runtime
   DTO ile doğrulanır. Principal kimlik türetme, nullable alanlar, Int şema sınırı,
   timezone'lu gerçek tarihler, explicit field projection ve group aggregate
   kuralları korunur. 58 yeni unit ve iki PostgreSQL/HTTP E2E regresyonu eklendi;
   dedicated disposable PostgreSQL üzerinde toplam 20 backend E2E geçti.
4. **Tamamlanan dördüncü dilim (2026-09-06):** Season/week/day/match runtime DTO;
   nullable/default/date/JSON davranışı ve 80 hafta/group invariant'ları korundu.
   İncelemede bulunan nested-write açığı ayrıca F-009/BL-031 olarak kapatıldı;
   field projection controller ve service girişlerinde uygulanır. 31 yeni unit,
   iki HTTP/Prisma regresyonu; disposable PostgreSQL'de toplam 22 E2E geçti.
5. **Tamamlanan beşinci dilim (2026-09-06):** Group/club create/update/member
   runtime DTO'ları; mevcut enum/default/null/empty ve tenant-yetki sırası korunur.
   POST /clubs mass-assignment F-010/BL-032 ile kapatıldı. Kulüp ve club-group
   create persistence hataları generic 500 + sabit olayla sınırlandı. 84 focused
   test, bağımsız inceleme ve disposable PostgreSQL'de toplam 23 E2E geçti.
6. **Tamamlanan altıncı dilim (2026-09-06):** Group update/delete ve üyelik
   add/remove hata yolları cause-free generic 500 + sabit olaya indirildi.
   Duplicate/missing üyelikte mevcut 500 status'u korundu. F-011/BL-033 kapsamında
   üyelik ve grup silme tek transaction'a alındı; foreign-key ile reddedilen silme
   üyelikleri geri alır. 11 yeni error-boundary testi, toplam 56 focused group testi,
   root quality'de 336 backend testi ve disposable PostgreSQL'de 24/24 E2E geçti.
7. **Tamamlanan yedinci dilim (2026-09-06):** Envanterde MVP içindeki `any`
   mutation body kalmadığı; kalanların sağlık/ileri analitik prototiplerinde olduğu
   doğrulandı. F-012/BL-034 ile club update ve drill create/update/delete persistence
   yolları generic cause-free 500 + sabit olaya bağlandı. Drill null/array/primitive
   body 400 olur; update authorization-before-validation sırası korunur. 12 yeni
   regresyon, toplam 56 focused club/drill testi, root quality'de 348 backend testi
   ve disposable PostgreSQL'de 25/25 E2E geçti.
8. **Tamamlanan sekizinci dilim (2026-09-06):** Attendance lookup/update/create
   persistence hataları generic cause-free 500 + `ATTENDANCE_MARK_FAILED` olayına
   bağlandı; validation, authorization ve başarılı create/update korunur. Üç yeni
   error-boundary testiyle toplam 27 focused attendance testi, root quality'de 351
   backend testi ve disposable PostgreSQL'de mevcut 25/25 E2E geçti.
9. **Tamamlanan dokuzuncu dilim (2026-09-06):** Season/week/day/match create,
   update, delete, toggle, tactical-board ve week-generation persistence/missing
   yolları generic cause-free 500 + işlem türüne özel sabit olaylara bağlandı.
   Transaction içindeki mevcut açık `BadRequestException` doğrulamaları aynen
   yeniden fırlatılır; yeni 404 veya genel hata zarfı tanımlanmadı. Sekiz yeni
   error-boundary testiyle 42 focused season testi, root quality'de 31 suite/360
   backend testi ve disposable PostgreSQL'de mevcut 25/25 E2E geçti.
10. **Tamamlanan onuncu dilim (2026-09-06):** Training-plan create/update/delete,
    tek faz ekleme, faz listesini değiştirme ve board snapshot lookup/write
    persistence yolları generic cause-free 500 + işlem türüne özel sabit olaylara
    bağlandı. Transaction içindeki explicit `BadRequestException`, başarılı
    atomik mutation ve opsiyonel season-day fail-soft bağlantısı korundu. On bir
    yeni error-boundary testiyle 122 focused training-plan testi, root quality'de
    32 suite/371 backend testi ve disposable PostgreSQL'de mevcut 25/25 E2E geçti.
    Statik yeniden taramada onaylı MVP mutation body/log kapsamı temiz bulundu;
    BL-024 ve F-008 onaylı MVP için kapandı.
11. **Tamamlanan attendance kararı (2026-09-06):** ADR-0019 Option 1 açıkça
    onaylandı. Duplicate varsa veri silmeden duran migration, birleşik unique
    constraint ve atomik upsert uygulandı. Retained envanter 0 satır/0 duplicate;
    clean/duplicate migration kanıtları, 24 focused unit ve concurrent HTTP dahil
    disposable PostgreSQL 26/26 E2E geçti. Ayrı açık onayla korunan yerel DB'ye
    reset yapmadan uygulandı; status güncel ve unique index doğrulandı.
12. **Tamamlanan hesap teslimi/recovery (2026-09-06):** ADR-0020 Option A onaylandı;
    development/test operator modu, production SMTP fail-closed config, tokenı
    fragment'tan temizleyen public rotalar, delivery failure revoke + generic 503,
    additive recovery audit ve mevcut SYSTEM_ADMIN'e sınırlı maintenance komutu
    uygulandı. Provider hesabı, DNS ve production rollout oluşturulmadı.
13. **Sıradaki/açık karar kapıları:** BL-013/028 production
    origin/provider/proxy/secret, DB rolleri, backup ve gözlemlenebilirlik.
    Log retention/veri sınıflandırma politikası bu yerel temizlikle karara bağlanmaz.
14. **Ürün kararları:** Browser matrisi, formal erişilebilirlik ve başarı metrikleri
    `TBD`. Sağlık/scouting/ileri analitik MVP dışıdır; lint temizliği bu uçları koça
    açmaz ve onların DTO/tenant politikalarını tamamlanmış saymaz.
    Plan title uzunluğu/boşluk kuralı ve manuel totalDuration için ürün aralığı
    `TBD`; DTO temizliği bu politikaları tahmin ederek değiştirmez.

## Phase 2 P0.1 backlog — 2026-09-06

| ID     | Outcome                                           | Priority             | Owner | Dependencies                                 | Acceptance criteria                                                                                                                                                 | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------- | -------------------- | ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-039 | Sportif organizasyon kernel'i                     | P0                   | TBD   | ADR-0021/0022, CR-016                        | Person/account, Team/TeamSeason ve etkili tarihli Assignment additive şema/backfill ile doğrulanır                                                                  | Done in repository — legacy backfill and empty schema diff verified                                                                                                                                                                                                                                                                                                                                                                                           |
| BL-040 | Capability kapsamlı sporting API                  | P0                   | TBD   | ADR-0023, BL-039                             | Team/player/history/availability/assignment sınırları mass-assignment ve iki-kulüp negatif testleriyle geçer                                                        | Done — unit and PostgreSQL E2E verified                                                                                                                                                                                                                                                                                                                                                                                                                       |
| BL-041 | Takım çalışma alanı ve Player 360 başlangıcı      | P0                   | TBD   | BL-039/040                                   | Takımlar, tarihli kadro, oyuncu dizini, zaman çizelgesi ve atama diyaloğu 1440/1024/390 px'de çalışır                                                               | Done — browser E2E verified                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| BL-042 | Legacy/new-model reconciliation ve dual-write     | P1                   | TBD   | BL-039, ADR-0022/0023, CR-016                | Legacy yazımlar ve sportif projection tek transaction'dadır; admin parity raporu, kalıcı Club/Season/Team seçimi, rollback ve revocation testleri geçer             | Done — repository and approved local rollout verified; production excluded                                                                                                                                                                                                                                                                                                                                                                                    |
| BL-045 | Tüm sezonlar kapsamında ortak sezon etiketi       | P3                   | TBD   | BL-042                                       | All-seasons seçiminde sidebar/hafta alt başlığı Sezon TBD yerine Tüm sezonlar gösterir; gerçek eksik sezon TBD kalır; regresyon testi geçer                         | Done — shared explicit-scope label across sidebar/top bar/week/dashboard/settings; 10 regressions, root quality and local browser transitions pass; [evidence](../30-quality/BL045_SEASON_LABELS_2026-09-07.md)                                                                                                                                                                                                                                               |
| BL-043 | Sporting list pagination ve ölçek sınırı          | P2                   | TBD   | Pilot veri hacmi ve performance owner        | Team/player/assignment listeleri ölçülen veri hacmiyle pagination ve sorgu bütçesi uygular                                                                          | In progress — a–j synthetic slices delivered; [three clean-start mixed read/write and SELECT row-work runs](../30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md): 30/300 members, 150/1500 plans, 47 SQL events per five-GET/two-POST batch; some scan work grows. Pilot acceptance remains open: owner, representative workload/data, environment and budgets TBD; sustained sessions/sporting/history/broader mutation workload still requires validation |
| BL-046 | Plan editor JSON yükünü ayrıştırma                | P2                   | TBD   | BL-043i, approved CR-017 / Accepted ADR-0025 | Tam faz metadata + tekil effective board; kaynak yetkisi, draft/undo, sıralama ve mevcut yazımlar korunur; iki hacimde payload/projection ve tüm regresyonlar geçer | Done — a/b/c verified; [three matched 2/50-phase runs](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md), 50-phase JSON 996,545 → 24,040 bytes; quality/API/browser gates pass. Production capacity and broader BL-043 remain open                                                                                                                                                                                                                |
| BL-044 | Minor/safeguarding ve sportif uygunluk politikası | P0 before production | TBD   | Legal/privacy/security owner, ADR-0023       | Hukuki dayanak, guardian/minor erişimi, retention, audit/export/delete ve klinik sınır onaylanır                                                                    | Blocked by policy inputs — no clinical data enabled                                                                                                                                                                                                                                                                                                                                                                                                           |
