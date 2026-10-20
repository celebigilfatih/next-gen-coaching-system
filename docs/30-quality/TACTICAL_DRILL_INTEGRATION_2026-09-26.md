# Tactical drill integration — BL-058e.2

Date: 2026-09-26. ADR-0036 / CR-026 / REQ-025 / BL-058.

## Delivery boundary

The tactics new/detail route now reads and edits complete V1/V2 documents.
This slice does not change immutable GLOBAL DrillVersion/editorial V1, plan
snapshot routes, retained data, the default-off V2 flag, migrations or dependencies.
BL-058 / REQ-025 remain In progress: e.3 training snapshots and e.4 combined
integration/export acceptance and separately authorized retained rollout remain.

## Implemented contract

- GET `/drills/:id/tactical-editor` reads only metadata with existing drill
  visibility and unpublished-global protections. Unknown query fields fail.
  The route then reads the document/token independently. Failed/null document
  reads cannot mount an empty editable replacement; retry is explicit.
- PUT `/drills/:id/tactical-editor` accepts exactly `metadata`, `document`,
  `expectedWriteToken`. Metadata contains title, category, durationMin,
  difficulty and optional equipment only. Authorization, token check, complete
  document write and metadata write share one Serializable transaction.
  Existing document tokens do not version metadata; concurrent metadata-only
  edits retain the previously accepted last-successful-write behavior.
- POST `/drills/tactical-editor` accepts target groupId, metadata and document;
  copy additionally carries sourceId and expectedSourceToken. Target assignment
  is rechecked; club, age, author and CLUB scope derive on the server. Copy
  rechecks current source visibility and content token in the same transaction.
  V2-to-V1 copy downgrade is refused; all edited scenes are retained.
- GLOBAL updates are denied, including SystemAdmin. A global board is saved
  as a new CLUB record with a new identity; source publication is unchanged.
- Only these POST/PUT adapters join the 600,000-byte tactical HTTP allowance;
  document domain limits remain unchanged. Legacy routes stay 100 KB and
  their V1/V2 protections remain in effect.
- Editor owns the returned token. Conflicts, disabled V2 writes and uncertain
  failures preserve drafts and never refresh/retry automatically. POST has no
  new idempotency guarantee: after an uncertain response, verify the catalogue
  before manually retrying creation. No success is claimed on invalid responses.
- Metadata locks while saving. PLAYER and non-owner coaches get read-only
  playback; backend authorization remains authoritative. Session/role/resource/
  workspace keys prevent late read reuse. Navigation guards include metadata.
- Existing catalogue endpoints were already board-free and remain unchanged.
  Mobile legacy negative margins were scoped away on the tactics editor to
  eliminate measured 6px horizontal overflow (390px viewport: 396 → 390px).

## Verification

- 16 added backend unit cases cover projection, metadata validation, transactional
  writes, stale source tokens, forged ownership, target scope, PLAYER and global
  workflow protection. Existing document/legacy regressions remain covered.
- 11 real-editor route tests (mocked canvas/API) cover V2 save/token, errors,
  copy, new V1, initial retry, readonly roles, metadata dirty navigation, busy
  fields and late resource reads. Two additional client adapter tests cover
  whole-document atomic payloads and invalid create response rejection.
- Disposable PostgreSQL 16 HTTP suite **14/14 passed**: five added scenarios
  cover create/copy/update, negative scope/ownership, flag/global protections,
  actual rollback using a disposable-only failure trigger, and new-route
  600,000/600,001-byte plus inflated-gzip limits. The failure trigger was removed.
- All 11 migrations deployed; status current; schema diff empty. Test target
  was loopback 55439 / ngcs_tactical_test, never the retained database.
- Final root `npm run quality` passed: **840 backend / 57 suites, 429 frontend /
  55 files, 4 Sites**; typecheck, lint, format, builds, CDSK, 141 Markdown files
  with no broken links, and whitespace. Log: `/private/tmp/ngcs-drill-integration-quality.log`.
  The first restricted run passed tests but its frontend build preview listener
  was denied by the sandbox; the approved local-listener rerun passed.

## Browser QA

Playwright CLI skill, real TacticsEditorPage and Konva, isolated port 3144,
synthetic workspace/session and browser-memory transport. PostgreSQL HTTP tests
are a separate layer; this is not claimed as a combined browser/database E2E.

- Desktop 1672×941, tablet 1024×900 and mobile 390×844 inspected.
- Global source metadata edit → Save → `/app/tactics/copy`: two complete scenes
  and original source token in POST; new metadata/document reads after redirect.
- Mobile conflict after adding a third scene retains the three-scene draft,
  unchanged token and two-scene persisted source; no background retry observed.
- Final mobile content width equals 390px; toolbar and scene actions wrap,
  equipment tools scroll locally and the pitch remains visible. Screenshots
  are full-page captures at the stated viewport sizes, not fixed-height crops.
- Local ignored artifacts: `output/playwright/drill-integration-2026-09-26/`
  (`desktop.png`, `tablet.png`, `mobile.png`, `mobile-conflict.png`).
- Physical touch hardware, formal WCAG and representative club pilot remain TBD.

## Next

BL-058e.3: on-demand training phase metadata/document coordination and whole-V2
snapshot save/copy. Keep source authorization, immutable snapshots, dirty guard
and token conflicts. Do not enable retained V2 writes or declare BL-058 complete.
