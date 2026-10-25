# Controlled local tactical V2 activation

Date: 2026-10-19. ADR-0036 / REQ-025 / BL-058.

## Authorization and scope

User requested: “Taktik tahtasını kontrollü olarak etkinleştirelim.” This is
the separate local activation following repository acceptance on 2026-10-03.
Existing static V1 boards were already available; this operation enables the
existing multi-scene V2 write gate on the current Windows development instance.
No architecture, dependency, schema, role or publication contract changes.

Target: container `ngcs-postgres` / PostgreSQL 16, loopback
`127.0.0.1:5433/ngcs_local_session_dev`, backend 4000 / frontend 3132.
The retained DB still has **12 applied migrations**. The separate ready-drill
content snapshot migration is not applied by this authorization.

Ignored `apps/backend/.env` contains comments and only
`TACTICAL_V2_WRITES_ENABLED=true`. No secret is written there; database
credentials stay in process environment. `.env.example` remains false.
ConfigModule loads the file from the backend working directory; an explicit
launch environment value takes precedence. This existing flag is environment
wide: otherwise-authorized match, drill and training-phase writes are enabled,
not restricted to the pilot ID. No automatic record conversion is performed.
Global editorial remains V1-only; role/tenant/token guards remain active.

## Backup and preservation

- Before the first pilot write, PostgreSQL custom dump saved privately at
  `%LOCALAPPDATA%/NGCS/backups/before-tactical-v2-20261019.dump` (141,854 bytes).
  It is outside the repository and is not included in screenshots or logs.
- Restored successfully into newly created separate database
  `ngcs_tactical_rollout_restore_20261019`. Initial live/restored counts match:
  1 club, 10 player groups, 1 user, 36 matches, 0 drills and 0 plan phases.
- After the pilot, full-row aggregate hashes match the restored backup for
  Club, PlayerGroup, Match, Team (10), StaffProfile (30), Season (10),
  ClubSeason (1) and TeamSeason (10). Existing business records are unchanged.
- The separate restore database and container-side temporary dump are removed;
  the private Windows backup is retained. No live database reset or restore.

## Verification before activation

- Backend tactical board/document/service suites: **119/119**, 3 suites.
- Frontend shared editor/playback, match/drill integration and document API:
  **64/64**, 5 files, two workers.
- Existing guarded disposable PostgreSQL HTTP suite: **18/18** on a new
  `ngcs-tactical-rollout-test-20261019` container, loopback 55439,
  database `ngcs_tactical_test`. All 13 current migrations were deployed
  **only to this disposable DB**. The dedicated guard refuses retained targets.
- Cases include V1 compatibility, V2 read with writes disabled, disabled-write
  rejection, legacy overwrite/downgrade protection, tenant/PLAYER denial,
  source/snapshot isolation, concurrent tokens, transactional failure and byte
  limits. The expected injected failure logs only its generic persistence code.
- Disposable test container and its anonymous volume removed after completion.
  Root quality/CDSK are not claimed here; this is configuration/operations work.
  Existing Windows tooling limits remain BL-061.
- Final documentation checks: local Markdown links, report formatting and
  `git diff --check` pass. Git reports checkout LF/CRLF notices only.

Changed files for this activation: ignored backend `.env`, README, CHANGELOG,
PROJECT_BOOT, REQ-025 requirements, BL-058 backlog, CR-026 change request,
TACTICAL_ANIMATION_V2, ADR-0036 operational note, RUNBOOK, this report and
three QA screenshots. Other in-progress source changes were preserved.

## Real local pilot

The previous development backend stopped during inspection. First save returned
`Failed to fetch`; no row was created and the editor retained its draft. The
local backend was restarted with the existing compiled application and flag
false. Reauthentication was needed because development sessions are in memory.
A fresh V1 pilot save succeeded before enabling V2.

Final API process runs compiled `dist/main.js` from `apps/backend` in a managed
terminal session, with V2 loaded from `.env`; **no watch**. Source changes need
a deliberate build/restart. Frontend remains on 3132. No credentials are placed
in process arguments, repository files or this report.

1. Created one new CLUB/A Takım record through the normal authenticated UI:
   `KONTROLLÜ PİLOT · Taktik V2 · 19.10.2026`, ID
   `cmvf3z4jd00012yxw62fpw3zf`. Equipment note explicitly labels it synthetic
   and unsuitable as a sporting prescription. No player identities are attached.
2. Saved V1 with the 11-element home 4-3-3 formation; UI showed “Kaydedildi”
   and DB schemaVersion was 1. The earlier failed draft created no duplicate.
3. Enabled V2, restarted the identified local API and signed in normally.
   Reopened the V1 pilot, explicitly chose “Animasyon oluştur”, duplicated a
   scene and named the two scenes “Başlangıç yerleşimi” / “İleri çıkış · pilot”.
4. Changed player 9 from y=200 to y=360 in the second scene, retaining identity;
   first scene uses 1-second linear transition, both hold for 2 seconds.
   Explicit Save succeeded. DB confirms schemaVersion 2, two complete scenes,
   linear transition and the two distinct player coordinates.
5. Returned to the library and reopened through its real link. Both scenes,
   transition and total 5-second duration were loaded from the actual API/DB.
   Desktop saved-state screenshot inspected.
6. At 390×844, Play changed to Pause, reached 5000/5000 ms and displayed the
   second scene. Explicit “Sabit sahneye dön” restored editing. Saved status
   remained unchanged; no extra write for playback/selection/fit/inspector.
   Page width 375px with 390px viewport (native scrollbar); no horizontal page
   overflow. Scene strip/toolbox retain their intentional internal scrolling.
   Viewport override reset after inspection.

Screenshots: [desktop saved](../../apps/frontend/qa/tactical-rollout-2026-10-19/01-desktop-saved.png),
[mobile playback](../../apps/frontend/qa/tactical-rollout-2026-10-19/02-mobile-playback.png),
[mobile static](../../apps/frontend/qa/tactical-rollout-2026-10-19/03-mobile-static.png).

## Rollback and remaining gates

Set the local backend flag false (including any overriding process value),
restart only the identified API and retain this V2-aware code. Existing V2
reads and legacy overwrite guards must continue to work. The dedicated HTTP
suite verifies this behavior; the retained instance is left enabled. Do not
truncate scenes, downgrade V2 to V1 or restore the whole DB over later edits.

Production, representative sporting/hardware acceptance, physical touch device,
offline match-day, formal accessibility and production performance remain
separate. The labelled pilot is retained for review; all 36 existing matches
are untouched. No commit, push, migration, seed, professional content import
or publication was performed.
