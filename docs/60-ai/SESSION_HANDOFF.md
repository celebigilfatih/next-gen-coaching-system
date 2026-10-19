# Session Handoff

## Final publication check — 2026-10-19

User requests commit/push to existing codex/mvp-stabilization; main must stay.
Fresh full root17/17 exits0: backend918/frontend509/Sites4/tooling8, all types,
lint/format/build, CDSK36 documents/47 ADRs,180-file links and whitespace pass.
Additional dedicated PostgreSQL HTTP36/36 (setup6/content9/planning21), operator
guards8 and JS syntax9 pass. Two opt-in operator DB tests are skipped, not counted.
Output baselines/helpers, env and Python caches are excluded from Git; staged
text hygiene scan has no findings. No deployment/migration/retained data write.
Use explicit HEAD:refs/heads/codex/mvp-stabilization without force; local/remote
main baseline is1b831e087b727b80bfed0d47005bb0b95fa0852f. No hook bypass configured;
existing repository identity is supplied only to the commit command. Verify final
commit/upstream and clean tree in Git; this dated report records the pre-push gate.
[Review](../30-quality/PRE_PUSH_REVIEW_2026-10-19.md).

## Repository-owned CDSK — 2026-10-19

Explicit user request authorized the local validator model in Accepted ADR-0046.
Node wrapper defaults to tracked scripts/cdsk/validate_project.py; Python3.9+
standard library only. CDSK0.1.0 manifest/36-file baseline, Boot/Constitution/ADR
structure and safe paths are enforced by documented project profile revision1.
Upstream rule parity remains unverified; do not describe it as vendored official
code. Eight tooling tests include17 Python cases (16 pass/one Windows symlink
privilege skip). Full root17/17 passes with exit0: backend913/frontend509/Sites4/
tooling8, types/lint/format/builds,178-file links, CDSK36 documents/46 distinct ADRs
and whitespace. Final focused8/8 passes after parser/identity fixes too. BL-061
complete. Temporary duplicate0045 was resolved by assigning this task's new
validator decision0046; four-match planning retains0045. Preserve all concurrent
application/data/UI edits and persistent sessions; no migration/reset is needed.
[Evidence](../30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md).

## Repository publication preparation — 2026-10-19

User requested commit and push. Delivery target is the existing
`codex/mvp-stabilization` branch; no force push or `main` update. Accumulated
approved implementation/tests/assets/context are included, temporary CLI
recordings and environment/output files excluded. Confirm commit/upstream
outcome in Git. This does not activate V2 writes or authorize data/production
rollout; controlled retained activation remains separately pending.
Legacy lint-staged runs root ESLint for all workspaces, producing browser-global
and CommonJS false positives. BL-059 tracks a scoped hook repair. No permanent
hook configuration change: publication may use command-scoped `HUSKY=0` only
with explicit workspace quality and script syntax checks recorded.
Fresh quality passed: 843 backend / 446 frontend / 4 Sites, typecheck/lint/format,
builds, 143 Markdown files with no broken links, CDSK and whitespace; script
syntax checks passed. Log: `/private/tmp/ngcs-pre-push-quality-2026-10-19.log`.
Lockfile installs changed no dependency versions. No new database/E2E run is
claimed by this publication check; prior tactical HTTP evidence remains dated.

## Tactical combined acceptance — 2026-10-03

BL-058e.4 repository acceptance passed; REQ-025 implemented in repository,
retained rollout pending. Added four editor export/import regressions and two
parameterized combined V1/V2 HTTP flows. Complete disposable HTTP 18/18,
migrations current/diff empty, root quality 843 backend / 446 frontend / 4 Sites.
Actual routes + NestJS + disposable PostgreSQL browser flow (synthetic workspace
and authenticated bootstrap, no login/shell claim) preserves JSON scenes,
selected PNG/SVG, phase/match snapshots and independent tokens. Source scene
counts 3/2/2 prove isolation. Three viewport and bounded 12-scene/1,500-element/
50-undo observations recorded; not a production FPS or sporting pilot claim.
Only tests/context changed this slice; no retained flag/data/schema/dependency.
Next: separately approved controlled retained rollout, with exact DB/process
identity, backup, V1 smoke and V2-aware rollback. Do not infer activation from
repository acceptance; offline/video/3D and physical tablet pilot remain TBD.
[Evidence](../30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).

## Tactical training integration — 2026-09-26

BL-058e.3 connects on-demand training phases to whole V1/V2 documents. GET/PUT
plan envelopes add phase identity and source/snapshot origin; legacy `/board`
is unchanged. Explicit saves preserve first-save undo and adopt only validated
success tokens. On uncertain responses, verification may acknowledge the exact
already-persisted snapshot without a repeat PUT; different content never gives
the draft a refreshed overwrite token. Snapshot source authorization remains.
Disposable HTTP 16/16, migrations current/diff empty, three-viewport synthetic
browser and root quality passed: 843 backend / 442 frontend / 4 Sites tests.
Mobile hero overflow corrected (396 → 390px). No retained data/flag changes.
Next e.4 combined integration/export/compatibility acceptance, then separately
authorized rollout; BL-058/REQ-025 still In progress. Existing ADR-0036 covers
this step; no new schema/dependency/security decision.
[Evidence](../30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).

## Tactical drill integration — 2026-09-26

BL-058e.2 connects tactics new/detail to authorized board-free metadata and
full V1/V2 documents. Atomic metadata/document saves and source-token-checked
club create/copy live in TacticalDocumentService. Global editorial remains V1;
ownership derives from authorized target group. PLAYER/non-owner coaches are
readonly; busy/dirty/conflict behavior preserves drafts. Mobile overflow fixed.
Disposable HTTP 14/14; migrations current and schema diff empty. Retained
V2 flag/data unchanged. [Evidence](../30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).
Root quality: 840 backend / 429 frontend / 4 Sites; all gates passed.
Next e.3 training phase/snapshot integration, then e.4 combined acceptance.
No new ADR approval needed for these already accepted integration slices;
retained rollout still requires separate explicit approval.

## Tactical match integration — 2026-09-26

BL-058e.1 connects MatchDetailRoute to board-free metadata and lazy token-bound
V1/V2 document editing/playback. ResourceBoard preserves drafts on conflict,
disabled V2 writes and uncertain failures; no auto token refresh/retry. Tab exit
uses the editor guard and actually unmounts on confirmed discard/leave. Returning
reads the saved document. Session/role/scope keys prevent stale resource reuse.
PLAYER analysis and board mutations are hidden/disabled; server remains authority.
Disposable PostgreSQL 16 HTTP 9/9, no new migration or retained writes.
Root quality: 824 backend / 416 frontend / 4 Sites tests; all gates passed.
[Verification](../30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).
Next e.2 drill metadata/create/copy, e.3 training snapshot, e.4 combined export/
integration QA. V2 writes remain off; no claim of complete animation rollout.

## Tactical playback — 2026-09-26

BL-058d adds explicit play/pause/restart/seek, speed, loop, reduced-motion and
interruption cleanup to the opt-in shared scene editor. Preview cannot mutate
or save interpolated coordinates. Scene selection exits preview; dirty
navigation still supports Save and leave. 15 new transport/component tests
and synthetic real-Konva QA at 1672×941, 1024×900, 390×844 pass.
Root quality: 821 backend / 405 frontend / 4 Sites; all gates passed.
[Evidence and initial unreproduced QA observation](../30-quality/TACTICAL_PLAYBACK_2026-09-26.md).
Next BL-058e: actual metadata/document/token route coordination, club copy,
plan snapshot, match, export and disposable E2E. Existing routes remain V1,
retained V2 writes remain off; no data/schema/dependency/production change.
Do not re-request ADR-0036 A–D approval or present the full feature as live.

## Tactical scene editor — 2026-09-19

BL-058c: opt-in `onSaveDocument`, scene strip/operations/settings, whole-document
undo/dirty/save, explicit conversion, bounded import and full-document JSON.
GET/PUT clients preserve caller tokens; conflicts do not retry or overwrite.
36 focused tests and isolated headed browser QA (1672/1024/390) pass. Existing
V1 route callbacks remain intact; no retained flag/data or backend changes.
Final root quality: 821 backend / 390 frontend / 4 Sites; all checks pass.
[Evidence](../30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).
Next BL-058d playback/pause/seek/speed/reduced-motion. BL-058e owns actual
route metadata/document/token loading, club copy/snapshot/match/export E2E,
then a separately authorized rollout. Do not claim the animation UI is live.

## Tactical V2 server compatibility — 2026-09-19

BL-058b implements all three additive document adapters, canonical write tokens,
Serializable authorization/read/compare/write, source/snapshot provenance and
legacy downgrade/read protection. Route-specific parser limits are verified
with gzip and exact byte boundaries. Disposable PostgreSQL HTTP suite passes
8/8; V2 writes remain default-off and retained settings/data were not changed.
Final root quality passes 821 backend / 369 frontend / 4 Sites, build,
typecheck/lint/format/CDSK/links/whitespace. A Radix/jsdom teardown flake on an
earlier attempt did not recur in the isolated 15-test run or final quality run.
[Evidence](../30-quality/TACTICAL_V2_API_2026-09-19.md).
Next BL-058c scene editor/undo/token-aware Save; playback/integration/browser
gates remain open. No migration, dependency, production, seed/reset or UI change.

## Tactical scene/animation design — 2026-09-19

[ADR-0036](../50-decisions/ADR-0036-tactical-scenes-and-playback.md) A–D explicitly
Accepted; CR-026 approved / REQ-025 / BL-058 In progress. BL-058a validator and
pure absolute-time motor implemented; 63 targeted tests in each app, mirrored
core compilation parity and shared fixtures. Existing HTTP/editor stays V1-only.
Root quality passed: 788 backend / 369 frontend / 4 Sites tests, builds and
typecheck/lint/format/CDSK/Markdown/whitespace gates.
[Evidence](../30-quality/TACTICAL_V2_FOUNDATION_2026-09-19.md).
Next: BL-058b API/token/legacy safety, then scene editor, playback, integration/QA.
Do not ask again for A–D approval. No DB/schema/dependency/retained write.
Global editorial V2, Person binding, MP4/GIF, offline and 3D excluded.

## Tactical increment 3 — 2026-09-19

Shared editor supports explicit roster-name assignment to an existing slot,
confirmation/cancel focus, old-number clearing, geometry/type preservation,
single-step undo and the unchanged explicit Save. No Person link, API or DB
change. Root quality passed 725 backend / 306 frontend / 4 Sites tests.
[Evidence](../30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).
Next: Proposed scene/timeline/animation contract; do not silently extend V1.

## Tactical increment 2 — 2026-09-19

ADR-0035 / BL-057: real roster name snapshots and transient multi-selection/
unit tools implemented. Backend and retained records unchanged. History/index
now update together; only single selection uses Konva Transformer to avoid
multi-drag duplicate commits. Live roster read returned 18 A Team players;
user's unsaved board was not saved/deleted by QA. Use
[verification](../30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).
Persistent Person binding, formation-slot fill, animation/offline/3D remain open.
Closure: root quality passed 725 backend / 303 frontend / 4 Sites; 132 Markdown
files, CDSK and whitespace checks passed. Preview remains on port 3132.

- **2026-09-19 tactical studio:** First 2D slice under ADR-0035 is implemented.
  Shirt/disc art and equipment share geometry across Konva/SVG; compact editor,
  zoom/pan/fit, panel toggle and focus view preserve V1 and dirty behavior.
  [Verification](../30-quality/TACTICAL_STUDIO_2026-09-19.md) carries test/browser
  evidence and limits. Continue with roster identities/group tools next; no
  animation, offline, live collaboration or 3D completion is claimed.

- **Latest follow-up — 2026-09-09 drill review UX:** The two reported approve
  `403`s are expected ADR-0034 self-review denials: imported drafts are authored
  by `system.admin@ngcs.local`, and retained DB has no active independent
  DRILL_CONTENT_REVIEW account. No status/capability was mutated. Management UI
  now disables author approve/reject actions and explains the reviewer boundary.
  Root HydrateFallback and `/favicon.svg` remove reported loading/404 console
  noise. Targeted 9 tests, typecheck, lint and clean Playwright console
  (0 warnings/errors) pass. Next gate remains naming/assigning an independent
  football expert before the first 40-item review wave.

- **Latest — 2026-09-09 professional drill library:** Additive
  `DrillVersion`/`DrillAgeVariant`/`DrillSource` models, strict professional
  content validation and DRAFT→review→publish workflow implement ADR-0032–0034.
  Direct global mutation is closed; self-review is denied and final publish/
  archive is SystemAdmin-only. The catalog resolves published age variants and
  supports server filters; library detail and management routes expose content,
  provenance and queue actions. A deterministic repository manifest contains
  120 original Turkish DRAFT exercises with checksums and valid boards. Clean
  PostgreSQL 16 deploy/status/diff, 5→5 legacy backfill and disposable importer
  idempotency (120 then 0) pass. After separate explicit user approval, the same
  package was imported into retained `ngcs_local_session_dev` as DRAFT only;
  replay imported 0/skipped 120. Postconditions are 120 DRAFT, 5 unchanged
  PUBLISHED legacy versions, 120 NGCS-original sources and 120 draft-created
  audit events. Named football expert, three review waves, publication and
  exact-size browser QA remain `TBD`. Tracking: ADR-0032–0034, CR-024, REQ-023,
  BL-056. Root quality passes with 725 backend, 286 frontend and 4 Sites tests.
  Production was not changed.
  [Evidence](../30-quality/PROFESSIONAL_DRILL_LIBRARY_2026-09-09.md).

- **Latest — 2026-09-09 Player 360 and player notes:**
  `/app/players/:personId` now opens a compact, localized profile with URL-backed
  Overview, Notes, Activity and Journey tabs. The date selector affects only
  Journey; raw enums, repeated `TBD`/`N/A` evidence and unsupported match/readiness
  claims are removed. Person-linked notes support category/team/text/follow-up
  filters, 250 ms query settling, cursor continuation, a responsive Sheet,
  optimistic `expectedVersion`, immutable revisions, archive/restore and explicit
  same-club active-team sharing. PLAYER is denied notes and remains self-scoped
  for activity. Security audit metadata never includes note bodies. Two additive
  migrations passed clean disposable PostgreSQL 16 deploy/status/diff and were
  applied to retained `ngcs_local_session_dev` with existing business counts
  unchanged. Disposable E2E, authenticated Chrome desktop interaction and root
  quality pass with 720 backend, 285 frontend and 4 Sites tests. Responsive
  CSS/tests pass; no new exact-size responsive capture is claimed. Tracking:
  ADR-0031, CR-023, REQ-022, BL-055;
  [evidence](../30-quality/PLAYER_360_NOTES_VERIFICATION_2026-09-09.md). No
  production, credential reset, retained note mutation, commit or push.

- **Latest — 2026-09-09 A Team roster center:** `/app/teams/first-team` is now
  the direct roster destination rather than an intermediate management card. It
  preserves the route while aligning the active workspace team and exposes real
  squad summaries, shared responsive player rows/cards, Player 360 and scoped
  training/match/attendance/tactics links. `GET /sporting/players/page` accepts
  strict position/name-sort filters and returns scope-safe totals/position counts;
  parameterless clients keep ID order/cursors, sorted clients use versioned
  `displayName + id` cursors. PLAYER summaries remain self-scoped. Backend 712,
  frontend 284 and disposable PostgreSQL E2E 2/2 pass; the 1,000-player run stays
  within the existing 10-query local budget. Tracking: ADR-0030, CR-022, REQ-021,
  BL-054. No schema/migration/dependency/retained-data/production, commit or push.
  [Evidence](../30-quality/FIRST_TEAM_ROSTER_CENTER_2026-09-09.md).

- **Latest — 2026-09-09 separate team navigation and roster names:** Sidebar
  and mobile Sheet now expose A Takım and Altyapı independently through
  `/app/teams/first-team` and `/app/teams/academy`; no page tab switcher remains.
  `/app/teams` maps its legacy `view` query to the canonical destination. Team
  lifecycle, role/tenant boundaries, APIs and schema are unchanged. The guarded
  local fixture renamed all five 18-player squads to 90 unique deterministic
  synthetic Turkish names; no Demo/E2E placeholder remains. Two account-linked
  display names were synchronized without changing e-mail/password/role/session.
  Second run created/renamed zero records. Authenticated Chrome and root quality
  pass with 706 backend, 279 frontend and 4 Sites tests; 121 Markdown links,
  CDSK and whitespace pass. Tracking: ADR-0029, CR-021, REQ-020, BL-053. No
  production, migration, dependency, commit or push.

- **Latest — 2026-09-09 local first-team/academy squads:** The retained local
  `NGCS Browser E2E Kulübü` / `2026–27 Test Sezonu` context now has A Takım plus
  U12, U14, U16 and U18, each with 18 active players and a TeamSeason link. The
  former mismatched U17 team became U18 without changing its identity/history or
  two existing players; 88 additional synthetic Persons have profiles
  and primary assignments but no account/e-mail/password/birth date. The gated
  Serializable fixture is idempotent: the second run created zero records.
  `/app/squad` now reads the canonical paged roster, so accountless Persons are
  visible while role/tenant/date/cursor behavior remains. Root quality passes
  with 706 backend, 276 frontend and 4 Sites tests; DB postconditions, audit
  counts, Markdown/CDSK/whitespace and a zero-create rerun pass. Authenticated
  Chrome QA confirms one A Takım, U12/U14/U16/U18 and the U12 `18 / 18` roster.
  No production, reset, deletion, archive, commit or push. Tracking: BL-052;
  [evidence](../30-quality/LOCAL_DEMO_SQUADS_2026-09-09.md).

- **Latest — 2026-09-08 A Takım ve altyapı yaşam döngüsü:** `/app/teams`
  varsayılan A Takım ile URL-korumalı Altyapı sekmesine ayrıldı. Sistem yöneticisi
  kulüp başına tek A Takım oluşturabilir; aynı kulüp admini düzenleyebilir fakat
  A Takım arşivlenemez. Yönetici altyapı takımını belirli sezonda atomik
  oluşturur, düzenler, geçmişi silmeden arşivler ve aynı kimlikle geri yükler;
  coach/player salt okunurdur. Legacy/canonical projection, configurable 1–32
  karakter kademe etiketi, archive alanları, partial unique indeks ve dört audit
  olayı ADR-0028 ile kabul edildi. Backend 706, frontend 276 ve lifecycle E2E 3/3
  geçti; disposable migration status/diff temiz ve clone backfill hash'leri aynı.
  Canlı Chrome QA mutation yapmadan geçti. Retained yerel DB migration aldı ancak
  hiçbir takım test amacıyla değiştirilmedi; production/seed/reset/commit/push
  yapılmadı. `BL-050` mevcut hesap işi olduğundan yeni kayıt `BL-051`dir.
  **Next:** ürün gap audit'i veya takım detayında ayrı departman işlevleri.

- **Latest — 2026-09-08 Local administrator credentials:** Explicit user
  approval authorized two retained-local account writes. The guarded bootstrap
  created the first `SYSTEM_ADMIN`; that authenticated account then created the
  same-club `CLUB_ADMIN` through invitation/acceptance. Both ACTIVE roles and
  passwords were verified by real login. All refresh sessions created during
  verification were revoked through lifecycle APIs; both accounts finish with
  zero open sessions and authVersion 1. Passwords were disclosed only in the
  conversation and are absent from repository documentation. No existing user
  promotion, migration, broad seed/reset, production, commit or push occurred.
  **Next:** first-use password rotation is recommended.

- **Latest — 2026-09-08 Account and permission administration:** Added strict,
  bounded and minimum-projection `GET /accounts` plus the admin-only
  `/app/settings/users` workspace. SYSTEM_ADMIN sees platform/selected-club
  scope; CLUB_ADMIN is server-forced to its own club; COACH/PLAYER are denied.
  Existing invite, role/club, suspend/reactivate, password-reset and session-
  revoke operations now have one cohesive shadcn surface with explicit
  confirmations and one-time token handling. Technical roles and sporting
  capabilities are visible, but capability grant mutation remains gated/read-
  only. Backend 676, frontend 273, Sites 4, clean disposable PostgreSQL HTTP E2E
  21/21, production build, CDSK/docs/whitespace and authenticated
  1440×1024/1024×900/390×844 browser QA pass. The 6px mobile hero overflow found
  during QA was fixed. No schema/dependency/retained-account change, commit,
  push or deployment. **Next:** separate product gap audit or an explicitly
  approved capability-grant administration design.

- **Latest — 2026-09-08 Training lifecycle implementation:** Training catalogue
  and detail expose title/date/purpose edit plus explicitly confirmed permanent
  delete. PLAYER sees no mutation controls; current `assertPlanManage` keeps
  coach/admin tenant boundaries. Linked calendar projection updates and ordered
  DayPlan/Attendance/PlanDrill(snapshot)/TrainingPlan deletion run in Serializable
  transactions with rollback/generic errors. The catalogue now uses five stable
  responsive metrics, auto-fit cards, wrapping copy/actions and no unsupported
  board-status claim. Targeted frontend 32/32 and backend 75/75 pass; a fresh
  disposable PostgreSQL 16 with six migrations passed the HTTP lifecycle E2E and
  was removed. No retained plan was deleted; no schema/dependency/deploy change.
  Root quality passes with 663 backend, 268 frontend and 4 Sites tests; combined
  visual QA has no actionable P0/P1/P2. **Next:** separate product gap audit.

- **Latest — 2026-09-08 Settings slice and BL-048 page sequence passed:**
  Settings now uses the approved white system with the shared photographic hero,
  four truthful user/session/team/season metrics and compact profile/context/
  security cards. Persistent and temporary session copy, all-season/missing
  season labels, awaited logout and error handling remain intact. Exact-size
  1672×941, 1024×900 and 390×844 captures are retained under
  `apps/frontend/qa/settings-reference-2026-09-08/`; same-input QA found no
  actionable P0/P1/P2 and the 390px document matches the viewport. Root quality:
  657 backend, 264 frontend and 4 Sites tests. No API/schema/data, migration,
  seed/reset, commit, push or deployment. All approved BL-048 page slices are
  complete. **Next:** run the separately planned product gap audit.

- **Latest — 2026-09-08 Player operations slice passed:** Players, Player 360,
  Squad and Attendance now use the approved white system with photographic
  heroes, server/scope-backed metrics and compact player/plan surfaces. Search,
  cursor histories/totals, dated assignment evidence, role visibility and
  attendance write safety remain unchanged. Twelve exact-size desktop/tablet/
  mobile captures are retained under
  `apps/frontend/qa/player-operations-reference-2026-09-08/`; same-input QA found
  no actionable P0/P1/P2 and every 390px document matches its viewport. Root
  quality: 657 backend, 264 frontend and 4 Sites tests. No API/schema/data,
  migration, seed/reset, commit, push or deployment. **Next:** Settings.

- **Latest — 2026-09-08 Match detail slice passed:** Match detail now uses the
  approved white system with the shared photographic hero, five real match
  facts, compact analysis/facts layout and the existing tactical-board editor.
  Six exact-size desktop/tablet/mobile captures are retained under
  `apps/frontend/qa/match-detail-reference-2026-09-08/`; same-input QA found no
  actionable P0/P1/P2. Live analysis/tactical tab switching and runtime logs
  passed without saving data; the detected 390px hero overflow was fixed and
  document width now matches the viewport. Root quality: 657 backend, 264
  frontend and 4 Sites tests. No API/schema/data, migration, seed/reset, commit,
  push or deployment. **Next:** Players, Player 360, Squad and Attendance.

- **Latest — 2026-09-08 Library/Tactical Board/editor slice passed:** All three
  surfaces now use the approved white system with existing photographic assets,
  real catalogue totals, category controls, verified capability guidance and
  compact editor chrome. Nine exact-size desktop/tablet/mobile captures are
  retained under `apps/frontend/qa/library-tactics-reference-2026-09-08/`;
  same-input QA found no actionable P0/P1/P2. Live category filtering, dirty
  state, cancel/discard navigation and empty tactical catalogue passed without
  saving data; browser runtime errors were empty. Root quality: 657 backend, 263
  frontend and 4 Sites tests. No API/schema/data, migration, seed/reset, commit,
  push or deployment. **Next:** Match detail.

- **Latest — 2026-09-08 Trainings and training-detail slice passed:** The plan
  catalogue and editor now use the approved white system with photographic heroes,
  five real summary metrics, compact detail summary/tabs and responsive plan/phase
  cards. Cursor/retry/stale handling, create semantics, on-demand board reads,
  dirty transitions, uncertain-save reconciliation, attendance and permissions
  remain intact. Six exact-size desktop/tablet/mobile captures are retained under
  `apps/frontend/qa/trainings-reference-2026-09-08/`; same-input QA found no
  actionable P0/P1/P2. Live create-dialog dismissal, all three tabs, invalid-board
  fail-closed behavior and real attendance reads passed without a data write.
  Root quality: 657 backend, 260 frontend and 4 Sites tests. No API/schema/data,
  migration, seed/reset, commit, push or deployment. **Next:** Library and
  Tactical Board.

- **Latest — 2026-09-08 Week reference-system slice passed:** Week now uses the
  approved white shell with the existing training-ground raster, compact range
  controls and responsive seven-day cards. Local Monday–Sunday boundaries,
  independent daily plan/match reads, full totals, cursor histories, retries and
  stale-response rejection remain intact. Exact 1672×941, 1024×900 and 390×844
  captures are retained under `apps/frontend/qa/week-reference-2026-09-08/`;
  same-input QA found no actionable P0/P1/P2. Live week navigation worked and
  runtime error capture was empty. Root quality: 657 backend, 258 frontend and 4
  Sites tests. No API/schema/data, migration, seed/reset, commit, push or
  deployment. **Next:** Trainings and training-detail slice.

- **Latest — 2026-09-08 Matches reference slice passed:** Approved Matches
  layout is implemented with the shared photo hero, real local-day filter and
  date-grouped catalogue rows. Cursor history, full totals, stale-scope rejection,
  retry, all-seasons and detail behavior remain intact. Exact 1672×941, 1024×900
  and 390×844 captures are retained under
  `apps/frontend/qa/matches-reference-2026-09-08/`; same-input QA found no
  actionable P0/P1/P2, live filter/clear worked and browser logs were empty.
  Root quality: 657 backend, 257 frontend, 4 Sites. No API/schema/data,
  migration, seed/reset, commit, push or deployment. **Next:** Week page slice.

- **Latest — 2026-09-08 Teams reference slice passed:** Approved Teams layout is
  implemented with a generated training-ground hero, category photographs, one
  real API-backed team card and an accessible native table. Search debounce,
  stale-response rejection, cursors, work-team selection and detail links remain
  intact. Exact-size 1536×1024, 1024×900 and 390×844 captures are retained under
  `apps/frontend/qa/teams-reference-2026-09-08/`; same-input comparison found no
  actionable P0/P1/P2 and browser error logs were empty. Root quality passes with
  657 backend, 256 frontend and 4 Sites tests. No API/schema/data, migration,
  seed/reset, commit, push or deployment. **Next:** Matches reference slice.

- **Latest — 2026-09-08 Dashboard visual gate passed:** Four exact-size browser
  captures are retained under
  `apps/frontend/qa/dashboard-reference-2026-09-08/`. The 1672×941 source and
  implementation were reopened together; tablet, mobile and Sheet were also
  inspected. No actionable P0/P1/P2 remains and `design-qa.md` is `passed`.
  Dashboard gate is closed; proceed to the approved Teams reference slice.

- **Historical follow-up — 2026-09-08:** Restarted stopped local frontend 3132 and
  backend 4000 using retained database and documented session flags. Existing
  coach login and Dashboard real reads work. Rechecked desktop/tablet/mobile and
  Sheet; no code/data reset. The former screenshot gate was later closed with
  the explicitly approved local capture fallback; no destructive E2E was run.

- **Latest — 2026-09-08 Dashboard reference correction:** 185/78px light shell,
  Inter welcome, new coach/banner photos, six real counters, daily paginated
  program, latest/recent training, scoped matches, planning distribution and
  quick links are implemented. Home/login target Dashboard. No API/schema/data
  change. Root quality: 657 backend/255 frontend/4 Sites passing; targeted
  Dashboard/login: 24. Live desktop/tablet/mobile and mobile Sheet/focus checked.
  Durable screenshot export remains blocked in [design-qa.md](../../design-qa.md);
  Teams remains gated. Older missing DB/password blockers below are historical.

Güncel kayıt `PROJECT_BOOT.md` içinde tutulur.

- **Latest credential operation (2026-09-08):** With explicit user approval,
  only `coach.local@ngcs.test` was reset in retained
  `ngcs_local_session_dev` in one serializable transaction. Role/status/club
  remained `COACH`/`ACTIVE`/unchanged, `authVersion` became 3, two old refresh
  sessions and zero reset tokens were revoked, and one token-free operator audit
  was written. Hash/postconditions passed. Real login on frontend 3132 succeeded,
  `/app/week` loaded the workspace and one new current refresh family exists.
  Password was returned only to the user and is not in repository files. No
  migration, seed, business-data/access change, commit, push or deployment.
  **Next:** authenticated BL-048 Dashboard visual QA, then Teams.

- **Latest local operation (2026-09-08):** Canonical frontend development and
  browser E2E default port is now strict `3132`; backend HTTP/Socket.IO accepts
  exact `http://localhost:3132` through the shared origin resolver. Frontend
  `3132` and backend `4000` are running with persistent-session flags against the
  retained `ngcs_local_session_dev` copy. Root quality passes with 657 backend /
  246 frontend tests, both builds, four Sites tests, CDSK/docs/static gates and
  the live CORS response. Database discovery was read-only; no migration, seed,
  reset or business-data write was initiated, while normal runtime session
  maintenance remains possible. No stored credential, commit, push or deployment.
  The prior password reset invalidated existing sessions and
  the new password is intentionally user-held, so sign-in is the remaining gate
  for BL-048 authenticated visual QA.

- **Current visual delivery (2026-09-07, BL-048 slice 1):** User-approved
  Dashboard/Teams/Matches screenshots replace the former shell reference for
  those page slices. Shared white shell + Dashboard code is in progress: it
  preserves real bounded reads, routes, roles, scope/pagination/date behavior and
  five mobile tasks, adds topbar scope controls, route-search keyboard focus and
  generated hero imagery. Typecheck, lint and 246 frontend tests pass. The local
  Nest runtime was restored on 2026-09-08 without changing data; browser design
  QA now awaits the user-held local coach password. [Design QA](../../design-qa.md).
  **Next:** complete sign-in and compare
  authenticated Dashboard at the reference viewport and responsive widths, then
  proceed to Teams. No commit/push/deploy.

- **Latest engineering delivery (2026-09-07, BL-047 phase 5C):** Shared
  presentation-only FootballCard now serves training, match, library and tactics
  catalogs. Existing links, boardless drill non-link behavior, metadata,
  fallbacks, totals, pagination and permissions are unchanged. Eight proven
  card-only selector blocks were removed; four new/34 targeted tests and root
  quality 655 backend/245 frontend/four Sites passed. Authenticated read-only
  browser QA covered 1440/1024/390; retained tactics data was empty, so pitch-card
  rendering is component/route-test evidence. No data write, API/schema/session/
  dependency, commit/push or deployment.
  [Evidence](../30-quality/UI_FOOTBALL_CARDS_2026-09-07.md).
  **Next:** Phase 6 Week module; preserve local-date navigation, independent
  plan/match reads, full totals and scope. Phases 7–8 and BL-043/044/009/M4 stay
  open.

- **Latest local operation (2026-09-07):** Kullanıcı onayıyla yalnız retained
  yerel koç parolası sıfırlandı; authVersion +1, bir refresh session revoked,
  açık reset tokenı yok. Hash, sıfır açık oturum/reset ve iş verisi/diğer hesap
  fingerprint eşitliği serializable transaction'da doğrulandı. Rol/status/club
  korunur; tokensız operator approval audit yazıldı. Parola yalnız kullanıcıya
  verildi, repository/dosyaya kaydedilmedi; eski oturumlar geçersiz. API login
  denenmedi. Uygulama/şema değişmedi, sıradaki BL-044 karar planı korunur.

- **Latest engineering delivery (2026-09-07, BL-045):** Yan menü/üst çubuk/
  Hafta/Genel Bakış/Ayarlar aynı helper ile yalnız explicit `*` seçiminde
  “Tüm sezonlar” gösterir. Gerçek eksik sezon TBD, seçili ad/source korunur;
  filtre/API/provider davranışı değişmez. Altı helper + dört component regresyonu;
  focused 33, root 655/143 unit ve tüm kalite kapıları geçti. Yerel browser
  exact/all geçişleri ve 1280×720 görünüm doğrulandı; tam browser/API E2E veya
  migration yeniden çalıştırılmadı. Dev server'lar 3001/4000'de mevcut ayarlarla
  yeniden başladı, dashboard/all-seasons preview açık. Retained 24 tablo/25
  satır aynı; iş yazımı/reset/seed/migration yok. Backend/şema/dependencies aynı;
  commit/push ve yeni ADR yok.
  [Kanıt](../30-quality/BL045_SEASON_LABELS_2026-09-07.md).
  **Next:** BL-044 safeguarding sınırlarından başlayarak kalan karar girdilerini
  onaya hazır planla. BL-043 pilot owner/workload/ortam/bütçe TBD; BL-009/M4 ayrı.
  Hukuki dayanak/owner tahmin etme, yeni politika/klinik veri/production açma.

- **Latest engineering delivery (2026-09-07, BL-043j):** Opt-in karma 5 GET/
  2 attendance POST ve ayrı SELECT row-work ölçümü üç temiz DB başlangıcında
  geçti. 30/300 oyuncu, 150/1500 planda 47 SQL olayı; plan sayacı tarama çıktısı
  150→1500 büyür. Benzersiz fiziksel satır/I/O veya production SLO değildir.
  Son durum/tekillik, aynı kayda yarış ve yetkisiz yazma reddi doğrulandı.
  Root kalite 655/133 unit; API 48 pass/3 opt-in skip. Üç DB'de altı migration/
  status/diff temiz; üçü de kaldırıldı. Retained 24 tablo/25 satır aynı.
  Yalnız backend E2E/belgeler; runtime/frontend/şema değişmedi. Browser yeniden
  çalıştırılmadı. Stage/commit/push ve yeni ADR yok.
  [Kanıt](../30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md).
  **Next:** BL-045 “Tüm sezonlar” etiketi ve regresyonu. BL-043 pilot kabulü
  açık: owner, temsilî veri/workload, ortam ve bütçeler TBD. Süreğen/kalıcı
  session ve geniş sportif yazım yükünü bu ölçüm doğrulamaz. BL-044/009/M4 ayrı
  kapılar; keyfî yeni hacimlerden production kapasitesi iddiası çıkarma.

- **Latest engineering delivery (2026-09-07, BL-046c):** BL-046 a/b/c Done;
  CR-017 uygulaması verified. Üç ayrı süreçte 2/50 geçerli tahta ölçümü: 50 faz
  legacy 996.545 → metadata+seçili 24.040 byte (%97,59 daha az JSON). İki yeni
  GET toplam 12, eski GET 6 SQL olayı; sorgu azalması veya production SLO deme.
  Metadata JSON seçmez, seçili tahta tek projection; 49 seçilmeyen invalid
  snapshot büyüse de metadata/aktif belge değişmez. Null/invalid dallar ayrı
  doğrulandı. Kaynak değişimi sonrası browser snapshot izolasyonu eklendi.
  Root 655/133 unit, API 48 pass/2 opt-in skip, Chromium 12/12; üç viewport
  kontrolü, mevcut mobil iç scroll. Yeni benchmark opt-in NGCS_EDITOR_BENCH=true
  ve yalnız disposable loopback DB ister; normal suite'te kasıtlı skip.
  [Kanıt](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).
  **Next:** BL-043 geniş okuma/yazma workload + kontrollü DB row-work planı ve
  ölçümü. Pilot owner/hacim/donanım/bütçe TBD; henüz production kapasitesi yok.
  BL-045/044/009 ve M4 ayrı açık. Runtime/şema/izin/dependencies aynı; retained
  DB'ye reset/seed/migration/yazım yok. Altı migration/status/diff temiz,
  disposable DB kaldırıldı; retained parmak izi 24 tablo/25 satır aynı.
  Stage/commit/push yok.

- **Latest engineering delivery (2026-09-07, BL-046b):** Antrenman detayı
  metadata + açık tekil faz GET'ine geçti; eski editor fallback/eager tarama yok.
  Phase/tab/route/workspace dirty save-discard-cancel, geç yanıt reddi, ilk
  snapshot kaydında history ve 50 undo korunur. Belirsiz PUT otomatik tekrarlanmaz;
  açık GET doğrulaması eşleşen snapshot'ı ikinci PUT olmadan onaylatır.
  Taktik egzersizi ilk kaydı route key ile redirect regresyonundan korundu.
  Root kalite 655/133 unit; API 48 pass/1 opt-in skip; Chromium 12/12.
  Üç viewport görüldü; mobil mevcut iç yatay kaydırmalı tahta düzenini korur.
  Altı migration/status/diff temiz; disposable DB kaldırıldı, retained iş
  parmak izi 24 tablo/25 satır aynı. Yerel demo salt okunur incelendi; seçilen
  fazın invalid legacy JSON'u açık uyarı verir, düzeltilmedi veya seed edilmedi.
  Backend/şema/dependencies değişmedi; stage/commit/push yok.
  [Kanıt](../30-quality/BL046_EDITOR_FRONTEND_CUTOVER_2026-09-07.md).
  **Next:** Onaylı BL-046c eşleşen geçerli 2/50-faz payload/projection/query ve
  latency ölçümü, ardından son regresyon. Tekrar onay isteme; BL-046'yı ölçüm
  bitmeden kapatma. SLO/owner TBD; BL-043 geniş workload, BL-044/045/M4 açık.

- **Latest engineering delivery (2026-09-07, BL-046a):** ADR-0025 A Accepted;
  CR-017 Approved. Hafif tam faz metadata ve tekil effective board GET'leri
  plan/source yetkisi, snapshot önceliği ve invalid suppression ile doğrulandı.
  Eski GET/POST/PUT, frontend, şema ve dependencies aynı. Root kalite 655/115
  unit; tam API 48 pass/1 opt-in skip; yeni kapsam 43 unit/8 HTTP. Altı migration
  ve diff temiz; disposable DB kaldırıldı, retained 24 tablo/25 satır aynı.
  Yerel root/frontend 200, yeni anonim GET 401; browser E2E tekrarlanmadı.
  [Kanıt](../30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md).
  Sırada onaylı BL-046b frontend explicit-open + dirty/history koordinasyonu,
  ardından c matched ölçüm ve browser/viewport QA; tekrar onay isteme.
  Frontend hâlâ eski editor kullanır, ilk yük optimizasyonu henüz teslim değil.
  Phase cap yok; owner/SLO TBD; BL-043/044/045/M4 açık. Stage/commit/push yok.

- **Latest design delivery (2026-09-07, BL-046):**
  [Tasarım](../10-architecture/BL046_EDITOR_READ_DESIGN.md) ve
  [Proposed ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md)
  hazır. Önerilen A: tam hafif faz metadata, yalnız açılan effective board,
  kaynak yetkisi, snapshot önceliği ve dirty geçiş/history koordinasyonu.
  Mevcut API/POST/PUT korunur; phase cap, migration veya dependency yok.
  Mimari/API/UX ve yeni GET kaynak kontrolü açık onay bekliyor; henüz uygulanmadı.
  Sonra BL-046a backend → b frontend → c ölçüm/tam QA. Bu tur yalnız belgeler;
  uygulama/DB değişmedi ve unit/E2E yeniden çalıştırılmadı. 99 Markdown/yerel
  bağlantı, CDSK ve diff geçti; commit/push yok. Pilot owner/SLO TBD; BL-043 geniş
  workload, BL-044/045/M4 ayrı açık kalır.

- **Latest engineering delivery (2026-09-07, BL-043i):** Karma beşli GET
  ölçümü üç kez geçti: 30/300 oyuncuda 36 sorgu/~16 KB; 1/3 grup eşzamanlılığı
  5/15 istektir, insan kullanıcısı veya production kapasitesi değildir.
  Editor 2→50 sentetik fazda 34→853 KB; BL-046/CR-017 tasarımı Proposed.
  Runtime/UI/şema/izin değişmedi; root kalite 612/115 unit, normal API 40 pass
  - 1 opt-in skip, izole benchmark üç pass. Browser yeniden çalıştırılmadı.
    Disposable migration/diff temiz, test DB kaldırıldı, retained 24 tablo/25
    satır aynı. 97 Markdown/CDSK geçti; commit/push yok.
    Sırada BL-046 tasarım/etki analizi; yeni API/limit uygulaması açık onay ister.
    Pilot owner/hacim/SLO TBD, BL-043 geniş workload ve BL-044/045/M4 açık.
    [Doğrulama](../30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043h.2):** Antrenman katılımı
  25'lik oyuncu/durum sayfaları ve tam total/presentTotal kullanır. Plan editor
  okuması tüm attendance ve group.members içermez; provider'da shared members
  fetch/state kaldırıldı. Plan yetkisi/self filtresi ve mevcut upsert korunur;
  yazım sırasında çift tıklama engellenir, başarı sonrası aynı sayfa yeniden
  okunur, belirsiz yazım otomatik tekrarlanmaz. 612 backend/115 frontend unit,
  40 API E2E geçti. Yeni ADR/şema/migration/izin değişikliği yok.
  Final Chromium 12/12 ve üç viewport geçti; disposable migration/diff temiz,
  sentetik DB kaldırıldı. Retained 24 tablo/25 satır aynı; yerel demo Katılım
  0/2 ile açık. 96 Markdown/CDSK/diff geçti; stage/commit/push yapılmadı.
  Sırada BL-043 karma workload/query/payload ölçümü, owner/hacim/SLO TBD;
  BL-044/045/M4 ayrı kalır.
  [Doğrulama](../30-quality/BL043_ATTENDANCE_MEMBER_CUTOVER_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043h.1):** Kadro bağımsız
  25'lik player-membership sayfalarını, Genel Bakış limit=1/tam oyuncu toplamını
  kullanır. Mevcut grup/rol sınırı ve minimal projection korunur; PLAYER erişimi
  genişletilmez. Root kalite 597 backend/109 frontend unit, 40 API ve 12 Chromium
  E2E geçti. Üç viewport doğrulandı; altı migration/diff temiz. Sentetik test DB
  kaldırıldı, retained fingerprint aynı (24 tablo/25 satır). Yerel Kadro ve
  Genel Bakış iki oyuncuyla doğrulandı; Genel Bakış açık. 95 Markdown/CDSK geçti.
  Antrenman detayı yoklaması da shared members tüketir; h.2 bu bağımlılığı
  ayırmadan ortak tam üye fetch/state kaldırılmamalı. Ardından pilot kapasitesi;
  owner/hacim/SLO TBD, BL-044/045/M4 açık. Şema/izin/yazma değişmedi; yeni ADR yok.
  [Doğrulama](../30-quality/BL043_MEMBER_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.5):** Tekil yetkili maç
  detayı, maç içermeyen legacy-metadata ve minimal shell sayacı eklendi. Ortak
  matches state/fetch kaldırıldı; eski backend tam liste sözleşmesi korunur.
  Scope/ID değişimi eski detay/sayacı atar; retry bağımsızdır. Şema, yazma ve
  izin politikası değişmedi. Root kalite 581 backend/104 frontend unit ve
  39 API ve 11 Chromium E2E geçti; üç viewport doğrulandı. Disposable migration/
  diff temiz, test DB kaldırıldı; retained fingerprint aynı (24 tablo/25 satır).
  Yerel maç detayı salt okunur doğrulanıp açık bırakıldı; 94 Markdown/CDSK geçti.
  Sonraki iş BL-043 üye/Kadro/dashboard tüketicileri ve ölçülen pilot kapasitesi;
  owner/hacim/SLO TBD, BL-044/045/M4 açık. Yeni ADR yok.
  [Doğrulama](../30-quality/BL043_MATCH_CUTOVER_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.4):** Hafta maçları yedi
  günlük limit=25 okuma, tam toplam, bağımsız cursor/retry ve yerel yarı açık
  sınırlar kullanır. Hafta/scope reset, geç yanıt reddi, eksik seçili sezonda
  kapsamı genişletmeme ve iki kaynak doğrulanmadan boş gün göstermeme hazır.
  Root kalite, 571 backend/98 frontend unit, 39 API E2E ve DST dahil 12 odaklı
  test geçti. Final Chromium E2E 11/11; 25+5 maç/gün, detay ve üç viewport
  doğrulandı. Disposable migration/diff temiz, test DB kaldırıldı; retained
  fingerprint aynı (24 tablo/25 satır), yerel Hafta salt okunur doğrulandı.
  Backend/API/şema/izin değişmedi. Maç detayı yanında app-layout bildirim
  sayacı da shared matches kullanır; önceki özetin atladığı bağımlılık düzeltildi.
  Sırada BL-043g.5 bağımsız detay ve minimal shell sayacı, ardından shared
  matches/full-fetch cutover. Üye/pilot/SLO ve BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_WEEK_MATCH_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.3):** Genel Bakış shared
  matches yerine limit=3/no-cursor scalar API okur; ilk üç kronolojik maç,
  hasBoard ve tam toplam korunur. Bağımsız loading/error/retry, scope reset ve
  eksik seçili sezonda kapsamı genişletmeme hazır. Root kalite, 571 backend/93
  frontend unit, 39 API/11 Chromium E2E geçti. 3/31 özet, detay bağlantısı ve
  üç viewport doğrulandı. Disposable migration/diff temiz; test DB kaldırıldı,
  retained fingerprint aynı (24 tablo/25 satır); yerel Genel Bakış 1/1.
  Backend/API/şema/izin değişmedi. Sonraki iş BL-043g.4 Hafta maç okumaları,
  ardından bağımsız detay; iki tüketici ayrılmadan shared matches'i kaldırma.
  Üye/pilot/SLO ve BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_DASHBOARD_MATCH_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.2):** Maçlar bağımsız
  25'lik minimal sayfalar, tam toplam, hasBoard ve mevcut shadcn kartları kullanır.
  Scope reset/geç yanıt, missing-season fail-closed, ayrı retry ve boş sayfa
  davranışı test edildi. Root kalite, 571 backend/89 frontend unit, 39 API/11
  Chromium E2E geçti; 31 maç/25+6 sayfa/ikinci sayfa detay ve üç viewport kanıtı var.
  Disposable migration/diff temiz; test DB kaldırıldı, retained fingerprint aynı
  (24 tablo/25 satır), yerel Maçlar 1/1. Backend API/şema/izin değişmedi.
  Sırada BL-043g.3 Genel Bakış maç okumaları, ardından Hafta ve bağımsız detay;
  bunlar ayrılmadan shared matches/legacyContext tam okumasını kaldırma.
  Üye/pilot/SLO ve BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_MATCH_CATALOG_UI_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.1):** Maç katalog API'si
  grup/sezon sahipliği, 25/max100 minimal kayıt, tarih/ID cursor, tam toplam ve
  yarı açık tarih aralığıyla hazır. JSON yerine hasBoard marker döner.
  Root kalite, 571 backend/84 frontend unit ve 39 API E2E geçti. Disposable
  migration/diff temiz; sentetik DB kaldırıldı, retained fingerprint değişmedi
  (24 tablo/25 satır). Şema/izin/frontend değişmedi; yeni browser koşusu yok.
  Sonraki iş BL-043g.2 Maçlar ekranı; ardından Genel Bakış/Hafta/detay bağımsız
  okumaları. Dört tüketici ayrılmadan shared matches/legacyContext tam okumasını
  kaldırma veya kısmi sayfayla değiştirme. Üye/pilot/SLO ve BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_MATCH_READ_FOUNDATION_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043f.4):** Antrenman detay
  egzersiz seçicisi planın grubuna bağlı 25'lik minimal sayfalara geçti; sayfa
  dışı seçim korunur ve plandaki ID'ler seçenekten çıkarılır. Ortak tam drills
  fetch/state artık yok. Mevcut tekli POST, replacement PUT yerine kullanılır;
  ikinci eklemede snapshot/row ID korunur. Yazma sonrası okuma hatası GET-only
  retry sunar. Root kalite, 538 backend/84 frontend unit, 38 API/11 Chromium
  E2E geçti. Disposable migration/diff temiz, test DB kaldırıldı; retained
  fingerprint aynı (24 tablo/25 satır). Yerel 75 dk/4 faz demo detayında yalnız
  okuma yapıldı. Backend/API sözleşmesi, şema ve izin değişmedi. Sonraki dilim
  maç/üye okumaları; pilot owner/SLO TBD, BL-044/045/M4 açık kalır.
  [Doğrulama](../30-quality/BL043_DRILL_CUTOVER_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043f.3):** Taktik Tahtası
  kind=tactical-board sunucu filtresi, 25'lik sayfalar ve tam toplam kullanır;
  shared drills/JSON tüketmez. Scope reset, stale yanıt, retry ve boş devam
  sayfasından dönüş test edildi. 538 backend/78 frontend unit, root kalite ve
  38 API/11 Chromium E2E geçti. 30 tahtada 25+5 sayfa/ikinci sayfa editör akışı
  doğrulandı. İlk API koşusundaki oyuncu ölçek timeout/ECONNRESET'inden sonra
  aynı paket değişmeden geçti. Disposable migration/diff temiz, test DB kaldırıldı;
  retained fingerprint aynı (24 tablo/25 satır), yerel Taktik Tahtası açık/boş.
  Sırada antrenman detay egzersiz seçenekleri; son tüketici ayrılmadan shared
  drills/full GET'i kaldırma veya ilk sayfayla değiştirme. Şema/izin değişmedi.
  Maç/üye, pilot owner/SLO TBD ve BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_TACTICS_PAGINATION_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043f.2):** Genel Bakış egzersiz
  sayacı shared drills yerine mevcut catalog/page limit=1 çağrısının tam total
  alanını kullanır. Scope reset/geç yanıt, ayrı yüklenme/hata/retry ve gerçek
  sıfır davranışı doğrulandı. 532 backend/73 frontend unit, 38 API/11 Chromium
  E2E ve root kalite geçti. Yeni egzersiz sonrası toplam 35→36 doğrulandı.
  Disposable migration/diff temiz, test DB kaldırıldı; retained fingerprint aynı
  (24 tablo/25 satır). Yerel Genel Bakış 5 egzersiz gösteriyor.
  Backend/API/şema/izin değişmedi. Sırada board-kind sunucu filtresiyle sayfalı
  taktik kataloğu, ardından antrenman detay egzersiz seçenekleri; bu iki tüketici
  ayrılmadan ortak drills/full GET'i kaldırma veya kısmi sayfayla değiştirme.
  Maç/üye, pilot owner/SLO TBD, BL-044/045 ve M4 hâlâ açık.
  [Doğrulama](../30-quality/BL043_DASHBOARD_DRILL_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-06, BL-043f.1):** Egzersiz Kütüphanesi
  25'lik bağımsız sayfalara, sunucu kategori filtresine ve tam toplam okumalarına
  geçti. Mevcut grup/rol görünürlüğü korunur; yaş gruptan türetilir, tahta JSON'u
  kartlara taşınmaz. Scope/kategori reset, geç yanıt reddi ve retry test edildi.
  532 backend/70 frontend unit, 38 API/11 Chromium E2E ve root kalite geçti.
  Disposable migration/diff temiz ve test DB kaldırıldı. Retained fingerprint
  aynı (24 tablo/25 satır); yerel kütüphane 5/5 egzersiz gösteriyor.
  Ortak drills/full GET hâlâ dashboard/taktik/antrenman detayında kullanılıyor;
  sırada bu tüketicilerin tam sayaç/sayfa geçişi, ardından maç/üye ve pilot sorgu
  bütçeleri var. Ortak diziyi ilk sayfayla değiştirme. Şema/migration/izin değişmedi.
  Pilot owner/SLO TBD; BL-043, BL-044/045 ve M4 açık.
  [Doğrulama](../30-quality/BL043_DRILL_LIBRARY_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.5):** Yoklama bağımsız
  25'lik minimal plan/PRESENT özetlerine ve tam güncel oyuncu sayısına geçti.
  PLAYER self-only ve mevcut grup/tenant/sezon sınırları korundu. Provider'ın
  tam plan fetch/state'i kaldırıldı; katalog/dashboard/hafta/yoklama bağımsızdır.
  Eski REST liste/detay/yazım sözleşmeleri korundu. 508 backend/65 frontend unit,
  37 API/11 Chromium E2E ve root kalite geçti. Katılım sonrası Yoklama/Genel
  Bakış yenilendi; akış boyunca sıfır full-list GET doğrulandı. Disposable DB
  kaldırıldı; retained fingerprint aynı (24 tablo/25 satır), yerel Yoklama açık.
  Sırada bounded egzersiz kütüphanesi ve tam toplamlar, sonra maç/üye tüketicileri
  ve pilot sorgu bütçeleri. Üye/detay yoklama hâlâ eski okumayı kullanır; tüm
  workspace performansı tamamlandı diye raporlama. Owner/SLO TBD, BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_ATTENDANCE_CUTOVER_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.4):** Hafta ortak plans
  dizisinden ayrıldı. Catalog paired from/until filtresi yerel günleri half-open
  aralıklarla okur; sezon/grup kesişimi, tam günlük toplamlar ve 25'lik sayfalar
  korunur. Null-date taslaklar katalogda kalır. Scope/hafta reset, eski yanıtı
  yok sayma, retry, yıl sınırı ve URL kapsamını koruma doğrulandı.
  504 backend/60 frontend unit, 36 API/11 Chromium E2E ve root kalite geçti.
  Disposable migration/diff temiz; test DB kaldırıldı. Retained iş verisi aynı
  (24 tablo/25 satır); yerel Hafta ekranında 1 plan/75 dk doğrulandı.
  Sırada yoklama bounded read ve tam oyuncu toplamları var. Yoklama/mutation
  refresh tamamlanmadan provider tam plan okumasını kaldırma. Diğer iş listeleri,
  yedi günlük okumanın pilot sorgu bütçesi/owner/SLO TBD ve BL-044/045/M4 açık.
  [Doğrulama](../30-quality/BL043_WEEK_READS_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.3):** Genel Bakış'ın
  antrenman/PRESENT sayaçları tam sunucu özetinden, son üç planı `limit=3`
  catalog projection'ından okunur; ortak plans dizisini tüketmez. Scope reset,
  stale-read koruması, yükleniyor/hata/boş ayrımı ve bağımsız retry doğrulandı.
  API/şema/migration/izin değişikliği yok. 492 backend/55 frontend unit, 35 API
  E2E, 11 Chromium E2E ve root kalite geçti. Disposable migration/diff temiz;
  test DB kaldırıldı. Retained fingerprint aynı (24 tablo/25 satır).
  Hafta/yoklama hâlâ tam plan okur; bunlar ayrılmadan provider'ın tam okumasını
  kaldırma. Sırada hafta dönem/gün okumaları, ardından yoklama özetleri var.
  Diğer iş listeleri, pilot owner/SLO TBD, BL-044/045 ve M4 açık.
  [Güncel doğrulama](../30-quality/BL043_DASHBOARD_TRAINING_READS_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.2):** Antrenmanlar bağımsız
  25'lik catalog sayfaları ve tam sunucu toplamlarına geçti. Scope reset,
  stale-read koruması, boş/hata/retry ve create hata gösterimi eklendi. Ortak
  plans dizisi değiştirilmedi: dashboard/hafta/yoklamayı yeni özet/period
  sözleşmelerine taşımadan bu tam okumayı kaldırma veya ilk sayfayla değiştirme.
  Sıradaki dilim dashboard tam counters/recent plans, ardından hafta ve yoklama.
  492 backend/50 frontend unit, 35 API/11 Chromium E2E ve root kalite geçti.
  Yerel iş verileri aynı; Antrenmanlar ekranında 75 dk/dört faz doğrulandı.
  Diğer iş listeleri, pilot owner/SLO TBD, BL-044/045 ve M4 kapıları açık.
  [Doğrulama](../30-quality/BL043_TRAINING_CATALOG_UI_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.1):** Antrenman catalog/page
  API'si minimal date/null/ID sayfaları ve tam scope toplamlarıyla hazır. Faz
  sayımı EXPLAIN kanıtıyla yalnız sayfa kimliklerine indirildi. 492 backend/
  44 frontend unit, 35 API E2E ve root kalite geçti; 25 kayıt 5.416 bayt/8 SQL
  sentetik ölçümü pilot SLO değildir. Şema/migration/index ve retained veriler
  değişmedi. Frontend/shared full-array okumaları bilerek değişmedi; bu dilimde
  Chromium tekrar çalıştırılmadı. Sırada antrenman sayfa state'i ile dashboard,
  hafta ve yoklama tüketicilerinin doğru toplam/period sözleşmeleri var; tam
  listeyi yalnız tüm tüketiciler ayrıldıktan sonra kaldır. Diğer iş listeleri,
  pilot kapasite, BL-044/045 ve M4 kapıları açık.
  [Kanıt](../30-quality/BL043_TRAINING_READ_FOUNDATION_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043d):** Seçili legacy bağlamı
  shell'in bütün grup/sezon dizilerini kaldırır; TEAM_VIEW yanında legacy üyeliği
  bağımsız kontrol eder. Maçlar kesilmeden tek relational sorguda döner. Player 360
  atama diyaloğu açılışta 25'lik takım/PLAYER rol sayfalarını yükler, sayfa dışı
  seçimi korur ve yeniden açılışta sıfırlar. 468 backend/44 frontend unit,
  33 API/10 Chromium E2E ve root kalite geçti; altı migration güncel, diff boş.
  Şema/migration/dependency veya retained iş verisi değişmedi; 24 tablo/25 satır
  fingerprint aynı. Disposable DB kaldırıldı, yerel Player 360 açık bırakıldı.
  Sırada tam özetleri koruyan iş kaydı sayfa/aggregate kapsamı ve sorgu planları;
  pilot kapasite owner/hedef TBD. BL-043 tam kapanmadı; BL-044/045 ve M4 ayrı.
  [Kanıt](../30-quality/BL043_LEGACY_METADATA_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043c):** Tarihli kadro/Player 360
  atama geçmişi bounded validFrom/ID sayfaları ve ayrı toplamlarla tamamlandı.
  Eski API'ler ve güncel grant/historical target sınırı korundu; person yetki
  kontrolü artık tüm atamaları belleğe yüklemez. 456 backend/41 frontend unit,
  32 API/9 Chromium E2E ve root kalite geçti. Migration/retained iş verisi değişmedi.
  Sıradaki iş BL-043d legacy metadata ve atama diyaloğu seçeneklerinin
  sınırlandırılmasıdır; BL-043 pilot hedefleri/owner TBD ve tam iş açık kalır.
  [Kanıt](../30-quality/BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043b):** Takım arama/sayfalama
  ve shell kulüp/sezon/takım katalogları tamamlandı. Seçili kayıt ilk sayfadan
  bağımsız yetkilendirilir ve seçeneklerde korunur; sayfa gezinmesi scope'u
  değiştirmez. Eski array sözleşmeleri korundu; migration/retained iş verisi
  değişmedi. 432 backend/35 frontend unit, 31 API/8 Chromium E2E ve root kalite geçti.
  Sıradaki iş BL-043c tarihli kadro ve Player 360 atama geçmişi sayfalaması.
  Legacy metadata/diyalog seçenekleri, pilot hedefleri ve owner TBD; BL-044/M4
  kapıları değişmedi. [Kanıt](../30-quality/BL043_WORKSPACE_CATALOGS_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043a):** Player page API/UI,
  sunucu araması, bounded nested projection ve capability/self/cursor kontrolleri
  tamamlandı. 1.000 oyuncu/3.000 atamalı disposable HTTP ölçümü; 416 backend,
  30 frontend unit, 30 API ve 7 Chromium E2E/root kalite geçti. Eski oyuncu array
  API korundu; migration veya retained iş verisi değişmedi. BL-043'ün tamamı
  kapanmadı: takım/workspace listesi, roster/history sayfalaması ve gerçek pilot
  hedef/ölçüm kapısı kalır. Önce takım/workspace dilimine devam et.
  [Dilim raporu](../30-quality/BL043_PLAYER_PAGINATION_2026-09-06.md).

- **Latest local delivery (2026-09-06, P0.1 rollout):** Kullanıcının kontrollü
  yerel geçiş devam onayıyla özel yedek/restore provası yapıldı; iki bekleyen
  migration yalnız `ngcs_local_session_dev` üzerinde uygulandı. Altı migration
  güncel, diff boş, iki kulüp IN_SYNC; 26 legacy tablo/83 kayıt korundu.
  3001/4000 dev server'lar ve mevcut oturum açıldı; scope/reload, Player 360,
  75 dk/dört fazlı plan ve maç analizi geçti. İş verisi değiştirilmedi;
  session refresh normal lifecycle işlemlerini yaptı. Prova DB kaldırıldı,
  özel yedek tutuldu. Uygulama/şema kodu, parola veya production değiştirilmedi.
  Sıradaki mühendislik işi BL-043 pagination/ölçüm; BL-044 ve M4 ayrı kapılardır.
  [Yerel geçiş raporu](../30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, P0.1b):** BL-042 uygulandı. Shared
  transaction adapter group/member/season/account projection'larını birlikte
  commit eder. Üyelik silme legacy geçmişi kapatır; bağımsız primary korunur;
  geçmiş sorgular güncel actor capability'sini yeniden denetler. Admin-only
  parity endpoint'i sayım döndürür. Shell kulüp/sezon/takım seçimini kullanıcıya
  bağlı ID'lerle saklar; yeni isteği eski yanıtla bozmaz ve dirty-editor guard'ını
  kullanır. PostgreSQL 29/29, schema diff boş; Chromium opt-in 6/6, backend 396 ve
  frontend 27 unit doğrulandı. Yeni migration veya retained rollout yapılmadı.
  Sırada retained rollout/parity kapısı ve BL-043 ölçek; BL-044 politika bekler.
  [Doğrulama raporu](../30-quality/P01B_COMPATIBILITY_VERIFICATION_2026-09-06.md).

- **Latest engineering delivery (2026-09-06):** Kullanıcı Phase 2 A–D kararlarını
  ve P0.1 uygulamasını onayladı. ADR-0021–0024 Accepted; Person/account, kalıcı
  Team/TeamSeason, tarihli SportingAssignment, functional role/capability ve
  sportif availability additive migration'ı; `/sporting` API'si; Takımlar,
  tarihli kadro, Oyuncular ve Player 360 shadcn rotaları uygulandı. Legacy backfill
  `LEGACY_MEMBER` dışında primarilik tahmin etmez. Sporting unit 17/17; disposable
  PostgreSQL backend E2E 28/28; legacy fixture/assertion ve boş schema diff;
  frontend 23/23 unit ve Chromium 4/4 (persistent opt-in skipped) geçti. İlk
  3101 browser denemesi flag-off CORS sabit allowlist nedeniyle login öncesi
  başarısız oldu; onaylı 3500 loopback origin'de aynı build geçti. Root quality
  sandbox prerender bind `EPERM` sonrası sandbox dışında tamamen geçti: 396 backend,
  23 frontend unit, iki build, Sites 4/4, 73 Markdown/0 kırık link ve CDSK. Retained yerel
  DB migration'ı ve production rollout yapılmadı. Açık işler BL-042 dual-write,
  kalıcı Club/Season/Team scope cutover, BL-043 pagination ve BL-044
  minor/safeguarding/retention politikasıdır. Bu teslim P0.1a'dır; tam P0.1 exit
  BL-042 sonrasıdır. Son integrity kapanışı geçmiş `asOf` Player 360'ta gelecek
  atamaları filtreler, sınırlı/açık primary dönem çakışmasını ve bitmiş atamanın
  yeniden bitirilmesini reddeder.
- **Latest engineering delivery (2026-09-06):** Kullanıcı ADR-0020 Option A'yı
  onayladı. Vendor-neutral Nodemailer SMTP portu, production fail-closed config,
  development/test operator fallback'i/no-store issuance; fragment tokenını hemen
  temizleyen public accept/reset rotaları; delivery failure revoke + generic 503;
  additive recovery audit migration'ı ve yalnız mevcut SYSTEM_ADMIN'i hedefleyen
  atomik maintenance komutu uygulandı. Provider/account/DNS/ücretli kaynak,
  production rollout ve korunan yerel DB migration'ı yapılmadı. Root quality 35
  backend suite/379 test, 7 frontend dosyası/23 test, iki build, Sites 4/4 ve
  docs/CDSK kapılarıyla geçti. Disposable PostgreSQL beş migration/repeat/status/
  boş diff, fake-SMTP E2E dahil 27/27 ve break-glass ACTIVE/authVersion=1/audit=1,
  açık refresh/reset=0/0 provasıyla doğrulandı; geçici hedef kaldırıldı. Chromium
  smoke'un bulduğu Strict Mode fragment kaybı ref tabanlı tek tüketimle kapatıldı;
  public rotalarda gereksiz refresh yok, tokensız reset submit'i disabled.
- **Latest engineering delivery (2026-09-06):** ADR-0019 Option 1 açık kullanıcı
  onayıyla uygulandı. `(planId, playerId)` unique constraint, duplicate varsa
  hiçbir satırı değiştirmeden duran additive migration ve tek Prisma upsert
  `findFirst` → create yarışını kapattı. Korunan yerel DB salt-okunur envanteri
  0 attendance/0 duplicate gösterdi. Üç focused
  suite 24/24; disposable PostgreSQL 16 clean/repeat/status/empty diff ve
  concurrent HTTP dahil backend E2E 26/26 geçti. Duplicate fixture migrationı
  `23505/P3018` ile reddedildi; iki satır korundu ve index oluşmadı. Root quality
  32 backend suite/368 test, 6 frontend dosyası/21 test, iki build ve bütün static,
  Sites, docs/CDSK kapılarıyla geçti. Ayrı açık onayla additive migration korunan
  yerel DB'ye reset yapmadan uygulandı; status güncel, attendance 0 ve unique index
  sayısı 1. Backend/frontend HTTP sağlık kontrolleri 200 geçti.
- **Latest engineering delivery (2026-09-06):** BL-024 onuncu dilim / BL-038:
  training-plan create/update/delete, tek faz ekleme, faz listesini değiştirme ve
  board snapshot lookup/write persistence yolları cause-free generic 500 ve işlem
  türüne özel sabit olaylara indirildi. Transaction içindeki explicit 400,
  authorization, atomik mutation, başarılı sonuç ve opsiyonel season-day fail-soft
  bağlantısı korundu. On bir yeni error-boundary testiyle 122 focused training-plan
  testi; root quality 32 backend suite/371 test, 6 frontend dosyası/21 test, Sites
  4/4 ve bütün static/build/docs kapıları geçti. Disposable PostgreSQL 16 üç
  migration/status, boş diff ve mevcut 25/25 E2E başarılı. Container ve anonim
  test volume'u kaldırıldı; korunan yerel DB değişmedi. Statik yeniden taramada
  onaylı MVP mutation body/log kapsamı temiz bulundu; BL-024/F-008 kapandı.
  Browser E2E tekrarlanmadı; API/şema/dependency/production değişmedi.
- **Previous engineering delivery (ninth slice):** BL-024 dokuzuncu dilim / BL-037:
  season/week/day/match create, update, delete, toggle, tactical-board ve
  week-generation persistence/missing-record yolları cause-free generic 500 ve
  işlem türüne özel sabit olaylara indirildi. Transaction içindeki explicit 400,
  mevcut missing-record status'u, authorization ve başarılı sonuçlar korundu.
  Sekiz yeni error-boundary testiyle 42 focused season testi; root quality 31
  backend suite/360 test, 6 frontend dosyası/21 test, Sites 4/4 ve bütün
  static/build/docs kapıları geçti. Disposable PostgreSQL 16 üç migration/status,
  boş diff ve mevcut 25/25 E2E başarılı. Container ve anonim test volume'u
  kaldırıldı; korunan yerel DB değişmedi. Browser E2E tekrarlanmadı;
  API/şema/dependency/production değişmedi.
- **Previous engineering delivery (eighth slice):** BL-024 sekizinci dilim:
  attendance lookup/update/create persistence hataları cause-free generic 500 ve
  `ATTENDANCE_MARK_FAILED` sabit olayına indirildi. DTO, controller plan/oyuncu
  authorization'ı ve başarılı find-then-update/create korunur. Üç yeni testle 27
  focused attendance testi; root quality 30 suite/351 backend, 6 dosya/21 frontend,
  Sites 4/4 ve bütün static/build/docs kapıları geçti. Disposable PostgreSQL 16 üç
  migration/status, boş diff ve mevcut 25/25 E2E başarılı. Geçici veri kaldırıldı;
  demo DB değişmedi. Statik inceleme `(planId, playerId)` unique constraint
  olmadığını ve concurrent duplicate riskini gösterdi; F-013/CR-014/BL-036 Proposed,
  migration uygulanmadı. Browser E2E tekrarlanmadı; frontend/dependency/production
  değişmedi.
- **Previous engineering delivery (seventh slice):** BL-024 yedinci dilim: MVP body
  envanteri, club update ve drill create/update/delete hata/body sınırı. MVP
  mutation controller'larında `any` kalmadı; health/analytics prototipleri politika
  onayı beklediği için değiştirilmedi. F-012/BL-034 dört persistence sink'ini
  cause-free generic 500 + sabit olaya; drill null/array/primitive body'yi kontrollü
  400'e bağladı. Update authorization parse öncesindedir. 12 yeni regresyon,
  56 focused club/drill testi; root quality 29 suite/348 backend, 6 dosya/21
  frontend ve Sites 4/4 geçti. İlk quality sandbox loopback `EPERM` ile frontend
  build'de durdu; sandbox dışı tekrar tamamen geçti. Disposable PostgreSQL 16 üç
  migration/status, boş diff ve 25/25 E2E başarılı. Geçici veri kaldırıldı; demo DB
  değişmedi. Browser E2E tekrarlanmadı; schema/dependency/production değişmedi.
- **Previous engineering delivery (sixth slice):** BL-024 altıncı dilim: group
  update/delete ve membership add/remove persistence/duplicate/missing yolları
  cause-free generic 500 + sabit olaya indirildi. F-011/BL-033 ile üyelik temizliği
  ve grup silme tek transaction'dır; foreign-key reddinde üyelikler geri alınır.
  Mevcut başarılı sonuç ve duplicate/missing 500 status'u korundu. 11 yeni
  error-boundary testi, 56 focused group testi; root quality 28 suite/336 backend,
  6 dosya/21 frontend, Sites 4/4 ve bütün static/build/docs kapıları geçti.
  Disposable PostgreSQL 16 üç migration/status, boş schema diff ve 24/24 E2E
  başarılı. İlk hedef DB adı session E2E güvenlik kapısına uymadığı için suite
  başlamadan reddedildi; aynı disposable container'daki `e2e` adlı DB'de tüm suite
  tekrar geçti. Geçici veri kaldırıldı; korunan yerel DB değişmedi. Browser E2E
  tekrarlanmadı; dependency/migration/production değişmedi. Sırada kalan implicit
  framework hata/body yollarının yeni envanteri vardır.
- **Previous engineering delivery (fifth slice):** BL-024 beşinci dilim:
  group/club create/update/member runtime DTO. F-010/BL-032 ile POST /clubs body
  `id`, timestamp ve nested relation yazamaz; yalnız name/logo/description Prisma'ya
  gider. Club ve club-group create hataları cause-free generic 500 + sabit olaydır.
  Mevcut enum/default/null/empty sözleşmesi korundu. Independent review `/groups`
  body hedefinde auth-before-validation regresyonu buldu; clubId-only parse ve
  unit/HTTP cross-club 403 regresyonuyla kapandı. 84 focused test; root quality
  27 suite/325 backend, 6 dosya/21 frontend, Sites 4/4 ve bütün static/build/docs
  kapıları geçti. Disposable PostgreSQL 16 üç migration deploy/status, boş schema
  diff ve 23/23 E2E başarılı. Geçici container/veri kaldırıldı; demo DB değişmedi.
  Browser E2E tekrarlanmadı; dependency/migration/production değişmedi. Sırada
  group update/delete, duplicate/missing membership ve diğer framework hata/body
  yollarının dar kapsamlı envanteri var.
- **Previous engineering delivery (fourth slice):** BL-024 dördüncü dilim:
  season/week/day/match runtime DTO; controller/service explicit field projection
  ile F-009/BL-031 hafta nested-write/reparent ve match-create invalid board yolu
  kapatıldı. Mevcut ADR-0007/0012/0014 sınırının düzeltmesidir; yeni yetki politikası
  değildir. Date-only/local ISO/offset, nullable/default/JSON, 80 hafta ve group
  kontrolleri korundu. 31 yeni unit ve iki HTTP regresyonu; independent fix-finding
  review somut kalan bypass/regresyon bulmadı. Root quality 25 suite/250 backend,
  6 dosya/21 frontend, Sites 4/4 ve tüm static/build/docs kapıları geçti.
  Disposable PostgreSQL 16'da üç migration deploy/status, boş schema diff ve
  backend 22/22 E2E başarılı. Yalnız geçici test container/verileri kaldırıldı;
  korunan demo DB değişmedi. Browser E2E tekrarlanmadı; dependency/migration yok.
  Bu tarihsel dördüncü dilim kaydıdır; group/club kapsamı beşinci dilimde tamamlandı.
- **Previous engineering delivery (third slice):** BL-024 üçüncü dilim: plan create/update
  controller/service runtime DTO'ları; principal identity, null/undefined alanlar,
  timestamp offset, Int şema sınırı ve serializable group aggregate'leri korunur.
  58 unit ve iki gerçek HTTP/Prisma testi eklendi. Root quality 24 suite/219 backend,
  6 dosya/21 frontend, Sites 4/4 ve tüm build/static/docs kapıları geçti. Ayrı
  disposable PostgreSQL 16'da üç migration deploy/status/boş schema diff ve backend
  E2E 20/20 başarılı. Test container kaldırıldı; korunan yerel DB'ler değişmedi.
  Browser E2E tekrarlanmadı; yeni dependency/migration yok. Bu tarihsel üçüncü
  dilim kaydıdır; season/week/day/match sonraki dördüncü dilimde tamamlandı.
- **Previous engineering delivery (second slice):** BL-024 ikinci dilimi tamamlandı. POST /groups
  create hatası yalnız GROUP_CREATE_FAILED ve cause taşımayan HttpException üretir;
  genel HTTP 500 zarfı, başarılı sonuç ve category default'u korunur. Yoklama ve
  tek faz ekleme controller/service girişlerinde mevcut enum/alan kurallarıyla
  doğrulanır; authorization korunur. 51 yeni regresyon; root quality backend
  23 suite/161 test, frontend 6 dosya/21, Sites 4/4, iki build, typecheck/lint/format,
  CDSK, 65 Markdown/0 kırık link ve diff geçti. Gerçek Nest exception filter unit
  testlidir; HTTP/DB/browser E2E tekrar çalıştırılmadı. DB/şema/production ayarları
  değişmedi. fix-finding bağımsız incelemesi scoped log yolunda somut kaçış veya
  regresyon bulmadı. POST /clubs/:id/groups bağımsız yolunda framework ham hata
  logu ve diğer DTO yolları açıktır; BL-024 bütünü tamamlanmadı.
- **Previous engineering delivery:** Kullanıcı kalan genel eksikliklerde sırayla
  ilerlemeyi istedi. BL-024 ilk dilimi uygulandı: analytics 41 lint warning kapalı;
  mevcut alan eleme/dönüşüm/null rejection korunur. Plan-season link raw-error ve
  metadata logları sabit Nest olaylarına indirildi; normal/fail-soft davranış
  korunur. Replace-drills, mevcut service kurallarını ortak runtime DTO parser'ıyla
  controller'da `.map()` öncesinde uygular. 42 yeni test; root quality backend
  20 suite/110 test, frontend 6 dosya/21 test, Sites 4/4, iki build, typecheck,
  lint/format, CDSK, 65 Markdown/0 kırık link ve diff geçti. HTTP/DB E2E tekrar
  çalıştırılmadı; şema/yerel DB/production ayarları değişmedi. Bağımsız log-patch
  incelemesinde somut bypass/regresyon bulunmadı. Bu ilk dilimin tarihsel kaydıdır.
- **Latest delivery:** Kullanıcı yerel demo tarih/süre/içeriğini asistana devretti;
  tekrar sormadan seçilebilir, genel onay kapıları değişmez. İlk demo planı
  `cmtotozut0005r1puwqggqc2r`, 7 Eylül 2026 18:00 Europe/Istanbul ve dört fazlı
  75 dk olarak yerel çalışma DB'sine kaydedildi. Yeni plan ve ilişkileri dışında
  iş kaydı değiştirilmedi; gerçek katılım olmadığı için attendance 0 korundu.
  Browser'da saptanan stale workspace süre özeti BL-030 ile düzeltildi;
  route/context regresyonu ve root quality (68 backend/21 frontend) geçti.
  DB E2E suite'i tekrar çalıştırılmadı. Bu önceki demo teslimidir; güncel öncelik
  yukarıdaki BL-024 mühendislik işleridir. Global egzersizler korunmalıdır.
- **Current local work:** Production hazırlığı kullanıcı isteğiyle beklemede.
  Frontend `localhost:3001`, backend `localhost:4000` kalıcı oturum flag'leri açık
  çalıştırıldı. `ngcs_local_test` kaynağı korunarak `ngcs_local_session_dev`
  kopyasına üçüncü migration uygulandı. Kopya kullanıcı çalışması içindir;
  E2E seed/reset çalıştırılmamalıdır. HTTP 200 smoke, cookie'siz refresh 401 ve
  browser login ekranı doğrulandı. İlk kayıtlı login reddedildikten sonra doğru
  yerel koç hesabı explicit kullanıcı onayıyla yalnız kopyada sıfırlandı.
  authVersion artışı, refresh/reset revoke ve token-free audit aynı transaction'da
  uygulandı. Hash doğrulaması, API login 201/persistent ve logout 200 geçti;
  kullanıcı/plan/drill/maç/katılım sayıları korundu. Credential repository'ye
  yazılmadı. Sonraki yerel browser smoke'ta yeni sekme/reload oturumu, hafta geçişi,
  kütüphane, maç/kadro ve boş plan/yoklama ekranları doğrulandı. Tahtada oyuncu
  ekle/undo denendi; iş verisi kaydedilmedi. BL-029/P3: yeni boş taslakta yanlış
  “Kaydedildi” etiketi sonraki adımda düzeltildi. Ortak editör persisted ve dirty
  durumunu ayırıyor; yeni egzersiz/maç/snapshot doğru başlangıç bilgisini aktarıyor.
  Yedi yeni component testi, browser yeni-taslak/maç smoke ve root quality geçti
  (68 backend/20 frontend, Sites 4/4). DB E2E tekrar çalıştırılmadı; API/şema/iş
  verisi değişmedi. BL-029 kapalı. Sonraki yerel ürün adımı kullanıcı içeriğiyle
  ilk plan → fazlı egzersiz → katılım akışıdır.
- **Latest continuation:** `962a763` kod tabanından M4 karar girdileri ve BL-028
  hazırlandı. Domain/provider/bütçe/bölge/kapasite/owner henüz TBD. Session flag-off
  CORS'un localhost'a dönüşü production browser rollback kapısıdır. Mimari özet
  ADR-0018 ile hizalandı; yalnız belge değişikliği, deployment/migration yok.
  Sonraki girdi listesi: [M4_ROLLOUT_INPUTS.md](../40-operations/M4_ROLLOUT_INPUTS.md).
- **Session summary:** `1b831e0` tabanlı `codex/mvp-stabilization` çalışma ağacında
  A–D stabilizasyonu ve ADR-0017 artifact ayrımını izleyen onaylı ADR-0018 opt-in
  kalıcı oturum uygulandı. Root quality (68 backend / 13 frontend unit), disposable
  PostgreSQL 16 migration/idempotency/status/boş diff, backend 18/18 E2E ve frontend
  opt-in 4/4, flag-off 3/3 Playwright geçti. Runtime/migrator imajları yeniden
  oluşturuldu. Flag'ler varsayılan kapalı; yerel uygulama DB'sine migration veya
  production rollout yapılmadı. MVP remediation review hükmü **Pass**.
- **Documents updated:** ADR-0014–0020, `MVP_REVIEW_2026-09-05.md`, BL-011/017–038,
  CR-009–015, requirements, security/data/API/integration/operations gerçekleri,
  roadmap/milestone, changelog ve Project Boot.
- **Decisions recorded:** Dashboard `GLOBAL + own club`; aggregate'lerde kesin
  group sınırı; Socket operasyon olaylarında güncel group/resource alıcısı;
  password reset'te transaction içi conditional single-winner claim; Prisma CLI
  advisory zinciri hosted runtime için geçici `not_actionable` risk kabulü;
  serving runtime ile migration artifact'ının ayrılması; default-disabled kalıcı
  session, 15m access/7d idle/30d absolute, beş-family ve 30d refresh-record
  retention. ADR-0019 attendance fail-fast migration + unique constraint + atomik
  upsert paketini kabul eder. ADR-0020 hesap teslimi ve break-glass recovery için
  Option A'yı kabul eder; provider/production rollout `TBD`dir.
- **Remaining risk:** Global log retention,
  formal WCAG, provider, registry/orchestrator, ayrı DB rolleri,
  security-audit/sağlık retention, readiness, observability ve backup M4 veya ayrı
  karar kapılarında `TBD`. Web Locks bulunmayan
  tarayıcılarda eşzamanlı rotation fail-closed yeniden giriş gerektirebilir.
- **Recommended next step:** Global log retention/veri sınıflandırma kararını
  hazırlamak. Provider hesabı, ücretli kaynak, DNS ve production rollout M4
  kapsamında `TBD` kalır.

Handoff sohbet dökümü, secret veya kişisel veri içermez.
