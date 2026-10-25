# ADR-0043: Two-match senior microcycles

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** Explicit user request to support two-match A Takım weeks, adapt
  training/recovery to match intervals and preserve manual edits.
- **Related:** ADR-0040, ADR-0042, CR-031, REQ-030, BL-065

## Decision

Subsequent explicit request accepted [ADR-0044](ADR-0044-three-match-microcycles.md),
extending the ceiling to three SENIOR fixtures. The original verified two-match
release and elapsed-hour presets below remain historical context; four-or-more
fixtures now require manual planning. Other boundaries remain.

BALANCED_WEEK_V3 supports up to two SENIOR fixtures per Monday–Sunday week in both
preview/apply and existing synchronous date reconciliation. It supersedes only
ADR-0040/0042's two-match restriction; all ownership, permission, transaction,
conflict, season clipping, replay and academy boundaries remain.

Sort the authoritative fixtures and use actual elapsed kickoff hours between the
nearest previous and next match, including adjacent weeks. Matchday takes priority.
For intervening days use these editable example club presets:

| Kickoff interval | Day after match | Other intervening days | Meeting |
| --- | --- | --- | --- |
| 24–72 hours | Recovery/mobility30 min | Activation20 min | 15 min |
| >72–96 hours | Recovery/mobility35 min | Controlled technical activation35 min; MD−1 activation30 min | 20 min |
| >96–120 hours | Recovery/mobility40 min | Controlled technical activation45 min; MD−1 activation30 min | 20 min |
| >120 hours | Existing recovery and preparation cycle | Existing normal sessions | Existing meetings |

Compressed intervening days have one physical session at10:00, a combined
reflection/next-match plan at11:00 and rest16:00–20:00. MD+1/MD−1 on the same day
uses recovery plus combined briefing, not competing sessions. Notes expose the
actual interval. Four positive phases still sum to each physical duration.
Matchday activation/briefing remain kickoff-relative. Early kickoff times are
clamped to the actual local date; if both sessions cannot fit, refuse automatic
planning rather than wrapping the clock to the wrong day.

The interval thresholds/durations are product example choices, not FIFA-prescribed
loads, medical advice or expert-approved global publication. The general approach
of organising work and briefings around matches follows the
[FIFA microcycle discussion](https://www.fifatrainingcentre.com/en/environment/expert-knowledge/david-aznar-on-planning-the-microcycle.php).
Coaches retain responsibility for individual participation and adjustments.

An explicit preview time override now pins that whole event when first applied.
Subsequent fingerprint changes, exclusions and deletion tombstones remain protected;
the system never silently overrides them to fit a fixture. If a protected event
conflicts with another desired row, the whole date/program transaction rolls back.
Old checkpoints remain valid and are never re-baselined to current edited content.

Three-or-more fixtures in a calendar week, same-day senior fixtures or kickoff
intervals below24 hours remain manual. These are template scope limits, not medical
thresholds. Academy zero/one-match age/school profiles remain. No fixture generation,
create/delete-triggered reconciliation, new API/schema/migration, scheduler or
production deployment is introduced. Existing date-save is the trigger; fresh
programs use preview/apply.

## Verification

See [two-match evidence](../30-quality/TWO_MATCH_PROGRAM_2026-10-19.md). Use isolated
PostgreSQL and a fresh restored copy for actual UI rescheduling; retained fixture
dates do not change to demonstrate this feature. Keep original audit markers.
