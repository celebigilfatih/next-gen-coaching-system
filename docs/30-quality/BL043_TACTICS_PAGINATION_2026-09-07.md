# BL-043f.3 — Tactical Catalog Pagination

- Date: 2026-09-07
- Scope: server board-kind filter and independently paginated tactics screen.
- Authority: approved BL-043 continuation; existing ADR-0007/0012/0014/0022/0023
  access/compatibility boundaries. No schema/migration/dependency or write change.
- Verdict: Pass for this tactics slice; BL-043 remains in progress.

## Delivery

The existing drill catalog accepts optional `kind=tactical-board` only. Invalid
kind inputs fail with 400; omission preserves library and dashboard results.
The marker predicate is intersected with current group access, existing drill
visibility and server-derived age/category before both LIMIT/cursor and count.
It neither grants authority nor restricts boards to the TACTICAL category.
This preserves the old tactics screen's kind-marker semantics, including boards
in WARM_UP/TECHNICAL/COOL_DOWN. The marker does not validate an entire historical
document; existing detail/import/write validation remains authoritative.

Tactics no longer downloads/filters the shared drill array. It uses 25-record
pages with full filtered totals, creation-date/ID keysets, and the existing
scalar catalog projection without JSON documents. Scope changes reset the page
and reject late responses. Loading, error/retry, missing context, genuinely empty
library and empty continuation are distinct. An empty continuation retains the
previous-page action. Existing shadcn cards, global copy hints, editor links and
create actions remain unchanged.

Training-detail drill selection still needs the provider's full drill list. It is
intentionally not removed or replaced with the first page. Therefore this slice
does not claim complete workspace bandwidth or query-budget optimization.
Counts/pages remain live independent reads, not an immutable snapshot.

## Verification

- Root quality passed both typechecks/lint/format/builds, 44 backend suites /
  538 unit tests, 18 frontend files / 78 tests, Sites 4/4, CDSK, links and whitespace.
- Backend catalog tests: 30 passing cases, including filter intersection before
  page/count and five invalid-kind cases. Existing omitted-kind tests still pass.
- Frontend tactics tests: five cases cover minimal links/cross-category boards,
  full totals/paging, scope/season reset and stale response, loading/error/retry,
  missing workspace, empty continuation and empty library. A throwing shared
  drills getter guards against reverting to the full-array consumer.
- Disposable PostgreSQL API E2E: 5 suites / 38 tests passed on repeat. The extended
  catalog fixture walks 31 coach-visible boards without duplicate IDs, matching
  the old authorized list's kind filter. It verifies 30 WARM_UP boards, role
  totals 31/32/33 for PLAYER/CLUB_ADMIN/SYSTEM_ADMIN, foreign/unassigned-group
  denial, invalid kind rejection and JSON omission. The initial run had a
  60-second timeout in the existing player roster scale test and a subsequent
  ECONNRESET; the complete unchanged suite passed in 10.6 seconds on repeat.
  The cause of the initial interruption is not established; no timeout or
  production code was changed to hide it.
- All 11 Chromium tests passed in 2.6 minutes. The extended first flow verifies
  30-board full totals with 25+5 cards, scalar network items without jsonData,
  a second-page editor link and controls without overflow at 1440/1024/390 px.
  Library/dashboard counts, saved-drill refresh, plan snapshot, match board,
  cross-tenant, session and dirty-navigation workflows remain green.
  The opt-in `E2E_TACTIC_PAGE_FIXTURE=true` makes
  all 30 synthetic library fixture records valid boards. Existing category and
  dashboard fixture totals remain unchanged. It requires DRILL_PAGE as well.
- Disposable migration deploy applied all six existing migrations; status current
  and schema diff empty. Retained before/after business fingerprint matches 24
  tables / 25 rows, excluding session/audit lifecycle data. Zero active connections
  were verified before removing the disposable database; absence was confirmed.
  Only regenerable synthetic test records were removed.
- Local read-only preview: existing library retains five plain exercises; tactics
  correctly shows zero boards, create actions and disabled empty-page navigation.
  Existing dev servers remain on 3001/4000 with Tactics open. No board was created
  in the retained database to manufacture preview data.
- Final CDSK and Markdown checks pass: 88 documents, zero broken local links;
  git diff --check passes. Cumulative worktree preserved; no commit or push.

Browser uses disposable `ngcs_bl043_tactics_e2e`, isolated ports 3500/4500,
synthetic credentials, persistent-session/reset opt-ins, and the existing
PLAYER_PAGE/CATALOG/HISTORY/TRAINING_PAGE/DRILL_PAGE flags plus TACTIC_PAGE.
Artifacts remain in ignored `output/playwright/ngcs-coach-flow`. No retained
reset, seed, migration or business write is part of this delivery.

## Remaining work and rollback

Next BL-043f.4: bounded training-detail drill choices that preserve source/plan
scope, off-page selection, existing phase/duration behavior and refresh after
mutation. Only then remove the provider's full drill fetch/state. Match/member
consumers and pilot owner/SLO/query budgets remain TBD; BL-043 is in progress,
BL-044/045 and M4 remain open.

Rollback restores the old tactics consumer while shared drills still exist.
The additive kind filter can remain unused; do not drop it before rolling back
clients that send it. No data rollback is needed. Preserve cumulative worktree
changes; no commit/push or production rollout is included.
