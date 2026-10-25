# P0.1b — Legacy/Sporting Compatibility and Workspace Scope

- Status: Implemented; final verification recorded in the P0.1b quality report.
- Date: 2026-09-06
- Authority: ADR-0022/0023, CR-016 and the user's approval to continue BL-042.
- Scope: repository implementation; retained environment and production rollout
  remain separate operations gates.

## Source-of-truth and write rules

The compatibility period retains the current REST contracts. The shared
`sporting/legacy-compatibility.ts` domain adapter receives a Prisma transaction;
legacy writes and their sporting projection commit together. Serializable
transactions retry serialization conflicts at most twice. Projection failures
roll back the legacy write and follow the existing generic error boundary.

| Writer                                   | Projection                                                | Lifecycle                                                                                                                          |
| ---------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `POST /groups`, `POST /clubs/:id/groups` | `Team` with `legacyGroupId` and initial matching id       | Deterministic mapping; no second independent team                                                                                  |
| `PUT /groups/:id`                        | mapped Team name/category/age label                       | Minimum/maximum ages and other sporting facts are preserved                                                                        |
| `POST /groups/:id/members`               | Person/profile if missing; one `LEGACY_MEMBER` Assignment | Role is PLAYER or LEGACY_STAFF, matching the approved backfill; no inferred primary registration                                   |
| membership removal                       | end the matching legacy Assignment                        | Keep actor/source audit and history; re-add creates a new period                                                                   |
| group deletion                           | end legacy memberships, delete old members/group          | Keep Team and sporting history; the existing FK clears `legacyGroupId`; failed legacy deletion rolls everything back               |
| `POST /seasons`                          | ClubSeason + TeamSeason + `Season.teamSeasonId`           | Share only an exact club/name/start/end tuple, then an exact team/club-season tuple                                                |
| season deletion                          | remove the legacy season only                             | Preserve ClubSeason/TeamSeason and sporting history; no detached-context deletion                                                  |
| invitation acceptance                    | optional Person link plus player/staff profile            | Same transaction as account creation and invitation consumption                                                                    |
| account role/club change                 | check sporting identity/assignments before account write  | Linked cross-club identity changes and role changes with unexpired assignments return 409 pending explicit transfer/reconciliation |

Independent sporting assignments (primary, training guest, staff, etc.) are never
silently converted to GroupMember. GroupMember is still the legacy application's
access authority; a sporting promotion does not grant old API permissions. This is
intentional directional ownership, not bidirectional last-write-wins replication.
`LEGACY_MEMBER` create/end via the public sporting API is rejected: only the group
workflow owns those records. The separate primary/guest/staff lifecycle remains
under the existing sporting API.

Existing Person identity and profile values are not overwritten by account
metadata. Existing role grants are not recreated after explicit removal. New
compatibility roles get the same default grants as the accepted P0.1 migration.
The adapter never guesses coach speciality, primary team, readiness or clinical
information.

## Current authority and historical reads

Actor capability validity is evaluated **now**, while target roster membership is
evaluated at the requested `asOf`. Removing a coach's legacy membership therefore
removes its capability even for queries requesting a past date. Other independently
granted staff assignments remain independent. Club-wide capability assignments
resolve all teams in that club for the workspace as well as detail reads.

## Read-only reconciliation

`GET /sporting/legacy-parity?clubId=...` is restricted to SYSTEM_ADMIN or that
club's CLUB_ADMIN. A repeatable-read snapshot returns only counts:

- missing/cross-club Person links;
- missing or divergent Team mappings;
- missing or divergent season mappings;
- missing, mismatched or wrongly classified legacy membership projections;
- orphan open legacy assignments.

`IN_SYNC` means all five discrepancy counts are zero; any discrepancy produces
`DRIFT`. The report does not rewrite data or restore grants. Direct SQL and old
application revisions can still cause drift; before rollout, pause legacy writers,
apply the approved foundation migration/backfill, deploy this adapter, and require
zero discrepancies. An environment with post-backfill drift requires a reviewed
forward repair based on that environment's evidence. Automated historical repair
is not implied by this read-only endpoint.

## Workspace selection

`GET /sporting/workspace` remains the compatibility array API. Since BL-043b,
the live shell uses `/sporting/workspace/selection` and separate paged catalogs.
Selected club/season/team records are resolved independently of the first page;
catalog navigation replaces its page without changing the active selection.
Each team carries at most one season summary; full nested history is not loaded.
See [bounded contracts](API_CONVENTIONS.md).
Since BL-043d, `/sporting/workspace/legacy-context` resolves only the selected
legacy group/season and independently checks legacy membership before enabling
training/match/member reads. `Team.legacyGroupId` is a mapping, not a grant or an
assumption that a Team id equals a Group id. The shell no longer downloads whole
group/season catalogs; its compatibility `groups`/`seasons` values are zero/one
selected records, not complete catalogs. Matches remain complete: exact mode
uses the newest matching legacy season, all-seasons uses one relational query
across the group's seasons. Player 360 dialog options and live roster/history
are now paged. Old array endpoints, business-resource lists, reconciliation
internals and pilot capacity remain separate work; BL-043 is not closed.

The shell exposes Club → Season → Team on desktop, tablet and mobile. Selections
are revalidated against each authenticated workspace response; missing/revoked
IDs resolve only to visible options. `Tüm sezonlar` includes season-less teams.
No season from another team is used as a fallback. Dated team plans are filtered
to the selected season interval (end date inclusive); undated drafts stay visible.
All-seasons mode reads only that team's authorised legacy seasons.

BL-045 presentation labels recognize only validated `scope.clubSeasonId === '*'`
as “Tüm sezonlar”. Sidebar/top bar retain ClubSeason names; week/dashboard/settings
retain their legacy Season name source. An absent exact season remains TBD, not
all seasons; no name fallback conceals a missing legacy mapping. Request filtering
and scope resolution are unchanged.

Only the three scope IDs are stored under a user-specific localStorage key; no
credential or record contents are persisted. A restricted/unavailable localStorage
does not prevent use. Explicit selection uses router navigation, allowing the
existing dirty-editor blocker to cancel the change before it is persisted. Older
network responses cannot overwrite a newer scope. Detail routes return to their
list when scope changes, keeping the selected object's old club/team from being
mistaken for the new workspace.

## Rollout and remaining boundaries

This slice introduces no new schema or migration; it requires the existing sixth
foundation migration. Normal boot does not migrate or reconcile a retained DB.
Stop writers for a retained rollout; verify migration status and parity, then
verify old/new routes and membership revocation. Application rollback retains
sporting tables and history, but old writers no longer maintain projections;
disable sporting reads/writes until forward repair and parity checks complete.

Legacy enums still constrain old Group API categories. Native Team management,
cross-club Person transfer, full registration/eligibility rules and replacement of
legacy API authorization are later domain work. Pagination, practical pilot scale
and performance budgets remain BL-043; sensitive-data production policy remains
BL-044. Dates and named operations owners are TBD.
