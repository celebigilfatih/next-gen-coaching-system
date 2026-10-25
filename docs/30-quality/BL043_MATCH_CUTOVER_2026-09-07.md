# BL-043g.5 — Match Detail and Shared-List Cutover

- Date: 2026-09-07
- Authority: approved BL-043 continuation and ADR-0007/0014 access boundaries.
- Scope: independently authorized detail, minimal shell count, metadata-only workspace.
- Verdict: Pass for this cutover; BL-043 remains in progress.
- No schema/migration/dependency/write-contract or permission-policy change.

## Delivery and contracts

GET /matches/catalog/detail/:matchId requires JWT and groupId, with optional
seasonId. IDs use the existing bounded identifier validation; unknown fields,
pagination and date filters are rejected with 400. Current group access is
checked before the match read. The single findFirst intersects match ID,
authorized group/club through the owning season, and optional selected season.
Missing/out-of-scope matches return 404; denied group access returns 403. A
client-supplied optional Match.groupId is never treated as authority. A player
may read its group's match but existing write-role guards remain unchanged.

The detail projection contains the editor's scalar fields, opponentAnalysis
and tacticalBoard for that one record; no videoLinks or nested resources.
Existing stored JSON is not reclassified as newly validated content. Existing
write validators and match/board PUT endpoints remain authoritative.

GET /sporting/workspace/legacy-metadata uses the same current sporting capability
and independent legacy membership/tenant checks as legacy-context. It returns
only group/season and never executes match.findMany. Legacy-context's complete
matches contract remains available for compatibility; frontend no longer calls it.

The frontend provider no longer holds or distributes matches. Match detail owns
its request, loading/error/retry, scope/ID-keyed draft and stale-response guard.
Missing concrete-season context does not widen the read; explicit all-seasons
may omit seasonId. Existing analysis normalization, manual save and board editor
are preserved. This does not introduce analysis autosave or a new dirty-form
policy. Existing tactical-board dirty navigation remains in force.

The shell uses catalog/page limit=1 and the full total, not returned page length.
This is a bounded scalar-page request, not a new count-only endpoint. Loading
disables the button; failure shows ! and click retries only the count. A genuine
zero retains the existing no-new-notification message. Scope changes discard
late totals. Shared full matches, plans and drills are now absent from the
workspace; full group members remain the next list-cutover candidate. Bounded
payloads do not establish a production query budget, SLO or immutable snapshot.

## Verification

- Root quality passed: 581 backend unit tests (45 suites), 104 frontend tests
  (21 files), typecheck/lint/format/build, Sites 4/4, CDSK/links and git whitespace.
- Ten new backend regressions cover single-row projection/scope, denied group,
  missing/foreign record, invalid detail inputs and metadata omission/authority.
- Six new frontend regressions cover explicit writes/legacy analysis, independent
  retry, late detail/count responses, scope resets, all-seasons, missing-season
  fail-closed behavior and zero versus loading/failure. Provider fixture throws
  on accidental shared matches access.
- PostgreSQL API E2E passed: 5 suites / 39 tests, 9.494 seconds. Existing suites
  now exercise four-role detail reads, null direct group ID, board/analysis
  projection, cross-group/club/season denial, unauthenticated access, revocation,
  invalid queries and metadata-only responses alongside the unchanged legacy
  complete-list contract. Final test-only additions passed lint/format.
- Browser E2E: 11/11 passed in 2.7 minutes. Extended flow forbids legacy-context/full season-match list
  requests, checks full shell count, observes the single-detail endpoint and
  captures match-detail-{1440,1024,390}.png in ignored output/playwright results.
  All three were visually inspected; overflow checks passed. Existing snapshot,
  board-save, cross-tenant, session and dirty-navigation flows also passed.
- Disposable PostgreSQL 16 database: ngcs_bl043_match_cutover_e2e. All six
  existing migrations deployed; status current and schema diff empty. Retained
  fingerprint remained identical before/after tests (24 tables / 25 rows;
  session/audit excluded). With zero connections verified, only this synthetic
  database was dropped and absence checked; fixtures can recreate it. No retained
  reset, seed, migration or business write.
- Local 3001/4000 preview opened the retained match with its existing analysis,
  formation and notes; shell count is 1. The detail remains open for inspection.
- Final CDSK/link/git whitespace checks passed: 94 Markdown documents / zero
  broken local links. Cumulative worktree retained (179 entries before, 182 after
  three new files); no stage, commit or push.
- Current documentation updated; no new ADR required for this implementation
  of accepted scope. Existing decisions and historical delivery entries remain.

Rollback is a coordinated code change restoring the prior frontend provider and
its consumers; the old complete-list API is still available. No database rollback
is required. Do not remove the new read endpoints while this frontend uses them.

## Next

BL-043 member list pagination and dependent Kadro/dashboard consumers, followed
by measured pilot capacity/query budgets. Owner, volume and SLO remain TBD.
BL-044 safeguarding policy, BL-045 all-seasons label and M4 production inputs
remain separate open work. No production deployment or retained migration here.
