# Two-match senior program — 2026-10-19

Explicit user request implemented as ADR-0043 / REQ-030 / CR-031 / BL-065.

## Change and boundaries

`apps/backend/src/planning/weekly-template.ts` now provides BALANCED_WEEK_V3:
two SENIOR fixtures, nearest previous/next actual kickoff hours, compressed
recovery/activation/briefings up to120-hour intervals, normal longer cycles,
correct local dates for early kickoffs. Academy profiles stay age/school-specific.
The exact editable example presets and fallback limits are in
[ADR-0043](../50-decisions/ADR-0043-two-match-microcycles.md).

`planning-automation.ts` translates supported-template input errors to readable
409s without masking unrelated failures. Existing full-event fingerprints,
protected edits/deletions/exclusions and Serializable all-or-nothing reconciliation
remain. `planning.service.ts` pins explicit preview time overrides at first apply.
No new schema, migration, API, background job or frontend behavior is introduced.

## Automated verification

- Full backend:62 suites /904 tests pass. Focused template/ownership:34 pass.
- Dedicated loopback `ngcs_week_planning_test`:15 HTTP tests pass, including
  write-free ten-team two-match preview, apply, override-time protection, edited
  phase/agenda/deletion preservation, cross-Monday interval change, same-date
  no-repeat, concurrent two-match saves, manual collision, three-match/same-day
  rejection, permission denial and late-checkpoint full rollback.
- First expanded HTTP run had13 passes and one test assertion failure: same-date
  match saves legitimately refresh Match.updatedAt, while planning rows/checkpoints
  do not change. Narrowed the assertion to the intended planning invariant; final
  expanded15-test run passes. Fault-injection diagnostic errors are expected.
- Backend typecheck, full ESLint, Nest normal/quality builds and final format pass.
  No new frontend source; existing actual match-date UI exercises the new backend.

## Backup and real UI rehearsal

Fresh private backup `%LOCALAPPDATA%/NGCS/backups/before-two-match-20261019.dump`
restored successfully into `ngcs_two_match_restore_test` on loopback5433. Isolated
API4014 and UI3500 use this copy. Only in that copy, use the actual date dialog to
move the sample Çaykur Rizespor match18→22 October16:00, making a72-hour interval
before the unchanged25 October16:00 sample Beşiktaş match.

UI save succeeds:8 events updated,7 created,5 obsolete untouched examples retired;
33 edited/deleted/past records protected. Week view shows both fixtures, Friday
recovery30min, Saturday activation20min, combined15min briefings and afternoon
rest. Tuesday's manually extended121min session remains. Independent exact
comparison confirms both user-edited121/103min plans/phases/day links, all academy
plans/day links and35 other complete fixture rows unchanged.36 fixtures remain.

Ignored screenshots under `output/playwright/two-match/`:
`result-desktop.jpg`, `week-desktop.jpg`, `week-recovery.jpg`. They show the isolated
copy, not a retained fixture change. Existing responsive date controls are reused.

Before runtime restart, a separate full44-table hashed snapshot comparison confirms
the retained local DB remains identical. No business-data rollout is required:
41 enrolled checkpoints remain valid, and no actual retained fixture moved.
Normal session refresh after API restart may update authentication session rows.
Final comparison confirms all business rows and existing audits remain unchanged;
only normal refresh-session rotation and two SESSION_REFRESHED audits differ.

## Runtime and handoff

Normal backend build is active on localhost4000; frontend3132 remains. Preserve
existing ignored persistence/tactical flags. DATABASE_URL must be supplied in the
API process environment; the ignored `.env` contains flags rather than connection
credentials. Existing persistent browser session reload restores successfully and
the real Beşiktaş detail still shows25 October16:00. QA services/tabs are stopped
after verification; restored copy and private backup remain available.

Use Maçlar → match detail → Tarih ve saati düzenle for enrolled date updates;
use Hafta → Haftalık program hazırla for new empty weeks. Manual conflicts require
editing the conflicting schedule, never deleting checkpoint/slot audits. Three+
fixtures, same-day or sub24-hour intervals remain manual. Old root-tool limitations
are tracked separately in BL-061; this increment does not claim a full root gate.
No commit, push, production deployment or retained data reset.
