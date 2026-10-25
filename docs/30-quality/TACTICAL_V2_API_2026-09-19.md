# BL-058b — Versioned tactical persistence

2026-09-19. ADR-0036 / CR-026 / REQ-025. This is the server compatibility
slice, not the scene editor, browser playback or retained-data rollout.

## Delivery and authorization

- Additive GET/PUT endpoints for drill, plan phase and match return
  `{document, writeToken}`. PUT accepts only `{document, expectedWriteToken}`;
  query parameters are rejected. A null read is supported; null writes are not.
- Resource/source authorization and fresh document reads run in the same
  Serializable transaction as comparison and write. SHA-256 tokens bind
  canonical content, resource identity and, for plans, source ID and
  snapshot/source provenance. Tokens are not credentials or revision numbers.
- COACH can write only its own group drill and assigned-group plan/match;
  PLAYER cannot write. Own-club admin and system admin retain their scopes.
  Global document writes are denied even to system admin; the V1 editorial
  workflow remains authoritative. Unpublished global drills are not exposed
  by the new direct drill read to operational roles.
- Missing/invalid token or document is 400; stale token/serialization conflict
  is 409. No automatic transaction retry or forced overwrite. Unexpected
  persistence errors use a cause-free generic boundary and fixed event name.
- `TACTICAL_V2_WRITES_ENABLED` must equal `true` explicitly. The default is
  off; V2 reads and downgrade protections do not depend on this flag. No
  retained environment setting was changed.

## Legacy protection inventory

| Path | Protection |
| --- | --- |
| Legacy drill update | Transaction re-read and scope check; JSON writes over V2 return 409; metadata-only update omits JSON |
| Legacy plan board update | Transaction checks effective snapshot/source before writing |
| Legacy replace-drills | Transaction checks existing effective phase documents before delete/recreate; V2 stops the whole operation |
| Legacy match board update | Transaction checks stored board; metadata-only match update leaves it unchanged |
| Editorial publish | Transaction checks target drill before version/archive/audit writes; published diagram remains V1-validated |
| Importer | Existing idempotent no-update upsert and V1 manifest validation remain unchanged |
| Legacy GET payloads | V2 produces explicit 409 instead of an old client interpreting it as an empty board; paged metadata remains available |

The existing full-plan/full-season/legacy drill/match controllers have a narrow
GET response guard. The on-demand phase V1 reader checks V2 before its old
invalid-document fallback. New document controllers are separate and V2-aware.
No scenes are flattened or silently discarded. Intentional resource deletion
retains its existing permission/confirmation semantics; it is not JSON downgrade.

## HTTP limits

Bootstrap installs the shared parser configuration before route handling.
Only the three document PUT patterns receive a 600,000-byte JSON envelope.
Other JSON and URL-encoded routes retain their 100 KB limit. Inflated gzip
content is bounded too. Domain limits remain 500,000 bytes for V2 and 100,000
for each V1 scene. Parser errors do not echo request text.

## Verification

- 33 new service tests exercise canonical tokens, all three resources, roles,
  tenant/source revocation, ownership, strict input, default-off writes,
  provenance changes, immutable snapshots, generic errors and legacy guards.
- Disposable PostgreSQL 16: all 11 existing migrations deploy successfully.
  Migration status is current; Prisma schema diff reports no difference.
  No new migration, schema or dependency was introduced.
- Dedicated HTTP/PostgreSQL suite: **8/8 passed**, with actual JWT and database
  authorization, all three V2 round trips, independent snapshot, one winner
  in simultaneous same-token edits for each resource, legacy V1 regression,
  old-reader denial, bulk-replace protection and unchanged plan duration.
- HTTP boundary cases include 500,000/500,001-byte documents,
  600,000/600,001-byte envelopes, inflated gzip, malformed JSON and unchanged
  limits on legacy routes. Failed writes leave the saved document unchanged.
- `npm run content:drills:validate`: 120 DRAFT manifests remain valid; dry-run
  does not connect to the retained database or publish content.
- Final `npm run quality` passed: **821 backend tests / 57 suites**, **369
  frontend tests / 48 files**, **4 Sites tests**, builds, typecheck, lint,
  formatting, CDSK, 137 Markdown files with zero broken links and whitespace.
- An initial sandbox run reached frontend build but could not bind the local
  Vite preview port (`EPERM`). A permitted retry encountered one asynchronous
  Radix/jsdom `dispatchEvent` teardown error after all 369 frontend assertions
  passed. The isolated assignment-dialog suite then passed 15/15; no unrelated
  frontend code was changed to hide this test-environment instability.
  The subsequent full quality run completed without an unhandled error.

The dedicated suite refuses any database except loopback port 55439 and
`ngcs_tactical_test`, with `TACTICAL_DISPOSABLE_TEST=true` and a separately
provided `TEST_DATABASE_URL`. It creates synthetic records without truncate,
reset or retained-data reads. Production and the user's local records were
not changed. Browser QA is deferred because no UI was changed.
The task-created container and its disposable volume were removed after the
tests; only synthetic test records were discarded, not user data.

## Files and next gate

- [Service](../../apps/backend/src/tactics/tactical-document.service.ts),
  [controller](../../apps/backend/src/tactics/tactical-document.controller.ts),
  [persistence helpers](../../apps/backend/src/tactics/tactical-persistence.ts),
  [HTTP parser](../../apps/backend/src/tactics/tactical-body-parser.ts).
- [Unit regressions](../../apps/backend/src/tactics/tactical-document.service.spec.ts),
  [disposable HTTP suite](../../apps/backend/test/tactical-document.e2e-spec.ts).
- Next **BL-058c**: scene strip, document-wide undo, dirty-state and explicit
  token-aware save. BL-058d playback and BL-058e integrated UI/export/browser
  gates remain open. No new V2 writes may be enabled in the retained environment
  merely because this backend slice passed.
