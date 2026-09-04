# ADR-0005: Role and tenant boundary

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Explicit user approval; named owner TBD
- **Supersedes / superseded by:** N/A
- **Related:** ADR-0004, ADR-0006, ADR-0007, BL-003, BL-004, BL-008

## Context

The current Prisma role enum contains `ADMIN`, `COACH` and `PLAYER`, while several
HTTP and Socket.IO paths do not consistently enforce club ownership. A single global
`ADMIN` role creates an unnecessarily broad blast radius for ordinary club
administration. The product therefore needs an explicit platform/club boundary
before resource authorization is implemented.

## Decision Drivers

Least privilege, strict club data isolation, explicit platform operations and a
role model that can be tested with negative cross-club authorization cases.

## Considered Options

1. Keep the existing `ADMIN` role global.
2. Make every administrator club-scoped and provide no platform-wide role.
3. Separate global `SYSTEM_ADMIN` from club-scoped `CLUB_ADMIN` and keep operational
   roles scoped to their assignments.

## Decision

Option 3 is accepted:

- `SYSTEM_ADMIN` is the only global platform role.
- `CLUB_ADMIN` is limited to its assigned club and subordinate resources.
- `COACH` is limited to its assigned club and groups.
- `PLAYER` is limited to its own profile and data made available through its group
  memberships.
- Client-supplied club, group or user identifiers never grant authority by
  themselves; every protected resource operation must enforce the accepted scope.

Core action-level permissions are defined by ADR-0007. Player self-service writes,
sensitive health data access and account lifecycle operations remain `TBD` until
separately approved.

## Consequences

The clean Prisma baseline and authorization role types represent this decision. No
legacy `ADMIN` mapping was needed because the repository owner confirmed that no
database or data must be retained. ADR-0007 implements core resource authorization
and verifies it with negative cross-club tests.

## Rollout and Rollback

The schema/migration reconciliation gate in BL-003 completed through a verified
clean baseline. Core authorization rollout completed under ADR-0007. Future routes
must remain denied until their resource scope is explicit and tested. Rollback must
not collapse club-scoped administrators into an unrestricted global role.

## Open Questions

- Can one user belong to more than one club, or is membership single-club?
- Who may invite, assign, suspend or revoke each role?
- What separate access policy applies to health and clinical data?
