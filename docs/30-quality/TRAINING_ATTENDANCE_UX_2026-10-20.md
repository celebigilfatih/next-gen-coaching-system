# Training attendance UI/UX — 2026-10-20

Verdict: Pass for the attendance presentation and explicit marking controls.

## Delivery

The training detail's Katılım panel follows the compact Matches/training language:
white bordered panel, Inter heading, restrained roster count, player initials and
separated rows. Each player has a readable saved status with an icon: Katıldı,
Katılmadı or Henüz işaretlenmedi. Unmarked is not presented as absent. The full
server presentTotal/total remains authoritative; no partial-page absent or
unmarked totals are inferred.

The former whole-player toggle becomes explicit Katıldı / Katılmadı controls,
with player-specific accessible names and pressed states. Selecting the existing
status does not write. Mobile stacks the player and two equal-width 48px controls;
desktop controls are at least 44px. Names wrap. Paging is at the end of the roster;
single-page rosters omit unnecessary previous/next buttons.

The existing atomic PRESENT/ABSENT endpoint, bounded cursor reads, current page,
full totals, role boundaries and plan/scope remount remain. While saving, all
marking/paging is locked, the target row announces Kaydediliyor and the stored
status remains visible. Success re-reads the page and restores keyboard focus to
the selected control. Uncertain writes require explicit reload; successful writes
followed by read failures retry only the read. PLAYER receives static self status
without marking controls. No new dependency, API, data model, migration or ADR;
accepted ADR-0007/0019 continue to apply.

## Changed source

- `apps/frontend/src/components/plan-attendance.tsx`
- `apps/frontend/src/styles/plan-attendance.css` (scoped component styles)
- `apps/frontend/src/components/plan-attendance.test.tsx`

The previous attendance acceptance report, screenshots and unrelated working
changes were preserved.

## Verification

- Final focused frontend: 3 files / 14 tests pass, including plan-attendance,
  training-detail and attendance routes. Cases cover explicit unmarked→ABSENT,
  PRESENT→ABSENT, same-status no-op, duplicate-click serialization, pending
  controls, no optimistic status, focus restoration, full counters/cursors,
  uncertain save, post-write read failure, late scope response, real zero and
  PLAYER self read-only rendering.
- React Router type generation, TypeScript, scoped ESLint, Prettier, final SPA
  build and Sites packaging/worker 4/4 pass. Full application suites and backend
  tests were not rerun for this frontend component change.
- Actual authenticated browser checks at 1440×1000, 1024×900, 390×844 and
  320×740. At390 the two buttons measure 133.5×48px; at320 both measure106×48px
  with no internal button overflow. Tab moves from Katıldı to Katılmadı.
- Full reload and reopening Katılım retains Mert Çınar, readable Katıldı,
  selected PRESENT and1/1. Clicking the already selected control is a no-op;
  no retained attendance status was changed during design QA.
- Independent read-only assertions still find the same single PRESENT row and
  unchanged training ownership/date/18-minute phase/frozen exercise/calendar.
  Previous2060 plans/8244 phases/36 matches/3629 day records remain unchanged.
- Markdown links, CDSK and Git whitespace checks pass.

An inherited extreme-width shell constraint remains: at a320px desktop viewport
with a15px Windows scrollbar, the global body min-width320 exceeds the305px
client width. The attendance controls themselves fit without internal overflow;
390px mobile and desktop have no horizontal overflow. Global shell sizing was
outside this component change. Many-player/status/error states are covered by
the focused tests; the retained live roster contains only Mert, so visual QA did
not add synthetic teammates or change his saved status.

## Evidence and handoff

`apps/frontend/qa/training-attendance-ux-2026-10-20/` contains:
01-desktop.png,02-mobile-390.png,03-mobile-320.png,04-tablet-1024.png.
Ignored final logs: `output/attendance-ux-tests-final.log` and
`output/attendance-ux-build-final.log`. Existing ignored read-only attendance and
training-flow verifiers continue to pass.

Browser override was reset and Katılım left open. Next work can use the existing
controls for user-directed attendance; do not toggle retained records merely to
repeat screenshots or recreate the player/training.
