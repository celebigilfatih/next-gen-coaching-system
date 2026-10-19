# BL-043f.1 — Bounded Exercise Library

- Date: 2026-09-06
- Scope: additive authenticated drill catalog and independent library UI pages.
- Authority: approved BL-043 continuation; existing ADR-0007/0012/0014/0022/0023
  boundaries. No schema/migration/dependency or permission-policy change.
- Verdict: Pass for this library slice; BL-043 remains in progress.

## Delivery

`GET /drills/catalog/page` validates groupId/category/limit/cursor and rejects
unknown fields. Existing current group access is checked before catalog queries.
Age group is read from that authorized group's metadata, never supplied by the
client. The endpoint reuses the existing drill visibility predicate: coaches and
players see global plus own-club-wide/selected-group drills; club admins retain
all own-club drills and system admins retain global visibility. These admin
semantics are deliberate legacy parity, not a new group-restriction policy.
Every role's result intersects the selected age/category filter.

The default 25 / maximum 100 rows use stable createdAt-desc/id-desc keysets and
full filtered totals independent of the cursor. Card projection omits board JSON,
image/creator/tenant data and nested objects. A second query classifies only the
returned IDs by their JSON kind marker, selecting IDs only. `isBoard` is the old
UI's display hint, not a promise that imported historical JSON is valid. Existing
detail and write validation remains authoritative. No new search UI is claimed.

Library uses existing shadcn tabs/cards/buttons and visual tokens. Category and
workspace changes reset page state and discard late responses. Loading, failure,
retry, empty scope and empty continuation are explicit. Full totals do not shrink
to a page count. Board cards still open the existing tactical editor.

The library does not read `workspace.drills`; other consumers still do. Therefore
the shared full GET /drills remains and opening the app is not yet fully bounded.
Dashboard counters, tactics and training drill choices must migrate before that
shared read can be removed. Never substitute a partial page for the full array.

## Verification

- Backend: 44 suites / 532 unit tests passed, including 24 new parser/projection,
  full-total/cursor, denied scope, empty page and visibility checks.
- Frontend: 17 files / 70 unit tests passed. Five new library cases cover page
  totals/links, server category reset, stale scope responses, retry and missing
  workspace. A throwing getter guards against reading the shared drill array.
- Disposable PostgreSQL 16 API E2E: 5 suites / 38 tests passed. The added fixture
  traverses all 33 coach-visible records with equal timestamps and no duplicates,
  matches legacy-list IDs, tests PLAYER/CLUB_ADMIN/SYSTEM_ADMIN totals, category
  filtering and JSON omission, and rejects unauthenticated/foreign/unassigned
  groups and client tenant/age/cursor injection. Initial fixture creation lacked
  the required CLUB creator and correctly hit the existing ownership constraint;
  the synthetic fixture was corrected, with no production constraint change.
- Root quality passed backend/frontend typecheck, lint, format, unit and builds,
  Sites 4/4, CDSK, links and whitespace. Final documentation checks cover 86
  Markdown files with zero broken local links.
- Extended Chromium first flow passed 35-drill 25+10 pages, category reset with
  31 tactical / 2 technical full totals, board detail opening and controls with
  no overflow at 1440/1024/390 px. Full 11-test suite passed in 2.6 minutes,
  including existing scope, session, dirty-navigation and cross-tenant workflows.
- Local read-only preview on port 3001 shows 5 existing exercises and 5/5 total;
  the current library cards/tabs render correctly. No exercise was created or
  modified in the retained app. Backend remains on port 4000.
- Disposable migration deploy passed all six migrations; status is current and
  schema diff is empty. Retained before/after business fingerprint matches 24
  tables / 25 rows, excluding session/audit lifecycle records. With zero active
  connections confirmed, the disposable database was removed and absence checked.
  Only regenerable synthetic fixtures were removed; local business data survives.

Tests use `ngcs_bl043_library_e2e` on loopback PostgreSQL, browser ports 3500/4500,
synthetic credentials and explicit destructive-test/persistent-session opt-ins.
Browser fixtures enable PLAYER_PAGE/CATALOG/HISTORY/TRAINING_PAGE/DRILL_PAGE.
No reset/seed/migration is run against the retained local database. Browser
artifacts stay in ignored `output/playwright/ngcs-coach-flow`.

## Remaining boundary and rollback

Next slice: remaining drill consumers and full dashboard counters, then match/
member reads and measured pilot query budgets. Count and page are independent
reads, not an immutable snapshot under concurrent writes. No pilot SLO, query
budget or universal workspace performance claim follows from this small fixture.
Owner/SLO remain TBD; BL-043 is still in progress; BL-044/045 and M4 remain open.

Rollback restores the previous library consumer while retaining the shared
drill list; the additive endpoint can remain unused. No data rollback is needed.
Preserve earlier cumulative worktree edits. No commit/push is part of this slice.
