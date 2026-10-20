# ADR-0040: Haftalık kulüp programı ve etkinlik yönetimi

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** User explicitly requested implementation of the complete weekly
  program plan, including this additive audit migration, isolated verification
  and subsequent retained local program application.
- **Related:** ADR-0007, ADR-0026, ADR-0037, ADR-0039; CR-029, REQ-028, BL-063

## Decision

Preserve existing team/season selection. Unify authoritative TrainingPlan,
Match and nonlinked DayPlan reads with scoped chronological pagination. Linked
DayPlan projections never duplicate training cards. Meeting/rest duration is
excluded from training totals; private GORUSME entries are excluded.

Preview balanced age-specific weekly templates without business writes; allow
row exclusion/time edits. Apply selected teams in one Serializable transaction,
rechecking current actor and every season's management permission. Preserve
existing matches/events, reject overlap and stale preview. Zero/one-match weeks
were supported initially; [ADR-0043](ADR-0043-two-match-microcycles.md) subsequently
extends SENIOR to two matches with interval-aware recovery. The calendar stays
Monday–Sunday while WeekPlan numbering remains season-start-relative.

Each physical session has four actual plan phases and team-scoped original
CLUB exercises with instructional PlanDrill notes. They are visibly examples,
not global publication or fabricated expert approval. No accounts, players,
clinical information or measured performance is created.

One additive enum value WEEK_PLANNING_APPLIED anchors actor-bound request hash
and minimal results in SecurityAuditEvent. Per-team/season/week markers prevent
reapplication with a new request. Advisory locks and Serializable retries protect
simultaneous writes; exact replay returns unchanged results. Preserve markers
under future audit retention. No new planning table or external service.

## Approved initial program

Spor Manage, all ten teams, 19–25 October 2026. A Takım uses the existing sample
Beşiktaş fixture and prior-match recovery. U8–U16 use age-specific after-school
profiles, Saturday development games, short meetings and rest. No youth fixture
is fabricated. Physical duration derives from the four phases.

## Rollout and rollback

### Approved season extension — 2026-10-19

The user subsequently requested the same structure throughout 2026-2027, with
fixture-relative senior planning and age/school-compatible academy weeks. Use
the existing preview/apply service through a guarded local operator; no new
API, model, migration, scheduler or external service. Monday calendar weeks
are clipped to inclusive season dates before overrides; overrides moved outside
the season still conflict. Fixture-free senior weeks use development sessions,
Saturday reflection and Sunday rest, without invented opponent preparation.
Upcoming adjacent-week fixtures still affect preparation.

Preflight all unapplied team/week slots before writing; preserve already applied
weeks and all existing rows. Each week is an atomic all-selected-team transaction,
not one season-wide transaction. Stable request IDs and existing slot markers
allow safe continuation after interruption. Never delete/rebuild a populated week.
An overlapping manual record or congested fixture week blocks preflight for
review. At this rollout, later fixture changes required coach review. The subsequent
explicit request accepted [ADR-0042](ADR-0042-fixture-aware-program-updates.md), which
supersedes that limitation for enrolled SENIOR programs with synchronous guarded
reconciliation. Original example/permission/publication boundaries
remain. [Season evidence](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

Validate strict inputs, permission isolation, replay/concurrency, failure
rollback, chronological totals and three viewports on dedicated PostgreSQL.
Inspect exact pending migrations including ADR-0039's contentSnapshot dependency;
rehearse private backup/restore before the approved local rollout. Never reset
retained data or apply unrelated migrations. Production excluded. Application
rollback keeps new data/audit records; no destructive enum/data rollback.

## Completed verification

The exact audit migration and approved initial week were applied locally after
backup/restore rehearsal. Retained14-migration status/current schema diff pass;
51 physical plans/204 phases,13 meetings,26 rest entries across10 teams exist.
Existing36 matches and account/staff rows are preserved. Full890 backend/478
frontend/4 Sites, final focused21/14 and dedicated HTTP7 pass. Actual browser and
three viewport checks pass; root Windows/CDSK tool limits remain BL-061.
[Detailed evidence](../30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).
