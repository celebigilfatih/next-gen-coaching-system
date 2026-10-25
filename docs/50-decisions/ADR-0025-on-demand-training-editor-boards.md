# ADR-0025: On-demand training editor board reads

- **Status:** Accepted
- **Date:** 2026-09-07
- **Owners / approvers:** User directed the next implementation step on 2026-09-07 in response to the Option A approval request; named engineering/performance owner TBD
- **Supersedes / superseded by:** N/A — existing contracts remain available
- **Related:** ADR-0007, ADR-0012, ADR-0014, BL-046, CR-017, REQ-004/009/010

## Context

The current editor returns all linked source JSON and snapshots. BL-043i observed
34,394/853,304 response bytes for 2/50 synthetic phases with six SQL queries.
These are opaque legacy JSON fixtures, not valid-board rendering measurements
or evidence of production failure. See the
[baseline](../30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).

The frontend needs all phase IDs/orders for additive attachment, but only one
effective board for editing. Its existing route blocker does not itself guard
local phase selection or tab unmount; the first snapshot save also changes the
editor React key. A read cutover must explicitly protect draft/history identity.

## Decision Drivers

Reduce repeated JSON transfer without deleting data, preserve snapshot precedence
and existing mutations, keep tenant checks server-side, and make failures and
unsaved transitions visible. No new vendor, dependency or database model is needed.

## Considered Options

| Option | Benefit | Trade-off |
| --- | --- | --- |
| A — complete lightweight phase metadata + one requested effective board | Removes repeated board JSON; keeps attached-ID and next-order calculations complete | Metadata still grows with phases; explicit phase choice replaces automatic valid-board discovery |
| B — paginate phases as well | Bounds each metadata page | Needs a separate full attachment/order contract; greater API and write coordination scope |
| C — impose a phase cap or truncate payloads | Simple size ceiling | Rejects or hides existing content; unsupported product limit, not recommended |

## Decision — Option A

- Add two read endpoints as specified in the
  [implementation design](../10-architecture/BL046_EDITOR_READ_DESIGN.md).
  Preserve existing full detail/editor and all write contracts for compatibility.
- Fetch all phase metadata without board JSON. Fetch a board only after the user
  requests the selected phase; do not probe every phase to find a valid board.
  Every phase stays selectable. Metadata does not certify board validity.
- Return exactly one validated effective document: non-null snapshot takes
  precedence over source, even when invalid. Invalid data produces a clear
  unavailable state, never fallback to a different board or an empty saved board.
- Both new reads require current plan-view authorization. The single-board read
  additionally uses the existing plan-drill source-view check before payload
  retrieval, including snapshot reads. This is an explicit stricter check than
  the current nested editor read: an inaccessible source denies this new read
  even if a snapshot exists. No new read or write role is granted.
- Keep one active draft/history in memory; guard phase, tab, workspace and route
  transitions with save/discard/cancel. No autosave or persistent draft cache.
  First successful snapshot save must not remount the editor or clear undo.
- Keep the 250-element/100,000-byte document validator unchanged. No new phase,
  text, aggregate-response or production performance limit is introduced.

## Consequences

Initial metadata remains O(number of phases and note/title lengths), not a
bounded total-response contract. A selected valid board is bounded by the
existing document validator; its response envelope adds bytes. Large invalid
legacy values may still cost database/validation work. Existing write responses
and duration recomputation still load JSON; optimizing them is not part of A.

Selection is a visible UX change: the initial flow/attendance view loads no board;
the board tab asks the user to open a phase instead of scanning all documents.
Revoked source access fails closed; old endpoints are preserved, so this is not
a repository-wide remediation claim. No concurrency version/ETag is invented.

## Rollout and Rollback

Delivery sequence: BL-046a additive backend reads; BL-046b frontend/draft
cutover; BL-046c isolated measurement and full regression verification. These are
delivery slices of BL-046, not completed backlog entries. Each slice has gates in
the design. Deploy backend reads before the new frontend. Roll back the frontend
to its previous read adapter first; old endpoints remain available. No schema or
data rollback. Do not reset, seed or migrate retained local data for this work.

BL-046a/b/c are implemented and verified. The matched valid-board fixture passed
in three process runs; full quality, API/browser regression and viewport checks
passed. BL-046/CR-017 implementation is complete; production capacity is not.
[Backend evidence](../30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md),
[frontend evidence](../30-quality/BL046_EDITOR_FRONTEND_CUTOVER_2026-09-07.md),
[matched measurement](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).

## Approval and Open Questions

2026-09-19 addendum: Accepted ADR-0036 authorizes versioned document adapters
with write tokens in BL-058b. This does not retrofit tokens into the existing
BL-046 read contracts in BL-058a; source checks and snapshot precedence remain.

The user approved proceeding with Option A as a package: additive API/projection,
explicit phase-open UX, dirty-transition coordination and the stricter source
check on new board reads. The approval follows the explicit implementation
question, not the earlier request to continue design. Delivery starts with BL-046a;
acceptance does not mean frontend/measurement slices have already shipped.

Pilot volume, latency/byte targets, hardware and performance owner remain TBD.
Multi-user conflict resolution, phase pagination, write-payload optimization and
production rollout require separate scope assessment. No paid service is requested.
