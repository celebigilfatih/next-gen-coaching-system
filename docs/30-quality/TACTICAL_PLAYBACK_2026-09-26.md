# Tactical playback — BL-058d

Date: 2026-09-26. Tracking: ADR-0036 Accepted / CR-026 / REQ-025 / BL-058.

## Result and delivery boundary

**Pass for BL-058d, not for the whole animation feature.** The opt-in shared
editor can play its scene document using the existing Konva pitch and the
previously validated absolute-time sampler. Existing application route
containers still use V1. BL-058e resource/token/metadata integration and the
separate retained-data rollout gate remain open; V2 writes were not enabled.

No backend, schema, dependency, database, retained record, production, commit
or push changes were made in this slice. Browser QA used a dedicated synthetic
harness on port 3144, with saves only in browser memory, not the user's session.
This report does not claim that the local application on 3132 was restarted.

## Implementation

- `tactical-transport.ts`: injected monotonic clock, one cancellable RAF,
  play/pause/restart via seek, 0.5/1/2 speed and loop. Time derives from elapsed
  time, not accumulated frames. Dropped frames cannot change the target frame.
- `use-tactical-playback.ts`: subscribes to the clock store and samples V2 only;
  V1 editing is unchanged. Hidden tab, modal, pagehide and unmount pause without
  automatic resume. Reduced-motion changes pause; starting remains explicit.
- Shared editor: route/scope/permission changes interrupt playback. Preview
  renders separately from history and dirty/save state, locks editing/import/
  undo/exports/Save, and hides the Transformer. Static scene selection exits
  preview. Dirty navigation still allows saving the source and leaving.
- `playback-controls.tsx`: labelled native keyboard-operable time slider and
  speed selector, shadcn transport buttons, explicit static-scene return,
  reduced-motion explanation. Readonly viewers can play authorized documents.
- Scene strip mutation controls lock during preview; scene selection stays
  usable. Timeline preferences and interpolated frames are never persisted.

## Automated evidence

- Eight new transport tests: no autoplay, timer cancellation, 30/60Hz elapsed
  time equivalence, speed continuity, finite/clamped seek, restart, loop after
  dropped frames, exit-preview preferences and zero-duration input.
- Seven new component tests: play/edit-lock/end, original-source Save,
  pause/seek/scene selection, readonly access, visibility/modal/unmount,
  reduced-motion preference changes, slider keyboard and dirty Save-and-leave.
- Existing 24 editor tests passed alongside the initial targeted playback run;
  the final seven playback component cases also passed independently.
- Final `npm run quality`: **821 backend tests / 57 suites; 405 frontend tests /
  52 files; 4 Sites tests**. Builds, typecheck, lint, format, content validation,
  Markdown links, CDSK and whitespace gates passed. Local log:
  `/private/tmp/ngcs-playback-quality.log` (ephemeral, not a committed artifact).

## Real-browser evidence

Playwright skill/CLI, actual Konva (not the unit mock), two synthetic scenes,
22 players plus one ball, 8-second timeline. No server write requests.

| Check | Observed result |
| --- | --- |
| Fresh load | Time 0, ball `(590,400)`, status `Kaydedildi`; no autoplay |
| Loop then play then seek 4000ms | Ball `(740,400)`, exact linear frame; status remains saved |
| Return to static scene and Save | Captured scene ball x values `[590,790]`, not the interpolated 740 |
| Keyboard ArrowRight on slider | 4000 → 4001ms; ball x 740 → 740.05; focus stays on labelled slider |
| Reduced motion | Explanatory notice shown; no automatic start |
| 1672×941 | Pitch, inspector and controls separated; transport fits a row |
| 1024×900 | Controls/settings wrap; page width equals 1024 |
| 390×844 | Transport wraps, slider/time fit, scene strip scrolls internally; page width equals 390 |
| Console | 0 errors and 0 warnings at final inspection |

Local full-page captures (native viewport widths, vertically extended images):
`output/playwright/playback-2026-09-26/desktop-full.png`, `tablet.png`, `mobile.png`.
They are local QA artifacts, not required committed assets. Formal WCAG,
physical touch-device testing, measured frame-rate budgets and professional
match-day acceptance are not claimed.

### Initial QA observation

An earlier exploratory run showed a dirty board and a ball interpolation
consistent with an altered source. The cause was not established. After a
clean synthetic reload, the stepwise loop/play/seek/static-return/save flow
stayed clean and preserved source coordinates; tablet/mobile resize and keyboard
seek also stayed clean. Do not label the original observation as a diagnosed
or fixed defect. Retain this caveat for BL-058e end-to-end regression, alongside
the automated full-document source-invariance test.

## Next gate

BL-058e must connect actual drill, plan-phase and match route containers to the
document/token clients, preserve metadata/permissions/conflict drafts, exercise
club copy and snapshot independence, and verify JSON/static export plus legacy
compatibility in disposable E2E. Only then consider a separately authorized
local V2-write rollout. Offline, video export and 3D remain out of this slice.
