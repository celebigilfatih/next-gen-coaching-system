# Training detail heading and icons — 2026-10-20

The user requested removing the screenshot's Planlar back link and Antrenman
detayı eyebrow on `/app/trainings/cmvf4synt006n2yx4fx3ixemr`, and adding colored
icons. Both elements are removed from the shared training detail heading; the
saved training title/date and edit/delete actions remain.

Restrained Phosphor icons now distinguish title/date, saved duration, phase count,
purpose, workspace heading, tabs and phase types. Blue identifies the workspace,
amber the duration/warm-up, violet phases/tactics, green purpose/technique and
teal cooldown. Existing labels remain; decorative SVGs are aria-hidden. Shared
detail selectors keep the changes outside embedded tactical editors. The old
back-link-only styles were removed; the selected-phase kicker remains.

No API, data model, permissions, dependencies or stored records changed. Current
concurrent attendance, tactical pitch and legacy drill fixes were preserved.
The frontend AGENTS visual target records this explicit preference; no ADR needed.

## Verification

- Actual requested training: Maç günü hafif aktivasyon,25October2026 10:00,
  20minutes/4phases. The heading starts directly with the title; all four phase
  labels/icons and the selected phase remain readable.
- Authenticated desktop1440×1000 and mobile390×844 inspected; narrow320×740
  tab dimensions checked. Mobile tabs remain at least44px, with visible text
  and no internal tab overflow. At390 document scroll/client widths both375px.
  The previously documented global320px minimum/Windows scrollbar issue remains
  outside this visual refinement.
- Focused training-detail, training-board and plan-attendance:35/35 pass.
  Existing catalogue synchronization tests navigate through the memory router
  after the explicitly removed link; catalogue refresh assertions remain.
  Initial run failed only those two obsolete link interactions; final run passes.
- React Router type generation, TypeScript, scoped ESLint/Prettier, production
  SPA build and Sites worker4/4 pass. Full application suites were not rerun.
- Markdown/CDSK and whitespace checks pass. No retained data writes, board open,
  deployment, migration, commit or push were performed in this task.

Evidence: `apps/frontend/qa/training-detail-icons-2026-10-20/` contains
01-desktop.png,02-mobile-390.png and03-mobile-320.png. Ignored local logs:
`output/training-detail-icons-tests-final.log`, `output/training-detail-icons-build.log`.

Viewport override was reset; the user's requested plan remains open. Future
training details use the same shared heading and icons.
