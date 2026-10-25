# Frozen plan board — independent verification, 2026-10-25

The user requested that a source exercise change must not change its saved plan
diagram. The same correction was already being implemented in another active
chat in this shared checkout; this task preserved those edits and independently
verified the resulting runtime behavior.

## Correction reviewed

The existing non-null contentSnapshot distinguishes a versioned attachment from
an old pre-snapshot phase. A versioned phase uses boardSnapshot even when its
value is absent; only pre-snapshot rows can fall back to Drill.jsonData. SQL and
JSON null are handled consistently. This follows accepted ADR-0012/0039 and
does not introduce a new schema, migration, dependency or product decision.

Reviewed paths: effectivePlanBoard/projectPlanContent, TrainingEditorService's
parameterized single-board query, TacticalDocumentService's plan read/write
load, and TrainingPlansService's replacement and explicit board-save guards.

## Fresh independent evidence

- Before the correction, the two new tactical tests failed as expected: a source
  edit changed the supposedly frozen document/token, and the explicit first
  plan-board save rejected its previously issued absent token.
- After correction, all136 affected backend tests in five suites pass.
- Dedicated PostgreSQL HTTP: all11 ready-drill scenarios pass, including actual
  publication after boardless add/replacement, both board readers, full plan
  projection and preserved frozen content.
- A separate verifier loads the current TypeScript services and uses only the
  guarded loopback ngcs_ready_drills_test database. It creates its own synthetic
  CLUB fixtures and exercises both SQL-null and JSON-null snapshots:

| Scenario | Result |
| --- | --- |
| Boardless version attached through add and replacement | Remains absent |
| Actual source V1 edit through DrillsService | Frozen phase/token unchanged |
| Actual source V2 edit through TacticalDocumentService | Frozen phase/token unchanged |
| Stored phase compared after source-only changes | Entire row unchanged |
| Old phase without content snapshot, SQL/JSON null | Existing live-source fallback preserved |
| Existing phase replaced with notes after source becomes V2 | Absence and v1 content preserved |
| Explicit legacy plan-board save after source becomes V2 | Saves the requested V1 board |
| Explicit token-bound plan-board save using original absent token | Saves the requested V1 board |
| Later actual source edit after explicit plan saves | Both saved plan boards and versioned token stay unchanged |

The independent verifier and logs are ignored operator evidence under
output/frozen-board-independent-20261025: verify.cjs, result.json, green.log,
unit-final.log and http-final.log. The initial unit failure is recorded separately
in output/frozen-board-unit-red-20261025.log. The file named red.log in the
independent directory is actually a passing run: the shared correction landed
before that verifier started; it is not claimed as pre-fix evidence.

No retained database, real expert review, production rollout or saved user plan
was changed by this independent verification. Publication/PR readiness belongs
to the separately authorized chat and is not asserted by this report.
