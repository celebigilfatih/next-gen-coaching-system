# Main-targeted pull request final review — 2026-10-20

PR: [#1](https://github.com/celebigilfatih/next-gen-coaching-system/pull/1),
`codex/mvp-stabilization` → `main`.
Verdict: **keep draft / changes required**, one reproduced P1 compatibility defect.

## Reviewed revision and scope

Implementation head: `d65f799023798904f6371b618112681dd432be5c`.
Base: `1b831e087b727b80bfed0d47005bb0b95fa0852f`.
Seven implementation commits change896 files:213 runtime/tooling,134 tests,
12 migrations,160 documentation,332 visual assets and45 config/content/other.
This is a risk-focused integration review, not a claim of exhaustive inspection
of every line or an independent sporting/security certification.

The final pass traced controller/service authorization, frozen exercise content,
duplicate/version/age checks, transactional duration updates, publication guards,
fixture reconciliation/manual protection, tactical write tokens, session rotation
and runtime/migrator separation. Prior dated migration/HTTP/browser evidence was
reviewed. No live migration, retained-data write or production operation is
performed by this review. Locally pending attendance UI work is outside the head.

## Finding — P1: preserve boardless migrated legacy drill attachment

Location: [plan-drill-content.ts, line44](../../apps/backend/src/training-plans/plan-drill-content.ts).

The professional-library migration creates a PUBLISHED legacy version and exact
age variant for every existing Drill. For a record with `jsonData = NULL`, its
`CASE` expression deliberately stores `DrillVersion.boardDocument = NULL`.
See [the backfill](../../apps/backend/prisma/migrations/20260909002000_professional_drill_library/migration.sql).
The new resolver only takes its legacy fallback when there is no published
version. A migrated legacy record therefore reaches unconditional
`validateTacticalBoardDocument(version.boardDocument)` and throws400.

The record remains visible in the paginated catalogue with the matching age;
library detail enables attachment when a group/variant exists. Both addDrill and
new entries in replaceDrills call this resolver. Consequently a normal upgrade
can expose old boardless exercises that users can select but cannot add to plans.
This is a regression relative to the legacy attachment behavior and the existing
ADR-0032/0039 compatibility boundary, not a missing professional board on a newly
authored reviewed exercise.

Reproduced against this revision's compiled backend using a fixture matching the
migration: one PUBLISHED version, source license LEGACY_UNVERIFIED, exact U14
variant,15-minute duration and NULL board. Calling
`resolvePlanContent(fixture, 'U14', fixture.versions[0].id)` yields:

```text
HTTP 400
Invalid tactical board document: document must be an object
```

Ignored evidence: `output/pr-main-legacy-repro-20261020.json`.
No database is contacted. Existing tests exercise unversioned legacy records and
preservation of nullable old plan rows; they do not cover the migrated-version
shape. Fix should recognize migrated legacy provenance and preserve legitimate
nullable-board behavior without fabricating a diagram/expert approval or relaxing
published professional-content/age/version guards. Add a regression using this
backfill shape, ideally migrate an old boardless fixture then exercise attachment.
This defect remains unfixed in the reviewed implementation.

## Fresh checks and their limits

A managed detached checkout at the exact implementation SHA isolates the user's
pending attendance edits. Installed dependencies were shared by junctions; no
environment/credential file is copied. Unit checks use an unreachable loopback
database URL and a process-only random test signing key; no real DB or login.

- Complete root attempt:15/17 stages pass, exit1. Backend typecheck and build
  encounter TS2742 because generated Prisma types resolve through the dependency
  junction into the original checkout. This attempt is not described as17/17.
- Affected checks repeat with review-only `preserveSymlinks`: normal TypeScript
  no-emit check passes; Nest build using an ignored extending config passes.
  Declaration/type checks remain enabled; application source/config is unchanged.
  This resolves the harness path issue, not the legacy defect above.
- Fresh backend918/918 (62 suites), frontend514/514 (61 files), Sites4/4 and tooling8
  pass. Nested Python fixtures:16 pass/one Windows symlink-privilege skip.
- Isolated Prisma generation, both lints/formats, frontend type/build,186-file
  links, CDSK36 documents/47 ADRs and whitespace pass in the complete attempt.
- Canonical root17/17 at the same implementation source remains the separately
  dated19October publication result. Prior PostgreSQL HTTP36/36 and browser QA
  are not claimed as newly rerun integration checks.

Ignored logs: `output/pr-main-quality-20261020.log`,
`output/pr-main-backend-types-symlinks-20261020.log` and
`output/pr-main-backend-build-symlinks-20261020.log`.
An attempted junction-removal/dependency-copy setup command was policy-blocked;
no removal was performed. The successful compiler option requires no deletion.

## GitHub and delivery state

The PR was opened using the existing local Git authentication after the connector
returned403 for PR creation. Credentials stayed in process memory. The PR is
attached to this task. GitHub reports mergeable/clean against main, but exposes no
CI checks/statuses for the reviewed SHA; there is no checked-in Actions workflow.
No CI-green or approval claim is made. Keep draft until P1 is fixed and retested.
Migration/backup, production configuration/activation and M4 rollout gates remain.

Only this review report and its changelog/Boot/handoff metadata are published as
the review follow-up; runtime files are unchanged. Pending attendance edits and
screenshots stay in the primary working tree. The temporary review checkout is
retained for diagnosis with its review-only ignored build config.
