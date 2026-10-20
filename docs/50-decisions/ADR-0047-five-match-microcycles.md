# ADR-0047: Five-match senior microcycles

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** Explicit request for five-match A Takım weeks with interval-aware
  training/meetings/recovery and preserved manual decisions.
- **Related:** ADR-0042, ADR-0043, ADR-0045, CR-034, REQ-033, BL-068

## Decision

BALANCED_WEEK_V6 accepts up to five SENIOR fixtures per calendar week in existing
preview/apply and enrolled match-date updates. Supersede only ADR-0045's ceiling;
reuse its nearest previous/next actual kickoff-hour rules and editable example
presets, including neighboring weeks. Matchday, recovery and combined briefing
priorities remain. No additional physical session is forced into a compressed gap.
Longer intervals and recovery after the final match keep existing behavior.

Keep full-event fingerprints, manual content/time pins, preview exclusions,
deletion tombstones, history/completion/attendance safeguards and every role/team
check. Never replace a protected coach decision to fit five fixtures. Conflicts
or late faults roll back the date/program/checkpoint write together. Exact and
concurrent retries remain safe. V6 invalidates unapplied older previews; applied
requests/checkpoints stay valid without re-enrollment or re-baselining.

Six-or-more fixtures, same-day fixtures and sub24-hour intervals remain manual
template contexts. These are scope boundaries, not medical thresholds. Presets
remain original editable CLUB examples, not measured loads, medical guidance or
expert-approved global publication. Zero through four fixtures and academy
age/school profiles remain compatible. No migration, new API/service/scheduler,
create/delete trigger, invented retained fixture or production rollout.

## Verification

All21 five-match weekday combinations, asymmetric kickoff hours, adjacent weeks
and valid phase sums; PostgreSQL five-match apply, time pins, phase/agenda/deletion
preservation, cross-Monday changes, concurrency, conflict and late-fault rollback.
Fresh restored actual UI proof must preserve edited plans/academy and retained
fixture dates. [Evidence](../30-quality/FIVE_MATCH_PROGRAM_2026-10-19.md).
