# BL-043h.2 — Training Attendance and Shared-Member Cutover

- Date: 2026-09-07
- Authority: approved BL-043 continuation; ADR-0007/0014/0019.
- Scope: independent attendance page, editor projection and last shared list.
- Verdict: Pass for h.2; BL-043 capacity validation remains open.
- No schema, migration, dependency or write/permission-policy change.

## Delivery

GET /attendance/page accepts only bounded planId, limit (25 default, 100 maximum)
and after. Plan view authorization runs first; the server derives its group.
The ID-keyset membership page intersects current PLAYER role before paging and
both total/presentTotal counts. PLAYER principals intersect their own user ID
in all reads, not merely in the rendered rows. Group-less plans have no roster.
Only membership id, playerId, name and nullable PRESENT/ABSENT status are sent.
Email, credentials, health and nested user data are absent. The existing unique
plan/player constraint bounds the selected attendance relation to one record.

Full counters apply to current legacy membership like the existing attendance
overview, not historic SportingAssignment or a new ACTIVE-account filter.
Departed members' attendance is not deleted; old authorized complete endpoints
remain available. Counts are independent of the cursor. Live concurrent reads
are not an immutable snapshot and do not establish a production query budget.

GET /training-plans/:id/editor retains plan view authorization and the plan/drill
editing graph while omitting attendance and nested group members. Inspection
found the old detail embedded both, so removing only the provider fetch would
not have eliminated the complete member read. Existing legacy detail and
attendance list responses remain compatible. Drill/snapshot graph size is not
newly bounded in this delivery; it remains an explicit editor-size concern for
capacity measurement rather than a claim that every query is constant-cost.

The independent PlanAttendance component uses 25-record pages and full counters,
scope/plan-keyed state, late-response rejection, accessible paging/pressed state,
distinct loading/failure/zero/empty continuation and read-only PLAYER self view.
The existing shadcn card and navy/blue visual identity remain. A lock prevents
duplicate clicks while a write is pending and disables paging. Only explicit
PRESENT/ABSENT is sent to the unchanged authorized atomic upsert. No optimistic
success or automatic write retry occurs. After success, the same page and full
counts are re-read. Failed or uncertain writes require an explicit current-state
read; post-write read failure retries only the read.

WorkspaceProvider no longer fetches, stores or distributes members. Plans,
drills, matches and members now all have independent consumers. Legacy helper
functions/endpoints remain available but are not called by this provider/detail.
Workspace metadata and drill/snapshot editing behavior are preserved.

## Verification

- Root quality passed: 612 backend tests / 47 suites, 115 frontend tests / 23
  files, both typechecks/builds, format, Sites 4/4, CDSK/links and git whitespace.
  An obsolete provider effect dependency warning was removed; final backend and
  frontend lint passed. Test-only query typing was fixed before the final E2E.
- Fifteen new backend regressions cover projection, filter-before-count,
  self scope, denied plan, empty continuation/group-less plan, invalid/unknown
  query input and editor omission/authorization. Six frontend cases cover
  full totals, page retry, write serialization, uncertain write, post-write read
  failure, stale response, actual zero and PLAYER read-only state. Existing
  provider tests now delay metadata and forbid full members reads.
- Final API E2E: 5 suites / 40 tests passed in 7.452 seconds. Extended member
  fixture verifies 30 players as 25+5, full counts, page-two write/reread,
  scalar-only response, four-role reads, PLAYER self-only/read-only behavior,
  cross-group/club denial, invalid fields, anonymous denial and editor omission.
  Existing uniqueness, tenant, board and snapshot regressions remain passing.
- Browser fixture adds one synthetic plan with two PRESENT records in its
  separate 30-player group; primary two-player fixtures remain unchanged.
  First browser scenario passed: 25+5, page-two PRESENT→ABSENT, full total 2→1,
  reload persistence, first-page record unchanged and no complete member request.
  attendance-members-{1440,1024,390}.png in ignored output/playwright results
  were visually inspected; horizontal overflow checks passed.
- Initial full browser runs exposed test expectations, not an accepted bypass:
  the snapshot flow still waited for the old detail URL; a dashboard label
  selector also matched its transient loading message. Updated the response
  predicate to /editor and the counter selector to exact label matching, without
  changing application behavior, weakening assertions or raising timeouts.
- Final full Chromium rerun: 12/12 passed in 2.7 minutes, including the corrected
  expectations, snapshot preservation, tenant denial, persistent sessions and
  dirty navigation. Frontend lint/format and backend format passed after fixes.
- Disposable PostgreSQL 16 ngcs_bl043_attendance_members_e2e: six migrations
  deployed, status current and schema diff empty. No retained reset, seed,
  migration or attendance write was performed.
  After final tests, zero connections verified; only this synthetic database
  was dropped and absence checked. The fixture can recreate it.
- Retained ngcs_local_session_dev business fingerprint unchanged before/after:
  24 tables / 25 rows (session/audit excluded). Read-only local preview shows the
  existing four-phase plan and Katılım 0/2 for Arda/Bora; that tab is left open.
- Final CDSK/Markdown/diff checks passed: 96 Markdown files, zero broken local
  links. Cumulative dirty worktree retained (186 entries before, 190 after);
  no stage/commit/push. Existing unrelated changes remain untouched.

## Rollback and next

Coordinated code rollback restores the prior provider, training-detail consumer
and complete-detail API caller; backend legacy contracts remain available. No
database rollback is needed. Do not remove new read endpoints while frontend
calls them. New ADR is unnecessary for this implementation of accepted policy.

BL-043 remains open for repeatable mixed-workload capacity/query/payload
measurements, including complete editor graphs. Pilot owner, actual volume and
SLO remain TBD; measurements must not be presented as approved production limits.
BL-044 safeguarding, BL-045 all-seasons wording and M4 production inputs remain
separate open work. No stage, commit, push or production rollout in this delivery.
