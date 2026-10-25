# Ready drill planning — retained tablet/mobile verification, 2026-10-19

User-authorized browser acceptance on canonical UI3132/API4000 and retained
`ngcs_local_session_dev`. Browser viewport checks use Chromium in the Codex
in-app browser at 1024×900 and 390×844; these are not physical-device tests.
Active scope: Spor Manage, 2026-2027, A Takım. NGCS source returns 48 compatible
published exercises; the current full catalog also contains season-program CLUB
examples. Existing-plan selection is paginated over 443 A Takım plans.

## Actual retained attachments

Existing plan `cmvf5l7tf11wv2yo4g19mx9w6`, “Hatlar arası bağlantı ve pozisyon
çalışması”, 19 May 2027 16:00 local, was selected from page one. This is a real
season plan, not a disposable fixture. Do not repeat these additions or reset it.

| Browser viewport | Published exercise                                      | Exact SENIOR duration | Saved result            |
| ---------------- | ------------------------------------------------------- | --------------------- | ----------------------- |
| Tablet 1024×900  | `ngcs-starter-v1-senior-12`, Üçüncü Oyuncu Kombinasyonu | 26 min                | 45→71 min, 4→5 entries  |
| Mobile 390×844   | `ngcs-starter-v1-senior-13`, Yönlü Sahip Olma Oyunu     | 32 min                | 71→103 min, 5→6 entries |

Both library-detail flows required explicit plan selection and a separate
attachment click. Success status and reopening the selected plan confirmed the
new duration and correct technical/tactical phase placement. Tablet plan-page
next/previous navigation preserved the selected plan. Mobile reopening of the
library attachment dialog detected the already attached exercise and disabled
`Plana ekle`; the in-plan search also excluded it while retaining the distinct
U18-authored exercise with an explicit SENIOR adaptation.

## Filters, preview and responsive fixes

- Combined query, age, difficulty, duration, player range, equipment and phase
  filters return the intended exercise. The mobile query also applies the
  `Topa sahip olma` objective. An incompatible objective returns the explanatory
  empty state; clearing filters restores results. Exact matching remains in use.
- Tablet and mobile plan-picker previews show the 32-minute SENIOR adaptation,
  organization, steps, coaching, age rules and the explicitly loaded board.
  Escape closes the preview and preserves selection; no attachment is implicit.
- Measured 40px/13px filter fields were increased to 44px/16px at tablet/mobile
  widths. Related source, phase, dialog and picker buttons use minimum 44px
  touch targets. Dialog headings reserve space for the close control.
- The mobile filter Sheet now scrolls: measured client height844/scroll height913,
  with the equipment field and clear button reachable at the bottom. Its width
  and scroll width both equal328px; the preview width and scroll width both
  equal350px, with vertical scrolling for instructions/board.
- The library hero previously extended6px past the 375px content viewport.
  A scoped mobile margin correction makes document client/scroll widths both375.
  The saved mobile plan also measures375/375; category scrolling stays inside
  its own tab container.
- Long native plan options truncate on mobile. The selected plan now has a
  separate full title, localized date/time, duration and phase-count summary
  before confirmation, including when the selected option is on another page.

Runtime changes are limited to the library Sheet class, scoped responsive CSS,
the existing attachment dialog's selected-plan summary and its regression test.
No schema, API, auth or architectural change; ADR-0039/0041 remain applicable.

## Persistence evidence

Read-only bounded PostgreSQL snapshots were captured before the first click and
after both writes. Private snapshots/assertions are under the ignored backend
`node_modules/.cache/ready-responsive-20261019/` directory; no credentials or
complete retained data are committed as QA artifacts.

Assertions pass for:

- Exactly one new row per source, source-version identity and SENIOR adaptation;
  durations26/32, frozen title/organization/steps/coaching/progressions/regressions
  and exact board equality with the published source document.
- Each added row is last in its own phase. All original four complete PlanDrill
  rows, notes and board copies remain identical; plan metadata except duration
  and update timestamp remains identical.
- Linked DayPlan duration is103; its other fields except update timestamp remain
  identical. Both source versions and all their age rows remain identical.
- The earlier desktop plan `cmvf4syke000t2yx4u69iioue` remains121 minutes/six
  entries, with its full captured phases/day unchanged. Other2059 TrainingPlan
  row count and aggregate hash remain identical during this bounded check.

The unused initial October-plan probe remains private; it was never modified.
No whole-database read into Node or inferred backfill was used.

## Evidence and limits

Screenshots: `apps/frontend/qa/ready-drills-responsive-2026-10-19/`.
`06-tablet-saved-71.png` and `10-mobile-saved-103.png` show real saved totals;
`08-mobile-filter-scroll.png` shows the bottom of the scrollable filter Sheet.
`07-mobile-preview.png` records the instructions before the final close-button
heading-padding adjustment. `09-mobile-plan-dialog.png` predates the added
selected-plan summary; do not present it as the final dialog design.
Final `12-mobile-plan-summary-final.png` was visually inspected after normal
sign-in: full selected title, 19 May 2027 16:00, 103min/six phases and duplicate-add
disabled all fit. Dialog client/scroll width357/357, height604px within844px.
`13-mobile-preview-board-final.png` and `14-tablet-preview-board-final.png` show
the explicitly opened, rendered pitch at both final widths; Escape preserves
the U18-authored alternative selection, and no additional write is made.
`15-tablet-saved-103-final.png` shows the reopened retained result after all
UI changes. IAB viewport override is reset and the103-minute plan is left open.
`01-tablet-filters.png` is an early full-page capture with a sticky-header capture
artifact; prefer the final viewport captures. Intermediate loading/error views
are not healthy acceptance evidence.

Chrome control repeatedly timed out, so verification used the authenticated IAB.
The final best-effort Chrome viewport reset also timed out; its override state
could not be confirmed. The successfully used IAB viewport was reset before this
attempt and its result tab was marked to remain open.
Concurrent development temporarily imported a not-yet-created trainings CSS file;
the other task completed it and normal sign-in recovered the page. The app's
existing memory-only session is lost by full reloads/module replacement; the
user performed normal sign-ins, and no credentials/session bypass were used.
One avoidable full-page navigation during the final check also lost that session.

Root quality was attempted and stops at its existing Windows `spawnSync npm
ENOENT` failure (BL-061). No root-gate pass or physical-device certification is
claimed. Unbounded/serial aggregate frontend runs were stopped without a result
under concurrent memory pressure; report only the completed focused checks.
The separate CDSK command also reports the previously documented missing external
validator checkout; it is not a passing check.

Completed final checks: focused ready-planning/tactical integration19/19
(two files), selected-plan regression8/8 including the new full title/time case,
React Router type generation and tsc, scoped ESLint/Prettier, production frontend
build, Sites packaging/worker4/4, Git whitespace and Markdown links163 files/zero
broken targets. The separate full frontend attempts are not reported as passes.
