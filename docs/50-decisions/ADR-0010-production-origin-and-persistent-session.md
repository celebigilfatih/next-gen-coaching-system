# ADR-0010: Production origin topology and persistent browser session

- **Status:** Proposed
- **Date:** 2026-09-01
- **Owners / approvers:** Explicit user approval required; production/security owner TBD
- **Supersedes / superseded by:** Extends the temporary session decision in ADR-0009
- **Related:** ADR-0004, ADR-0006, ADR-0007, ADR-0008, ADR-0009, BL-013

## Context

The frontend is a static React Router SPA. The NestJS backend exposes REST and
Socket.IO endpoints and uses PostgreSQL through Prisma. The current client keeps
the bearer access JWT only in process memory, so a reload deliberately ends the
browser session. Login returns an access token; there are no refresh or logout
endpoints and no persistent refresh-session model in the verified Prisma schema.

The backend currently allows a fixed list of localhost origins with credentialed
CORS. This is development evidence, not a production origin contract. The exact
frontend/API domains, hosting providers, TLS edge, secret store, proxy trust model,
backup owner and observability platform are not known and remain `TBD`.

This ADR proposes the target boundary only. It does not authorize a Prisma
migration, API/client change or production deployment while its status is
`Proposed`.

## Decision Drivers

- Preserve the static frontend and the single NestJS application backend.
- Keep access credentials out of `localStorage` and `sessionStorage`.
- Retain the existing bearer contract for REST and Socket.IO while making browser
  sessions survive reloads.
- Make logout, suspension, password/access changes and suspected token reuse
  revocable at the server.
- Use an explicit production origin allowlist and fail closed on missing production
  configuration.
- Avoid choosing domains, vendors, lifetimes or retention periods without evidence.

## Considered Options

### Option 1 — Same-site frontend/API origins with a rotating refresh session

Serve the static frontend and API from separate HTTPS origins under the same
registrable site. Exact hostnames remain `TBD`. Keep a short-lived access JWT only
in frontend memory and keep an opaque, rotating refresh credential in a host-only,
`Secure`, `HttpOnly` cookie set by the API.

This preserves independent static/API deployment and allows persistent sessions
without exposing the refresh credential to browser JavaScript. It still requires
credentialed CORS, CSRF controls, a server-side refresh-session store and an
infrastructure provider that supports long-running HTTP and Socket.IO traffic.

### Option 2 — Same-origin reverse proxy

Serve the SPA and route API/Socket.IO traffic through one public origin. This
reduces CORS complexity, but a verified edge/proxy runtime and ownership model do
not exist in the repository. Selecting it now would prematurely constrain hosting.

### Option 3 — Cross-site frontend/API origins

Use unrelated sites and a cross-site refresh cookie. This requires
`SameSite=None; Secure`, increases browser/privacy-policy and CSRF complexity and
has no verified product requirement.

### Option 4 — Keep the memory-only access token

This requires the least implementation but signs the user out on every reload and
does not meet the requested persistent production-session outcome.

## Proposed Decision

Adopt **Option 1** after explicit approval, with the following binding boundaries:

### Origin and hosting boundary

- The frontend remains a static SPA artifact. The backend remains a separate,
  long-running NestJS service with REST and Socket.IO support.
- Both public origins use HTTPS and are placed under the same registrable site.
  Exact frontend origin, API origin, DNS names, hosting providers and TLS
  termination owner are `TBD`.
- Production CORS is configured from an explicit allowlist. Only the exact approved
  frontend origin may make credentialed browser requests; wildcard origins and
  origin reflection are prohibited.
- Trusted-proxy hops, client-IP derivation and distributed authentication rate
  limiting are `TBD` and must be decided before production rollout.
- Production secrets come from an external secret store or equivalent deployment
  mechanism. Provider, rotation owner and emergency procedure are `TBD`.

### Browser-session boundary

- Login and refresh return a short-lived access JWT to the client. The frontend
  keeps it only in memory and sends it in the existing `Authorization: Bearer`
  header and Socket.IO `auth.token` field.
- Login also establishes an opaque refresh credential generated with a
  cryptographically secure random source. The backend stores only its hash and
  server-side session metadata; it never stores the raw credential.
- The refresh cookie is host-only by omitting `Domain`, and explicitly sets
  `Secure`, `HttpOnly`, `SameSite` and the narrowest practical `Path`. Its name,
  `SameSite` value, path and lifetime are `TBD` until exact origins and navigation
  requirements are confirmed. The implementation must not rely on `Path` as a
  security boundary.
- Every successful refresh rotates the credential. Reuse of an invalidated
  credential revokes its session family and creates a security audit event.
- Refresh-session records are bound to the user and current `authVersion`.
  Logout revokes the current session; suspension, password/access changes and
  explicit global revocation invalidate all of the user's sessions.
- Cookie-authenticated login/refresh/logout operations validate the request origin
  against the exact allowlist and use an explicit CSRF control. `SameSite` is only
  defense in depth. The concrete CSRF token/header mechanism is an implementation
  decision that must be verified before rollout.
- Authentication credentials are never written to `localStorage`,
  `sessionStorage`, URLs, analytics or application logs.
- Access-token lifetime, refresh idle/absolute lifetime, concurrent-session limit,
  retained metadata, retention/deletion period and user-facing device/session
  management are `TBD` and require security/privacy approval before implementation.

### Required API and data changes after acceptance

Acceptance authorizes implementation planning, not an unreviewed migration. The
implementation requires:

- login response/cookie issuance plus authenticated refresh and logout contracts;
- a minimal hashed refresh-session/family model with expiry, revocation and reuse
  evidence;
- Prisma migration review under ADR-0006 safeguards;
- frontend credentialed refresh bootstrap and fail-closed logout behavior;
- unchanged bearer authorization for business APIs and Socket.IO; and
- security audit coverage without raw token or sensitive metadata leakage.

## Consequences

The user can keep a session across reloads without placing a long-lived credential
in JavaScript-readable storage. Rotation, database-backed revocation and the
existing `authVersion` mechanism provide a controllable lifecycle.

The design adds state, database writes, cookie/CSRF handling and deployment
coupling between exact frontend/API origins. A compromised same-site sibling origin,
misconfigured CORS/proxy or XSS can still create serious risk; cookie flags do not
replace origin validation, CSP/XSS controls, rate limiting or monitoring.

Production remains blocked until the `TBD` infrastructure, lifetime, retention,
backup, readiness and observability decisions are resolved and verified.

## Rollout and Rollback

1. Resolve exact origins/providers, TLS/proxy ownership, secret delivery, session
   lifetimes/retention, backup/restore objectives and monitoring ownership.
2. Approve the Prisma migration and API contract; deploy the additive session store
   before issuing refresh credentials.
3. Add backend login/refresh/logout behavior, rotation/reuse tests, CSRF/origin
   enforcement and redacted audit events.
4. Add frontend refresh bootstrap while preserving the bearer business-API and
   Socket.IO contract.
5. Verify positive and negative browser paths in staging, including reload,
   expiration, rotation, reuse, logout, suspension, cross-origin denial and
   Socket.IO reconnect.
6. Enable persistent sessions through a reversible release control only after
   production readiness gates pass.

Rollback stops new refresh issuance, revokes active refresh sessions and returns
the client to the accepted ADR-0009 memory-only login behavior. The additive table
is retained until rollback safety and audit retention obligations are confirmed;
no destructive schema rollback is implied.

## Verification Gates

- Exact-origin credentialed CORS passes for the approved frontend and fails for
  unapproved, absent and malformed origins.
- Cookie attributes, CSRF/origin checks and absence of browser-storage credentials
  are asserted by automated tests.
- Refresh rotation is atomic; concurrent/replayed old credentials fail closed and
  revoke the affected family.
- Logout, suspension, password/access changes and `authVersion` increments revoke
  the intended sessions across HTTP and Socket.IO.
- Secrets, raw credentials and prohibited personal data are absent from logs and
  audit payloads.
- Readiness, migration, backup/restore and rollback checks are documented and
  exercised in a non-production environment.
- Repository quality, CDSK, Markdown-link and diff checks pass.

## Evidence and Standards

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
  treats `SameSite` as defense in depth rather than a CSRF replacement, recommends
  secure cookie attributes and warns against authentication credentials in Web
  Storage.
- [MDN Set-Cookie reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
  documents host-only cookies, credentialed CORS behavior and the relationship
  between `SameSite=None` and `Secure`.
- [NestJS CORS documentation](https://docs.nestjs.com/v11/security/cors) confirms
  that the application can supply an explicit CORS configuration.

## Approval Required

Explicit approval is required for the recommended Option 1 and its session
boundary. Approval may leave providers, exact domains, lifetimes and retention as
`TBD`, but those fields become mandatory gates before implementation/production.

## Open Questions

- Exact frontend/API origins and registrable domain.
- Static frontend, backend runtime and PostgreSQL providers and owners.
- TLS termination, trusted-proxy chain, WebSocket routing and distributed rate
  limit store.
- Access/refresh lifetimes, idle/absolute timeout and concurrent-session policy.
- Refresh-session metadata, retention/deletion and user-facing session controls.
- Secret store, rotation process and incident revocation owner.
- Production health/readiness, log/metric/alert, backup, RPO/RTO and restore-test
  contracts.
- Measurable browser support, accessibility target, release version and date.
