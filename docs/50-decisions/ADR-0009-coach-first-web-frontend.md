# ADR-0009: Coach-first web frontend and first product flow

- **Status:** Accepted
- **Date:** 2026-09-01
- **Owners / approvers:** Explicit user approval; named frontend owner TBD
- **Supersedes / superseded by:** Resolves the technology and flow questions in ADR-0003
- **Related:** ADR-0003, ADR-0007, ADR-0008, BL-005, BL-006, BL-010

## Context

ADR-0003 reserved a normal monorepo workspace but intentionally left the frontend
technology, primary persona and first product flow open. The product constitution
prioritizes the coach planning/tracking flow, and the accepted authorization model
allows an assigned `COACH` to manage seasons, training plans, attendance and match
records for its groups.

The repository has no recoverable frontend, visual design system, production hosting
contract or verified SEO/server-rendering requirement.

## Decision Drivers

The narrow MVP, the existing NestJS API boundary, coach task efficiency, explicit
tenant authorization, a small deployable client surface and repeatable frontend
quality gates.

## Considered Options

1. React and TypeScript with React Router Framework Mode configured as an SPA.
2. Next.js App Router with a second server/runtime or static export.
3. Keep the frontend stack and persona `TBD`.

## Decision

Option 1 is accepted:

- The primary persona is a team/group-assigned football `COACH`. Demographics,
  device constraints, working environment and digital proficiency remain `TBD`.
- The MVP surface is a responsive web application, with desktop and tablet as the
  first layout targets. A native mobile application is outside this decision.
- The frontend uses React, TypeScript and React Router Framework Mode with SPA mode
  (`ssr: false`) and its Vite build pipeline. npm remains the package manager.
- NestJS remains the only application backend. The frontend consumes its JSON REST
  endpoints and Socket.IO gateway; this decision adds no BFF or frontend server.
- Exact dependency versions are selected from verified stable releases during
  scaffolding and committed in the frontend lockfile; versions are not guessed here.
- The initial operational flow is invitation acceptance/login, coach weekly season
  workspace, training-plan creation, phased drill selection, attendance tracking and
  match-day tactical/opponent analysis.
- The first delivery slice centers on the weekly workspace and the plan-to-attendance
  path. Tactical analysis remains in the same navigation model and uses the authorized
  season match record instead of the standalone advanced analytics module.
- The current authentication contract remains JWT bearer authentication. The first
  client slice keeps the access token only in memory, passes it as an Authorization
  header and supplies it to Socket.IO through `auth.token`. A reload requires login.
- Persistent browser sessions, refresh tokens and secure cookie topology are `TBD`
  until deployment origins and production security requirements are approved. Tokens
  must not be logged or persisted by the initial client.
- Frontend gates are read-only lint, TypeScript checking, unit/component tests,
  production build and a browser E2E test for the approved critical path.
- Brand, visual language, component system, accessibility target and hosting remain
  `TBD` until their own evidence or approval is available.

## Consequences

The frontend can remain a static client and does not duplicate the NestJS backend.
The memory-only token reduces persistence exposure but deliberately signs the user
out on reload. Visual ideation must select a target before the application is
scaffolded. Production deployment remains blocked on hosting, persistent-session,
accessibility and operational decisions.

## Rollout and Rollback

After this ADR, three independent visual directions are presented for selection.
Only the selected direction may become the initial frontend scaffold. The first
implementation must add its own lockfile and quality scripts, preserve the backend
API boundary and avoid database changes.

Rollback removes only the new frontend application files and documentation that
depend on this ADR; it does not change the accepted monorepo topology or backend.

## Verification

- Repository product and authorization documents support the coach-first flow.
- Current REST login returns a bearer token and current Socket.IO code accepts
  `auth.token` or an Authorization header.
- Current season, plan and attendance controllers expose the approved vertical flow
  to an authorized coach.
- CDSK and local Markdown-link validation must pass after documentation updates.

## Open Questions

- Brand identity, visual design direction and component library.
- Browser/device support matrix and measurable accessibility target.
- Hosting, CDN/rewrite behavior and production frontend owner.
- Persistent session/refresh or secure-cookie design.
- Product success metrics and release date.
