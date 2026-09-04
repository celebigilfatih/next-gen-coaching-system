# ADR-0008: Invitation-based account lifecycle

- **Status:** Accepted
- **Date:** 2026-09-01
- **Owners / approvers:** Explicit user approval; named security owner TBD
- **Supersedes / superseded by:** Narrows the provisional registration policy in ADR-0004
- **Related:** ADR-0004, ADR-0005, ADR-0007, BL-008

## Context

ADR-0004 closed immediate privilege-escalation and bootstrap risks but deliberately
left the final account lifecycle open. The repository had no invitation, account
status, password reset, session revocation, role-change or security audit model.
An optional public registration route still created unassigned players, and the
bootstrap script could create another global administrator when one already existed.

## Decision Drivers

Least privilege, immediate revocation, single-club ownership, no repository-known
credentials, auditable privileged actions and operation without assuming an email
provider or frontend.

## Decision

- Public self-registration is not part of the MVP and is removed.
- The first `SYSTEM_ADMIN` is created only through the explicit operator script,
  using external credentials, and only when no system administrator exists.
- `SYSTEM_ADMIN` may issue invitations for any role. Every non-system invitation
  requires a club; system-admin invitations have no club.
- `CLUB_ADMIN` may invite only `COACH` and `PLAYER` accounts into its own club.
- Invitations use a cryptographically random, single-use token. Only its SHA-256
  hash is stored; the raw token is returned once to the authorized inviter. The
  invitation expires after 24 hours.
- Automated email delivery and independent email-ownership verification are `TBD`;
  token delivery is an out-of-band operator responsibility for the current MVP.
- Invitation acceptance sets the user name and a password of at least 12 characters.
- Accounts are `ACTIVE` or `SUSPENDED`. A suspended account cannot log in or use an
  existing HTTP/WebSocket session.
- Password, role, club, suspension and explicit session-revocation changes increment
  `authVersion`; JWT and Socket.IO requests compare that version with current database
  state.
- A user may belong to one club. `SYSTEM_ADMIN` has no club; every other role must
  have one in the clean baseline.
- `CLUB_ADMIN` may change `COACH` and `PLAYER` roles only inside its own club.
  Coach-owned plans/seasons must be reassigned before demotion. Tenant-linked data
  must be transferred before a club-scope change.
- `SYSTEM_ADMIN` may manage global access but cannot change its own access or suspend
  or demote the last active system administrator.
- Hard deletion is not part of the MVP. Suspension is the reversible access-control
  operation; retention/deletion policy remains `TBD`.
- Authorized administrators may issue a single-use password-reset token. It expires
  after one hour; password completion revokes existing sessions.
- Invitation, acceptance, suspension/reactivation, access changes, password changes,
  resets, session revocation and first-admin bootstrap create durable security audit
  events.

## Consequences

- `/auth/register` no longer exists and the registration environment flag is removed.
- Existing access tokens without `authVersion` are invalid after deployment.
- Account creation is unavailable until the first system admin and a club/admin
  invitation chain are established.
- No email provider is implied by the API. Raw invitation/reset tokens are sensitive
  one-time responses and must not be logged or persisted by clients.
- The legacy hard-coded sample-squad account scripts are removed.

## Verification

- Unit tests cover inviter scope, non-system club requirements, token hashing,
  cross-club suspension, last-system-admin protection, unsafe coach demotion,
  suspended login and HTTP/WebSocket session-version rejection.
- Dedicated-database E2E tests cover removed registration, scoped invitation,
  single-use acceptance, suspension, immediate JWT invalidation, reactivation,
  password reset replay protection, cross-club denial and audit events.
- The clean baseline applies to ephemeral PostgreSQL 16 and has no Prisma schema diff.

## Open Questions

- Email provider, delivery assurance and independent email verification.
- Account recovery when no eligible administrator is available.
- Security audit retention, export and tamper-evidence requirements.
- Multi-club identity and formal player transfer workflow.
