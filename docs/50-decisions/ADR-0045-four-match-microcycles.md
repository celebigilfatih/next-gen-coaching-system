# ADR-0045: Four-match senior microcycles

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** Explicit user request to support four-match A Takım weeks,
  adapt training/meetings/recovery to kickoff intervals and preserve manual edits.
- **Related:** ADR-0042, ADR-0043, ADR-0044, CR-033, REQ-032, BL-067

## Decision

The subsequent explicit five-match request accepted
[ADR-0047](ADR-0047-five-match-microcycles.md), superseding this release's ceiling.
Five SENIOR fixtures now work; six-or-more remain manual. Other safeguards remain.

BALANCED_WEEK_V5 raises the SENIOR calendar-week ceiling from three to four in
existing preview/apply and enrolled match-date reconciliation. It supersedes only
ADR-0044's ceiling, reusing the existing pairwise actual-hour presets. Every day
uses the nearest previous and next fixture, including adjacent weeks. Matchday
activation/briefing, compressed recovery and combined reflection/preparation
retain their current priorities; MD+1/MD−1 never creates competing physical
sessions. Longer gaps and recovery after the final match keep existing behavior.

No new clinical prescription or load measurement is introduced. Sessions remain
editable example CLUB content; coaches decide individual participation. Normal
zero/one/two/three-match output and academy age/school profiles remain.

Keep all existing permission, complete-fingerprint/manual/time/exclusion/deletion,
history/completion/attendance and overlap protections. A protected event is never
overwritten to make four fixtures fit; any conflict rolls back the entire date/
program/checkpoint transaction. Concurrent/same-date retry and durable replay
remain. Old applied checkpoints stay valid without enrollment or re-baselining;
V5 invalidates unapplied old previews.

Five-or-more fixtures per calendar week, same-day fixtures and sub24-hour intervals
remain manual template contexts. These are scope limits, not medical thresholds.
No new model/migration, API, scheduler, create/delete trigger, retained fixture
generation or production rollout. Date-save and fresh-week preview/apply remain
the existing entry points.

## Verification

Cover all35 four-match weekday combinations, asymmetric and24-hour boundary
intervals, adjacent-week preparation/recovery and positive phase sums. PostgreSQL
must verify four-match preview/apply, manual time/content/deletion protection,
cross-Monday changes, concurrent replay, conflict and late-fault rollback. Use
a fresh restored copy for actual UI rescheduling; preserve retained fixture dates.
[Evidence](../30-quality/FOUR_MATCH_PROGRAM_2026-10-19.md).
