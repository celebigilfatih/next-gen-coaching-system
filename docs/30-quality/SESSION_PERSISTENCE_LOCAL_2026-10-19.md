# Local persistent-session reactivation — 2026-10-19

Explicit user request: refreshing a page must not repeatedly require sign-in.
This activates the already accepted ADR-0018 implementation on canonical local
API4000/UI3132. No new session design, runtime source change, dependency or
retained migration was needed. Production defaults and rollout gates remain as
documented in [ADR-0018](../50-decisions/ADR-0018-provider-neutral-persistent-sessions.md).

## Root cause and change

Both local persistence flags were absent/disabled. Authentication therefore used
the supported memory-only mode: full reload or module replacement discarded the
access token. The refresh/session bootstrap implementation already existed.

Updated ignored local configuration:

- `apps/backend/.env`: `PERSISTENT_SESSIONS_ENABLED=true` and exact
  `FRONTEND_ORIGIN=http://localhost:3132`. Existing tactical V2 setting preserved.
- `apps/frontend/.env.local`: `VITE_PERSISTENT_SESSIONS_ENABLED=true` and
  `VITE_API_BASE_URL=http://localhost:4000`. Vite picked up the configuration.

Both files are Git-ignored. No passwords, JWT secret, cookie values or refresh
credentials were recorded in tracked files. Environment examples keep their
default-disabled policy. The retained RefreshSession migration was already
applied; initially there were zero refresh rows, so no stale families required
revocation. Existing database connection provisioning was not changed.

The canonical API process changed during concurrent development. A guarded stop
refused to kill the replacement process. A separate attempted process failed
before listening because its shell had no DATABASE_URL; it was not substituted
for the running API. The actual replacement API was verified on4000 with the
enabled refresh endpoint and exact credentialed CORS. No competing process was
killed and no new runtime instance was left on another port.

Final recovery check: the API subsequently stopped and Docker's engine pipe was
temporarily unavailable. Docker Desktop was already running; its normal startup
recovered the existing containers, including the unchanged loopback5433 database.
No socket deletion, Docker reset, volume removal or database recreation occurred.
After PostgreSQL readiness, canonical API4000 was started from `dist/main.js`
with the retained target and enabled local flags (managed exec5918, PID25272).
Connection credentials stayed in process memory. The browser initially retained
a failed Vite route import from the outage; a full reload restored the same plan
without another sign-in. This also verifies refresh across API restart with a
new process-local access-signing secret.

## Verification

- Served frontend module confirms persistence enabled and local API base.
- Canonical refresh without a cookie returns401 (enabled, no fabricated auth)
  with exact allowed origin `http://localhost:3132` and credentialed CORS.
- User completed one normal login to establish the refresh cookie. No password
  reset, credential extraction, injected session or auth bypass was used.
- Actual in-app Chromium: full dashboard reload preserves the authenticated
  workspace; library reload retains A Takım; training-detail reload restores
  the same103-minute/six-phase plan. A fresh second tab opens that protected URL
  without sign-in; the temporary tab was closed and the original result kept.
- Read-only session aggregates show normal rotation records and active families;
  no token/hash/user identifiers were exported. The103-minute plan and earlier
  desktop121-minute plan still have six phases each. This task performed no
  training, match, library, account-role or password write.
- Backend focused configuration/controller/refresh/JWT suites:18/18, four suites.
- Frontend session API/login/layout suites:20/20, three files. These cover shared
  bootstrap, in-memory credentials, flag-off behavior, logout failure/retry,
  stale-session rejection and no resurrection after clearing a session.
- Fresh dedicated PostgreSQL database
  `ngcs_session_refresh_test_20261019_1442`: all14 existing migrations applied;
  `test/refresh-session.e2e-spec.ts` passes9/9. Coverage includes cookie HttpOnly/
  SameSite and15-minute access TTL, exact origin/CSRF, rotation/replay/concurrency,
  logout family isolation, idle/absolute expiry, five-family limit, revocation
  and retention. It does not target or reset `ngcs_local_session_dev`.

Screenshots in `apps/frontend/qa/session-persistence-2026-10-19/`:
`01-plan-after-reloads.png` and `02-new-tab-session.png`. The first was visually
inspected after successful full reload; it shows the same saved103-minute plan.
`03-after-api-restart.png` records the final authenticated plan after the service
recovery and a full reload without reauthentication; the tab remains open.
No full-root pass is inferred from the focused tests; existing Windows npm/CDSK
runner limitations are BL-061.
Final documentation checks pass:166 Markdown files, zero broken local links,
report Prettier and scoped Git whitespace. Root quality was attempted again and
stops at `spawnSync npm ENOENT` before running its stages.

## Operation and scope

Keep both flags enabled together for this approved local environment, using
localhost consistently. A memory-only login from before activation needs one
new login to acquire the cookie. Routine access refresh is automatic; explicit
logout, revocation or approved expiry still requires authentication again.
Existing policy stays15-minute access, seven-day idle and30-day absolute refresh,
with a maximum of five active families. HttpOnly refresh cookies and in-memory
access credentials remain unchanged; do not solve reloads with Web Storage tokens.

Web Locks serialize supported cross-tab refresh; the documented fail-closed
fallback for unsupported browsers remains. Production requires the separate
HTTPS/origin/secret/proxy/operations rollout gates. No production activation or
new architectural/security-policy exception is introduced.

[Runbook](../40-operations/RUNBOOK.md),
[original session decision](../50-decisions/ADR-0018-provider-neutral-persistent-sessions.md).
