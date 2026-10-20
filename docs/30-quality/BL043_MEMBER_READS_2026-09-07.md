# BL-043h.1 — Kadro and Dashboard Player Membership Reads

- Date: 2026-09-07
- Authority: approved BL-043 continuation; existing ADR-0007/0014 boundaries.
- Scope: additive player-membership page and two independent consumers.
- Verdict: Pass for h.1; BL-043 remains in progress.
- No schema, migration, dependency, write-contract or permission-policy change.

## Delivery and semantics

GET /groups/:id/members/players/page retains JWT and existing group view checks
for SYSTEM_ADMIN, CLUB_ADMIN and COACH. PLAYER remains denied. Only limit
(default 25, maximum 100) and after (bounded 160-character identifier) are
accepted; malformed values and unknown fields are rejected. GroupMember.id ASC
keyset paging uses one lookahead row and returns items/total/limit/nextCursor.
Both reads intersect the authorized group and user.role=PLAYER; count is before
cursor filtering. The projection contains membership id/groupId/userId and user
id/name/email/role/position, never passwordHash or authVersion.

This preserves current legacy membership semantics, not an as-of sporting roster
or a new user-status policy. Dashboard's existing “Kadroda aktif” wording does
not imply a new ACTIVE-account filter. No season, Person or SportingAssignment
filter is added. Cursor and total are live reads, not an immutable snapshot;
bounded payloads alone do not establish a production query budget or SLO.

Kadro reads independent 25-record pages, displays the full total and preserves
existing shadcn cards. Accessible previous/next controls, loading/error/retry,
empty continuation versus true empty state and scope-keyed stale-response
rejection are covered. Card numbers continue across pages as list ordinals,
not jersey numbers. Genel Bakış requests limit=1 and uses full total rather
than page length; its failure/retry is independent of other summaries. PLAYER
gets a role notice and no member request, rather than a misleading zero.

The earlier next-step summary named only Kadro/dashboard. Code inspection found
training-detail attendance also consumes shared members. Therefore the full
provider array and existing members endpoint remain unchanged in h.1. They must
not be replaced with a partial page. BL-043h.2 will separate this last attendance
consumer before removing shared full-member fetch/state.

## Verification

- Root quality passed: 597 backend tests / 46 suites, 109 frontend tests / 22
  files, typecheck/lint/format/build, Sites 4/4, CDSK/links and git whitespace.
- Sixteen new backend regressions cover minimal projection, filter-before-count,
  lookahead/empty continuation, denied access and malformed/unknown inputs.
- Five new frontend regressions cover pagination/ordinal 26, independent retry,
  empty continuation, scope changes/late responses, role denial and full total.
  Shared-members getters throw in fixtures to detect accidental consumer use.
- PostgreSQL API E2E: 5 suites / 40 tests passed in 8.529 seconds. The new case
  checks 30 players as 25+5 unique results, full counts, scalar projection, admin
  access, PLAYER/foreign-group/cross-club/anonymous denial and invalid fields.
  Synthetic users/members in that test are removed in finally.
- Chromium E2E: 12/12 passed in 2.7 minutes. A separately gated 30-player legacy
  group uses Catalog Team 029; the main two-player group and native player
  directory fixtures remain intact. The new first scenario verifies 25+5/full
  total 30, ordinal 26, then dashboard 30 and restored main-team total 2.
  Existing training/attendance, board, snapshot, tenant and session flows pass.
- squad-members-{1440,1024,390}.png were captured under ignored
  output/playwright/ngcs-coach-flow/results and visually inspected. Existing
  cards/navigation remain readable; horizontal overflow checks passed.
- Disposable PostgreSQL 16 database ngcs_bl043_members_e2e: all six migrations
  deployed, status current and schema diff empty. After tests, zero active
  connections verified, only this synthetic database dropped and absence checked.
  Fixtures can recreate it; no retained reset, seed or migration was performed.
- Retained ngcs_local_session_dev business fingerprint matches before/after:
  24 tables / 25 rows; session/audit excluded. Local 3001/4000 read-only preview
  confirms Arda/Bora on Kadro and dashboard player total 2. Genel Bakış left open.
- CDSK, local Markdown links and git whitespace checked after documentation
  updates. Final document count: 95; zero broken local links.
- Cumulative dirty worktree preserved: 182 entries before, 186 after four new
  files; no stage, commit or push. Historical changes are not this turn's scope.

Rollback: restore the two prior frontend consumers together and remove the new
read API only after consumers no longer call it. The original full-member API
and provider still exist; database rollback is unnecessary. No new ADR required
for this implementation of accepted scope.

## Next

BL-043h.2: independently bound training-detail attendance membership reads,
preserve complete totals and explicit attendance writes, test scope/page/error
behavior, then remove shared full-member fetch/state after all consumers are
separated. Follow with measured pilot capacity/query budgets; owner/volume/SLO
remain TBD. BL-044 safeguarding, BL-045 all-seasons wording and M4 production
inputs remain separate open work.
