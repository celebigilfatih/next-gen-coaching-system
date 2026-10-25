# BL-043d — Selected Legacy Metadata and Assignment Options

- Date: 2026-09-06
- Authority: user's next-step instruction within Accepted ADR-0022/0023.
- Scope: eliminate live whole-catalog metadata reads; page Player 360 assignment
  options. No schema, migration, dependency or permission-policy change.
- Verdict: Pass for this slice; full BL-043 remains open.

## Implementation and compatibility

The shell now calls `GET /sporting/workspace/legacy-context` for its resolved
team/club/season rather than loading `/groups` and `/seasons` arrays. The service
reads one team, checks current TEAM_VIEW, then independently applies the legacy
group membership policy, including existing SYSTEM_ADMIN/own CLUB_ADMIN access.
Sporting-only visibility does not reveal legacy resources. Native teams and
missing legacy membership return null metadata and no matches; revoked sporting
permission returns 403. Frontend request generations discard stale responses.

Metadata contains at most one group and season with no nested members/weeks.
The shell's internal compatibility arrays therefore contain zero/one selected
record; UI catalogs continue using the separate paged endpoints. Training date
filtering, undated drafts, group drill/member reads and selected scope persistence
keep their previous semantics.

Exact season mode resolves a team/club/club-season mapping and chooses the
newest-created legacy season, ID ascending on ties. If duplicate legacy mappings
exist, only the chosen season's matches are returned, as before. All-seasons mode
returns matches across every authorized legacy group season, including unmapped
seasons, in one relational query without an intermediate season-ID array or
per-season fan-out. Match rows remain complete and **unbounded**; this is not a
claim that the entire workspace payload or SQL cost is bounded. Returned match
order is date then ID ascending. No chosen/matching season yields no matches.

The Player 360 assignment dialog no longer eagerly loads entire team/role arrays.
Opening it loads 25-record team and PLAYER-role pages. Roles use the new
`GET /sporting/roles/page`; teams reuse their existing page endpoint. SQL fetches
limit + 1, returns at most limit, and applies club/current-team visibility before
the cursor boundary. Role projection omits capability lists; own-club role
visibility and assignment write authority are unchanged and distinct.

Pages replace rather than accumulate options. A separately selected item stays
pinned when outside the loaded page (at most 26 records plus placeholder in each
select). Page navigation never changes selection. Both fields start empty; save
requires explicit choices. Loading, empty, failure/retry, previous/next controls
and reopening reset are provided. The unchanged mutation rechecks source and
target authority; selecting an option is not authorization to write it.

Old groups/seasons, sporting teams/roles and other full-array APIs are retained.
No legacy endpoint retirement or change to clinical/AI/production scope occurs.

## Verification

- Root `npm run quality`: 42 backend suites / 468 tests, 12 frontend files / 44
  tests; typechecks, lint, formatting, both builds, Sites 4/4, CDSK, Markdown and
  whitespace checks passed. Twelve new backend cases and three new selector
  cases cover scoped projections, complete all-seasons results, denied grants,
  malformed fields, role bounds, selected-value retention, retry and reset.
  Workspace/training regressions use the selected-context contract; the shell
  test asserts that old groups/seasons/per-season match clients are not called.
- PostgreSQL HTTP E2E: 4 suites / 33 tests passed. New coverage uses 41 legacy
  seasons/matches (including a duplicate mapping) and 31 PLAYER-role options.
  Exact off-page selection, latest duplicate, all 41 matches, native empty state,
  missing JWT, cross-club/mismatched scope, legacy membership removal, system
  access, current grant revocation and strict query/page limits are verified.
- Six existing migrations deployed to fresh disposable PostgreSQL 16 database
  `ngcs_bl043_metadata_e2e`; migration status current and schema diff empty.
  No retained DB migration/reset/seed was performed. The retained business
  fingerprint matched the controlled-rollout baseline: 24 tables / 25 rows,
  excluding normal session/audit lifecycle tables.
- Chromium: all 10 tests passed on separate 3500/4500 ports. New coverage checks
  that shell/profile navigation does not call the former unbounded metadata APIs,
  role options load only on dialog open, team/role pages retain off-page choices,
  the POST contains exactly the chosen IDs, save succeeds, reopening resets and
  1440/1024/390 px displays do not overflow. The synthetic future assignment does
  not alter other tests' current roster counts. Existing training/tactics,
  cross-tenant, persistent-session, catalog and dirty-navigation regressions pass.
- Retained browser: after a build/HMR error, a normal reload restored the existing
  session and Player 360. The dialog displayed its actual team/PLAYER role and
  disabled save until explicit choices; it was closed without writing records.
  The before/after retained fingerprint matched 24 tables / 25 rows. Local
  3001/4000 servers remain available and Player 360 is left open.
- The disposable DB had zero active connections after tests and was removed;
  absence was verified. Its synthetic data is regenerable using the repository
  fixtures. No business data was deleted from the retained local database.

## Remaining work and rollback

BL-043 remains open for legacy business-resource lists (plans/drills/members and
matches), query-plan review and real pilot volume/concurrency/latency budgets.
Do not paginate a shared summary input and silently make weekly/dashboard counts
partial: design the page/aggregate contract and its tests first. Legacy endpoint
retirement and reconciliation internals remain explicit compatibility work.
Pilot performance owner/targets are TBD; no index migration is inferred from
synthetic fixture measurements. BL-045 all-seasons wording, BL-044 privacy/minor
policy and M4 rollout remain separate.

Rollback clients to their previous metadata/option array reads first, then remove
the two additive GET handlers and selector component if no callers remain. There
is no data rollback. Previous unbounded reads would return; permission policy and
assignment write contracts remain unchanged.
