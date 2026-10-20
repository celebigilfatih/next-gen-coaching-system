# BL-043e.3 — Dashboard Training Reads

- Date: 2026-09-06
- Scope: dashboard training/PRESENT counters and recent plan cards only.
- Authority: approved BL-043 continuation within Accepted ADR-0007/0014/0022/0023.
- Verdict: Pass for this slice; week/attendance cutover remains open.

## Delivery and boundaries

`/app/dashboard` no longer consumes `workspace.plans`. A typed client reuses
`GET /training-plans/catalog/page` with `limit=3` and exact legacy group/season.
Full-scope `summary.total` and `summary.presentAttendance` feed the counters;
minimal items feed recent cards with scalar `phaseCount`. The existing server
date-desc/null-last/ID-desc ordering supplies deterministic recent records.
An omitted season still means all seasons, including undated drafts. Current
legacy permissions, tenant filtering and PLAYER self-attendance remain unchanged.

The component key includes club, club-season, team, group and legacy season.
Scope changes reset the read; late responses from a previous scope are ignored.
Loading and failure show unavailable counters, not false zeros or an empty list.
An alert provides route-local retry. Genuine empty results show zero totals and
the existing empty message. Missing legacy group, workspace loading or workspace
failure prevents the independent request; workspace failures have their own retry.

The existing shadcn cards, colors, match links and responsive shell are preserved.
Matches, drills and members still use shared data. `WorkspaceProvider` still
fetches complete plans for week and attendance: this slice does **not** eliminate
that network/serialization cost and must not substitute a first page for those
consumers. Backend, schema, migrations, dependencies and security policy were not
changed in this slice. Cumulative earlier worktree changes remain untouched.

## Verification

- Root `npm run quality` passed: 43 backend suites / 492 unit tests, 14 frontend
  files / 55 unit tests, typechecks, lint, format, builds, Sites 4/4, CDSK,
  Markdown links and whitespace checks (documentation checks repeated at closure).
- Five new dashboard unit cases verify full counters/scalar phases, loading/error
  and independent retry, stale scope/all-seasons, missing/loading/failed scope,
  and genuine empty results. Their workspace mock throws if shared plans are read.
- Existing backend E2E: 5 suites / 35 tests passed on a fresh disposable database.
  Six existing migrations deployed; no migration was added or altered.
- The extended training browser case passed: the actual overview response has
  three items and full total 31, deterministic first item `Training Catalog 029`,
  31→32→31 season changes, three recent links, and no overflow at 1440/1024/390 px.
  The same flow confirms attendance still contains all 31 plans and the catalog
  still supports 25+6 pages and undated detail navigation.
- Full Chromium suite: all 11 tests passed (2.6 minutes), including existing
  cross-tenant, snapshot, persistent-session and dirty-navigation regressions.
  Migration status is current and schema diff is empty on PostgreSQL 16.
  After confirming zero active connections, the disposable database was removed
  and its absence verified. Only synthetic, regenerable fixture data was removed.
- Retained local business fingerprints before/after: PASS, 24 tables / 25 rows
  unchanged, excluding session/audit lifecycle records. No retained migration,
  seed, reset or business write was performed.
  Local preview on port 3001 shows one plan, 75 minutes and four phases; no UI
  writes were performed. The existing backend remains on port 4000.

Browser verification uses the existing runner, isolated ports 3500/4500,
`ngcs_bl043_dashboard_e2e`, destructive-test opt-in, synthetic credentials,
persistent-session opt-in, and PLAYER_PAGE/CATALOG/HISTORY/TRAINING_PAGE fixtures.
Artifacts remain in ignored `output/playwright/ngcs-coach-flow`.

## Next step and rollback

Next: migrate week to explicit period/day reads without losing undated plans or
calendar boundary behavior, then attendance to bounded reads/full totals. Remove
the shared full plan read only after every remaining consumer is migrated and
regression-tested. Other business lists, pilot owner/SLO (TBD), BL-044/045 and M4
remain open; this is not a production-readiness claim.

Rollback only the dashboard route and its typed overview helper to the prior
shared-array consumer. The additive catalog API remains; no data rollback is
needed. Preserve the independent catalog route and earlier worktree changes.
