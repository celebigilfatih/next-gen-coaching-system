# BL-046b — Training Editor Frontend Cutover

- Date: 2026-09-07
- Verdict: Pass for the frontend/draft delivery slice. BL-046 remains In progress
  until BL-046c matched measurement and final regression verification.
- Authority: [Accepted ADR-0025 Option A](../50-decisions/ADR-0025-on-demand-training-editor-boards.md),
  approved CR-017; no new approval, dependency, schema or permission change.

## Delivered behavior and files

[Training detail](../../apps/frontend/src/routes/training-detail.tsx) now uses
[typed API helpers](../../apps/frontend/src/lib/api.ts) for complete lightweight
phase metadata and a single explicitly opened effective board. Flow/attendance
entry and the board tab itself fetch no board JSON. All phase IDs/orders remain
available to the additive picker. Selecting a phase does not fetch it; “Tahtayı aç”
does. No valid-board scan, prefetch, legacy editor fallback or empty saved-board
substitution is performed. Invalid/absent/error/retry states are distinct.

Plan, workspace URL/scope, principal and session generation key the read lifetime.
Late metadata/phase completions cannot populate a different active plan/phase.
Board response identity and documents are validated before rendering. PLAYER
has read-only controls; session removal unmounts protected draft state. Server
plan/source authorization remains authoritative and unchanged.

The [shared editor](../../apps/frontend/src/components/tactics/tactical-board-editor.tsx)
exposes a small transition handle to the parent. Local phase/tab transitions use
the same save/discard/cancel dialog as router/workspace navigation. Cancellation
does not unmount the draft. Only one draft/history exists in memory; no autosave,
persistent cache or multi-phase draft store is added. Synchronous write exclusion
blocks duplicate keyboard saves and document edits during a pending save.
First successful snapshot save advances the baseline without a React-key change;
undo/redo and the 50-step bound survive.

Snapshot failures are conservatively treated as ambiguous because the existing
API helper does not expose typed failure status. The draft remains local; a user
must explicitly read the authorized effective board before choosing a retry.
Canonical object-key comparison tolerates PostgreSQL JSONB key ordering. A matching
server snapshot can be acknowledged with Kaydet without a second PUT. A differing
snapshot never silently replaces the draft; no concurrency/version guarantee is
claimed. The current API has no board revision/ETag. A failed save-and-leave keeps
the dialog/destination pending; cancel it to use the verification panel.

Existing additive POST is still issued once, with max order from all metadata.
Successful attachment selects the returned PlanDrill ID; metadata read failure
offers a read-only retry and prevents accidental duplicate attachment.
[Tactics editor](../../apps/frontend/src/routes/tactics-editor.tsx) now keys the
editor by route drill ID, so creating its first saved record does not unmount the
pending save before the existing success redirect. Backend GET/POST/PUT, Prisma,
migrations, packages, CSS identity and retained business data are unchanged.

## Verification

| Gate | Observed result |
| --- | --- |
| Final root `npm run quality` | Pass: 655 backend / 133 frontend unit tests, typecheck, lint, format, backend/frontend builds, Sites 4/4, CDSK, links and whitespace |
| New frontend coverage | 17 parent/editor tests plus one 50-step editor test; existing additive route tests adapted to metadata |
| Browser E2E | Final complete Chromium run: 12/12, all catalog/page/history fixtures and persistent sessions enabled; ports 13001/14000 |
| Backend API E2E | Six suites, 48 passed / 1 intentionally skipped opt-in mixed benchmark; no backend code changes |
| Disposable PostgreSQL 16 | Six existing migrations deployed to a fresh ngcs_bl046b_browser_e2e; status current, schema diff empty |
| Retained data | Before/after business fingerprint PASS: 24 tables / 25 rows; session/audit excluded by the established manifest |
| Final documentation/scope | 101 Markdown files, zero broken links; CDSK and git diff --check pass. Cumulative short-status entries 198 → 200 (new route test and report) |
| Scope fingerprint | Backend and frontend package diff SHA-256 unchanged: 23243ee9b5cdbd339658a7fd7342cf2f9170bd833bf28f8c1efcf6a8ff2eba43 |

[Parent tests](../../apps/frontend/src/routes/training-board.test.tsx) exercise
the real editor state/dialogs/keyboard with only canvas rendering mocked: initial
flow and attendance, explicit single read, first-save history, phase/tab cancellation
and discard/save, route and workspace-query guards, failed/uncertain saves and
read confirmation, double-save exclusion, stale phase/plan responses, mismatched
identity, malformed/invalid/absent board and PLAYER/session behavior.
[Editor tests](../../apps/frontend/src/components/tactics/tactical-board-editor.test.tsx)
verify precisely 50 undo and redo transitions after 51 edits. They are not canvas
rendering or production latency measurements.

[Browser flow](../../apps/frontend/tests/e2e/coach-flow.spec.ts) now waits for
editor-metadata and asserts that it carries no snapshot JSON. It explicitly opens
a phase, edits, cancels a tab transition, saves the first snapshot, undoes/redoes,
adds a second phase and reopens the exact original PlanDrill snapshot unchanged.
The club drill creation redirect, match-board save, cross-tenant rejection and
existing workspace/dirty-navigation/session flows also pass.

1440, 1024 and 390 px screenshots were captured and visually inspected under
output/playwright/bl046b-board-{width}.png (ignored local QA artifacts). Snapshot
selection, command controls and page-width assertions pass. Desktop/tablet show
the board and inspector; 390 px retains the existing horizontally scrollable
board-layout with a 620px minimum canvas column. The complete canvas/inspector is
not visible simultaneously on mobile. This is not a new responsive redesign,
formal WCAG audit, or evidence that document-width checks prove canvas fit.

The retained local preview at localhost:3001 was checked without business writes:
the new picker/open action works and the selected demo phase reports invalid legacy
JSON without mutation or fallback. A valid-board write was tested only in the
disposable fixture, not by repairing or reseeding the user's demonstration plan.

## Failures found during verification

- Initial browser run: 11 passed / 1 failed. The new unmount guard correctly
  suppressed a stale completion but exposed the tactics-page first-save key
  change, preventing redirect. Route-based identity fixes it; the full rerun
  passes without weakening the create/redirect assertion.
- Keyboard tests exposed `event.target.matches` on Window; the guard now checks
  Element before calling matches. A read-confirmation test waits for the actual
  enabled control instead of clicking during the save-completion effect.
- The 50-step test initially exceeded the default 5-second timeout through
  repeated full-tree role queries. Reusing the stable button references preserves
  all assertions and passes without raising timeouts or reducing history depth.

## Reproduction, cleanup and next slice

Run `npm run quality`. For browser/API E2E, create a fresh explicitly disposable
loopback PostgreSQL database and use the existing guarded runners. Browser needs
E2E_DATABASE_URL, E2E_ALLOW_DESTRUCTIVE_RESET=true, an ephemeral E2E_COACH_PASSWORD,
isolated E2E_FRONTEND_PORT/E2E_BACKEND_PORT, E2E_PERSISTENT_SESSIONS=true and all
eight catalog/page/history fixture flags enabled. API uses TEST_DATABASE_URL and
the same explicit reset permission. Never target ngcs_local_session_dev.

After both suites completed, zero database connections were verified; only
ngcs_bl046b_browser_e2e was dropped and its absence confirmed. Its synthetic data
is reproducible from migrations/fixtures. Retained data was not reset, migrated,
seeded or written. Existing local servers remain running. No stage/commit/push;
unrelated cumulative worktree edits were preserved.

Next: BL-046c matched valid-board 2/50-phase metadata + selected-document byte,
query/projection and latency measurements, then final regressions. Do not compare
the old opaque legacy benchmark to valid documents as if they were the same
fixture. This slice proves the new request path, not a production capacity number.
Metadata still scales with phase/title/note volume; old write responses and duration
recomputation remain heavy. Pilot owner/volume/hardware/SLO remain TBD. BL-043
broader workload, BL-044/045 and M4 production gates stay open.

Rollback: revert only this frontend adapter/transition integration and its tests
as a coherent slice before removing the additive backend reads. Preserve other
cumulative edits. No database rollback is required.
