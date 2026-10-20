# ADR-0042: Fixture-aware updates preserving manual planning

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** Subsequent explicit user request: automatically update A Takım
  training/meetings when match date/time changes, preserving manual changes.
- **Related:** ADR-0040, REQ-028, CR-029, BL-063

## Decision

Reconcile managed SENIOR programs synchronously inside the authorized match-date
update transaction. Recompute existing enrolled calendar weeks around both old and
new dates, including adjacent-week preparation/recovery. No cron, external service,
new table, migration or automatic academy changes. This supersedes ADR-0040's
requirement for manual review of every fixture-date change for enrolled programs.

Existing WEEK_PLANNING_APPLIED audit storage gains immutable versioned per-week
automation checkpoints: generated event keys/specifications, row IDs and content
fingerprints, protected/excluded/deleted keys. Future retention must preserve
these checkpoints along with existing request/slot markers. New SENIOR program
applications capture them in the same transaction. Only a guarded, rehearsed local
operator enrolls the existing known original Spor Manage rollout; unknown origin or
nonmatching content is never assumed automatically owned. No business row is edited
by enrollment, and no content/board snapshots or credentials are logged.

Before reconciliation compare complete linked day/plan/phase/exercise fingerprints.
Any manual edit protects the entire event; manual deletion becomes a persistent
tombstone, preventing resurrection. Explicit preview exclusions remain protected.
Completed/past/attendance-bearing or multiply linked sessions are also protected.
Manual standalone events are never adopted. Unchanged managed rows retain IDs;
semantic phase changes only rebuild untouched generated phases. Obsolete untouched
generated events may be retired; original exercise records are retained. Each
checkpoint records new IDs/fingerprints after automatic updates; audits append.

Check all proposed rows, fixed/manual rows and authoritative matches for overlaps
before writing. Out-of-season dates, unsupported template weeks or
conflicts reject the entire match update with409/400 and a readable explanation.
Never silently discard manual changes. Date update, all affected program changes
and checkpoints commit or roll back together under Serializable retries and the
shared season planning lock. Same-date/analysis-only saves do not reschedule.
Current actor and match/team scope are rechecked inside the transaction.

The subsequent explicit two-match request accepted
[ADR-0043](ADR-0043-two-match-microcycles.md), superseding the original two-match
restriction with elapsed-hour senior microcycles. Other safeguards remain.

Expose an existing-design match-date dialog and a saved result summary including
updated/created/retired/protected counts. Match analysis/board drafts and PLAYER
read-only behavior remain. Retained activation follows fresh private backup,
restored rehearsal, rollback/concurrency/manual-edit tests and exact preservation.
Production excluded. No real fixture date is changed merely to demonstrate the UI.

## Verified local result

Backend896 / PostgreSQL HTTP13 / frontend495, final affected27/12, operator1 and
Sites4 pass. Backup/restore and exact preservation across44 tables precede retained
enrollment of41 weeks (631 owned/2 protected events); replay writes nothing.
Actual restored UI time-change and desktop/tablet/mobile form checks pass.
[Evidence](../30-quality/FIXTURE_PROGRAM_SYNC_2026-10-19.md).
