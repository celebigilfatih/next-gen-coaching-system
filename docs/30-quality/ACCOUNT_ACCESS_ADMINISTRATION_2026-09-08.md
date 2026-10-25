# Account Access Administration Verification — 2026-09-08

## Outcome

The user-requested permission-management surface is implemented within the
existing Accepted security model. It adds no new role or capability grant.
`SYSTEM_ADMIN` and same-club `CLUB_ADMIN` can manage account lifecycle; coaches
and players cannot open the directory or call its API.

## Evidence

- Backend: strict query parser, bounded keyset page, RepeatableRead counts and
  rows, minimum account/club projection, controller plus service role checks.
- Frontend: `/app/settings/users`, admin-only navigation/route guard, search and
  filters, invitation/access/status/reset/revoke Dialogs, one-time token result,
  technical role matrix and read-only sporting capability matrix.
- Unit: full backend and frontend quality suites include directory/parser,
  navigation, invite scope and destructive-confirmation regressions.
- Database/HTTP: fresh disposable PostgreSQL 16, six migrations, 21/21 backend
  E2E including two-club scope and negative coach access.
- Browser: authenticated disposable system-admin session at 1440×1024,
  1024×900 and 390×844. No horizontal overflow remains at 390px. Evidence is
  retained under `output/playwright/ngcs-account-access/`.
- Repository gate: 50 backend suites / 676 tests, 41 frontend files / 273 tests
  and 4 Sites tests passed with typecheck, lint, format, backend build, production
  frontend build, CDSK, Markdown links and `git diff --check`. The sandboxed
  React Router build reached prerender and could not bind `127.0.0.1` (`EPERM`);
  the same production build completed in the approved local execution context.

## Security assertions

- Client `clubId` cannot expand a club administrator's tenant.
- Directory items omit password hash, authVersion, reset/invitation tokens and
  session records.
- Existing self-management, last-system-admin, sporting-identity and session
  invalidation protections remain authoritative in the lifecycle service.
- Invitation/reset tokens are shown only once in operator mode; SMTP-mode
  responses contain no token.
- Capability grant editing is intentionally absent and needs a separate
  approved product/security decision.

## Scope and residual risk

No Prisma schema, migration, dependency, production configuration or retained
business/account data changed. Production SMTP/provider, formal WCAG target,
named product/security owner and a future capability-grant workflow remain
`TBD`. The favicon 404 observed in the disposable browser runtime predates this
surface and has no account-security effect.
