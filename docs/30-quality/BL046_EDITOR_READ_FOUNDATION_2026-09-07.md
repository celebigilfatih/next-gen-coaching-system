# BL-046a — Training Editor Read Foundation

- Date: 2026-09-07
- Verdict: Pass for backend foundation; BL-046b/c remain open.
- Authority: [ADR-0025 Option A](../50-decisions/ADR-0025-on-demand-training-editor-boards.md)
  accepted after the user's instruction to proceed in response to the implementation
  approval request. CR-017 approved; no phase cap or production budget approved.

## Delivered scope

[TrainingEditorController](../../apps/backend/src/training-plans/training-editor.controller.ts)
adds authenticated GET editor-metadata and GET selected phase board under
/training-plans. The [service](../../apps/backend/src/training-plans/training-editor.service.ts)
and [input validator](../../apps/backend/src/training-plans/dto/editor-read.dto.ts)
are separate from legacy read/write handlers. TrainingPlansModule registers them.

Metadata is the complete scalar phase list, ordered by PostgreSQL Phase enum,
stored order and ID. It never selects board JSON, attendance or users. Selected
board reads check plan view, then current source view (also for snapshots), then
execute one parameterized effective-JSON query scoped to plan/phase/checked source.
SQL and JSON null snapshots fall back to source; false/zero/invalid snapshots do
not. Ready documents pass the existing strict validator; invalid/absent responses
carry no document. Unexpected persistence errors have fixed events and generic
500 responses without raw causes, identifiers or document content.

Existing /:id, /:id/editor, additive POST and snapshot PUT remain compatible.
Frontend code, schema, migrations, dependencies and retained business data are
unchanged. The current UI still calls the old editor endpoint: reduced initial
frontend payload and dirty/history improvements are NOT delivered in this slice.

## Verification

| Gate | Result |
| --- | --- |
| New focused unit suite | 43/43 passed: input grammar, exact select, auth-before-content, effective query binding, invalid suppression, failure containment, controller forwarding |
| New disposable PostgreSQL HTTP suite | 8/8 passed, then passed again within the complete API run |
| Complete backend API E2E | 6 suites, 48 passed / 1 intentionally skipped opt-in mixed benchmark |
| Root quality | Passed: 655 backend tests, 115 frontend tests, typecheck/lint/format/build, Sites 4/4, documentation/CDSK/whitespace |
| Database verification | Six existing migrations deployed to clean ngcs_bl046_editor_e2e; status current and schema diff empty |
| Local read-only checks | Backend root 200, new unauthenticated metadata endpoint 401, frontend training route 200 |
| Retained business fingerprint | Before/after PASS, 24 tables / 25 rows; session/audit excluded as in the established manifest |
| Final documentation/scope checks | 100 Markdown files, zero broken links; CDSK and git diff --check passed; frontend/schema/package diff fingerprint unchanged |

The first unit attempt exposed an Error.cause type unsupported by the repository
test target; the assertion now checks property absence without changing tsconfig.
The first root-quality run reached frontend build but its preview listener was
denied by the sandbox (EPERM). The same complete command passed with loopback
permission; no application config was changed to bypass a gate. A /health probe
returned 404 because no such route exists; the source-defined root route returned
200. These HTTP checks are not browser interaction or production readiness tests.

The new [E2E suite](../../apps/backend/test/training-editor.e2e-spec.ts) verifies:

- All four view roles; unauthenticated, other-club/group, unknown query, bounded
  IDs, mismatched phase and revoked membership rejection.
- Exact metadata/board response keys and captured SQL without metadata JSON;
  unselected 200,000-character legacy data does not change metadata or the selected
  snapshot. Exactly one content query retrieves effective JSON.
- SQL NULL and JSON null, null source, legacy invalid source, invalid non-null
  snapshot without fallback, and source changes independent of saved snapshot.
- 100,000-byte valid document accepted / 100,001 rejected; 250 elements accepted /
  251 rejected. Documents are constructed from allowed fields, not invalid padding.
- PLAYER writes denied, coach POST/PUT still work, another phase is added without
  changing the saved snapshot ID/content and duration remains synchronized.
- Deliberately inconsistent source links exist only in the disposable fixture:
  new board read checks group/club source access even with a stored snapshot;
  legacy GET remains unchanged. Quoted IDs are safely bound data in SQL.

## Reproduction and cleanup

Create an explicitly disposable loopback PostgreSQL database and apply the current
six migrations before running the suite. The new suite rejects non-loopback URLs,
names without test/e2e and local_session_dev, and requires explicit reset consent.
Do not run any E2E against retained ngcs_local_session_dev.

```bash
TEST_DATABASE_URL=<disposable-loopback-test-url> \
E2E_ALLOW_DESTRUCTIVE_RESET=true \
npm --prefix apps/backend run test:e2e -- --runInBand \
  --testPathPatterns=training-editor

npm run quality
```

After the complete suite closed, zero connections were verified; only the newly
created ngcs_bl046_editor_e2e database was removed and its absence confirmed.
Its synthetic data can be regenerated by migrations/tests. No retained reset,
seed, migration or business write occurred; no stage/commit/push.
Cumulative short-status entries changed from 193 to 198 (new DTO is grouped in
an already-untracked directory); unrelated existing changes were preserved.

## Remaining gates and rollback

Next: BL-046b frontend metadata/one-board cutover, explicit open and coordinated
dirty/undo transitions; then BL-046c matched 2/50-phase valid-board measurements,
browser E2E and 1440/1024/390 px checks. Browser E2E was not rerun here because
the frontend and its existing API contracts are unchanged. Previous browser
results are historical, not verification of the planned new interaction.

Metadata still grows with phases and note/title lengths; legacy oversized JSON
can cost validation/database work. Write responses/duration recomputation remain
heavy. No SLO, universal query budget, row-work bound or concurrency version is
claimed. Pilot owner/volume/hardware/budgets remain TBD; BL-043/044/045/M4 are open.
Rollback removes only this additive controller/service/DTO and module registration
(plus its tests/docs); the existing frontend continues using old endpoints. No
database rollback is needed. Later frontend cutover must be reverted first before
removing new reads. Do not revert unrelated cumulative repository changes.
