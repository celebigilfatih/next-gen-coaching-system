# Changelog

## 2026-10-27 — Ürün denetimi PR #4 son kontrolleri

- Kullanıcı isteğiyle mevcut branch'ten main hedefli PR #4 draft açıldı ve sohbete
  bağlandı. Bağımsız163 dosyalık belge/kanıt incelemesinde Critical/Important engel
  yok;137 görüntü/14 JSON ve tarihsel HTTP/kalite sonuçları doğrulandı.
- Yeni belge/CDSK/whitespace ve salt okunur25/25 sezon kontrolleri geçti.
  GitHub çakışma göstermiyor; check/status/review yokluğu başarı sayılmıyor.
  Final sync ve ready kontrolü kapanış kapısıdır; merge istenmedi.
  [Son inceleme](docs/30-quality/PR_4_FINAL_REVIEW_2026-10-27.md).

## 2026-10-27 — Bekleyen ürün denetimi belgelerinin yayını

- Açık kullanıcı isteğiyle26 Ekim ürün raporu, route/bileşen matrisi, açık
  remediation takibi ve ADR'lerle uyumlu belge düzeltmeleri yayın için incelendi.
  122 özgün ekran dosyasının hash/piksel eşleşmesi,132 görüntünün decode'u ve
  tarihli JSON/kalite sonuçları doğrulandı. Uzantı/gerçek JPEG kodlama ayrımı ve
  tarihsel manifest metin encoding sınırı açıklandı; orijinal baytlar korundu.
- Kod/veri düzeltmesi yapılmadı; P1 bulguları açık, yeni ürün kapsamı/ADR onayı yok.
  Sonraki kullanıcı onaylı kadro işlemleriyle tarihli audit izolasyonu ayrıldı.
  [Yayın incelemesi](docs/30-quality/PRODUCT_AUDIT_2026-10-26.md#yayın-incelemesi--27-ekim-2026).

## 2026-10-27 — Oyuncu kadro kanıtlarının yayını

- Açık kullanıcı isteğiyle örnek oyuncu ekleme ve eski oyuncunun sezon bağlantısı
  raporları, beş ekran görüntüsü ve iki temizlenmiş doğrulama özeti incelendi.
  Mevcut branch'e yayın kapsamı yalnız bu teslimin belge/kanıtlarıdır; önceki ürün
  auditinin bekleyen değişiklikleri korunur.
- Yeni salt okunur sezon doğrulaması25/25 ve42 tablo korumasını doğrular;
  tarihli ilk24 sezon ataması kanıtı, sonraki25 sonucuyla birlikte açıklanır.
  Runtime, retained veri veya yeni ADR değişikliği yoktur.
  [Yayın kontrolü](docs/30-quality/FIRST_TEAM_SEASON_LINK_2026-10-27.md#yayın-kontrolü).

## 2026-10-27 — Eski A takım oyuncusunun sezon bağlantısı

- Açık kullanıcı isteğiyle mevcut oyuncu, aynı A takımın2026–2027 TeamSeason'ına
  standart primary geçişiyle bağlandı. Eski atama geçmişi ve legacy üyelik korundu;
  yeni kişi/hesap oluşturulmadı. Dizin ve sezon kadrosu artık25/25.
- Rollback provası,42 tabloda yalnız izin verilen tek eski atama değişikliği,
  standart iki audit ve sıfır yazımlı tekrar kontrol edildi. Runtime/model değişmedi.
  [Kayıt](docs/30-quality/FIRST_TEAM_SEASON_LINK_2026-10-27.md).

## 2026-10-27 — Örnek takım kadroları

- Kullanıcının örnek oyuncu seçimiyle Spor Manage2026–2027 sezonunda186 hesapsız
  sentetik oyuncu eklendi: A takım24 yeni/25 toplam, U8–U16 dokuz takımın her biri18.
  Doğru sezon ataması, pozisyon/ayak ve sentetik kaynak gerekçesi kaydedildi.
- Transaction rollback provası,42 tabloda önceki satırların korunması ve sıfır
  yazımlı tekrar doğrulandı. Hesap, klinik veri, şema veya runtime değişmedi.
  Eski sezonsuz A takım ataması korunur; sezon kadrosu24/dizin25 farkı açıktır.
  [Doğrulama](docs/30-quality/SYNTHETIC_TEAM_ROSTERS_2026-10-27.md).

## 2026-10-26 — Repeated ready-drill board diagnosis

- User report confirmed through read-only source/retained comparison:120 published exercises and24 SENIOR entries share only4 geometric layouts, each with the same7 elements. Generator offsets repeat independently of objectives. A16/BL-077 records the current content defect; no content publication, runtime or data change.
  [Diagnosis](docs/30-quality/PRODUCT_AUDIT_2026-10-26.md#a16--p2--hazır120-içerikte-yalnız-dört-tekrarlanan-çizim-geometrisi).

## 2026-10-26 — Product and component audit

- Added Turkish route/component matrix and evidence-backed existing-gap/future-opportunity report;122 accepted fresh screenshots,30 planning assertion groups and41 people/admin HTTP checks. PLAYER roster self-scope, ended-note-share recovery, activity cursor and note draft conflicts remain open; no application fix or new scope implemented.
- Root quality ran once17/17 (941 backend,558 frontend,Sites4/tooling8). Retained41 business table fingerprints are unchanged; isolated test services stopped, canonical3132/4000 preserved. Requirements/backlog, local120 publication trackers and current operating summaries reconciled. Browser date/export fault limits are explicit.
  [Audit](docs/30-quality/PRODUCT_AUDIT_2026-10-26.md).

## 2026-10-26 — PR #2 merged into main

- User-authorized expected-head merge produces af52b8c from reviewed e8a4199;
  GitHub closed/merged state, parents and identical tested tree are verified.
  Fresh37 affected tests pass. Local main fast-forwards cleanly; final closure
  docs publication includes sync/status checks. Feature branch is preserved.
  [Merge record](docs/30-quality/PR_2_MAIN_MERGE_2026-10-26.md).

## 2026-10-26 — PNG compatibility PR readiness

- Opened main-targeted PR#2; reconciled the independent main QA publication with
  the PNG branch by resolving four documentation conflicts and retaining both
  histories. Runtime/test source remains identical to the tested PNG fix.
- Fresh37 tests and independent final review have no Important/Critical blocker;
  existing root17/17 evidence remains applicable. Push/mergeability/status checks
  gate ready-for-review; merging main is outside this request.
  [Review record](docs/30-quality/PR_2_PNG_READINESS_2026-10-26.md).

## 2026-10-25 — PNG compatibility publication

- User-authorized final review/commit/push on codex/png-download-compatibility
  includes the PNG Blob transport fix, V1/V2 regression tests, ADR-0035 note and
  complete linked smoke/export/download evidence. Scoped re-review has no
  Important/Critical finding; unchanged source retains root17/17 evidence.
  [Publication checks](docs/30-quality/PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md#publication-review--2026-10-25).

## 2026-10-25 — In-app browser PNG download fix

- PNG now downloads through the same Blob path as SVG/JSON, retaining the exact
  encoded bytes,2× resolution, scene filename and selection-free image. Actual
  IAB and Chrome downloads match the original PNG hash. V1/V2 regressions fail
  before the fix, then37 scoped tests pass. Fresh root17/17 passes (941 backend,
  558 frontend, Sites4/tooling8); focused review has no Important/Critical finding.
  [Evidence](docs/30-quality/PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md).

## 2026-10-25 — Reviewed pending QA evidence publication

- Reviewed main smoke/export reports and12 evidence files. Independent artifact
  checks and fresh35 published-baseline tests pass. Ready evidence is authorized
  for main publication; concurrent PNG code/tests remain outside this scope.
  [Review](docs/30-quality/POST_MERGE_QA_PUBLICATION_2026-10-25.md).

## 2026-10-25 — Tactical exported-file verification

- Actual PNG/SVG downloads match the nine-object half-pitch QA board. Selection
  and125% zoom repeats yield identical hashes;35 export/editor tests pass.
  In-app PNG has no download in this session; Chrome succeeds. Offline SVG
  render preserves geometry with minor font substitution. No runtime/data change.
  [Evidence and files](docs/30-quality/TACTICAL_EXPORT_ACCEPTANCE_2026-10-25.md).

## 2026-10-25 — Main restart and browser smoke

- Rebuilt/restarted canonical main API/UI and verified session restoration,
  ready-library filtering/preview and both exercise attachment paths in IAB.
- Named retained QA training saves two phases/50 minutes with frozen content and
  boards; a separate nine-object half-pitch QA tactic survives save/reload.
  Read-only database checks confirm both records and linked day duration.
  Desktop evidence only; downloads unverified after control timeout. No runtime
  patch or migration. [Report](docs/30-quality/MAIN_BROWSER_SMOKE_2026-10-25.md).

## 2026-10-25 — Main ready-plan browser acceptance

- Started merged main and verified its120-item library. In a separate synthetic
  database, actual UI attachment saves1 phase/20 minutes; after source v2 is
  published with zero elements, a full reload preserves the plan's original
  seven-element board/content v1. Boardless source-edit/reload also stays absent.
- Existing41 business-table fingerprints match after excluding a separately
  authorized concurrent smoke plan's new rows. Main stays running; this task's
  isolated services stop. [Evidence](docs/30-quality/MAIN_READY_PLAN_ACCEPTANCE_2026-10-25.md).

## 2026-10-25 — Post-merge branch and review cleanup

- Deleted merged codex/mvp-stabilization locally and remotely after ancestry/tip
  checks. Archived and removed the old managed PR review checkout with its four
  staged documents preserved; review-only ignored config/patches separately saved.
- Primary dependency junction targets remain intact. Documentation and final
  Git/worktree/ref checks verify clean synchronized main; no runtime/data change.
  [Cleanup record](docs/30-quality/POST_MERGE_CLEANUP_2026-10-25.md).

## 2026-10-25 — PR #1 merged into main

- Final scoped review found no Important/Critical blocker; prior P1/P2 findings
  are closed. The exact reviewed6fb5fb6 head merged as a90123a, with an identical
  tree and verified GitHub merged state. Root17/17 and PostgreSQL HTTP11 evidence
  cover the unchanged code. Local main was advanced safely; closure changes are
  documentation only. [Merge record](docs/30-quality/PR_1_MAIN_MERGE_2026-10-25.md).

## 2026-10-25 — Frozen plan-board absence

- Versioned plan phases preserve an absent saved board after source edits or
  publication. Both board APIs, full legacy projection and preservation guards
  use the existing content snapshot; pre-snapshot source fallback remains.
- Stable absent tokens permit explicit first-board saves independently of later
  source V2. Regression failures were reproduced before the correction; affected
  backend136 and dedicated PostgreSQL HTTP11 pass. Fresh root17/17 passes with
  backend941/frontend556/Sites4/tooling8 and both builds; scoped review has no
  Important/Critical finding. Publication state is in the [report](docs/30-quality/FROZEN_PLAN_BOARD_FIX_2026-10-25.md).
  No migration/dependency/retained-data write or automatic merge.

## 2026-10-25 — Independent frozen plan-board verification

- Independently verified the concurrent source-independent plan-board correction:
  136 affected backend tests/11 dedicated PostgreSQL HTTP cases pass. A separate
  actual-service SQL/JSON-null matrix covers source V1/V2 edits, replacement,
  stable absence/tokens, explicit plan-board saves and old fallback compatibility.
  No retained-data write or publication action in this verification.
  [Evidence](docs/30-quality/FROZEN_BOARD_INDEPENDENT_2026-10-25.md).

## 2026-10-20 — PR #1 readiness re-review

- Re-reviewed069f459 against main and the previous d65f799 review. The original
  legacy-attachment P1 is closed; a verified P2 keeps PR#1 draft: a new frozen
  boardless phase inherits a later source board without any plan write.
- Actual dedicated PostgreSQL/service reproduction and fresh validation are
  recorded in the [readiness report](docs/30-quality/PR_MAIN_READINESS_2026-10-20.md).
  GitHub mergeability alone does not clear the defect. Documentation-only follow-up;
  no runtime fix, ready transition, merge, migration or retained-data operation.

## 2026-10-20 — Tactical icon documentation publication

- Reviewed and published the remaining action-icon report, three original JPEG
  captures and shared design/handoff history after1d75b9f. The source implementation
  is already in9015b31; later shared-art evidence is explicitly distinguished.
- Completed concept selection is reflected in frontend instructions. Fresh local
  links/CDSK/whitespace and instruction-format checks cover this docs-only commit;
  prior full root17/17 remains historical. No runtime or retained-data change.
  [Review](docs/30-quality/TACTICAL_ICONS_2026-10-20.md).

## 2026-10-20 — Training workflow publication

- User-authorized review/commit/push combines the ready-only library, exact-team-
  age picker, honest legacy preview/attachment, explicit attendance controls and
  compact training-detail heading. Existing saved content and permissions remain.
- Current validation, publication scope and historical evidence are recorded in
  the [publication review](docs/30-quality/TRAINING_WORKFLOW_PUBLICATION_2026-10-20.md).
  Fresh root17/17 passes: backend937/frontend556/Sites4/tooling8 and both builds;
  dedicated PostgreSQL HTTP11 and final exact-index document checks pass.
  No migration, retained-data write or production activation accompanies this commit.

## 2026-10-20 — Pitch and compact header publication

- User-authorized publication includes eleven shared pitch templates, safe
  proportional pitch edits and the compact accessible title/metadata layout.
  Existing document/save/history and multi-scene locks remain.
- Fresh exact-index frontend551/type/lint/format/build/Sites4 and docs pass.
- Other local library/attachment/attendance/training-detail work is excluded.
  [Review](docs/30-quality/TACTICAL_PITCH_PUBLICATION_2026-10-20.md).

## 2026-10-20 — Tactical icon publication

- User-authorized icon commit/push targets codex/mvp-stabilization. Nine shared
  equipment miniatures and command/scene/playback icons are isolated from pending
  pitch/header, library, attachment, attendance and training-detail changes.
- Exact staged verification and publication review:
  [Evidence](docs/30-quality/TACTICAL_ICON_PUBLICATION_2026-10-20.md).

## 2026-10-20 — Team-ready plan exercise choices

- In-plan exercise selection now uses only the starter package and the saved
  plan group's server-resolved exact age. Seasonal records cannot enter the
  picker through filters, paging or reset; unsupported ages show no ready choices.
- Selection, preview/focus, explicit version-bound add and old plan data remain.
  Backend40/frontend34 and dedicated PostgreSQL HTTP11 pass; actual SENIOR48 /
  tactical16/preview and prior-business preservation verified without adding data.
  All17 root quality gates pass, including backend937/frontend553 tests, builds,
  Sites4/tooling8 and documentation checks.
  [Evidence](docs/30-quality/PLAN_PICKER_READY_ONLY_2026-10-20.md).

## 2026-10-20 — Complete tactical equipment family

- Bayrak, Merdiven and İşaret now use the same shared-art miniatures as their
  pitch objects, joining the other six in the horizontal equipment rail.
  Navy contours, amber details and original saved dimensions remain consistent.
- Focused46, type/lint/format and responsive keyboard/image checks pass.
  Production build and Sites4 also pass; original empty draft restored.
  [Evidence](docs/30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

## 2026-10-20 — Selected tactical equipment family

- User-selected second concept is implemented as six labeled horizontal add
  actions and matching original pitch artwork: shirt, gloved keeper, football,
  striped cone, netted goal and mannequin wall. Shared SVG/Konva source retains
  existing editable documents and export behavior.
- Mobile rail scrolls with48px controls and keyboard focus visibility. Focused55
  tests and authenticated desktop/tablet/mobile checks pass; no retained write.
  Full current-worktree root17/17 passes (backend932/frontend551/Sites4/tooling8).
  [Evidence](docs/30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

## 2026-10-20 — Ready-only exercise library

- Library now shows only the120 authored starter exercises, across all ages by
  default. Age/search/phase/paging/reset stay inside the published stable-ID
  collection; seasonal and unrelated NGCS content are excluded before counting.
- Removed mixed-source switches; row ages and all-age preview remain explicit.
  Exact-team-age attachment and existing seasonal plans/records are preserved.
- Backend35/affected frontend41 and dedicated PostgreSQL HTTP11 pass; actual
  five-page120-unique, SENIOR48/reset120 and business-preservation checks pass.
  Full suites932/543/Sites4/tooling8 and builds pass; initial root15/17 is completed
  by passing frontend type/format repeats. Final197-file links/CDSK/whitespace pass.
  [Evidence](docs/30-quality/LIBRARY_READY_ONLY_2026-10-20.md).

## 2026-10-20 — Tactical equipment concept previews

- Prepared three original six-object visual concepts, each showing player,
  goalkeeper, ball, cone, netted goal and mannequin wall in toolbar/pitch context.
- Current board capture grounds the white/blue interface and green2D pitch.
  Preview images are retained for visual selection; runtime remains unchanged.
  [Preview record](docs/30-quality/TACTICAL_ICON_CONCEPTS_2026-10-20.md).

## 2026-10-20 — A Takım ready exercise pool

- User-approved “A Takım — Hazır Egzersizler” now contains all 48 published
  exact-SENIOR starter exercises with frozen instructions, durations and boards.
  The undated collection preserves the existing scheduled training/calendar.
- All 120 original exercises were already imported/published. The 1,826 catalog
  total was 1,778 club records plus 48 age-supported ready exercises.
- All snapshots, 41-table prior-business fingerprints, zero-write replay and
  actual application/pitch/full-reload checks pass. No runtime/schema/new ADR.
  [Evidence](docs/30-quality/READY_EXERCISE_POOL_2026-10-20.md).

## 2026-10-20 — Tactical icon competitor research

- Compared official Coach Board, Táctica, TacticalPad and Sport Session Planner
  references with the current board. Proposed football-specific tool miniatures,
  clearer keeper/goal/wall semantics and a consistent original2D object family.
- Research/documentation only; final visual selection and implementation remain
  the next design step.
  [Research](docs/30-quality/TACTICAL_ICON_COMPETITOR_RESEARCH_2026-10-20.md).

## 2026-10-20 — Tactical action icons and football artwork

- Added Phosphor icons to history, view, metadata, selection/nudge, formation,
  animation creation, scene apply and playback loop/fixed-scene actions. Mobile
  undo/redo keep accessible names and44px targets without crowding the toolbar.
- Ball tool now uses a filled football icon. Shared canvas/SVG drawing uses
  classic black pentagon panels and fine seams; existing radius/JSON stay intact.
- Focused58/type/lint/build and desktop/mobile visual checks pass. No retained
  write, schema, API or dependency change.
  [Evidence](docs/30-quality/TACTICAL_ICONS_2026-10-20.md).

## 2026-10-20 — Legacy exercise preview and attachment fix

- Plan picker now supplies saved exercise facts to the preview and restores
  focus/selection on close. Missing application details are explained clearly.
- Boardless migrated LEGACY / LEGACY_UNVERIFIED versions can attach through add
  and replace while freezing exact-age content/duration. Professional-board,
  publication, version and authorization guards remain.
- Affected backend45/frontend29 and dedicated PostgreSQL HTTP10 pass; actual
  preview/focus/selection verified without a retained write. No migration/new ADR.
  Full root17/17 passes (backend927/frontend542/Sites4/tooling8). Rebuilt/restarted
  local API with existing settings; full UI reload retains login and saved plan.
  [Evidence](docs/30-quality/DRILL_LEGACY_PREVIEW_FIX_2026-10-20.md).

## 2026-10-20 — Training detail heading and colored icons

- Removed the requested Planlar back link and Antrenman detayı eyebrow. Added
  restrained colored Phosphor icons to title/date, summary, tabs and phase types;
  labels and mobile44px controls remain. No retained writes or API/model change.
- Focused35, types/lint/format/build/Sites4 and desktop/mobile checks pass.
  [Evidence](docs/30-quality/TRAINING_DETAIL_ICONS_2026-10-20.md).

## 2026-10-20 — Modern 2D tactical pitch

- Eleven pitch templates now show their football regions; single-scene pitch
  changes preserve relative anchors/arrow/line endpoints with one undo and fit.
  Oversized equipment keeps the original draft and asks for explicit resizing.
- Modern shared shirt/keeper/ball/cone/net artwork, compact editor title/back
  toolbar, collapsible metadata and viewport-sized pitch replace the tall heading.
  V1/V2/API/schema and explicit-save/preview/permission guards remain unchanged.
- Authenticated desktop/tablet/mobile checks and a named synthetic save/reload
  passed. Final root17/17: backend927/frontend542/Sites4/tooling8 and both builds;
  totals include concurrent work. IAB PNG download observation remains limited.
  [Evidence](docs/30-quality/TACTICAL_PITCH_MODERN_2D_2026-10-20.md).

## 2026-10-20 — Main pull request final review

- Opened PR#1 from codex/mvp-stabilization to main. One reproduced P1 blocks
  readiness: migrated boardless legacy exercises cannot attach (HTTP400).
- Fresh918 backend/514 frontend/Sites4/tooling8 pass; review-root15/17 encounters
  junction TS2742, both affected compiler/build repeats pass with preserveSymlinks.
  GitHub has no reported CI; draft retained, pending attendance work preserved.
  [Review](docs/30-quality/PR_MAIN_FINAL_REVIEW_2026-10-20.md).

## 2026-10-20 — Training attendance UI/UX

- Katılım now matches compact training panels with player rows, readable saved
  status and explicit Katıldı/Katılmadı actions. Mobile uses48px paired controls;
  single-page rosters omit unnecessary paging buttons. Keyboard focus returns
  after save; unmarked, uncertain-write and PLAYER read-only states stay distinct.
- Focused frontend14, types/lint/format/build/Sites4, desktop/tablet/mobile and
  read-only persistence checks pass. Existing Mert PRESENT/1-of-1 remains unchanged.
  No API/schema/ADR change. [Evidence](docs/30-quality/TRAINING_ATTENDANCE_UX_2026-10-20.md).

## 2026-10-20 — Training attendance acceptance

- Mert Çınar appears in the existing Kerem training's A Takım attendance roster.
  Synthetic workflow check saves PRESENT once; full reload retains selected Mert
  and 1/1. Read-only storage assertions confirm one row and unchanged other
  attendance/training records. Stopped local API/UI restored with existing flags.
- No runtime source, schema or permission change. Browser/persistence and
  documentation checks pass; no new automated application suite run.
  [Evidence](docs/30-quality/TRAINING_ATTENDANCE_2026-10-20.md).

## 2026-10-19 — Kerem training create/attach acceptance

- User-selected20Oct2026 18:30 training created under Kerem Tunalı; open SENIOR
  published exercise attached once, Soğuma/18min/1phase. Calendar duration matches.
- Actual create→selected picker→explicit attach→detail/reload/instructions/pitch
  succeeds. Full source snapshots and exact owner/date verified read-only.
  Previous2060 plans/8244 phases/36 matches/3629 day records remain unchanged.
  [Evidence](docs/30-quality/COACH_TRAINING_FLOW_2026-10-19.md).

## 2026-10-19 — Training dialog publication follow-up

- User requested commit/push after quality acceptance. The earlier combined
  package is already remote at3d5d758; remaining attachment/form/coach-refresh
  source, tests and versioned QA are prepared for the same branch.
  Fresh root17/17 passes: backend918/frontend514/Sites4/tooling8, builds/types/
  lint/format,186-file links and CDSK36/47. Stage58 files, including38 QA captures;
  source hashes unchanged, staged whitespace and key/JWT scan pass.
  [Publication verification](docs/30-quality/UI_PUBLICATION_FOLLOWUP_2026-10-19.md).

## 2026-10-19 — Local coach/player and coach-list refresh

- User-authorized synthetic Kerem Tunalı (COACH) and Mert Çınar (PLAYER) are
  ACTIVE in Spor Manage/A Takım, with normal audited identity/profile/membership.
  Player360 primary A Takım assignment is saved through its existing UI.
  Empty coach list was caused by zero club login accounts; existing sporting
  staff records are distinct. No external email or retained plan rewrite.
- Coach-list refresh preserves the training draft and clears the previous coach
  before reloading active club choices. Explicit creation and ownership remain.
- Focused frontend46/backend128, type/lint/format/build/Sites4, actual account/player/
  coach readiness UI, unchanged business fingerprints and links/CDSK pass.
  [Verification](docs/30-quality/LOCAL_COACH_PLAYER_2026-10-19.md).

## 2026-10-19 — Training plan form UI/UX

- Shared create/edit form now matches compact library dialogs: team context,
  desktop paired/mobile stacked fields,48px/16px inputs and larger mobile purpose.
- Fixed header/footer and compact coach pager preserve native local date, raw
  values, explicit submission, active-coach ownership, draft and focus behavior.
  No retained write, API/schema change or new ADR.
- Full frontend512/512, final affected44/44, type/lint/format/build/Sites4,
  responsive1440/1024/390/320/landscape and links/CDSK checks pass.
  [Verification](docs/30-quality/TRAINING_PLAN_DIALOG_UX_2026-10-19.md).

## 2026-10-19 — Add exercise dialog UI/UX

- Compact Matches/library styling now covers the existing plan attachment dialog:
  exercise/team/phase context, full plan summary/purpose and fixed footer actions.
- Mobile uses44px controls,16px select and independent body scrolling. Native
  cursors, selected plan, expected version, duplicate/uncertain-write verification,
  active-coach creation and focus return remain. No retained writes or new ADR.
- Full frontend512/512, affected32/final planning11, type/lint/format/build/Sites4,
  responsive1440/1024/390/320/landscape and links/CDSK checks pass.
  [Verification](docs/30-quality/ADD_DRILL_DIALOG_UX_2026-10-19.md).

## 2026-10-19 — Publication verification

- Final accumulated-change review passes all17 root quality stages: backend918,
  frontend509, Sites4, tooling8, type/lint/format/build, CDSK and local links.
- Fresh dedicated PostgreSQL setup6/content9/planning21 pass; operator guards8
  and9 syntax checks pass. Local output baselines and Python caches are excluded
  from Git; staged publication-hygiene scan has no findings.
- Authorized commit/push targets only codex/mvp-stabilization. Main stays at the
  verified existing ref; no deployment, migration or retained data rewrite.
  [Review](docs/30-quality/PRE_PUSH_REVIEW_2026-10-19.md).

## 2026-10-19 — Five-match senior microcycles

- BALANCED_WEEK_V6 accepts five SENIOR fixtures through existing preview/apply
  and enrolled date updates, preserving actual-hour presets and manual decisions.
- Backend918/focused48/PostgreSQL HTTP21 pass: all21 five-match weekday combinations,
  hour asymmetry, neighboring weeks, pins, cross-Monday, concurrency and rollback.
  Type/full lint/format/build and restored actual UI verification pass.
- Retained36 fixture dates unchanged. Copied edited plans/academy and32 other
  fixtures preserved; no migration. ADR-0047 / REQ-033 / CR-034 / BL-068.
  [Evidence](docs/30-quality/FIVE_MATCH_PROGRAM_2026-10-19.md).

## 2026-10-19 — Four-match senior microcycles

- BALANCED_WEEK_V5 supports four SENIOR fixtures through existing preview/apply
  and enrolled date updates, reusing actual-hour training/briefing/recovery presets.
  Manual content/time/exclusion/deletion and transactional conflict guards remain.
- Backend913/focused43/PostgreSQL HTTP19 pass: all35 four-match weekday combinations,
  asymmetric gaps, neighboring weeks, manual pins, concurrent retry and rollback.
  Type/full lint/format/build and fresh restored actual UI checks pass.
- Retained36 fixture dates unchanged; edited121/103min plans, academy and33 other
  copied fixtures preserved. No migration; ADR-0045 / REQ-032 / CR-033 / BL-067.
  [Evidence](docs/30-quality/FOUR_MATCH_PROGRAM_2026-10-19.md).

## 2026-10-19 — Repository-owned CDSK validator

- User-approved ADR-0046 resolves the external validator dependency. The default
  Node wrapper runs tracked standard-library Python with the CDSK 0.1.0 project
  profile; mandatory documents, versions, handoff, ADRs and safe paths are checked.
- Eight tooling tests include 17 real Python CLI fixture cases (16 pass, one
  Windows symlink privilege skip). Explicit overrides still fail on errors.
  Upstream parity is unverified; the local contract is explicitly documented.
  Complete root gate17/17 passes (exit0): backend913/frontend509/Sites4/tooling8,
  both builds, types/lint/format,178-file links and CDSK36 documents/46 ADRs pass.
  BL-061 closes; temporary ADR0045 collision resolved as validator ADR0046.
  [Profile](docs/30-quality/CDSK_0_1_0_PROFILE.md),
  [verification](docs/30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md).

## 2026-10-19 — Exercise detail guide and mobile pitch

- Extended the compact library/Matches language to exercise detail: text heading,
  four-fact summary and one Uygulama/Saha/Kaynak panel. Full numbered steps,
  equipment, age rules and source attribution remain available; the readonly
  pitch mounts on Saha selection.
- Mobile keeps44px actions/tabs, both primary actions together and a short summary.
  Picker close restores focus; reader retry and scope guards exclude stale content.
  Exact-age, PLAYER, publication and explicit plan-attachment boundaries remain.
- Full frontend509/509, affected29/29, final detail11/11, type/lint/format/build and
  Sites4/4 pass. Actual1440/1024/390/320 QA passes; no retained business write,
  API/schema/dependency/flag or new ADR.
  [Evidence](docs/30-quality/LIBRARY_DETAIL_UX_2026-10-19.md).

## 2026-10-19 — Three-match senior microcycles

- BALANCED_WEEK_V4 supports three SENIOR fixtures in existing preview/apply and
  date reconciliation, applying elapsed-hour recovery/preparation independently
  across consecutive gaps. Manual content/time/deletion protections stay intact.
- Expanded two/three-match regressions: backend908/focused38/PostgreSQL HTTP17
  pass, including asymmetry, adjacent weeks, manual pins, cross-Monday, concurrent
  retry, conflict and late-fault rollback. Type/lint/build/format pass.
- Fresh backup/restored actual UI verifies three fixtures and preserves edited
  plans, academy and34 other fixtures. All36 retained fixture dates unchanged.
  No migration; ADR-0044 Accepted / REQ-031 / CR-032 / BL-066 implemented.
  [Evidence](docs/30-quality/THREE_MATCH_PROGRAM_2026-10-19.md).

## 2026-10-19 — Two-match senior microcycles

- A Takım preview/apply and enrolled date updates now support two fixtures and
  adapt intervening recovery/activation/briefings to actual kickoff-hour gaps.
  Normal seven-day and academy profiles remain; early kickoff dates stay correct.
- Preserve full-event manual content/time/deletion protection; explicit preview
  time overrides now pin on apply. Manual collisions and unsupported three-match/
  same-day/sub24-hour contexts roll back the full date/program transaction.
- Backend904/focused34/PostgreSQL HTTP15, type/lint/normal+quality builds pass.
  Fresh backup/restored actual UI proof preserves edited121/103min plans, academy
  and35 other fixtures; all36 retained fixtures unchanged. No migration.
  ADR-0043 Accepted; REQ-030/CR-031/BL-065 implemented.
  [Evidence](docs/30-quality/TWO_MATCH_PROGRAM_2026-10-19.md).

## 2026-10-19 — Windows root quality tooling

- Pinned local npm CLI and portable Node invocation remove the global-npm/.cmd
  dependency. Added tested continuation mode with nonzero failure propagation.
- Added EOL checkout policy without bulk formatting; isolated Prisma generation
  and matching quality type/build avoid the active Windows engine DLL lock.
- Made Socket tests independent of local auth flags and reduced repeated history
  test queries. Real CDSK validator remains required; no fabricated pass.
- Complete root run: 16/17 stages pass; backend904/frontend498/Sites4/tooling6,
  builds/type/lint/format/links/whitespace pass. Only absent external CDSK fails,
  correctly retaining root exit1 and BL-061's open validator prerequisite.
  [Evidence](docs/30-quality/QUALITY_GATE_WINDOWS_2026-10-19.md).

## 2026-10-19 — Exercise library register and mobile previews

- Replaced the photo/metric-card catalogue with a compact Matches-style native
  list, full summary disclosures and separate preview/detail actions. Search
  stays visible; advanced filters use one scrolling Sheet with fixed actions.
- Preview loads explicitly with the response's resolved age. Uygulama/Saha tabs
  mount a readonly pitch on demand, keep actions reachable and return row focus.
  Mobile uses44px controls/16px fields; both pagers preserve scoped cursors.
  Stable debounced queries avoid repeated old-search requests while typing.
- Actual1440/1024/390/320 browser QA and29 affected tests pass. No API/schema,
  new ADR, publication/role change or retained business write.
  [Evidence](docs/30-quality/LIBRARY_UX_2026-10-19.md).

  Final checks:58/58 across library/integration/planning and board suites,
  type/lint/format/build/Sites4 pass. The initial full run
  had497/498 pass; the existing history test used detached scene-form elements.
  Re-querying live controls verifies55 edits/50 undo and its29-test file passes.
  Initial167-file link scan passed; final concurrent ADR-0043 report links remain
  pending outside this slice, as recorded in the evidence.

## 2026-10-19 — Local session survives page reload

- Enabled the existing ADR-0018 cookie/refresh mode in ignored local backend and
  frontend configuration, with exact localhost3132 origin and API4000.
- Actual dashboard/library/training reloads and a new protected tab preserve the
  authenticated user. Backend18/frontend20/disposable PostgreSQL HTTP9 pass,
  including logout/revocation/expiry. No runtime source or retained migration.
  [Evidence](docs/30-quality/SESSION_PERSISTENCE_LOCAL_2026-10-19.md).

## 2026-10-19 — Fixture-aware A Takım program updates

- Match date/time saves now reconcile enrolled senior weeks and adjacent preparation/
  recovery atomically. Complete fingerprints preserve edited, deleted, excluded,
  past/completed/attendance-bearing events. Conflicts/congestion roll back date and
  program together; same-date retries do not repeat planning. Academy unchanged.
- Added existing-design date dialog and automatic/protected result counts, with
  Turkey times, mobile controls and preserved independent analysis/board state.
- Guarded backup/restore adoption enrolled41 local weeks,631 original events and
  protected2 edited records, preserving all24415 original rows across44 tables.
  Replay adds nothing; no schema/migration or actual retained fixture edit.
- Backend896/HTTP13/frontend495, final affected27/12, enrollment1 and Sites4 pass;
  build/type/lint/format and actual responsive UI/DB checks pass. ADR-0042 Accepted;
  REQ-029/CR-030/BL-064 implemented. Root tooling remains BL-061.
  [Evidence](docs/30-quality/FIXTURE_PROGRAM_SYNC_2026-10-19.md).

## 2026-10-19 — Responsive training catalogue

- Matched the compact Matches language with a text heading, one white native
  plan register, full purpose disclosure and named detail/edit/menu actions.
- Reused existing server day queries for local date/Today/reset. Cursor/scope
  resets and stale reads remain guarded; both ends have pagination. Mobile
  stacks rows with 44px actions, 16px date input and a short statistics strip.
  Route-scoped minimum-width correction also fits 320px without page overflow.
- Full frontend 491/491 (59 files), focused 33/33, typecheck, scoped lint/format,
  build and Sites 4/4 pass; 1440/1024/390/320 actual checks passed. No retained
  write, API/schema/dependency or new ADR; lifecycle/PLAYER boundaries preserved.
  [Evidence](docs/30-quality/TRAININGS_LIST_UX_2026-10-19.md).

## 2026-10-19 — Ready-drill tablet and mobile acceptance

- Verified actual tablet1024/mobile390 filters, preview, paginated plan selection
  and explicit attachments. Existing19 May A Takım plan now103 minutes/six entries;
  original phases, source copies, linked day and earlier121-minute plan preserved.
- Added a scrollable mobile filter Sheet,44px actions/16px fields, scoped hero
  overflow correction and full selected-plan title/date/time summary.
- Focused19/19, typecheck, scoped lint/format and persistence comparison pass.
  Root Windows npm limitation remains BL-061; physical devices not certified.
  [Evidence](docs/30-quality/READY_DRILL_RESPONSIVE_BROWSER_2026-10-19.md).

## 2026-10-19 — Whole-season club program

- Extended approved examples throughout14 August2026–23 May2027 for A Takım/U8–U16;
  preserved the populated week/all36 matches. Added2009 sessions/8036 phases,
  504 meetings,1026 rest entries. Fixture-relative preparation, fixture-free
  development/rest and exact-age after-school/Saturday profiles.
- Partial weeks clip to season boundaries; out-of-season edits still conflict.
  Guarded operator preflights all weeks and resumes durable weekly transactions
  without duplicates. No migration/new API or automatic background rescheduler.
- Fresh backup/restore,44-table original-row preservation, retained zero-write
  replay and browser reads pass. Backend893/HTTP8/operator4/build/type/lint/scoped
  format pass. Root Windows/CDSK limits remain BL-061.
  [Evidence](docs/30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

## 2026-10-19 — Responsive training detail

- Matched the compact Matches language: text heading, saved-data strip and one
  flow/board/attendance panel. Numbered phases expose selection; full notes and
  frozen applications stay in the selected phase, with add controls below.
- Mobile uses 44px phase navigation and tabs, 16px selects, panel-fitting pitch
  and existing focus/playback/scene controls. Board reads remain explicit;
  snapshot identity, save/history/conflict guards and role boundaries remain.
- Full frontend 479/479 (59 files), focused tests 47/47, typecheck, scoped
  lint/format, build and Sites 4/4 pass;
  actual desktop/tablet/mobile QA passes. No retained data writes or new ADR.
  [Evidence](docs/30-quality/TRAINING_DETAIL_UX_2026-10-19.md).

## 2026-10-19 — Retained A Takım ready-drill browser acceptance

- Verified normal Chrome library → existing training attachment and in-plan
  search/preview/add. Added two authorized ready exercises to the selected
  20 October A Takım plan: 75→95→121 minutes, 4→6 entries; linked day 121.
- Confirmed snapshot content/board/duration, phase append order, duplicate
  exclusion, preserved old four rows and other 50 plans. Reopened the updated
  interface after a concurrent development reload; no attachment was repeated.
  [Evidence](docs/30-quality/READY_DRILL_RETAINED_BROWSER_2026-10-19.md).

## 2026-10-19 — Responsive tactical workspace

- Applied Matches language to tactical catalogue/editor: compact headings,
  native scoped register and explicit links; removed photos, metrics and sidebar.
- Mobile prioritizes pitch/playback/scenes, optional properties, 44px actions and
  16px fields. Fixed focus-mode pitch overlap and navigation covering controls.
- Full frontend 478/478, final affected 44/44, typecheck, scoped lint/format,
  build and Sites 4/4 pass. Actual desktop/tablet/mobile checks pass.
  Persistence, permissions, history and exports remain unchanged.
  [Evidence](docs/30-quality/TACTICS_UX_2026-10-19.md).

## 2026-10-19 — Weekly club program and mixed event calendar

- Implemented approved scoped chronological training/match/meeting/rest calendar,
  daily cursor/full totals, manual event/agenda management and confirmed deletion.
  Linked plans are shown once; meeting/rest minutes do not inflate physical totals.
- Added exact-age balanced weekly preview with time/exclusion edits and expandable
  instructions, atomic multi-team apply, stale/overlap/role guards and durable
  request/season-week replay through one additive audit enum value.
- After private backup/restore and isolated verification, applied only the exact
  weekly migration and approved Spor Manage19–25 October program:51 physical
  sessions/204 phases,13 meetings,26 rest entries across10 teams. Preserved36
  matches, existing account/staff/grants and other chats' content/tactical work.
- Backend890/frontend478/Sites4; final focused21 template/14 frontend and HTTP7
  pass. Type/lint/build, real UI create/reload/edit, age switching and three viewport
  checks pass. Root Windows npm/CDSK limitations remain BL-061; no full root-gate
  pass is claimed. ADR-0040 Accepted; CR-029/REQ-028/BL-063 implemented.
  [Evidence](docs/30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).

## 2026-10-19 — Approved local publication of 120 starter exercises

- Accepted ADR-0041 after explicit approval of the one-package local same-account
  review exception. Published all 120 unchanged starter versions atomically;
  audit records Fatih Çelebigil and the exception truthfully, not independent review.
- Added a guarded maintenance CLI and 10 passing target/transaction/replay tests.
  Backup restored and 43-table preservation verified; replay writes zero.
- Catalog/detail services expose all 120 across exact-age variants. General
  runtime review guards, accounts, migrations and tactical flag are unchanged.
  [Evidence](docs/30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

## 2026-10-19 — Approved local ready-drill migration and import

- Applied only the nullable plan-content snapshot migration to the retained
  Windows DB after private backup/restore verification; 13 migrations applied.
- Imported 120 validated starter drafts; replay created zero duplicates. Existing
  business records and the V2 pilot match the restored backup across 38 tables.
- Recorded publication permission and Fatih Çelebigil's named all-120 approval.
  His account is also the import author, so all 120 remain DRAFT under the
  ADR-0034/0039 same-account guard. ADR-0041 local exception is Proposed.
  [Evidence](docs/30-quality/READY_DRILL_LOCAL_ROLLOUT_2026-10-19.md).

## 2026-10-19 — Controlled local tactical V2 activation

- Enabled the existing V2 write flag only for the approved Windows local API;
  repository defaults remain off. No runtime contract, migration or bulk conversion.
- Took a private backup and verified a separate restore. One labelled synthetic
  CLUB pilot passed V1 save, explicit two-scene conversion and V2 save/reopen.
- Targeted 119 backend / 64 frontend tests and disposable HTTP 18/18 pass;
  V2-aware read/token/legacy guards remain required during rollback.
  [Evidence](docs/30-quality/TACTICAL_LOCAL_ROLLOUT_2026-10-19.md).

## 2026-10-19 — Ready exercises to training plans

- Added shared catalog filters, lazy instruction/board preview and explicit
  existing/new-plan attachment from the library.
- Freeze published exact-age content and duration in nullable PlanDrill snapshot;
  preserve board copies, transactional plan/day totals and legacy NULL reads.
- Recheck actor/source/publication/version; reject draft/archive and stale IDs.
  Publish the first 120-item starter release atomically after independent approval.
- Verified clean/legacy disposable migrations, idempotent import, HTTP 9/9 and
  authenticated responsive browser flows. Real expert and retained rollout pending.
  [Evidence](docs/30-quality/READY_DRILL_PLANNING_2026-10-19.md).

## 2026-10-19 — Responsive match detail workspace

- Extended the selected Matches design language to match detail: compact
  heading/back link, one saved-data summary strip, readable two-column analysis
  and one preparation/tactics panel. Removed the photograph, five separate
  metric cards and duplicate facts sidebar.
- Mobile stacks form fields with 16px input text and 44px back/tab/save targets;
  save remains clear of fixed navigation. Scoped reads, explicit writes,
  readonly roles, lazy board reads and draft/conflict guards are preserved.
- Focused 27 tests, scoped lint/format, build and 4 Sites tests pass. Browser
  desktop/tablet/mobile analysis and mobile pitch checks pass. Full frontend
  typecheck is blocked by an unrelated `TrainingPlanCatalogPage.total` use in
  the concurrently edited add-drill dialog; no clean full-quality claim.
  [Evidence](docs/30-quality/MATCH_DETAIL_UX_2026-10-19.md).

## 2026-10-19 — Guided club setup, logo and derived theme

- Implemented the approved five-step SYSTEM_ADMIN wizard in the existing design
  system: club → season → A Takım/academy → optional technical staff → review.
  Settings/empty-workspace entry, field validation, back/dirty guards and final
  scope navigation are included. Account invitations remain separate.
- Added bounded raster logo preparation/upload, two club colors, live preview
  and readable selected-club theme. Semantic status and pitch colors remain.
- Single Serializable write preserves canonical/legacy parity and creates no
  user/invitation/grant. Actor-bound request IDs, durable audit hash/result,
  concurrent replay/conflict and reload status prevent duplicate setup.
- Separately approved exact nullable color migration applied to retained local
  DB after private backup/restore rehearsal. Existing club/team/staff/match data
  remains identical to the restored snapshot; no production rollout.
- Verified 16 DTO, 6 PostgreSQL HTTP, 17 wizard/branding and final 465 frontend
  tests; prior full backend 859 passed. Browser upload/create/reload/theme and
  desktop/tablet/mobile QA passed. Root Windows npm/CDSK/checkout-EOL limitations
  tracked BL-061. Final build/4 Sites pass; global frontend typecheck currently
  hits a concurrent add-drill dialog catalog-total field error.
  ADR-0037/0038 Accepted, CR-027/REQ-026/BL-060 implemented.
  [Evidence](docs/30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

## 2026-10-19 — Responsive Matches fixture register

- Implemented the user-selected third concept with a compact heading, inline
  date/reset toolbar and native table. Tablet and mobile stack the same fixture
  information; mobile uses 44px controls and full-width Detail links. Long notes
  expand through a keyboard-accessible disclosure without dropping source text.
- Preserved scoped reads, totals, local-day bounds, stale-response protection,
  retries and cursor history. Kept the date input mounted while results reset
  so editing retains focus. No API, model, dependency or retained-data change.
- Focused 14 tests, typecheck, scoped lint/format, build and 4 Sites tests pass.
  Full frontend run: 464 passed, one unrelated tactical undo timeout; isolated
  rerun passes. Browser checks cover desktop/tablet/mobile, filter/reset,
  empty day, full notes, 25/11 pagination and detail navigation.
  [Evidence](docs/30-quality/MATCHES_UX_EXPLORATION_2026-10-19.md).

## 2026-10-19 — Matches UI/UX design exploration

- Captured the current authenticated Matches screen and generated three
  screenshot-grounded desktop directions preserving the existing API controls
  and visibly synthetic fixture labels. Visual selection is pending; no
  frontend implementation or runtime verification is claimed.
- Recorded [findings and handoff](docs/30-quality/MATCHES_UX_EXPLORATION_2026-10-19.md).

## 2026-10-19 — Spor Manage local club setup and wizard proposal

- Applied the user-approved local Spor Manage 2026-2027 setup: A Takım plus
  U8–U16, 30 visibly example staff assignments and 36 sample senior fixtures
  against 18 TFF-sourced opponent names. Season bounds use verified TFF dates;
  Spor Manage fixtures/staff are explicitly synthetic, without player seeds,
  login accounts, invitations or access grants.
- Added a guarded operator script and dedicated PostgreSQL verification. Dry
  run, unchanged replay and late-conflict rollback pass; retained replay creates
  nothing. Real browser confirms dashboard scope/counts, academy and staff.
- Recorded source/verification evidence, runbook and handoff. ADR-0037,
  CR-027 and BL-060 propose the five-step product wizard; approval is pending.
  No frontend/API, schema/migration, dependency or production change.

## 2026-10-19 — Windows local startup

- Checked out published `33442ff` on `codex/mvp-stabilization` and installed
  backend/frontend dependencies from their lockfiles.
- With explicit user approval, initialized a separate empty PostgreSQL 16
  database and bootstrapped its first local administrator. Previous-machine
  club/season/team data was not transferred; credentials are not stored here.
- All 11 migrations applied; status current, schema diff empty. Backend
  compilation, frontend/API HTTP 200 and real browser administrator login pass.
- Recorded local runtime commands and handoff. Session/V2 flags remain off;
  no application, schema, dependency or production change. Full quality was not
  repeated for startup; the external CDSK validator is unavailable locally.

## 2026-10-19 — Repository publication preparation

- Prepare accumulated approved implementation, tests, assets and CDSK records
  for commit/publication on `codex/mvp-stabilization`; do not modify `main`.
- Exclude temporary Playwright CLI recordings from Git. Local environment files,
  generated output and database data remain outside the delivery.
- Publication does not activate retained V2 writes or authorize production rollout.
- Legacy pre-commit invokes root ESLint across workspaces and reports invalid
  browser-global/CommonJS errors. Track BL-059; use explicit workspace quality
  verification rather than changing runtime code to satisfy the wrong config.
- Fresh lockfile installs completed without version changes. Explicit quality
  passed: 843 backend, 446 frontend and 4 Sites tests; typecheck/lint/format,
  builds, 143 Markdown files, CDSK and whitespace. Script syntax checks passed.
  Use command-scoped `HUSKY=0` for this publication; hooks remain configured.

## 2026-10-03 — Combined tactical acceptance (BL-058e.4)

- Added four editor JSON/static SVG/import rejection regressions and combined
  V1/V2 club-copy → plan snapshot → match HTTP tests. Full HTTP suite 18/18;
  source isolation, resource tokens, duration and flag-off compatibility pass.
- Actual routes/NestJS/disposable PostgreSQL browser flow verifies complete
  JSON and selected PNG/SVG; three viewports and bounded 12-scene/1,500-element/
  50-undo observation. Migration deploy/status/diff and root quality pass:
  843 backend / 446 frontend / 4 Sites tests.
- BL-058/REQ-025 implemented in repository; retained rollout separately pending.
  No runtime, schema, dependency, retained-data/flag, deploy, commit or push change.
  [Evidence](docs/30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).

## 2026-09-26 — Training tactical integration (BL-058e.3)

- Training detail loads only the explicitly opened phase as a whole V1/V2
  document, using additive phase provenance and existing token-bound snapshot
  writes. First snapshot save preserves undo; source edits cannot alter it.
- Conflicts, disabled writes and uncertain responses retain drafts. Explicit
  verification may acknowledge identical persisted content without resubmitting;
  different content never refreshes the draft token. PLAYER remains readonly.
- Added 16 unit/client/route regressions and two disposable HTTP scenarios;
  complete HTTP suite 16/16, migrations current and schema diff empty.
  Three-viewport real-canvas QA; mobile hero gutter overflow fixed.
- Root quality: 843 backend / 442 frontend / 4 Sites; all gates passed.
  No retained data/flag, schema, dependency, production, commit or push change.
  [Evidence](docs/30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).

## 2026-09-26 — Drill tactical integration (BL-058e.2)

- Tactics new/detail now reads board-free metadata and complete V1/V2 documents.
  Metadata and token-bound board updates are atomic; authorized club creation
  and source-checked copies preserve all scenes and server-owned identity.
- Global editorial V1 stays unchanged. Readonly roles, draft retention, busy
  fields and navigation guards are tested; mobile horizontal overflow fixed.
- Disposable PostgreSQL HTTP suite passes 14/14, including injected rollback
  and scoped payload limits; migration status and schema diff are clean.
  No retained data/flag, dependency, migration, commit or push changes.
  Root quality: 840 backend / 429 frontend / 4 Sites; all gates passed.
  [Evidence](docs/30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).

## 2026-09-26 — Match tactical integration (BL-058e.1)

- Match detail now uses authorized board-free metadata and independently loads
  the V1/V2 tactical document only when opening its tab. Token-bound saves keep
  conflicts and disabled-write drafts intact; no automatic retry/overwrite.
- Tab changes use the editor's dirty guard; confirmed discard releases the
  local draft and reopening re-reads persistence. PLAYER mutations are hidden;
  session/scope changes release old resources. Mobile timeline clipping fixed.
- Added metadata, resource and real-editor route regressions; disposable
  PostgreSQL HTTP suite passes 9/9. No retained flag/data, schema, dependency,
  production, commit or push changes. Drill/copy and plan integration remain.
  Root quality: 824 backend / 416 frontend / 4 Sites; all gates passed.
  [Evidence](docs/30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).

## 2026-09-26 — Tactical playback (BL-058d)

- Added explicit play/pause/restart/seek, 0.5/1/2 speed and loop to the opt-in
  scene editor, using the absolute-time sampler and existing Konva renderer.
- Preview locks mutations and Save; static-scene return restores editing.
  Hidden tabs, modals, scope/route changes and unmount stop playback. Reduced
  motion never auto-starts or auto-resumes animation.
- Added 15 transport/component regressions, real-canvas interpolation/source
  preservation checks and three-viewport QA. Root quality passes with
  821 backend / 405 frontend / 4 Sites tests.
- Existing route containers remain V1; V2 writes stay off. No retained data,
  schema, dependencies, production, commit or push changed. BL-058e remains.
  [Evidence](docs/30-quality/TACTICAL_PLAYBACK_2026-09-26.md).

## 2026-09-19 — Tactical scene editor (BL-058c)

- Added opt-in scene conversion/duplicate/order/confirmed removal and timing
  settings with whole-document undo, dirty state and explicit Save.
- Added typed token-preserving document clients; save errors retain drafts,
  pending writes block edits, and V2 cannot silently save through a V1 callback.
- Bounded JSON import is undoable; JSON includes all scenes, static exports name
  their selected scene. Existing route containers remain V1 pending integration.
- 36 focused tests and three-viewport synthetic canvas QA pass. No retained-data,
  write-flag, backend, schema, dependency, commit or push change.
  Final root quality: 821 backend / 390 frontend / 4 Sites; all gates pass.
  [Evidence](docs/30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).

## 2026-09-19 — Tactical V2 safe persistence (BL-058b)

- Added authorized drill, plan-phase and match document GET/PUT adapters with
  canonical write tokens and Serializable compare/write, including source
  provenance and snapshot isolation. V2 writes remain default-off.
- Guarded legacy drill/phase/bulk-replace/match/editorial writes against V2
  downgrade; old GET clients receive an explicit conflict instead of an empty
  board. Metadata-only updates preserve the document.
- Added route-scoped 600,000-byte JSON parsing with independent domain limits,
  bounded gzip and generic parser/persistence errors. Disposable PostgreSQL
  HTTP suite passes 8/8; 120 draft manifests remain valid.
- No UI/schema/migration/dependency/retained-data change, commit or push.
  Final root quality passes 821 backend, 369 frontend and 4 Sites tests plus
  build/typecheck/lint/format/CDSK/links/whitespace; disposable schema diff is clean.
  [Evidence](docs/30-quality/TACTICAL_V2_API_2026-09-19.md).

## 2026-09-19 — Tactical V2 foundation (BL-058a)

- Recorded explicit A–D approval as Accepted ADR-0036 / Approved CR-026.
- Added isolated strict V1/V2 core, bounded scenes and deterministic absolute-
  time player/goalkeeper/ball interpolation. Validated core-copy parity and
  shared synthetic fixtures with 63 tests in each app.
- Root quality passed: 788 backend, 369 frontend and 4 Sites tests plus all
  build/typecheck/lint/format/documentation gates.
- Kept legacy validators, HTTP writers and editor V1-only pending BL-058b.
  No API, DB, migration, dependency or retained-data change; 120 draft exercises
  still validate. [Evidence](docs/30-quality/TACTICAL_V2_FOUNDATION_2026-09-19.md).

## 2026-09-19 — Tactical animation contract proposal

- Prepared Proposed ADR-0036 / CR-026 / REQ-025 / BL-058: versioned scenes,
  deterministic linear playback, bounded payload and token-guarded persistence.
- Documented V1 compatibility, all-writer downgrade protection, independent
  snapshots, staged rollout and the five implementation gates.
- A–D approval remains pending. Documentation only; no code, API, database,
  dependency, runtime or migration changes. [Design](docs/10-architecture/TACTICAL_ANIMATION_V2.md).

## 2026-09-19 — Assign roster names to existing tactical positions

- Added explicit formation-slot selection and confirmation without moving,
  duplicating or changing the target marker. Old numbers are cleared, never inferred.
- Assignment supports undo/redo and the element cap; modal focus and background
  keyboard isolation are covered. Existing save and read-only behavior remain.
- No database/API changes. [Verification](docs/30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).

## 2026-09-19 — Tactical roster snapshots and unit tools

- Added current-team paged/searchable roster panel to tactics, training and
  match editors; copy names into V1 without storing Person ids or guessing
  shirt numbers. Read-only users cannot use the new mutation controls.
- Added additive selection, home/away selection, bounded unit drag/nudge,
  duplicate/delete and one-step undo. Arrow endpoints move with the unit.
- Made history/index atomic and kept Konva multi-drag separate from the single
  transform tool; PNG omits selection rings. No backend/schema/local-data write.
- [Verification](docs/30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).

## 2026-09-19 — Professional 2D tactical studio, first slice

- Replaced the editor's photo hero with a compact heading and collapsible
  exercise metadata; added pitch-focused layout, zoom/pan/fit, inspector toggle
  and focus mode with responsive tool access.
- Added shirt/disc presentation and player names; upgraded equipment drawings
  and differentiated toolbar icons. Konva and SVG share domain geometry;
  PNG excludes selection handles and exports independently of viewport zoom.
- View preferences do not modify V1 documents, undo or persistence state.
  ADR-0035 / CR-025 / REQ-024 / BL-057 track this incremental delivery.
  [Verification](docs/30-quality/TACTICAL_STUDIO_2026-09-19.md).

## 2026-09-09 — Drill review-boundary and loading UX follow-up

- Preserved ADR-0034 self-review denial while disabling approve/reject actions
  for the author before any forbidden API request; the management card now
  explains the independent football-reviewer requirement.
- Added an NGCS hydration fallback and favicon, removing the reported React Router
  loading guidance and `/favicon.ico` 404 from a clean page load. React DevTools
  remains an expected development-only message.
- Targeted library tests passed 9/9 with frontend typecheck/lint. Clean Playwright
  login load reported zero warnings/errors and `/favicon.svg` returned 200.
  No capability, content status, retained data or production state was changed.

## 2026-09-09 — Professional drill library foundation and 120 drafts

- Added immutable drill versions, age variants, source/license/checksum records,
  editorial statuses and database constraints while preserving existing Drill
  identities, plan links and snapshots.
- Added strict author/reviewer/SystemAdmin publication separation, self-review
  denial, audit events and fail-closed direct global mutation.
- Extended the published catalog with professional filters and age resolution;
  added library detail, provenance, mobile filter Sheet and management queue.
- Added a deterministic, validated and idempotent repository package containing
  120 original Turkish DRAFT exercises. No competitor/FIFA content was copied
  and no live external import was added.
- Clean PostgreSQL 16 migration/status/diff, five-record legacy backfill and
  disposable `120 imported → 120 skipped` replay passed. The two additive
  migrations were applied locally. After separate explicit user approval, all
  120 records were imported as DRAFT; replay imported 0/skipped 120. Postconditions
  confirm 120 drafts, 5 unchanged published legacy versions and 120 audit events.
  Expert review and publication remain `TBD`; production was unchanged. Root
  quality passed with 725 backend, 286 frontend and 4 Sites tests.
- Recorded ADR-0032–0034, CR-024, REQ-023 and BL-056.

## 2026-09-09 — Player 360 and account-independent player notes

- Replaced the oversized generic Player 360 hero and repeated evidence cards
  with a compact identity header, localized football profile, real activity and
  URL-backed Overview, Notes, Activity and Journey views.
- Added Person-linked, team-scoped player notes with category/follow-up filters,
  controlled same-club team sharing, optimistic version checks, immutable
  revisions and archive/restore instead of permanent deletion. Note bodies are
  excluded from security-audit metadata and application logs.
- Added strict capability/tenant/active-team authorization and the paged REST
  contracts for notes, revisions and activity. The legacy account-linked note
  model remains available for compatibility and is not used by the new screen.
- Applied the two additive migrations to the retained local database after clean
  disposable PostgreSQL 16 deploy/status/diff validation. Retained business row
  counts were unchanged and the new tables started empty.
- Recorded ADR-0031, CR-023, REQ-022 and BL-055. Disposable HTTP E2E,
  authenticated Chrome desktop QA and root quality pass with 720 backend, 285
  frontend and 4 Sites tests; no production deployment, credential reset,
  retained note mutation, commit or push occurred.

## 2026-09-09 — First-team roster center and player directory

- Changed `/app/teams/first-team` from an intermediate management card into the
  direct A Team roster center with route-preserving workspace-team alignment,
  real squad summaries, Player 360 and scoped operational links.
- Added one accessible responsive player-list presentation for the A Team,
  Players, Squad and team-detail surfaces; desktop/tablet use a native table and
  mobile uses compact card styling without duplicate content.
- Extended the paged player API with strict position/name-sort parameters,
  deterministic versioned cursors and scope-safe totals/position summaries while
  preserving the legacy parameterless ID cursor.
- Recorded ADR-0030, CR-022, REQ-021 and BL-054. Backend 712, frontend 284 and
  disposable PostgreSQL player-page E2E 2/2 passed; no schema, migration,
  dependency, retained-data, production, commit or push change occurred.

## 2026-09-09 — Separate team navigation and synthetic roster names

- Replaced the in-page A Takım/Altyapı tabs with separate sidebar and mobile
  Sheet destinations: `/app/teams/first-team` and `/app/teams/academy`.
- Kept `/app/teams` as a compatibility redirect that maps the former `view`
  query to the canonical route; team lifecycle, authorization and API behavior
  are unchanged.
- Replaced all 90 visible Demo/E2E roster labels with unique deterministic
  synthetic Turkish names. Existing account-linked Person/User display names
  remain synchronized; e-mail, password, role and session data were untouched.
- Recorded ADR-0029, CR-021, REQ-020 and BL-053. Authenticated Chrome QA and
  root quality passed with 706 backend, 279 frontend and 4 Sites tests; 121
  Markdown links, CDSK and whitespace checks also pass.

## 2026-09-09 — Local A Team and academy demo squads

- Added an explicitly gated, idempotent local squad-population script and used it
  for the retained local club/season only.
- Created A Takım, U12, U14 and U16; renamed the existing mismatched U17 record to
  U18 while preserving its identity, season history and two current players.
- Completed all five teams to 18 active players with 88 clearly named synthetic
  account-independent Persons. No birth date, e-mail, password or login account
  was invented.
- Cut the `/app/squad` read from legacy account-bound GroupMember data to the
  existing canonical paged team roster so accountless sporting identities appear.
- Verified transaction safety, audit records, team/season/roster postconditions,
  a zero-create second run, authenticated Chrome rendering and full root quality
  with 706 backend, 276 frontend and 4 Sites tests. Markdown links, CDSK and
  whitespace gates also pass. No production, reset, delete, archive, commit or
  push occurred.

## 2026-09-08 — A Takım and academy team lifecycle

- Split `/app/teams` into URL-persisted A Takım and Altyapı views, replacing the
  duplicated card/table presentation with one protected first-team card and a
  paged academy card directory.
- Added manager-only first-team create/edit and academy create/edit/archive/
  restore flows; coach/player views remain read-only and archive communication
  explicitly preserves sporting history.
- Added the strict team lifecycle REST contract, Serializable legacy/canonical
  writes, active catalogue/workspace filtering and security audit events.
- Added configurable age labels, archive timestamps and the database-enforced
  one-active-first-team-per-club invariant through an additive migration.
- Recorded ADR-0028, CR-020, REQ-019 and BL-051. Disposable PostgreSQL migration,
  clone backfill, lifecycle E2E, unit/frontend suites and live read-only browser
  QA passed; no production deploy, seed/reset, commit or push occurred.

## Local administrator credential provisioning — 2026-09-08

- With explicit user approval, created the first retained-local system admin via
  the guarded bootstrap and one same-club club admin via authenticated invitation
  and acceptance. Both accounts are ACTIVE and their real login paths passed.
- Revoked all refresh sessions created during verification through the account
  lifecycle API, leaving zero open sessions. Credentials were not written to the
  repository. No existing account was promoted and no migration, broad seed/reset
  or production operation was performed.

## Account and permission administration — 2026-09-08

- Added an admin-only, keyset-paginated account directory with strict search,
  role/status/club filters, minimum response projection and service-enforced
  tenant scope. `SYSTEM_ADMIN` can use platform/club scope; `CLUB_ADMIN` is
  forced to its own club; `COACH` and `PLAYER` are denied.
- Added `/app/settings/users` with invite, role/access, suspend/reactivate,
  password-reset and session-revoke controls backed by the existing lifecycle
  API and confirmation boundaries. One-time operator links remain ephemeral;
  SMTP mode does not expose tokens.
- Exposed the accepted technical account-role matrix and existing sporting
  capability matrix without enabling capability-grant mutation. Backend/frontend
  tests, disposable PostgreSQL 16 HTTP E2E and 1440/1024/390 browser QA pass.
  No schema migration, dependency, production deployment or retained-account
  mutation was made.

## Training plan edit, permanent delete and UI repair — 2026-09-08

- Added shared shadcn create/edit and permanent-delete Dialogs to the training
  catalogue and detail view. Edit sends only title, local date/time and purpose;
  PLAYER mutation controls stay hidden, failures retain the record/draft and
  controlled Dialogs restore focus. Active controls now use pointer and disabled
  controls use not-allowed cursors.
- Training-plan updates synchronize linked calendar projections in a Serializable
  transaction. Confirmed deletion atomically removes linked calendar days,
  attendance, phases/board snapshots and the plan behind the existing
  authorization and cause-free error boundary. No schema migration or new
  dependency was added.
- Repaired the five-card metric grid, auto-fit catalogue cards, long text/action
  wrapping and pagination/hero actions; removed the unsupported catalogue board
  status label. Targeted frontend/backend suites and disposable PostgreSQL 16
  lifecycle E2E pass; retained local records were not deleted. Final root quality
  passes with 663 backend, 268 frontend and 4 Sites tests, and the combined
  before/after visual review has no actionable P0/P1/P2 finding.

## Settings reference-system migration — 2026-09-08

- Rebuilt Settings in the approved white shadcn system with the shared
  photographic hero, four truthful user/session/team/season metrics and compact
  profile, active-context and session-security surfaces. Persistent/temporary
  session messaging, workspace season semantics, awaited logout and failure
  handling remain unchanged. Exact-size 1672×941, 1024×900 and 390×844 captures
  passed visual QA; root quality passes with 657 backend, 264 frontend and 4
  Sites tests. No API, schema, authorization or business-data change. This
  closes the approved BL-048 page-by-page visual sequence.

## Player operations reference-system migration — 2026-09-08

- Rebuilt Players, Player 360, Squad and Attendance in the approved white
  shadcn system with photographic heroes, verified scope metrics, compact
  player/plan surfaces and responsive layouts. Server search, cursor totals and
  histories, dated assignment evidence, role/tenant visibility and uncertain
  attendance-write handling remain unchanged. Twelve exact-size 1536×1024,
  1024×900 and 390×844 captures passed visual QA; root quality passes with 657
  backend, 264 frontend and 4 Sites tests. No API, schema, authorization or
  business-data change.

## Match detail reference-system migration — 2026-09-08

- Rebuilt Match detail in the approved white shadcn system with the shared
  photographic hero, five verified match facts, compact analysis/facts layout
  and the existing tactical-board editor. The independent authorized read,
  explicit analysis save, board state, import/export and dirty behavior remain
  unchanged. Six exact-size 1672×941, 1024×900 and 390×844 captures passed
  visual QA; root quality passes with 657 backend, 264 frontend and 4 Sites
  tests. No API, schema, authorization or business-data change.

## Library and Tactical Board reference-system migration — 2026-09-08

- Rebuilt the Drill Library, Tactical Board catalogue and new-board editor in the
  approved white shadcn system with photographic heroes, real server totals,
  category controls, verified editor capability guidance and compact board
  chrome. Category/kind pagination, global/club visibility, import/export,
  undo/redo, dirty navigation and authorization behavior remain unchanged.
  Nine exact-size 1672×941, 1024×900 and 390×844 captures passed visual QA;
  root quality passes with 657 backend, 263 frontend and 4 Sites tests. No API,
  schema, authorization or business-data change.

## Trainings reference-system migration — 2026-09-08

- Rebuilt the Trainings catalogue and training-detail presentation in the
  approved white shadcn system with photographic heroes, five server-backed
  catalogue metrics, compact editor summary/tabs and responsive plan/phase
  cards. Cursor history, stale/retry behavior, create semantics, on-demand board
  reads, dirty transitions, uncertain-save handling, attendance and permissions
  remain unchanged. Six exact-size 1672×941, 1024×900 and 390×844 captures passed
  visual QA. Root quality passes with 657 backend, 260 frontend and 4 Sites tests.
  No API, schema, authorization or business-data change.

## Week reference-system migration — 2026-09-08

- Rebuilt the Week presentation in the approved white shadcn visual system with
  the existing training-ground raster hero, compact previous/today/next/date
  controls and responsive seven-day cards. Local Monday–Sunday behavior, seven
  independent daily plan/match reads, full totals, cursor histories, retry and
  stale-response rejection remain unchanged. Exact-size 1672×941, 1024×900 and
  390×844 captures passed visual QA. Root quality passes with 657 backend, 258
  frontend and 4 Sites tests. Unsupported aggregates were not introduced; no
  API, schema, permission or business-data change.

## Matches reference migration — 2026-09-08

- Rebuilt the Matches presentation against the approved 1672×941 reference with
  the shared photographic hero, compact date filtering and date-grouped match
  rows. Opponent, local date/time, competition, location, result, formation,
  board state, notes and details use the existing catalogue. The daily filter
  uses local half-open boundaries and clears to the full cursor catalogue.
  Exact-size 1672×941, 1024×900 and 390×844 captures passed visual QA; root
  quality passes with 657 backend, 257 frontend and 4 Sites tests. Unsupported
  tabs, aggregates, team filter and create action remain absent; no API/schema/
  business-data change.

## Teams reference migration — 2026-09-08

- Rebuilt the Teams presentation against the approved 1536×1024 reference with
  the shared white shell, generated training-ground/category photographs,
  API-backed team cards and an accessible compact native table. Search debounce,
  stale-response protection, cursor paging, work-team selection and detail links
  remain unchanged. Exact-size 1536×1024, 1024×900 and 390×844 captures passed
  matched visual QA with no actionable P0/P1/P2. Root quality passes with 657
  backend, 256 frontend and 4 Sites tests. Unsupported aggregate and create-team
  claims remain absent; no API, schema or business-data change.

## Dashboard visual QA gate — 2026-09-08

- Retained exact-size desktop, tablet, mobile and mobile-Sheet browser captures,
  repeated the same-source comparison and closed Dashboard design QA with no
  actionable P0/P1/P2 finding. No runtime behavior or business data changed.

## Local verification follow-up — 2026-09-08

- Restarted stopped frontend/backend services with documented local session and
  retained database settings; existing coach login and Dashboard reads verified.
  Repeated desktop/tablet/mobile and mobile Sheet inspection. No application-code
  or business-data changes. Durable screenshot export remains blocked; Teams is
  gated pending an explicitly authorized screenshot-capture fallback.

## [Unreleased]

### Fixed

- Dashboard reference correction (2026-09-08): 185px white sidebar and 78px
  topbar, club footer, Inter welcome heading and new generated football
  photographs. Six server-backed metrics and a three-column panel composition
  replace the four-metric/two-panel pilot. Independent local-day training pages,
  latest/recent plans, dated/undated distribution, scoped matches and working
  quick links preserve read/role/retry boundaries. Home and login now land on
  `/app/dashboard`; title is “Ana Sayfa | NGCS”. No API/schema/data change.
  Final visual acceptance is tracked in [design-qa.md](design-qa.md).

- Local frontend port alignment (2026-09-08): Vite development and browser E2E
  defaults now use strict `3132`; backend HTTP and Socket.IO accept the same exact
  loopback origin through the shared persistent-session resolver. Root quality
  passes with 657 backend and 246 frontend tests, both builds, four Sites tests,
  CDSK/docs/static gates and the live CORS response. The database target was
  resolved read-only; no migration, seed, reset or business-data write was
  initiated. Runtime session maintenance remains possible while the backend is
  active. No credential file, commit, push or deployment was made.

### Added

- Local coach credential operation (2026-09-08): explicit user approval reset
  only `coach.local@ngcs.test` in retained `ngcs_local_session_dev`. One
  serializable transaction preserved `COACH`/`ACTIVE`/club scope, incremented
  `authVersion` to 3, revoked two open refresh sessions and zero open reset
  tokens, and wrote one token-free `PASSWORD_RESET_COMPLETED` operator audit.
  Hash/postconditions passed; browser login on canonical port 3132 succeeded and
  created one current refresh family. The generated password was returned only
  to the user and was not written to repository files. No migration, seed,
  role/club/business-data change, commit, push or deployment.

- BL-048 shell/Dashboard visual-system slice (2026-09-07): added the approved
  compact white shell, top-bar workspace selectors, route-search `⌘K`/`Ctrl+K`
  focus, generated coach hero asset, and reusable PageHero/MetricCard/SectionCard
  presentation components. Dashboard continues to use bounded real API reads for
  training, player, drill, attendance and match summaries; unsupported health and
  analytics claims remain absent. Typecheck, lint and 246 frontend tests passed.
  Authenticated design QA is blocked because local API startup has no `DATABASE_URL`;
  no database/configuration write, seed, reset, migration or deployment was made.

- BL-047 phase 5C (2026-09-07): shared presentation-only FootballCard now
  composes training, match, drill-library and tactical-board catalog cards with
  default/board/match accents. Existing detail/editor links, boardless drill
  non-link behavior, field values, fallbacks, pagination, totals and permissions
  remain unchanged. Eight proven card-only legacy selector blocks were removed.
  Four new tests, 34 targeted and quality 655/245 plus four Sites tests passed;
  1440/1024/390 browser QA completed without a data write. Phase 5 is complete;
  next: phase 6 Week module.
  [Evidence](docs/30-quality/UI_FOOTBALL_CARDS_2026-09-07.md).

- BL-047 phase 5B (2026-09-07): shared compact OptionPagination for workspace
  catalogs and assignment selectors; scoped 12px/600 type, tabular counter and
  wrapping. Original success-only workspace cursor and request-time assignment
  cursor policies, pinned selection, visibility and disabled rules retained.
  Fifteen new regressions, 39 targeted and quality 655/241 plus four Sites tests
  passed; responsive and Escape checks verified. No API/state/dependency/CSS deletion
  or real data write. Next: football cards.
  [Evidence](docs/30-quality/UI_OPTION_PAGINATION_2026-09-07.md).

- BL-047 phase 5A (2026-09-07): shared PagePagination and loading/error/empty
  patterns for Players/Teams; assignment pagination keeps its typed cursor/total
  adapter. Scoped action typography and mobile summary/action rows replace
  inconsistent wrapping. Requests, search, scope, retry and totals unchanged.
  Fourteen new tests; 26 targeted and quality 655/226 plus four Sites tests
  passed. Matched responsive/browser empty-result QA; no data write, new
  dependency or CSS deletion. Next: compact catalog pagination, then football
  cards. [Evidence](docs/30-quality/UI_DATA_PATTERNS_2026-09-07.md).

- BL-047 phase 4B.2 (2026-09-07): sporting assignment dialog uses shared
  FormField, owned native-select presentation, scoped footer type and local
  short-viewport scrolling. Native selection/validation, paginated catalogs,
  five mutation dispatches, UTC date and failure/reset behavior retained.
  Only unused assignment CSS removed. Fifteen new tests, quality 655/212 and
  four Sites tests passed; matched responsive and keyboard checks without a real
  assignment write. Phase 4 selected targets complete; next: phase 5 data display.
  [Evidence](docs/30-quality/UI_ASSIGNMENT_DIALOG_2026-09-07.md).

- BL-047 phase 4B.1 (2026-09-07): training creation dialog uses shared field/error
  presentation, consistent footer typography and local short-viewport scrolling.
  Existing title/date gate, local-date ISO conversion, payload and create/reload/
  navigate sequence retained; no new submit/validation/dirty behavior. Nine new
  tests; quality 655/197 and four Sites tests passed, matched responsive and short
  viewport keyboard checks completed without creating a plan. Next: sporting
  assignment dialog. [Evidence](docs/30-quality/UI_PLAN_DIALOG_2026-09-07.md).

- BL-047 phase 4A (2026-09-07): Login, invitation acceptance and password reset
  use shared FormField/FormError, shadcn Input/Button and PageActions. Native
  validation, fragment token handling, payloads, busy/errors/retry and redirects
  retained; 16 new tests, quality 655/188 and four packaging tests passed.
  NGCS public shell retained; measured field/action density and error surfaces
  converge without a global reset. No real account mutation or new dependency.
  Next: phase 4B training creation and assignment dialogs.
  [Evidence](docs/30-quality/UI_ACCOUNT_FORMS_2026-09-07.md).

- BL-047 phase 3 pilot (2026-09-07): shared PageContainer/Header/Actions for
  Dashboard and Settings, scoped action typography, named mobile user menu with
  visible avatar. Eight new regressions; quality 655 backend/172 frontend and
  four packaging tests passed. Matched 1440/1024/390 layout checks and mobile
  keyboard/settings navigation verified. No API/session/business/dependency change.
  Next: phase 4 forms/dialogs; broader layout consumers remain phase 6.
  [Evidence](docs/30-quality/UI_LAYOUT_PILOT_2026-09-07.md).

- BL-047 phase 2 (2026-09-07): 12 regression tests for Select, DropdownMenu,
  Tooltip, ScrollArea, retained display primitives and real Sonner behavior.
  Quality 655 backend/164 frontend and four packaging tests passed; current
  local keyboard menu/tooltip/select, notification and final-tool reachability
  verified without saving business data. Existing native-control font inheritance
  is measured and assigned to per-consumer phase 3/4 migration; long internal
  board overflow remains phase 6/8 QA. Tests/docs only, no runtime/CSS/API or
  dependency change. Next: shared page layout pilot and mobile account-menu fix.
  [Evidence](docs/30-quality/UI_PRIMITIVES_VERIFICATION_2026-09-07.md).

- BL-047 phase 1 (2026-09-07): classified UI inventory and eight-phase shadcn
  migration plan; centralized NGCS/semantic tokens, explicit legacy muted-text
  compatibility, inactive dark palette, unchanged-value layout/modal dimensions
  and 13 existing primitive surface bindings. No new dependency, route, API,
  business/session logic or domain renderer. Nine new regressions; quality
  655 backend/152 frontend and four packaging tests passed. Matched dashboard
  1440/1024/390 and new-plan dialog comparisons preserve the visual identity;
  Escape/focus-return smoke passes. Existing mobile account-menu naming and form
  spacing issues remain assigned to later phases. Migration is not complete.
  [Plan](docs/20-execution/UI_MIGRATION_PLAN.md),
  [evidence](docs/30-quality/UI_MIGRATION_FOUNDATION_2026-09-07.md).

- Local operation (2026-09-07): user-approved targeted coach password reset in
  the retained development database. Auth version incremented, one refresh
  session revoked, no open reset tokens remained. Password hash and unchanged
  business/other-account fingerprints verified inside the serializable
  transaction; token-free operator audit added. No credential stored in files,
  no role/status/club or application/schema change; HTTP login not exercised.

- BL-045 (2026-09-07): shared explicit all-seasons labels in sidebar, top bar,
  week, dashboard and settings; actual missing seasons keep TBD. Corrected the
  inverse top-bar fallback too. Six helper/four component regressions; focused
  33 and root quality 655/143 unit passed. Local browser exact/all transitions
  verified; existing dev servers restarted, retained business data unchanged.
  Frontend presentation only; no API/filter/schema/permission/dependency changes.
  BL-043 pilot acceptance, BL-044/009 and M4 remain open approval gates.
  [Evidence](docs/30-quality/BL045_SEASON_LABELS_2026-09-07.md).

- BL-043j (2026-09-07): opt-in mixed five-GET/two-attendance-write benchmark
  and separate SELECT row-work evidence across three clean-start databases.
  At 30/300 players and 150/1,500 plans: 47 batch SQL events; plan count scan-row
  emissions grow 150→1,500. Settled totals, uniqueness, same-key races and denied
  writes verified. Quality 655/133 unit; API 48 pass/3 opt-in skip. No fresh
  browser claim. Six migrations/status/diff clean in all three disposable DBs;
  all removed, retained business data unchanged. Test/docs only; no runtime,
  schema, dependency or permission changes. BL-043 pilot acceptance stays open
  with owner/workload/environment/budgets TBD; next independent item BL-045.
  [Evidence](docs/30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md).

- BL-046c (2026-09-07): opt-in matched valid-board benchmark passed in three
  separate runs. At 50 phases: 996,545 legacy versus 24,040 combined metadata/
  selected JSON bytes (97.59% smaller); two new GETs use 12 SQL events versus
  6 for the old GET. No production SLO claim. Browser regression now changes
  source after snapshot save and confirms isolation. Quality 655/133 unit,
  API 48 pass/2 opt-in skip, Chromium 12/12 and three viewport checks passed.
  BL-046/CR-017 implementation closed; broader BL-043 and M4 remain open.
  Tests/docs only; runtime, schema and dependencies unchanged.
  [Evidence](docs/30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).

- BL-046b (2026-09-07): training detail now uses lightweight phase metadata and
  explicitly opened boards. Coordinated dirty transitions, stale-response guards,
  first-snapshot history and explicit uncertain-write reconciliation preserve
  drafts without autosave. Fixed first-create tactics redirect remount regression.
  Quality passed (655 backend / 133 frontend unit), API 48 pass / 1 opt-in skip,
  Chromium 12/12; three viewport checks retain the existing mobile board scroll.
  Backend/schema/dependencies and retained business data unchanged. BL-046c
  matched 2/50-phase measurement remains open.
  [Evidence](docs/30-quality/BL046_EDITOR_FRONTEND_CUTOVER_2026-09-07.md).

- BL-046a (2026-09-07): ADR-0025 Option A accepted; additive authenticated
  metadata and single effective-board GETs, strict source checks, null-aware
  snapshot priority and invalid-content suppression. Old GET/POST/PUT contracts
  preserved; frontend, schema and dependencies unchanged. Root quality passed
  (655 backend / 115 frontend tests), 48 API E2E passed with one opt-in skip;
  new coverage is 43 unit and 8 HTTP cases. Disposable migration/diff clean;
  test DB removed and retained business fingerprint unchanged. Frontend cutover
  and matched measurement/browser QA remain BL-046b/c.
  [Evidence](docs/30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md).

- BL-046 design (2026-09-07): Proposed ADR-0025 Option A and implementation
  contract for metadata/selected-board reads, explicit phase-open UX, source
  authorization and coordinated dirty/history transitions. Backend/frontend/
  measurement slices defined; no API or runtime implementation, schema change,
  phase limit or production budget approved. Documentation-only verification;
  application suites and databases not run or changed in this delivery.
  [Design](docs/10-architecture/BL046_EDITOR_READ_DESIGN.md).

- BL-043i (2026-09-07): opt-in mixed-read benchmark with synthetic page/query
  regression guards; three repeat runs at 30/300 members and 1/3 five-read
  groups. Observed 36 queries and about 16 KB per group; not production capacity.
  Editor graph growth (34,394→853,304 bytes for 2→50 synthetic phases) tracked
  as BL-046 / Proposed CR-017. No runtime/API/schema/index/dependency changes.
  Root quality and 40 API regressions passed; benchmark passed separately three
  times. Disposable migration/diff clean; synthetic DB removed, retained data
  unchanged. Browser E2E not rerun for this test/document-only change.
  [Measurement](docs/30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).

- BL-043h.2 (2026-09-07): plan-authorized, player-self-filtered attendance
  pages with full counters and minimal status projection; editor detail omits
  complete attendance and group members. Shared members fetch/state removed.
  Explicit serialized attendance writes re-read the same page; failed reads
  never repeat successful writes. Existing full APIs and write guards remain.
  Root quality, 612 backend/115 frontend unit and 40 API E2E passed. No schema,
  migration, dependency or permission-policy change.
  Final Chromium 12/12 and three viewports passed; disposable migration/diff
  clean and test DB removed. Retained 24-table/25-row fingerprint unchanged.
  [Verification](docs/30-quality/BL043_ATTENDANCE_MEMBER_CUTOVER_2026-09-07.md).

- BL-043h.1 (2026-09-07): bounded authenticated player-membership page with
  existing group/role authority, minimal user projection and cursor-independent
  total. Kadro uses 25-record pages; dashboard player count uses limit=1/full
  total, independent retry and scope reset. Training-detail attendance still
  needs shared members; final full-member cutover is deferred to h.2.
  Root quality, 597 backend/109 frontend unit, 40 API and 12 Chromium E2E
  passed; three viewports verified. Disposable migration/diff clean; synthetic
  database removed and retained 24-table/25-row fingerprint unchanged.
  No schema/migration/dependency/write or permission-policy change.
  [Verification](docs/30-quality/BL043_MEMBER_READS_2026-09-07.md).

- BL-043g.5 (2026-09-07): scoped single-match detail and metadata-only workspace
  endpoints preserve current authority and existing complete-list contracts.
  Frontend shared matches state/fetch is removed; detail owns read/draft/retry,
  shell count uses catalog limit=1/full total with distinct failure and zero
  states. Root quality, 581 backend/104 frontend unit, 39 API and 11 Chromium
  E2E passed. Three viewports verified; retained data unchanged. Disposable
  migration/diff clean and synthetic database removed.
  No schema/migration/dependency/write-contract or permission-policy change.
  [Verification](docs/30-quality/BL043_MATCH_CUTOVER_2026-09-07.md).

- BL-043g.4 (2026-09-07): Hafta reads independent 25-record daily match pages
  with full totals, local half-open/DST-safe bounds, separate retry/pagination
  and scope/week reset. Confirmed training and match totals govern empty days;
  missing concrete-season context never widens the request. Compact accessible
  controls preserve the existing amber cards. Shared matches still serve detail
  and the shell notification count; this previously omitted cutover dependency
  is now explicit. Root quality, 571 backend/98 frontend unit and 39 API E2E
  and final 11 Chromium E2E passed. Retained data unchanged; disposable
  migration/diff clean and synthetic database removed. No backend/API/schema/
  permission change.
  [Verification](docs/30-quality/BL043_WEEK_MATCH_READS_2026-09-07.md).

- BL-043g.3 (2026-09-07): dashboard match summary uses the existing catalog
  with limit=3/no cursor, preserving chronological cards and adding full-total
  context. Shared matches are no longer consumed here; week/detail still need
  them. Scalar hasBoard, independent retry and scope/missing-season guards are
  verified. Root quality, 571 backend/93 frontend unit, 39 API/11 Chromium E2E
  passed. Retained data unchanged; disposable migration/diff clean and test DB
  removed. No backend/API/schema/permission change.
  [Verification](docs/30-quality/BL043_DASHBOARD_MATCH_READS_2026-09-07.md).

- BL-043g.2 (2026-09-07): Maçlar uses independent 25-record match catalog
  pages/full totals, scalar board presence, scope reset, stale-response rejection
  and independent retry. Existing shadcn cards/detail links remain; missing
  concrete-season context never broadens to all seasons. Shared matches remain
  for dashboard/week/detail. Root quality, 571 backend/89 frontend unit and
  39 API/11 Chromium E2E passed; responsive 25+6 browsing verified. Retained
  data unchanged; disposable migration/diff clean and synthetic database removed.
  No backend runtime/API/schema/permission change.
  [Verification](docs/30-quality/BL043_MATCH_CATALOG_UI_2026-09-07.md).

- BL-043g.1 (2026-09-07): authenticated minimal match catalog with current
  group/season ownership, chronological keyset pages, full totals and optional
  half-open local periods. Page-only board presence reads avoid JSON transfer.
  No schema/migration/dependency, permission, write or frontend change; shared
  matches remain until all consumers migrate. Root quality, 571 backend/84
  frontend unit and 39 API E2E passed. Disposable migration/diff clean and test
  database removed; retained business data unchanged. Browser suite not rerun.
  [Verification](docs/30-quality/BL043_MATCH_READ_FOUNDATION_2026-09-07.md).

- BL-043f.4 (2026-09-07): training-detail drill options use independent minimal
  pages with off-page selection and attached-ID exclusion. The last shared
  full drill fetch/state is removed. Existing single-add POST replaces the
  frontend replacement PUT, preserving prior row IDs and board snapshots;
  post-write refresh failures offer GET-only retry. No backend/schema or
  permission-policy change. Root quality, 538 backend/84 frontend unit and
  38 API/11 Chromium E2E passed. Disposable migration/diff clean and test DB
  removed; retained data unchanged.
  [Verification](docs/30-quality/BL043_DRILL_CUTOVER_2026-09-07.md).

- BL-043f.3 (2026-09-07): optional board-kind filter intersects the authorized
  drill catalog before pagination/counting. Tactics now owns 25-record minimal
  pages, full totals, scope reset and retry; shared drills remain for training
  detail only. Board/category distinction, current access and editor actions
  are preserved. No schema/migration/dependency or permission-policy change.
  Root quality, 538 backend/78 frontend unit and 38 API/11 Chromium E2E passed;
  initial API scale-test timeout and unchanged successful repeat are recorded.
  Retained data unchanged; disposable migration/diff clean and test DB removed.
  [Verification](docs/30-quality/BL043_TACTICS_PAGINATION_2026-09-07.md).

- BL-043f.2 (2026-09-07): dashboard exercise total reads the existing catalog
  with limit=1, renders the full total and no longer consumes shared drills.
  Scope resets, stale-response rejection and independent loading/error/retry
  preserve existing counters and shadcn cards. Tactics/training detail still
  need the shared list. No backend/API/schema/migration/permission change.
  Root quality, 532 backend/73 frontend unit and 38 API/11 Chromium E2E passed.
  Browser verified 35→36 total after drill creation; retained data unchanged,
  disposable migration/diff clean and synthetic test database removed.
  [Verification](docs/30-quality/BL043_DASHBOARD_DRILL_READS_2026-09-07.md).

- BL-043f.1 (2026-09-06): authenticated minimal drill catalog with stable keyset
  pages, full age/category totals and existing role visibility. Exercise Library
  uses independent 25-record pages, server category filtering, scope reset and
  retry; board JSON is not transferred in card reads. Shared full drill reads
  remain for other consumers. No schema/migration/dependency or permission change.
  Root quality, 532 backend/70 frontend unit and 38 API/11 Chromium E2E passed;
  retained business data unchanged and disposable test database removed.
  [Verification](docs/30-quality/BL043_DRILL_LIBRARY_2026-09-06.md).

- BL-043e.5 (2026-09-06): bounded attendance-plan projection with page-local
  PRESENT counts and full current-player/plan totals; PLAYER remains self-only.
  Attendance UI gains independent pages, scope reset and retry. With all four
  plan consumers separated, the workspace full-plan fetch/state is removed.
  Drill-write/catalog refresh regression remains covered. Legacy REST list,
  detail/write contracts, schema/migrations and permission policy are unchanged.
  Root quality, 508 backend/65 frontend unit and 37 API/11 Chromium E2E passed;
  retained data unchanged and disposable test database removed.
  [Verification](docs/30-quality/BL043_ATTENDANCE_CUTOVER_2026-09-06.md).

- BL-043e.4 (2026-09-06): week training reads use independent 25-record local-day
  pages with full daily totals, stale-scope protection and actionable retry.
  The catalog adds validated paired half-open from/until filters (max eight
  elapsed days) intersecting existing tenant/season scope. Week URL changes keep
  context; undated drafts remain in the catalog. No schema/migration/security
  policy change. Attendance still needs the shared full plan read.
  Root quality, 504 backend/60 frontend unit and 36 API/11 Chromium E2E passed;
  disposable migration/diff clean and retained business data unchanged.
  [Verification](docs/30-quality/BL043_WEEK_READS_2026-09-06.md).

- BL-043e.3 (2026-09-06): dashboard training/PRESENT counters use full server
  summaries and recent cards use a three-record scalar projection. Scope-safe
  reads, unavailable/loading/error states and independent retry are verified.
  Week/attendance still retain the shared full plan read; no full workspace
  optimization or backend/schema/migration/security change is claimed.
  Root quality, 492 backend/55 frontend unit and 35 API/11 Chromium E2E passed.
  [Verification](docs/30-quality/BL043_DASHBOARD_TRAINING_READS_2026-09-06.md).

- BL-043e.2 (2026-09-06): training catalog UI consumes 25-record pages with full
  server totals, scalar phase counts, scope resets, stale-response protection,
  retry and explicit empty continuation. Create failures remain actionable.
  Shared full plan reads are retained for dashboard/week/attendance; complete
  workspace read optimization is not claimed. No API/schema/migration change.
  Root quality, 492 backend/50 frontend unit and 35 API/11 Chromium E2E passed.
  [Verification](docs/30-quality/BL043_TRAINING_CATALOG_UI_2026-09-06.md).

- BL-043e.1 (2026-09-06): additive authenticated training catalog pages with
  full-scope plan/duration/PRESENT totals, null-date/draft-safe keysets and
  PLAYER-only self-attendance counts. EXPLAIN evidence narrowed phase aggregation
  to returned plan IDs. 492 backend/44 frontend unit, 35 API E2E and root quality
  passed. No frontend cutover, index/schema/migration, retained business write or
  production change. Shared consumer separation and pilot capacity remain open.
  [Evidence and next steps](docs/30-quality/BL043_TRAINING_READ_FOUNDATION_2026-09-06.md).

- BL-043d (2026-09-06): selected legacy workspace metadata with independent
  group authorization replaces whole group/season catalogs. Complete all-seasons
  matches use one relational read. Player 360 assignment options load only in the
  open dialog with 25-record team/PLAYER-role pages and pinned explicit choices.
  Old APIs and mutation authority remain unchanged. 468 backend/44 frontend unit,
  33 API/10 Chromium E2E and root quality passed; no schema/migration/dependency
  or retained business write. Business-list/aggregate contracts, query plans and
  pilot capacity remain open.
  [Verification](docs/30-quality/BL043_LEGACY_METADATA_2026-09-06.md).

- BL-043c (2026-09-06): dated roster and Player 360 assignment keyset pages,
  full filtered counters independent of visible rows, explicit asOf, stale-read
  protection and retry. Existing array contracts and permission policy remain;
  person capability now checks relational existence without full assignment
  arrays. 456 backend/41 frontend unit, 32 API/9 Chromium E2E and root quality passed.
  No new migration/dependency or retained business write. Legacy metadata,
  assignment-dialog options and pilot capacity remain open.
  [Verification](docs/30-quality/BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

- BL-043b (2026-09-06): additive bounded team/club/season catalogs and a separate
  workspace selection resolver; team server search and shadcn page controls.
  Selected records remain available outside the current page; browsing a catalog
  does not change scope. Current grants filter every query and each team carries
  at most one season summary. 432 backend / 35 frontend unit, 31 API and 8 Chromium E2E tests
  passed with root quality. No schema/migration, new dependency or retained
  business-data change. Roster/history and pilot capacity remain open.
  [Verification](docs/30-quality/BL043_WORKSPACE_CATALOGS_2026-09-06.md).

- BL-043a (2026-09-06): additive team-scoped player page API with bounded ID
  keyset reads, server search, current capability/self filters and one current
  assignment per card; shadcn previous/next, retry and stale-scope protection.
  416 backend / 30 frontend unit, 30 API and 7 Chromium E2E tests passed. Local
  1,000-player / 3,000-assignment measurement recorded; pilot/SLO values remain
  TBD. No schema/migration or retained business-data change. Team and assignment
  pagination remain open under BL-043.

- Controlled local P0.1 rollout (2026-09-06): private backup and isolated restore
  rehearsal verified; the two pending accepted migrations were applied only to
  `ngcs_local_session_dev`. Six migrations current, empty schema diff, both clubs
  IN_SYNC, 26 legacy tables / 83 rows preserved. Local 3001/4000 servers and
  retained-session sporting/training/match browser smoke passed. No reset, seed,
  password change or production rollout. See
  [local rollout evidence](docs/30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).

- BL-042 / P0.1b (2026-09-06): shared transactional legacy-to-sporting adapter for
  group, membership, season and account identity; history-preserving removal,
  current-time capability revocation, count-only admin parity endpoint and
  user-specific Club/Season/Team scope selector. Scope changes use the existing
  dirty-navigation guard; stale requests and cross-team season fallback are
  contained. 396 backend unit, 27 frontend unit, PostgreSQL 29/29 and Chromium
  opt-in 6/6 verified. No new migration or retained/production rollout.

- Accepted ADR-0021–0024 / CR-016 / BL-039–041 (2026-09-06): Phase 2 P0.1
  Person/account, Team/ClubSeason/TeamSeason, işlevsel rol/capability ve etkili
  tarihli SportingAssignment additive temeli; tarihsel takım kadrosu ve izin
  filtreli Player 360 API'si; shadcn Takımlar/Oyuncular/Player 360 rotaları.
  Legacy-verili backfill primarilik tahmin etmeden `LEGACY_MEMBER` üretir.
  Sporting unit 17/17, disposable PostgreSQL backend E2E 28/28, schema diff ve
  Chromium 4/4 (bir opt-in skip) responsive akış geçti. Retained DB ve production
  rollout yapılmadı; dual-write, kalıcı scope cutover, pagination ve
  minor/safeguarding BL-042–044'te. Tarihsel Player 360 gelecekteki atamaları
  göstermez; açık veya sınırlı birincil atama dönem çakışmaları reddedilir. Root
  kalite 396 backend ve 23 frontend testiyle geçti.
- Accepted ADR-0020 / CR-015 / BL-011 (2026-09-06): production'da zorunlu
  vendor-neutral Nodemailer SMTP portu ve fail-closed config, development/test
  operator fallback'i, no-store/no-token issuance sözleşmesi, fragment tokenını
  temizleyen public invitation/reset rotaları, delivery failure revoke + generic
  503 ve yalnız mevcut SYSTEM_ADMIN için atomik/auditli break-glass recovery.
  Additive audit migration eklendi; provider/account/DNS/ücretli kaynak, korunan
  yerel DB migration'ı ve production rollout yapılmadı. Root quality 379 backend/
  23 frontend testle; disposable PostgreSQL beş migration/boş diff, fake-SMTP
  backend E2E 27/27 ve break-glass ACTIVE/authVersion/audit/revoke provasıyla geçti.
- Accepted ADR-0019 / CR-014 / BL-036 (2026-09-06): attendance duplicate
  durumunda veri silmeyen fail-fast migration, `(planId, playerId)` unique
  constraint, atomik upsert, son-commit-kazanır davranışı ve geri dönüş kapıları.
  Retained envanter 0 satır/0 duplicate; ayrı açık onayla yerel çalışma DB'sine
  reset yapmadan uygulandı ve unique index doğrulandı. Clean/duplicate PostgreSQL
  kanıtı, 24 focused unit, concurrent HTTP dahil 26/26 E2E ve root quality geçti.
- BL-024 onuncu dilimi / BL-038 (2026-09-06): training-plan mutation hata
  containment'ı için on bir regresyon; toplam 122 focused training-plan testi,
  32 backend suite/371 test ve disposable PostgreSQL 25/25 E2E. Onaylı MVP için
  BL-024/F-008 kapanış envanteri.
- BL-024 dokuzuncu dilimi / BL-037 (2026-09-06): season/week/day/match mutation
  hata containment'ı için sekiz regresyon; toplam 42 focused season testi,
  31 backend suite/360 test ve disposable PostgreSQL 25/25 E2E.
- BL-024 sekizinci dilimi (2026-09-06): attendance lookup/update/create hata
  containment'ı için üç regresyon; toplam 27 focused attendance testi, 351 backend
  testi ve disposable PostgreSQL 25/25 E2E. Attendance tekillik riski için
  F-013/CR-014/BL-036 Proposed kaydı; migration uygulanmadı.
- BL-024 yedinci dilimi (2026-09-06): club update ve drill create/update/delete
  hata/body sınırı için 12 yeni regresyon ve bir gerçek HTTP/Prisma senaryosu;
  toplam 56 focused club/drill testi ve 25/25 backend E2E. F-012/BL-034 kaydı.
- BL-024 altıncı dilimi (2026-09-06): grup update/delete ve üyelik add/remove
  hata yolları için 11 yeni error-boundary testi ve bir gerçek HTTP/Prisma
  senaryosu; toplam 56 focused group testi ve 24/24 backend E2E. F-011/BL-033
  kısmi üyelik kaybı bulgusu ve doğrulama kaydı.
- BL-024 beşinci dilimi (2026-09-06): kulüp/grup runtime DTO'ları için 84
  focused regresyon ve bir gerçek HTTP/Prisma senaryosu; toplam 23/23 backend E2E.
  F-010/BL-032 kulüp-create mass-assignment bulgusu ve yetki-sırası incelemesi.
- BL-024 dördüncü dilimi (2026-09-06): sezon/hafta/gün/maç için 31 yeni unit ve
  iki HTTP/Prisma regresyonu; disposable PostgreSQL 16 üzerinde 22/22 backend E2E.
  F-009/BL-031 nested-write bulgusu ve doğrulama kaydı.
- BL-024 üçüncü dilimi: plan create/update için 58 unit ve iki gerçek HTTP/Prisma
  regresyonu. Disposable PostgreSQL 16'da 20 backend E2E geçti; korunan demo DB
  kullanılmadı. Plan identity/null-clear/date-offset/invalid-write kontrolleri.
- BL-024 ikinci yerel dilimi: grup create hatasının gerçek Nest exception filter
  üzerinden veri sızdırmadan işlenmesi, yoklama ve tek faz ekleme için 51 yeni
  regresyon; mevcut yetki ve başarılı mutation sözleşmeleri korunur.
- BL-024 ilk yerel dilimi için 42 backend regresyonu: analytics alan eleme/dönüşüm,
  opsiyonel sezon bağlantısı log minimizasyonu ve plan-drill replace girdi sınırı.
- Kullanıcı tarafından asistana devredilen yerel demo seçimleriyle ilk 75 dakikalık
  dört fazlı antrenman kaydı ve browser/DB kalıcılık kanıtı; katılım boş bırakıldı.
- Yerel kalıcı oturum/new-tab/reload, hafta ve koç ekranları için etkileşimli smoke
  kanıtı; yeni taktik taslağının yanlış “Kaydedildi” etiketi için BL-029/P3.
- M4 staging/production karar girdileri, sıralı onay kapıları ve BL-028 rollout
  hazırlığı; domain/provider/bütçe/bölge/owner değerleri TBD bırakıldı.
- Production browser rollback için session flag-off CORS'un localhost'a dönmesi
  rollout kapısı olarak kaydedildi; runtime davranışı değiştirilmedi.
- Accepted ADR-0018: varsayılan kapalı, provider-neutral kalıcı oturum; 15m access,
  7d idle/30d absolute refresh, beş aktif family ve 30d refresh-record retention.
- Additive RefreshSession migration'ı, hash-only credential lineage, atomik rotation,
  replay audit'i ve login/refresh/logout origin/header kontrolleri.
- Reload bootstrap, tek refresh isteği ve sekmeler arası Web Locks, güvenli logout
  ve family-bound HTTP/Socket revocation için unit/PostgreSQL/browser regresyonları.

- CDSK 0.1.0 proje manifesti, çalışma protokolü ve zorunlu bilgi mimarisi.
- Doğrulanmış mevcut durum, dar MVP kapsamı, riskler ve AI handoff kaydı.
- CDSK benimsenmesi ve MVP kapsamı için kabul edilmiş ADR'ler.
- Auth DTO doğrulaması, request throttling ve güvenlik regresyon unit testleri.
- Authentication/bootstrap güvenlik tabanı için Accepted ADR-0004.
- Global `SYSTEM_ADMIN` ile kulüp kapsamlı `CLUB_ADMIN`, `COACH` ve `PLAYER`
  sınırlarını tanımlayan Accepted ADR-0005.
- Prisma şema/migration drift envanteri ve veri korumalı rol geçişi için Accepted
  ADR-0006.
- `SYSTEM_ADMIN`, `CLUB_ADMIN`, atanmış-grup `COACH` ve özne/grup kapsamlı `PLAYER`
  eylemlerini tanımlayan Accepted ADR-0007.
- Ortak authorization service ile current-database principal, cross-club negatif
  unit/E2E testleri ve authenticated Socket.IO regresyon testleri.
- Destructive E2E temizliği için ayrı test URL'si ve açık reset onayı zorunluluğu.
- Frontend repository topolojisi için Accepted ADR-0003 ve framework-neutral
  `apps/frontend` workspace belgesi.
- Invitation-only provisioning, suspension, session revocation, password reset ve
  security audit politikasını tanımlayan Accepted ADR-0008.
- Hesap daveti/reset token tabloları, `ACTIVE`/`SUSPENDED` durumu, `authVersion` ve
  lifecycle unit/E2E testleri.
- Koçu birincil persona; React/TypeScript, React Router SPA, Vite ve npm'i frontend
  tabanı; haftalık sezon-plan-katılım akışını ilk dikey dilim kabul eden ADR-0009.
- Seçilen “Koç Operasyon Masası” yönünü uygulayan responsive frontend; login,
  haftalık antrenman, katılım ve maç taktik notu akışları ile tarayıcı destekli
  görsel QA kanıtı.
- Gerçek koç login → atanmış takım/sezon → antrenman planı → katılım akışını
  doğrulayan fail-closed dedicated-DB fixture/runner ve Playwright browser E2E testi.
- Yetkili sezon maçını yükleyip rakip/taktik analiz JSON'u, diziliş ve koç notunu
  kalıcılaştıran bağımsız ikinci Playwright browser E2E senaryosu.
- Yaş grubuna uygun katalogdan dört fazlı drill seçimi ve faz notu kalıcılığını
  doğrulayan üçüncü Playwright browser E2E senaryosu.
- Backend/frontend typecheck, salt-okunur lint/format, unit test, izole-output build,
  Sites, Markdown link, CDSK ve diff adımlarını birleştiren kök `npm run quality`
  kapısı.
- Fresh clone kalite akışında typecheck öncesi Prisma Client üreten explicit kapı.
- Aynı site altındaki production frontend/API origin'leri ile dönen, server-side
  revoke edilebilir kalıcı tarayıcı oturumunu seçenekleri ve rollout kapılarıyla
  tanımlayan Accepted ADR-0010.
- shadcn/Radix, Tailwind, Phosphor ve React-Konva ile beş rotalı koç çalışma
  alanını kabul eden ADR-0011.
- `TacticalBoardDocumentV1`, `DrillScope`, kulüp/grup egzersiz sahipliği, plan
  snapshot'ı ve maç tahtası sınırlarını kabul eden ADR-0012.
- Tam/yarım/üçte bir/çeyrek, 7v7, 5v5, antrenman, grid, penaltı, korner ve serbest
  vuruş sahaları; oyuncu/ekipman/çizim araçları; formasyon, Transformer, grid-snap,
  50 adım undo/redo, açık save ve NGCS JSON/PNG/SVG aktarımı sunan taktik editörü.
- Kulüp egzersizi, antrenman snapshot'ı, maç tahtası ve çapraz tenant reddini
  doğrulayan iki kulüplü Playwright E2E.
- Eski “Koç Operasyon Masası” arayüzündeki MVP destek girişlerini güncel shadcn
  shell'e taşıyan Accepted ADR-0013; Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve
  Ayarlar rotaları.
- Üst menü araması, takım/sezon bağlamı, bildirim, shadcn Avatar/DropdownMenu ve
  mobil tam navigasyon Sheet'i.
- Genişletilmiş shell için masaüstü/mobil browser kanıtı ve kaynakla birleşik
  `design-qa.md` karşılaştırması.
- Dokuz masaüstü rota ve düzeltilmiş mobil kanıtı sıralı, düzenlenebilir kartlarda
  birleştiren doğrulanmış Figma UI audit panosu.
- `1b831e0` revision'ını ürün, backend, yetki, Prisma, frontend, taktik tahta,
  test ve CDSK katmanlarında doğrulayan tam MVP review raporu; endpoint matrisi,
  requirement izlenebilirliği ve önceliklendirilmiş BL-017–BL-025 backlog'u.
- Group/event sharing ve password-reset transaction karar kapıları için Proposed
  CR-009 ve CR-010.
- Disposable PostgreSQL 16 migration/status/schema diff, backend 7/7 E2E,
  frontend 2/2 Playwright E2E ve 1440/1024/390 runtime audit kanıtı.
- Dashboard/aggregate/Socket group izolasyonunu kabul eden ADR-0014 ve atomik
  password recovery/güvenli SVG serialization kararını kabul eden ADR-0015.
- İki-kulüplü dashboard, iki-gruplu aggregate, current-recipient Socket,
  eşzamanlı reset, güvenli SVG ve dirty-navigation regresyon testleri.
- Prisma CLI advisory zincirini hosted runtime için `not_actionable` sınıflandıran
  ve production öncesi yeniden incelemeli geçici risk kabulünü kaydeden ADR-0016.
- Runtime-only backend image ile ayrı migrator artifact/job modelini kabul eden
  ADR-0017 ve doğrulanmış CR-012.

### Changed

- Training-plan create/update/delete, add/replace drill ve board snapshot
  persistence hataları işlem türüne özel sabit olaylar ve cause-free generic 500
  üretir. Explicit 400, authorization, atomik mutation, başarılı sonuç ve
  opsiyonel season-day fail-soft davranışı korunur.
- Season/week/day/match create, update, delete, toggle, tactical-board ve
  week-generation persistence/missing-record yolları işlem türüne özel sabit
  olaylar ve cause-free generic 500 üretir. Transaction içindeki açık 400
  doğrulamaları, başarılı sonuçlar, authorization ve mevcut status'lar korunur.
- Attendance persistence hataları raw Prisma/Error yerine yalnız
  `ATTENDANCE_MARK_FAILED` ve cause-free generic 500 üretir; DTO, authorization ve
  başarılı find-then-update/create davranışı korunur.
- Club update ile drill create/update/delete persistence hataları cause-free generic
  500 ve sabit olay üretir. Drill create/update body'leri runtime'da JSON nesnesi
  olmalıdır; null/array/primitive 400 olur ve update'te kaynak yetkisi önce çalışır.
- Grup silme, üyelik temizliği ile ana kaydı tek Prisma transaction'ında siler;
  foreign-key reddinde üyelikler geri alınır. Grup update/delete ve membership
  persistence/duplicate/missing yolları yalnız sabit olay ve cause-free generic
  500 üretir; mevcut success ve duplicate/missing status davranışı korunur.
- Kulüp create/update, grup create/update ve membership body'leri controller/service
  sınırında doğrulanır. `POST /clubs` yalnız name/logo/description aktarır; istemci
  kimliği, timestamp ve nested ilişkiler Prisma'ya ulaşmaz. Grup yaş/kategori
  enumları, create default'u, nullable/empty davranışlar ve auth-before-validation
  korunur. Kulüp/club-group create hataları generic 500 ve sabit olayla sınırlandı.
- Sezon/hafta/gün/maç girdileri controller/service runtime DTO ile doğrulanır;
  nullable/default/date/JSON davranışı ve mevcut group kontrolleri korunur.
  BL-031: hafta body'lerinin nested Prisma yazma/reparent alanları elenir;
  maç create gövdesi doğrulanmamış tacticalBoard yazamaz. ADR-0007/0012/0014
  mevcut kaynak/sözleşme sınırı uygulanır; migration veya yeni rol politikası yoktur.
- Plan create/update body'leri ortak runtime DTO ile controller ve service
  girişinde doğrulanır; scalar alan projeksiyonu, principal kimlik türetme,
  nullable alanlar ve serializable group aggregate kontrolleri korunur. Bozuk
  tip/tarih/Int girdileri persistence işleminden önce kontrollü 400 üretir.
- `POST /groups` artık tek sabit hata olayı ve raw cause içermeyen genel HTTP 500
  üretir; doğrudan console ve framework üzerinden ikinci ham log yolu kapatıldı.
  Yoklama ve tek faz ekleme controller/service girişlerinde mevcut alan/enum
  kurallarıyla doğrulanır; malformed body kontrollü 400 olur.
- BL-024: Analytics CRUD adapter'ı aynı alan eleme ve dönüşüm kurallarını ortak
  yardımcıyla korur; 41 lint uyarısı kaldırıldı. Opsiyonel plan-season bağlantısı
  ham error/metadata yerine sabit olaylar loglar; normal/fail-soft sonuç korunur.
  Plan-drill replace, mevcut 50-eleman ve alan kurallarını controller ve service
  girişinde paylaşır; bozuk liste artık `.map()` hatası yerine kontrollü 400 verir.
- BL-030: egzersiz ekleme sonrası ortak workspace verisi yenilenerek takvim/liste
  süre özetinin eski kalması giderildi; route/context regresyonu ve root quality geçti.
- BL-029 kapatıldı: ortak taktik editörü yeni egzersiz, boş maç tahtası ve henüz
  snapshot'ı olmayan planı “Henüz kaydedilmedi” olarak gösterir. Başarılı save,
  bekleyen save, hata/retry ve dirty/undo durumları 7 component regresyonuyla
  doğrulandı; root quality ve yerel browser smoke geçti. API/şema değişmedi.
- Açık kullanıcı onayıyla yalnız yerel çalışma kopyasındaki koç parolası sıfırlandı;
  authVersion, session/reset revoke ve audit atomik uygulandı. Login/logout API
  kontrolü geçti; uygulama kodu, planlar ve diğer hesaplar değiştirilmedi.
- Kullanıcı isteğiyle production karar toplama beklemeye alındı; yerel demo DB'si
  korunarak ayrı çalışma kopyasına session migration'ı uygulandı ve opt-in dev
  server'lar başlatıldı. Kod ve varsayılan feature flag'ler değiştirilmedi.
- Mimari özette beklemede görünen session/migration durumu Accepted ADR-0018'in
  doğrulanmış opt-in uygulamasıyla hizalandı.
- ADR-0010 implementation gate'i ADR-0018 ile provider-neutral çalışma için
  genişletildi; production domain/provider/proxy/secret/rollout girdileri TBD kalır.
- Opt-in modda frontend login/refresh/logout credentialed cookie kullanır; business
  API bearer sözleşmesi korunur. Hesap lifecycle değişiklikleri aktif refresh
  kayıtlarını authVersion artışıyla birlikte revoke eder.

- Eski sezon planlama belgeleri güncel kaynak olmadıklarını belirten uyarılar
  taşıyacak şekilde sınıflandırıldı.
- Public kayıt fail-closed ve least-privilege hale getirildi; privileged role/club
  alanları dış request'ten kaldırıldı.
- JWT secret production'da zorunlu hale getirildi; bilinen fallback değerleri
  kaldırıldı.
- Production container başlangıcından otomatik seed kaldırıldı; bootstrap admin
  yalnızca external credential ile manuel oluşturulabilir.
- User response'ları Prisma default omit ve güvenli projection ile password hash
  taşımayacak şekilde sınırlandı.
- Attendance mutation RolesGuard ile bağlandı ve sezon hafta üretimine üst sınır
  eklendi.
- `npm audit fix` ile semver uyumlu NestJS, Socket.IO, JWT ve transitif güvenlik
  güncellemeleri uygulandı.
- Yeni Prisma migration'larının Git tarafından gizlenmesi kaldırıldı; uygulama
  başlangıcındaki otomatik migration ayrı `prisma:migrate:deploy` komutuna taşındı.
- Eski driftli migration geçmişi, güncel şemanın tamamını içeren doğrulanmış temiz
  baseline ile değiştirildi.
- `ADMIN` rolü `SYSTEM_ADMIN` ve `CLUB_ADMIN` olarak ayrıldı; bootstrap ve mevcut
  system-level guard referansları yeni enum'a taşındı.
- JWT principal her istekte güncel kullanıcı kaydından oluşturuluyor; client/token
  içindeki rol ve kulüp iddiaları tek başına yetki vermiyor.
- Kulüp, grup, antrenman planı, sezon ve katılım akışları kulüp/grup üyeliğine göre
  sınırlandı; `Season` zorunlu kulüp ve grup ilişkisi kazandı.
- Socket.IO handshake JWT zorunlu hale geldi; kimlik sunucudan türetiliyor. İlk
  kulüp-odası sınırı ADR-0014 ile kesin group/current-recipient modeline daraltıldı.
- Sağlık/klinik yolları ve tenant sahibi henüz tanımlanmamış ileri analitik yolları
  ayrı politika onaylanana kadar `SYSTEM_ADMIN` ile sınırlandı.
- Kurtarılamayan frontend gitlink'i normal monorepo dizinine dönüştürüldü; çalışan
  frontend bulunmadığından Compose ve environment örneğindeki doğrulanmamış
  Next.js/NextAuth varsayımları kaldırıldı.
- Public registration kaldırıldı; ilk system admin tek-admin bootstrap kuralına,
  diğer hesaplar scoped invitation akışına taşındı.
- HTTP ve Socket.IO session'ları güncel account status/authVersion ile anında revoke
  edilebilir hale geldi; eski kulüp atama yan yolu kaldırıldı.
- Hard-coded gerçek kişi örnekleri ve bilinen parolayla doğrudan kullanıcı oluşturan
  legacy sample-squad scriptleri kaldırıldı.
- Haftalık frontend'in grup, sezon, plan, oyuncu ve katılım state'i NestJS REST
  sözleşmelerine bağlandı; plan ve katılım kaydetme işlemleri kalıcı API mutation'ı
  haline getirildi.
- Maç hazırlık paneli gerçek season/match REST kaydına bağlandı; taktik analiz,
  diziliş ve koç notu yerel state yerine yetkili match mutation'ıyla saklanıyor.
- Antrenman editörü gerçek drill kataloğuna bağlandı; plan drill'leri authorization
  kontrollü atomik replace işlemiyle saklanıyor, toplam süre drill sürelerinden
  türetilip bağlı sezon gününe yansıtılıyor.
- Backend lint komutu salt-okunur hale getirildi; explicit `lint:fix`, typecheck,
  format check ve izlenen build cache'ine dokunmayan `build:check` ayrıştırıldı.
- Tek-dosyalı frontend modları ortak `/app` shell ve adreslenebilir Hafta,
  Antrenmanlar, Taktik Tahtası, Kadro ve Maçlar rotalarına ayrıldı.
- Haftalık görünüm sabit 2026 dizisi yerine yerel Pazartesi–Pazar, önceki/sonraki,
  bugün ve tarih seçimiyle gerçek plan/maç verisini eşleştiriyor.
- Drill okuma ve mutation yolları authentication, tenant, grup ve creator
  sahipliğiyle sınırlandı; ownership mass-assignment alanları sunucuda türetiliyor.
- `/app` varsayılanı Genel Bakış'a yönlendirildi; masaüstü navigasyonu Genel,
  Planlama ve Takım başlıkları altında dokuz girişe genişletildi. Mobil alt çubuk
  ADR-0011'deki beş ana görevi korur.
- Mobil ana görev sırası ADR-0011 ile aynı Hafta → Antrenmanlar → Taktik Tahtası →
  Kadro → Maçlar düzenine sabitlendi; Egzersiz Kütüphanesi faz sekmelerinin 390 px
  görünümde ikinci satıra taşması giderildi.
- Tam MVP review sonucunda REQ-005 ve REQ-009, doğrulanan açık bulgular nedeniyle
  `Implemented` yerine `Partial` olarak kanıtla hizalandı; uygulama davranışı
  değiştirilmedi.
- F-001–F-006 remediation ile dashboard görünürlüğü `GLOBAL + own club` ve güvenli
  projection'a; plan/drill/season bileşimleri kesin group sınırına; Socket olayları
  güncel yetkili alıcılara ve minimum payload'a taşındı.
- Taktik editörüne iç route/back/mobile navigasyonunu kapsayan kaydet/at/iptal
  koruması eklendi; SVG renkleri canonical hex allowlist ve XML escaping ile
  sınırlandı.
- Password reset completion transaction içi conditional claim ile single-winner
  hale getirildi. REQ-005 ve REQ-009 remediation kanıtıyla yeniden `Implemented`
  durumuna getirildi.
- BL-025, Prisma `6.19.3` → `@prisma/config` `6.19.3` → `deepmerge-ts` `7.1.5`
  zincirinin source/control/sink triyajı ve açık risk kabulüyle tamamlandı; paket,
  lockfile ve runtime davranışı değiştirilmedi.
- Prisma CLI development/build bağımlılığına taşındı. Backend Dockerfile aynı
  lockfile'dan runtime-only `runtime` ve HTTP uygulaması içermeyen `migrator`
  target'ları üretecek şekilde ayrıldı; Compose migrator'ı yalnız açık
  `operations` profiliyle çalıştırır.
- Runtime production install'i optional/development paketleri dışarıda bırakır;
  üretilmiş Prisma Client korunurken Prisma CLI, `@prisma/config`, `deepmerge-ts`,
  Nest CLI, Jest, migration/source ağacı ve seed scriptleri image'dan çıkarıldı.

### Known issues

- Frontend kalıcı oturum ADR-0018 ile opt-in uygulanmıştır; production rollout,
  ölçülebilir erişilebilirlik hedefi, domain/provider ve operasyon girdileri `TBD`.
  Refresh record retention onaylıdır; security-audit retention ayrı `TBD` kalır.
- E-posta teslimi/account recovery, production migration otoritesi ve sağlık/ileri
  analitik veri politikası açık karar kapılarıdır.
- E2E suite tablo temizliği yaptığı için yalnız caller-supplied dedicated ve
  silinebilir veritabanında çalıştırılabilir.
- Backend analytics'in 41 unused-variable lint uyarısı BL-024 ilk diliminde
  kapatıldı. POST /groups log containment tamamlandı; diğer çekirdek DTO yolları,
  ayrı club-group create ve implicit framework logları ile genel production log
  politikası BL-024 kapsamında açık kalır.
- `npm audit --omit=dev` Prisma CLI / `@prisma/config` / `deepmerge-ts` zincirinde
  3 high advisory raporluyor. ADR-0016 bunu hosted runtime için `not_actionable`
  ve production öncesi yeniden incelemeli geçici kabul olarak kaydeder; otomatik
  Prisma 6.12.0 breaking downgrade uygulanmadı. ADR-0017/BL-026 uygulanmıştır:
  gerçek runtime-stage install audit'i sıfır bulgu verir ve image inventory bu
  zinciri içermez; repository-local audit optional-peer metadata nedeniyle ayrı
  bir accepted-risk sinyali olarak görünür kalır.
- 2026-09-05 ilk tam MVP review hükmü tarihsel olarak **Fail** idi; A–D
  stabilizasyonuyla F-001–F-006 kapatıldı ve güncel remediation hükmü **Pass** oldu.
  Ayrıntı ve yeniden doğrulama kanıtı `docs/30-quality/MVP_REVIEW_2026-09-05.md`
  içindedir.
