# ADR-0004: Authentication and bootstrap security baseline

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Product owner / security owner TBD
- **Supersedes / superseded by:** N/A
- **Related:** `docs/10-architecture/SECURITY_MODEL.md`, BL-004

## Context

Repository audit found three immediately exploitable boundaries: public registration
accepted caller-selected privileged roles and club membership, production startup
created a repository-known administrator credential, and JWT signing/verification
used known fallback secrets. The binding account-provisioning and role/tenant matrix
remains `TBD`.

## Decision Drivers

Fail-closed production behavior, least privilege, removal of repository-defined
credentials, and preservation of a reversible path while product policy is pending.

## Considered Options

1. Keep public self-registration and its existing COACH default.
2. Disable public registration permanently and provision every account by an admin.
3. Default public registration to disabled; when explicitly enabled, allow only an
   unassigned PLAYER account. Keep privileged bootstrap as an explicit operator
   action with externally supplied credentials.

## Decision

Option 3 is accepted as the fail-closed baseline:

- `PUBLIC_REGISTRATION_ENABLED` defaults to `false`.
- An enabled public registration cannot accept `role` or `clubId` and always creates
  `PLAYER` with no club assignment.
- Production requires a non-placeholder JWT secret of at least 32 characters.
- Development/test may use a process-local random secret when none is configured.
- Application startup does not run seed data.
- Manual bootstrap admin creation requires external email/password values; no
  repository-defined credential is used.

ADR-0008 supersedes this ADR's provisional registration behavior and defines the
final MVP invitation, club assignment, role change, revocation and first-admin
lifecycle. The JWT secret and no-known-credential baseline here remains binding.

## Consequences

Existing clients relying on anonymous COACH registration no longer work. Enabling
registration is an explicit deployment choice. Development tokens become invalid
after restart when an external secret is not configured. Existing deployed accounts
or secrets are not automatically rotated and require an operator audit.

## Rollout and Rollback

Deployments must supply `JWT_SECRET`. Public registration is removed by ADR-0008.
Before rollout, audit existing ADMIN/COACH accounts and rotate prior JWT secrets.
Rollback may restore the previous application version but must not restore known
credentials or secret fallbacks.

## Open Questions

- Which email provider and verification assurance will deliver invitations?
- What account-recovery process applies when no eligible administrator is available?
