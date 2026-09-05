# ADR-0018: Provider-neutral persistent browser sessions

- **Status:** Accepted
- **Date:** 2026-09-05
- **Owners / approvers:** User approved the proposed package and implementation; named operations/security owner TBD
- **Supersedes / superseded by:** Partially supersedes ADR-0010 pre-implementation infrastructure gate; preserves its production rollout gate
- **Related:** ADR-0006, ADR-0008, ADR-0010, ADR-0017, BL-013

## Context

ADR-0010 accepts same-site frontend/API origins with rotating refresh credentials,
but defers implementation until infrastructure inputs are available. The user
approved a provider-neutral implementation behind a default-disabled feature flag,
with explicit lifetime and retention choices. Production domain, provider and
operations ownership remain TBD.

## Decision

- Backend `PERSISTENT_SESSIONS_ENABLED` and frontend
  `VITE_PERSISTENT_SESSIONS_ENABLED` default to false. Disabled mode retains the
  memory-only seven-day bearer contract; rollout requires enabling both artifacts.
- Enabled mode uses a 15-minute access JWT, seven-day refresh idle timeout and
  30-day absolute family lifetime. At most five active families per user are
  retained; new login evicts the oldest active family.
- The production refresh cookie is `__Host-ngcs_refresh`, host-only, Secure,
  HttpOnly, SameSite=Lax, Path=/. Local HTTP tests use `ngcs_refresh` without
  Secure; non-production HTTP frontend origins must be loopback.
- Enabled login/refresh/logout require an exact configured `FRONTEND_ORIGIN` and
  `X-NGCS-CSRF: 1`. CORS permits that exact origin and header, never a wildcard or
  reflected origin. The header is a preflight control, not a secret CSRF token.
- Opaque 256-bit refresh credentials are stored only as SHA-256 hashes. Rotation
  keeps family lineage, serializes on the user row and atomically consumes the old
  credential. Reuse revokes the family and records a token-free security event.
- Access JWTs carry a family id checked on HTTP requests and Socket.IO sends and
  recipients. Logout, eviction and replay therefore invalidate family access.
  Status/access/password changes and global revocation retain authVersion checks
  and explicitly revoke active refresh records.
- The additive RefreshSession table contains only user/family ids, token hash,
  authVersion, lifecycle times and a controlled revocation reason. No raw IP,
  user-agent or credential is retained. Expired/revoked records are eligible for
  deletion after 30 days; startup, hourly and login cleanup remove eligible rows.
  Existing security-audit retention remains TBD and is a separate policy.
- Frontend bootstrap waits for refresh before showing protected routes; access
  tokens remain in memory. Requests share one refresh operation per tab and use
  Web Locks where available to serialize cookie rotation across tabs. Without Web
  Locks concurrent refresh fails closed and can require reauthentication.
- Logout reports transport failures without claiming server revocation succeeded.
  Refresh transport errors expose retry; authentication failures end the session.

## Migration, rollout and rollback

Migration `20260905000000_add_refresh_sessions` adds a table, indexes and audit enum
values. Apply only under ADR-0006 controls and validate in disposable PostgreSQL 16.
Deploy the migration before updated backend code, including while the feature is
disabled because lifecycle operations revoke refresh rows.

Enable in an isolated environment with a known exact frontend origin. Production
still requires same-site HTTPS origins, trusted proxy/WebSocket configuration,
secrets, distributed rate limiting, readiness, backup/restore and ownership.
Provider/domain/registry/date remain TBD; this ADR does not authorize rollout.

Rollback disables both flags and returns to memory-only login. Family-bound access
tokens are rejected when disabled. Revoke retained refresh rows before any later
re-enable, or increment affected users' authVersion; keep the additive schema and
audit values until retention and compatibility permit removal.

## Verification

Verified on 2026-09-05: root `npm run quality` passed, including 68 backend unit
tests, 13 frontend tests, builds, Sites, CDSK, Markdown links and diff checks.
Disposable PostgreSQL 16 passed all three migrations, repeat deploy, status and
empty live-schema diff. Backend E2E passed 18/18, including rotation/replay,
concurrency, expiry, logout, lifecycle revocation, session-limit and retention.
Playwright passed 4/4 with persistence enabled and 3/3 with it disabled (the
opt-in scenario skipped). Reload, a second tab and server logout were verified;
tokens were absent from browser storage. Configuration/cookie/CSRF and revoked
Socket family sender/recipient tests passed. Runtime and migrator images built
successfully with the additive schema. The runtime image queried RefreshSession
successfully and the migrator image reported no pending migrations against the
same disposable database; production rollout was not performed.

The legacy analytics adapter still reports 41 lint warnings. No dependency
version or lockfile changed. Production gates and browser-matrix expansion remain
separate from this local implementation verification.

## References

[OWASP CSRF prevention: custom request headers and strict CORS](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi)
supports the preflight-required API request control. SameSite remains defense in
depth. XSS and compromised approved origins remain outside that control's guarantee.
