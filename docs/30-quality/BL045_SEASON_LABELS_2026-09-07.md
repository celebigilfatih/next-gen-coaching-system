# BL-045 — Explicit All-Seasons Labels

- Date: 2026-09-07
- Verdict: Pass; BL-045 Done.
- Authority: existing BL-045 acceptance criteria, ADR-0011/0022 workspace scope.
- Scope: frontend presentation and tests only; no new ADR required.

## Cause and correction

All-seasons selection intentionally has no single season record. Sidebar, week,
dashboard and settings treated this absence as unknown data; the top bar made
the inverse mistake, presenting every missing club season as all seasons.

The shared `workspaceSeasonLabel` helper in
[workspace-scope.ts](../../apps/frontend/src/lib/workspace-scope.ts) recognizes
only the validated scope's explicit `clubSeasonId === '*'` as “Tüm sezonlar”.
Otherwise the existing selected name or missing-value label is retained.

| Surface | Name source retained | Missing exact/empty scope |
| --- | --- | --- |
| Sidebar and top bar | Selected ClubSeason | Sezon TBD |
| Week and dashboard subtitle | Selected legacy Season | Sezon TBD |
| Settings active context | Selected legacy Season | TBD |

No ClubSeason fallback is invented for a missing legacy Season. Team card season
facts remain unchanged: these are individual records, not workspace scope labels.
Scope resolution, URL/localStorage persistence, dirty blockers, request filters,
API authorization, database schema and dependencies are unchanged.

## Verification

- Six helper cases: explicit all with/without a stale name, named exact selection,
  missing exact selection, empty scope and settings-specific missing wording.
- Four rendered-component regression cases exercise selected → all → missing
  exact → empty → selected in shell, week, dashboard and settings. The shell
  asserts both sidebar and top-bar labels. These tests mock workspace input and
  disable business reads; they are not backend/browser E2E.
- Focused tests: 33 passed, including existing week/dashboard read regressions.
- Root `npm run quality`: 655 backend / 143 frontend unit tests passed; both
  typechecks, lint, format, builds, Sites 4/4 and repository checks passed.
  First sandboxed run stopped at the frontend build's temporary preview listener
  with EPERM; the complete rerun with loopback permission passed.
- Final Markdown links, CDSK and `git diff --check` passed after documentation.
- Backend tracked-diff fingerprint unchanged before/after this slice.

## Local browser smoke

Both local servers were initially stopped. Existing development settings were
restarted at frontend localhost:3001 and backend localhost:4000 against the
retained ngcs_local_session_dev database. No migration, seed, password reset or
business mutation ran. The existing refresh cookie restored the local session;
routine session renewal is not a business-data write.

In-app browser accessibility state confirmed all-seasons labels in the dashboard,
sidebar and top bar; selecting the available exact season displayed its actual
name. Week displayed the selected name and then “Tüm sezonlar” after switching
back. Settings also displayed “Tüm sezonlar”. The new preview was returned to
dashboard with the original all-seasons scope and kept open. A 1280×720 screenshot
was visually checked; no new 1440/1024/390 viewport or full browser suite is claimed.
The original unreachable tab was not closed.

HTTP frontend/backend smoke returned 200. Retained business fingerprint matched
the established manifest: 24 tables / 25 rows; session/audit rows are excluded by
that existing check. No disposable database was needed. API E2E/migration suites
were not rerun because backend and schema are unchanged. Local dev servers remain
running. No stage, commit or push was performed.

## Remaining work and rollback

BL-043 representative pilot acceptance remains open: owner, representative data/
workload, environment and performance budgets are TBD. BL-044 safeguarding,
BL-009 health policy and M4 rollout remain separate approval gates; no clinical
data, inferred policy or production activation is authorized by this label fix.

Next: consolidate those remaining decision inputs into an approval-ready plan,
starting with BL-044 safeguarding boundaries; implementation requires explicit
approval for new privacy/security rules. Do not invent owners or legal bases.

Rollback only this helper and the five label consumers plus their regression
tests; preserve unrelated cumulative work. No data rollback is necessary.
