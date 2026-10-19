# ADR-0044: Three-match senior microcycles

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** Explicit user request to support three-match A Takım weeks,
  adapt training/meetings/recovery to congestion and preserve manual changes.
- **Related:** ADR-0040, ADR-0042, ADR-0043, CR-032, REQ-031, BL-066

## Decision

Subsequent explicit request accepted [ADR-0045](ADR-0045-four-match-microcycles.md),
raising the ceiling to four SENIOR fixtures. The three-match release below is
historical; five-or-more now require manual planning. Other safeguards remain.

BALANCED_WEEK_V4 accepts up to three authoritative SENIOR fixtures per calendar
week in existing preview/apply and enrolled match-date reconciliation. This
supersedes only ADR-0043's two-match ceiling. Reuse its elapsed-hour presets and
pairwise algorithm rather than adding a separate three-match load prescription.

For each day independently locate the nearest previous and next kickoff, including
adjacent weeks. Every compressed interval uses one physical session, a short
combined reflection/preparation meeting and afternoon rest. On MD+1/MD−1 recovery
and the combined briefing take priority over a second preparation session.
Matchday keeps its short kickoff-relative activation/briefing. After the last
match, the existing recovery branch remains unless a nearby next fixture calls
for compressed recovery. A Monday–Thursday–Sunday cycle therefore adapts both
72-hour gaps, while a Monday–Wednesday–Sunday cycle uses48 and96-hour presets.
Exact kickoff-hour changes can change either neighboring interval's duration.

Normal zero/one/two-match output and academy age/school profiles remain. Examples
are coach-editable CLUB content, not measured loads, clinical advice, invented
fixtures, global publication or expert approvals. ADR-0043's numerical presets
remain product example choices, not normative sport-science thresholds.

Keep all ADR-0042/0043 permissions, complete fingerprints, manual edit/time pins,
preview exclusions, deleted-event tombstones, historical/completed/attendance
protection, overlap checks and Serializable atomicity. Never overwrite a protected
event to make a congested week fit. A conflict rejects the entire date/program
change. Same-date/concurrent retries do not repeat planning. V4 invalidates old
unapplied preview tokens; historical applied requests/checkpoints remain valid.

Four-or-more fixtures per calendar week, same-day fixtures and sub24-hour intervals
remain manual template contexts. These are product scope boundaries, not medical
thresholds. No new model/migration, endpoint, scheduler, enrollment, create/delete
trigger or production rollout. Existing known local41-week enrollment needs no
re-baselining or bulk rewrite. Retained fixture dates are not changed for QA.

## Verification

[Evidence](../30-quality/THREE_MATCH_PROGRAM_2026-10-19.md): asymmetric/adjacent-week
unit cases; PostgreSQL three-match preview/apply, interval changes, protected
content/time/deletion, cross-Monday, concurrency, manual conflict and late-fault
rollback; fresh backup/restored actual UI proof and retained-data preservation.
