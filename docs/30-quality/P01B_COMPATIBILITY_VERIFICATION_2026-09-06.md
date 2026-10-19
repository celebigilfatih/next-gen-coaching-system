# P0.1b Compatibility Verification — 2026-09-06

## Verdict

This is the repository delivery snapshot. The subsequently approved local
rollout is recorded in the [local rollout report](P01_LOCAL_ROLLOUT_2026-09-06.md);
the unperformed rollout statements below describe this earlier snapshot.

Repository delivery: Pass. Retained local database and production rollout have
not been performed. BL-042 completes the repository compatibility slice of P0.1.

## Verified behavior

The [compatibility contract](../10-architecture/P01B_COMPATIBILITY_CUTOVER.md)
defines directional source ownership, transaction behavior, scope selection and
rollback. Relevant implementation and evidence:

| Boundary                                                            | Evidence                                                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Both legacy group-create routes and group update create/update Team | HTTP + PostgreSQL assertions in `app.e2e-spec.ts`                                         |
| Invitation/account creation creates Person/profile                  | HTTP acceptance and persisted profile assertion                                           |
| Member add/remove keeps history and actor audit                     | Legacy assignments end; re-add creates a new period; independent primary survives         |
| Failed projection and failed group deletion roll back all writes    | Deliberate cross-club mapping conflict and legacy FK rejection                            |
| Concurrent member adds                                              | One 201 and one existing-contract 500; one GroupMember and one open mapped period         |
| Shared season identity                                              | Two teams' matching legacy seasons share one ClubSeason and have distinct TeamSeasons     |
| Revocation and independent grants                                   | Removed coach gets no workspace teams and cannot regain access through a past `asOf`      |
| Reconciliation                                                      | Own/system admin aggregate parity reports IN_SYNC; coach gets 403                         |
| Scope transitions                                                   | Slow previous-team response cannot overwrite the new scope; no cross-team season fallback |
| Browser storage                                                     | Only user-keyed club/season/team IDs; no access token; malformed storage handled          |
| Dirty scope change                                                  | Router blocker cancels or confirms before scope is persisted                              |
| Responsive UI and sessions                                          | Scope controls and Player 360 at 1440/1024/390 px; reload/new-tab/logout remain valid     |

## Quality gates

- Backend: 38 unit suites, 396 tests.
- Frontend: 8 test files, 27 tests, including four context integrity regressions.
- Disposable PostgreSQL 16: 2 E2E suites, 29 tests; six migrations current;
  schema diff reports no difference. This slice adds no migration.
- Chromium with persistent sessions enabled: 6/6 tests, including old coach flows,
  scope persistence and unsaved-board navigation.
- Root quality: backend/frontend typecheck, lint, format, builds; Sites tests;
  Markdown links, CDSK and whitespace checks.

Legacy service unit tests explicitly isolate the projection adapter so they retain
their body/error/response contract checks. Atomic projection, rollback, parity and
revocation are tested through real HTTP and PostgreSQL, without mocking that adapter.

The expanded browser suite initially hit the existing login rate limit. Its login
fixture now waits for the server's Retry-After duration; production throttling was
not changed. The session test now allows only the documented three scope IDs in
localStorage and still explicitly rejects authentication data. A test-only
TypeScript query option was corrected before the successful root gate.

## Limits

- The retained `ngcs_local_session_dev` database was not migrated or reseeded.
- New sporting-only assignments do not grant legacy GroupMember permissions;
  native Team/account transfer and complete replacement of legacy APIs are later
  work, not implicit side effects of a primary promotion.
- Reconciliation is read-only and count-based. Direct SQL/old writers can create
  drift, which must be reviewed before a forward repair. No automatic historical
  correction or restoration of removed grants occurs.
- Legacy category enums remain in the compatibility API. Configurable native Team
  editing and specialised role management are later product work.
- Pagination/pilot scale remains BL-043; sensitive-data production policy remains
  BL-044. This pass is not a production readiness declaration.
