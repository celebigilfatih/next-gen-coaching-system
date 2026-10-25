# BL-046 — Training Editor Read Separation Design

- Date: 2026-09-07
- Status: ADR-0025 accepted; BL-046a/b/c implemented and verified.
- Authority: [Accepted ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md), approved CR-017.
- The original design was document-only. Backend read contracts below are now
  implemented with the frontend transitions; matched measurement and final gates passed.
  [BL-046a verification](../30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md).
  [BL-046c closure](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).

## Design-time evidence (before BL-046b cutover)

| Source | Verified observation | Design consequence |
| --- | --- | --- |
| [TrainingPlansService](../../apps/backend/src/training-plans/training-plans.service.ts) `getEditor` | Includes every PlanDrill snapshot and nested full Drill; excludes attendance/group | Separate metadata from selected JSON; retain old response |
| [TrainingPlansController](../../apps/backend/src/training-plans/training-plans.controller.ts) | GET editor checks plan view; board PUT checks plan manage and source view | Add authenticated reads; preserve mutation guards |
| [Training detail](../../apps/frontend/src/routes/training-detail.tsx) | Only runtime consumer of `getTrainingPlan`; uses complete IDs and maximum phase order for POST | Keep all minimal phases; do not derive order from a partial page |
| Same route `hasBoard` | Validates `boardSnapshot ?? drill.jsonData`; first valid phase selected automatically | Non-null invalid snapshot cannot silently fall back; replace eager discovery explicitly |
| Same route `saveBoard` | PUT returns a full PlanDrill; key includes snapshot presence | Adapt response without caching the whole graph; stable editor identity on first save |
| [TacticalBoardEditor](../../apps/frontend/src/components/tactics/tactical-board-editor.tsx) | Local history, 50 undo steps, route blocker and beforeunload; save changes saved baseline | Parent must coordinate local transitions; route blocking alone is insufficient |
| [Prisma schema](../../apps/backend/prisma/schema.prisma) `PlanDrill` | No revision or updatedAt field | Do not present plan.updatedAt as a board version or guarantee conflict detection |
| [Mixed-read baseline](../30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md) | 2/50 phases: 34,394/853,304 bytes, six queries | Payload growth risk P2; not an incident, SLO or canvas benchmark |

## API — implemented in BL-046a

### GET /training-plans/:planId/editor-metadata

JWT/current principal, validated bounded plan ID, then existing assertPlanView
before content queries. Reject unknown query keys; no projection/tenant controls.
Use explicit scalar selects, not include-then-strip. Response allowlist:

```ts
type TrainingEditorMetadata = {
  id: string;
  title: string;
  groupId: string | null;
  date: string | null;
  notes: string | null;
  totalDuration: number;
  drills: Array<{
    id: string; // PlanDrill ID, not source Drill ID
    drillId: string;
    phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
    order: number;
    notes: string | null;
    drill: { id: string; title: string; durationMin: number };
  }>;
};
```

No boardSnapshot, jsonData, member, attendance, user or other nested projection.
No validity/presence badge requiring all-board reads. Keep every phase (including
non-board legacy exercises), with deterministic phase sequence WARM_UP, TECHNICAL,
TACTICAL, COOL_DOWN, then order ASC, ID ASC for ties. Current getEditor has no
explicit orderBy: this defines stable display order without rewriting stored
orders. Repeated drill references remain distinct PlanDrill IDs.

Attached IDs and max(order)+1 per phase remain based on this complete array.
No new total count query is needed; array length is the complete phase count at
that read. Concurrent writes can change the next read; no immutable snapshot or
unique-order concurrency guarantee is implied. A deleted authorized plan yields
404, not a successful null document.

### GET /training-plans/:planId/drills/:planDrillId/board

Validate bounded IDs and reject query keys. Apply JWT/current principal and
assertPlanView, then assertPlanDrillSourceView using both IDs. A phase belonging
to another plan is 404 after plan authorization. Keep existing 401/403/404
authorization behavior; never fetch the full graph before checking authority.
The same source check applies to snapshot and source branches. It can deny a
new read that the old aggregate editor allowed; this intentional tightening is
part of accepted ADR-0025 and implemented in BL-046a; old aggregate reads remain unchanged.

Return an explicit discriminated result, with no raw invalid JSON or validation
error containing user content:

```ts
type TrainingPhaseBoard =
  | {
      planId: string; planDrillId: string; drillId: string;
      origin: 'snapshot' | 'drill'; status: 'ready';
      document: TacticalBoardDocumentV1;
    }
  | {
      planId: string; planDrillId: string; drillId: string;
      origin: 'snapshot' | 'drill' | null;
      status: 'absent' | 'invalid'; document: null;
    };
```

Resolve effective JSON with nullish, not truthy, precedence: SQL NULL and JSON
null snapshot use the source; any other snapshot value wins. Both values null
means absent/origin=null; a non-null legacy/non-board/malformed/oversized value
means invalid with its origin retained. Validate the chosen value server-side
using the existing 250-element/100,000-byte strict validator, then client-side
before editor initialization. Unknown kinds/fields never become editable data.
Invalid/absent is a successful resource read with a visible explanation, not a
404 or an empty saved board. Do not delete, repair or backfill legacy JSON.

Retrieve only the effective JSON in one scoped projection, not both blobs then
strip one from the response. A parameterized Prisma SQL CASE projection can
preserve SQL/JSON null semantics in one statement. Scope the content query to
planId, planDrillId and the source ID checked by authorization; never interpolate
IDs into SQL. If the relation disappeared/changed, return not-found rather than
retry with wider scope. Keep cause-free persistence errors and no JSON/PII logs.
This does not add transaction-level revocation/snapshot consistency beyond the
existing authorization architecture. Measure database work separately from bytes.

### Compatibility and writes

GET /training-plans/:id and GET /training-plans/:id/editor remain unchanged.
No automatic frontend fallback to their heavy payload on 403/404/network error.
Backend-first delivery provides compatibility; frontend rollback is explicit.

POST /training-plans/:id/drills remains additive. A confirmed POST followed by
failed metadata refresh offers only GET retry, never another POST. Keep the
returned PlanDrill ID as the exact selection target, rather than source drill ID.
Serializing local writes does not promise idempotence after an ambiguous POST;
read current state first and require a deliberate user decision before retry.
Duration synchronization and other phases' snapshots remain unchanged.

PUT /training-plans/:planId/drills/:planDrillId/board retains its existing body,
full response, strict validator and plan-manage/source checks. Adapt the returned
snapshot into the active board baseline; discard its unnecessary source JSON
instead of adding it to metadata. No extra full editor GET after saving. A
definite failed save keeps the draft. An ambiguous transport outcome keeps the
draft and requires explicit reconciliation read; never automatically repeat PUT
or overwrite the local draft with that read. Compare server state with the
submitted document, show the outcome and require user choice if different.
Metadata refresh failure after a confirmed save must not mark persistence failed.

No schema/index/migration, source-drill mutation, new role or replacement PUT.
The existing write response still contains both documents and addDrill duration
recomputation still selects all source drills: write-cost optimization is deferred.

## Frontend state and interaction — BL-046b implemented

Use separate metadata and active-board state, keyed by authenticated identity,
workspace scope, planId and selected PlanDrill ID plus request generation. Scope
changes invalidate old reads; late responses cannot initialize a new selection.
No session-independent cache, localStorage draft or automatic background save.

Initial flow/attendance load requests metadata only. The snapshot tab lists every
phase with a labeled selector and an explicit **Tahtayı aç** action. Selecting a
flow card alone does not fetch JSON. Opening one phase issues one board request;
do not probe other phases if it is invalid. The selected invalid/absent phase
stays visible with explanation and another phase can be chosen. Read errors have
their own retry; metadata failure is not an empty plan. PLAYER is read-only and
has no save/add affordance; server roles remain authoritative.

| Transition | Required behavior |
| --- | --- |
| Open another phase while clean | Discard old board state, load only requested phase; cancel/ignore late response |
| Phase/tab/route/workspace transition while dirty | Save/discard/cancel dialog before unmount or context commit; cancel keeps draft/history/selection |
| Save then transition | Await confirmed save; failure keeps current draft and destination pending |
| In-flight save | Disable conflicting local phase/tab/add/save actions; do not clear history on metadata refresh |
| First successful snapshot save | Keep stable editor key based on resource identity, advance saved baseline, retain undo/redo |
| Tab exit and return after resolution | May refetch selected board; never silently preserve unresolved drafts in a hidden cache |
| Logout/revocation | Clear protected state, discard late responses; no bypass of revocation to preserve a draft |
| Browser close/reload while dirty | Existing native beforeunload warning; no persistence guarantee after forced close |

Extend the shared editor with a small optional parent transition interface for
dirty/saving state and explicit save completion, preserving other consumers'
defaults. Use one coordinator rather than competing router/local dialogs. Parent
controls tab/phase transitions before unmount. Test workspace changes that retain
the same plan URL; do not rely solely on route key changes. This is an internal
component change requiring regression coverage for tactics and match editors too.

## Delivery and acceptance gates

1. **BL-046a — backend foundation (verified):** additive DTOs/projections/read handlers and
   focused unit + disposable PostgreSQL E2E. Existing editor/PUT/POST tests remain.
   Verify unauthorized requests do not reach content queries; no N+1 phase checks.
2. **BL-046b — frontend cutover (verified):** separate API types and keyed reads, explicit
   board-open UX, transition coordination and stable history identity. Preserve
   independent attendance, picker paging, snapshot isolation and retry semantics.
3. **BL-046c — measured verification (verified):** compare old/new reads in the same process
   at 2/50 phases; valid shared-source boards, distinct snapshots, null and invalid
   legacy variants. Root quality, API/browser E2E, three viewports and updated
   CDSK/handoff. Close BL-046 only when these gates pass, not on ADR acceptance.

| Area | Required evidence / missing coverage |
| --- | --- |
| Authorization | All four roles; other club, same-club other group, mismatched plan/phase, revoked membership, inaccessible source with snapshot; PLAYER write denial |
| Projection | Metadata SQL never selects either JSON; one selected effective document only; old endpoints remain compatible |
| Validation | Snapshot priority, SQL/JSON null, false/invalid non-null snapshot, malformed kind/unknown fields, 250/251 elements, 100,000-byte boundary |
| Snapshot isolation | Change source after snapshot save; selected read returns snapshot unchanged; add phase preserves other IDs/boards |
| Frontend | No board GET on initial flow/attendance, exactly one on open, distinct empty/invalid/error/retry, stale response rejection across scope/plan/phase |
| Draft/history | Dirty phase/tab/workspace/route save-discard-cancel; failed/ambiguous save; first save and undo/redo; 50-step bound; no autosave |
| Writes | POST once + failed metadata GET + read-only retry; exact returned phase selection; max order from all metadata; no replacement PUT |
| Browser | Coach library→plan snapshot→source edit→reopen→match board, negative tenant case, keyboard focus/dialogs at 1440/1024/390 px |

The original [route tests](../../apps/frontend/src/routes/training-detail.test.tsx)
mock the board editor and retain additive POST/read-retry assertions. New
[parent/editor tests](../../apps/frontend/src/routes/training-board.test.tsx)
exercise real history and dialogs with only canvas rendering mocked, including
phase/tab/route/workspace cancellation, stale reads, failed saves and reconciliation.
[Editor tests](../../apps/frontend/src/components/tactics/tactical-board-editor.test.tsx)
also verify the 50-step bound. Updated
[browser flows](../../apps/frontend/tests/e2e/coach-flow.spec.ts) assert metadata,
explicit single-board opening, first-save undo/redo and preserved snapshot content.
See [BL-046b evidence](../30-quality/BL046_EDITOR_FRONTEND_CUTOVER_2026-09-07.md).

Measure JSON body bytes, content/query-event counts and latency independently.
Retain the BL-043i opaque fixture as legacy evidence; add valid board fixtures
before making selected-document size comparisons. Keep the old editor-growth
assertion tied to the old endpoint and add new-endpoint regression assertions;
never enforce heavy growth on the new contract. Check that changing unselected
board sizes does not change metadata or selected-response bodies. The combined
metadata + one board should be smaller than the old graph for the matched
50-phase valid fixture. Report actual reduction; no percentage or SLO is claimed
before measurement. No unselected board fan-out/N+1 is acceptable. Metadata bytes
may still grow with scalar rows/notes. Production budgets and pilot owner TBD.

Only explicitly disposable databases may be provisioned for later E2E; retained
ngcs_local_session_dev must not be reset, seeded or migrated. The original design
turn ran only documentation checks; BL-046a results are recorded separately above.
No production rollout, commit or push is authorized here.
