# Ready-only exercise library — 2026-10-20

The user explicitly requested showing only the authored120 ready exercises in
the library, separate from seasonal program records. This supersedes the older
mixed-source library direction. No stored exercise or plan is removed.

## Behavior

`/app/library` always requests `collection=ngcs-starter-v1`. The backend applies
the exact repository starter-ID allowlist, GLOBAL scope and PUBLISHED-version
requirement before both count and pagination. A source-kind filter alone would
also admit future unrelated NGCS originals; the exact collection excludes them.
Legacy/versionless and seasonal CLUB content cannot enter these results.

The initial library covers all ages, returning120 records in the current local
published catalog. Explicit age, phase, search and advanced filters narrow that
package. Reset retains the collection. Removed the mixed-source switches and
club-board creation shortcut from this page; the existing tactical route still
creates boards. Each row displays its age; an unfiltered preview requests that
row's age. Exact team age and publication/version/access guards still apply to
attachment from the detail view.

The optional collection parameter leaves existing non-collection API clients
and their implicit team-age behavior intact. The all-age response omits
ageGroup; its type is optional. Rows prefer their original-age matching variant
for scalar facts, with an applicable filtered variant when necessary.

## Verification

- Backend catalog unit suite35 passes, including collection-before-count/cursor,
  invalid values, legacy exclusion, exact-age and original-age projection.
- Affected frontend41 cases: planning/picker/detail passed in the first run;
  after updating old route mock expectations, all11 library cases pass.
- Dedicated loopback `ngcs_ready_drills_test`: all11 HTTP scenarios pass. The new
  case introduces seasonal CLUB and non-starter published NGCS fixtures, traverses
  all pages and matches the exact120-ID manifest, checks SENIOR48, default
  unsupported-team browsing120 and explicit U13 zero. Publication-count assertions
  are scoped to starter IDs so unrelated persisted test fixtures do not poison
  release-gate checks. No retained publication or business writes were performed.
- Aggregate quality: backend932/frontend543/Sites4/tooling8, backend type/lint/
  format/build and frontend lint/build pass. Initial root15/17 failed frontend
  typecheck (two test-only unsupported exact options) and frontend format while
  concurrent tactical artwork was being edited. Final current-tree typecheck
  and whole-frontend format both pass in the normal quality runner's two-stage
  repeat, exit0. This is not a fresh unmodified17/17 root run. Affected backend
  source/HTTP-test lint and format also pass after the final fixture adjustment.
- Actual authenticated UI3132/API4000: five pages25/25/25/25/20,120 unique IDs,
  every ID matches the starter package. Age Sheet defaults to all ages; SENIOR
  narrows to48 and clearing returns120. No seasonal-source switch remains.
  Full reload retains login and120, verified in the final screenshot.
- Read-only collection verifier still matches all48 saved snapshots and preserves
  the prior41 business-table fingerprints. No stored seasonal exercise, plan,
  attendance or calendar was changed. Local API was rebuilt/restarted using the
  existing loopback DB and ignored flags; UI remains running.

Ignored logs: `output/library-ready-only-quality-20261020.log` and
`output/library-ready-only-quality-final-20261020.log` (the two-stage repeat),
plus `output/library-ready-only-http-20261020.log`. Final197-file Markdown links,
CDSK36 required documents/47 ADRs and whitespace pass. Screenshots:
[library120](../../apps/frontend/qa/library-ready-only-2026-10-20/library.png).

## Files and handoff

Backend: drill-page DTO/service and catalog/HTTP tests. Frontend: library route,
route tests, API types and the filter's optional default-age label. Product/API/
test guidance, README, AGENTS, changelog and Boot are updated. This is the user's
approved content-display correction; no new ADR, schema, migration, dependency,
flag or production deployment. Prior attendance/tactical work is preserved.
Open `/app/library` for the ready-only catalog. Existing saved training collections
and seasonal programs remain available through their original plan routes.
