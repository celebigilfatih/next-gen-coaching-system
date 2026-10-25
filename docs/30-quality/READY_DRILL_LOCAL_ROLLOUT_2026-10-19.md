# Ready drill local rollout — 2026-10-19

Subsequent publication: the user explicitly accepted ADR-0041's narrowly scoped
local same-account exception. All 120 are now PUBLISHED; the import-stage pending
publication statements below are historical. See the
[publication evidence](READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md) for current
state, tests, backup/preservation and truthful exception audits.

## Authorization and result

The user explicitly approved applying the local migration, importing all 120
exercises and publication. The retained Windows database now contains the
approved nullable content snapshot column and all 120 starter exercises as DRAFT.
Publication permission is recorded. The user subsequently named Fatih Çelebigil
and approved all 120 in response to the reviewer question. The importer assigned
the same user's existing SystemAdmin as createdById, so ADR-0034/API self-review
protection and ADR-0039's independent-account check prevent publication.
No separate reviewer identity or publication was fabricated. A narrowly scoped
[ADR-0041 exception](../50-decisions/ADR-0041-local-starter-review-exception.md)
is Proposed and awaits explicit acceptance; no exception is active. No production
operation, commit or push occurred.

Target: `ngcs-postgres`, PostgreSQL 16, loopback
`127.0.0.1:5433/ngcs_local_session_dev`; API 4000 / UI 3132.

## Backup, migration and preservation

- Private custom-format backup:
  `%LOCALAPPDATA%/NGCS/backups/before-ready-drills-20261019-1900.dump`
  (142,573 bytes), outside Git. Restored successfully into the newly created
  disposable `ngcs_ready_drills_restore_20261019` database.
- Before and after rollout, full-row aggregate hashes/counts match the restored
  backup across 38 business tables, excluding session/audit/migration history
  and newly imported content. Existing Drill rows exclude only the stable starter
  IDs; PlanDrill comparison excludes only the new nullable column.
- Deployed only `20261019010000_add_plan_drill_content_snapshot`, using an ignored
  staging copy of the 12 applied migrations plus this exact migration. The separate
  `20261019020000_add_week_planning_audit` was excluded and remains unapplied.
- Retained total: 13 successful migrations. Second deploy reports no pending
  migrations in the approved set. Read-only database-to-restored-database schema
  diff is exactly `PlanDrill.contentSnapshot JSONB`; nullable is YES.
- Existing two-scene V2 synthetic CLUB pilot remains byte-identical. One existing
  drill becomes 121 total; existing plans/phases remain 0. Legacy populated-row
  compatibility was previously verified on the separate legacy test database.
- Existing Prisma client already contains contentSnapshot; the running compiled
  API already contains the approved planning/publication routes and started after
  their build. No restart or locked-engine replacement was needed. The enabled
  tactical flag and ignored backend environment file were preserved.

## Import and checks

- Existing guarded importer, existing active SYSTEM_ADMIN actor and process-only
  import opt-in: first run **120 created / 0 skipped**; replay **0 created /
  120 skipped**. Manifest schema, rights basis, checksums and boards validate.
- Exactly 120 stable starter IDs, 120 distinct source checksums and 120
  `DRILL_CONTENT_DRAFT_CREATED` audit events. All imported source/instruction/
  board/age fields match the validated manifest.
- All 120 versions are DRAFT; reviewedBy and publishedAt counts are 0.
  There are 312 exact-age adaptations: U12 48, U14 72, U16 72, U18 72,
  SENIOR 48. Primary exercises remain 24 per age.
- The only active local login is SYSTEM_ADMIN and has no linked sporting person;
  no independent reviewer account exists. Synthetic staff assignments do not
  constitute review or create accounts/grants. No account or permission changed.
- API root and UI library route return HTTP 200. `/health` is not a defined
  endpoint and returns 404. No authenticated retained browser session was
  available in this chat, so this operation does not claim a new browser login
  or visual end-to-end acceptance. The prior dedicated authenticated QA remains
  [separate evidence](READY_DRILL_PLANNING_2026-10-19.md).
- Documentation checks and Git whitespace verification pass. No runtime code
  changed in this operation; the earlier full test results and Windows aggregate
  quality limitations remain recorded in the implementation report.

## Remaining publication prerequisite

The 120 drafts are in content management and excluded from the published planning
catalog. Fatih Çelebigil's named human approval is recorded here, but the existing
runtime cannot accept his imported records as independently reviewed by his own
account. Either use another real independent reviewer through the normal workflow
or explicitly accept the Proposed local exception before implementing/testing
its maintenance operation. No same-account exception, invented second identity,
partial release or direct status update was executed under the existing approval.

The restore-test database and container-side temporary dump were removed after
verification; the private Windows backup is retained. Recovery should preserve
later edits and prefer a forward fix; do not restore the whole retained database
over subsequent business data.
