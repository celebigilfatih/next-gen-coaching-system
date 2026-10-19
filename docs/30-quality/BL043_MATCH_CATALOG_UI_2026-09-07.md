# BL-043g.2 — Match Catalog UI

- Date: 2026-09-07
- Scope: independent paginated Maçlar route on the existing g.1 API.
- Authority: approved BL-043 continuation; ADR-0007/0012/0014 unchanged.
- No backend runtime, API contract, schema, migration or permission change.
- Verdict: Pass for this UI slice; BL-043 remains in progress.

## Delivery

Maçlar no longer consumes/sorts the shared matches array. It reads 25 scalar
records through GET /matches/catalog/page with its current legacy group/season.
Server chronological date/ID order and full total are preserved; page rows are
replaced rather than appended. Board presence uses hasBoard, not board JSON.
Existing shadcn cards, amber match accent, notes, formation and detail links stay.

The keyed child resets cursor/data on club, club-season, team or legacy resource
changes. Late responses cannot restore the previous scope. Only explicit '*'
selects all seasons; an unresolved concrete season shows missing context rather
than silently widening the query. Loading, workspace error/reload, page
error/retry, genuinely empty scope and empty continuation are distinct. A failed
or empty continuation retains previous-page access. Named pagination controls
wrap on small screens, and status text reports current page size/full total.

The provider/legacyContext still returns complete matches for Genel Bakış,
Hafta and match detail. This step does not claim complete browser bandwidth
optimization. Removing the shared list or replacing it with one page would break
those consumers, particularly detail links from later pages.

## Verification

- Five new route tests cover minimal card/hasBoard/detail links, full totals,
  paging, scope reset and stale responses, loading/error/retry, missing context
  without widening, and empty continuation/zero distinction. A throwing matches
  getter guards against reintroducing shared-array consumption.
- Root quality passed: 571 backend tests, 89 frontend tests (20 files), Sites
  4/4, both typecheck/lint/format/build gates, CDSK, links and whitespace.
- Disposable API E2E passed: 5 suites / 39 tests, 7.82 seconds.
- E2E_MATCH_PAGE_FIXTURE=true adds 30 synthetic October matches to the existing
  one-match browser fixture, with alternating board presence. The existing
  disposable/reset guard is retained; ordinary/local seed data is not changed.
- Extended first Chromium flow passed: 31 total, 25+6 pages, scalar payload
  without board/analysis/video JSON, both board badges, second-page detail,
  route return and all-season/selected-season reset. Controls and page overflow
  were checked at 1440/1024/390 px; screenshots are in ignored
  output/playwright/ngcs-coach-flow/results (matches-{width}.png).
- Local read-only preview shows one retained match, correct note/formation and
  1/1 count with disabled page controls. Frontend/backend remain on 3001/4000.
  No synthetic matches were added to retained data.
- All 11 Chromium tests passed in 2.7 minutes, including saved snapshots,
  match-board writes, cross-tenant rejection, persistent sessions and dirty
  navigation. Screenshots at all three widths were visually inspected.
- Six existing migrations deployed to isolated PostgreSQL 16 database
  ngcs_bl043_match_ui_e2e; status current and schema diff empty. Retained
  business fingerprint stayed 24 tables / 25 rows (session/audit excluded).
  Zero active connections were checked before dropping the exact synthetic
  database; absence verified. No retained reset, seed or migration was run.
- Final CDSK and local-link checks passed: 91 Markdown documents, zero broken
  links; git diff --check passed. Existing cumulative worktree preserved,
  with no commit/push. Browser test artifacts remain ignored.

## Remaining and handoff

Next: BL-043g.3 bounded Genel Bakış match reads, then Hafta and an independent
authorized match detail read before the shared-match cutover. Member reads and
measured pilot capacity/owner/SLO remain TBD. Pages/counts are live reads, not
an immutable snapshot. BL-044/045/M4 remain separate policy/production gates.
