# Ready exercise collection — 2026-10-20

Historical data-operation evidence. The subsequent ready-only library now spans
all120 starter IDs by default and exposes an explicit age filter, replacing the
NGCS source switch mentioned in the original handoff below. The plan picker uses
the saved group's server-resolved exact age. This publication does not replay
the pool creation or any retained attachment.
[Current publication review](TRAINING_WORKFLOW_PUBLICATION_2026-10-20.md).

The user clarified that “all” refers to the authored ready-exercise package and
explicitly accepted a separate “A Takım — Hazır Egzersizler” plan that preserves
the existing training. The user then confirmed adding it.

## Saved result

- Plan: `cmvgg1le900012ybgmtexpdi3`, **A Takım — Hazır Egzersizler**, Spor Manage /
  existing A Takım, active COACH Kerem Tunalı.
- Exactly 48 unique published starter exercises with exact SENIOR variants:
  8 warm-up, 16 technical, 16 tactical and 8 cool-down entries.
- Each entry freezes the complete published content, exact-age duration and
  board; all 48 snapshot pairs compare equal to the resolver output.
- The sum is 1,184 minutes across the collection. This is an undated exercise
  pool, not one scheduled session; its saved purpose explains this. No DayPlan
  or calendar event was created and the existing training remains 20 minutes /
  four phases.

## Catalog clarification

The authored `ngcs-starter-v1` package contains **120 unique exercises**, already
imported and PUBLISHED before this request. It was not imported again. Of these,
48 support the exact A Takım age; 24 originate in the senior collection and 24
originate in U18 with an explicitly authored SENIOR variant. The source titles
remain intact; these are not nearest-age substitutions.

The previously shown **1,826** A Takım catalog total consists of **1,778 CLUB
records plus 48 supported ready exercises**. CLUB records include the seasonal
program's generated exercises and the local tactical pilot. That number does
not mean 1,826 authored ready exercises. No existing club record was deleted.

## Method and verification

The guarded, ignored local operator uses the existing compiled
TrainingPlansController create/replace methods and AuthorizationService with the
actual active System Admin principal. It checks the active same-club COACH,
exact existing team, all 120 published identities and all 48 resolved snapshots
before writing. The new plan is created once; all 48 attachments are committed
through the normal Serializable replacement service. No database INSERT/UPDATE
SQL, fabricated login token, publication exception or new application path is used.
The optional-date backend contract permits this undated pool; the scheduled-plan
UI form was closed without submitting a date.

Before/after counts and content fingerprints across **41 business tables**
match exactly after excluding only the newly created TrainingPlan and its 48
PlanDrill rows. Authentication session/audit tables and Prisma migration metadata
are outside that business comparison. Source exercises, published versions,
old plans/phases, calendars, fixtures and attendance are preserved. Totals:
2,061 to 2,062 plans, 8,245 to 8,293 phases; all 3,630 DayPlan and 8,362 Drill
records are unchanged.

Repeated apply recognizes the saved plan and writes **zero** new plans or
attachments. A subsequent read-only verification passes again. Ignored evidence:
`output/ready-pool-20261020/{operator.cjs,baseline.json,result-first.json,result.json}`.
The baseline stores fingerprints, not raw user/credential records.

Actual authenticated UI3132 opens the saved plan, reports 48 phases / 1,184 minutes,
shows frozen application instructions and A Takım coaching rules, and opens the
saved pitch with seven elements. Full reload retains the plan and session.

- [Saved plan and application](../../apps/frontend/qa/ready-pool-2026-10-20/plan.png)
- [Saved pitch](../../apps/frontend/qa/ready-pool-2026-10-20/pitch.png)

No runtime source, schema, migration, flags, dependencies, roles or new ADR changed.
No application test suite was rerun for this data-only operation; controller
execution, all-snapshot comparison, replay, business fingerprints, actual UI and
document checks provide this request's verification. Existing publication and
independent-review boundaries remain as recorded in ADR-0039/0041.

Handoff: open this exact plan for the A Takım collection; the complete 120-item
package remains available through the library with the NGCS source filter and
each supported team's age. Do not recreate/import the package or repeat writes
to the previous scheduled training.
