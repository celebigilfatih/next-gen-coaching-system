# Tactical combined acceptance — BL-058e.4

Date: 2026-10-03. ADR-0036 / CR-026 / REQ-025 / BL-058.

## Verdict and boundary

Repository acceptance passed. V1/V2 club drill, phase snapshot and match
integration, interchange and compatibility gates are verified. Retained rollout
is **pending separate approval**, not part of this verdict. The V2 write flag
remains default-off; no retained records, schema, dependencies or runtime code
changed in this slice. No production deploy, commit or push.

Changes are acceptance tests and versioned context. This is not a professional
club pilot, formal WCAG certification, offline match-day, video or 3D delivery.

## Automated evidence

- Four common-editor regressions: JSON includes every scene without view
  preferences or dirty mutation; SVG includes only the selected static scene
  and escapes labels; malformed JSON and unknown V2 fields preserve the draft.
  Focused common-editor tests passed 28/28.
- Two parameterized HTTP flows cover V1 and two-scene V2 through JSON roundtrip,
  authorized club copy, phase attachment, explicit snapshot and match save.
  Resource tokens cannot be reused across drill/phase/match. Subsequent source
  and club-copy edits leave saved phase/match documents unchanged. Plan duration
  is unchanged; default-off still permits reads and rejects V2 writes; legacy
  writers cannot overwrite persisted V2.
- Complete disposable PostgreSQL HTTP suite: **18/18**. Existing cases include
  tenant/PLAYER/other-coach denial, revoked sources, concurrent writes, rollback,
  malformed snapshots, global editorial protection, domain and HTTP/gzip limits.
  The intentional persistence fault logs only its generic error code.
- Fresh PostgreSQL 16 on loopback 55439 / `ngcs_tactical_test`: all 11 migrations
  deployed; migration status current and schema diff empty. No retained DB.
- Root quality: **843 backend / 57 suites; 446 frontend / 55 files; 4 Sites**.
  Typecheck, lint, format, builds, CDSK and whitespace passed. After context
  updates, Markdown links and CDSK were rechecked separately.
- Logs: `/private/tmp/ngcs-tactical-acceptance-http.log` and
  `/private/tmp/ngcs-tactical-acceptance-quality.log`. The first quality attempt
  exposed test-only DOM/Node Blob typing; corrected before the successful run.

## Real browser → API → PostgreSQL evidence

Playwright CLI, actual tactics/training/match routes and React-Konva on isolated
3144, actual NestJS application on 4104, same disposable PostgreSQL. Transport
responses are not mocked. Workspace context and authenticated coach bootstrap
are synthetic; full application shell, login/password and live roster bootstrap
are **not** exercised by this harness. V2 enabled only in this temporary process.

1. Open existing V1 club drill; explicitly create two scenes. Move the second
   scene's ball from x=150 to x=450; rename it “Pas hedefi”; Save.
2. Download JSON, selected-scene PNG and SVG. JSON has both complete scenes;
   static filenames include the selected scene ID. PNG is 2400×1600 for the
   canonical 1200×800 board; shirt/number/name and the moved ball render without
   selection handles. SVG is 1200×800, contains that selected board only.
3. Attach the drill to a plan through the actual picker, explicitly open its
   phase and Save. API reports `origin: snapshot`, two complete scenes and
   unchanged 20-minute training duration.
4. Upload downloaded JSON into the actual match editor and Save. Authorized
   reads return identical two-scene documents for drill, phase and match with
   three distinct write tokens. Playback locks static export; pause remains
   preview until explicit “Sabit sahneye dön”.
5. Add a third scene to the source drill and Save. Real API returns scene counts
   **3 / 2 / 2**; phase and match remain identical, plan duration stays 20 minutes.
6. Desktop 1672×941, tablet 1024×900, mobile 390×844: actual match editor captures
   and DOM widths match each viewport (no page-level horizontal overflow).
   Drill desktop and training tablet captures inspected as well. Local equipment
   and scene-strip scrolling remains intentional; no new visual layout change.

Ignored artifacts: `output/playwright/tactical-acceptance-2026-10-03/`
(`sequence.json`, `scene.png`, `scene.svg`, `drill-desktop.png`,
`training-tablet.png`, `match-desktop.png`, `match-tablet.png`,
`match-mobile.png`, `limit-desktop.png`). DevTools messages are informational;
no application runtime error observed after the synthetic fixture was validated.

## Bounded browser observation

macOS 26.6.2, Apple M4 / 10 CPU cores / 16 GiB, Chromium 154.0.8037.93;
development build at 1672×941. Single run, not a production performance budget.

- Import 12 scenes × 125 balls = 1,500 element instances, 73,331 JSON bytes:
  116 ms until the scene-12 control is present; real canvas capture inspected.
- Apply 50 scene-title changes: median combined fill/apply wall time 51 ms.
  Undo all 50: 2,284 ms; original “Limit 1” restored. No Save performed.
- CDP heap after forced GC: before 46,035,808 bytes, imported 52,967,492,
  after history 56,558,212. Title-only edits benefit from structural sharing;
  these totals include the whole page and are not an editor memory guarantee.
- Existing validator tests cover exact 500,000/500,001 UTF-8 bytes and per-scene
  limits. This browser observation is not a 500 KB sustained-playback benchmark
  or FPS measurement. Representative hardware/workload and production FPS TBD.

## Cleanup and next gate

Only the temporary preview/backend/browser and disposable PostgreSQL container
and volume are removed. Synthetic test data is intentionally discarded; existing
local databases and application processes are preserved. Captures/logs remain.

Before retained activation: separate explicit approval; confirm exact DB/process
identity, backup and V2-aware frontend/backend versions; retain V1 read/write
smoke, choose a controlled new test record (no automatic conversion), then opt
into V2 writes. Rollback disables new V2 writes but retains V2 reads and legacy
overwrite guards. Never truncate scenes or revert to V1-only backend against V2
data. Physical touch-device, sporting pilot and match-day/offline policy TBD.
