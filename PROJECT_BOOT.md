# Next Generation Coaching System — Project Boot

- **Document version:** 2.176
- **CDSK version:** 0.1.0
- **Last updated:** 2026-10-27

> Bu belge güncel çalışma özetidir. Bilinmeyen alan `TBD`, geçersiz alan kısa
> gerekçeyle `N/A` bırakılır.

## Project Compass

- **Product audit publication (2026-10-27):** user authorizes remaining ready
  audit docs/assets on the current branch. Fresh122 screenshot hash/pixel checks,
  132 image decodes and11 historical JSON checks pass; original `.png` filenames
  contain JPEG bytes and remain unchanged. Manifest text encoding caveat recorded.
  Historical17/17 quality is verified from its log, not rerun. Known P1 issues stay
  open; later authorized roster operations are separate from26 October isolation.
  [Publication review](docs/30-quality/PRODUCT_AUDIT_2026-10-26.md#yayın-incelemesi--27-ekim-2026).

- **Player evidence publication (2026-10-27):** user authorizes commit/push of
  roster/season-link reports with five screenshots and two sanitized JSON receipts.
  Fresh read-only season verification remains25/25 with42-table expected-diff
  checks. Exact publication tree contains only this delivery's docs/assets;
  uncommitted product-audit work is preserved separately. No runtime/data write.
  [Publication checks](docs/30-quality/FIRST_TEAM_SEASON_LINK_2026-10-27.md#yayın-kontrolü).

- **Existing first-team season link (2026-10-27):** explicit follow-up links the
  original player to the same team's2026–2027 TeamSeason via existing primary
  transition. Old assignment closes27 October, history and legacy membership stay
  intact; one new primary/two audit records, no new people/accounts. Rollback and
  42-table preservation checks pass; directory/season roster now25/25, replay zero.
  [Record](docs/30-quality/FIRST_TEAM_SEASON_LINK_2026-10-27.md).

- **Synthetic team rosters (2026-10-27):** user explicitly selects sample players.
  Local Spor Manage2026–2027 receives186 accountless people/profiles/season-bound
  primary assignments: first team24 new/25 directory total; U8–U16 each18. Rollback
  rehearsal,42-table prior-row preservation, existing services and zero-write replay
  verified. Initial season roster24/directory25 difference is resolved by the
  subsequent explicitly requested season-link operation above. No runtime/model/new ADR.
  [Record](docs/30-quality/SYNTHETIC_TEAM_ROSTERS_2026-10-27.md).

- **Repeated ready-drill boards (2026-10-26):** user screenshot corroborated by read-only retained source comparison:120 PUBLISHED/24 SENIOR records,4 geometries after removing element IDs, all7elements, source equality. Generator uses four coordinate offsets irrespective of drill objective. A16/BL-077 records an existing content defect, not merely future polish. No runtime/data write; v1 provenance and plan snapshots must be preserved; new revisions need normal review, ADR-0041 not extended. [Evidence](apps/frontend/qa/product-audit-2026-10-26/drill-board-diagnosis.json).

- **Product/component audit (2026-10-26):** baseline9e9b109; assessment only, no runtime/model/dependency fix.122 accepted new synthetic browser captures,30 planning HTTP assertion groups and41 people/admin checks; PLAYER roster self-scope P1 and note grant recovery P1 remain open, plus activity/draft/primary-team/dashboard/editorial gaps. Root quality once17/17;41 retained business tables unchanged at audit closure; QA3517/4017 stopped, canonical3132/4000 preserved then. Date-input/new-plan/wizard completion and PNG/SVG file verification limits are explicit. Next: BL-069,070,071,075,072; subsequent27 October publication is authorized above. [Report](docs/30-quality/PRODUCT_AUDIT_2026-10-26.md) and [matrix](docs/30-quality/PRODUCT_AUDIT_MATRIX_2026-10-26.md).

- **PR#2 main merge (2026-10-26):** explicit user authorization merges reviewed
  e8a4199 as af52b8c; expected parents and identical tested tree verified. Fresh
  affected37 tests pass; GitHub confirms closed/merged. Local main fast-forwards
  cleanly and initially matches origin0/0. Closure docs only; verify final sync
  after publication. Feature branch preserved; no service/data operation.
  [Record](docs/30-quality/PR_2_MAIN_MERGE_2026-10-26.md).

- **PR#2 PNG readiness (2026-10-26):** main-targeted draft opened on explicit
  user request; reconcile evidence-only main6c78681 into feature21ea790. Four
  docs conflicts resolved preserving both histories; runtime/test blobs unchanged.
  Fresh37 tests and independent review show no Important/Critical blocker.
  Existing root17/17 covers identical code; fresh docs/static checks cover closure.
  Final push/mergeability checks precede ready transition; no main merge requested.
  [Record](docs/30-quality/PR_2_PNG_READINESS_2026-10-26.md).

- **Pending QA evidence publication (2026-10-25):** user authorizes reviewing
  and publishing ready work to main. Smoke/export reports and12 proof files pass
  artifact checks; immutable aff1cb7 baseline passes35 SVG/editor tests. Ongoing
  PNG code/tests stay separate. Temporary-index publication preserves the active
  checkout. [Review](docs/30-quality/POST_MERGE_QA_PUBLICATION_2026-10-25.md).

- **PNG fix publication (2026-10-25):** user authorizes final review/commit/push
  to codex/png-download-compatibility. Scoped re-review has no Important/Critical
  issue; unchanged runtime retains root17/17 evidence. Fresh scoped tests and
  staged docs/artifact checks cover delivery. Include all three linked local QA
  reports and15 assets; keep ignored operators/logs/config outside Git. Final
  remote/local equality and clean tree are delivery checks; no main merge/PR.
  [Record](docs/30-quality/PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md#publication-review--2026-10-25).

- **PNG browser compatibility (2026-10-25):** user-requested narrow fix replaces
  PNG data-URL download with existing Blob transport. V1/V2 regressions fail
  first, then37 scoped tests pass. Actual IAB and Chrome files now download and
  equal the original PNG hash/resolution. Root17/17 (941/558/Sites4/tooling8)
  passes; focused review has no Important/Critical finding.
  No retained write, schema/dependency/new ADR. On codex/png-download-compatibility;
  prior local evidence preserved. [Record](docs/30-quality/PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md).

- **Tactical export acceptance (2026-10-25):** actual downloaded PNG1600×1200
  and SVG800×600 match the saved nine-object half pitch. Selection/125% zoom
  repeats produce byte-identical files;35 export/editor tests pass. In-app PNG
  does not download in this run; Chrome does. Offline SVG rendering confirms
  geometry with minor font-substitution variance. No runtime/data change.
  [Record](docs/30-quality/TACTICAL_EXPORT_ACCEPTANCE_2026-10-25.md).

- **Main browser smoke (2026-10-25):** rebuilt/restarted canonical main API/UI;
  persistent session restores after reload. Library120, SENIOR/tactical16,
  preview and both attachment paths pass. Explicitly named retained QA plan
  saves two frozen phases/50min with linked day50; separate QA tactic saves and
  reloads half-pitch/nine equipment. Desktop smoke only; export-event probe
  times out, so downloads remain unverified. No runtime/migration/new ADR.
  [Evidence](docs/30-quality/MAIN_BROWSER_SMOKE_2026-10-25.md).

- **Main ready-plan browser acceptance (2026-10-25):** normal build/main API/UI
  run; retained library shows120. Isolated real UI add yields1 phase/20min;
  actual source v2 publication changes seven elements to zero, while full plan
  reload keeps all seven/content v1. Boardless source edit also stays absent.
  Original41-table fingerprints match excluding the separate concurrent QA
  plan's new rows. Main remains running; isolated QA services stop. Evidence/docs
  only, no runtime patch or new ADR. [Record](docs/30-quality/MAIN_READY_PLAN_ACCEPTANCE_2026-10-25.md).

- **Post-merge cleanup (2026-10-25):** user explicitly requests removing merged
  codex/mvp-stabilization and the old PR review checkout. Feature/review commits
  are contained in main; local and expected-tip remote branch deletion complete.
  Managed review archive preserves staged documents; ignored build config and
  patches separately backed up. Primary dependency junction targets remain intact.
  Final docs/ref/worktree checks and main sync close the operation. No runtime change.
  [Record](docs/30-quality/POST_MERGE_CLEANUP_2026-10-25.md).

- **PR#1 main merge (2026-10-25):** user authorizes final check and merge when
  clear. Fresh scoped reviewer confirms no Important/Critical blocker and136
  affected tests pass. Root17/17 and PostgreSQL HTTP11 cover reviewed6fb5fb6;
  exact-head GitHub merge produces a90123a with the identical tested tree.
  GitHub closed/merged and remote/local main alignment verified. Subsequent
  closure records are docs only; feature branch and review worktree preserved.
  [Record](docs/30-quality/PR_1_MAIN_MERGE_2026-10-25.md).

- **Frozen plan-board correction (2026-10-25):** explicit user request fixes the
  PR#1 P2: non-null contentSnapshot freezes board absence in both readers, full
  projection and first-save/replacement guards; old rows retain source fallback.
  Red regressions then136 affected tests and PostgreSQL HTTP11 pass. Complete
  root17/17 passes (backend941/frontend556/Sites4/tooling8); scoped reviewer
  reports no Important/Critical issue. Ready transition is authorized after
  same-branch push and final GitHub checks. Concurrent independent notes are preserved. No migration/retained write.
  [Evidence](docs/30-quality/FROZEN_PLAN_BOARD_FIX_2026-10-25.md).

- **Frozen-board independent verification (2026-10-25):** user requests the
  source-independent plan-board fix. Concurrent shared implementation is preserved;
  this chat independently confirms136 affected tests/11 PostgreSQL HTTP cases and
  SQL/JSON-null CLUB source V1/V2 edit, replacement and explicit board-save cases.
  No retained-data write or new ADR. Full publication/readiness work remains in
  the separately authorized chat. [Evidence](docs/30-quality/FROZEN_BOARD_INDEPENDENT_2026-10-25.md).

- **PR#1 readiness re-review (2026-10-20):**069f459/main has no merge conflict,
  external reviews or CI statuses. Original legacy-attachment P1 is fixed; one
  verified P2 blocks readiness: frozen boardless v1 phases inherit a later
  published source board. Actual dedicated PostgreSQL/service reproduction
  preserves the unchanged phase row while exposing the new diagram. Keep draft;
  fix/retest both readers before ready/merge. [Review](docs/30-quality/PR_MAIN_READINESS_2026-10-20.md).

- **Tactical icon documentation publication (2026-10-20):** user requests commit/
  push on codex/mvp-stabilization after1d75b9f. Remaining shared docs and three
  original JPEGs reviewed; action-stage evidence is historical, selected nine-tool
  implementation already shipped. Completed selection replaces stale pending copy.
  Fresh links/CDSK/whitespace/instruction-format checks cover docs only; no runtime,
  retained-data write or new ADR. [Review](docs/30-quality/TACTICAL_ICONS_2026-10-20.md).

- **Training workflow publication (2026-10-20):** explicit review/commit/push
  request targets codex/mvp-stabilization after24a4a2a. Ready-only library/team-
  age picker, legacy attachment, attendance and training-detail source/tests/docs
  are included. Fresh root17/17 (backend937/frontend556/Sites4/tooling8) and
  dedicated PostgreSQL HTTP11 pass; exact-index links/CDSK/whitespace pass.
  Verification is recorded in the publication report;
  previous UI/data acceptance remains historical. No retained write/migration.
  [Review](docs/30-quality/TRAINING_WORKFLOW_PUBLICATION_2026-10-20.md).

- **Team-ready plan picker (2026-10-20):** explicit request fixes choices to the
  starter collection plus server-resolved saved-group TEAM age, through filters/
  cursors/reset. Backend40/frontend34/PG HTTP11 and actual SENIOR48/tactical16/
  preview/focus pass. Existing seasonal plans,48 snapshots and41-table prior
  business preserved; no retained add/migration/new ADR.
  Root17/17 passes, including backend937/frontend553/Sites4/tooling8 and builds.
  [Evidence](docs/30-quality/PLAN_PICKER_READY_ONLY_2026-10-20.md).

- **Ready-only library (2026-10-20):** explicit request fixes `/app/library` to
  the120 stable starter IDs/PUBLISHED/GLOBAL, all ages by default. Search/phase/
  age/cursor/reset retain collection; no seasonal switches. Backend35/frontend41/
  PostgreSQL HTTP11 and actual five-page120/SENIOR48/reset120 pass. Existing
  seasonal records,48-snapshot pool and41-table prior business unchanged.
  Full suites932/543/Sites4/tooling8/builds pass; root15/17 plus final type/format
  repeats cover all stages. Final197-file links/CDSK36/47/whitespace pass.
  [Evidence](docs/30-quality/LIBRARY_READY_ONLY_2026-10-20.md).

- **Ready exercise pool (2026-10-20):** explicit user approval creates undated
  A Takım — Hazır Egzersizler,48 exact-SENIOR published starter snapshots/1184min,
  coach Kerem. Existing20min/4-phase training and all previous business rows across
  41 tables preserved; replay writes zero and actual instructions/pitch/reload pass.
  Starter120 already published;1826 catalog =1778 CLUB +48 age-supported originals.
  [Evidence](docs/30-quality/READY_EXERCISE_POOL_2026-10-20.md).

- **Legacy exercise fix (2026-10-20):** plan preview now receives saved catalog
  facts and restores focus/selection. Migrated LEGACY/LEGACY_UNVERIFIED NULL-board
  versions attach with frozen content/duration through add/replace; professional
  validation and age/version/access guards remain. Affected backend45/frontend29,
  dedicated PostgreSQL HTTP10 and actual preview pass. No retained write/migration.
  Full root17/17 passes (927/542/Sites4/tooling8); local API rebuilt/restarted with
  existing settings, UI reload/session and saved20min/4 phases pass.
  Local follow-up to historical PR P1; no commit/push/readiness change.
  [Evidence](docs/30-quality/DRILL_LEGACY_PREVIEW_FIX_2026-10-20.md).

- **Training detail icons (2026-10-20):** user screenshot's Planlar link and
  Antrenman detayı eyebrow removed from shared heading; restrained colored
  Phosphor icons distinguish title/date, summary, tabs and phase types. Saved
  data unchanged. Focused35/type/lint/format/build/Sites4 and desktop/mobile pass.
  [Evidence](docs/30-quality/TRAINING_DETAIL_ICONS_2026-10-20.md).

- **Modern 2D pitch (2026-10-20):** Eleven distinct shared templates, safe
  proportional pitch edits, modern equipment and compact route toolbar.
  [Verification](docs/30-quality/TACTICAL_PITCH_MODERN_2D_2026-10-20.md).

- **Main PR review (2026-10-20):** PR#1 targets main. Risk-focused review of
  implementation d65f799 finds one P1: migrated boardless legacy drill attachment
  throws400. Keep draft until fixed/retested. Fresh backend918/frontend514/Sites4/
  tooling8 pass; isolated root15/17 hits junction TS2742, both affected checks pass
  with review-only preserveSymlinks. No GitHub CI checks reported. Attendance UI
  edits stay local. [Review](docs/30-quality/PR_MAIN_FINAL_REVIEW_2026-10-20.md).

- **Training attendance UI/UX (2026-10-20):** compact player rows, readable saved
  status and explicit Katıldı/Katılmadı controls; mobile48px actions and keyboard
  focus restoration. Full counters, cursors, uncertain writes and PLAYER self
  scope preserved. Frontend14/type/lint/format/build/Sites4 and responsive/read-only
  persistence checks pass. [Evidence](docs/30-quality/TRAINING_ATTENDANCE_UX_2026-10-20.md).

- **Training attendance acceptance (2026-10-20):** existing synthetic Mert Çınar
  appears in Kerem's retained plan roster. One UI PRESENT save persists after full
  reload, 1/1. Unique row and unchanged other attendance/business data verified
  read-only. Stopped canonical API/UI restored with existing persistent-session
  configuration. [Evidence](docs/30-quality/TRAINING_ATTENDANCE_2026-10-20.md).

- **Training-dialog publication follow-up (2026-10-19):** user explicitly requests
  commit/push. Prior combined3d5d758 already equals remote; remaining attachment,
  training form and draft-preserving coach-refresh source/tests/QA target the same
  codex/mvp-stabilization branch. Fresh root17/17 passes: backend918/frontend514/
  Sites4/tooling8, types/lint/format/builds,186-file links, CDSK36/47 and whitespace.
  All8 code/test/style hashes stay unchanged;58 files/38 QA PNGs pass staged hygiene.
  [Evidence](docs/30-quality/UI_PUBLICATION_FOLLOWUP_2026-10-19.md).

- **Publication verification (2026-10-19):** requested final review/commit/push
  targets codex/mvp-stabilization only. Fresh root17/17 passes: backend918/frontend509/
  Sites4/tooling8; dedicated PostgreSQL HTTP36/36 and operator guards/syntax pass.
  Output baselines/env/Python caches excluded, staged text scan has no findings.
  [Review](docs/30-quality/PRE_PUSH_REVIEW_2026-10-19.md).

- **Five-match senior microcycles (2026-10-19):** ADR-0047 / REQ-033 / CR-034 /
  BL-068 accepts five SENIOR fixtures using existing actual-hour presets and manual
  protections. Backend918/focused48/HTTP21, all21 weekday combinations and restored
  UI pass.36 retained fixture dates unchanged; no migration/re-enrollment.
  [Evidence](docs/30-quality/FIVE_MATCH_PROGRAM_2026-10-19.md).

- **Four-match senior microcycles (2026-10-19):** ADR-0045 / REQ-032 / CR-033 /
  BL-067 extends existing elapsed-hour planning to four SENIOR fixtures, retaining
  manual decisions and transaction guards. Backend913/focused43/HTTP19 and all35
  weekday combinations pass; restored UI/retained preservation verified. No migration.
  [Evidence](docs/30-quality/FOUR_MATCH_PROGRAM_2026-10-19.md).

- **Exercise detail UI/UX (2026-10-19):** compact library/Matches heading,
  four-fact summary and one Uygulama/Saha/Kaynak guide. Full numbered steps,
  equipment, exact-age coaching and source attribution remain. Readonly pitch
  mounts on Saha; mobile44px actions/tabs, short summary and picker focus return
  pass actual1440/1024/390/320 QA. Full frontend509/509, affected29/29, final
  detail11/11 and type/lint/format/build/Sites4 pass; initial173-file links pass.
  The closing snapshot reported6 missing four-match links and duplicate ADR-0045.
  Follow-up resolves both: report links exist; CDSK is ADR-0046 and four-match
  remains ADR-0045. Link/profile checks have zero errors. No retained
  business write, API/schema/dependency/flag or new ADR.
  [Evidence](docs/30-quality/LIBRARY_DETAIL_UX_2026-10-19.md).

- **Repository-owned CDSK (2026-10-19):** explicit user request approves ADR-0046
  and resolves ADR-0001's portable-validator question. Default wrapper uses tracked
  Python and the documented CDSK0.1.0 project profile, without sibling checkout.
  Eight tooling tests pass, including17 Python cases (16 pass/one Windows symlink
  privilege skip). Full root17/17 passes: backend913/frontend509/Sites4/tooling8,
  CDSK36 documents/46 ADRs,178-file links, types/lint/format/builds/whitespace all
  pass, exit0. BL-061 complete. Earlier external-source
  blocker entries below are historical. [Evidence](docs/30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md).

- **Three-match senior microcycles (2026-10-19):** ADR-0044 / REQ-031 / CR-032 /
  BL-066 extends existing elapsed-hour preview/apply and enrolled reconciliation
  to three SENIOR fixtures. Manual/time/deletion protections remain. Backend908 /
  focused38 / HTTP17 and restored UI pass;36 retained dates unchanged, no migration.
  [Evidence](docs/30-quality/THREE_MATCH_PROGRAM_2026-10-19.md).

- **Two-match senior microcycles (2026-10-19):** ADR-0043 extends existing
  preview/apply and date reconciliation to two SENIOR fixtures using actual hour
  intervals, preserving manual changes and explicit preview times. Backend904 /
  HTTP15 / restored UI pass;36 retained dates unchanged, no migration.
  [Evidence](docs/30-quality/TWO_MATCH_PROGRAM_2026-10-19.md).

- **Windows root quality portability (2026-10-19):** root resolves pinned local
  npm12.2.0 through Node, with tested nonzero continuation and no global install.
  Git LF/EOL-auto policy preserves existing checkouts; isolated Prisma client and
  corresponding quality type/build avoid active API DLL locks. Socket fixtures
  explicitly cover both session modes; repeated history-test queries reduced.
  Full root run: 16/17 stages pass, including backend904/frontend498/Sites4 and
  tooling6. CDSK alone fails because the real external0.1.0 validator is absent;
  root correctly returns1. [Evidence](docs/30-quality/QUALITY_GATE_WINDOWS_2026-10-19.md).

- **Exercise library UI/UX (2026-10-19):** compact Matches/training register,
  visible debounced search, advanced-filter Sheet and separate preview/detail.
  Full descriptions use native disclosure; mobile has44px actions/16px fields,
  fixed dialog actions and Uygulama/Saha tabs. Preview uses response-resolved age
  and mounts the readonly board only on Saha. Actual1440/1024/390/320 QA and29
  affected tests pass. No API/schema/new ADR or retained write.
  [Evidence](docs/30-quality/LIBRARY_UX_2026-10-19.md).
  Final58/58 affected checks and type/lint/format/build/Sites4 pass. Full run497/498
  plus corrected29-test board-file retry covers498 cases. Initial167-file link
  scan passed; the then-pending ADR-0043 report links resolve in the later
  exercise-detail follow-up's173-file check.

- **Fixture-aware program updates (2026-10-19):** explicit user request fulfilled
  under ADR-0042 / CR-030 / REQ-029 / BL-064. Match-date save synchronously reconciles
  enrolled SENIOR old/new/adjacent weeks. Complete fingerprints protect manual edits,
  deletions/exclusions/history/completion/attendance; conflict/congestion rolls back
  match and program. Existing-design date dialog keeps analysis/board state separate.
  No schema/new endpoint/background service. Fresh backup/restore; retained 41-week
  enrollment owns 631 original events/protects 2 edits, preserving all 24415 prior rows
  across 44 tables. Replay changes none of 24456 rows. Backend 896 / HTTP 13 / frontend
  495, final affected 27/12 / operator 1 / Sites 4, builds/type/lint/format and responsive
  browser checks pass. [Evidence](docs/30-quality/FIXTURE_PROGRAM_SYNC_2026-10-19.md).

- **Local session persistence (2026-10-19):** user requested the reload logout
  fix. Enabled existing ADR-0018 backend/frontend flags in ignored local configs,
  exact UI3132 origin, existing API4000/retained DB unchanged. Actual full reloads
  on dashboard/library/training detail and a fresh tab preserve login. Backend18,
  frontend20 and dedicated PostgreSQL HTTP9 pass. No source/schema/dependency or
  production-policy change; one normal login establishes the refresh cookie.
  [Evidence](docs/30-quality/SESSION_PERSISTENCE_LOCAL_2026-10-19.md).

- **Training list UI/UX (2026-10-19):** compact Matches-style register and
  full purpose disclosure replace the photographic catalogue/cards. Existing
  day reader backs date/Today/reset; both pagers retain cursor/scope guards.
  Mobile uses 44px actions, 16px date input, short statistics strip and a scoped
  minimum-width fix. Actual 1440/1024/390/320 QA passes; 491 frontend tests,
  final 33 focused tests, type/lint/format/build and Sites 4 pass. No retained write
  or API/schema/new ADR. [Evidence](docs/30-quality/TRAININGS_LIST_UX_2026-10-19.md).

- **Ready-drill tablet/mobile acceptance (2026-10-19):** actual 1024×900/390×844
  library filters, preview/Escape, paginated existing-plan selection and explicit
  attachment pass. Existing A Takım plan on 19 May2027 16:00 now45→71→103 minutes,
  4→6 entries (senior-12 technical26, senior-13 tactical32). Original phases,
  source versions, linked day and earlier desktop121-minute plan preserved.
  Scrollable mobile filter Sheet,44px controls/16px fields, mobile overflow fix
  and full selected-plan summary added. Focused19/19, typecheck, lint/format pass;
  root Windows npm gate remains BL-061.
  [Evidence](docs/30-quality/READY_DRILL_RESPONSIVE_BROWSER_2026-10-19.md).

- **Whole-season program (2026-10-19):** subsequent explicit request fulfilled for
  Spor Manage, 14 August 2026–23 May 2027, 41 weeks / 410 team-week slots. Existing
  October week and 36 sample matches preserved; added 2009 sessions / 8036 phases,
  504 meetings and 1026 rest entries. Boundary weeks clipped; fixture-free breaks
  use development/rest, academy retains after-school hours. Guarded existing-service
  operator preflights all weeks and resumes atomic weekly commits. All 1963 original
  rows across 44 tables preserved; retained replay adds zero. Backend 893 / HTTP 8 /
  operator 4, builds/type/lint/format and actual browser reads pass. No schema/API
  change. [Evidence](docs/30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

- **Training detail UI/UX (2026-10-19):** compact Matches-style heading,
  saved summary and unified flow/board/attendance panel. Numbered phases and
  full selected notes/frozen applications, optional add picker, 44px mobile
  phase navigation and explicit board open. Actual 1440/1024/390 checks pass;
  full frontend 479/479 (59 files), 47 focused tests, typecheck, scoped
  lint/format, build and Sites 4/4 pass.
  No backend/schema/ADR or retained write. Snapshot/lazy-read/draft/history and
  PLAYER boundaries remain. [Evidence](docs/30-quality/TRAINING_DETAIL_UX_2026-10-19.md).

- **Retained ready-drill browser acceptance (2026-10-19):** actual Chrome login,
  A Takım NGCS catalog (48), library → existing plan and in-plan preview/add pass.
  Two user-authorized attachments remain in “İlk kontrol, pas ve destek açıları”,
  20 October 10:00: warm-up 20 + technical 26, total 75→95→121 min, entries 4→6.
  Linked day 121 and Tuesday 166 verified; old four rows/boards/notes, both source
  versions and other 50 plans unchanged. Duplicate selection excluded. Concurrent
  development reload/import interruption recovered with normal login; final
  updated plan/instructions/board reopen successfully. No runtime change here.
  [Evidence](docs/30-quality/READY_DRILL_RETAINED_BROWSER_2026-10-19.md).

- **Tactical UI/UX (2026-10-19):** compact Matches-style catalogue and shared
  editor, native scoped register and optional view disclosure. Mobile prioritizes
  pitch/playback/scenes before properties, with 44px actions and 16px fields.
  Corrected focus-mode overlap/layering. Full frontend 478/478, final affected
  44/44, typecheck, scoped lint/format, build and Sites 4/4 pass. Actual desktop,
  tablet/mobile QA passes. No API/schema/flag or saved-data change in this slice.
  [Evidence](docs/30-quality/TACTICS_UX_2026-10-19.md).

- **Weekly club program (2026-10-19):** full proposed plan explicitly approved.
  Week unifies scoped chronological training/match/meeting/rest reads and manual
  event management; preview supports exact-age profiles, phase notes, exclusion
  and time edits. One Serializable all-team apply, stale/overlap guards and durable
  actor-bound request/season-week replay verified. Approved retained19–25 October:
  51 physical plans/204 phases,13 meetings,26 rest entries across10 teams; existing
  36 matches,1 account,30 staff people and0 grants unchanged. Only weekly audit
  enum migration deployed after backup/restore; retained14/current, diff empty.
  Backend890/frontend478/Sites4, final focused21/14 and dedicated HTTP7 pass.
  Actual browser create/reload/edit/age switching and1440/1024/390 QA passed.
  Canonical3132 week left open. ADR-0040/CR-029/REQ-028/BL-063 implemented;
  Windows root quality/CDSK tooling remains BL-061.
  [Evidence](docs/30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).

- **Ready drill local publication (2026-10-19):** separate user approval covers local
  migration, 120-item import and publication. Exact snapshot migration deployed;
  this migration brought Windows DB to 13; subsequent separate weekly work
  brought it to 14. All 120 starter versions are PUBLISHED.
  Backup/restore and preservation across 38 business tables verified; import
  replay creates zero duplicates. Publication and Fatih Çelebigil's named review
  approval are recorded. The user explicitly accepted ADR-0041's one-package
  local same-account exception. A maintenance-only atomic operation recorded
  360 truthful transition audits; runtime API guards are unchanged. New backup/
  restore, 43-table preservation and 10 maintenance tests pass; replay writes zero.
  Later weekly additions were preserved; all 1,020 pre-publication rows still
  match outside approved publication fields. Tactical V2 flag/pilot preserved.
  [Evidence](docs/30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

- **Controlled tactical activation (2026-10-19):** user requested local V2
  activation. Backup/restore rehearsal, 119 backend / 64 frontend and 18
  disposable PostgreSQL HTTP tests pass. Windows API 4000 / UI 3132 uses the
  ignored backend `.env` V2 flag; default example remains false. One clearly
  labelled synthetic CLUB pilot was explicitly saved V1 then V2; existing
  matches/club/groups remain identical. No migration or bulk conversion.
  The flag covers all otherwise-authorized local tactical writes, not an
  allowlist. Production, sporting/touch-device pilot and offline remain open.
  [Evidence](docs/30-quality/TACTICAL_LOCAL_ROLLOUT_2026-10-19.md).

- **Ready drill planning (2026-10-19):** ADR-0039 / CR-028 / REQ-027 / BL-062
  implements shared filters/preview, existing/new plan selection and frozen
  exact-age content/board/duration with transactional authorization/version checks.
  First starter release requires all 120 independent approvals and is atomic.
  Dedicated clean/legacy migration parity, importer replay, HTTP 9/9, actual
  login/browser flow and 869 backend / 4 Sites tests pass. Frontend final full
  run: 473 pass / one existing undo timeout; isolated rerun passes.
  Windows root quality/CDSK limits remain BL-061. Retained migration/import was
  subsequently approved and completed (see latest entry), followed by explicitly
  excepted local publication under ADR-0041.
  [Evidence](docs/30-quality/READY_DRILL_PLANNING_2026-10-19.md).

- **Match detail UI/UX (2026-10-19):** extended the selected Matches style
  with a compact heading, saved-data strip and readable analysis/tactics panel;
  mobile fields, tabs and save controls verified. Focused 27 tests, scoped
  lint/format, production build and 4 Sites tests pass. Full typecheck remains
  blocked by the separate add-drill dialog's `TrainingPlanCatalogPage.total`
  error. No API/data/schema/permission change in this slice.
  [Evidence](docs/30-quality/MATCH_DETAIL_UX_2026-10-19.md).

- **Guided club setup and branding (2026-10-19):** user explicitly approved
  the five-step SYSTEM_ADMIN wizard, optional staff and separate invitations.
  Logo upload, primary/secondary colors and readable derived theme implemented.
  Single atomic final POST, actor-bound durable replay/status and canonical/legacy
  parity verified. Dedicated HTTP 6/6, DTO 16/16, frontend wizard/branding 17/17;
  final full frontend 465/465. Browser create/reload/theme and 1440/1024/390 QA
  passed. Only the exact branding migration was separately approved/applied to
  retained local DB after private backup/restore rehearsal (12 applied migrations).
  Existing business data matches restored snapshot. ADR-0037/0038 Accepted,
  CR-027/REQ-026/BL-060 implemented. Root Windows quality/CDSK limits: BL-061.
  Final frontend global typecheck is blocked by the concurrent add-drill dialog
  catalog-total field; production build and 4 Sites tests pass.
  [Evidence](docs/30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

- **Matches UI/UX (2026-10-19):** third generated concept explicitly selected
  and implemented as a compact fixture table with responsive stacked rows,
  inline exact-day filter/reset and full note disclosure. Real scoped reads,
  totals, cursor/retry and detail contracts preserved. Focused 14 tests,
  typecheck, scoped lint/format, build and 4 Sites tests pass. Full frontend run
  has one tactical undo timeout (464 passed); isolated rerun passes. Desktop,
  tablet and mobile browser QA passed. No API/schema/data/dependency change.
  [Evidence](docs/30-quality/MATCHES_UX_EXPLORATION_2026-10-19.md).

- **Spor Manage local setup (2026-10-19):** explicitly approved retained local
  fixture completed: one club/2026-2027 ClubSeason, A Takım plus U8–U16,
  30 example staff assignments and 36 example A Takım matches. TFF-sourced
  season bounds and opponent names are distinguished from synthetic schedules
  and staff. Dedicated PostgreSQL verification and browser flow passed; retained
  replay creates nothing. No player seed, new account, grant or schema change.
  [Evidence](docs/30-quality/SPOR_MANAGE_LOCAL_SETUP_2026-10-19.md).
  [ADR-0037](docs/50-decisions/ADR-0037-guided-club-setup.md) / CR-027 / BL-060
  now document the separately approved and implemented product wizard (see latest entry).

- **Windows local startup (2026-10-19):** fetched and checked out
  `codex/mvp-stabilization` at `33442ff`. With explicit user approval, created
  a separate empty PostgreSQL 16 database on this computer and applied all 11
  tracked migrations. Status is current and schema diff is empty. A separately
  approved first SYSTEM_ADMIN is ACTIVE; browser login reaches the dashboard.
  Frontend `http://localhost:3132`, API `http://localhost:4000` both return 200.
  This computer has no previous club/season/team records; the other computer's
  retained data is not part of Git. Session and tactical V2 flags remain off.
  See the [local runbook](docs/40-operations/RUNBOOK.md).

- **Repository publication preparation (2026-10-19):** user requested commit
  and push of accumulated approved work on `codex/mvp-stabilization`.
  `main` is not the publication target; no force push, data rollout or V2 flag
  activation. Temporary Playwright CLI recordings are excluded from Git.
  Verify commit/remote outcome in Git; this entry is not a deployment claim.

- **Previous — combined tactical acceptance (BL-058e.4):** repository V1/V2
  drill/copy → phase snapshot → match and JSON/static export acceptance passed.
  Disposable HTTP 18/18, migrations current/diff empty; actual route/API/PG
  browser flow preserves full scenes and source isolation. Three viewports and
  bounded 12-scene/1,500-element/50-undo observation passed. Root quality:
  843 backend / 446 frontend / 4 Sites. Acceptance tests/context only this slice;
  no retained data or flag change. BL-058/REQ-025 implemented in repository;
  separately authorized retained rollout pending, broader pro-club pilot TBD.
  [Evidence](docs/30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).

- **Previous — training integration (BL-058e.3):** training detail loads only the
  explicitly opened phase through the V1/V2 document adapter. Whole-scene
  snapshots retain source authorization, isolation and token conflicts; failed
  writes preserve drafts without automatic retry. First snapshot saves preserve
  undo history. Mobile hero overflow fixed. Disposable HTTP 16/16; migration
  status current and schema diff empty. No retained data or V2 flag change.
  Root quality: 843 backend / 442 frontend / 4 Sites tests; all gates passed.
  Next e.4 combined integration/export acceptance; BL-058/REQ-025 In progress.
  [Evidence](docs/30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).

- **Previous — drill integration (BL-058e.2):** tactics new/detail now reads
  board-free metadata and whole V1/V2 documents. Metadata and board updates
  are atomic; club copies recheck source visibility/token and derive ownership
  on the server. Drafts survive failed writes; readonly roles and mobile layout
  verified. Disposable HTTP 14/14; migrations current and schema diff empty.
  No retained data or V2 flag change. Next e.3 training snapshot, e.4 combined
  acceptance; BL-058/REQ-025 remain In progress.
  Root quality: 840 backend / 429 frontend / 4 Sites tests; all gates passed.
  [Evidence](docs/30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).

- **Previous — match integration (BL-058e.1):** match detail now uses authorized
  board-free metadata and lazy token-bound document reads/writes. V1/V2 editor,
  playback, conflict draft retention and guarded tab transitions are connected.
  PLAYER is readonly; session/scope changes release the prior resource.
  Disposable PostgreSQL HTTP suite passes 9/9; synthetic real-route browser QA
  covers desktop/tablet/mobile. Retained V2 writes remain off, no data rollout.
  Next BL-058e.2 drill metadata/create/copy and e.3 plan snapshot integration;
  full BL-058/REQ-025 remains In progress.
  Quality: 824 backend / 416 frontend / 4 Sites tests; all gates passed.
  [Evidence](docs/30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).

- **Previous — playback (BL-058d):** opt-in scene editor now has explicit play,
  pause, restart, seek, 0.5/1/2 speed, loop and reduced-motion support. Preview
  locks edits/save and never becomes a persisted scene. Visibility, modal,
  route/scope and unmount interruptions stop playback without auto-resume.
  Root quality passed: 821 backend / 405 frontend / 4 Sites tests. Synthetic
  real-Konva QA passed at 1672/1024/390 widths; retained data untouched.
  Existing routes remain V1 and V2 writes remain off. Next BL-058e route/token,
  snapshot/match/copy/export integration and separately authorized rollout.
  [Evidence](docs/30-quality/TACTICAL_PLAYBACK_2026-09-26.md).

- **Previous — scene editor (BL-058c):** opt-in scene strip, full-document
  undo/dirty/explicit Save, strict scene operations and token-aware client
  adapters implemented. 36 focused tests and synthetic three-viewport canvas
  QA passed. Existing routes remain V1; retained data and V2 write flag unchanged.
  Next BL-058d playback, then BL-058e real route integration/rollout gate.
  Final root quality: 821 backend / 390 frontend / 4 Sites tests, all gates pass.
  [Evidence](docs/30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).

- **Latest — animation persistence (BL-058b):** additive drill/plan/match
  document APIs, Serializable token writes, source/snapshot provenance,
  legacy downgrade/read guards and route-scoped HTTP limits implemented.
  Disposable PostgreSQL HTTP gate: 8/8. V2 writes stay default-off; no retained
  data, schema, dependency or UI change. Next BL-058c scene editor.
  Final root quality passed: 821 backend / 369 frontend / 4 Sites tests.
  [Evidence](docs/30-quality/TACTICAL_V2_API_2026-09-19.md).

- **Previous — animation foundation:** ADR-0036 A–D explicitly Accepted;
  CR-026 approved, REQ-025/BL-058 In progress. BL-058a pure V1/V2 validator and
  absolute-time sampler implemented; targeted 63 backend / 63 frontend tests.
  Root quality passes: 788 backend, 369 frontend and 4 Sites tests.
  Legacy V1 HTTP/editor paths unchanged; no V2 writes/UI yet. Next BL-058b
  token/CAS/legacy protection. [Evidence](docs/30-quality/TACTICAL_V2_FOUNDATION_2026-09-19.md).

- **Tactical increment 3:** roster names can fill an existing player/goalkeeper
  position after confirmation. Geometry/team/type remain; old numbers clear.
  One-step undo and explicit Save preserved; no identity link or DB change.
  [Evidence](docs/30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).

- **Tactical increment 2:** current-roster name snapshots and multi-selection/
  unit move/copy/delete implemented on unchanged V1. Live A Team read and
  isolated canvas drag/undo verified. No Person link or auto-sync is claimed.
  [Evidence](docs/30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).

- **Latest tactical studio slice (2026-09-19):** ADR-0035 introduces the
  pitch-first 2D editor, shirt/disc view, shared canvas/SVG equipment art,
  zoom/pan/fit and focus/inspector controls. V1/API/database contracts remain
  unchanged. The compact route removes the photographic editor hero and keeps
  metadata collapsible. See [verification](docs/30-quality/TACTICAL_STUDIO_2026-09-19.md).
  Next: real roster identities and tactical group tools, followed by animation,
  offline match-day and optional 3D in separately specified slices. Do not
  interpret this delivery as completion of the whole professional-board roadmap.

- **Latest professional drill-library gate (2026-09-09):** ADR-0032–0034 add
  immutable DrillVersion, age variants, source/license/checksum evidence and an
  author → independent reviewer → SystemAdmin publication workflow. The
  repository contains 120 original Turkish DRAFT exercises with 24 primary
  items per U12/U14/U16/U18/SENIOR and minimum 4/8/8/4 phase distribution.
  Catalog/detail/manage UI and strict filtered APIs are implemented. Clean
  PostgreSQL 16 migration/status/diff, five-record legacy backfill and
  idempotent disposable import (`120 created`, then `120 skipped`) pass. The
  named football expert is `TBD`; therefore no new item is claimed as verified
  or published. The two additive migrations and, after separate explicit user
  approval, the 120-item DRAFT package were applied to retained
  `ngcs_local_session_dev`. Replay skipped all 120 existing records; postconditions
  are 120 DRAFT, 5 unchanged PUBLISHED legacy versions, 120 original-source rows
  and 120 draft-created audit events. Production was not changed. Root quality
  passes with 725 backend, 286 frontend and 4 Sites tests.
  Tracking:
  CR-024, REQ-023, BL-056; [evidence](docs/30-quality/PROFESSIONAL_DRILL_LIBRARY_2026-09-09.md).
  **Next:** appoint the expert and begin the first 40-item sporting-review wave;
  publication remains blocked until independent approval.
  Follow-up console QA confirmed that two SystemAdmin self-approval attempts were
  correctly rejected by ADR-0034 and that no active independent reviewer account
  exists locally. The UI now disables self-review with an explicit explanation;
  root hydration fallback and favicon remove the reported loading/404 noise.
  Targeted 9-test, typecheck, lint and clean-browser 0-warning/0-error gates pass.

- **Latest Player 360 / player-notes gate (2026-09-09):** Player 360 now uses a
  compact localized identity, real Activity, journey-only date scope and
  URL-backed Overview/Notes/Activity/Journey views. Account-independent notes
  are Person-linked, team-scoped, revisioned, conflict-safe and archived rather
  than deleted; controlled same-club team sharing and body-free audit metadata
  enforce the accepted privacy boundary. Two additive migrations passed clean
  disposable PostgreSQL 16 verification and were then applied to retained local
  `ngcs_local_session_dev` without changing existing business counts. Disposable
  HTTP E2E, authenticated Chrome desktop QA and root quality pass with 720
  backend, 285 frontend and 4 Sites tests. Responsive breakpoints and component
  regressions pass; no new exact-size responsive capture is claimed. Tracking:
  ADR-0031, CR-023, REQ-022, BL-055. No production, credential reset, retained
  note mutation, commit or push. **Next:** product gap audit or the next
  explicitly selected feature.

- **Latest A Team roster-center gate (2026-09-09):**
  `/app/teams/first-team` now opens the active A Team roster directly and aligns
  the workspace team without dropping the nested route. It presents real squad
  summaries, URL-backed search/position/name sorting, Player 360 and four scoped
  operation links. The paged player API adds strict filters, versioned
  `displayName + id` cursors and self-scope-safe totals while preserving legacy
  no-sort ID cursors. Backend 712, frontend 284 and disposable PostgreSQL E2E 2/2
  pass. No schema/migration/dependency/retained-data/production, commit or push.
  Tracking: ADR-0030, CR-022, REQ-021, BL-054.

- **Latest team-navigation/name gate (2026-09-09):** A Takım and Altyapı are
  separate sidebar/mobile-Sheet destinations at `/app/teams/first-team` and
  `/app/teams/academy`; the directory has no in-page tabs. `/app/teams` remains
  a legacy-query-aware compatibility redirect. The retained five local squads
  now expose 90/90 unique deterministic synthetic Turkish names with zero
  Demo/E2E placeholders; account-linked Person/User display names match while
  e-mail/password/role/session data is unchanged. Second fixture run: zero
  creates and zero renames. Authenticated Chrome and root quality pass with 706
  backend, 279 frontend and 4 Sites tests plus 121 Markdown links/CDSK/whitespace.
  No API/schema/migration/dependency/production, commit or push. Tracking:
  ADR-0029, CR-021, REQ-020, BL-053.

- **Latest local squad gate (2026-09-09):** The retained local club/season has
  A Takım plus U12/U14/U16/U18, each linked to the selected TeamSeason and holding
  18 active players. Existing U18 identity/history and its two players were
  preserved; 88 synthetic Persons were added without user accounts,
  e-mail, password or invented birth dates. The guarded Serializable fixture is
  idempotent (second run: zero creates). `/app/squad` now consumes the canonical
  account-independent roster instead of legacy GroupMember. Authenticated Chrome
  QA confirms the A Takım card, four academy cards and the 18-player U12 roster.
  Root quality passes with 706 backend, 276 frontend and 4 Sites tests, plus
  Markdown/CDSK/whitespace gates. No production, reset, deletion, archive,
  commit or push. Tracking: BL-052.

- **Latest team-management gate (2026-09-08):** `/app/teams` now separates the
  protected A Takım from the academy directory. SYSTEM_ADMIN can create the one
  active first team per club; system/same-club admins can edit it, while archive
  is forbidden. Admins can create academy teams only for a concrete ClubSeason,
  edit, archive without deleting history and restore the same identity; coach and
  player remain read-only. ADR-0028 adds atomic legacy/canonical projection,
  configurable age labels, archive fields, partial uniqueness and audit actions.
  Backend 706, frontend 276, disposable PostgreSQL lifecycle E2E 3/3,
  migration/status/diff and clone backfill hashes pass. Live Chrome QA opened
  controls without submitting retained-team mutations. No production, seed/reset,
  commit or push. `BL-050` was already assigned, so this delivery is `BL-051`.
  Next: product gap audit or separately approved department-specific team work.

- **Latest local credential operation (2026-09-08):** With explicit user
  approval, the retained `ngcs_local_session_dev` database received its first
  platform `SYSTEM_ADMIN` through the guarded bootstrap and one same-club
  `CLUB_ADMIN` through authenticated invitation/acceptance. Both accounts are
  ACTIVE and real login succeeded. Verification refresh sessions were revoked;
  both accounts end with zero open sessions and token-free audit evidence.
  Passwords were returned only in the conversation and were not written to the
  repository. No role promotion of an existing account, migration, seed/reset,
  production, commit or push occurred.

- **Latest access-management gate (2026-09-08):** Admin-only account directory
  and `/app/settings/users` now expose the existing invitation, role/club,
  suspend/reactivate, password-reset and session-revoke lifecycle. System admin
  has platform/selected-club scope; club admin is server-forced to its own club;
  coach/player are denied. Responses use strict bounded queries and minimum
  projection. The existing technical role matrix and sporting capabilities are
  visible, but capability grants remain read-only. Backend 676, frontend 273,
  Sites 4, disposable PostgreSQL HTTP E2E 21/21, production build, CDSK/docs and
  1440/1024/390 browser gates pass. No schema/dependency/production or retained-
  account change. Next: separate product gap audit or separately approved
  capability-grant administration.

- **Latest lifecycle gate (2026-09-08):** Training catalogue/detail now expose
  role-safe edit and explicit permanent delete. Edit is title/date/purpose only;
  linked DayPlan projection and permanent deletion of DayPlan, Attendance,
  PlanDrill/snapshot and TrainingPlan are Serializable and fail atomically.
  Pointer/disabled cursors, focus return, five-metric responsive layout, auto-fit
  cards and long-copy wrapping are repaired; unsupported catalogue board status
  is removed. Targeted unit/frontend suites, disposable PostgreSQL 16 HTTP E2E
  and root quality (663 backend, 268 frontend, 4 Sites) pass. Combined visual QA
  has no actionable P0/P1/P2. No schema/dependency/production or retained-data
  change. Next: separate product gap audit.

- **Latest visual gate (2026-09-08):** Settings now uses the approved white
  shadcn system with the shared photographic hero, four truthful account/scope
  metrics, compact profile/context cards and the existing session security and
  logout behavior. Exact-size 1672×941, 1024×900 and 390×844 captures are
  retained; [design QA](design-qa.md) has no actionable P0/P1/P2 and the mobile
  document matches its viewport. Root quality passes with 657 backend, 264
  frontend and 4 Sites tests. No API/schema/data change. All approved BL-048
  page slices are visually complete; next is the separate product gap audit.

- **Latest visual gate (2026-09-08):** Players, Player 360, Squad and Attendance
  now use the approved white shadcn system with photographic heroes, verified
  scope metrics, compact player/plan cards and the existing dated assignment and
  attendance controls. Twelve exact-size 1536×1024, 1024×900 and 390×844
  captures are retained; [design QA](design-qa.md) has no actionable P0/P1/P2.
  Server search, cursor totals/history, role/tenant visibility, Player 360
  evidence boundaries and uncertain attendance writes remain unchanged. Root
  quality passes with 657 backend, 264 frontend and 4 Sites tests. No
  API/schema/data change. Next: Settings.

- **Latest visual gate (2026-09-08):** Match detail now uses the approved white
  visual system with the shared photographic hero, five verified match facts,
  compact analysis/facts composition and the existing tactical-board editor.
  Six exact-size 1672×941, 1024×900 and 390×844 captures are retained;
  [design QA](design-qa.md) has no actionable P0/P1/P2. The independent
  authorized read, explicit analysis save, board state, import/export and dirty
  behavior remain intact. Root quality passes with 657 backend, 264 frontend
  and 4 Sites tests. No API/schema/data change. Next: Players, Player 360,
  Squad and Attendance.

- **Latest visual gate (2026-09-08):** Egzersiz Kütüphanesi, Taktik Tahtası ve
  yeni tahta editörü onaylı beyaz görsel sisteme taşındı. Fotoğraflı hero,
  doğrulanmış gerçek metrikler, kategori kataloğu, tahta araçları özeti ve kompakt
  editör chrome'u için dokuz exact-size 1672×941, 1024×900 ve 390×844 kanıtı
  saklanır; [design QA](design-qa.md) içinde açık P0/P1/P2 yoktur. Kategori/kind
  sayfalaması, global/kulüp görünürlüğü, import/export, undo/redo, dirty-state ve
  yetki davranışları korundu. Root quality 657 backend, 263 frontend ve 4 Sites
  testiyle geçer. API/schema/data değişmedi. Next: Match detail.

- **Latest visual gate (2026-09-08):** Trainings and training detail now use the
  approved white system with photographic heroes, five verified catalogue
  metrics, compact editor summary/tabs and responsive plan/phase cards. Six exact
  1672×941, 1024×900 and 390×844 captures are retained; [design QA](design-qa.md)
  passes without actionable P0/P1/P2. Cursor/retry/stale behavior, plan creation,
  on-demand board reads, dirty transitions, uncertain-save reconciliation,
  attendance and permissions remain intact. Root quality passes with 657 backend,
  260 frontend and 4 Sites tests. No API/schema/data change. Next: Library and
  Tactical Board.

- **Latest visual gate (2026-09-08):** Week now uses the approved white visual
  system with a photographic training-ground hero, compact date controls and a
  responsive seven-day board. Exact 1672×941, 1024×900 and 390×844 evidence is
  retained; [design QA](design-qa.md) passes with no actionable P0/P1/P2.
  Existing local Monday–Sunday boundaries, seven independent daily plan/match
  reads, full totals, cursor histories, retry and stale-response behavior remain
  intact. Root quality passes with 657 backend, 258 frontend and 4 Sites tests.
  No API/schema/data change. Next: Trainings and training detail.

- **Latest visual gate (2026-09-08):** Matches now matches the approved reference
  with the shared photographic hero, local-day date filter and date-grouped real
  catalogue rows. Exact 1672×941, 1024×900 and 390×844 evidence is retained;
  [design QA](design-qa.md) passes with no actionable P0/P1/P2. Cursor history,
  full totals, stale-scope rejection, retries, all-seasons and detail behavior
  remain intact. Root quality passes with 657 backend, 257 frontend and 4 Sites
  tests. No API/schema/data change. Dashboard, Teams and Matches reference gates
  are closed; next is Week.

- **Latest visual gate (2026-09-08):** Teams now matches the approved reference
  through the shared white shell, photographic training-ground hero, real-data
  team card and accessible compact table. Exact 1536×1024, 1024×900 and 390×844
  captures are retained; [design QA](design-qa.md) passes without actionable
  P0/P1/P2. Search, cursors, stale-response rejection, work-team selection and
  detail links remain intact. Root quality passes with 657 backend, 256 frontend
  and 4 Sites tests. No API, schema or business-data change. The next approved
  visual slice is Matches.

- **Latest visual gate (2026-09-08):** Dashboard now has retained exact-size
  browser evidence at 1672×941, 1024×900 and 390×844 plus the open mobile Sheet.
  Source and implementation were reopened together; no actionable P0/P1/P2
  remains and [design QA](design-qa.md) passes. The Dashboard gate is closed.
  This is the completed predecessor to the Teams gate above.

- **Historical verification follow-up (2026-09-08):** Stopped local services were
  restarted on frontend 3132/backend 4000 against the retained database with
  documented persistent-session flags. Existing coach login and real Dashboard
  reads work; desktop/tablet/mobile and Sheet were rechecked. No code, seed/reset
  or migration change. The former screenshot-export gate was later closed with
  the explicitly approved local capture fallback; see [QA evidence](design-qa.md).

- **North star:** Futbol sezonu, antrenman ve taktik çalışma akışlarını tek bir
  izlenebilir dijital çalışma alanında toplamak.
- **Current mission:** BL-048 sayfa bazlı referans geçişi, BL-049 antrenman yaşam
  döngüsü, BL-050 hesap/yetki yönetimi, BL-051 takım yaşam döngüsü ve BL-052 yerel
  A Takım/U12/U14/U16/U18 kadroları kapandı. Sportif capability grant düzenleme
  ayrıca onaylanana kadar salt okunur kalır. Sıradaki çalışma ayrı ürün gap audit'i
  veya ayrıca onaylanmış takım
  departman akışıdır. Mevcut REST/Prisma/yetki,
  tarih, cursor ve gerçek-veri sınırları korunacak, desteklenmeyen içerik
  üretilmeyecek. Görsel kabul [design-qa.md](design-qa.md) üzerinden izlenir.
  Aşağıdaki BL-047 faz sırası önceki teslim bağlamıdır.
  Kullanıcının UI migration brief'i doğrultusunda BL-047
  sekiz aşamalı shadcn yakınsamasını yürütmek: faz 1 token temeli ve mevcut
  primitive yüzey bağlantıları, faz 2 etkileşim kapısı ve faz 3 dashboard/settings
  layout pilotu geçti. Mobil kullanıcı menüsü görünür ve adlandırılmıştır.
  Faz 4A giriş/davet/parola yenileme formları ortak Input/Button/FormField ve
  FormError düzenine geçti. Faz 4B.1 antrenman oluşturma diyalogu aynı alan/hata
  düzenine geçti. Faz 4B.2 sportif atama diyalogu ortak FormField/NativeSelect
  düzeniyle doğrulandı; faz 4 hedefleri tamamlandı. Faz 5A Oyuncular/Takımlar
  ortak boş/yükleniyor/hata ve sayfalama pilotu tamamlandı; atama geçmişi de
  aynı sayfalama sunumunu kullanır. Faz 5B çalışma kapsamı ve atama seçenekleri
  ortak OptionPagination kullanır; farklı cursor/başarı politikaları korunur.
  Faz 5C antrenman, maç, kütüphane ve taktik kataloglarını ortak FootballCard
  sunumuna taşır; linkler, alan anlamları, toplamlar ve izinler korunur. Faz 5
  tamamlandı. Faz 6 Hafta, Trainings/training detail, Library/Tactical Board/
  editor ve Match detail modüllerinde geçti; geniş sayfa/shell yayılımı Players,
  Player 360, Squad ve Attendance ile sürer.
  Native control/asChild tipografi ortak PageActions içinde hizalandı; global
  font reset yapılmadı. API/iş kuralları
  değişmez. Önceki teslim bağlamı: Onaylı Phase 2 P0.1 sportif organizasyon ve oyuncu yolculuğu
  temelinde P0.1a/b repository ve kontrollü yerel teslimi korumak; BL-043
  tamamlanan sayfalı okumaların pilot kapasite ve sorgu bütçelerini doğrulamak.
  BL-043i sentetik beşli okuma ölçümü üç süreçte tekrarlandı: 30/300 oyuncuda
  36 sorgu ve yaklaşık 16 KB/grup. Bu production kapasitesi değildir. Editor
  2→50 sentetik fazda 34→853 KB büyüdü. BL-046/CR-017 ve ADR-0025 Option A
  onaylandı; a backend hafif faz metadata + tekil effective board okumaları
  doğrulandı. Kaynak yetkisi/snapshot önceliği korunur, yeni limit yoktur.
  BL-046b frontend hafif metadata + açık tekil faz açmaya geçti; dirty
  save/discard/cancel ve ilk kayıtta undo korunur. BL-046c üç eşleşen 2/50-faz
  ölçümü ve son regresyonla geçti; BL-046/CR-017 uygulaması kapandı. 50 fazda
  JSON toplamı 996.545 → 24.040 byte; iki yeni istek toplam 12, eski tek istek
  6 SQL olayıdır. BL-043j karma 5 GET/2 POST ve ayrı SELECT row-work ölçümü
  üç temiz başlangıçta geçti: 30/300 oyuncu ve 150/1500 seçili planda 47 SQL
  olayı; bazı tarama işleri hacimle büyür. Production SLO değildir. BL-043
  pilot kabulü owner/hacim/ortam/bütçe TBD olarak açık. BL-045 “Tüm sezonlar”
  etiketi yan menü/üst çubuk/Hafta/Genel Bakış/Ayarlar'da düzeltildi; gerçek
  eksik sezon TBD kalır. BL-044 başta olmak üzere kalan karar girdilerini
  onaya hazır plana toplamak hâlâ açıktır; yeni politika/production etkinleştirilmez.
  Antrenman/Genel Bakış/Hafta/Yoklama bağımsız sayfa/özet okumalarına geçti;
  provider'ın tam plan dizisi kaldırıldı.
  BL-043f.1 Egzersiz Kütüphanesi bağımsız sayfalı kategori okumalarına geçti;
  BL-043f.2 Genel Bakış tam egzersiz toplamını bağımsız minimal okumadan alıyor.
  BL-043f.3 Taktik Tahtası sunucu kind filtresiyle bağımsız sayfalara geçti.
  BL-043f.4 antrenman detay seçeneklerini sayfaladı; ortak tam egzersiz
  fetch/state kaldırıldı. Tekli ekleme mevcut POST ile snapshot'ları korur.
  BL-043g.1 sayfalı/minimal maç okuma API'si hazır; BL-043g.2 Maçlar bağımsız
  25'lik sayfalara geçti. BL-043g.3 Genel Bakış ilk üç kronolojik maçı limit=3
  ve tam toplamla okur. BL-043g.4 Hafta yerel günlük sınırlarla bağımsız
  25'lik maç sayfaları/tam toplam kullanır. BL-043g.5 maç detayı bağımsız
  yetkili tekil okuma, shell sayacı limit=1/tam total kullanır. Provider ortak
  matches dizisi kaldırıldı; legacy metadata çağrısı maç yüklemez.
  BL-043h.1 Kadro bağımsız 25'lik üye sayfalarını, Genel Bakış oyuncu sayacı
  limit=1/tam toplamı kullanır. BL-043h.2 antrenman yoklamasını bağımsız sayfa/
  tam toplama geçirir; editor katılım/grup üyelerini indirmez. Son shared üyeler
  dizisi ve tam fetch kaldırıldı. Eski API'ler ve katılım yazma yetkileri korunur.
  BL-043a/b/c/d oyuncu, takım/workspace, tarihli kadro/atama geçmişi, seçili legacy
  metadata ve diyalog seçenekleri tamamlandı. Production rollout ayrı kapıda bekler.
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

- **Phase:** M5 / Phase 2 P0.1a/b repository teslimi; M3.2 stabilizasyonu korunur.
- **Version:** Ürün sürümü `TBD`.
- **Active milestone:** M5 repository ve yerel rollout tamamlandı; BL-043 ölçek
  ve M4 production session hazırlığı bekleyen işlerdir.
- **Current focus:** P0.1a Person/Team/TeamSeason, capability API, tarihsel kadro,
  Player 360 ve yolculuk kanıtı repository'de doğrulandı. BL-042 ile mevcut
  group/season/member write yollarının atomik sportif projection'ı, admin parity
  raporu ve kalıcı Club/Season/Team shell seçimi tamamlandı. BL-024/F-008 ve ADR-0019 attendance
  tekillik çalışmaları tamamlanmış olarak korunur.
- **Critical risks:** Kalıcı oturum varsayılan kapalı; production deployment, ayrı
  runtime/migrator DB rolleri, secret, readiness, backup ve observability modeli;
  sağlık/ileri analitik gizlilik politikası. Prisma advisory'si ADR-0016
  koşullarıyla geçici kabul edilmiştir; ADR-0017 runtime image bu CLI/config
  zincirini taşımaz.
- **Blocking decisions:** Exact production domain/provider, proxy/secret modeli,
  operasyon sahibi, security audit ve sağlık verisi retention politikası `TBD`.
  BL-046 Option A teslimi tamamlandı; geniş BL-043 pilot bütçeleri henüz TBD.
  Session lifetime ve refresh-record retention ADR-0018 ile, vendor-neutral
  SMTP/recovery sınırı ADR-0020 ile onaylanmıştır. Provider hesabı ve rollout `TBD`.
- **Last status update:** 2026-09-07

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
  P0.1 altıncı additive migration ile Person/account ayrımı, Team/TeamSeason,
  işlevsel rol/capability ve etkili tarihli SportingAssignment eklenir; boş ve
  legacy-verili disposable PostgreSQL backfill/diff provası geçmiştir.
- **Deployment model:** Docker Compose backend için runtime-only target, açık
  operations profili için ayrı migrator target kullanır; production registry,
  orchestrator ve credential modeli `TBD`.
- **Frontend:** React 19/React Router Framework Mode SPA, shadcn/Radix, Tailwind,
  Phosphor ve React-Konva. “Koç Operasyon Masası” kimliğiyle Genel Bakış, Hafta,
  Antrenmanlar, Egzersiz Kütüphanesi, Taktik Tahtası, Maçlar, Kadro, Yoklama ve
  Ayarlar rotaları; kulüp egzersizi, plan snapshot'ı ve maç tahtası gerçek REST
  API'ye bağlıdır. Mobil alt navigasyon beş ana görevi korur; destek rotaları tam
  menü Sheet'i içindedir.
  Phase 2 ile Takımlar, tarihe göre takım kadrosu, Oyuncular ve izin filtreli
  Player 360 rotaları aynı shadcn shell'e eklenmiştir.

## 5. Decision Snapshot

| Decision                                          | Status                                                  | ADR / source                                  |
| ------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| CDSK 0.1.0 kullanımı                              | Accepted                                                | `docs/50-decisions/ADR-0001-cdsk-adoption.md` |
| Dar MVP sınırı                                    | Accepted                                                | `docs/50-decisions/ADR-0002-mvp-boundary.md`  |
| Frontend repository topolojisi                    | Accepted; monorepo workspace reserved                   | ADR-0003                                      |
| Authentication/bootstrap güvenlik tabanı          | Accepted                                                | ADR-0004                                      |
| SYSTEM_ADMIN / CLUB_ADMIN rol ve tenant sınırı    | Accepted                                                | ADR-0005                                      |
| Prisma uzlaştırma ve rol geçiş yaklaşımı          | Accepted; clean baseline verified                       | ADR-0006                                      |
| Çekirdek kaynak yetkilendirme matrisi             | Accepted; unit/E2E verified                             | ADR-0007                                      |
| Davet tabanlı hesap yaşam döngüsü                 | Accepted; migration/unit/E2E verified                   | ADR-0008                                      |
| Koç öncelikli web frontend ve ilk akış            | Accepted; vertical slice verified                       | ADR-0009                                      |
| Production origin ve kalıcı tarayıcı oturumu      | Accepted; rollout inputs TBD; amended by ADR-0018       | ADR-0010                                      |
| Rotalı shadcn koç çalışma alanı                   | Accepted; implemented                                   | ADR-0011                                      |
| Kapsamlı egzersiz ve taktik tahta sözleşmesi      | Accepted; implemented                                   | ADR-0012                                      |
| Genişletilmiş koç navigasyonu ve shadcn shell     | Accepted; implemented                                   | ADR-0013                                      |
| Grup izolasyonu ve gerçek zamanlı olay alıcıları  | Accepted; verified                                      | ADR-0014                                      |
| Atomik recovery ve güvenli SVG serialization      | Accepted; verified                                      | ADR-0015                                      |
| Prisma CLI advisory risk disposition              | Accepted; production re-review required                 | ADR-0016                                      |
| Runtime ve migrator image ayrımı                  | Accepted; image/migration/runtime/E2E verified          | ADR-0017                                      |
| Provider-neutral kalıcı oturum                    | Accepted; opt-in implementation; default disabled       | ADR-0018                                      |
| Attendance tekilliği ve atomik upsert             | Accepted; migration/unit/E2E verified                   | ADR-0019                                      |
| Hesap e-postası ve break-glass recovery           | Accepted; vendor-neutral implementation verified        | ADR-0020                                      |
| Phase 2 futbol kulübü işletim sistemi sınırı      | Accepted                                                | ADR-0021                                      |
| Sportif organizasyon ve oyuncu yolculuğu kernel'i | Accepted; P0.1 repository implementation verified       | ADR-0022                                      |
| Capability ve sportif uygunluk veri sınırı        | Accepted; P0.1 verified                                 | ADR-0023                                      |
| Provider-neutral intelligence sınırı              | Accepted; future gate, no AI runtime                    | ADR-0024                                      |
| İsteğe bağlı plan editor tahta okumaları          | Accepted; backend/frontend/matched measurement verified | ADR-0025                                      |

## 6. AI Context

- **Purpose:** Repository gerçeklerini koruyarak küçük ve doğrulanabilir değişiklikler yapmak.
- **Constraints:** Bilinmeyeni tahmin etme; kritik kararı onaysız uygulama; secret
  veya kişisel veriyi kalıcı bağlama alma.
- **Open questions:** Başarı metrikleri, ölçülebilir erişilebilirlik hedefi,
  ADR-0010 production rollout girdileri, e-posta provider/rollout, production
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
  ADR-0019 Option 1 attendance duplicate durumunda sessiz veri silmeyen fail-fast
  migration, birleşik unique constraint, atomik upsert ve son-commit-kazanır
  davranışını kabul eder.
  ADR-0020 Option A production'da SMTP teslimi, development/test operator fallback'i,
  public completion rotaları ve mevcut SYSTEM_ADMIN için hedefli break-glass
  recovery'yi kabul eder; provider/account ve production rollout onaylanmamıştır.
  ADR-0021–0024 Phase 2 ürün sınırını, Person/Team/TeamSeason/Assignment kernel'ini,
  capability tabanlı erişimi, yalnız sportif uygunluk özetini ve gelecekteki
  provider/AI sınırını kabul eder. Klinik veri ve AI runtime onaylanmamıştır.
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

Yerel çalışma önceliklidir: `http://localhost:3132/login` ve backend `4000`;
`ngcs_local_session_dev` DB kopyası üzerinde iki session flag'i açıktır.
Yerel koç hesabı kullanıcı onayıyla sıfırlandı; API login 201 ve logout 200
doğrulandı. Browser yeni sekme/reload, hafta geçişi, kütüphane, maç analizi,
kadro ve boş plan/yoklama durumu geçti. Yeni tahta oyuncu ekle/undo çalıştı;
henüz kaydedilmemiş taslaktaki “Kaydedildi” etiketi BL-029 ile düzeltildi.
Kullanıcı yerel demo tarih/süre/içerik seçimlerini asistana devretti; bu ayrıntılar
tekrar sorulmadan açıkça demo olarak seçilebilir. Bu yetki production, güvenlik
veya MVP kapsamı onay kapılarını kaldırmaz; gerçek katılım uydurulmaz.
İlk demo planı oluşturuldu: 7 Eylül 2026 18:00 Europe/Istanbul, 75 dk,
12/24/30/9 dakikalık dört faz; katılım kaydı yok.
Güncel teslim Phase 2 P0.1a/b'dir. Additive sporting migration, backfill doğrulaması,
capability sınırı, tarihsel kadro/Player 360 API'si ve responsive frontend
uygulanmıştır. Disposable PostgreSQL'de U17→U19→A takım yolculuğu ve iki-kulüp
izolasyonu; Chromium'da Takımlar/Player 360 1440/1024/390 px akışı geçmiştir.
Retained yerel DB'ye P0.1 migration yedek/restore provası sonrası uygulandı;
altı migration güncel, iki kulüp IN_SYNC ve yerel browser smoke geçti. Ayrıntılı sıra:
[Backlog](docs/20-execution/BACKLOG.md). Production işleri beklemededir.

1. P0.1b root kalite/CDSK kapanışı: 396 backend ve 27 frontend unit, iki build,
   Sites 4/4; disposable PostgreSQL 29/29 ve Chromium opt-in 6/6 doğrulandı.
2. BL-042 tamamlandı: ortak transaction adapter, tarihsel membership kapanışı,
   current-grant yetki kontrolü, admin parity ve kalıcı scope selector.
   [P0.1b raporu](docs/30-quality/P01B_COMPATIBILITY_VERIFICATION_2026-09-06.md).
3. Retained yerel rollout tamamlandı; özel yedek ve veri koruma kanıtı
   [yerel raporda](docs/30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md). BL-043a–j
   sayfalı okumalar ve sentetik karma yük/SELECT row-work ölçümleri teslim;
   BL-046 editör ayrıştırması kapalıdır. BL-043 temsilî pilot kabulü için
   owner/hacim/workload/ortam/bütçe TBD. BL-045 sezon etiketi/regresyonu tamamlandı;
   sırada BL-044 ve kalan pilot/production karar girdilerinin onay planı vardır.
4. Beklemedeki M4: ADR-0010/0018/0020 exact origin/provider, proxy/secret, staging,
   registry/orchestrator, ayrı DB rolleri ve operasyon sahibini belirlemek.
   [M4 karar girdileri](docs/40-operations/M4_ROLLOUT_INPUTS.md) ve BL-028;
   production flag-off CORS/rollback henüz hazır değildir.
5. BL-044 minor/safeguarding ve sağlık/ileri analitik politikası ile formal WCAG
   ve başarı metriklerini ayrı
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
- [x] Backend bağımlılıkları kuruldu; 32 unit suite / 371 test ve build geçti.
- [x] Frontend typecheck, lint, format, unit/component, production build ve Sites
      worker testleri geçti; masaüstü/tablet browser ve görsel QA sonucu `passed`.
- [x] Frontend 6 Vitest dosyası / 21 test geçti (BL-029/030 dahil).
- [x] Dedicated PostgreSQL 16 üzerinde backend tenant/group/reset/session/DTO E2E
      25/25 geçti. Önceki koç/dirty-navigation/session Playwright opt-in 4/4,
      flag-off 3/3 kanıtı korunur; son BL-024 hata-containment dilimlerinde browser E2E
      tekrarlanmadı.
- [x] Kök `npm run quality` komutu typecheck, salt-okunur lint/format, unit test,
      build, Sites, Markdown link, CDSK ve diff kontrolleriyle geçti.
- [x] Kapanış handoff'u güncellendi.
- [x] Tam MVP review için aynı revision'da quality, disposable migration/schema
      diff, backend/frontend E2E ve responsive runtime audit tekrarlandı.
- [x] MVP kabul kapısı geçiyor; F-001–F-006 kapalı ve remediation hükmü **Pass**.

## 11. AI Handoff

2026-10-27 product audit publication: user now explicitly authorizes remaining
ready audit report/matrix, trackers and QA assets. Preserve original122 screenshot
bytes/hashes; all have JPEG content despite `.png` suffix.132 total images decode,
11 historical JSONs parse and credential pattern scan passes. Manifest headings
have a historical encoding caveat; actual pixel/URL/hash proof is authoritative.
Existing root17/17 log checked, no new runtime test or retained mutation. Keep
P1 findings open and later authorized186-player/season operations distinct from
audit's26 October41-table isolation receipt. Current-branch commit/push only;
main merge/PR/fixes not requested. Final exact-tree docs/format/CDSK/whitespace
and local/remote equality checks close publication.

2026-10-27 user-authorized evidence publication: publish only the two roster/link
reports, five screenshots, two sanitized verification JSONs and their Boot/changelog
sections on codex/product-audit-20261026. Keep all unrelated audit modifications
and QA assets local. Fresh season verifier25/25, artifact checks and exact-tree
docs/CDSK/whitespace are the publication gates; verify remote/local branch equality
after push. No runtime changes, retained writes, new ADR, PR or main merge requested.

2026-10-27 explicit season-link follow-up: original A player now has one active
primary in the correct2026–2027 TeamSeason. Standard transition preserves old
assignment history and legacy member; only old validTo/updatedAt change, plus one
new primary/two audit events. Directory and exact-season roster25/25, unique player
IDs25. Rollback rehearsal and42-table preservation pass. Use newer ignored
output/first-team-season-link-20261027 receipt/verifier for current state; older
roster verifier deliberately expects the former unchanged primary and is historical.
No runtime/model/new ADR. Subsequent evidence publication is explicitly authorized
above; prior audit/roster docs and assets preserved.

2026-10-27 sample-player request: only the local retained Spor Manage season was
populated;186 new accountless synthetic players,25 first-team directory/18 per
U8–U16 team. Existing42-table rows and prior audit docs preserved. All new primary
assignments carry exact TeamSeason and source reason; original A player was
seasonless at that stage (resolved by the subsequent follow-up above). No accounts/legacy memberships/health facts created;
account-based attendance is unchanged. Ignored operator/receipts under
output/synthetic-rosters-20261027, private backup outside repo in LOCALAPPDATA/NGCS.
Read receipt and verify rather than rerun creation/naturalization. UI3132 restarted
on127.0.0.1; existing API4000 preserved. Subsequent report/QA publication is now
explicitly authorized above. Existing audit branch/work remains intact.

User board-repetition report,2026-10-26: source and read-only retained120 PUBLISHED each have only4 geometries; SENIOR24 also4, all7elements. Root cause scripts/generate-drill-starter-pack.mjs board() only index%4 offset, frontend renders supplied version board. A16/BL-077 open; no content revision/runtime fix/DB write. Previous F05 suggestion refined into confirmed existing-scope content defect. Preserve all uncommitted audit docs/evidence and historic v1/snapshots.

Product audit,2026-10-26: user authorized review without fixes/redesign. Work on codex/product-audit-20261026, source9e9b109. Main report/matrix and QA README hold evidence degrees and unmet checks. BL-069–076 open; prioritize PLAYER roster self-scope then former-team note grant recovery, activity cursor/UI,409 draft preservation and primary identity. No policy/model/vendor/production approval inferred. Root17/17 ran once; sanitized HTTP30+41, one PLAYER authorization mismatch. Before/after41 business-table fingerprints equal. Only disposable DB/test accounts mutated; synthetic DBs retained; QA37996/35480/14508 stopped, real39636/27748 listeners unchanged. Temporary tab closed, viewport reset. Do not report PNG/SVG file acceptance or browser native-date create/wizard completion as passed. No app code changed, commit/push not requested. Final docs/link/format review closes this delivery.

PR#2 main merge,2026-10-26: explicit new user request authorizes merge and clean
local main sync, superseding earlier readiness-only boundary. PR head e8a4199
and base6c78681 remain unchanged/non-draft/clean; fresh2-suite37 pass. No GitHub
checks/statuses/reviews/threads, so no CI/human approval is claimed. Expected-head
merge yields af52b8c at07:14:36Z; PR closed/merged, both parents and tree8c37662
equal reviewed head. Fetch/switch/ff-only update local main from6c78681 safely,
with clean0/0 verified before docs closure. Report/Boot/changelog are docs only;
run links/CDSK/format/whitespace, commit/push and verify final remote/local equality
and clean0/0. Preserve feature branch locally/remotely; deletion not requested.
No retained write/migration/config/dependency/service restart or new ADR.
Receipt: output/pr2-merge-20261026/result.json.
[Record](docs/30-quality/PR_2_MAIN_MERGE_2026-10-26.md).

PR#2 readiness,2026-10-26: user authorizes opening main-targeted PR for
codex/png-download-compatibility, final review and ready if clear, not merge.
Draft PR2 attached to this chat. Current main6c78681 independently publishes
baseline QA; merge into feature21ea790 resolves four docs conflicts, preserving
both histories and main's POST_MERGE_QA_PUBLICATION report. Runtime/test blobs
remain1b4cb3d/9218cf3, so previous root17/17 remains applicable dated evidence.
Fresh2-suite37 pass; independent read-only review finds no Important/Critical
blocker. Fresh formatter/links/CDSK/whitespace cover closure. Initial CI/status/
review/thread lists are empty, not human approval or CI success. Connected GitHub
write returned403; existing Git credential helper supports authorized PR writes
in memory. Normal branch push and exact-head/base/mergeability checks gate ready;
no main push, auto-merge, migration, permission or retained-data operation.
Receipts: output/png-pr-20261026. [Record](docs/30-quality/PR_2_PNG_READINESS_2026-10-26.md).

Reviewed QA publication,2026-10-25: explicit user request publishes completed
main smoke/export reports and12 evidence files plus review/changelog/Boot,17
files. Independent read-only decoding/hash/SVG checks and archived aff1cb7
SVG/editor35 pass. A concurrent initial editor run failed31 with ReactForStage
undefined; its log remains, not a current-tree success claim. New PNG source/
tests, compatibility report/ADR note and png-download-fix evidence are excluded.
A temporary Git index and archived proposed tree permit publication to main
without switching or changing the active feature branch/normal index/worktree.
No runtime/data/migration/dependency change. Receipts in
output/pending-evidence-publication-20261025.
[Review](docs/30-quality/POST_MERGE_QA_PUBLICATION_2026-10-25.md).

PNG publication,2026-10-25: explicit user request authorizes final review, commit
and normal upstream push on codex/png-download-compatibility, base aff1cb7. The
runtime/test diff is unchanged since root17/17 (941/558/Sites4/tooling8); fresh
scoped tests and docs/index/artifact checks cover this publication. Read-only
re-review again finds no Important/Critical issue. Include prior linked smoke,
export and fix reports plus15 QA files to avoid broken evidence references.
Never stage ignored output operators/logs or local configuration. Earlier
no-commit/local-only statements describe their original closure, superseded by
this authorization. Verify final remote/local equality, upstream and clean tree;
no main merge, PR creation, migration or retained write requested.
[Record](docs/30-quality/PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md#publication-review--2026-10-25).

PNG compatibility fix,2026-10-25: explicit user request fixes prior IAB silent
PNG download. Branch codex/png-download-compatibility from aff1cb7; previous
local docs/QA preserved. Existing encoded2× PNG bytes are decoded into a typed
array and passed to existing image/png Blob download, avoiding data: anchor.
Two V1/V2 editor-control regressions observed red then focused2 suites/37 tests
green. Actual IAB (2).png and Chrome (3).png downloads each102568 bytes/1600×1200
with original4f08684a hash. IAB download-event now succeeds; Chrome disk file is
verified despite its event observer limitation. Both browser logs clean; no
retained write/config/schema/dependency/new ADR. Fresh root17/17 passes with
backend941/frontend558/Sites4/tooling8 and both builds; focused read-only reviewer
has no Important/Critical finding. Final closure docs checks pass.
Evidence in apps/frontend/qa/png-download-fix-2026-10-25; quality log in output.
No commit/push requested. [Record](docs/30-quality/PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md).

Tactical PNG/SVG follow-up,2026-10-25: user requests actual exported-file
comparison. Existing QA tactic cmvo8mkpo000l2ytchrorpagy remains unchanged on
bd424a6. IAB SVG downloads; IAB PNG has no download/error. Normal authenticated
Chrome downloads PNG1600×1200 and repeat SVG/PNG at125% with selected ball. Event
observer misses Chrome downloads, but on-disk timestamps/decoding/hashes confirm
them; each repeat is byte-identical to baseline. Downloaded JSON verifies all
nine SVG transforms/rotation. Offline sharp render and screen/PNG/SVG contact
sheet show matching geometry/colors; SVG font substitution slightly changes
numeral strokes. Direct file:// browser inspection was policy-blocked; no bypass,
local offline renderer used. Focused2-suite35 tests and links/CDSK/whitespace pass.
No source/config/data/ADR change or full root rerun. Artifacts under
apps/frontend/qa/tactical-exports-2026-10-25 remain local, no commit/push. See
[record](docs/30-quality/TACTICAL_EXPORT_ACCEPTANCE_2026-10-25.md).

Main restart/browser smoke,2026-10-25: explicit user request runs bd424a6 on
canonical4000/3132 against retained ngcs_local_session_dev. Normal backend build,
loopbackHTTP200 and existing persistent session after restart/reload pass. Actual
IAB library120/filtered16/search/preview, library→create→explicit add and existing
plan picker→preview→add pass. Retained QA training cmvo8ixzn00052ytchl8n46ph has
two phases32+18=50min, frozen SENIOR content/boards and linked day50 confirmed
read-only. Separate CLUB QA tactic cmvo8mkpo000l2ytchrorpagy reloads nine equipment
on half800×600 after property edits/drag/rotation/pitch undo-redo. These named QA
records remain, without editing real plans/source content. Screenshots in
apps/frontend/qa/main-smoke-2026-10-25 and ignored launch/read-only receipts in
`output/main-browser-smoke-*-20261025.*`. Preserve concurrent isolated acceptance
artifacts/docs. Desktop only; optional download-event probe times out, export
completion unverified. Existing root17/17 applies to unchanged runtime; no new
full root run, code patch, migration, ADR or commit/push. Canonical services stay
running and two result tabs remain. [Record](docs/30-quality/MAIN_BROWSER_SMOKE_2026-10-25.md).

Main ready-plan acceptance,2026-10-25: user requests running main and actual UI
ready-exercise attachment/source-change verification. Build succeeds; canonical
localhost3132/API4000 starts with retained DB/settings and shows120 ready items.
Separate loopback ngcs_main_ui_20261025, API4016/UI3516, contains only copied
synthetic HTTP fixtures plus its own club/accounts/team/plans. Actual browser
selection/preview/add yields1 phase/20min. Source senior-01 synthetic-approved
v2 publication has zero elements; full browser plan reload still shows seven,
content v1 and unchanged phase row/board SHA. A separate boardless migrated
CLUB fixture stays absent after source gains seven elements, full reload, and
both service readers/token verification. Before/intermediate41 retained business
fingerprints match; final drift comes only from the other authorized chat's new
QA — Main kontrolü 25.10.2026 plan/two phases/day, preserved and excluded by exact
new ID/time for the final identical comparison. No old rows/catalog changed.
Only this task's QA tabs/services close; main stays open/running. Screenshots in
apps/frontend/qa/main-ready-plan-2026-10-25; ignored operator/results in
output/main-ui-acceptance-20261025. No runtime edits/migration/new ADR/production.
[Record](docs/30-quality/MAIN_READY_PLAN_ACCEPTANCE_2026-10-25.md).

Post-merge cleanup,2026-10-25: explicit user request authorizes deletion of merged
codex/mvp-stabilization locally/remotely and safe removal of attached review
worktree C:/Users/fcelebigil/.codex/worktrees/pr-main-review/next-gen-coaching-system.
Main begins at7de694c; feature6fb5fb6/reviewd65f799 are ancestors. Four staged
review documents and ignored output/pr-review-build.json are preserved with
patches/hashes in output/merged-branch-cleanup-20261025. Manual junction unlink
was policy-blocked with no mutation; native archive_worktree succeeds, preserves
recoverable app state and removes the checkout/registration. Three primary
node_modules targets and package hashes remain unchanged. Expected-tip lease
protects remote deletion; local branch -d succeeds. Earlier preserve-branch/
worktree notes remain historical. These closure docs are the only main changes;
verify final remote/local main equality, zero ahead/behind, no feature refs and
only primary worktree. No source/test/runtime/data/migration/production operation.
[Record](docs/30-quality/POST_MERGE_CLEANUP_2026-10-25.md).

PR#1 final integration,2026-10-25: explicit user instruction authorizes final
review and merge to main if clear. Separate final scoped reviewer confirms prior
P1/P2 closure, no Important/Critical finding,136 affected tests and whitespace.
Root17/17 (941/556/Sites4/tooling8) and PostgreSQL HTTP11 remain valid for the
unchanged seven-file source/test hashes at6fb5fb6. GitHub has no reviews, threads,
check runs or statuses; this is local verification, not CI or human approval.
Exact-head merge via existing Git authentication succeeds as a90123a at19:27:06
UTC. Merge tree equals reviewed tree c48f146; both parent SHAs verified. Remote
main and local main advanced from1b831e0; branch/worktree history is preserved.
This report/Boot/changelog follow-up is documentation only. No retained-data,
migration, configuration or production action. Final operation evidence is in
output/pr1-final-merge-20261025/result.json.
[Record](docs/30-quality/PR_1_MAIN_MERGE_2026-10-25.md).

Frozen plan-board correction,2026-10-25: user authorizes P2 fix, regression/root
quality, push codex/mvp-stabilization and draft removal only after blockers clear.
Base dc24eb4. New effectivePlanBoard distinguishes non-null frozen content from
legacy fallback; used in tactical reader, full plan projection and legacy write/
replacement guards. Single-board SQL matches SQL/JSON-null behavior. Metadata
stays lightweight. Explicit first saves work with stable absent token even after
source V2; existing V2/source/tenant/publication guards remain. Unit red captured
then136 affected tests and actual PostgreSQL HTTP11 pass, including add/replace,
GLOBAL v2 publish, both readers, projection, reorder, null parity and first save.
All7 source/test hashes remain pinned; root17/17 passes (941/556/Sites4/tooling8,
both builds,205-file links/CDSK/whitespace). Scoped review has no Important/Critical
finding; P2 is closed. Proceed with the user-authorized ready transition only after
pushing the reviewed head and checking GitHub state; perform no merge.
Concurrent independent verification docs are preserved. No new ADR/model/schema/
migration/dependency/retained write or merge. See the final report for fresh results
and GitHub publication/readiness verification.
[Evidence](docs/30-quality/FROZEN_PLAN_BOARD_FIX_2026-10-25.md).

Independent frozen-board verification,2026-10-25: this chat's user also explicitly
requests that source changes leave saved plan boards unchanged. Another active
chat implements the same correction; its source/tests are preserved. Fresh136
affected tests and11 dedicated PostgreSQL HTTP cases pass here. A separate
TypeScript-service verifier confirms both SQL/JSON null, add/replacement, actual
CLUB source V1/V2 edits, unchanged frozen rows/tokens, notes-only replacement,
explicit legacy/versioned plan-board saves and old pre-snapshot fallback. Uses
only ngcs_ready_drills_test; no retained data or runtime service changed. Logs are
in output/frozen-board-independent-20261025. No new ADR/migration/dependency or
publication action from this chat. Full quality/publication belongs to the
separately authorized concurrent task.
[Evidence](docs/30-quality/FROZEN_BOARD_INDEPENDENT_2026-10-25.md).

PR#1 readiness re-review,2026-10-20: user conditionally requests draft removal
only if blockers are gone. Reviewed069f459/base1b831e0, incremental d65f799..HEAD
plus relevant contracts/services with an independent read-only reviewer. Original
P1 fix is narrow and passes HTTP11; new P2 means keep draft. Fresh actual compiled
TrainingEditorService + DrillContentService.publish in dedicated loopback test DB
reproduces absent v1 -> later GLOBAL v2 diagram on an unchanged PlanDrill with
v1 contentSnapshot/null boardSnapshot. Both training SQL and tactical document
readers still fall back to mutable source. Preserve frozen absence for new
versioned content, while retaining old nullable-row compatibility; add both-read/
add/replace/source-update regressions before readiness. Current validation is in
the report. No runtime edit/retained write/migration/ready transition/merge. Update
PR body to this finding; GitHub has no checks/statuses/reviews and main is
unprotected/no rulesets, mergeable locally/remotely. These do not clear P2.
[Review](docs/30-quality/PR_MAIN_READINESS_2026-10-20.md).

Tactical icon documentation publication,2026-10-20: explicit review/commit/push
request targets codex/mvp-stabilization after1d75b9f. Remaining action-icon report,
three original JPEG captures and shared changelog/design/instruction/handoff
history are included. Inspected images show the first football/command-icon stage;
current nine-tool shared-art QA is in the separate equipment report. Selection
is complete; older next-step/no-commit statements are historical. Runtime source,
schemas, dependencies and retained records are unchanged; the previous root17/17
(backend937/frontend556/Sites4/tooling8) belongs to the preceding publication.
Fresh document/profile/whitespace and instruction-format checks pass for this
publication. No new full application test run, browser save or production change.
PR#1 remains draft. [Review](docs/30-quality/TACTICAL_ICONS_2026-10-20.md).

Training workflow publication,2026-10-20: user requests final review, commit
and push on codex/mvp-stabilization after24a4a2a. Include the fixed starter library,
server-resolved TEAM picker, preview facts/focus, narrowly scoped boardless legacy
compatibility, explicit attendance UI and compact training heading. Existing
publication/version/exact-age/tenant guards and saved snapshots remain. Fresh
root17/17 passes (backend937/frontend556/Sites4/tooling8 and both builds);
dedicated loopback PostgreSQL HTTP11 and final exact-index docs checks pass.
Results are recorded in the publication report; dated screenshots/data-acceptance operations are historical, not rerun
retained writes. No new ADR/schema/migration/dependency/production rollout.
Older no-commit/local-only statements below describe their implementation turns;
this publication supersedes them for the included changes. PR#1 stays draft;
the historical boardless-legacy P1 is covered by the shipped regression fix.
[Review](docs/30-quality/TRAINING_WORKFLOW_PUBLICATION_2026-10-20.md).

Pitch/header publication,2026-10-20: user explicitly requests final review,
commit and push on codex/mvp-stabilization after9015b31. Publish the eleven
shared pitch-region templates, safe single-scene proportional edits with undo/
fit and compact title/back/metadata/viewport layout. Keep V1/V2/API, nine-tool
family, permissions/history/save and multi-scene lock. Other local library,
attachment, attendance and training-detail work stays unstaged. Exact-index
frontend551/type/lint/format/build/Sites4 and document checks pass; no new
retained browser write. Results are recorded in the publication report.
[Review](docs/30-quality/TACTICAL_PITCH_PUBLICATION_2026-10-20.md).

Tactical icon publication,2026-10-20: explicit user request targets commit/push
on codex/mvp-stabilization. Nine shared-art equipment tools plus command/scene/
playback icons are isolated in the index; existing fields/history/readonly/save
and native vector exports remain. Pending pitch/header/library/attachment/
attendance/training-detail work stays local and unstaged. The publication report
records exact-staged validation and scope. No API/schema/dependency/migration.
[Review](docs/30-quality/TACTICAL_ICON_PUBLICATION_2026-10-20.md).

Equipment family completion,2026-10-20: explicit follow-up adds Bayrak,
Merdiven and İşaret to the same shared-art horizontal rail (nine total), with
navy contours/amber details and unchanged default dimensions/rungs. All nine
miniatures serialize identical pitch/export art. Focused46/type/lint/format,
production build/Sites4 and desktop/tablet/mobile keyboard checks pass. Nine
images loaded;48px controls; page widths1009/1009 and375/375; Tab reaches last
item. All8 QA undo steps restore original full-pitch empty draft; viewport reset,
no retained save. Earlier root17/17 remains historical; not repeated for this
small presentation extension. No API/schema/dependency/commit/push.
[Evidence](docs/30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

Team-ready plan picker,2026-10-20: user explicitly requests only ready-package
exercises appropriate to the saved plan's team. Picker always requests collection
ngcs-starter-v1 + ageScope TEAM; service resolves exact age from authorized group
metadata, independent of active workspace age. TEAM requires collection/no
explicit ageGroup. All filters/paging/reset retain bounds; unsupported ages have
no club/nearest-age fallback. Existing selection/version/add/error/preview/focus
guards remain. Backend40/frontend34 and dedicated PG HTTP11 pass; TEAM U14=72,
warm-up12/U13=0; library still120. Actual original A Takım plan shows25+23 unique
starter IDs=48, tactical16/reset48, correct preview and retained selection. No add
submitted; original20min/4 phases and previous41 business-table fingerprints /
all48 pool snapshots unchanged. Normal build/API4000 restart uses same DB/flags.
No migration/new ADR/dependency/commit/push. Root quality log is
output/plan-picker-ready-only-quality-20261020.log; all17 gates pass, including
backend937/frontend553/Sites4/tooling8, type/lint/format/builds,199-file links,
CDSK36/47 and whitespace. Final targeted backend lint/format also pass.
[Evidence](docs/30-quality/PLAN_PICKER_READY_ONLY_2026-10-20.md).

Selected tactical equipment,2026-10-20: user chose the second displayed concept.
Six48px labeled horizontal add actions now serialize miniatures from the same
`elementArt` as Konva/SVG/PNG. Navy shirt/gloved keeper, classic football,
striped cone, netted goal and amber mannequins; new wall84px/three figures,
saved widths/documents unchanged. Existing commands, identities, shirt/disc,
history and explicit save preserved. Focused55 and real1440/1024/390 QA pass,
including drag620/340, rotation undo/redo and mobile keyboard rail scroll.
No retained save;15 QA undo steps restore original full-pitch empty draft,
Henüz kaydedilmedi/Geri al disabled; viewport reset. Source/implementation
comparison and design-qa.md pass. Full root17/17 passes, exit0: backend932,
frontend551, Sites4/tooling8, both builds/types/lint/format/docs/CDSK/whitespace.
No commit/push/schema/dependency/API change.
[Evidence](docs/30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

Ready-only library,2026-10-20: user explicitly requests only the120 authored
ready exercises, excluding seasonal program entries. LibraryRoute always sends
collection=ngcs-starter-v1; server restricts exact starter IDs/GLOBAL/PUBLISHED
before count/paging, excludes legacy fallback and defaults only collection reads
to all ages. Explicit age and non-collection implicit team-age reads remain.
Rows show age and preview row age when all-age; no source switches/club creation
shortcut. Exact-team-age detail attachment remains. Backend35/frontend41 and
dedicated PG HTTP11 pass; HTTP includes seasonal/unrelated NGCS exclusion and
all120 IDs. ActualUI five pages25/25/25/25/20 =120 unique stable IDs, SENIOR48 and
reset120 pass. Normal build/API restart uses existing DB/flags; no retained data
write/migration/dependency/new ADR/commit/push. Existing pool verifier preserves
all48 snapshots and41-table previous business. Prior tactical work is concurrent.
Logs output/library-ready-only-{quality,http}-20261020.log; current aggregate
quality encountered unrelated tactical artwork formatting during active edits.
Final outcome: backend932/frontend543/Sites4/tooling8 and builds pass. Initial
root15/17 also encountered two test-only exact-option type errors; final current
frontend type/whole-format repeats through quality runner both pass, exit0. Do
not describe this as a new uninterrupted17/17 run. Final197-file links/CDSK36/47/
whitespace pass; UI full reload/session retains120. Open ready-only `/app/library`.
[Evidence](docs/30-quality/LIBRARY_READY_ONLY_2026-10-20.md).

Tactical equipment concepts,2026-10-20: user requested six original objects
shown in toolbar and pitch context. Three independent built-in Image Gen
previews were displayed and retained in frontend QA, grounded in a read-only
capture of the actual current board. Visual choice pending; concepts are not
implemented assets or measured small-size controls. Preserve orthographic2D,
shirt default, shared drawing/document contracts; generated perspective/leg
details are not approved changes. No runtime or retained business write.
[Preview record](docs/30-quality/TACTICAL_ICON_CONCEPTS_2026-10-20.md).

Ready exercise collection,2026-10-20: user clarified authored starter content,
then explicitly approved a separate A Takım — Hazır Egzersizler plan. Created
cmvgg1le900012ybgmtexpdi3 under existing active coach Kerem Tunalı, undated/no
DayPlan. Existing controller create/replace and real active SystemAdmin access
checks save48 unique exact-SENIOR instructions/durations/boards;8/16/16/8 phases,
1184min sum. Purpose describes a collection, not one scheduled session. All48
snapshots compare equal;41 business-table fingerprints excluding only new plan/
phases preserve every prior row. Original20min/4 phases and fixtures unchanged.
Repeat apply and read-only verify pass with0 created/0 attached. Actual UI shows
instructions/A Takım rules/pitch and full reload/session/48 persisted. Starter120
already PUBLISHED;1826 A Takım catalog =1778 CLUB +48 supported ready exercises,
including24 U18 originals with explicit SENIOR variants. No source reimport,
runtime/schema/flag/dependency/new ADR/commit/push. Ignored operator/baseline/
results in output/ready-pool-20261020; do not recreate or repeat scheduled writes.
No application suite rerun for data-only operation. Open this exact collection;
all120 remain accessible in library NGCS across supported team ages.
[Evidence](docs/30-quality/READY_EXERCISE_POOL_2026-10-20.md).

Tactical icon competitor research,2026-10-20: public Coach Board picker, Táctica
pitch, TacticalPad guides/images/release notes and SSP3D demo were compared.
Recommended next visual preview: six original football objects (player, keeper,
ball, cone, goal, wall) with tool miniatures matching pitch objects. Current
ShieldCheck/GridNine/UsersThree semantics are the clearest gaps. Preserve the
approved2D/shirt default+disc alternative, documents/geometry and shared exports.
This is a proposal, not an implemented or selected redesign. See
[research and sources](docs/30-quality/TACTICAL_ICON_COMPETITOR_RESEARCH_2026-10-20.md).

Tactical action icons,2026-10-20: Phosphor icons now accompany history/view/
metadata/selection/nudge/formation/animation/scene-apply/loop/fixed-scene controls.
Mobile history is accessible icon-only44px. Ball tool is filled SoccerBall;
shared canvas/SVG football has central and edge black pentagons/fine seams,
without changing radius, JSON, save/history or API. Focused58/type/lint/build
pass;1672/390 live visual QA and375/375 mobile overflow/44×44 history checks pass.
Only an unsaved draft was used; no new retained write. See
[evidence](docs/30-quality/TACTICAL_ICONS_2026-10-20.md). Prior root17/17 remains
historical; this presentation follow-up uses focused frontend checks.

Legacy exercise preview/attachment,2026-10-20: user reported the generic empty
legacy preview while adding an exercise. PlanDrillPicker now retains/passes the
catalog item and resolved age to DrillPreview, shows saved title/age/duration/
summary or equipment, explains absent detailed content and restores focus.
The separate main-review P1 is fixed locally: only LEGACY/LEGACY_UNVERIFIED
published versions may omit a NULL board, while content/version/age/duration
remain frozen and strict professional/malformed-board checks remain. Affected
backend45/frontend29 and dedicated loopback ready-drill PostgreSQL HTTP10 pass.
Actual existing training picker preview and close/focus/selection pass,20min/4
phases unchanged; no retained add submitted. No schema/new ADR/dependency/commit/
push or GitHub readiness change. Other attendance/pitch/heading work preserved.
Full root17/17 passes: backend927/frontend542/Sites4/tooling8, types/lint/format/
builds,192-file links,CDSK36/47 and whitespace. Final normal backend build and
affected backend lint/format pass. API4000 restarted with existing loopback DB
and ignored flags; successful startup and full UI reload retain login/20min/4
phases. UI3132 remains running. No Prisma regeneration/retained migration.
Historical review below still describes its own SHA. Missing professional
instructions require content authoring/review; never fabricate them.
[Evidence](docs/30-quality/DRILL_LEGACY_PREVIEW_FIX_2026-10-20.md).

Training detail heading/icons,2026-10-20: user requested removing Planlar and
Antrenman detayı from screenshot and adding color with icons. Shared route now
starts with saved title/date; decorative Phosphor icons mark summary/tabs/phase
types with restrained colors. Text/aria names, mobile44px minimum and existing
interaction guards remain. Requested cmvf4synt006n2yx4fx3ixemr opens Maç günü hafif
aktivasyon,20min/4phases;1440/390 inspected and320 tab dimensions checked. Focused
35/type/lint/format/build/Sites4 pass. Two old integration link interactions were
updated to router navigation; catalogue assertions remain. No stored data/board
open/API/model/ADR change or commit/push. Concurrent tactical/legacy-drill and
earlier attendance changes preserved. Frontend AGENTS records preference.
Docs/whitespace pass. Viewport reset, requested plan open.
[Evidence](docs/30-quality/TRAINING_DETAIL_ICONS_2026-10-20.md).

Modern 2D tactical pitch,2026-10-20: user-approved REQ-024/BL-057 extension
fixes eleven shared pitch drawings and proportional single-scene edits, with
oversized-equipment rejection and exact undo. Compact editor toolbar replaces
the heading; shared artwork modernizes equipment in canvas/SVG/PNG rendering.
V1/V2/API/schema/permissions remain unchanged. Authenticated1672/1024/390 checks,
synthetic club-board save/reload and mobile V2 draft preview passed. Retained
QA drill cmvgepax300172yb8cytunc54 has five synthetic objects; preserve it.
IAB PNG download event was unavailable, so exported-file inspection is not claimed.
Final primary-worktree root gate17/17 passed: backend927/frontend542, Sites4,
tooling8, both builds and docs/CDSK. Counts include concurrent work.
See [evidence](docs/30-quality/TACTICAL_PITCH_MODERN_2D_2026-10-20.md) for gates
and limitations. Existing attendance work and PR#1 attachment P1 remain separate.

Main PR final review,2026-10-20: PR#1 (codex/mvp-stabilization → main) is draft.
Implementation d65f799 contains a reproduced P1 in plan-drill-content.ts:44:
professional migration gives legacy drills a PUBLISHED version with NULL board,
then attachment unconditionally validates it and returns400. Preserve legacy
compatibility and add backfill-shaped regression before ready/merge. Fresh918/514/
Sites4/tooling8 pass in detached review checkout; root15/17 due junction TS2742,
focused typecheck and Nest build pass with review-only preserveSymlinks. This is
not a new17/17 unmodified run; prior canonical acceptance remains dated. No GitHub
checks/statuses exist for the reviewed SHA. Review docs only; keep the primary
attendance edits unstaged. No migration/retained writes or production activation.
[Review](docs/30-quality/PR_MAIN_FINAL_REVIEW_2026-10-20.md).

Training attendance UI/UX,2026-10-20: PlanAttendance now uses a scoped compact
white panel and roster rows. Explicit PRESENT/ABSENT buttons replace implicit
whole-player toggling; null remains Henüz işaretlenmedi and is not counted absent.
Mobile buttons48px, desktop44px, names wrap; paging follows the roster and hides
unnecessary single-page controls. Same-status selection is a no-op, writes remain
serialized/nonoptimistic and uncertain writes require reload. Successful reread
restores keyboard focus. PLAYER has static self status only. No API/model/ADR
change. Final frontend14/type/lint/format/build/Sites4 and1440/1024/390/320 checks
pass; inherited global320px body min-width/desktop scrollbar constraint documented.
Mert's exact existing PRESENT row/1-of-1 and plan snapshots/owner/calendar remain
unchanged by read-only assertions. Prior acceptance files preserved. Viewport
reset and Katılım open. No commit/push. Docs/whitespace checks pass.
[Evidence](docs/30-quality/TRAINING_ATTENDANCE_UX_2026-10-20.md).

Training attendance,2026-10-20: user requested verifying Mert in the existing
cmvfbzkvb00392yiwp5dzmxtm plan. Canonical3132/4000 services were stopped; existing
PostgreSQL was running. Restored services with existing ignored persistence and
tactical flags; ordinary session recovered on reload. Mert appeared, initially0/1
with no attendance row. Announced synthetic PRESENT check and clicked once;
success then full reload retained selected Mert/1/1. Read-only verifier confirms
exactly one PRESENT row for player cmvfblwu8000q2yvgaqnypikf and all unrelated
attendance unchanged. Existing training-flow verifier still passes exact owner,
date,18min/1phase/frozen source/calendar and historical business fingerprints.
Ignored attendance-before/result and verify-attendance.cjs preserve evidence;
do not repeat writes for QA. No runtime/schema/ADR change; application suites not
rerun. Document checks pass. Katılım left open; further status changes are
user-directed. [Evidence](docs/30-quality/TRAINING_ATTENDANCE_2026-10-20.md).

Kerem training flow,2026-10-19: explicit user create+attach request and selected
20Oct2026 18:30 completed through existing UI. New retained plan
cmvfbzkvb00392yiwp5dzmxtm, Kısa Oyun ve Yansıtma — A Takım, actual coach Kerem
Tunalı/ACTIVE, stored15:30Z. Open source ngcs-starter-v1-senior-24 attached once:
COOL_DOWN/order0/SENIOR/v1,18min/1phase. Full content/board snapshot equals published
version cmvf4a72v00p72yyo3ffnuvim; linked DayPlan date/duration18 match. Create returns
to the picker with new selection despite first-page absence; no auto attachment.
Success/detail/reload/frozen instructions and saved pitch/mobile focus passed.
Exact baseline hash excludes only new plan/phase/day: previous2060/8244/36/3629
unchanged, new totals2061/8245/36/3630. Ignored read-only verify-training-flow.cjs
and training-flow-result.json capture assertions. Older people-only full baseline
is now historical; do not recreate the people/plan or rerun apply. No runtime
code/ADR/migration changed. Document links186/zero broken, CDSK36 required/47 ADRs/
zero errors and whitespace pass; final read-only verification passes after UI QA.
Next: reopen this exact plan for further user-directed changes.
[Evidence](docs/30-quality/COACH_TRAINING_FLOW_2026-10-19.md).

Training-dialog publication follow-up,2026-10-19: user explicitly requested commit
and push. The earlier combined package3d5d758 is already on the remote branch.
Remaining attachment/training-form/coach-refresh changes and original QA are being
verified for a normal push to codex/mvp-stabilization. No backend/schema/data
change is part of this publication. Do not rerun local account provisioning.
Ignored log: output/ui-publication-quality-20261019.log; full17/17 pass, exit0.
Backend918/frontend514/Sites4/tooling8, both builds/types/lint/format,186-file links,
CDSK36/47 and staged whitespace pass. All8 runtime/test/style hashes unchanged;
58 files including38 QA PNGs pass the staged high-confidence key/JWT scan. No
active hook or hook-disable flag; per-command existing author identity only.
This report ships in the publishing commit; inspect Git history/remote equality
for its hash. Additional screenshots/report contain no runtime changes.
[Evidence](docs/30-quality/UI_PUBLICATION_FOLLOWUP_2026-10-19.md).

Local coach/player operation,2026-10-19: user chose actual records and “Kendin
üret”. Spor Manage had0 login accounts, so COACH/ACTIVE filter was correctly empty.
Created synthetic Kerem Tunalı (COACH) and Mert Çınar (PLAYER), both ACTIVE in Spor
Manage/A Takım through existing invitation acceptance/member domain services.
Person/profiles and legacy/sporting membership audited; no external email.
Player primary A Takım assignment saved through normal Player360 UI; current-team
header now correct and final read-only check verifies one active primary.
Random passwords/tokens stayed in memory; use existing reset UI for later login.
Ordered fingerprints for2060 plans/8244 phases/36 matches/3629 day plans unchanged.
Ignored helper/result under output/local-people-2026-10-19 are local-only; never
repeat apply on existing identities. Verify mode is read-only and passed.
Picker now has explicit refresh preserving draft, clearing coach pin/selection
and reloading active club options. New coach visible; filled form enables submit.
No retained plan/attachment submitted. Focused frontend46/backend128, typegen/type/
scoped lint/format/build/Sites4, actual coach readiness/player/profile/account UI,
links184/CDSK36-documents47-ADRs/zero errors/whitespace pass. No new ADR/schema/API.
Next: select the new coach and explicitly create the desired training.
[Evidence](docs/30-quality/LOCAL_COACH_PLAYER_2026-10-19.md).

Training-plan form UI,2026-10-19: latest user request extends the compact library/
attachment-dialog language to new training. Shared create/edit form has Inter
header/team context, paired desktop/stacked mobile fields,48px/16px inputs and
144px mobile purpose; header/footer stay outside body scrolling. Coach pager has
short visible labels with preserved accessible names. Native datetime-local,
raw title/notes/ISO conversion, active-COACH ownership, explicit submit and caller
draft/focus behavior remain. Cancel disables during save. Delete unchanged.
Full frontend512/512, final affected44/44, typegen/type/scoped lint/format,
build/Sites4 pass. Links183/0 broken, CDSK36 required/47 ADRs/0 errors and
whitespace pass. Source/result equal800px contact sheet and mobile inspected.
At that UI slice's verification, no active club COACH existed; the later user-
authorized synthetic-account operation resolves the data prerequisite.
No retained writes, account/grant, API/schema/dependency or new ADR requirement.
Next: user review; no automatic creation/attachment/publication.
[Evidence](docs/30-quality/TRAINING_PLAN_DIALOG_UX_2026-10-19.md).

Add-exercise dialog UI,2026-10-19: latest user request extends compact Matches/
library styling to the existing plan attachment window. Published exercise/team/
phase context, native select/cursors, full plan summary/purpose and fixed footer
improve inspection. Mobile44px controls/16px select, scrolling body and focus
return verified at1440/1024/390/320 and short landscape. Selection survives paging
and new-plan cancellation. ADR-0034/0039, expected version, explicit attachment,
active-COACH, duplicate and uncertain-write verification remain. No API/schema/
dependency or retained data change; no new ADR required. Full frontend512/512,
affected32/32, final planning11/11, typegen/type/scoped lint/format/build/Sites4
pass. Links182/0 broken, CDSK36 required/47 ADRs/0 errors and whitespace pass.
Final source/result equal800px contact sheet and responsive captures inspected.
Next: user review of this dialog; no automatic attachment or publication.
[Evidence](docs/30-quality/ADD_DRILL_DIALOG_UX_2026-10-19.md).

Final publication check,2026-10-19: user explicitly requests commit/push of all
accumulated approved changes to codex/mvp-stabilization; main stays unchanged.
Full root17/17 exits0, backend918/frontend509/Sites4/tooling8 plus types/lint/format/
build/CDSK36 documents/47 ADRs/180-file links/whitespace pass. Fresh dedicated
PostgreSQL setup6/content9/planning21 pass (36 total), operator guards8 and syntax9
pass; two opt-in operator DB cases skipped. Manual browser QA not repeated here.
Root output now ignored, preserving private DB baselines/helpers locally; env,
logs/builds/dependencies/Python caches excluded. Candidate/staged text hygiene has
no findings; valid frontend QA assets stay. No runtime edit/deployment/migration/
retained data rewrite in publication review. Operational usage assumes max3 games;
existing tested5-game capacity remains unchanged. InfraScope context-menu question
was advisory only and introduces no feature into this repository.
Prior target/local HEAD33442ff and local/remote main1b831e087b727b80bfed0d47005bb0b95fa0852f
verified. Commit uses command-scoped prior repository identity; no hooksPath/active
Git hook configured, no bypass override. Push only HEAD:refs/heads/codex/mvp-stabilization,
without force. Final commit/upstream/clean-tree/unchanged-main checks come from Git.
[Review](docs/30-quality/PRE_PUSH_REVIEW_2026-10-19.md).

Five-match senior increment,2026-10-19: explicit request implemented under
ADR-0047 / REQ-033 / CR-034 / BL-068. BALANCED_WEEK_V6 raises SENIOR ceiling to five
using existing pairwise kickoff-hour training/recovery/combined-briefing presets.
Manual content/time/exclusion/deletion, history/completion/attendance and atomic
conflict/fault guards remain. Six-or-more/same-day/sub24-hour contexts stay manual.
Applied checkpoints remain valid; no migration/new endpoint/enrollment/academy changes.
Backend62 suites/918 tests, focused48, PostgreSQL HTTP21, type/full lint/format,
normal Nest/isolated builds pass. All21 five-match plus35 four-match combinations
have no generated overlap and correct phase totals. Five-match time pins, phase/
agenda/deletion, kickoff-hour changes, cross-Monday, concurrency and rollback pass.
Fresh before-five-match-20261019.dump restored to ngcs_five_match_restore_test.
Actual isolated UI shows19Oct16,20Oct16,22Oct16,23Oct18,25Oct16 (24/48/26/46h).
Fifth save updates2/retires1/protects65. Recovery30/briefings15 and manual121min
remain visible. Exact comparison preserves both121/103min plans/phases/exercises/
day links, academy and32 other complete fixtures. Retained36 dates/41 enrollments
unchanged;44-table snapshot identical before restart, only normal auth refresh
and SESSION_REFRESHED audit additions differ afterward. API4000 dist/main.js
serves V6 with DB URL in process environment; UI3132/ignored auth/tactical flags
remain. Persistent reload verifies real Beşiktaş25Oct16. QA4014/3500/tab stopped
after proof; private backup/copied DB remain. No reset/commit/push/production.
Existing repo-owned CDSK is ADR-0046. Current profile47 ADRs and180-file links
have zero errors; earlier library closing duplicate/missing-report warnings resolve.
Use existing date dialog/fresh-week preview; never remove checkpoint/slot markers.
[Evidence](docs/30-quality/FIVE_MATCH_PROGRAM_2026-10-19.md).

Four-match senior increment,2026-10-19: explicit request implemented under
ADR-0045 / REQ-032 / CR-033 / BL-067. BALANCED_WEEK_V5 raises the SENIOR ceiling to
four, reusing pairwise actual-hour training/recovery/briefing presets. Runtime
change is only template version/limit/fallback text. Manual content/time/exclusion/
deletion and history/completion/attendance protections remain; conflicts roll
back the whole date/program/checkpoint write. Five-or-more/same-day/sub24-hour
contexts remain manual. Old applied checkpoints stay valid; no re-enrollment.
Backend62 suites/913 tests, focused43, PostgreSQL HTTP19, type/full lint/format,
normal Nest/isolated runtime builds pass. All35 four-match weekday combinations
have no generated overlaps and valid phase sums; actual four-match preview/apply,
time pins, phase/agenda/deletion, cross-Monday, concurrent retry and late-fault
rollback pass. Existing two/three-match cases and academy profiles remain.
Fresh before-four-match-20261019.dump restored to ngcs_four_match_restore_test.
Actual isolated UI produces20Oct16,22Oct16,23Oct18,25Oct16 fixtures (48/26/46h).
Fourth-match save updates5/adds2/retires2/protects65. Wednesday/Saturday recovery30
and briefings15 appear; edited Tuesday121min stays on the new matchday. Exact
comparison preserves both121/103min plans/phases/exercises/day links, academy and
33 other fixtures. All36 retained fixture dates unchanged;44-table snapshot
identical before restart, only normal auth refresh/session audits differ after.
Canonical dist/main.js API4000 serves V5, with DB URL in process environment;
frontend3132/ignored auth/tactical flags remain and persistent reload is verified.
Real BJK still25Oct16. QA4014/3500/tab stopped after proof; backup/copied DB remain.
QA legacy-memory auth can end on dev reload; valid screenshots are result-desktop
and week-desktop under output/playwright/four-match. No migration/reset/commit/push.
Use existing date dialog or fresh-week preview; never delete audit/slot markers.
[Evidence](docs/30-quality/FOUR_MATCH_PROGRAM_2026-10-19.md).

Exercise detail extension, 2026-10-19: `/app/library/:drillId` now uses the compact
library/Matches language: text heading, semantic four-fact strip and one guide
panel. Uygulama retains full purpose/description, numbered steps, equipment and
exact-age coaching/rules; source/license/attribution stay in Kaynak. Saha explicitly
mounts the existing readonly board, with normal content transfer unchanged.
Mobile44px controls, two-action row, short facts and focus mode pass. Picker close
returns focus to its add trigger. Reader retry/context-loading/error and keyed
tab/dialog reset exclude previous resource results. Existing PLAYER, missing-age,
publication and expected-version/scope attachment guards remain; no retained save,
API/schema/dependency or flag change. No new ADR is needed for this UI slice.
Full frontend509/509 (61 files), affected29/29, final detail11/11, type/lint/format,
production build/Sites4 and whitespace pass; initial173-file Markdown passes. Actual
1440/1024/390/320 QA includes steps, readonly pitch/focus, source, picker Escape/
focus, no-variant and legacy. Earlier ADR-0043 missing-report links now resolve.
Full root/CDSK acceptance is tracked separately under the newer repository-owned
validator work above; this slice does not claim that entire gate. Preserve the
existing local sessions, API4000/UI3132 and earlier retained attachments/program.
Closing177-file doc scan finds6 concurrently added FOUR_MATCH_PROGRAM report links
pending outside this slice. ADR-0045 is also duplicated between repository-owned
CDSK and four-match microcycles; do not silently pick authority or renumber an
accepted decision. UI/runtime verification is unaffected; these are open doc risks.
Next: review the Uygulama/Saha/Kaynak flow on real team content; keep explicit plan
selection/save and independent publication policy.
[Evidence](docs/30-quality/LIBRARY_DETAIL_UX_2026-10-19.md).

CDSK local-validator follow-up,2026-10-19: user explicitly authorized replacing
the missing external dependency with a tracked project-contract implementation.
Accepted ADR-0046 resolves ADR-0001's open portable model. Use the default
`node scripts/validate-cdsk.mjs`; no sibling checkout/network/pip dependency.
Python3.9+ is required; explicit CDSK_VALIDATOR overrides retain failure semantics.
Profile r1 pins36 mandatory documents, manifest/version/Boot/Constitution/ADR/path
checks. Do not claim upstream parity or human content/approval verification.
Eight Node tooling tests include17 Python tests (16 pass/one Windows symlink
privilege skip). Full root log: ignored
`node_modules/.cache/ngcs-quality/cdsk-local-complete-20261019.log`: all17 stages
pass, exit0; backend913/frontend509/Sites4/tooling8, CDSK36/46,178-file links and
types/lint/format/builds/whitespace pass. Final parser/renumbering follow-up also
passes8/8 tooling tests; BL-061 complete for the approved local profile.
[Evidence](docs/30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md).

The temporary ADR-0045 collision mentioned by concurrent library-detail handoff
was detected by the local validator and resolved: this task's new validator
record is ADR-0046 with updated references; four-match ADR-0045 retains its ID and
content. Current local validation passes36 documents/46 distinct ADRs and178-file
links pass. Earlier missing-report/collision warnings below describe prior state.

Three-match senior increment,2026-10-19: explicit request accepted ADR-0044 /
REQ-031 / CR-032 / BL-066. BALANCED_WEEK_V4 raises SENIOR ceiling to three, reusing
existing pairwise elapsed-hour presets for every consecutive gap. Only template
version/limit/message changes in runtime; tests cover72/72,48/96,24/120-hour
cycles and adjacent-week/final-match recovery. All manual content/time/exclusion/
deletion and history/completion/attendance protections remain. Four-or-more,
same-day/sub24-hour contexts remain manual; old applied checkpoints stay valid.
Backend62 suites/908 tests, focused38, PostgreSQL HTTP17, type/full lint/format,
normal Nest and isolated runtime builds pass. Triple cases verify actual apply,
preview pins, phase/agenda/deletion protection, interval change, cross-Monday,
concurrency, manual conflict and late-fault atomic rollback.
Fresh before-three-match-20261019.dump restored to ngcs_three_match_restore_test.
Actual isolated UI moves Rizespor to22Oct16 and Konyaspor to23Oct18, leaving BJK25Oct16;
26/46-hour intervals show Saturday recovery30/briefing15. Third-match save updates5,
retires1 and protects49 records. Exact comparison preserves edited121/103min plans,
academy and34 other fixtures. Retained44-table snapshot unchanged before restart;
all36 retained fixture dates stay. Normal refresh only changes auth session/audits.
Canonical dist/main.js API4000 now serves V4, DB URL provided in process environment;
frontend3132/auth/tactical flags unchanged and existing persistent reload verified.
Real BJK remains25Oct16. QA4014/3500 and temporary tab stopped after proof; copied
DB/private backup remain. No migration/new endpoint/enrollment/reset/commit/push.
Use existing match-date dialog and empty-week preview; never delete audit markers.
[Evidence](docs/30-quality/THREE_MATCH_PROGRAM_2026-10-19.md).

Two-match senior microcycles,2026-10-19: explicit request implemented under
ADR-0043 / REQ-030 / CR-031 / BL-065, superseding only the earlier two-match refusal.
BALANCED_WEEK_V3 uses actual elapsed kickoff hours including adjacent weeks;
compressed intervals up to120 hours have one physical session, combined briefing
and afternoon rest. Normal seven-day cycles and academy profiles remain. Explicit
preview time overrides now pin on apply; full manual edits/deletions/exclusions,
history/completion/attendance and conflict/transaction guards remain. At that release three-or-more contexts were manual; ADR-0044 above
subsequently adds three. Same-day/sub24-hour contexts remain manual. No migration.
Backend904/focused34/PostgreSQL HTTP15/type/full lint/normal+quality builds pass.
Fresh before-two-match-20261019.dump restored to ngcs_two_match_restore_test;
actual isolated UI18→22 October makes two fixtures, updates8/creates7/retires5,
protects33 records. Exact comparison preserves edited121/103min plans, academy and
35 other fixtures. Retained44-table snapshot identical before runtime restart;
all36 retained fixture dates unchanged. Normal refresh may update auth sessions.
Canonical dist/main.js API4000 active with DATABASE_URL supplied in process env;
ignored .env contains persistence/origin/tactical flags, not DB credentials.
Frontend3132 and retained persistent login work; real Beşiktaş remains25Oct16:00.
QA4014/3500 stopped after proof; restored DB/backup remain. No commit/push/reset.
Use existing match-date dialog or fresh-week preview; never erase audit markers.
[Evidence](docs/30-quality/TWO_MATCH_PROGRAM_2026-10-19.md).

Windows root quality follow-up,2026-10-19: use `node scripts/quality-gate.mjs`
or `--continue-on-error` to attempt all checks and retain a failing status. npm
is pinned locally12.2.0 through the root lockfile; no global install. Fresh quality
Prisma client/types and build go to ignored caches; keep the serving API/engine
running. Original runtime generation and standalone build:check remain unchanged.
Git text checkout LF plus Prettier EOL-auto prevents CRLF-only failures without
mass rewrites. Socket tests isolate local persistence configuration and test both
modes; history assertions preserved with cached undo/current remounted scene fields,
mocked styling for state tests and15s default/60s large-history case budget.
CDSK remains an external prerequisite: no local/accessible source for0.1.0
validate_project.py was found or supplied. Do not stub it, skip it or claim the
complete root gate passed. Python launcher/missing-validator paths are tested.
Final root log is ignored `node_modules/.cache/ngcs-quality/windows-complete-20261019.log`.
Complete result: 16/17 stages pass; 904 backend,498 frontend,4 Sites and6 tooling
tests pass, both builds/type/lint/format and170-file links/whitespace pass.
CDSK alone fails for the missing real validator; root exit1 is intentional.
Runtime Prisma engine hash is unchanged. Obtain the original validator, configure
CDSK_VALIDATOR, run its wrapper and then repeat the full gate; BL-061 stays partial.
Closing documentation recheck passes172 files/zero broken links after concurrent
three-match documentation was written; test counts describe the completed run.
[Evidence](docs/30-quality/QUALITY_GATE_WINDOWS_2026-10-19.md).

Exercise library extension, 2026-10-19: compact heading/native list replaces the
photo and metric cards. One mounted search and one advanced-filter Sheet keep
all server filtering/cursor/stale-scope behavior. Search query identity stays
stable during debounce. Full summary disclosure, both pagers and separate preview/
detail actions improve mobile inspection. Preview explicitly loads the selected
record with response-resolved age; sticky Uygulama/Saha tabs mount only the
readonly pitch. Fixed close/detail controls, exact-row focus return, legacy
fallback and existing in-plan attachment guards remain. Actual1440/1024/390/320
QA and29 affected tests pass; final full-suite/build results are recorded in the
linked evidence. No retained save/attachment, API/schema/dependency or flag change.
Final58 affected checks and type/lint/format/build/Sites4 pass. Initial167-file
link scan passed; its final169-file scan found3 concurrent ADR-0043 report links
pending at that time. The later exercise-detail173-file check resolves all three.
The full run's history-test timeout exposed stale test DOM references; corrected
live-form interaction now verifies55 edits/50 undos in a passing29-test board file.
Existing role/publication/snapshot boundaries stay. No new ADR. Root Windows/CDSK
gate remains BL-061. Preserve the separately restored persistent login and API4000/
UI3132; no reset, migration, commit or push is part of this slice.
Next: review the existing library preview/filter workflow before extending this
same language to another separately requested screen.
[Evidence](docs/30-quality/LIBRARY_UX_2026-10-19.md).

Fixture-aware program updates, 2026-10-19: explicit subsequent request implemented;
ADR-0042 supersedes the earlier manual-fixture-review limitation for enrolled
SENIOR programs. Existing match-date update rechecks actor/scope under season lock,
then reconciles old/new/adjacent weeks in one Serializable transaction. Immutable
audit checkpoints track complete ownership fingerprints and protected tombstones.
Manual edits/deletions/exclusions, past/completed/attendance and extra links stay;
At the initial ADR-0042 release, two-match templates also rolled back.
ADR-0043 above subsequently adds two-match support; ordinary conflicts still roll back.
Analysis-only/same-date saves do not repeat planning. New SENIOR weekly applications
enroll automatically; unknown legacy origins are never assumed automatic.
Guarded local enrollment follows fresh before-fixture-sync-20261019.dump backup
and ngcs_fixture_sync_restore_test rehearsal: 41 weeks, 631 owned/2 protected events,
all 24415 original rows across 44 tables identical. Retained replay adds zero and
preserves 24456 rows. Existing 36 retained fixture dates were not changed for testing.
Restored UI 16-to-18 update moves 2 events; independent comparison preserves 2 edited
events, 35 other fixtures and academy. Backend 896 / HTTP 13 / frontend 495, final
focused 27/12, enrollment 1, builds/type/lint/format/Sites 4 and 1440/1024/390 QA pass.
Canonical API 4000/frontend 3132 use existing ignored environment, including the
separately configured persistent-session and tactical flags. No migration, reset,
production, commit or push. QA 4014/3500 stopped; restored test data remains separate.
Continuation found local services/Docker stopped. Docker Desktop was reopened;
the original PostgreSQL volume has 2060 plans and all 41 automation checkpoints.
Canonical API 4000 (dist/main.js) and frontend 3132 health were restored.
Existing persistent login recovered after the interrupted development module was
reloaded. Real Beşiktaş detail/date dialog verified at original16:00 without save;
the match detail remains open. No retained fixture was moved for final UI checks.
Next: Maçlar → maç detayı → Tarih ve saati düzenle. Preserve all checkpoint/request/
slot audits; no automatic unpin. ADR-0043 subsequently extends two-match templates.
Root Windows/CDSK tooling remains BL-061.
[Evidence](docs/30-quality/FIXTURE_PROGRAM_SYNC_2026-10-19.md).

Local session reactivation, 2026-10-19: preserve ignored backend
`PERSISTENT_SESSIONS_ENABLED=true`/exact `FRONTEND_ORIGIN=http://localhost:3132`
and frontend `.env.local` persistence=true/API4000 settings. This fixes the
observed reload logout through existing ADR-0018 cookie/refresh/bootstrap, not
Web Storage. Tactical V2 config, source changes and business data preserved;
retained RefreshSession migration was already applied. User logged in normally;
dashboard/library/103-minute-plan full reloads and new protected tab passed.
Focused backend18/frontend20 and fresh `ngcs_session_refresh_test_20261019_1442`
HTTP9 pass, all14 migrations only in the fresh test DB. Existing API replacement
was not killed when its PID changed; enabled4000 CORS/refresh verified. Default
env examples and production gates stay unchanged. Do not turn the local flags
off during unrelated dev restarts. Root Windows/CDSK limits remain BL-061.
[Evidence](docs/30-quality/SESSION_PERSISTENCE_LOCAL_2026-10-19.md).

Final session follow-up: Docker/API briefly stopped during concurrent local
development. Existing containers recovered; after database readiness, canonical
API4000 restarted as managed exec5918/PID25272 with both persistence and tactical
V2 enabled. Browser full reload recovered the103-minute plan without sign-in
even after the new API signing secret. No Docker reset, volume/database recreation
or business mutation. Final capture is `03-after-api-restart.png` in session QA.

Training catalogue UI/UX, 2026-10-19: same Matches/detail language requested.
Text heading/native register and full purpose disclosure replace hero/cards;
mobile stacks rows with 44px actions and short horizontal five-statistic strip.
Date/Today/reset use existing getTrainingDayPage, local midnight bounds and
invalid-date error; no client-only filtering. Keyed reads reset cursors and reject
stale responses while the input remains mounted. Upper/lower pagers share the
existing hook. Scope, server summaries/order, edit/delete confirmation/focus and
PLAYER remain. Actual 1440/1024/390/320 QA, full 491/491 in 59 files, final 33 focused,
typecheck/lint/format/build/Sites 4 pass. No writes by this slice; retain other
approved season/ready-drill work. No new ADR. Physical phone check remains useful.
[Evidence](docs/30-quality/TRAININGS_LIST_UX_2026-10-19.md).

Ready-drill responsive follow-up, 2026-10-19: retain real A Takım plan
`cmvf 5l 7tf 11wv 2yo 4g 19mx 9w 6`, 19 May 2027 16:00, 103min/six entries. Tablet added
senior-12 technical 26; mobile added senior-13 tactical 32. Do not repeat or reset.
Bounded read-only persistence assertions preserve original four rows/notes/boards,
source versions/age rows, linked day except duration 103/update timestamp, earlier
desktop 121-minute plan and other 2059 TrainingPlan row hash. Shared responsive CSS,
scrolling library filter Sheet and full selected-plan summary address measured
touch-size/overflow/truncated-date issues. Focused 19/19 and typegen/tsc/lint/format
pass; no new schema/API/auth/ADR change. Root gate still npm ENOENT,BL-061.
Chrome control timed out; IAB used normal user sign-in. Memory-only sessions are
lost by full reload; use SPA links in browser follow-up. Preserve concurrent UI
and whole-season edits. [Evidence](docs/30-quality/READY_DRILL_RESPONSIVE_BROWSER_2026-10-19.md).

Season program extension, 2026-10-19: explicit subsequent request covers the whole
2026-2027 season, including past weeks. BALANCED_WEEK_V 2 clips partial weeks and
uses fixture-free development/rest. Existing user edits and 10 applied team-weeks
preserved. Guarded operator preflights 41 weeks, then atomically applies each of 40
missing weeks; stable IDs/slot markers resume interruptions. Added 2009 plans / 8036
phases, 504 meetings, 1026 rest entries. Final 2060 plans / 8242 phases (old six-phase
edit retained), 3629 DayPlans / 410 WeekPlans and 36 identical matches. New private
before-season-program-20261019.dump restored to ngcs_season_program_restore_test;
all 1963 original rows across 44 tables preserved. Retained replay skips 410 slots,
changes none of 24413 rows. Backend 893 / HTTP 8 / operator 4, build/type/lint/format
pass; actual partial/end/break weeks and U 8/U 16 school-hour reads verified.
No frontend/schema/migration/global publication/flags changed by this extension.
Canonical API 4000 restarted (exec 10459), UI 3132 open on A Takım 26 October week.
No commit/push requested. ADR-0040 extension/runbook/quality evidence updated.
Root Windows/CDSK limitations remain BL-061. Saved plans require coach review if
fixtures subsequently change; no background rescheduler. Next: edit populated
example plans as needed; preserve slot markers rather than forcing reapplication.
[Evidence](docs/30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

Training detail UI/UX, 2026-10-19: user requested the same Matches language and
better mobile phases/board. Text heading, saved summary and shared tab panel
replace the photo hero. Numbered phase buttons select full notes/frozen content;
board entry and previous/next preserve lazy explicit reads and dirty guards.
Mobile 44px controls/16px selects, panel-fitting board and existing focus/scenes
verified at actual 390px; desktop 1440/tablet 1024 also pass. Focused 47/47,
full frontend 479/479 (59 files), typecheck, scoped lint/format and build/Sites 4
pass. The initial full run hit local memory limits; serial recovery passed. No retained data write; keep the separately approved attachments
and weekly-program data. No new ADR or infrastructure change.
[Evidence](docs/30-quality/TRAINING_DETAIL_UX_2026-10-19.md).

2026-10-19 retained browser acceptance: user authorized actual existing-plan
attachments. Plan `cmvf4syke000t2yx4u69iioue` (A Takım, 20 October 10:00) now has
121 minutes / 6 entries, including starter senior-04 warm-up 20 and senior-06
technical 26. These are retained real writes, not disposable fixtures; do not add
them again or reset the plan. Linked day 121 / Tuesday 166 verified. Old four
phase rows/notes/boards and other 50 plans unchanged. Actual UI preview/Escape,
duplicate exclusion, saved instructions and board/reopening passed. Concurrent
training UI changes temporarily interrupted Vite/login; recovered after the CSS
file arrived, without reverting others' work. No new ADR/runtime change.
[Evidence](docs/30-quality/READY_DRILL_RETAINED_BROWSER_2026-10-19.md).

Tactical UI/UX, 2026-10-19: user requested Matches-style catalogue/editor and
mobile pitch/scene improvements. Native scoped register, compact heading/back,
view disclosure and shared grid replace catalogue imagery/metrics/sidebar.
Properties follow playback/scenes in DOM; mobile starts collapsed, explicit
preference survives viewport changes. Focus mode scrolls workspace/footer,
shows the pitch and sits above navigation/below dialogs. No backend/schema/flag
or saved record changed by this slice. Pilot playback, scene add/cancel/undo
and view toggles return to saved state without Save. Full frontend 478/478,
final affected 44/44, typecheck, scoped lint/format, build and Sites 4/4 pass.
Desktop/tablet/mobile and combined visual QA pass. Chrome control/concurrent
backend restart interrupted QA; user signed into IAB to finish. Other local
publication/weekly data remains separate. Next: user review; physical touch
validation remains open. [Evidence](docs/30-quality/TACTICS_UX_2026-10-19.md).

Weekly club program,2026-10-19: user explicitly requested the complete plan.
Implemented unified chronological paginated calendar/manual events, age-specific
editable preview and atomic multi-team apply, preserving existing role/scope and
training lifecycle. Request+season-week audit markers prevent replay/duplicate
programs; stale schedules/overlaps fail without partial writes. Four real phases
and original team-age CLUB exercises per physical plan; no global publication,
accounts/grants, players, clinical data or measurement claims.
Approved retained week19–25 October now has51 plans/204 phases,13 meetings and26
rest entries (90 DayPlans/20 WeekPlans). Existing36 fixtures and14 protected-table
full-row digests preserved against restored backup. Only the exact weekly enum
migration applied after private backup/restore rehearsal; snapshot dependency had
already been independently rolled out. Retained14/current, schema diff empty.
Full890 backend/478 frontend/4 Sites pass; final targeted21 template/14 frontend
and7 PostgreSQL HTTP pass; type/lint/build and actual responsive browser flow pass.
Root Windows npm runner and external CDSK validator remain unavailable (BL-061).
Standard Prisma generation hit the known Windows locked-DLL copy issue; current
generated client/same-version engine passed all runtime/HTTP checks.
Canonical API4000 rebuilt/restarted;3132 week open on A Takım. Temporary4013/3135
QA services stopped. ADR-0040/CR-029/REQ-028/BL-063 and runbook/evidence updated.
Other chats' ready-content publication/ADR-0041 and tactical activation are preserved;
this task does not alter their approvals, flags or records. No commit/push requested.
Next: user can add/edit events or preview/apply next week's program. Multi-match
weeks remain manual; no automatic whole-season generation/resource allocation.
[Evidence](docs/30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).

Ready drill local rollout/publication, 2026-10-19: separate approvals executed.
Retained `ngcs_local_session_dev` has 120 starter PUBLISHED versions;
120 unique sources and 120 import audit events. Replay: 0 created / 120 skipped.
Private backup/restore and 38-table business preservation verified; original
two-scene CLUB V2 pilot unchanged. This operation applied no weekly migration;
the separate weekly task subsequently applied it (retained migration count now 14) and added plans/phases/club drills/calendar rows. Preserve those additions.
Final comparison confirms all 1,020 pre-publication rows match outside approved
publication fields; all 120 source contents and catalog checks still pass.
Existing compiled API/client already support the snapshot; no restart or flag
change. Publication permission and Fatih Çelebigil's named all-120 approval are
recorded; his account is also the import author. ADR-0041's one-package local
exception was explicitly accepted and executed by maintenance CLI. Exactly 360
transition audits record independentReview=false; runtime API guards unchanged.
Maintenance tests 10/10, new private backup/restore, 43-table preservation and
zero-write replay pass. Read-only compiled catalog/detail checks see all 120
across supported ages; U8 remains empty. No retained browser login claim.
Do not substitute synthetic approvals or create accounts/grants implicitly.
[Publication evidence](docs/30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

Controlled local tactical activation, 2026-10-19: user authorized the existing
V2 write gate locally. Ignored `apps/backend/.env` sets the exact flag true;
API 4000 runs compiled `dist/main.js` (no watch), UI 3132 remains available.
At that activation the database had 12 applied migrations; the later separately
approved ready-drill operation above brings it to 13. Private dump
and restore rehearsal precede changes. Pilot drill `cmvf3z4jd00012yxw62fpw3zf`
is synthetic, CLUB/A Takım, two scenes/5 seconds with one linear player move.
No pre-existing board was converted. Tests: 119 backend, 64 frontend, 18
dedicated HTTP pass. Rollback disables new writes while keeping V2 readers and
legacy overwrite protection. Production/sporting pilot and real touch hardware
remain open. See [activation evidence](docs/30-quality/TACTICAL_LOCAL_ROLLOUT_2026-10-19.md).

Ready drill planning is repository-verified and local migration/import is now
complete, including local publication through accepted ADR-0041. Future revisions
and production must use the ordinary independent-review workflow.
Do not treat disposable approvals as real review. See ADR-0039 and the latest
ready-drill local rollout evidence above.

Match detail UI/UX, 2026-10-19: user requested the selected Matches design
language and mobile adaptation. Compact heading/back link, one saved-data strip,
un-nested analysis/tactics panel, readable labels and mobile 44px controls
replace the photo/metric-card/duplicate-summary layout. Same explicit analysis
writes, scope keys, readonly roles, lazy token-bound board and dirty/conflict
guards. Focused 27 tests plus build/4 Sites/scoped lint/format pass. Desktop,
tablet and mobile analysis plus mobile pitch were inspected on the real route;
analysis draft survived tabs and was cleared without saving. Concurrent HMR
caused login resets; no retained record was edited. Full typecheck is currently
blocked by `add-drill-to-plan-dialog.tsx` accessing nonexistent catalog `total`.
Next: user reviews match detail; the separate drill work must close that gate.
[Evidence](docs/30-quality/MATCH_DETAIL_UX_2026-10-19.md).

Guided setup/branding, 2026-10-19: five-step /app/setup implemented with the
existing white design system, logo and two-color live preview; staff optional,
account invitations separate. SYSTEM_ADMIN-only atomic orchestration creates
canonical/legacy club/season/team and account-free staff; actor-bound durable
UUID replay/status survives reload/restart without new writes. See ADR-0037/0038
Accepted, CR-027/REQ-026/BL-060. Exact nullable two-color migration applied after
explicit user approval, private backup and successful restore rehearsal; retained
12-migration state preserves 1 club, 10 teams, 30 staff and 36 matches unchanged.
Dedicated HTTP 6, DTO 16, wizard/branding 17 and final full frontend 465 tests
pass; backend full 859 passed before concurrent plan changes. Browser QA uses
separate test DB/ports; canonical /app/setup left ready with no duplicate club.
Workspace type/lint/build evidence and Windows root quality/CDSK limitations
are recorded in the [verification](docs/30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).
Other active work owns plan contentSnapshot/ADR-0039 and its pending migration;
this task does not authorize/deploy it. No commit/push or production rollout.
Next: user reviews wizard; existing-club branding edit and general staff/account
linking remain separate increments, BL-061 tooling portability remains open.

Matches UX, 2026-10-19: user selected the third generated concept and requested
mobile adaptation. Implemented compact fixture table, persistent inline date
toolbar, responsive stacked rows and native note disclosure. API values,
synthetic labels, exact-day bounds, full totals, scope guards and cursor/retry
remain. Focused 14 tests, typecheck, scoped lint/format, build and 4 Sites tests
pass; full frontend run 464 passed/one tactical undo timeout, isolated rerun
passes. Chrome desktop/tablet/mobile checks passed after user restored login.
No API/schema/data/dependency change. External CDSK validator absent locally.
Next: user review of the responsive Matches screen; shared club-setup/branding
changes belong to the separate concurrent work. [Evidence](docs/30-quality/MATCHES_UX_EXPLORATION_2026-10-19.md).

Latest, 2026-10-19: user approved Spor Manage local setup, sourced 2026-2027
season bounds, U8–U16, sample fixtures and example staff. Guarded script applied
one club/ClubSeason, ten teams/legacy groups/seasons, thirty account-independent
staff assignments and thirty-six explicit sample senior matches. Real browser
shows correct workspace, nine academy teams and three U8 staff. Dedicated
PostgreSQL tests cover dry-run/no writes, complete setup/parity, unchanged replay
and late-conflict rollback; retained replay returned no creates. No access grants,
invitations, players, migration, flags or production change. Source/evidence and
runbook updated. At this fixture stage the product wizard was Proposed; its
subsequent approval and implementation are recorded in the latest entry above.

Windows startup, 2026-10-19: `33442ff` checked out on
`codex/mvp-stabilization`; main unchanged. User explicitly approved an empty
local database and first administrator bootstrap. Container `ngcs-postgres`,
volume `ngcs_windows_pgdata`, database `ngcs_local_session_dev`, loopback port
5433 are specific to this computer, not a restore of the other computer.
All 11 migrations applied, status current and live-schema diff empty; one
ACTIVE SYSTEM_ADMIN, no club/season/team seed. Password delivered only in chat.
Lockfile installs, Prisma generation, backend compilation (zero errors), HTTP
200 and browser login/dashboard smoke passed. Servers run in development on
3132/4000; persistent sessions and tactical V2 writes remain disabled. No code,
dependency, lockfile, ADR, production, commit or push change. Full quality was
not repeated for this startup; the external CDSK validator is absent locally.
Next: user signs in and chooses initial club/season/team setup or supplies a
backup if previous working data is required. See runbook for Windows commands.

Publication preparation: accumulated approved work is being committed/pushed on
`codex/mvp-stabilization` at the user's request (2026-10-19). Confirm the final
commit and upstream with Git, not a predicted hash in this document. `main`,
retained DB and V2 flag stay unchanged; publication is not production rollout.
Temporary CLI recordings and local environment files are excluded.
Fresh publication quality passed 2026-10-19: 843 backend / 446 frontend / 4 Sites,
typecheck/lint/format/build, 143 Markdown links, CDSK and whitespace; Node script
syntax checks passed. No package/lockfile version changes during installation.
Pre-commit root-ESLint routing is incompatible with workspace configs (BL-059).
Use the explicit root quality gate and script syntax checks as evidence; record
any command-scoped hook skip, without permanently disabling hooks.

Latest: BL-058e.4 combined repository acceptance passed. Actual route/API/PG
browser flow verifies whole JSON interchange, selected static PNG/SVG, explicit
phase snapshot and match persistence with independent tokens. Source edits do
not alter phase/match records or plan duration. Disposable HTTP 18/18; root
quality 843 backend / 446 frontend / 4 Sites; migration status/diff clean.
Three viewports and bounded 12-scene/1,500-element/50-undo observation recorded.
See [evidence](docs/30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).
BL-058/REQ-025 repository implementation accepted; retained rollout pending.
Do not activate the flag or convert actual records without separate approval.
Next is controlled rollout preparation/approval, not a new schema or automatic
data conversion. V2-aware reads/legacy guards must survive flag-off rollback.
Offline, video, 3D and representative professional-club acceptance remain TBD.

Previous: BL-058e.3 training phase integration implemented. Metadata stays
board-free; explicit phase opening uses document GET with additive phase
identity/origin. Save writes the full V1/V2 snapshot with the original token;
valid successful response advances the token without remounting the editor.
An uncertain response can be acknowledged without PUT only after an explicit
verification finds the identical persisted snapshot. Different server content
never supplies a force-overwrite token. Source authorization remains required.
HTTP 16/16, migration status/diff and three-viewport synthetic browser QA passed.
Root quality: 843 backend / 442 frontend / 4 Sites; all gates passed.
See [evidence](docs/30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).
Next e.4 combined integration/export acceptance. Retained V2 flag stays off;
no local data rollout is authorized by this integration completion.

Previous: BL-058e.2 drill route cutover implemented. Use board-free GET
`/drills/:id/tactical-editor`, then existing document GET. Atomic editor PUT
and create/copy POST preserve whole documents and authorize target/source in
one transaction. Tokens advance only on valid successful responses; no auto
retry. PLAYER/non-owner coach readonly; global immutable editorial stays V1.
HTTP 14/14, migration status/diff and three-viewport synthetic browser QA passed.
Root quality: 840 backend / 429 frontend / 4 Sites; all repository gates passed.
See [evidence](docs/30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).
Next e.3 training phase/snapshot, then e.4 combined integration/export QA.
Retained V2 flag stays off; do not claim rollout or enable without approval.

Previous: BL-058e.1 match route cutover implemented. Use board-free
`GET /matches/catalog/metadata/:matchId` with strict group/season scope, then
the document adapter on opening the board tab. `ResourceBoard` owns the token;
failed writes never refresh it or retry. Guard tab exit through editor.transition:
cancel retains, discard unmounts, Save-and-leave waits for success. Return reads
fresh persisted state. PLAYER cannot mutate analysis or board. No retained
flag/data change. [Evidence](docs/30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).
Next e.2 drill metadata/create/copy coordination (legacy GET rejects V2), then
e.3 training phase/snapshot integration and e.4 combined export/rollout gate.
Do not mark BL-058 complete or turn on retained V2 writes. Approved ADR-0036
already covers these integration steps; no new product/data-model decision.

Previous: BL-058d playback implemented in the opt-in shared editor; see the
[verification](docs/30-quality/TACTICAL_PLAYBACK_2026-09-26.md).
Root quality: 821 backend / 405 frontend / 4 Sites; all gates pass. Transport
uses elapsed monotonic time, not frame counts. Preview is read-only, explicit
static-scene return restores editing, and source documents stay unchanged.
15 new tests plus isolated real-Konva three-viewport QA cover the slice.
Next BL-058e actual resource/token/metadata integration, copy/snapshot/match/
export E2E and rollout gate. Existing routes remain V1; do not enable retained
V2 writes or claim the animation UI is live. No new ADR approval is needed
for the already accepted integration scope. An initial unexplained dirty QA
state did not recur in the clean replay; keep the report's caveat visible.

Previous: BL-058c opt-in shared scene editor implemented; see the
[verification](docs/30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).
Final root quality: 821 backend / 390 frontend / 4 Sites; all gates pass.
Full-document undo/dirty/save and three adapter clients are tested, including
conflict draft retention. Synthetic headed canvas QA passed at three sizes.
Existing route containers still use V1; new callback is `onSaveDocument`.
Do not enable retained V2 writes. Next BL-058d playback; BL-058e owns actual
resource/token loading and cross-route integration, metadata-reader compatibility,
disposable E2E and the separate rollout gate. No new ADR approval is needed.

Previous: BL-058b server compatibility is implemented; follow the
[verification](docs/30-quality/TACTICAL_V2_API_2026-09-19.md). New document APIs
use token/Serializable writes; legacy paths cannot overwrite or silently read
V2 as V1. The flag is off by default and retained settings were not changed.
Next BL-058c scene editor and token-aware explicit Save, then playback/UI QA.
Do not re-request ADR-0036 A–D approval or claim a visible animation UI yet.
Final quality: 821 backend, 369 frontend, 4 Sites; disposable HTTP 8/8 and
schema/status/diff passed. One Radix/jsdom teardown flake did not reproduce in
the 15-test focused run or final full quality run; retained records unchanged.

Previous foundation handoff (superseded by BL-058b above): ADR-0036 A–D explicitly Accepted. BL-058a validator/time foundation
implemented without wiring legacy controllers or editor. Mirrored pure cores
are compiled-parity-tested and share synthetic fixtures. Continue BL-058b
API/token/legacy guard before enabling V2 writes; c–e/UI still open. No retained
data change. Do not ask for the same A–D approval again or claim full animation.
Root quality passes: 788 backend, 369 frontend and 4 Sites tests.

Latest: increment 3 formation-slot name assignment implemented and verified in
isolated browser QA. Root quality passes 725/306/4. Next is scene/animation
contract design, not an unapproved extension to V1. Persistent identities,
offline and 3D remain open. No real records were mutated.

Latest follow-up: ADR-0035 increment 2 provides roster-name snapshots and unit
tools; no new persistent identity. Real Chrome read succeeded, but write QA
used isolated synthetic data. Continue with explicit contracts for persistent
roster binding/scenes rather than silently extending V1.

Latest slice: ADR-0035 / BL-057 2D tactical studio is implemented; refer to the
2026-09-19 verification report for gates and authenticated QA limitation.
Do not mark roster binding, animation, offline match-day or 3D complete.

- **Latest local credential operation (2026-09-08):** User explicitly approved
  creation/reset of administrator credentials. The guarded first-admin bootstrap
  created `system.admin@ngcs.local`; authenticated invitation/acceptance created
  `club.admin@ngcs.local` in the retained NGCS club. Both ACTIVE roles and real
  logins were verified, then all verification refresh sessions were revoked
  through lifecycle APIs (zero open sessions; authVersion 1). Passwords are not
  stored in repository/docs/log output and were disclosed only to the user. No
  existing-account promotion, migration, destructive seed/reset, production,
  commit or push. **Next:** user can sign in at frontend port 3132 and should
  rotate these temporary credentials after first use.

- **Latest access-management delivery (2026-09-08):** Added strict admin-only
  `GET /accounts` and `/app/settings/users`. SYSTEM_ADMIN can inspect platform or
  selected club; CLUB_ADMIN is server-forced to its own club; COACH/PLAYER are
  denied in controller, service, route and navigation layers. The page supports
  existing invite, role/access, suspend/reactivate, reset and session-revoke
  operations with explicit confirmations and one-time token handling. Technical
  and sporting permission matrices are visible; sporting capability grants are
  intentionally read-only. Quality: backend 676, frontend 273, Sites 4,
  disposable PostgreSQL HTTP E2E 21/21, build/CDSK/docs/whitespace and exact
  1440/1024/390 browser checks pass. No migration/dependency/retained-data,
  commit, push or deployment. **Next:** product gap audit, unless the user
  separately approves capability-grant administration.

- **Latest UI delivery (2026-09-08):** Players, Player 360, Squad and Attendance
  now use the approved white reference system. Photographic heroes, verified
  server/scope metrics, compact player/plan surfaces and responsive 3/2/1-column
  behavior were added without changing player search, cursor histories, dated
  assignment evidence, role visibility or attendance write safety. Twelve exact
  1536/1024/390 captures are retained; every 390px document matches its viewport
  and same-input QA has no actionable P0/P1/P2. Root quality passes with 657
  backend, 264 frontend and 4 Sites tests. No API/schema/business-data,
  migration, seed/reset, commit, push or deployment. **Next:** Settings.

- **Latest UI delivery (2026-09-08):** Week reference-system slice is complete.
  A shared raster hero, compact week controls and responsive seven-day cards now
  match the approved white shell. Local date boundaries, independent daily
  plan/match reads, totals, cursor histories, retries and stale-response rejection
  are unchanged. Exact 1672/1024/390 evidence passes same-input design QA; live
  next/previous navigation worked and runtime error capture was empty. No API,
  schema, business data, migration, seed/reset, commit, push or deployment. Root
  quality passes with 657 backend, 258 frontend and 4 Sites tests.
  **Next:** Trainings and training-detail page slice.

- **Latest UI delivery (2026-09-08):** Approved Matches reference is implemented
  with the shared raster hero, local-day filter and date-grouped match rows.
  Existing catalogue totals, cursor/retry/stale-scope/all-season/detail contracts
  are unchanged. Retained exact-size 1672/1024/390 browser evidence passes matched
  design QA; filter/clear worked and browser logs are empty. Root quality passes
  with 657 backend, 257 frontend and 4 Sites tests. No backend/schema/data,
  seed/reset/migration, commit, push or deployment. **Next:** Week page slice.

- **Latest UI delivery (2026-09-08):** Approved Teams reference is implemented
  with generated hero/category raster assets, API-backed cards and a semantic
  native table. Search debounce, stale responses, cursor paging, work-team
  selection and details are unchanged. Retained exact-size 1536/1024/390 browser
  evidence passes matched design QA; browser error logs are empty. Root quality
  passes with 657 backend, 256 frontend and 4 Sites tests. No backend, schema,
  business-data, seed/reset/migration, commit, push or deployment.
  **Next:** implement the approved Matches reference slice.

- **Latest UI correction (2026-09-08):** Approved Dashboard layout is implemented
  using existing API totals, a separately paginated local-day read and generated
  raster assets. Scope remounts reject stale reads; player count stays unavailable
  to PLAYER. Login/root/app index all target Dashboard. No backend/schema,
  business-data, seed/reset/migration, commit or push action in this slice.
  Targeted Dashboard/login tests pass (24); root quality passes with 657 backend,
  255 frontend and 4 Sites tests. Desktop/tablet/mobile and Sheet/focus were
  inspected. Durable screenshot export remains blocked; see the root QA report.
  Next is retained Dashboard QA evidence, not Teams until that gate passes.
  Prior missing-login/DB blockers below are
  historical: the local retained runtime and authenticated session are available.

- **Latest credential operation (2026-09-08):** Explicit user approval reset
  only the retained local `coach.local@ngcs.test` account in one serializable
  transaction. `COACH`, `ACTIVE` and club scope were preserved; `authVersion`
  advanced to 3, two open refresh sessions and zero reset tokens were revoked,
  and one token-free `PASSWORD_RESET_COMPLETED` operator audit was recorded.
  Hash and postconditions passed. Real in-app-browser login at canonical frontend
  port 3132 succeeded; `/app/week` loaded real workspace data and one new current
  refresh family exists. The generated password was returned only to the user and
  is absent from repository files. No migration, seed, role/club/business-data
  change, commit, push or deployment. **Next:** run the now-unblocked BL-048
  Dashboard visual comparison, then proceed to Teams.

- **Latest local operation (2026-09-08):** Frontend development and default
  browser E2E port were standardized on strict `3132`. Backend HTTP and Socket.IO
  allow that exact loopback origin through the shared origin resolver; persistent
  local startup uses `FRONTEND_ORIGIN=http://localhost:3132`. Frontend `3132` and
  backend `4000` are running against the retained `ngcs_local_session_dev` copy.
  Root quality passes with 657 backend and 246 frontend tests, both builds, four
  Sites tests, CDSK/docs/static gates; the live backend origin response passes.
  Database discovery was read-only and no migration, seed, reset or business-data
  write was initiated; normal runtime session maintenance may occur while the
  backend is active. No credential file, commit, push or deployment was made.
  The old reset invalidated browser sessions and its replacement password
  exists only with the user, so authenticated visual QA still requires that
  credential to be entered. **Next:** complete local sign-in, capture BL-048
  Dashboard at 1672×941/1024×900/390×844, then proceed to Teams.

- **Current visual delivery (2026-09-07, BL-048 slice 1):** The user approved
  the supplied Dashboard, Teams and Matches screenshots as the new visual truth.
  The first slice moves the shared application shell and Dashboard toward its
  compact white sidebar/topbar system, keeps only active routes, moves workspace
  selection to the topbar, adds existing route-search keyboard focus and uses a
  generated coach hero asset with real bounded dashboard reads. `PageHero`,
  `MetricCard` and `SectionCard` are reusable presentation components. No REST,
  schema, session, role, pagination or date behavior changed. Frontend typecheck,
  lint and 246 tests pass. The local runtime configuration was restored on
  2026-09-08 without a data write; authenticated comparison now awaits the
  user-held local coach password. [Design QA](design-qa.md).
  **Next:** complete sign-in, capture/compare the
  authenticated Dashboard at 1672×941 and 1024/390, close this visual gate, then
  start the Teams slice. No commit/push/deploy.

- **Latest engineering delivery (2026-09-07, BL-047 phase 5C):** Ortak,
  presentation-only FootballCard antrenman, maç, egzersiz kütüphanesi ve taktik
  kataloglarında default/board/match varyantlarıyla kullanılır. Mevcut detail/
  editor linkleri, tahtasız egzersizin linksiz kalması, global/kulüp rozeti,
  metadata/fallback metinleri, pagination/tam toplam ve izin davranışı değişmedi.
  Sekiz yalnız-kart legacy selector bloğu referans taraması sonrası kaldırıldı.
  Dört yeni test; 34 hedef test ve root quality 655 backend/245 frontend/dört
  Sites geçti. Gerçek koç oturumunda salt-okunur 1440/1024/390 QA tamamlandı;
  retained taktik fixture boş olduğu için pitch kartı görseli test kanıtıyla
  sınırlıdır. İlk sandbox build'i localhost bind `EPERM` ile durdu; izinli aynı
  build geçti. [Kanıt](docs/30-quality/UI_FOOTBALL_CARDS_2026-09-07.md).
  **Next:** Faz 6 Hafta modülü; yerel tarih gezinmesi, bağımsız plan/maç okumaları,
  tam toplamlar ve scope korunur. Faz 7–8 ve BL-043/044/009/M4 açık. Veri yazımı,
  API/schema/session/dependency değişikliği, commit/push/deploy yok.

- **Latest engineering delivery (2026-09-07, BL-047 phase 5B):** Compact
  OptionPagination, CatalogControls ve AssignmentCatalogSelect tarafından
  kullanılır. Group/label/live sayaç, ghost/sm/type=button korunur; 12px/600
  tipografi, tabular sayaç ve dar alanda sarma ortak sunumdadır. Workspace
  yalnız başarılı okumada cursor değiştirir; atama istenen sayfaya hemen geçer,
  hata olursa aynı sayfada retry eder. İki politika birleştirilmedi. Tek sayfalı
  workspace kontrolü gizli, atama kontrolü görünür kalır; pinned seçim korunur.
  15 yeni test; 39 hedef test ve quality 655 backend/241 frontend/dört Sites
  geçti. Eşleşen 1440/1024/390 görselleri ve Escape odak dönüşü doğrulandı.
  Genel kalite ve görsel kanıt için
  [rapor](docs/30-quality/UI_OPTION_PAGINATION_2026-09-07.md).
  **Next:** Faz 5C mevcut futbol kartlarını inceleyip ortak görsel desenlere
  geçir; antrenman/maç/drill anlamı, linkler, sayaçlar ve yetki davranışı korunur.
  Faz 5 bütünü, 6–8 ve BL-043/044/009/M4 açık. API/hook/session/schema/dependency/
  CSS silme veya gerçek veri yazımı yok; yeni ADR gerekmiyor.

- **Latest engineering delivery (2026-09-07, BL-047 phase 5A):** Ortak
  PagePagination ve EmptyState/LoadingState/ErrorState iki sportif dizine
  uygulandı. AssignmentPageControls aynı görsel sayfalama desenine bağlandı;
  takım kadrosu/Player 360 consumer'ları aynı cursor/tam toplam sözleşmesini
  korur. API çağrıları, 250 ms arama, scope reset, stale guard ve retry değişmedi.
  Dizinler yalnız gösterilen sayıyı, atamalar count/total değerini bildirir;
  error/loading sırasında yeni boş veri veya sahte toplam üretilmez.
  14 yeni test; 26 hedef test ve root quality 655 backend/226 frontend/dört
  Sites geçti. İki dizinde 1440/1024/390 karşılaştırma, mobil boş arama kontrolü
  yapıldı. Gerçek yazım/dependency/ADR/schema/session/CSS silme yok.
  [Kanıt](docs/30-quality/UI_DATA_PATTERNS_2026-09-07.md).
  **Next:** Faz 5B compact katalog/seçenek sayfalama sunumu; başarılı okuma
  sonrası cursor güncellemesi, pinned seçim, loading/error/retry sınırları korunur.
  Sonra futbol kartları; faz 5 bütünü, 6–8 ve BL-043/044/009/M4 açık.

- **Latest engineering delivery (2026-09-07, BL-047 phase 4B.2):** Sportif atama
  diyalogu ortak FormField, native semantiği koruyan NativeSelect, scoped footer
  ve yerel kısa ekran kaydırması kullanır. Submit handler, teknik rol UI ipucu,
  backend capability sınırı, sayfalı katalog/seçimin korunması, beş atama türü,
  UTC varsayılan gün ve 12:00Z payload değişmedi. Başlangıç required; mevcut
  min/max yoktur, eklenmedi. Hatalar toast ile bildirilir; değerler korunur,
  yeniden açma sıfırlar. Sezon seçici veya dirty guard eklenmedi.
  15 yeni regresyon; 24 hedef test, quality 655 backend/212 frontend ve dört
  Sites testi geçti. 1440/1024/390 eşleşen görseller ve 390×430 kısa ekran
  klavye erişimi doğrulandı; gerçek atama POST'u yok.
  [Kanıt](docs/30-quality/UI_ASSIGNMENT_DIALOG_2026-09-07.md).
  **Next:** Faz 5 ortak sayfalama/boş/yükleniyor/hata sunumu; cursor/tam toplam,
  retry ve izin davranışlarını koru. Faz 4 seçili hedefleri kapalı; geniş sayfa
  yayılımı ve faz 5–8, BL-043/044/009, M4 açık. Yeni ADR/dependency/API/session/
  migration/reset/commit/push/deploy yok; korunan diff hash aynı.

- **Latest engineering delivery (2026-09-07, BL-047 phase 4B.1):** Yeni plan
  diyalogu üç ortak FormField, FormError ve scoped footer tipografisi kullanır.
  Input/Textarea/Radix ve createPlan handler korunur; yeni required/min/max,
  Enter submit veya dirty confirmation eklenmedi. Mevcut title/date düğme
  koşulu, yerel tarih→ISO, raw başlık/not payload, create→reload→navigate sırası
  korunur. Yalnız bu DialogContent kısa ekranda sınırlı yükseklikle kaydırılır.
  Dokuz yeni test; hedef 15 test, root quality 655/197 ve dört Sites testi geçti.
  Eşleşen 1440/1024/390 görselleri, 390×430 iç kaydırma/klavye erişimi ve Escape
  odak dönüşü doğrulandı. Gerçek plan POST'u yok; korunan backend/API/session/
  workspace/package diff hash aynı. [Kanıt](docs/30-quality/UI_PLAN_DIALOG_2026-09-07.md).
  **Next:** Faz 4B.2 `player-detail.tsx` sportif atama diyalogu; mevcut capability,
  katalog seçimi, tarih/min/max, validation/busy/error/Escape/dirty kurallarını
  değiştirmeden ortak form düzeni. Geniş migration, faz 5–8, BL-043/044/009 ve
  M4 açık. Yeni ADR/dependency/migration/reset/commit/push/deploy yok.

- **Latest engineering delivery (2026-09-07, BL-047 phase 4A):** Login,
  accept-invitation ve reset-password gerçek shadcn Input/Button, ortak FormField,
  Alert tabanlı FormError ve PageActions kullanır. Required/type/autocomplete/
  minLength=12, parola eşleşmesi, token fragment temizleme, API payload, busy,
  retry ve yönlendirmeler korundu. OnSubmit/session/token kodu değişmedi.
  16 yeni test; iki hedef dosyada 18 test ve root quality 655/188, dört packaging
  testi geçti. Davet aynı boş/geçersiz durumla 1440/1024/390 önce-sonra; login
  aynı boyutlarda son görünüm, reset mobil ve klavye/native validation kontrolü.
  Login eski görüntüleri autofill kişisel veri içerdiği için tutulmadı; son
  görüntüler yalnız sentetik metinli. Gerçek login/reset/davet POST'u yok.
  Korunan backend/API/session/workspace/package diff hash aynı; yeni ADR,
  dependency/migration/reset/commit/push/deploy yok. [Kanıt](docs/30-quality/UI_ACCOUNT_FORMS_2026-09-07.md).
  **Next:** Faz 4B plan oluşturma diyalogu, sonra atama formları. Required/min/max,
  yerel tarihler, busy/error, başarılı kapanış ve Escape/focus-return/dirty
  davranışlarını koru. Bu 4A dilimi tüm faz 4 veya migration kapanışı değildir.
  Faz 4B–8, BL-043/044/009 ve M4 ayrı açık; WCAG/dark mode sertifikasyonu yok.

- **Latest engineering delivery (2026-09-07, BL-047 phase 3 pilot):** Ortak
  PageContainer/Header/Actions dashboard ve settings tarafından kullanılıyor.
  NGCS renkleri, başlık ölçüleri, responsive grid ve okunabilir 1080px genişlik
  korunur. Mobil kullanıcı menüsüne açık ad eklendi; yalnız ad/rol metni gizlenir,
  avatar görünür. PageActions native/asChild tipografi 14px/600; global reset yok.
  Sekiz yeni test; root quality 655 backend/172 frontend ve dört packaging testi
  geçti. İki sayfa 1440/1024/390, mobil menu keyboard/Escape/settings geçişi ve
  320px settings taşma kontrolü geçti. Canlı dashboard verisi iki çekim arasında
  1→2 antrenmana değişti; pixel-identical/data-freeze iddiası yok. Bu dilimde iş
  kaydı yazılmadı; protected backend/API/session/workspace/package diff hash aynı.
  Yeni ADR, dependency, API, migration, commit/push/deploy/reset yok.
  [Kanıt](docs/30-quality/UI_LAYOUT_PILOT_2026-09-07.md).
  **Next:** Faz 4 login/account-completion form pilotu, sonra plan oluşturma ve
  atama formları; validation/busy/error/dirty kurallarını koru. Diğer sayfalara
  layout yayılımı faz 6, kapsamlı shell/dirty QA ve uzun board overflow faz 6/8.
  Faz 4–8, BL-043/044/009, M4, WCAG ve dark-mode doğrulaması açık kalır.

- **Latest engineering delivery (2026-09-07, BL-047 phase 2):** İki test dosyasında
  12 yeni regresyon: Select controlled/form/disabled/ref/Escape, Dropdown klavye/
  tekil eylem/focus return, Tooltip klavye/pointer/Escape, ScrollArea çocukları,
  Card/Avatar/Separator ve gerçek Sonner render/konum/klavye kapatma/plain text.
  jsdom eksik API shim'leri test dosyasıyla sınırlı ve restore edilir; fiziksel
  scroll kanıtı değildir. Root quality 655/164 ve dört packaging testi geçti.
  Yerel 1024×900 dropdown, tooltip, bildirim, kategori Escape ve son araç Tab
  erişimi doğrulandı; iş kaydı/board öğesi oluşturulmadı. Runtime/CSS/API/DB/
  dependency değişmedi, protected diff hash aynı. UI fixture iç ScrollArea'da
  taşmadığı için uzun overflow listesi faz 6/8'de doğrulanacak. Typography/density
  mevcut değerlerle ölçüldü; native font:inherit ile asChild farklılığı tüketici
  bazlı faz 3/4 geçişine kaydedildi. Tam UI migration/WCAG/dark mode tamamlanmadı.
  [Kanıt](docs/30-quality/UI_PRIMITIVES_VERIFICATION_2026-09-07.md).
  **Next:** Faz 3 dashboard/settings PageContainer/Header/Actions pilotu ve mobil
  kullanıcı menüsü adı/görünürlüğü; API/scope/dirty kurallarını koru. Form alan
  aralıkları faz 4; BL-043/044/009 ve M4 ayrı açık. Yeni ADR gerekmedi. Dashboard
  açık ve geçici viewport kaldırıldı; commit/push/deploy/seed/reset yapılmadı.

- **Latest engineering delivery (2026-09-07, BL-047 phase 1):** UI brief'i
  mevcut React Router/shadcn yönünü koruyan sekiz aşamalı plana çevrildi; bu tüm
  frontend migration'ının bitişi değildir. 17 UI module / 2.727 başlangıç global
  CSS satırı envanteri; tokens.css, 33 legacy muted-text alias bağlantısı,
  13 primitive semantic surface ve aynı değerli shell/gutter/modal ölçü tokenları.
  İnaktif dark palet hazır; toggle veya tam dark mode yok. Dokuz yeni regresyon;
  root quality 655 backend/152 frontend, dört packaging testi ve build/lint/
  typecheck/format/CDSK/link/whitespace geçti. Dashboard 1440/1024/390 ve açık
  plan diyaloğu eşleşen önce/sonra karşılaştırıldı; modal/Sheet Escape ve focus
  return çalışıyor. Tüm sayfalar görsel denetlenmiş veya formal WCAG uyumlu sayılmaz.
  Yerel koç normal login ile doğrulandı; form kaydı, iş verisi yazımı, seed/reset/
  migration yok. Backend/API/session/workspace/dependency diff fingerprint aynı;
  önceki kullanıcı değişiklikleri korundu. Commit/push/deploy yok. Mevcut ADR-0011/
  0013 yeterli; yeni ADR gerekmedi. Yerel dashboard açık, viewport override kaldırıldı.
  [Plan](docs/20-execution/UI_MIGRATION_PLAN.md),
  [kanıt](docs/30-quality/UI_MIGRATION_FOUNDATION_2026-09-07.md).
  **Next:** Faz 2 kalan primitive etkileşim kapsamı ve type/density incelemesi;
  ardından dashboard/settings PageContainer/Header pilotu. Mobil kullanıcı menüsü
  erişilebilir adı/görünürlüğü faz 3, yeni-plan alan aralığı faz 4 açık bulgularıdır.
  BL-043/044/009 ve M4 bu UI teslimiyle kapanmaz; owner/pilot/production TBD kalır.

- **Latest local operation (2026-09-07):** Explicit user approval ile yalnız
  retained yerel koç hesabının parolası hedefli operator transaction'ında
  sıfırlandı; rol/status/club değiştirilmedi. AuthVersion bir artırıldı, bir
  açık refresh session iptal edildi; açık reset tokenı yoktu. Hash doğrulaması,
  sıfır açık session/reset ve iş verisi/diğer hesap fingerprint eşitliği aynı
  serializable transaction'da geçti. Tokensız approval/source audit eklendi;
  parola yalnız kullanıcıya verildi, repository/dosyaya yazılmadı. Bu yerel
  bakım production recovery veya admin-only API yetkisini genişletmez.
  Eski oturumla devam edilemez; kullanıcı yeni parolayla giriş yapmalı.
  API login bu operasyonda denenmedi; doğrulama hash/veri bütünlüğü kapsamındadır.
  Kod/şema değişmedi; sıradaki BL-044 karar planı aynı kalır.

- **Latest engineering delivery (2026-09-07, BL-045):** Ortak etiket helper'ı
  yalnız doğrulanmış `clubSeasonId='*'` için “Tüm sezonlar” gösterir. Yan menü,
  üst çubuk, Hafta, Genel Bakış ve Ayarlar düzeltildi; seçili ad ve gerçek eksik
  TBD korunur. Legacy sezon eksikliğine ClubSeason adı tahminî fallback yapılmaz.
  Altı helper + dört component regresyonu; focused 33, root 655/143 unit ve
  tüm kalite kapıları geçti. İlk build sandbox EPERM sonrası izinli tam rerun
  geçti. Yerel browser exact/all geçişleri ve 1280×720 görünüm doğrulandı;
  ayrı API/browser E2E ve migration bu frontend-only turda çalıştırılmadı.
  Kapalı dev server'lar 3001/4000'de mevcut ayarlarla yeniden başladı; yeni
  preview dashboard/orijinal all-seasons kapsamında açık bırakıldı. Retained
  fingerprint 24 tablo/25 satır aynı; iş yazımı/seed/reset/migration yok.
  Backend/şema/izin/dependencies aynı, stage/commit/push yok. Yeni ADR gerekmedi.
  [Kanıt](docs/30-quality/BL045_SEASON_LABELS_2026-09-07.md).
  **Next:** BL-044 safeguarding başta olmak üzere kalan karar girdilerini onaya
  hazır plana toplamak. BL-043 temsilî pilot owner/workload/ortam/bütçe TBD;
  BL-009 ve M4 ayrı. Politika, hukuki dayanak veya production onayı tahmin etme.
  ADR-0025 karar tablosundaki eski pending özeti BL-046 kanıtıyla düzeltildi.

- **Latest engineering delivery (2026-09-07, BL-043j):** Opt-in karma 5 GET/
  2 attendance POST ve ayrı SELECT EXPLAIN ölçümü üç temiz DB başlangıcında
  geçti. 30/300 oyuncu, 150/1500 planda 47 SQL olayı; plan sayacı tarama çıktısı
  150→1500 büyür. Bu benzersiz fiziksel satır/I/O veya production kapasitesi
  değildir. Son durum/tekillik, aynı kayda yarış ve yetkisiz yazma reddi geçti.
  Root kalite 655/133 unit; API 48 pass/3 opt-in skip. Üç DB'de altı migration/
  status/diff temiz, üç geçici DB kaldırıldı. Retained 24 tablo/25 satır aynı.
  Yalnız backend E2E testi ve belgeler değişti; runtime/frontend/şema aynı.
  Browser bu tur çalıştırılmadı; stage/commit/push yok. Yeni ADR gerekmedi.
  [Kanıt](docs/30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md).
  **Next:** BL-045 “Tüm sezonlar” etiketi ve regresyonu. BL-043 pilot kabulü
  açık: owner, temsilî veri/workload, ortam ve bütçeler TBD. Süreğen/kalıcı
  session ve geniş sportif yazım yükü bu sentetik ölçümle doğrulanmış sayılmaz.
  BL-044/009/M4 ayrı kapılar; yeni keyfî hacimlerden production SLO çıkarma.

- **Latest engineering delivery (2026-09-07, BL-046c):** Üç ayrı süreçte
  eşleşen geçerli 2/50-faz ölçümü geçti. 50 fazda legacy 996.545, metadata
  14.145, seçili tahta 9.895 byte; toplam %97,59 daha az JSON. Her GET 6 SQL
  olayı; metadata+tahta toplam 12 olduğundan sorgu azalması iddiası yok.
  Metadata 0, seçili tahta 1 JSON projection; seçilmeyen legacy büyümesi
  metadata/aktif belgeyi değiştirmez. Kaynak egzersizi değiştiren browser
  snapshot izolasyon regresyonu eklendi. Root kalite 655/133 unit, API
  48 pass/2 opt-in skip, Chromium 12/12; üç viewport görüldü, mobil iç scroll
  düzeni korunur. BL-046 Done, CR-017 implemented/verified; yeni ADR yok.
  [Kanıt](docs/30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).
  **Next:** BL-043 geniş read/write workload ve kontrollü DB row-work planı/
  ölçümü; gerçek pilot owner/hacim/donanım/bütçeleri TBD bırak. BL-045 etiket,
  BL-044 safeguarding, BL-009 sağlık politikası ve M4 ayrı açık. Yalnız test/
  belgeler değişti, runtime/şema/izin/dependencies aynı; retained veri korunur.
  Altı migration/status/diff temiz; disposable DB kaldırıldı. Retained iş
  parmak izi 24 tablo/25 satır aynı. Stage/commit/push yok; production kapasitesi
  veya SLO ilan etme.

- **Latest engineering delivery (2026-09-07, BL-046b):** Antrenman detayı
  tam hafif faz metadata ve açık “Tahtayı aç” GET'ine geçti; eski editor
  runtime çağrısı, eager JSON tarama ve otomatik fallback yok. Tek aktif draft,
  phase/tab/route/workspace save-discard-cancel, geç yanıt reddi, ilk snapshot
  kaydında history ve 50 undo korunur. Belirsiz PUT tekrarlanmaz; kullanıcı
  GET ile doğrular, eşleşen snapshot ikinci PUT olmadan onaylanabilir.
  Taktik egzersizi ilk kaydında erken remount/yönlendirme regresyonu düzeltildi.
  Root kalite 655/133 unit; browser 12/12, API 48 pass/1 opt-in skip; üç viewport
  kontrol edildi. Altı migration/status/diff temiz, disposable DB kaldırıldı;
  retained parmak izi 24 tablo/25 satır aynı.
  390px tahta mevcut iç yatay kaydırma düzenini kullanır; full-fit iddiası yok.
  [Kanıt](docs/30-quality/BL046_EDITOR_FRONTEND_CUTOVER_2026-09-07.md).
  **Next:** Onaylı BL-046c matched 2/50 geçerli tahta ölçümü ve son regresyon;
  tekrar onay isteme. BL-046 ölçüm tamamlanmadan kapatılmaz. Backend/şema/
  dependencies değişmedi; retained veri korunur. SLO/owner TBD, BL-043 geniş
  workload ve BL-044/045/M4 açık; stage/commit/push yok.

- **Latest engineering delivery (2026-09-07, BL-046a):** ADR-0025 Option A,
  açık uygulama sorusuna verilen devam talebiyle Accepted; CR-017 Approved.
  Tam scalar faz metadata ve seçili effective board GET'leri, bounded ID/query
  doğrulaması, plan/source yetkisi ve JSON null-aware snapshot önceliği hazır.
  Bozuk JSON dışarı verilmez; eski GET/POST/PUT aynıdır. 43 yeni unit/8 yeni
  HTTP; root quality 655 backend/115 frontend, tam API 48 pass + 1 opt-in skip.
  Build'in sandbox loopback EPERM engeli izinli aynı tam kapıyla geçti.
  Altı migration/status/diff disposable DB'de temiz; test DB kaldırıldı.
  Retained iş parmak izi 24 tablo/25 satır aynı; reset/seed/migration yok.
  Yerel root 200, yeni anonim GET 401, frontend 200. Browser E2E yeniden
  çalıştırılmadı; frontend kodu/eski sözleşmesi değişmedi. 100 Markdown/yerel
  bağlantı, CDSK ve diff geçti. Commit/push yok.
  [Kanıt](docs/30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md).
  **Next:** BL-046b frontend metadata/one-board geçişi, explicit-open ve
  dirty save-discard-cancel/history korunması; sonra c matched 2/50 ölçüm,
  browser E2E/üç viewport. Eski editor frontend'de henüz kaldırılmadı; ilk yük
  küçüldü deme. Phase cap/write optimizasyonu yok; SLO/owner TBD; BL-043 geniş
  workload, BL-044/045 ve M4 açık. Onaylanan b/c için tekrar onay isteme.

- **Latest design delivery (2026-09-07, BL-046):**
  [ADR-0025](docs/50-decisions/ADR-0025-on-demand-training-editor-boards.md)
  Proposed; [tasarım](docs/10-architecture/BL046_EDITOR_READ_DESIGN.md) hazır.
  Tam hafif faz metadata + yalnız açılan effective board önerildi. Snapshot
  önceliği/invalid state, yeni GET kaynak yetkisi, tam ID/order bilgisi, mevcut
  POST/PUT, dirty save-discard-cancel ve ilk kayıtta undo korunması tanımlandı.
  Yeni API/UX/güvenlik etkisi açık onay bekler; kabul edilmiş gibi kodlama yapma.
  Onay sonrası sıra: BL-046a backend → b frontend → c izole ölçüm/tam QA.
  Bu teslim yalnız belge: uygulama/şema/DB değişmedi; unit/E2E tekrar edilmedi.
  99 Markdown/yerel bağlantı, CDSK ve diff kontrolleri geçti. Retained DB
  reset/seed/migration yok; stage/commit/push yok. SLO/owner TBD; BL-043 geniş
  workload, BL-044/045 ve M4 açık. Faz limiti veya write-payload optimizasyonu
  bu önerinin kapsamında değil.

- **Latest engineering delivery (2026-09-07, BL-043i):** Opt-in karma GET
  ölçümü üç süreçte geçti: 30/300 oyuncu, 1/3 beşli okuma grubu; grup başına
  36 sorgu ve yaklaşık 16 KB. Test eşikleri production bütçesi değildir.
  Editor 2/50 fazda 34.394/853.304 byte, altı sorgu: BL-046/CR-017 on-demand
  okuma tasarımı Proposed; uygulama ve yeni limit onaylanmadı. Root kalite
  612 backend/115 frontend unit, normal API 40 pass + 1 opt-in skip; browser
  yeniden çalıştırılmadı, runtime/UI/şema değişmedi. Altı migration/diff temiz,
  sentetik DB kaldırıldı; retained fingerprint aynı (24 tablo/25 satır).
  97 Markdown/CDSK geçti. Sonraki güvenli iş BL-046 tasarım/etki analizi;
  kapsamlı read/write pilot, owner/hacim/SLO ve BL-044/045/M4 açık kalır.
  [Doğrulama](docs/30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043h.2):** Plan yetkisinden
  grup/self kapsamı türeten sayfalı yoklama ve tam sayaçlar eklendi. Editor
  plan/drill grafiğini korur, tüm attendance/grup üyelerini taşımaz. Ortak son
  members fetch/state kaldırıldı. Açık tekli yazım, aynı sayfa yeniden okuma,
  hata/boş/scope reset ve PLAYER read-only self görünümü doğrulandı.
  Şema/migration/yazma yetkisi değişmedi; yeni ADR yok. Root kalite 612 backend/
  115 frontend unit ve 40 API E2E geçti. Sırada BL-043 karma kullanım ölçümü ve
  sorgu/payload bütçesi var; owner/hacim/SLO TBD, BL-044/045/M4 ayrı açık kalır.
  Final Chromium 12/12 ve üç viewport geçti. Disposable altı migration/diff
  temiz; sentetik DB kaldırıldı. Retained fingerprint aynı (24 tablo/25 satır),
  yerel katılım 0/2 salt okunur doğrulandı. 96 Markdown/CDSK geçti.
  [Doğrulama](docs/30-quality/BL043_ATTENDANCE_MEMBER_CUTOVER_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043h.1):** JWT/mevcut grup-rol
  yetkili player membership sayfası, minimal projection ve cursor öncesi tam
  toplam eklendi. Kadro 25'lik sayfalar, bağımsız retry ve scope reset; Genel
  Bakış limit=1/tam oyuncu toplamı kullanır. PLAYER yetkisi genişletilmedi.
  Güncel legacy PLAYER üyeliğidir; tarihli sportif kadro veya yeni status
  filtresi değildir. Antrenman detayındaki yoklama bağımlılığı saptandı; shared
  members/full fetch bu nedenle korunur. Sırada h.2 bu tüketicinin ayrılması ve
  ardından ortak listenin kaldırılması var. Şema/migration/yazma/izin değişmedi.
  Root kalite 597 backend/109 frontend unit, 40 API ve 12 Chromium E2E geçti.
  Üç viewport doğrulandı; altı migration/diff temiz, sentetik DB kaldırıldı.
  Retained fingerprint aynı (24 tablo/25 satır), yerel Kadro/dashboard toplamı
  2 doğrulandı. 95 Markdown/CDSK geçti; pilot owner/hacim/SLO TBD, BL-044/045/M4 açık.
  [Doğrulama](docs/30-quality/BL043_MEMBER_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.5):** Tekil scope-bound
  match detail GET ve maç içermeyen legacy-metadata GET eklendi; eski tam liste
  sözleşmeleri korunur. Frontend ortak matches state/fetch kaldırıldı; detay
  ayrı retry/draft, shell limit=1/tam toplam kullanır. Scope/ID reset ve geç
  yanıt reddi hazır; şema, yazma ve izin politikası değişmedi.
  Root kalite 581 backend/104 frontend unit ve 39 API E2E geçti.
  Chromium E2E 11/11 ve üç viewport geçti; yerel maç analizi/notları salt okunur
  doğrulandı. Disposable migration/diff temiz, test DB kaldırıldı. Retained
  fingerprint değişmedi (24 tablo/25 satır); 94 Markdown/CDSK/bağlantılar geçti.
  Sonraki iş BL-043 üye listesi ve Kadro/dashboard tüketicileri; pilot owner/
  hacim/SLO TBD, BL-044/045/M4 açık. Yeni ADR yok.
  [Doğrulama](docs/30-quality/BL043_MATCH_CUTOVER_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.4):** Hafta maçları yerel
  günlük [from, until) sınırlarıyla bağımsız limit=25 okumalarına geçti; tam
  toplam, ayrı sayfalama/retry, scope/hafta reset ve geç yanıt reddi hazır.
  Boş gün mesajı iki kaynağın doğrulanmış sıfır toplamını bekler; eksik seçili
  sezon kapsamı genişletmez. Root kalite, 571 backend/98 frontend unit ve
  39 API E2E geçti; New York 23 saatlik DST günü dahil 12 odaklı test geçti.
  Final Chromium E2E 11/11 geçti; 30 maçta 25+5 sayfa, detay ve üç viewport
  doğrulandı. Disposable migration/diff temiz; test DB kaldırıldı. Retained
  fingerprint aynı (24 tablo/25 satır); yerel Hafta salt okunur doğrulandı.
  Yeni şema/API/izin/ADR değişikliği yok. Önceki tüketici özetinin atladığı
  shell bildirim sayacı da shared matches kullanıyor. Sırada BL-043g.5 maç
  detayı ve minimal shell sayacı; ikisi ayrılmadan tam shared fetch'i kaldırma.
  Üye/pilot owner/SLO TBD, BL-044/045/M4 açık kalır.
  [Doğrulama](docs/30-quality/BL043_WEEK_MATCH_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.3):** Genel Bakış maç
  özeti mevcut API limit=3/no-cursor kullanır; ilk üç kronolojik kayıt ve tam
  toplam korunur, yeni future-only filtresi yoktur. Scalar hasBoard kartları,
  bağımsız yüklenme/hata/retry, scope reset ve eksik seçili sezonda kapsamı
  genişletmeme doğrulandı. Root kalite, 571 backend/93 frontend unit ve 39 API/
  11 Chromium E2E geçti. 31 maçta 3/31, rozetler, detay ve üç viewport test edildi.
  Disposable migration/diff temiz; test DB kaldırıldı, retained fingerprint aynı
  (24 tablo/25 satır); yerel Genel Bakış 1/1. Backend/API/şema/izin değişmedi.
  Sırada BL-043g.4 Hafta maç okumaları, sonra bağımsız detay; ikisi ayrılmadan
  shared matches/legacyContext tam listesini kaldırma. Üye/pilot owner/SLO TBD,
  BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_DASHBOARD_MATCH_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.2):** Maçlar shared matches
  yerine 25'lik scalar API sayfaları ve tam total kullanır. shadcn/amber kartlar,
  hasBoard, detay bağlantıları korunur; scope reset/geç yanıt reddi, ayrı retry
  ve boş devam sayfası hazır. Eksik seçili sezon tüm sezonlara genişletilmez.
  Root kalite, 571 backend/89 frontend unit, 39 API/11 Chromium E2E geçti;
  31 maçta 25+6, ikinci sayfa detay ve 1440/1024/390 px kontrolleri doğrulandı.
  Disposable migration/diff temiz; test DB kaldırıldı, retained fingerprint aynı
  (24 tablo/25 satır). Yerel Maçlar 1/1 kaydı gösteriyor. Backend sözleşmesi,
  şema/izin değişmedi. Sırada BL-043g.3 Genel Bakış maç okumaları, sonra Hafta
  ve bağımsız detay; üç tüketici ayrılmadan shared matches'i kaldırma.
  Üye/pilot owner/SLO TBD, BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_MATCH_CATALOG_UI_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043g.1):** JWT/grup kapsamlı
  GET /matches/catalog/page; optional seasonId, 25/max100 kayıt, tarih/ID cursor,
  yarı açık yerel dönem filtresi ve tam total doğrulandı. Scalar kartlar/hasBoard
  JSON indirmez; yetki sezonun kulüp/grup sahipliğine bağlı kalır. Root kalite,
  571 backend/84 frontend unit ve 39 API E2E geçti. Disposable migration/diff
  temiz; test DB kaldırıldı, retained fingerprint aynı (24 tablo/25 satır).
  Şema/migration/izin ve frontend değişmedi; browser E2E bu dilimde çalıştırılmadı.
  Sırada BL-043g.2 Maçlar ekranı var. Genel Bakış/Hafta/detay da ayrılmadan
  legacyContext/provider matches dizisini kaldırma veya ilk sayfayla değiştirme.
  Üye/pilot owner/SLO TBD, BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_MATCH_READ_FOUNDATION_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043f.4):** Antrenman detayında
  planın grubuna bağlı 25'lik minimal egzersiz seçenekleri, sayfa dışı seçim,
  attached-ID filtresi ve yüklenme/hata/retry hazır. Dört tüketici ayrıldığı
  için provider'ın tam drills fetch/state'i kaldırıldı. Ekleme eski replacement
  PUT yerine mevcut tekli POST kullanır; ikinci eklemede mevcut snapshot/row ID
  korunur. POST sonrası GET hatası yalnız okuma retry'si sunar. Root kalite,
  538 backend/84 frontend unit, 38 API/11 Chromium E2E geçti. Disposable
  migration/diff temiz; test DB kaldırıldı. Retained fingerprint aynı
  (24 tablo/25 satır); yerel 75 dk/4 faz demo detayında salt okunur kontrol yapıldı.
  Backend/API sözleşmesi, şema ve izin politikası değişmedi. Sırada maç/üye
  okumaları ve pilot kapasite var; owner/SLO TBD, BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_DRILL_CUTOVER_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043f.3):** Taktik Tahtası ortak
  drills dizisinden ayrıldı; mevcut catalog/page optional kind=tactical-board
  filtresini page/count öncesinde uygular. Kategori ile tahta türü karıştırılmaz,
  tahta JSON'u kartlara taşınmaz. 25'lik sayfalar, tam toplam, scope reset/geç
  yanıt reddi, retry ve boş devam sayfasından dönüş hazır. Root kalite,
  538 backend/78 frontend unit, 38 API/11 Chromium E2E geçti. Browser 30 tahtayı
  25+5 sayfayla ve ikinci sayfa editör bağlantısıyla doğruladı. Disposable
  migration/diff temiz; test DB kaldırıldı. Retained fingerprint aynı
  (24 tablo/25 satır); yerel Taktik Tahtası gerçek sıfır durumunu gösteriyor.
  İlk API ölçek koşusu timeout/ECONNRESET aldı;
  aynı paket değişiklik yapılmadan tekrar geçti. Şema/migration/izin değişmedi.
  Sırada antrenman detayında sayfalı egzersiz seçenekleri ve sonra ortak drills
  fetch/state kaldırılması var. Seçimi/fazları kıracak kısmi dizi ikamesi yapma.
  Maç/üye ve pilot owner/SLO TBD, BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_TACTICS_PAGINATION_2026-09-07.md).

- **Latest engineering delivery (2026-09-07, BL-043f.2):** Genel Bakış egzersiz
  sayacı ortak drills dizisinden ayrıldı. Mevcut catalog/page limit=1 çağrısının
  tam total alanını kullanır; tek kart sayısını toplam sanmaz ve JSON taşımaz.
  Scope reset/geç yanıt reddi, gerçek sıfır ile yüklenme/hata ayrımı ve bağımsız
  retry doğrulandı. Root kalite, 532 backend/73 frontend unit ve 38 API/11 Chromium
  E2E geçti. Browser toplam 35→36 yeni egzersiz sonrası yenilemeyi doğruladı.
  Disposable migration/diff temiz; test DB kaldırıldı. Retained fingerprint aynı
  (24 tablo/25 satır); yerel Genel Bakış 5 egzersiz gösterir. Backend/API/şema/izin
  değişikliği yok. Sırada sunucu board-kind filtresiyle taktik kataloğu, ardından
  antrenman egzersiz seçenekleri var. Bunlar ayrılmadan ortak drills/full GET'i
  kaldırma veya ilk sayfayla değiştirme. Diğer maç/üye okumaları, pilot owner/SLO
  TBD ve BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_DASHBOARD_DRILL_READS_2026-09-07.md).

- **Latest engineering delivery (2026-09-06, BL-043f.1):** Egzersiz Kütüphanesi
  bağımsız 25'lik sayfalar, sunucu kategori filtresi ve tam toplamlar kullanır.
  Additive /drills/catalog/page mevcut grup/rol görünürlüğünü ve grup metadata'sından
  gelen yaş filtresini korur. Kartlar tahta JSON'u taşımaz; isBoard yalnız dönen
  kimliklerden hesaplanır. Scope/kategori reset, geç yanıt reddi ve retry hazır.
  532 backend/70 frontend unit, 38 API/11 Chromium E2E ve root kalite geçti.
  Disposable migration/diff temiz; test DB kaldırıldı. Retained fingerprint
  aynı (24 tablo/25 satır); yerel kütüphane 5/5 egzersiz gösterir.
  Sırada dashboard tam egzersiz sayaçları, taktik kataloğu ve antrenman egzersiz
  seçenekleri var; bu tüketiciler ayrılmadan ortak drills dizisini kaldırma veya
  ilk sayfayla değiştirme. Ardından maç/üye okumaları ve pilot sorgu bütçeleri.
  Şema/migration/dependency/izin değişikliği yok. Pilot owner/SLO TBD;
  BL-043 devam ediyor, BL-044/045 ve M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_DRILL_LIBRARY_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.5):** Yoklama bağımsız
  25'lik catalog/attendance/page okumalarına geçti. Plan başına PRESENT sayısı,
  tam plan/katılım ve güncel oyuncu toplamı sunucudan gelir; PLAYER yalnız kendisi.
  Mevcut tenant/sezon/draft/period ve atomik işaretleme sınırları korundu.
  WorkspaceProvider tam plan fetch/state'i kaldırıldı; eski REST liste ucu ve
  detay/yazım uçları korundu. Drill ekleme → sayfalı katalog yeni toplam regresyonu
  ve provider'ın tam listeyi çağırmama kontrolü geçti. 508 backend/65 frontend
  unit, 37 API/11 Chromium E2E ve root kalite geçti. Katılım yazımı → Yoklama/
  Genel Bakış yenilenmesi ve sıfır full-list GET tarayıcıda doğrulandı.
  Disposable migration/diff temiz; test DB kaldırıldı. Retained fingerprint
  aynı (24 tablo/25 satır); yerel Yoklama 1 plan/2 oyuncu/0 katılım gösteriyor.
  Sırada egzersiz kütüphanesi bounded read/tam toplamlar; ardından maç/üye
  tüketicileri ve pilot sorgu bütçeleri. Shared drill/member dizilerini ilk
  sayfayla değiştirme. Pilot owner/SLO TBD, BL-044/045 ve M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_ATTENDANCE_CUTOVER_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.4):** Hafta ekranı ortak
  plans dizisini okumaz; yerel gün sınırlarında bağımsız 25'lik sayfalar ve tam
  günlük plan/süre toplamlarını kullanır. Catalog API'ye paired from/until
  filtresi eklendi: half-open, en fazla sekiz gün, mevcut sezon/grup sınırıyla
  kesişir. Şema/migration/izin politikası aynı. Tarihsiz taslaklar katalogda;
  stale/reset/retry, gün sayfalaması ve URL scope koruması test edildi.
  504 backend/60 frontend unit, 36 API/11 Chromium E2E ve root kalite geçti.
  Disposable migration/diff temiz; test DB kaldırıldı. Retained iş verisi aynı
  (24 tablo/25 satır); yerelde 7 Eylül 18:00, 1 plan/75 dk doğrulandı.
  Sırada yoklama bounded read/tam oyuncu toplamları var. Yoklama ve mutation
  refresh senaryoları geçmeden provider'ın tam plan okumasını kaldırma.
  Maç/egzersiz/üye kaynakları, pilot owner/SLO TBD ve BL-044/045/M4 ayrı kalır.
  [Doğrulama](docs/30-quality/BL043_WEEK_READS_2026-09-06.md).

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
  [Güncel doğrulama](docs/30-quality/BL043_DASHBOARD_TRAINING_READS_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.2):** Antrenmanlar ekranı
  typed catalog client ile bağımsız 25'lik sayfalar ve tam sunucu toplamlarını
  kullanır. Scope değişiminde reset, eski yanıtı yok sayma, hata/retry, tarihsiz
  taslak ve boş devam sayfası ayrımı; create hatasını gösterme eklendi.
  Workspace'in tam plan listesi dashboard/hafta/yoklama için korunur; bu dilim
  tüm shared okuma maliyetini kaldırmaz. Sırada bu üç tüketiciyi tam counter,
  recent-plan, dönem/gün ve yoklama özetlerine geçirmek; ancak sonra shared
  full read kaldırılır. API/şema/migration/dependency/izin politikası değişmedi.
  492 backend/50 frontend unit, 35 API/11 Chromium E2E ve root kalite geçti.
  Retained fingerprint aynı (24 tablo/25 satır); yerel 75 dk/dört fazlı plan
  doğrulandı, Antrenmanlar açık bırakıldı. Yeni veri yazımı yapılmadı.
  [Güncel doğrulama](docs/30-quality/BL043_TRAINING_CATALOG_UI_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043e.1):** Additive
  `/training-plans/catalog/page` ile date/null/ID keyset, minimal plan kayıtları
  ve sayfadan bağımsız tam plan/süre/PRESENT toplamları tamamlandı. Grup/tenant,
  sezon/taslak ve PLAYER self-attendance sınırları korunur. EXPLAIN bulgusuyla
  faz sayımı yalnız dönen plan kimliklerine indirildi; yeni indeks/migration yok.
  492 backend/44 frontend unit, 35 API E2E ve root kalite geçti. Yerel ölçüm
  25 kayıt için 5.416 bayt/8 SQL; pilot SLO değildir. Frontend kaynakları ve eski
  API'ler değişmedi, browser E2E bu backend diliminde tekrar çalıştırılmadı.
  Sonraki adım antrenman sayfa state'i ve ortak dashboard/hafta/yoklama özet
  sözleşmelerini geçirmek; tüm tüketiciler hazır olmadan shared tam plan listesini
  sayfayla değiştirme. Egzersiz/maç/üye listeleri, pilot owner/hedef TBD ve
  BL-044/045/M4 ayrı kalır. [Kanıt](docs/30-quality/BL043_TRAINING_READ_FOUNDATION_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043d):** Shell tüm grup/sezon
  metadata dizileri yerine seçili, bağımsız legacy üyelik kontrolü yapan bağlam
  ucunu kullanır. Tüm sezon maçları kesilmeden tek relational sorguda döner.
  Atama diyaloğu yalnız açıldığında 25'lik takım/PLAYER rol sayfaları yükler;
  sayfa dışı seçim korunur, açık seçim gerekir ve yeniden açılışta sıfırlanır.
  468 backend/44 frontend unit, 33 API/10 Chromium E2E ve root kalite geçti.
  Mevcut altı migration güncel, diff boş; yeni şema/migration/dependency veya
  retained iş verisi yazımı yok. Geçici DB kaldırıldı; 24 tablo/25 satır retained
  fingerprint aynı. Yerel Player 360 açık; atama diyaloğu kayıtsız kontrol edildi.
  Sırada iş kaydı listeleri için tam toplamları koruyan sayfa/aggregate kapsamı ve
  sorgu planları; BL-043 pilot owner/hedef TBD, BL-044/045 ve M4 ayrı kalır.
  [Dilim kanıtı](docs/30-quality/BL043_LEGACY_METADATA_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043c):** Tarihli kadro ve Player
  360 atama geçmişi için additive sayfalı uçlar; validFrom/ID cursor, full count,
  tarih/kaynak değişiminde reset, retry ve eski yanıtı yok sayma eklendi. Önceki
  array API'ler korunur. Person yetkisi aynı politikayla relational EXISTS kullanır;
  mevcut grant geçmiş tarihte de yeniden denetlenir. 456 backend/41 frontend unit,
  32 API/9 Chromium E2E ve root kalite geçti. Yeni şema/migration/dependency veya retained iş
  verisi yazımı yok. Sırada BL-043d legacy metadata ve atama diyaloğu seçenekleri;
  pilot hedef/owner, BL-044/045 ve M4 kapıları açık.
  [Dilim kanıtı](docs/30-quality/BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043b):** Takımlar ekranına
  sunucu araması/sayfalama; shell'e bounded kulüp/sezon/takım katalogları ve
  sayfadan bağımsız seçim çözümleyicisi eklendi. Eski array API'ler korundu.
  Aktif seçim sayfa dışında tutulur; katalog gezinmesi scope değiştirmez;
  açık seçim mevcut dirty-navigation guard'ından geçer. 432 backend/35 frontend
  unit, 31 API ve 8 Chromium E2E/root kalite geçti. Şema/migration/dependency ve retained
  iş verisi değişmedi. Sırada BL-043c tarihli kadro/Player 360 atama geçmişi;
  legacy metadata/diyalog seçenekleri ve pilot hedef/owner hâlâ açık.
  [Katalog kanıtı ve sınırlar](docs/30-quality/BL043_WORKSPACE_CATALOGS_2026-09-06.md).

- **Latest engineering delivery (2026-09-06, BL-043a):** Oyuncu listesi için
  additive `/sporting/players/page`, bounded ID-keyset, sunucu araması ve güncel
  team/capability/self filtreleri eklendi; eski array API korundu. UI 25 kayıtlık
  sayfa, önceki/sonraki, retry ve scope değişiminde sıfırlama kullanır. İzole
  1.000 oyuncu/3.000 atama testinde sayfa bütünlüğü ve negatif yetkiler geçti;
  416 backend/30 frontend unit, 30 API/7 Chromium ve root kalite doğrulandı.
  Şema/migration/dependency veya korunan iş verisi değişmedi. BL-043 kısmen açık:
  sırada takım/workspace listesi, ardından roster/Player 360 history sayfalaması.
  Pilot kapasite, SLO ve owner TBD; BL-044/M4 kapıları korunur.
  [Kanıt ve sınırlar](docs/30-quality/BL043_PLAYER_PAGINATION_2026-09-06.md).

- **Latest local delivery (2026-09-06):** Kontrollü P0.1 yerel rollout tamamlandı.
  Özel yedek ayrı DB'ye restore edildi; iki migration önce provada, sonra yalnız
  `ngcs_local_session_dev` üzerinde geçti. 26 legacy tablo/83 kayıt fingerprint'i
  korundu; altı migration güncel, diff boş, iki kulüp IN_SYNC. Dev server'lar
  3001/4000 açık; mevcut session, scope/reload, takım/Player 360, 75 dk plan ve
  maç notları browser'da geçti. Prova DB kaldırıldı, yedek saklandı; reset/seed,
  parola veya production değişikliği yok. Sırada BL-043 pagination/ölçüm;
  M4 ve BL-044 onay kapıları korunur.
  [Operasyon kanıtı](docs/30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).

- **Latest engineering delivery (2026-09-06):** BL-042/P0.1b tamamlandı. Legacy
  group/member/season yazımı ile sportif projection aynı transaction'dadır;
  invitation acceptance Person/profile oluşturur. Üyelik kaldırma geçmişi kapatır,
  bağımsız primary/guest/staff korunur; geçmiş `asOf` güncel actor grant'i ister.
  Admin parity sayım endpoint'i ve Club/Season/Team seçimleri; kullanıcıya göre
  yalnız ID saklama, stale-response koruması ve dirty-router uyarısı eklendi.
  396 backend/27 frontend unit, PostgreSQL 29/29, güncel altı migration/boş diff,
  Chromium opt-in 6/6 doğrulandı. Yeni migration, retained DB rollout veya push
  yapılmadı. Sonraki operasyon adımı kontrollü retained geçiş/parity; uygulama
  backlog'unda BL-043 pagination/ölçek, BL-044 privacy/minor kapısı kalır.

- **Latest engineering delivery (2026-09-06):** Kullanıcı ADR-0020 Option A'yı
  onayladı. Vendor-neutral Nodemailer SMTP portu, production fail-closed config,
  development/test operator fallback'i ve no-store issuance uygulandı. SMTP
  yanıtı ham token içermez; ret/timeout yeni tokenı revoke edip generic 503 üretir.
  `/accept-invitation` ve `/reset-password` fragment tokenını URL'den temizler.
  Additive `SYSTEM_ADMIN_RECOVERED` migration'ı ve yalnız mevcut sistem yöneticisini
  reaktive/parola değiştir/authVersion artır/session-reset revoke/audit eden
  maintenance komutu eklendi. Provider/account/DNS/ücretli kaynak, production
  rollout ve korunan yerel DB migration'ı yapılmadı. Root quality 35 backend
  suite/379 test, 7 frontend dosyası/23 test, iki build, Sites 4/4 ve docs/CDSK
  kapılarıyla geçti. Disposable PostgreSQL beş migration/repeat/status/boş diff,
  fake-SMTP backend E2E 27/27 ve break-glass ACTIVE/authVersion=1/audit=1,
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
- **Latest engineering delivery (2026-09-06):** BL-024 onuncu dilimi / BL-038:
  training-plan create/update/delete, tek faz ekleme, faz listesini değiştirme ve
  board snapshot lookup/write persistence yolları cause-free generic 500 ve işlem
  türüne özel sabit olaylara indirildi. Transaction içindeki explicit 400,
  authorization, atomik mutation, başarılı sonuç ve opsiyonel season-day fail-soft
  bağlantısı korundu. On bir yeni error-boundary testiyle 122 focused training-plan
  testi; root quality 32 backend suite/371 test, 6 frontend dosyası/21 test, Sites
  4/4 ve bütün static/build/docs kapıları geçti. Disposable PostgreSQL 16'da üç
  migration, güncel status, boş schema diff ve mevcut 25/25 E2E tekrar geçti.
  Container ve anonim test volume'u kaldırıldı; korunan yerel DB değişmedi.
  Statik yeniden taramada onaylı MVP mutation body/log kapsamı temiz bulundu;
  BL-024/F-008 bu kapsamda kapandı. Browser E2E tekrarlanmadı;
  API/şema/dependency/production değişmedi.
- **Previous engineering delivery (ninth slice):** BL-024 dokuzuncu dilimi / BL-037:
  season/week/day/match create, update, delete, toggle, tactical-board ve
  week-generation persistence/missing-record yolları cause-free generic 500 ve
  işlem türüne özel sabit olaylara indirildi. Transaction içindeki explicit 400,
  mevcut missing-record status'u, authorization ve başarılı sonuçlar korundu.
  Sekiz yeni error-boundary testiyle 42 focused season testi; root quality 31
  backend suite/360 test, 6 frontend dosyası/21 test, Sites 4/4 ve bütün
  static/build/docs kapıları geçti. Disposable PostgreSQL 16'da üç migration,
  güncel status, boş schema diff ve mevcut 25/25 E2E tekrar geçti. Container ve
  anonim test volume'u kaldırıldı; korunan yerel DB değişmedi. Browser E2E
  tekrarlanmadı; API/şema/dependency/production değişmedi.
- **Previous engineering delivery (eighth slice):** BL-024 sekizinci dilimi:
  attendance lookup/update/create persistence hataları cause-free generic 500 ve
  `ATTENDANCE_MARK_FAILED` sabit olayına indirildi. DTO, controller plan/oyuncu
  yetkisi ve başarılı find-then-update/create akışı korundu. Üç yeni error-boundary
  testiyle 27 focused attendance testi; root quality 351 backend/21 frontend,
  Sites 4/4 ve bütün static/build/docs kapıları geçti. Disposable PostgreSQL 16'da
  üç migration, güncel status, boş schema diff ve mevcut 25/25 E2E tekrar geçti.
  Geçici test verileri kaldırıldı; korunan demo DB değişmedi. Şema incelemesinde
  `(planId, playerId)` unique constraint olmadığı ve concurrent duplicate riski
  bulundu; F-013/CR-014/BL-036 Proposed bırakıldı, migration uygulanmadı. Browser
  E2E tekrarlanmadı; frontend/dependency/production değişmedi.
- **Previous engineering delivery (seventh slice):** BL-024 yedinci dilimi: MVP body
  envanteri, club update ve drill create/update/delete hata/body sınırı. MVP'de
  `any` mutation body kalmadı; health/analytics yolları MVP dışı karar kapısında.
  F-012/BL-034 ile dört persistence sink'i cause-free generic 500 + sabit olaya,
  drill null/array/primitive body kontrollü 400'e bağlandı; update kaynak yetkisi
  önce çalışır. 12 yeni regresyon, 56 focused club/drill testi; root quality 348
  backend/21 frontend, Sites 4/4 ve bütün static/build/docs kapıları geçti. İlk
  quality çağrısı sandbox loopback `EPERM` nedeniyle frontend build'de durdu;
  sandbox dışında aynı kapı geçti. Disposable PostgreSQL 16'da üç migration,
  güncel status, boş schema diff ve 25/25 E2E doğrulandı. Geçici test verileri
  kaldırıldı; korunan demo DB değişmedi. Browser E2E tekrarlanmadı;
  şema/dependency/production değişmedi.
- **Previous engineering delivery (sixth slice):** BL-024 altıncı dilimi:
  group update/delete ile membership add/remove persistence/duplicate/missing hata
  yolları cause-free generic 500 ve sabit olaylara indirildi. F-011/BL-033 ile
  üyelik temizliği ve grup silme tek transaction'a alındı; ana silme foreign-key
  nedeniyle reddedilirse üyelikler geri alınır. Mevcut başarılı sonuç ve
  duplicate/missing 500 status davranışı korundu. 11 yeni error-boundary testi,
  56 focused group testi; root quality 336 backend/21 frontend, Sites 4/4 ve bütün
  static/build/docs kapıları geçti. Disposable PostgreSQL 16'da üç migration,
  güncel status, boş schema diff ve 24/24 E2E doğrulandı. İlk DB adı session E2E
  güvenlik kapısına uymadığı için suite başlamadan reddedildi; `e2e` adlı aynı
  disposable hedefte bütün suite tekrar geçti. Geçici test verileri kaldırıldı,
  korunan demo DB değişmedi. Browser E2E tekrarlanmadı; şema/dependency/production
  değişmedi.
- **Previous engineering delivery (fifth slice):** BL-024 beşinci dilimi:
  group/club create/update/member runtime DTO. F-010/BL-032 kapsamında POST /clubs
  istemci kimlik/timestamp/nested ilişki yazıları explicit field projection ile
  kapatıldı. Club ve club-group create persistence hataları cause-free generic 500
  ve sabit olayla sınırlandı. Enum/default/null/empty davranışları korundu.
  Bağımsız review'da bulunan `/groups` auth-before-validation regresyonu clubId-only
  parse ile kapandı. 84 focused test; root quality 325 backend/21 frontend, Sites
  4/4 ve tüm static/build/docs kapıları geçti. Disposable PostgreSQL 16'da üç
  migration deploy/status, boş schema diff ve 23/23 E2E doğrulandı. Yalnız geçici
  test container/verileri kaldırıldı; demo DB korundu. Browser E2E tekrarlanmadı;
  şema/dependency/production değişmedi.
- **Previous engineering delivery (fourth slice):** BL-024 dördüncü dilimi:
  season/week/day/match runtime DTO. F-009/BL-031 kapsamında hafta nested-write,
  reparent ve maç create doğrulanmamış board yolu explicit field projection ile
  kapatıldı; ADR-0007/0012/0014 kaynak/sözleşme sınırı uygulanır. Date-only/local
  ISO/offset, nullable/default/JSON davranışları ve group invariant'ları korundu.
  31 yeni unit/iki HTTP regresyonu; bağımsız patch review ve 33 focused test geçti.
  Root quality 250 backend/21 frontend, Sites 4/4 ve tüm static/build/docs kapıları
  geçti. Disposable PostgreSQL 16'da üç migration deploy/status, boş schema diff ve
  22/22 E2E doğrulandı. Yalnız geçici test container/verileri kaldırıldı; demo DB
  korunur. Browser E2E tekrarlanmadı; dependency/migration/production değişmedi.
- **Previous engineering delivery (third slice):** BL-024 üçüncü dilimi: plan create/update
  runtime DTO controller ve service girişlerinde uygulanır. Principal kimlik
  türetme, nullable alanlar, timestamp offset'i, Int şema sınırı ve serializable
  group aggregate'leri korunur. 58 yeni unit ve iki HTTP/Prisma regresyonu eklendi.
  Root quality 219 backend/21 frontend, Sites 4/4, build/typecheck/lint/format,
  CDSK/link/diff geçti. Ayrı disposable PostgreSQL 16'da üç migration deploy,
  status ve boş schema diff ile backend E2E 20/20 geçti. Test container kaldırıldı;
  korunan demo DB'ye dokunulmadı. Browser E2E tekrarlanmadı; şema/dependency aynı.
- **Previous engineering delivery (second slice):** BL-024 ikinci dilimi: POST /groups hatası
  sabit olay ve raw cause taşımayan HttpException ile sınırlandı; mevcut genel
  500 zarfı, başarılı create/category default'u korunur. Attendance ve tek faz
  ekleme mevcut enum/alan kurallarıyla controller ve servis girişinde doğrulanır;
  yetki kontrolleri ve field projection korunur. 51 yeni regresyon; root quality
  161 backend/21 frontend, Sites 4/4, build/typecheck/lint/format, CDSK ve 65
  Markdown/0 kırık link geçti. HTTP/DB/browser E2E tekrarlanmadı; DB ve şema
  değişmedi. Ayrı club-group create ve diğer framework log yolları açık kalır.
- **Previous engineering delivery:** BL-024 ilk dilimi: analytics lint 0 hata/uyarı;
  mutation alan eleme/dönüşümleri ve null rejection korunur. Plan-season link
  yalnız sabit olay loglar; raw-error/metadata/debug sorguları kaldırıldı ve
  opsiyonel başarısızlık plan oluşturmayı bozmaz. Replace-drills body mevcut
  servis kurallarıyla controller'da doğrulanır; plan/drill authorization korunur.
  42 yeni regresyon; root quality 110 backend/21 frontend, Sites 4/4, iki build,
  typecheck/lint/format, CDSK, 65 Markdown/0 kırık link ve diff geçti.
  API'nin geçerli payload/rol sözleşmesi, şema ve DB değişmedi; HTTP/DB E2E bu
  dilimde tekrarlanmadı. BL-024 kısmen açık; production onayı verilmedi.
- **Latest local delivery:** Kullanıcının tarih/süre/içerik delegasyonuyla
  `cmtotozut0005r1puwqggqc2r` demo planı yalnız `ngcs_local_session_dev` üzerinde
  oluşturuldu. 7 Eylül 18:00, dört faz ve 75 dakika browser/DB okumasıyla
  doğrulandı; attendance 0. Faz ekleme sonrası workspace özetinde kalan 0 dk
  BL-030 ile düzeltildi; ortak veri reload'u ve route/context regresyonu eklendi.
  Root quality 68 backend/21 frontend testiyle geçti. Gerçek yoklama işaretlenmedi.
- **Local continuation:** Kullanıcı production yerine yerelde devam etmeyi istedi.
  Çalışmayan dev server'lar 3001/4000'de başlatıldı. `ngcs_local_test` değiştirilmeden
  `ngcs_local_session_dev` kopyası oluşturuldu; üçüncü additive migration yalnız
  kopyaya uygulandı, status güncel. Kalıcı oturum process flag'leri yerelde açık;
  repository varsayılanları kapalı kaldı. HTTP smoke ve login ekranı doğrulandı;
  ilk kayıtlı login reddedildi. Ardından doğru yerel koç hesabı explicit kullanıcı
  onayıyla yalnız kopyada sıfırlandı; authVersion artırıldı, aktif refresh/reset
  kayıtları iptal edildi ve token-free audit yazıldı. Yeni parola hash doğrulaması,
  API login 201/persistent ve logout 200 geçti; kullanıcı/plan/drill/maç/katılım
  sayıları korundu. Credential repository'ye yazılmadı. Sonraki browser smoke'ta
  yeni sekme/reload oturumu, hafta, kütüphane, maç/kadro, boş plan/yoklama ve
  tahta oyuncu/undo doğrulandı. İş verisi kaydedilmedi. Yanıltıcı yeni-taslak kayıt
  etiketi BL-029/P3 olarak kaydedildi ve sonraki adımda düzeltildi: yeni egzersiz,
  maç ve snapshot bağlamları persisted bilgisini ayrı aktarır. Yedi component
  regresyonu, yeni taslak/maç browser smoke ve root quality (68 backend/20 frontend
  test) geçti. API/şema ve yerel iş verisi değiştirilmedi; DB E2E tekrarlanmadı.
- **Latest continuation:** M4 karar girdileri ve BL-028 hazırlandı; domain,
  provider, bütçe, bölge, pilot kapasite ve owner kullanıcıdan bekleniyor.
  Architecture Overview'daki eski implementation-bekliyor ifadesi ADR-0018 ile
  hizalandı. Flag-off CORS'un localhost'a dönüşü production rollback kapısı olarak
  kaydedildi. Bu adımda yalnız belgeler değişti; deployment veya migration yapılmadı.
- **Session summary:** Kullanıcı onaylı ADR-0018 provider-neutral kalıcı oturum
  paketi uygulandı. Additive migration, rotation/replay ve family revoke, frontend
  bootstrap/logout doğrulandı. Backend E2E 18/18; browser opt-in 4/4 ve flag-off
  3/3 (opt-in testi skipped). Production rollout yapılmadı; flag'ler kapalıdır.
- **Documents updated:** ADR-0014–0020, review raporu, BL-011/017–038, CR-009–015,
  requirements, mimari güvenlik/veri/API/entegrasyon belgeleri, operations,
  roadmap, milestone, changelog ve handoff; ADR-0018, BL-027, CR-013 ve session
  API/veri/operations sözleşmesi eklendi.
- **Decisions recorded:** Dashboard `GLOBAL + own club`; aggregate'lerde kesin
  group sınırı; Socket operasyon olaylarında güncel group/resource alıcısı;
  password reset'te transaction içi conditional single-winner claim; Prisma CLI
  advisory'si hosted runtime için geçici `not_actionable` risk kabulü; serving
  runtime ile migration artifact'ının ayrılması; default-disabled persistent
  session, 15m/7d/30d/beş-family ve 30d refresh-record retention. ADR-0019
  attendance fail-fast migration + unique constraint + atomic upsert paketini
  kabul eder. ADR-0020 hesap teslimi ve break-glass recovery için Option A'yı
  kabul eder; vendor-neutral uygulama tamamlanmış, provider/rollout `TBD`dir.
- **Remaining risk:** Global log retention,
  production provider, registry/orchestrator, ayrı DB rolleri, readiness ve
  operasyon sözleşmesi M4 veya ayrı karar kapılarında sürer.
- **Recommended next step:** Güncel audit BL-069 PLAYER roster self-scope,
  BL-070 eski not paylaşımını geri alma, BL-071 aktivite bütünlüğü, BL-075
  taslak kurtarma ve BL-072 primary kimlik sırasıyla ele alınır; Settings
  görsel taşıması tarihsel olarak tamamlanmıştır.
  Global log retention/
  veri sınıflandırma kararı, provider hesabı, ücretli kaynak, DNS ve production
  rollout kendi karar kapılarında `TBD` kalır.

## Revision History

2.176 — 2026-10-27: User-authorized pending product-audit publication; original
image/JSON evidence rechecked, historical results and current open issues clarified.

2.175 — 2026-10-27: User-authorized roster/season-link evidence publication;
sample players, history-preserving season transition and scoped validation records.

2.171 — 2026-10-26: Product/component audit; current browser/HTTP evidence, open remediation/future scope, quality and retained-data isolation receipts.

2.163 — 2026-10-25: User-authorized merged branch cleanup and recoverable PR review
worktree archive; documents/config preserved and main synchronization verified.

2.161 — 2026-10-25: Fix frozen plan-board absence across reads/projection/preservation;
red/green regressions, quality/publication and conditional PR readiness recorded.

2.159 — 2026-10-20: PR#1 re-review closes old P1, reproduces frozen-absence P2;
keep draft with current validation and a concrete correction/regression handoff.

2.158 — 2026-10-20: Review/publish remaining tactical icon documentation and three
historical JPEGs; completed-selection guidance and current document checks recorded.

2.157 — 2026-10-20: Publish reviewed ready library/team-age picker, legacy
attachment, explicit attendance and training-detail changes with current validation.

2.126 — 2026-10-19: Approved fixture-aware SENIOR updates and manual-edit/deletion
protection delivered; retained checkpoint enrollment, rollback/replay, backend/HTTP/
frontend/operator and responsive QA verified. No new schema or retained fixture edit.

2.122 — 2026-10-19: Approved whole-season program applied across 41 weeks / ten
teams, adding 2009 sessions / 504 meetings / 1026 rest entries. Restored rehearsal,
all-original-row preservation, durable replay and backend/HTTP/operator checks pass.

2.120 — 2026-10-19: Actual retained A Takım library/existing-plan browser flow
passes; two authorized attachments retained, 121 minutes / 6 entries with correct
snapshots/day totals and preserved existing/other records. Reopening verified.

2.118 —2026-10-19: Approved weekly program implemented and populated for all
ten teams. Exact audit migration/backup restore,51 plans/204 phases/13 meetings/
26 rest rows, durable replay and preserved fixtures verified; quality/UI evidence recorded.

2.117 — 2026-10-19: Explicitly accepted ADR-0041 local same-account exception;
all 120 published with truthful transition audits. Maintenance tests 10/10,
private backup/restore, 43-table preservation and zero-write replay verified.

2.116 — 2026-10-19: Separately approved local snapshot migration and all-120
DRAFT import completed; backup/restore, 38-table preservation and zero-duplicate
replay verified. Publication/Fatih Çelebigil review approval recorded; same-account
guard remains, local exception ADR-0041 Proposed.

2.112 — 2026-10-19: Approved five-step club wizard, optional staff, logo/colors
and derived theme implemented; separately approved branding migration applied
with backup/restore and preserved retained data. Durable replay/API/browser QA
verified; Windows root-quality/validator limitations recorded as BL-061.

2.109 — 2026-10-19: Approved Spor Manage local club/season/teams/example-staff
and sample-fixture setup verified; first-run product wizard recorded as Proposed.

2.108 — 2026-10-19: Approved fresh Windows local database, 11 migrations,
first administrator and verified development startup; previous-machine data
was not transferred.

2.90 — 2026-09-09: A Takım route'u doğrudan kadro merkezine geçirildi; ortak
responsive oyuncu dizini, URL filtre/sıra, deterministik cursor ve self-scope
özetleri backend 712/frontend 284 ve disposable E2E 2/2 ile doğrulandı.

2.80 — 2026-09-08: Players, Player 360, Squad ve Attendance fotoğraflı hero,
doğrulanmış kapsam metrikleri ve kompakt oyuncu/plan yüzeyleriyle tamamlandı;
on iki exact-size QA kanıtı geçti. Quality: 657 backend, 264 frontend ve 4 Sites
testi. Sırada Settings.

2.79 — 2026-09-08: Match detail fotoğraflı hero, beş gerçek maç özeti,
kompakt analiz/olgu düzeni ve mevcut taktik editörüyle tamamlandı; altı exact-size
QA kanıtı geçti. Quality: 657 backend, 264 frontend ve 4 Sites testi. Sırada
Players, Player 360, Squad ve Attendance.

2.78 — 2026-09-08: Library, Tactical Board ve yeni tahta editörü fotoğraflı
hero, gerçek metrikler, kategori kataloğu, doğrulanmış araç özeti ve kompakt
editor chrome ile tamamlandı; dokuz exact-size QA kanıtı geçti. Quality: 657
backend, 263 frontend ve 4 Sites testi. Sırada Match detail.

2.77 — 2026-09-08: Trainings ve training-detail referans-sistem dilimi fotoğraflı
hero, beş gerçek metrik, kompakt editör özeti/sekmeleri ve responsive plan/faz
kartlarıyla tamamlandı; altı exact-size QA kanıtı geçti. Quality: 657 backend,
260 frontend ve 4 Sites testi. Sırada Library ve Tactical Board.

2.76 — 2026-09-08: Week referans-sistem dilimi fotoğraflı hero, kompakt tarih
kontrolleri ve responsive yedi günlük board ile tamamlandı; 1672/1024/390
exact-size QA geçti. Sırada Trainings ve training detail.
Quality: 657 backend, 258 frontend ve 4 Sites testi.

2.75 — 2026-09-08: Matches referans dilimi fotoğraflı hero, yerel gün filtresi
ve tarih gruplu gerçek satırlarla tamamlandı; 1672/1024/390 exact-size QA geçti.
Quality 657 backend/257 frontend/4 Sites. Sırada Week.

2.74 — 2026-09-08: Teams referans dilimi fotoğraflı hero, gerçek takım kartı ve
native tabloyla tamamlandı; 1536/1024/390 exact-size QA kanıtı P0/P1/P2 olmadan
geçti. Search/cursor/seçim/detay davranışları korundu. Sırada Matches.

2.71 — 2026-09-08: Onaylı Dashboard referans düzeltmesi; altı gerçek metrik,
üç sütunlu içerik, günlük sayfalama, Inter/fotoğraf ve 185/78px shell. Root quality
657 backend/255 frontend/4 Sites geçti; canlı responsive/Sheet/login kontrol edildi.
Kalıcı screenshot dışa aktarımı nedeniyle görsel teslim kapısı açık.

2.67 — 2026-09-07: BL-047 faz 5C ortak futbol kartları dört katalogda geçti;
4 yeni/34 hedef ve quality 655/245. Faz 5 kapalı, sırada faz 6 Hafta modülü.

2.66 — 2026-09-07: BL-047 faz 5B ortak compact seçenek sayfalaması; farklı
cursor politikaları korundu, 15 yeni/39 hedef ve quality 655/241 testleri geçti.
Sırada faz 5C futbol kartları.

2.65 — 2026-09-07: BL-047 faz 5A ortak veri durumu/sayfalama, Oyuncular/Takımlar
pilotu ve atama sayfalama adaptörü; 14 yeni test, quality 655/226. Faz 5B sırada.

2.64 — 2026-09-07: BL-047 faz 4B.2 sportif atama ortak form düzeni; 15 yeni
test, quality 655/212, responsive/kısa ekran QA. Faz 4 hedefleri kapalı; sırada faz 5.

2.63 — 2026-09-07: BL-047 faz 4B.1 yeni plan diyalogu ortak alan/hata düzeni,
kısa ekran iç kaydırma; dokuz yeni test, quality 655/197. Sırada sportif atama.

2.62 — 2026-09-07: BL-047 faz 4A giriş/davet/parola yenileme ortak form geçişi;
16 yeni test, quality 655/188 ve public form görsel kontrolü. Sırada faz 4B
plan/atama diyalogları; API, token ve session davranışı değişmedi.

2.61 — 2026-09-07: BL-047 faz 3 dashboard/settings ortak layout pilotu ve mobil
kullanıcı menüsü düzeltmesi; sekiz yeni test, quality 655/172 ve responsive QA.
Sonraki faz 4 forms/dialogs; tüm uygulama migration'ı tamamlanmış değildir.

2.60 — 2026-09-07: BL-047 faz 2 etkileşim kapısı; 12 yeni test, root quality
655/164 ve yerel klavye/notification doğrulaması. Sonraki faz 3 layout pilotu.

2.59 — 2026-09-07: BL-047 sınıflandırılmış UI envanteri ve sekiz aşamalı plan;
faz 1 token/primitive yüzey geçişi, 9 regresyon ve eşleşen responsive görsel QA.
Geniş migration tamamlanmadı; sırada faz 2 kalan kontroller ve faz 3 layout pilotu.

2.58 — 2026-09-07: Kullanıcı onaylı hedefli yerel koç parola sıfırlaması,
oturum iptali ve transaction içi veri koruma doğrulaması; secret kaydedilmedi.

2.57 — 2026-09-07: BL-045 explicit all-seasons/gerçek eksik sezon ayrımı,
10 regresyon ve yerel browser doğrulaması; kalan işler karar kapılarında.

2.56 — 2026-09-07: BL-043j sentetik karma okuma/yazma ve ayrı SELECT row-work
kanıtı; pilot kabul girdileri TBD olarak ayrıldı. Sırada bağımsız BL-045.

2.55 — 2026-09-07: BL-046c eşleşen geçerli tahta ölçümü ve tam QA; BL-046/
CR-017 uygulama kapanışı. Sırada BL-043 geniş workload/row-work doğrulaması.

2.54 — 2026-09-07: BL-046b frontend explicit-open, dirty geçiş/history
koordinasyonu ve belirsiz kayıt doğrulaması; c matched ölçüm sırada.

2.53 — 2026-09-07: ADR-0025 Accepted; BL-046a backend okumaları ve 43 unit/8
HTTP doğrulaması, tam kalite/API kapıları; frontend/ölçüm b/c sırada.

2.52 — 2026-09-07: BL-046 tasarım/etki analizi, Proposed ADR-0025 Option A ve
üç uygulama kapısı; yalnız dokümantasyon, açık uygulama onayı bekleniyor.

2.51 — 2026-09-07: BL-043i tekrarlanabilir karma GET ölçümü ve test eşikleri;
editor JSON büyümesi BL-046/Proposed CR-017 ile ayrıldı, production SLO TBD.

2.50 — 2026-09-07: BL-043h.2 sayfalı antrenman yoklaması, tam sayaçlar ve
katılım/grup üyesi taşımayan editor; ortak full-member fetch/state kaldırıldı.

2.49 — 2026-09-07: BL-043h.1 sayfalı Kadro ve bağımsız tam oyuncu toplamı;
mevcut rol/grup yetkisi korunur, antrenman detayındaki üye bağımlılığı h.2'ye taşınır.

2.48 — 2026-09-07: BL-043g.5 tekil yetkili maç detayı, minimal shell sayacı
ve metadata-only workspace; ortak tam maç fetch/state kaldırıldı.

2.47 — 2026-09-07: BL-043g.4 Hafta günlük minimal maç sayfaları/tam toplam,
bağımsız retry ve DST-safe sınırlar; shell sayacı cutover bağımlılığı netleştirildi.

2.46 — 2026-09-07: BL-043g.3 Genel Bakış limit=3 scalar maç/tam toplam,
bağımsız retry ve scope reset; 93 frontend unit/11 Chromium E2E doğrulandı.

2.45 — 2026-09-07: BL-043g.2 Maçlar bağımsız sayfa/tam total/hasBoard
kartlarına geçti; 89 frontend unit ve 11 Chromium E2E doğrulandı.

2.44 — 2026-09-07: BL-043g.1 maç sayfa/tam toplam API temeli, 33 yeni unit
test ve 39 API E2E doğrulandı; frontend tüketicileri sonraki dilimlere bırakıldı.

2.43 — 2026-09-07: BL-043f.4 sayfalı antrenman egzersiz seçicisi, snapshot
koruyan mevcut tekli POST ve ortak tam drill fetch/state kaldırılması doğrulandı.

2.42 — 2026-09-07: BL-043f.3 sunucu board-kind filtresi ve sayfalı taktik
kataloğu; antrenman detay egzersiz seçenekleri/shared drill kaldırma hâlâ açık.

2.41 — 2026-09-07: BL-043f.2 Genel Bakış egzersiz sayacı limit=1 minimal
okuma/tam total, scope reset ve bağımsız retry; taktik/detay tüketicileri açık.

2.40 — 2026-09-06: BL-043f.1 sayfalı Egzersiz Kütüphanesi/sunucu kategori
filtresi ve minimal kart projection'ı; diğer shared drill tüketicileri açık.

2.39 — 2026-09-06: BL-043e.5 sayfalı Yoklama/tam oyuncu toplamları ve dört
antrenman tüketicisi tamamlanarak shared full-plan fetch/state kaldırıldı.

2.38 — 2026-09-06: BL-043e.4 yerel dönem/gün filtresi ve bağımsız Hafta
sayfaları; ortak tam plan okumasının kalan tüketicisi Yoklama'dır.

2.37 — 2026-09-06: BL-043e.3 Genel Bakış tam antrenman/PRESENT toplamları
ve son üç minimal plan okuması; hafta/yoklama ayrıştırması açık kaldı.

2.36 — 2026-09-06: BL-043e.2 Antrenmanlar sayfalı UI/tam toplam geçişi;
dashboard/hafta/yoklama tam okumaları ve diğer iş listeleri açık kalır.

2.35 — 2026-09-06: BL-043e.1 antrenman sayfalı okuma/tam toplam API temeli ve
EXPLAIN tabanlı faz sayımı daraltması; frontend/shared-array cutover henüz yapılmadı.

2.34 — 2026-09-06: BL-043d seçili legacy bağlamı ve sayfalı atama seçenekleri;
tam maç sonuçları ve bağımsız yetki kontrolü korunur. İş listeleri/pilot kapısı açık.

2.33 — 2026-09-06: BL-043c tarihli kadro/geçmiş sayfalaması, ayrı toplam sayaçlar,
bounded person yetki sorgusu; legacy metadata/diyalog ve pilot ölçek kapısı açık.

2.32 — 2026-09-06: BL-043b takım listesi ve workspace katalog sayfalaması;
sayfa dışı seçimi koruma, güncel yetki filtreleri ve izole ölçüm. Kadro/geçmiş açık.

2.31 — 2026-09-06: BL-043a oyuncu ID-keyset sayfalaması, sunucu araması,
scope/retry UI ve 1.000 oyunculu izole ölçüm; takım/atama sayfalaması açık.

2.30 — 2026-09-06: Yedek/restore provası ve korunan yerel P0.1 migration/parity,
iş verisi bütünlüğü ve oturumlu browser smoke doğrulandı; production değişmedi.

| Version | Date       | Summary                                                                                                                      |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-08-31 | CDSK başlangıç bağlamı oluşturuldu                                                                                           |
| 0.2     | 2026-08-31 | İlk güvenlik containment ve test tabanı kaydedildi                                                                           |
| 0.3     | 2026-08-31 | ADR-0004 Accepted olarak kaydedildi                                                                                          |
| 0.4     | 2026-08-31 | ADR-0005 rol/tenant sınırı Accepted olarak kaydedildi                                                                        |
| 0.5     | 2026-08-31 | Prisma drift envanteri ve Proposed ADR-0006 kaydedildi                                                                       |
| 0.6     | 2026-08-31 | ADR-0006 kabul edildi; migration uygulama adımı ayrıştırıldı                                                                 |
| 0.7     | 2026-08-31 | Temiz Prisma baseline ve yeni rol enum'u doğrulandı                                                                          |
| 0.8     | 2026-08-31 | ADR-0007 çekirdek authorization matrisi ve negatif E2E doğrulandı                                                            |
| 0.9     | 2026-08-31 | ADR-0003 monorepo topolojisi uygulandı; kırık gitlink kaldırıldı                                                             |
| 1.0     | 2026-09-01 | ADR-0008 invitation lifecycle ve session revocation doğrulandı                                                               |
| 1.1     | 2026-09-01 | ADR-0009 koç öncelikli frontend teknolojisi ve ilk akışı kabul edildi                                                        |
| 1.2     | 2026-09-01 | Koç frontend dikey dilimi ve browser/design QA tamamlandı                                                                    |
| 1.3     | 2026-09-01 | Gerçek login–plan–katılım API entegrasyonu ve browser E2E doğrulandı                                                         |
| 1.4     | 2026-09-01 | Gerçek maç taktik analizi API entegrasyonu ve ikinci browser E2E doğrulandı                                                  |
| 1.5     | 2026-09-01 | Fazlı drill/not kalıcılığı ve üçüncü browser E2E doğrulandı                                                                  |
| 1.6     | 2026-09-01 | Tekrarlanabilir kök kalite kapısı geçti; BL-005/BL-006 tamamlandı                                                            |
| 1.7     | 2026-09-01 | Production origin ve kalıcı session için Proposed ADR-0010 hazırlandı                                                        |
| 1.8     | 2026-09-04 | Rotalı shadcn çalışma alanı, scoped drills ve ortak taktik tahta doğrulandı                                                  |
| 1.9     | 2026-09-05 | ADR-0010 Option 1 kabul edildi; M4 zorunlu girdileri görünürleştirildi                                                       |
| 2.0     | 2026-09-05 | shadcn shell dokuz masaüstü menüsü ve dört MVP destek rotasıyla genişletildi                                                 |
| 2.1     | 2026-09-05 | dokuz rota UI audit'i tamamlandı; mobil sıra ve kütüphane sekmeleri düzeltildi                                               |
| 2.2     | 2026-09-05 | doğrulanmış UI audit kanıtı düzenlenebilir Figma panosuna taşındı                                                            |
| 2.3     | 2026-09-05 | tam MVP review Fail hükmü, bulgular ve remediation backlog'u kaydedildi                                                      |
| 2.4     | 2026-09-05 | A–D stabilizasyonu tamamlandı; F-001–F-006 kapandı ve remediation review Pass oldu                                           |
| 2.5     | 2026-09-05 | Prisma advisory geçici risk kabulü kaydedildi; runtime/migrator ayrımı Proposed oldu                                         |
| 2.6     | 2026-09-05 | ADR-0017 kabul edildi; runtime-only backend ve ayrı migrator artifact'ı doğrulandı                                           |
| 2.7     | 2026-09-05 | ADR-0018 opt-in kalıcı oturum, additive migration ve browser reload/logout doğrulandı                                        |
| 2.8     | 2026-09-05 | M4 karar girdileri, BL-028 ve production CORS/rollback kapısı kaydedildi                                                     |
| 2.9     | 2026-09-05 | Production beklemeye alındı; yerel DB kopyası/migration ve opt-in dev server'lar başlatıldı                                  |
| 2.10    | 2026-09-05 | BL-029 kayıt durumu düzeltildi; 7 yeni regresyon, browser smoke ve root quality geçti                                        |
| 2.11    | 2026-09-05 | İlk 75 dk demo planı oluşturuldu; BL-030 ortak süre senkronizasyonu ve kalite kapısı doğrulandı                              |
| 2.12    | 2026-09-05 | BL-024 ilk dilimi: analytics lint ve plan-link log temizliği, replace-drills runtime DTO, 42 regresyon                       |
| 2.13    | 2026-09-05 | BL-024 ikinci dilimi: POST /groups log containment, attendance/add-drill runtime DTO, 51 regresyon                           |
| 2.14    | 2026-09-05 | BL-024 plan create/update DTO, 58 unit/2 HTTP regresyonu; disposable PostgreSQL backend E2E 20/20                            |
| 2.15    | 2026-09-06 | BL-024 season/week/day/match DTO; F-009/BL-031 nested-write düzeltmesi, 250 unit ve 22 E2E doğrulandı                        |
| 2.16    | 2026-09-06 | BL-024 group/club DTO; F-010/BL-032 club mass-assignment düzeltmesi, 325 unit ve 23 E2E doğrulandı                           |
| 2.17    | 2026-09-06 | BL-024 group mutation error containment; F-011/BL-033 atomik grup silme, 336 unit ve 24 E2E doğrulandı                       |
| 2.18    | 2026-09-06 | BL-024 club update/drill error-body sınırı; F-012/BL-034, 348 unit ve 25 E2E doğrulandı                                      |
| 2.19    | 2026-09-06 | BL-024 attendance error containment; BL-035, 351 unit/25 E2E; F-013/CR-014 uniqueness kararı Proposed                        |
| 2.20    | 2026-09-06 | BL-024 season mutation error containment; BL-037, 42 focused/360 total unit ve 25 E2E doğrulandı                             |
| 2.21    | 2026-09-06 | BL-024 training-plan mutation error containment; BL-038, 122 focused/371 total unit ve 25 E2E; F-008 closed for approved MVP |
| 2.22    | 2026-09-06 | ADR-0019 attendance uniqueness/upsert Option 1 Proposed; no schema, migration, service or retained-DB change                 |
| 2.23    | 2026-09-06 | ADR-0019 Accepted; fail-fast unique migration, atomic upsert, 24 focused unit and disposable PostgreSQL 26/26 E2E            |
| 2.24    | 2026-09-06 | ADR-0019 additive migration applied to approved local retained DB; status/index and HTTP health verified                     |
| 2.25    | 2026-09-06 | ADR-0020 SMTP delivery/public completion/break-glass recovery Option A Proposed; implementation and provider not approved    |
| 2.26    | 2026-09-06 | ADR-0020 Accepted; SMTP port/public completion/break-glass recovery implemented; provider and retained-DB rollout TBD        |
| 2.27    | 2026-09-06 | ADR-0021–0024 Accepted; Phase 2 P0.1 sporting kernel, Player 360, migration/backfill and E2E verified in repository          |
| 2.28    | 2026-09-06 | P0.1a integrity closure: as-of history cutoff, primary-period overlap guards, 396 backend tests; BL-042 remains P0.1b        |
| 2.29    | 2026-09-06 | BL-042/P0.1b atomic legacy adapter, history/revocation, parity and persistent workspace scope; 29 API and 6 browser E2E      |
