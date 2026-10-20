# Ready drill local publication — 2026-10-19

Subsequent retained browser acceptance now verifies actual A Takım library →
existing training attachment, saved previews/copies and day totals through normal
Chrome login. See [browser evidence](READY_DRILL_RETAINED_BROWSER_2026-10-19.md).
The earlier browser limitation below describes this publication operation only.

## Authorization and result

All 120 unchanged `ngcs-starter-v1` exercises are now PUBLISHED on the retained
Windows database `127.0.0.1:5433/ngcs_local_session_dev`. The user first approved
migration/import/publication, named Fatih Çelebigil and approved the package,
then explicitly accepted: “Evet, yalnız bu yerel 120 içerik için istisna”.
[ADR-0041](../50-decisions/ADR-0041-local-starter-review-exception.md) is Accepted.

The same existing SystemAdmin remains import author, reviewer and publisher.
This is recorded truthfully as a local same-account exception, not independent
review. No synthetic identity, new login, role grant, authorship rewrite or
permanent runtime policy change was introduced. Production, other databases,
future revisions and other content are outside this exception.

## Maintenance operation and verification

- Added maintenance-only `apps/backend/scripts/publish-local-starter.js` and its
  `node:test` suite. The serving application does not import this script.
- Default dry run; exact loopback host/port/database allowlist, production
  rejection, Accepted ADR, explicit process opt-in and exact approval reference
  required for CLI apply. Test mode accepts only `ngcs_starter_publication_test`.
- Manifest is pinned by canonical JSON SHA-256
  `baac44256aea6e8c35b98db3489b3c9b39170e2a5a42881aec01749d41aa38b6`.
  All 120 first versions, original actor, sources, instruction fields, boards,
  legacy projections and every age adaptation are checked before writes.
- One Serializable transaction performs submit, named same-account review,
  source verification and publication for all 120. Audit metadata records
  ADR-0041, approval reference, Fatih Çelebigil, manifest hash and
  `independentReview=false`. The original 120 import audits are retained.
- **10/10 tests pass**, no skips, on a newly created dedicated PostgreSQL DB
  with the approved 13 migrations. Coverage: target/manifest guards, dry-run
  zero writes, wrong actor/content changes, mixed state, injected late audit
  failure rolling back versions/sources/audits, concurrent publication without
  duplicate events, replay, corrupted audit evidence and CLI approval/production
  rejection. The fixture administrator is explicitly synthetic.
- Existing content/catalog/starter API unit suites also pass **38/38**, retaining
  the ordinary author/reviewer and first-package guards.
- Scoped ESLint/Prettier pass. No application runtime source changed in this
  operation. Prior application QA and Windows root quality/CDSK limitations
  remain in the [implementation report](READY_DRILL_PLANNING_2026-10-19.md).

## Retained execution evidence

- New private custom-format backup before publication:
  `%LOCALAPPDATA%/NGCS/backups/before-starter-publication-20261019.dump`
  (194,701 bytes). Restored into a separate newly created database; all rows
  match across 43 tables before publication, excluding volatile refresh sessions.
- Retained dry run: 120 ready / 0 writes. Apply: **120 published**.
  Read-only verification sees all 120 already published. Explicit replay:
  **0 published / 120 already published**, no added audit rows.
- Exactly 120 PUBLISHED versions with named reviewer/publisher and 120 source
  verifications. Exactly 120 SUBMITTED + 120 APPROVED + 120 PUBLISHED audit events
  carry the approved exception reference. No draft/partial release remains.
- Immediately after publication, 43-table hashes/counts match the restored backup
  when excluding only approved starter editorial/verification fields and the
  360 new exception audits. Original drills (including the two-scene V2 CLUB
  pilot), boards, age adaptations, account/club/team/match/plan data and migration
  history are unchanged. At this point migration count was 13. No API restart or
  tactical flag/environment-file change was needed for publication.
- During final verification the separate approved weekly-planning task added
  its audit migration (retained count now 14), 51 TrainingPlans, 204 PlanDrills,
  204 additional Drills, 90 DayPlans, 20 WeekPlans and 11 WEEK_PLANNING_APPLIED
  audits. These additions were preserved, not attributed to publication or
  reverted. A second comparison confirms all **1,020 pre-publication rows**
  across 43 tables still match after excluding only the approved editorial/
  verification fields. Publication state, all 120 original contents and catalog
  checks still pass. The separate operation is documented in the runbook.
- Read-only calls to the existing compiled catalog/detail services, using the
  existing admin principal and real retained team scope, return exact-age
  published items: U12 48, U14 72, U16 72, U18 72, SENIOR 48. Union is exactly
  120 unique IDs. Each age's preview resolves the requested variant and V1 board.
  U8 returns zero, preserving the no-nearest-age rule.
- These are database and real-service checks, not a fresh authenticated browser
  or HTTP login claim. This chat has no authenticated retained browser session;
  the existing Chrome NGCS tab belongs to another active task and was not used.
  Prior responsive browser planning acceptance remains separate QA evidence.
- Markdown links initially pass (156 files, zero broken links); a later aggregate
  check sees seven new references from concurrent weekly work to its not-yet-written
  `WEEKLY_CLUB_PROGRAM_2026-10-19.md` report. Those unrelated references were
  preserved; this publication report and ADR targets exist. Scoped formatting and
  Git whitespace checks pass. No fully green final aggregate link claim.
  Disposable test and
  restore databases plus the container temporary dump were removed after
  verification; both private pre-import/pre-publication Windows backups remain.

## Operational limits and recovery

The library shows the selected team's supported ages, rather than all 120 at
once. Manifest source remains DRAFT/TBD as the unchanged authoring artifact;
database versions/audit are the published release record. This approval does
not establish independent external sporting certification.

General author/reviewer separation and all-120 API guards remain unchanged.
Future revisions must use the ordinary review flow. The maintenance operation
rejects changed versions, mixed states and unmatched audit evidence. An uncertain
write requires a read-only state check before any explicit retry.

To withdraw the local package, archive its published versions through the
existing audited SystemAdmin workflow; retain source/history and plan snapshots.
Do not delete content history or restore the whole retained DB over later edits.
Creating a training plan as SystemAdmin still requires an actual active COACH in
the chosen club; sporting example staff alone do not create that account. No
coach account was implicitly created by this publication.
