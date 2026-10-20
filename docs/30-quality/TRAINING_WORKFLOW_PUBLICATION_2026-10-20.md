# Training workflow publication review — 2026-10-20

The user explicitly requested review, commit and push of the remaining library,
exercise-picker, attendance and training-detail changes on
`codex/mvp-stabilization`, after `24a4a2a88aa77f82477ce94f2aeba05b007aac31`.

## Reviewed scope

- Library requests only the exact120 starter identities, GLOBAL/PUBLISHED,
  across all ages by default. Explicit filters/count/cursors intersect the same
  predicate; all-age preview uses the returned row age. Seasonal records remain
  stored in their existing plans.
- Plan picker fixes collection plus server-resolved TEAM age for the saved group,
  preserving exact-age empty states, scalar selection across pages, attached-ID
  exclusion, explicit expected-version add, error handling and preview/focus.
- Boardless migrated LEGACY/LEGACY_UNVERIFIED versions retain frozen content and
  duration through add/replace. Other missing/malformed boards still fail strict
  validation. Existing age/version/publication/tenant and transaction guards stay.
  This is the regression fix for the historical PR review's attachment P1.
- Attendance has explicit Katıldı/Katılmadı controls and distinct unmarked state,
  full server counters/cursors, serialized nonoptimistic writes, reread/focus,
  uncertain-result recovery and static PLAYER self status. Scoped mobile actions
  remain48px; the existing marking API is unchanged.
- Training detail starts with title/date and uses decorative colored Phosphor
  icons with text labels. Existing phase/board/draft/data synchronization remains;
  route tests follow the router after removal of the requested back link.

Code and regression review found no additional blocking correctness issue in
this scope. No new architecture, dependency, schema, migration or ADR is needed;
accepted ADR-0007/0019/0032/0039 boundaries continue to apply.

## Current verification

- Fresh primary-worktree root gate: **17/17 pass, exit0**. Backend937 tests in
  62 suites, frontend556 in63 files, Sites4 and tooling8 pass, together with
  type/lint/format, both builds,202-file links, CDSK36 required documents/47 ADRs
  and whitespace. This uses the repository's actual Windows-compatible runner
  and pinned npm, without verification-only compiler settings or a junction
  checkout. Final changes after that run affect documentation only.
- Dedicated loopback PostgreSQL `ngcs_ready_drills_test`: **11/11 HTTP scenarios
  pass**. Target and fixture importer were verified before execution; the retained
  database was excluded. Coverage includes the exact120-ID paginated collection,
  SENIOR48, TEAM U14=72/warm-up12/U13=0, draft/archive/foreign/player/version denial,
  frozen descriptions/boards/durations, append preservation, late-fault rollback,
  and migration-shaped boardless legacy add/replace.
- Source hashes are recorded before validation and checked against the staged
  blobs; all21 runtime/test/style files remain byte-identical throughout the run.
  Four shared documents are staged selectively to preserve unrelated local
  tactical history. An exact index archive passes201-file local links and CDSK
  (36 required documents/47 ADRs); staged whitespace and37 text-pattern scans
  pass. All50 staged paths are checked against the reviewed manifest. Logs and
  hash manifests remain ignored under `output/remaining-publication-20261020/`.
- Existing dated screenshots were inspected for the library, picker, mobile
  attendance and training detail. Earlier authenticated responsive/read-only
  checks remain historical evidence; no new browser write or session check is
  claimed for this publication.

## Evidence and limits

Implementation reports and their13 QA images accompany this commit. Historical
`.png` filenames contain valid JPEG payloads; original image bytes are preserved:
[library](LIBRARY_READY_ONLY_2026-10-20.md),
[picker](PLAN_PICKER_READY_ONLY_2026-10-20.md),
[legacy compatibility](DRILL_LEGACY_PREVIEW_FIX_2026-10-20.md),
[attendance UI](TRAINING_ATTENDANCE_UX_2026-10-20.md),
[training detail](TRAINING_DETAIL_ICONS_2026-10-20.md).
The [ready pool](READY_EXERCISE_POOL_2026-10-20.md) and
[synthetic attendance acceptance](TRAINING_ATTENDANCE_2026-10-20.md) describe prior
authorized local data operations; neither is replayed by this commit. Historical
counts and no-commit statements in those reports refer to their original turns.

The inherited320px shell/Windows scrollbar width constraint remains documented.
Physical-device touch and production rollout are outside this publication.
No environment file, credential, database dump, private baseline or ignored log
is included. Unrelated tactical action-icon QA/history stays local. PR#1 remains
draft; this request does not merge it or change its readiness state.
