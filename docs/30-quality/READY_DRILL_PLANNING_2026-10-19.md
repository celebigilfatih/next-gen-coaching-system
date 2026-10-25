# Ready drill planning — 2026-10-19

## Verdict and boundaries

Repository implementation verified. This implementation-stage report originally
excluded retained rollout. The separately approved migration and 120-DRAFT import
are now complete, followed by explicitly excepted all-120 local publication under
ADR-0041. Ordinary independent-review requirements remain for other releases. See
[local publication evidence](READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).
ADR-0039 / REQ-027 / CR-028 / BL-062. No production, tactical flag activation,
commit or push was performed by this feature.

The user's chosen scope is individual exercises, U12/U14/U16/U18/SENIOR and a
first release containing all 120 independently approved exercises. The existing
generated content remains DRAFT source material. No real expert is named and no
synthetic sporting approval in this report constitutes expert review.

## Implemented behavior

- Shared server-filtered search, phase, objective, age, difficulty, duration,
  players and equipment. The plan picker uses the plan's exact team age.
- Explicit lazy instruction/board preview, scalar selection summary, paginated
  target plans and existing create-plan form followed by separate add confirmation.
- Browser QA exposed the existing administrator create-form omission of clubId/
  coachId. The shared form now selects an active same-club COACH through the
  existing paginated account API and sends the existing ownership fields.
  COACH sessions retain server-derived ownership. No role/grant policy changes.
- Nullable contentSnapshot freezes version identity, age, resolved duration,
  instructions and provenance. Existing boardSnapshot freezes the published
  diagram on attachment. Old NULL rows keep their legacy behavior.
- Append preserves other phases/notes/snapshots. Totals use frozen durations and
  update TrainingPlan/DayPlan atomically. Public writes recheck actor status,
  role/club/membership, source ownership, publication and exact age in the
  Serializable transaction. Optional expectedVersionId rejects stale selections.
- Draft/archived IDs cannot bypass the catalog through add or replace. Existing
  snapshots survive source changes/archive. Uncertain writes require explicit
  read verification before retry; duplicate attachment returns conflict.
- Independent reviewers can inspect each queued version, age variants and board.
  Individual first starter publication is blocked; the SystemAdmin-only package
  endpoint publishes all 120 in one transaction with per-version audit events.

## Database and HTTP evidence

Dedicated loopback databases on PostgreSQL 16:

- `ngcs_ready_drills_test`: all 13 migrations deploy; status current and schema
  diff empty. Import `120 created / 0 skipped`, replay `0 created / 120 skipped`.
- `ngcs_ready_drills_legacy_test`: deploy the preceding 12 migrations, insert a
  legacy plan phase with note/board, then deploy the snapshot migration. Original
  fields compare equal and contentSnapshot remains NULL; schema diff empty.
- `test/ready-drill-planning.e2e-spec.ts`: 9/9 HTTP scenarios passed, including
  draft/direct-ID denial, self-review/role boundaries, complete release gate,
  exact-age/catalog filters, stale selection, frozen content and durations,
  legacy compatibility and archived-source behavior. Fault injection proves both
  complete package publication/audit rollback and late plan/day write rollback.
- Sporting approval in these databases is explicitly simulated test fixture data.
  Tests reset only their named dedicated database's starter lifecycle.

## Automated verification

- Backend: 60 suites / 869 tests passed. Typecheck and build pass. Final focused
  drill/training lint passes; later concurrent whole-workspace lint is limited below.
- Frontend: initial complete run 58 files / 473 tests passed. After the admin
  create-form correction, complete run reports 473 passed / 1 failed (474): the
  existing 50-undo tactical-editor test exceeds its 15-second timeout. Isolated
  rerun passes both matching tests (2 passed / 26 skipped). No tactical-editor
  source/test/timeout change was made. Final affected route/form tests pass 28/28.
  Typecheck, lint, final production build and Sites 4/4 pass.
- Workspace formatting initially passes with `--end-of-line auto`; final dedicated
  drill/training surfaces pass as well. A final frontend check also flags the
  shared API file while it receives concurrent planning imports. Those unrelated
  edits were preserved. Raw format checks flag
  existing CRLF checkout files; no repository-wide normalization was performed.
- Root quality was attempted and stops at `spawnSync npm ENOENT` on Windows.
  See BL-061. It is not reported as passed. The external CDSK validator is absent;
  its result must not be substituted or fabricated.
- A later full lint/format attempt observed concurrent `src/planning/*` work
  outside this increment. Those files were preserved. Final targeted drill/
  training backend lint and formatting pass; do not claim a completely green
  aggregate working-tree gate while concurrent changes remain unfinished.
- Markdown links initially pass (152 files, zero broken links). The last aggregate
  check sees nine concurrent references to the not-yet-present
  `TACTICAL_LOCAL_ROLLOUT_2026-10-19.md` report. Those references belong to separate
  rollout work and were not removed or replaced. This increment's report/ADR
  targets exist. Git whitespace check passes.

## Browser evidence

Real login and actual HTTP/PostgreSQL flow use the separate API4012/UI3500 test
environment with a visibly TEST-labelled club. No retained business data is used.
Screenshots are in `apps/frontend/qa/ready-drills-2026-10-19/`:

1. `01-library-1440.png`: filtered real catalog, server total 3; healthy.
2. `02-select-plan-1440.png`: selected eligible existing plan; healthy.
3. `03-added-1440.png`: confirmed successful attachment; healthy. Opening the
   plan shows 71 minutes (49 + 22), preserving its three preceding phases.
4. `04-preview-390.png`: mobile instructions and explicit preview; healthy.
   DOM width check: viewport/page 390px, dialog about 367px; no horizontal overflow.
5. `05-plan-picker-1024.png`: tablet scalar summary and preserved selection after
   closing preview with Escape; healthy.
6. `06-new-plan-confirmation-390.png`: administrator chooses the test club's
   active coach and creates a new plan. Database confirms duration 0 / zero phases
   before explicit attachment; selected exercise is preserved; healthy.
7. `07-new-plan-added-390.png`: separate explicit add succeeds on mobile; healthy.

The source exercises still contain generic generated instructions and diagrams;
sporting quality and suitability require the actual independent expert. Browser
layout checks do not establish full accessibility compliance or field suitability.

The QA-only API4012/UI3500 processes were stopped and the viewport override was
reset. The canonical retained environment was not restarted or rolled out by
this increment. Saved screenshots remain available for review.

## Changed surfaces

- Backend: nullable Prisma field/migration, plan content resolver, add/replace
  transactions and metadata projection, catalog version ID, exact-age detail and
  complete starter publication service/controller; focused unit/HTTP tests.
- Frontend: shared filters, lazy instruction/board preview, target-plan dialog,
  plan picker, active-club coach selector and shared create form; library/detail/
  editorial/training routes, API types and scoped library CSS; regressions.
- Governance: ADR-0039, REQ-027, CR-028, BL-062, product/scope/roadmap, API/data
  documentation, runbook, test strategy, README, changelog and Project Boot handoff.

## Original next operation — superseded by approved local rollout

At initial implementation `ngcs_local_session_dev` had no exercise content. The previous
computer's 120-draft import is historical evidence, not a claim about this machine.
Request separate approval for the exact additive snapshot migration and 120-item
DRAFT import, with backup/restore and postcondition evidence. Expert identity,
real review of all 120 and subsequent publication remain separate gates.
The user subsequently approved migration/import/publication; migration and import
are complete in the linked rollout report. Actual expert review is still absent.
