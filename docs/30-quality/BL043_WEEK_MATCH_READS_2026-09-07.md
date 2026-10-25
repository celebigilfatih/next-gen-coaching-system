# BL-043g.4 — Week Match Reads

- Date: 2026-09-07
- Scope: independent daily match pages in Hafta.
- Authority: approved BL-043 continuation; existing ADR-0007/0014 boundaries.
- No backend/API/schema/migration/dependency or permission-policy change.
- Verdict: Pass for this weekly match slice; BL-043 remains open.

## Delivery

Hafta no longer consumes the shared matches array. Each of the seven days reads
the existing match catalog with limit=25 and half-open from/until boundaries.
Local midnight and next local midnight are converted to absolute timestamps;
calendar-day arithmetic handles DST rather than assuming every day is 24 hours.
Chronological match links, time/location and amber cards are preserved.

Each day owns its full match total, cursor history, previous/next controls and
loading/error/retry. Training reads and pagination remain independent. Week or
club/team/season changes remount the keyed day state and discard late responses.
Only explicit all-seasons context may omit seasonId; missing concrete-season
context shows a notice without broadening the match read. A general empty-day
message requires confirmed zero full training and match totals, not loading,
failed or partially loaded results. An empty continuation page retains a way
back to the previous page.

This introduces seven bounded match HTTP reads per week view, not a promise of
bounded database work or a production SLO. Totals and rows remain independent
live reads. Match detail and the shell notification count still need the shared
legacyContext/provider list; the full shared fetch is retained until both move.
This step does not eliminate shared workspace board/analysis JSON traffic.

The prior handoff's remaining-consumer summary omitted app-layout.tsx's
matches.length notification badge/message (lines 120, 205–212). This inspection
corrects current API/Boot/README/backlog guidance: detail alone is not the final
cutover prerequisite. Historical delivery entries remain historical.

## Verification

- Five new regressions plus five existing week-read tests cover local daily
  parameters, independent 25-record pagination/full totals/detail links,
  loading/error/retry versus real empty days, scope/week resets, late responses,
  explicit all-seasons and missing concrete-season behavior. A throwing shared
  matches getter prevents accidental full-array consumption.
- Targeted calendar/read tests passed: 2 files / 12 tests with
  TZ=America/New_York, including the 23-hour 2026-03-08 DST transition.
- Root quality passed again after the E2E waiter/button refinements: 571 backend
  tests, 98 frontend tests, Sites 4/4, typecheck, lint, format, builds, CDSK/links
  and git whitespace. The final test-only h1 locator change passed ESLint and
  Prettier separately. Final CDSK/links/whitespace: 93 Markdown files, zero
  broken local links; all passed.
- API E2E passed: 5 suites / 39 tests, 7.63 seconds, disposable PostgreSQL 16.
- Browser flow checks a day with 30 matches as 25+5, scalar payloads, full
  totals, independent training empty state, week reset and second-page detail
  navigation. Responsive controls must be in the viewport at 1440/1024/390 px;
  screenshots use week-matches-{width}.png in ignored
  output/playwright/ngcs-coach-flow/results. Final Chromium result: 11/11 passed
  in 2.6 minutes. All three final screenshots were visually inspected; day-card
  button bounds and document overflow checks passed. Existing horizontal
  calendar scrolling on narrow screens remains intentional.
- Initial browser run: 10 passed / 1 failed. The pre-existing Maçlar response
  waiter accepted a late daily Hafta response (0) instead of the season catalog
  (31). It now matches limit=25 with no from/after; no assertion was weakened.
- The corrected run passed all 11 tests in 2.8 minutes. Visual inspection then
  found clipped long pagination labels in narrow day columns. Visible labels
  are now shorter while full match-specific accessible names remain. The final
  browser run additionally asserts button bounds fit inside the day card.
- The next run exposed another pre-existing navigation-test race: a generic
  heading locator accepted the list card's h3 before match-detail navigation
  completed (10 passed / 1 failed). It now requires the detail h1 before
  navigating back; the reset assertion remains unchanged. Final rerun result
  is recorded above.
- Read-only local preview verified the retained 6 September match (1 match,
  18:00, Deplasman) and the 7 September 75-minute demo training on their days.
  Local 3001/4000 servers remain available; no retained business write occurred.
- Six existing migrations are current on disposable PostgreSQL 16 database
  ngcs_bl043_week_matches_e2e; schema diff is empty. Retained business fingerprint
  passed unchanged: 24 tables / 25 rows (session/audit excluded). No retained
  reset/seed/migration. After zero active connections were checked, only this
  synthetic database was dropped and its absence verified. Its data can be
  recreated with the existing disposable fixture. The retained fingerprint
  was rechecked after the final browser run and remained identical.
- Cumulative worktree preserved (178 status entries before, 179 after adding
  this report); no commit, stage or push. Application changes are limited to
  the daily API helper and week route, with focused unit/E2E extensions.

## Next and limitations

Next: BL-043g.5 independently authorized match detail and a minimal shell count,
then remove the shared matches/full-fetch dependency. Member reads, pilot
volume/owner/SLO and BL-044/045/M4 remain open. Unknown policy/production inputs
stay TBD.
