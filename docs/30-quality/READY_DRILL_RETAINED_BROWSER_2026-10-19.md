# Ready drills — retained browser verification, 2026-10-19

Verdict: **Pass** for the authorized retained A Takım → published ready exercise
→ existing training flow, including actual persistence and reopening. Two real
attachments remain in the selected existing plan.

## Scope and actual writes

The user explicitly requested browser verification for A Takım and adding ready
exercises to an existing training. Normal Chrome login used the existing saved
credentials; no password reset, injected session or alternate API was used.
The other task's Chrome tab was left untouched; this task used a separate tab.

Retained UI3132/API4000/PostgreSQL, Spor Manage / 2026-2027 / A Takım.
Existing plan: **İlk kontrol, pas ve destek açıları**, 20 October 2026 10:00 local,
ID `cmvf4syke000t2yx4u69iioue`. Two additions are intentionally retained:

| Exercise                                            | Phase     | Frozen age | Added duration |
| --------------------------------------------------- | --------- | ---------- | -------------- |
| A Takım · Koordinasyon ve Pas Akışı — Rol Senaryosu | WARM_UP   | SENIOR     | 20 min         |
| A Takım · Yönlü İlk Kontrol Elması — Rol Senaryosu  | TECHNICAL | SENIOR     | 26 min         |

The plan changed **75 → 95 → 121 minutes**, **4 → 5 → 6 phase entries**.
No new training plan, account, source-content edit or migration was made here.

## Verified browser flow

- Library source NGCS shows 48 published exact-age options for A Takım. Search
  “Koordinasyon ve Pas” returns two actual adapted exercises; selected the
  explicitly A Takım-titled version. Read organization, steps, coaching points,
  age adaptation, duration/player count/area and published source.
- “Antrenmana ekle” lists 11 existing authorized team plans. Selected the named
  existing plan, then separately clicked “Plana ekle”. Success status and the
  “Antrenmanı aç” link appeared. Plan shows 95 minutes / 5 entries, with the new
  warm-up after the original warm-up and before technical work.
- Opened the existing plan through its list after a development reload and
  normal reauthentication. It still showed 95 minutes, one copy of the exercise.
  No automatic repeat of the first write was attempted.
- Expanded the in-plan filters, searched “Yönlü İlk Kontrol”, selected the
  A Takım version. Summary shows SENIOR / 26 min / 12–22 players / 56×40 m.
  Explicit preview loads instructions, age rules and the seven-element board.
  Escape closes preview and retains the selection. Separate “Plana ekle” saves
  the technical entry and shows 121 minutes / 6 entries.
- Repeated the search: catalog total remains 2, but the already-added A Takım
  entry is absent from the selection; the distinct U18-titled exercise with its
  explicit SENIOR adaptation remains eligible. No duplicate write was made.
- Selected the saved technical phase, opened “Taktik snapshot”, then explicitly
  “Tahtayı aç”. The actual saved seven-element board/editor loaded; no edit/save
  or V2 conversion was performed.
- Week view shows the chosen event at 121 minutes and Tuesday's two trainings
  at **166 minutes** (121 +45). No duplicate event/card was created.
- After the concurrent interface update completed, normal login and list →
  detail reopening again show 121 minutes / 6 entries. Selected phase 4 resolves
  the saved A Takım instructions. The new “Taktik tahtası” tab still requires
  explicit “Tahtayı aç” and loads the same stored board. No repeat attachment.

## Persistence and preservation

Read-only PostgreSQL baseline/after comparison confirms exactly one copy of each
new exercise at its own phase's end. Source version IDs, SENIOR duration,
instruction fields and exact board snapshots are correct. The linked DayPlan's
duration is 121. Its other metadata is unchanged.

All four old PlanDrill rows, IDs, orders, notes, content/board copies and plan
title/date/ownership/purpose are byte-equivalent to baseline. Both source versions
and their source/age data are unchanged. The other 50 plans and their phases/days
remain unchanged. Baseline/after data is kept only in ignored local cache; no
credentials or sensitive records are committed. All plan writes were browser UI
operations; terminal tools performed only reads for this verification.

## Development interruption and visual evidence

Concurrent frontend work caused a reload and, later, a temporary Vite unresolved
import of `training-detail-workspace.css` while that file was being written.
No competing source changes were reverted or replaced. The new CSS subsequently
appeared. After a clean load and normal saved-credential login, the updated
training interface successfully reopened the same persisted plan and instructions.
This interruption did not duplicate or lose either attachment. The final page
is retained as a user-facing browser result.

Evidence is in `apps/frontend/qa/ready-drills-live-2026-10-19/`.
`07-plan-121.png` is the inspected clean saved result showing both additions,
121 minutes and six entries. `05-dev-reload.png` is a loading-state interruption;
`09-board-loading.png` is an intermediate paint, not proof of a rendered board;
`10-concurrent-import-error.png` records the temporary import error, not a healthy
week screenshot. Do not present those intermediate captures as successful QA.
`11-reopened-plan.png` records the updated flow/instructions after reauthentication;
`12-rendered-board.png` records the loaded saved-board editor and top of the
canvas; exact board equality is established by the persistence comparison.
Full-page captures
made at a scrolled position may place sticky chrome inside the image; the final
top-of-page capture is used for the user-facing result.
`13-final-plan.png` is the inspected clean top-of-page result: 121 minutes,
6 entries, the added warm-up and selected added technical exercise. The final
Chrome tab remains on this real plan for user review.

This task changed no runtime implementation. Report formatting and Git whitespace
checks pass. The aggregate Markdown check initially passes (159 files, zero
broken links); a later concurrent season-program documentation edit introduces
five references to its not-yet-created `SEASON_CLUB_PROGRAM_2026-10-19.md` report.
Those unrelated references are preserved; this report and its screenshot targets
exist. No green final whole-working-tree link gate is claimed. Prior automated coverage
remains in the implementation/publication reports; this report is actual retained
browser and read-only persistence evidence, not a new root-quality pass or field
suitability assessment.

The complete baseline/after preservation comparison passed twice, including
after normal reauthentication in the updated interface. A later redundant Prisma
comparison attempt stopped with `Array buffer allocation failed`; no write was
involved. Final direct PostgreSQL checks still confirm 121 minutes, six entries,
one copy of each added exercise and linked-day duration 121. The allocation error
is not reported as a successful extra comparison or diagnosed as an app defect.
