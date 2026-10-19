# Player 360 and player notes verification — 2026-09-09

## Scope

ADR-0031 / CR-023 / REQ-022 / BL-055 implement an account-independent Player
360 note workflow without enabling clinical categories or production rollout.
The legacy note model and endpoints remain untouched.

## Verified evidence

- Prisma: clean disposable PostgreSQL 16 deploy/status/diff passed after splitting
  enum creation and default capability grants into two committed migrations.
- Retained local database: additive SQL applied in single transactions and Prisma
  history recorded with exact checksums. Pre/post business counts remained
  `Person=93`, `SportingAssignment=92`, `SecurityAuditEvent=376` and
  `PlayerCoachNote=0`; new note/revision/grant tables started empty.
- Capability defaults: 12 `PLAYER_NOTE_VIEW`, 10 `PLAYER_NOTE_MANAGE` role grants
  exist after the idempotent migration inserts.
- Focused backend: DTO/mass-assignment, account-independent creation, audit-body
  privacy, stable cursor total, PLAYER denial, stale-version 409 and source-team
  share rejection pass (8 tests).
- Focused frontend: Player 360 and assignment regressions pass (7 tests), including
  localized identity, removal of raw `ORTA_SAHA`/`Kanıt yok`, and structured
  4000-character note Sheet.
- Disposable HTTP/PostgreSQL E2E passes 2/2: author/team viewer ownership,
  revision/409, explicit new-team grant, PLAYER/foreign-club denial,
  archive/restore, body-free audit and PLAYER self-scoped activity.
- Root quality passes with 54 backend suites / 720 tests, 44 frontend files / 285
  tests and 4/4 Sites packaging tests. Both builds, typecheck, lint, format, CDSK,
  125-file Markdown links and whitespace gates pass.

## Authenticated browser QA

- A disposable browser fixture supplied an account-independent player and a
  scoped coach without using or resetting retained credentials. The seed cleanup
  was corrected to preserve the newly migrated capability defaults.
- Chrome desktop at 1710×895 verified the compact identity, primary Note action,
  Overview hierarchy, localized football facts and removal of the former generic
  image/evidence repetition.
- The note Sheet, live create, action menu, archive dialog, cancel-first focus,
  archived filter and restore result passed. Activity exposes the real assignment
  with a team link; Journey alone exposes the dated history control.
- The current chosen browser surface was not programmatically resized. The
  1100/720px desktop/tablet/mobile breakpoints, full-width mobile Sheet and long
  note reflow are covered by CSS inspection and component regressions; no new
  1672×941, 1024×900 or 390×844 screenshot artifact is claimed.

## Remaining boundaries

No actionable P0/P1/P2 finding remains in the inspected desktop flow. Formal WCAG,
production rollout and exact-size responsive capture evidence remain `TBD`; these
do not authorize credential reset or production changes.
