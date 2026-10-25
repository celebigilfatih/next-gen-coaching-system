# Training tactical integration — BL-058e.3

Date: 2026-09-26. ADR-0036 / CR-026 / REQ-025 / BL-058.

## Boundary and contract

- Training detail retains its board-free metadata and explicit phase-opening
  flow. Selecting a tab/phase alone does not fetch a board; only one editor is
  mounted. The new client adapter reads complete V1/V2, not legacy V1 `/board`.
- Plan document GET/PUT now adds `phase` with planId, planDrillId, drillId and
  origin. Client validates identity, origin, token and whole document. Invalid
  non-null data cannot silently become a blank canvas or source fallback.
- Snapshot Save sends all scenes and expectedWriteToken through the existing
  Serializable adapter. First save changes source provenance to snapshot and
  updates the client token without remounting or clearing undo history.
- Source edits before first save cause 409; after save they cannot modify the
  snapshot. Current source visibility is required on every read/write. Animation
  timing never changes training-plan duration.
- Conflicts, flag-disabled and permission/network failures keep the draft;
  there is no automatic retry or force overwrite. Explicit verification of an
  uncertain result can acknowledge the identical persisted snapshot via Save
  without another PUT. Only then is that snapshot's token adopted. A different
  document never refreshes the draft token; export and reopening are required.
- Existing phase/tab/route/workspace/session dirty and stale-response guards
  remain. PLAYER can view/play but not mutate. Legacy V1 endpoints are retained.
- No migration, dependency, retained-data change or V2 write-flag activation.
  BL-058/REQ-025 remain In progress pending e.4 combined acceptance/rollout gate.

## Automated evidence

- Three backend unit cases: provenance, post-save token change, source isolation,
  absent origin and no plan metadata in other-resource envelopes.
- Seven new real-editor route cases: full V2 Save and first-save undo, stale
  token retention after verification, exact lost-response acknowledgement,
  disabled/forbidden Save-and-leave, explicit phase loading and PLAYER playback.
- Six client cases: complete payload and phase provenance; mismatched plan/
  phase, invalid/missing origin; absent reads never accepted as a saved snapshot.
- Targeted frontend 41/41 and backend document service 52/52 passed. Existing
  V1, pending, error, late-read and identity-change regressions remain included.
- Disposable PostgreSQL 16 HTTP suite **16/16 passed**. Two new flows exercise
  club V2 creation → phase attachment → board-free metadata → whole snapshot
  save → source edit → isolated plan, PLAYER write denial and legacy read 409;
  plus stale-source no-write and revoked source authorization with persistence
  unchanged. Other suite cases cover concurrency, tenant, limits and rollback.
- All 11 migrations deployed on loopback 55439 / ngcs_tactical_test; migration
  status current and schema diff empty. No retained DB used. The suite's
  intentional persistence fault emits only its generic error code.
- Root quality: **843 backend / 57 suites; 442 frontend / 55 files; 4 Sites**.
  Typecheck, lint, format, builds, CDSK, 142 Markdown files with no broken local
  links and whitespace passed.
  Log: `/private/tmp/ngcs-training-integration-quality.log`.
  The first attempt stopped on formatting of one new test; corrected and rerun.

## Browser evidence

Playwright CLI skill; actual TrainingDetailRoute and Konva on isolated port
3144 with synthetic workspace/session and browser-memory fetch responses.
HTTP/database tests are separate; this is not a combined authenticated browser
to PostgreSQL E2E claim. No retained records were edited.

- Desktop 1672×941, tablet 1024×900, mobile 390×844; full-page captures.
- Before explicit opening: metadata/catalog reads only. Opening the phase:
  exactly its document GET, one actual canvas and two scenes.
- Add scene → Save: three-scene payload, original token, snapshot origin and
  returned token. Undo after Save retains two-scene draft while saved document
  stays three scenes. Dirty tab exit opens a dialog with initial Cancel focus;
  Cancel preserves draft without another request.
- Forced conflict preserves draft and saved document with no automatic retry.
- Mobile hero margin used a 22px gutter against 16px page padding. Setting the
  detail-page mobile gutter to 16px removes page overflow: 396 → 390px. Desktop
  and tablet widths match their viewports; equipment scrolls locally.
- Local ignored artifacts: `output/playwright/training-integration-2026-09-26/`
  (`desktop.png`, `tablet.png`, `mobile.png`, `mobile-conflict.png`). The isolated
  harness has an irrelevant favicon 404; no application runtime error observed.
- Physical touch, formal WCAG and representative club pilot remain TBD.
- Cleanup: the isolated browser and preview server were closed; only the
  disposable PostgreSQL container/volume and its synthetic records were removed.
  Test data is intentionally not retained; existing local databases are untouched.

## Next

BL-058e.4: combined drill → plan → match, import/export and compatibility
acceptance. Retained V2 writes remain OFF; enabling or converting actual records
requires separate explicit approval. This slice does not complete the broader
professional tactics roadmap (offline match-day, video or optional 3D).
