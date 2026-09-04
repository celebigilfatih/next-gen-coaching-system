# ADR-0007: Core resource authorization matrix

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Explicit user approval; named security owner TBD
- **Supersedes / superseded by:** N/A
- **Related:** ADR-0004, ADR-0005, ADR-0006, BL-004

## Context

ADR-0005 established the global and club-scoped roles but left action-level
permissions open. Several HTTP and Socket.IO paths trusted client-supplied resource
identifiers, used token claims without reloading the current user, or lacked a
consistent club/group ownership check. Those paths could permit cross-club access
or identity spoofing.

## Decision Drivers

Least privilege, strict club isolation, one auditable authorization invariant,
negative cross-club tests and preservation of the approved narrow MVP.

## Decision

The following core authorization matrix is accepted and implemented:

| Role | Core scope |
|---|---|
| `SYSTEM_ADMIN` | Global platform administration. |
| `CLUB_ADMIN` | Manage its own club, users, groups, seasons and training plans. |
| `COACH` | Manage plans, attendance and tactical/season work only for assigned groups. |
| `PLAYER` | Read its own profile, group schedule/plans/seasons and only its own attendance. |

Additional rules:

- The JWT subject is resolved to the current database user for every authenticated
  request; stale or client-controlled role, email and club claims do not grant
  authority.
- Client-supplied club, group, user, plan or season identifiers identify a target
  only; they never establish permission.
- Core HTTP operations use a shared authorization service for club, group, plan,
  season and attendance boundaries.
- A season has required club and group ownership so coach/player assignment can be
  enforced without inference.
- Socket.IO handshakes require a JWT, join only server-derived club rooms and apply
  the same plan/player checks before broadcasting mutations.
- Health/clinical routes and advanced analytics remain outside the approved MVP and
  are restricted to `SYSTEM_ADMIN` until a separate access and privacy policy is
  accepted. Global drill mutations are also `SYSTEM_ADMIN` only.

## Consequences

- Previously public training-plan reads now require authentication.
- Socket clients must provide a bearer token in the handshake.
- Authentication performs a current-user database lookup, so deleted users and
  role/club changes take effect without waiting for token expiry.
- `Season.groupId` is mandatory in the clean baseline and season creation contract.
- Cross-club targets return forbidden or a non-enumerating not-found response,
  depending on the endpoint contract.

## Verification

- Unit tests cover current-database principals, role guards, assigned/unassigned
  coach access, player self-scope, cross-club rejection and Socket.IO spoofing.
- Dedicated-database E2E tests cover cross-club plan, group, season, attendance and
  user lookup attempts, mass-assignment resistance and legitimate same-group flows.
- The clean migration was applied to ephemeral PostgreSQL 16 and Prisma reported no
  schema difference.

## Open Questions

- Email delivery and recovery policy for the ADR-0008 account lifecycle.
- Health/clinical data access, legal basis, retention, deletion and audit policy.
- Tenant ownership for advanced analytics models.
- Production audit logging, distributed rate limiting and observability.
