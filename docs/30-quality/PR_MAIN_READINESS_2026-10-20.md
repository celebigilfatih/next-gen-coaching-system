# PR #1 readiness re-review — 2026-10-20

PR: [#1](https://github.com/celebigilfatih/next-gen-coaching-system/pull/1),
`codex/mvp-stabilization` → `main`.

**Verdict: keep draft / changes required. One verified Important (P2) blocker.**
The previous P1 attachment failure is fixed; a newly enabled boardless attachment
can subsequently acquire a different source board without a plan write.

## Revisions and review scope

- Current implementation head: `069f45928c4fb4c6d6e399f137fe871d8ee9d1f9`.
- Main/base: `1b831e087b727b80bfed0d47005bb0b95fa0852f`.
- Previous reviewed implementation: `d65f799023798904f6371b618112681dd432be5c`.
- At review start:12 commits,953 changed files. A separate read-only AI reviewer inspected
  the incremental implementation since d65f799 and surrounding services/contracts.
  The coordinator traced the finding and reproduced the GLOBAL publish path
  against actual PostgreSQL and the current quality-built services.

This continues the [previous risk-focused review](PR_MAIN_FINAL_REVIEW_2026-10-20.md);
it is not an exhaustive953-file audit or independent sporting/security approval.
Ready-only collection/team-age boundaries, explicit picker/preview, attendance,
pitch/history and shared-art/export changes had no additional proven Important
or Critical finding in the inspected paths.

## [P2] Freeze the absence of a board for new versioned attachments

Location: [plan-drill-content.ts:47](../../apps/backend/src/training-plans/plan-drill-content.ts#L47),
particularly the nullable result at lines87–89. The newly permitted
LEGACY/LEGACY_UNVERIFIED NULL-board version produces a content snapshot tied to
version1 but a SQL-null board snapshot. Both readers still treat null as a
fallback to mutable Drill.jsonData:

- [TrainingEditorService](../../apps/backend/src/training-plans/training-editor.service.ts#L111)
  uses SQL COALESCE without checking the frozen content snapshot.
- [TacticalDocumentService](../../apps/backend/src/tactics/tactical-document.service.ts#L277)
  uses boardSnapshot ?? drill.jsonData and selects no content snapshot.

Trigger: attach a migrated boardless published legacy version, then edit the
CLUB source board or publish an approved subsequent GLOBAL version with a board.
Reopen the untouched saved phase. Its instructions/version remain frozen to v1,
but the phase now shows the later source diagram. Publication writes that diagram
into Drill.jsonData through
[DrillContentService](../../apps/backend/src/drills/drill-content.service.ts#L256).

This silently changes a saved plan and violates accepted ADR-0012/0039 snapshot
independence. Old pre-snapshot rows intentionally keep legacy fallback; newly
created versioned content snapshots must preserve an originally absent board
until an explicit plan-board edit. Preserve that distinction in both readers
and associated preservation paths, without inventing an empty source diagram.
Add source-edit/publication regressions for add/replacement and both read APIs.

## Reproduction and verification

The separate AI reviewer reproduced the CLUB path in memory using actual attachment,
source-update and tactical-read methods with real authorization logic and mocked
storage. The coordinator independently reproduced the GLOBAL path in the exact
dedicated loopback `ngcs_ready_drills_test` database:

1. Use the migration-shaped boardless GLOBAL v1/phase from the HTTP fixture.
2. Read it with the current compiled TrainingEditorService: absent/null.
3. Create a synthetic APPROVED v2 fixture with a distinct reviewer account and
   a valid board, then invoke actual DrillContentService.publish.
4. Read the same phase again; compare the complete stored PlanDrill row.

```text
before: status=absent, origin=null, document=null
after:  status=ready, origin=drill, document=<v2 board>
PlanDrill unchanged; contentSnapshot still v1; boardSnapshot still SQL NULL
```

No retained database, real expert approval or source-code modification is involved.
Test approvals are synthetic. Ignored reproducer/result/log:
`output/pr-readiness-20261020/repro-frozen-absence.cjs`,
`frozen-absence-result.json`, `repro-frozen-absence-final.log`.

Fresh full root verification: **17/17 pass, exit0** at069f459, without a temporary
compiler override or dependency-junction checkout. Backend937/62 suites,
frontend556/63 files, Sites4/tooling8, types/lints/formats, both builds,202-file
links, CDSK36 required documents/47 ADRs and whitespace pass. Review-document
additions are followed by a final203-file link/profile/whitespace check; runtime
source remains identical to the tested head. Ignored log:
`output/pr-readiness-20261020/quality.log`.
Dedicated PostgreSQL HTTP suite: **11/11 pass**. It confirms the original P1 is
closed: add/replacement accepts only the narrow migrated provenance, while
professional/malformed boards and age/version/tenant violations still reject.
Existing snapshot-edit/rollback cases pass but do not cover frozen board absence
after a later source publication; the separate reproducer exposes that gap.

## GitHub state and handoff

At the inspected head, GitHub reports draft/open/mergeable. There are no review
submissions, open review threads, check runs, commit statuses or PR workflow runs.
Main reports protected=false and repository rulesets are empty. Main is an
ancestor locally and merge-tree completes without conflict. These are not CI-green
or external approval claims and do not override the verified application defect.

Keep PR draft and replace its stale P1-only description with this current P2
finding and verification. No ready-for-review, merge, auto-merge, migration or
production action is authorized by a failed conditional readiness check.
This review publishes documentation only. Resolve/retest the frozen-absence
behavior before reconsidering readiness; preserve previous migration/rollout,
independent sporting-review and production configuration gates.

Declined to re-run in this review: complete historical migration rehearsals,
physical-device/browser acceptance and production/pilot rollout. No migration
changed since the previous reviewed head; dated evidence remains historical.
