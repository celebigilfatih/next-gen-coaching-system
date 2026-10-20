# Runbook

## Windows root quality — 2026-10-19

Use `node scripts/quality-gate.mjs`, or append `--continue-on-error` to attempt
every stage while retaining a failing exit status. Root npm12.2.0 is lockfile
pinned; if npm is absent globally, bootstrap root dependencies through existing
pnpm: `pnpm dlx npm@12.2.0 ci --ignore-scripts`. Use a Node version supported by
that npm release (actual24.19.0). No global install is required.

Quality Prisma generation/typecheck/build use a separate ignored client and
build cache; do not stop another task's API or overwrite its locked engine DLL.
Normal runtime generation/build commands retain their roles. Git text uses LF;
Prettier accepts the current checkout's EOL without a bulk rewrite.

CDSK defaults to tracked `scripts/cdsk/validate_project.py` under ADR-0046.
Run `node scripts/validate-cdsk.mjs`; no sibling checkout/network is needed.
Python 3.9+ with its standard library is required. `PYTHON` may name an interpreter
executable; bundled Windows Python/py and POSIX python3 are supported. Explicit
`CDSK_VALIDATOR` overrides remain available; missing/failed overrides fail without
fallback. [Profile](../30-quality/CDSK_0_1_0_PROFILE.md) defines the actual checks;
[verification](../30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md) records results.
Earlier external-validator absence/npm ENOENT entries are historical.
[Evidence](../30-quality/QUALITY_GATE_WINDOWS_2026-10-19.md).

## Current local persistent sessions — 2026-10-19

User requested the reload logout fix. Existing ADR-0018 is now enabled in ignored
`apps/backend/.env` (`PERSISTENT_SESSIONS_ENABLED=true`, exact
`FRONTEND_ORIGIN=http://localhost:3132`) and `apps/frontend/.env.local`
(`VITE_PERSISTENT_SESSIONS_ENABLED=true`, API base `http://localhost:4000`).
Preserve both flags together when restarting local services; examples remain
default-disabled and production is a separate rollout gate. Existing retained
RefreshSession migration is applied; no new migration/seed/reset is needed.

The first login after activation establishes the HttpOnly refresh cookie. Full
reloads and a new tab then restore the session through the existing bootstrap;
do not store bearer tokens in localStorage/sessionStorage. Logout/revocation and
7-day idle/30-day absolute expiry still end sessions. Use localhost consistently.
Earlier entries describing disabled flags or memory-only reload behavior are
historical observations superseded by this local activation.
[Evidence](../30-quality/SESSION_PERSISTENCE_LOCAL_2026-10-19.md).

## Fixture-aware A Takım updates — ADR-0042

Maçlar → maç detayı → Tarih ve saati düzenle. Enter Turkey local date/time and
save. The existing match update synchronously adapts enrolled SENIOR weeks around
old/new dates and adjacent preparation/recovery. Result shows updated, added,
retired and protected counts. Same timestamp retries do not repeat planning.
Analysis/board drafts are independent; PLAYER has no schedule control.

An edited day/plan/phase/exercise protects the entire event. Manual deletion and
explicit template exclusions remain protected and are not recreated. Past,
completed, attendance-bearing and multiply linked sessions remain. A new conflict
or unsupported template rolls back both match and program with an explanation;
resolve the conflict rather than deleting automation/audit markers. Unenrolled
programs report that existing plans were not changed. No automatic academy updates.

ADR-0047 now supports five SENIOR fixtures in both fresh preview/apply and enrolled
date updates. Actual kickoff intervals up to120 hours reduce intervening days to
one physical session, a combined briefing and afternoon rest. Explicit preview
times pin, alongside all later manual changes. Six-or-more fixtures, same-day
or sub24-hour intervals remain manual. No new enrollment or migration is needed;
old fingerprints stay valid. Rehearsal uses fresh before-two-match-20261019.dump
restored to ngcs_two_match_restore_test on loopback5433, API4014/UI3500. Existing
36 retained dates are unchanged. [Two-match evidence](../30-quality/TWO_MATCH_PROGRAM_2026-10-19.md).

Three-match rehearsal follows fresh private before-three-match-20261019.dump
restored into ngcs_three_match_restore_test. Only this copy moves sample fixtures
to22 October16:00 and23 October18:00 before25 October16:00. Intervals26/46 hours
use short matchday activation and Saturday recovery30/combined briefing15.
No new enrollment or migration;41 retained checkpoints remain valid. API4000
served V4 at that release; keep DB URL in process env and preserve
ignored auth/tactical flags. [Evidence](../30-quality/THREE_MATCH_PROGRAM_2026-10-19.md).

Four-match rehearsal uses fresh private before-four-match-20261019.dump restored
to ngcs_four_match_restore_test. Only this copy moves existing sample matches
to20Oct16:00,22Oct16:00,23Oct18:00 before25Oct16:00, creating48/26/46-hour gaps.
Wednesday/Saturday recovery30 and combined briefings15 follow the existing presets.
That release served V5;41 retained enrollments and36 actual fixture dates stay.
[Evidence](../30-quality/FOUR_MATCH_PROGRAM_2026-10-19.md).

Five-match rehearsal follows fresh before-five-match-20261019.dump restored into
ngcs_five_match_restore_test. Only this copy moves four sample fixtures, giving
19Oct16,20Oct16,22Oct16,23Oct18,25Oct16 (24/48/26/46-hour gaps). Wednesday/Saturday
recovery30 and briefings15 coexist with the protected121min manual plan. API4000
now serves V6; no migration/re-enrollment/retained fixture edit is required.
[Evidence](../30-quality/FIVE_MATCH_PROGRAM_2026-10-19.md).

New SENIOR program applications enroll automatically in their transaction.
Known existing Spor Manage local rollout uses guarded
`apps/backend/scripts/enroll-spor-manage-automation.js` after backend build:check.
Supply DATABASE_URL and existing SYSTEM_ADMIN via NGCS_WEEK_ACTOR_EMAIL in the
process environment. Default dry-run. Write requires `--apply` and
NGCS_ENROLL_FIXTURE_SYNC=true. Only loopback5433 ngcs_local_session_dev or exact
ngcs_fixture_sync_restore_test; production/connection overrides excluded.
Unknown legacy origin is never adopted; original request/fixture/field checks
are required. Fully enrolled replay remains a no-op after legitimate reschedules.

Private backup `%LOCALAPPDATA%/NGCS/backups/before-fixture-sync-20261019.dump`
restored to ngcs_fixture_sync_restore_test before activation. Both restored and
retained enrollment appended41 immutable checkpoints, adopted631 original events
and protected2 edited events. All24415 prior rows across44 tables remained identical;
no business row or actual retained fixture changed. Retained replay changes none
of24456 rows. No migration;14 applied migrations remain. Keep checkpoints and
existing request/slot audits under retention. Root Windows/CDSK tools remain BL-061.
[Evidence](../30-quality/FIXTURE_PROGRAM_SYNC_2026-10-19.md).

## Season program extension — 2026-10-19

Explicit subsequent user request authorizes the whole Spor Manage 2026-2027
season, including past weeks. Run backend `build:check`, then guarded
`apps/backend/scripts/apply-spor-manage-season.js` with DATABASE_URL and the
existing admin in NGCS_WEEK_ACTOR_EMAIL supplied through process environment.
Default is dry-run. Writes require `--apply` and NGCS_APPLY_SEASON_PROGRAM=true.
Only PostgreSQL loopback port5433 / ngcs_local_session_dev or the named
ngcs_season_program_restore_test is accepted; URL overrides/production excluded.

Preflight all41 Monday weeks/410 team-week slots. Already applied slots, including
the initial19–25 October week, are preserved. Boundary rows before14 August or
after23 May are clipped. Any overlap or unsupported template blocks before the first
write. Each week commits atomically using existing product permissions/locks;
the season can be partially completed if interrupted. Re-run resumes using stable
request IDs and slot markers without overwriting completed weeks. No migration.

Fresh private backup: `%LOCALAPPDATA%/NGCS/backups/before-season-program-20261019.dump`;
restored to ngcs_season_program_restore_test before retained application. Preservation
compares hashes of every original row across44 tables, without printing content.
Old user-edited sessions need not have four phases; validate four-phase/age/school
rules only on this operator's generated sessions. At this stage fixture changes
needed coach review; ADR-0042 now provides guarded synchronous updates for enrolled
SENIOR programs. Do not delete audit markers to force regeneration. New events
remain editable example club content, never completed performance or global release.
[Evidence](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

## Weekly program and approved local rollout — 2026-10-19

Hafta → Haftalık program hazırla selects only management-authorized teams for the
active ClubSeason. Review age profiles, matches, times and expanded phase notes;
exclude rows/change times then refresh preview before applying. Existing records
remain. Any changed calendar, overlap or previously applied team/week blocks
application. Two-or-more-match weeks require manual events. Event creation supports
training/recovery/tactical, meeting agenda and rest; physical detail keeps existing
plan lifecycle. Permanent delete requires the explicit confirmation dialog.

After an uncertain response, use result check or retry the identical request.
The URL contains only planningRequest UUID; reload queries the result. A missing
result permits reentry using the same ID. Never create a fresh ID to bypass409.

The user's full-plan approval covered the exact weekly audit enum migration and
19–25 October Spor Manage application after isolated verification. Private backup:
`%LOCALAPPDATA%/NGCS/backups/before-week-planning-20261019.dump`. Restored to separate
`ngcs_week_planning_restore_test`, migrated, schema diff empty and browser-tested.
ADR-0039's snapshot migration had already been applied by the separate authorized
work; this task deployed only `20261019020000_add_week_planning_audit` through an
ignored staging set of13 applied migrations plus that exact file. Retained now14.

Guarded operator `apps/backend/scripts/apply-spor-manage-week.js` uses the same
product service and defaults to dry run. First run backend build:check; provide
DATABASE_URL and NGCS_WEEK_ACTOR_EMAIL through process environment. Only loopback
ngcs_local_session_dev or the named restore-test DB is accepted, never production.
Apply requires `--apply` plus NGCS_APPLY_WEEK_PROGRAM=true. It validates the exact
club/ten ages/existing sample fixture and preserves existing matches/accounts/
people/grants. Fixed request ID makes unchanged replay write nothing.

Approved retained result:51 physical plans/204 phases,13 meetings,26 rest rows,
90 DayPlans,20 season-relative WeekPlans. Existing36 matches,1 account,30 staff
people and0 grants remain. Re-running returns unchanged-replay. Global starter
publication and tactical activation are independent concurrent work, not this
program's source/approval. Canonical API4000/UI3132 remain; QA4013/3135 is separate.
[Evidence](../30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).

## Ready drill plan snapshots — retained publication complete, 2026-10-19

Responsive retained acceptance additionally modifies A Takım plan
`cmvf5l7tf11wv2yo4g19mx9w6`,19 May2027 16:00: senior-12 technical26 and
senior-13 tactical32, total103min/six entries; linked day103. Preserve these
authorized additions and the earlier121-minute desktop plan. Tablet1024/mobile390
filters/preview/selection/add verified. The mobile filter Sheet scrolls; confirm
the full selected-plan title/date/time below a truncated native option before
attachment. Use SPA links during manual QA: existing memory-only sessions are
lost by full reloads, and user sign-in may be needed after concurrent HMR.
[Responsive evidence](../30-quality/READY_DRILL_RESPONSIVE_BROWSER_2026-10-19.md).

The separately requested retained browser check added senior-04 (20min warm-up)
and senior-06 (26min technical) to existing A Takım plan
`cmvf4syke000t2yx4u69iioue`,20 October10:00. Current total121 minutes /6 entries;
linked day121, Tuesday166. These are authorized retained additions; do not replay
or seed/reset the plan. Original four rows and other50 plans are preserved.
[Browser verification](../30-quality/READY_DRILL_RETAINED_BROWSER_2026-10-19.md).

Separate user approval was received for migration, import and publication.
The exact snapshot migration is applied to `ngcs_local_session_dev` (13 total);
120 drafts imported, replay 0 created / 120 skipped. Private backup restored
successfully in a disposable DB; 38 business-table fingerprints and the original
V2 pilot remain identical. The weekly audit migration was excluded from this
operation; it was subsequently applied by the separate weekly task (14 migrations
now), whose new plan/calendar/drill rows were preserved. All 1,020 pre-publication
rows still match outside approved publication fields. Existing running API/client already include this feature, so no restart
or environment-file change was necessary. Publication permission and Fatih
Çelebigil's named approval are recorded. The user then explicitly accepted
ADR-0041's local same-account exception; all 120 are now PUBLISHED. Maintenance
tests 10/10, a new private pre-publication backup/restore and 43-table preservation
pass. Replay writes zero. Runtime API guards remain unchanged.
[Publication evidence](../30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

Maintenance CLI (backend working directory):

```text
node scripts/publish-local-starter.js --actor-email <existing-active-system-admin>
```

Default is read-only. A completed release reports alreadyPublished 120. Apply
additionally requires process-only `NGCS_ALLOW_LOCAL_STARTER_PUBLICATION=true`,
`--apply --approval-reference ADR-0041:user-local-120-exception:2026-10-19`,
Accepted ADR and exact retained loopback target. Only unchanged first versions
and exact manifest are accepted. No automatic retry; verify ambiguous outcomes
with the default read-only command. Do not reuse this exception for future content.
Test mode requires `NGCS_STARTER_PUBLICATION_TEST=true` and accepts only the
separate `ngcs_starter_publication_test` database; never point tests at retained DB.
Run standalone tests with `node --test scripts/publish-local-starter.test.js`;
integration requires `NGCS_STARTER_PUBLICATION_TEST_URL` pointing to that newly
created empty test database with the approved migrations. Existing fixture data
is refused rather than reset. Tests never claim real expert approval.

ADR-0039 adds only PlanDrill.contentSnapshot through
`20261019010000_add_plan_drill_content_snapshot`. Dedicated clean/legacy DBs,
schema parity, idempotent DRAFT import and real HTTP/browser flows are verified.
Do not include this migration in another feature's retained approval.

For future rollout/recovery: back up the named retained DB, rehearse restore,
verify the exact pending migration set, deploy only the reviewed set, regenerate
the Prisma client and restart the API. Never kill another task's API to replace
a locked Windows engine DLL. Validate existing rows remain NULL and old plan,
attendance and board flows still work. Import the existing manifest only as
DRAFT using the existing guarded importer/active SystemAdmin actor; repeat import
must create zero records. Future publication requires the normal expert reviews;
ADR-0041 is only the explicitly approved retained initial-package exception.

On this Windows computer exercise count was 0 at initial implementation and 1
synthetic CLUB pilot before this rollout; it is now 121 including 120 published originals.
Earlier 2026-09 import evidence concerns the previous machine. For other releases appoint a real
independent football reviewer; inspect instructions, diagrams and every age
variant. Submit/review all 120 through existing capabilities. The first release
uses SystemAdmin `POST /drills/content/starter-pack/publish`; it fails atomically
unless all 120 stable manifest identities have independent APPROVED versions.
Individual first-release publication is rejected. Normal non-starter publication
continues to use the existing endpoint. Never turn synthetic test approvals into
retained expert evidence.

When an administrator creates a plan, choose an active COACH account in the
selected club. The paginated account selector sends the existing clubId/coachId
fields. Sporting staff assignments alone do not create those accounts or grants;
if none exist, the form explains the missing prerequisite. COACH users retain
server-derived ownership. Do not invent a coach or promote a retained account.

QA used separate `ngcs_ready_drills_test`, `ngcs_ready_drills_legacy_test`
and API4012/UI3500. Root Windows tooling limitations are BL-061.
[Evidence](../30-quality/READY_DRILL_PLANNING_2026-10-19.md).

## Guided club setup and approved branding rollout — 2026-10-19

SYSTEM_ADMIN opens Ayarlar → Yeni kulüp kur (`/app/setup`). Steps: club/logo/two
colors → season → A Takım/academy → optional technical staff → final review.
Only final submission writes; account invitations remain separate. Existing
Spor Manage is already configured; do not create it again through this new-club
flow. Changing branding for an existing club is a separate future edit surface.

Logo sources PNG/JPEG/WebP up to 2 MiB are prepared locally to max 512px/48KiB.
Payload and person drafts remain in memory. Reload discards an unsent draft;
a submitted URL retains only opaque requestId for durable result lookup.
On uncertain network outcome, check result or retry the identical request;
do not start a different request to bypass a conflict.

The exact `20261019000000_add_club_brand_colors` migration was explicitly
approved and applied only to `ngcs_local_session_dev`. Pre-rollout private dump:
`%LOCALAPPDATA%/NGCS/backups/before-branding-20261019.dump`. Restore rehearsal
used separate `ngcs_branding_restore_test`; migration/status/schema-diff passed
before retained rollout. This slice applied 12 migrations total. Independently
added migrations from concurrent work require their own approval/rollout; never
run an unreviewed blanket deploy just to clear status.

Disposable wizard browser QA used backend 4010/frontend 3134 and
`ngcs_club_setup_wizard_test`; retained canonical ports remain 4000/3132.
No retained club seed/reset, account/grant or production rollout is part of QA.
On Windows, Prisma engine DLL regeneration may require stopping the owning API
process first. Restart invalidates process-secret access tokens when persistent
sessions are off; sign in normally rather than resetting the account.

Root `quality` currently stops with `spawnSync npm ENOENT` on this computer;
run workspace scripts via `pnpm --package=npm@12.2.0 dlx npm --prefix ...`.
Raw Prettier LF policy conflicts with the CRLF checkout; record EOL-auto checks
separately. External `../cdsk` validator is absent. BL-061 tracks portability;
these limitations must not be reported as a passing root quality/CDSK gate.
[Detailed evidence](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

## Spor Manage retained local fixture — 2026-10-19

The user-approved setup now exists on this Windows computer: Spor Manage /
2026-2027, A Takım and every age U8–U16, three example technical staff per team
and 36 explicitly sample A Takım fixtures. The original blank-start description
below is historical. [Sources and verification](../30-quality/SPOR_MANAGE_LOCAL_SETUP_2026-10-19.md).

`apps/backend/scripts/setup-spor-manage-local.js` is operator-only and dry-run
by default. It requires the current backend build, DATABASE_URL and
`NGCS_SETUP_ACTOR_EMAIL` in process environment. It accepts only loopback
`ngcs_local_session_dev` or dedicated `ngcs_spor_manage_setup_test` and rejects
production. Apply requires `NGCS_ALLOW_LOCAL_CLUB_SETUP=true`; ordinary server
startup must not invoke this fixture. Retained replay returned no creates;
conflicts abort rather than overwrite manually edited records. No login, grant,
medical field, player roster or external message is created.

Dedicated verification command, after applying tracked migrations to the newly
created empty `ngcs_spor_manage_setup_test` database, uses an explicit
`NGCS_SETUP_TEST_DATABASE_URL` and:

```powershell
node --test apps/backend/scripts/setup-spor-manage-local.test.js
```

That test requires an empty dedicated database, creates its own non-login
operator and injects a conflict by modifying/deleting its own disposable rows.
Never point it at retained data. Product wizard remains Proposed in ADR-0037;
this script is not a public setup API.

## Windows local environment — 2026-10-19

This computer uses a separate, user-approved fresh PostgreSQL 16 database:
container `ngcs-postgres`, named volume `ngcs_windows_pgdata`, loopback
`127.0.0.1:5433`, database `ngcs_local_session_dev`. At initial startup all 11
migrations were applied with empty schema diff. The separately approved branding
migration brought the retained target to 12; the separately approved ready-drill
snapshot migration then brought it to 13 (see latest rollout above). The first local
SYSTEM_ADMIN was separately approved and browser login verified. Its password
is not stored in repository files. No club, season, team or drill content was
seeded. Records documented on the previous computer are not transferred by Git.

Node 24.19.0 is available through the Codex runtime. There is no global `npm`
command here; `pnpm --package=npm@12.2.0 dlx npm` supplies the npm CLI without
changing project manifests or lockfiles. Backend/frontend `npm ci` completed;
Prisma Client was explicitly generated. Root dependencies are not installed.

Restart the existing database with `docker start ngcs-postgres`. In separate
PowerShell terminals, use the documented DATABASE_URL for this local container
through process environment, then start the already installed services:

```powershell
# apps/backend; set DATABASE_URL in this process first, without logging it.
$env:NODE_ENV = 'development'
$env:FRONTEND_ORIGIN = 'http://localhost:3132'
pnpm --package=npm@12.2.0 dlx npm run start:dev

# apps/frontend, in a separate terminal
$env:VITE_API_BASE_URL = 'http://localhost:4000'
pnpm --package=npm@12.2.0 dlx npm run dev
```

Both persistent-session flags stay off. Tactical V2 was separately activated
on this Windows local environment on 2026-10-19; see the rollout section below.
Reload therefore requires login again. The backend uses its existing
development JWT-secret behavior; no JWT secret was written to disk. Stop
the dev servers with Ctrl+C; stop only this database with
`docker stop ngcs-postgres` when needed. Preserve its named volume. Do not
reapply bootstrap, migration, seed or reset as part of ordinary startup.
Full quality was not rerun for startup; the sibling CDSK validator is absent
on this computer. Browser dashboard correctly shows missing club/team context
until separately chosen initial setup or a supplied backup.

## Tactical V2 rollout guard — BL-058b

`TACTICAL_V2_WRITES_ENABLED` defaults to false; only exact `true` enables new
V2 writes on the dedicated document PUTs. Leave it off in retained/production
environments until the scene editor, integrated UI/QA and explicit rollout
gate are complete. No migration is needed for this slice.

Rollback disables new V2 writes but MUST retain V2 GET support, token checks
and legacy overwrite/read guards. Never downgrade an existing V2 record to
V1 or deploy a V1-only backend over data containing V2. The feature flag is
not a substitute for role/tenant checks. Global editorial remains V1-only.
[Verification and disposable test guard](../30-quality/TACTICAL_V2_API_2026-09-19.md).

### Approved Windows local activation — 2026-10-19

User requested controlled activation. Exact target: `ngcs-postgres`, loopback
`127.0.0.1:5433/ngcs_local_session_dev`, API 4000 / UI 3132. The ignored
`apps/backend/.env` contains only `TACTICAL_V2_WRITES_ENABLED=true`; database
credentials remain in process environment. Start from `apps/backend` so
ConfigModule reads that file. Process environment takes precedence: an explicit
`false` there still disables writes. The final API runs the existing compiled
`dist/main.js` in a managed terminal session, without watch; source changes
require a deliberate build/restart. No migration, seed, bulk conversion or
production activation accompanies this operation.

Private pre-activation dump:
`%LOCALAPPDATA%/NGCS/backups/before-tactical-v2-20261019.dump`. Restore rehearsal
used the separate `ngcs_tactical_rollout_restore_20261019` database. A single
new CLUB drill labelled `KONTROLLÜ PİLOT · Taktik V2 · 19.10.2026` was saved as
V1, explicitly converted, then saved/reopened as two-scene V2. The existing
environment-wide flag also permits normal authorized V2 writes to matches and
training phases; it is not a per-record allowlist. Existing records are never
automatically converted.

Rollback: set `TACTICAL_V2_WRITES_ENABLED=false` in the local backend file and
any overriding launch environment, then restart **only the identified API**.
Keep the current V2-aware application and stored pilot; verify V2 reads still
work and new V2 writes fail. Do not reset the DB or restore the entire backup
over subsequent user edits. Disposable HTTP tests cover this rollback behavior.
Production and a representative sporting/touch-device pilot remain separate.
[Activation evidence](../30-quality/TACTICAL_LOCAL_ROLLOUT_2026-10-19.md).

## Professional drill starter pack

- Salt okunur doğrulama: `npm run content:drills:validate`.
- Manifest yeniden üretimi: `npm run content:drills:generate`; sonuç tekrar
  validator'dan geçmeli ve review diff'i incelenmelidir.
- Import varsayılan olarak dry-run'dır. Yazım yalnız açıkça disposable/onaylı
  hedefte `NGCS_ALLOW_CONTENT_IMPORT=true` ve aktif SystemAdmin e-postasıyla
  `npm --prefix apps/backend run content:drills:import -- --apply --actor-email <email>`
  biçiminde çalıştırılır.
- Import kayıtları `DRAFT` bırakır. Reviewer `TBD` ise submit/approve/publish
  operasyonu yapılmaz. Production veya retained local import ayrı açık onaydır.

## P0.1b compatibility rollout

Requires the existing six migrations, including sporting foundation. Pause old
group/season/member writers while rolling out the adapter. After migration/backfill
and application switch, an authenticated SYSTEM_ADMIN or own CLUB_ADMIN calls
`GET /sporting/legacy-parity?clubId=...`; require IN_SYNC with all counts zero.
Verify membership add/remove, historical roster denial after revocation, workspace
scope changes and old training/match flows. The approved local target
`ngcs_local_session_dev` completed this rollout on 2026-09-06 after a private
backup/restore rehearsal: six migrations current, both clubs IN_SYNC, legacy
rows unchanged, retained-session browser smoke passed. Production is not deployed.
See [local evidence and backup location](../30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).

If parity is DRIFT, retain the data and investigate the exact mapping. Do not
reseed, delete history or restore revoked role grants. Application rollback keeps
all sporting tables but old writers no longer synchronize them; close sporting
reads/writes until a reviewed forward repair and parity check succeeds. See
[compatibility contract](../10-architecture/P01B_COMPATIBILITY_CUTOVER.md).

## Prerequisites

- Node.js/npm sürüm politikası `TBD`; package dosyalarında `engines` alanı yok.
- PostgreSQL; Docker Compose imajı `postgres:16-alpine`.
- Backend için `DATABASE_URL` ve production'da güçlü `JWT_SECRET`.

## Setup and Start

```bash
cd apps/backend
npm ci
npm run prisma:generate
npm run start:dev
```

Repository-wide non-destructive kalite kontrolü kökten çalıştırılır:

```bash
npm run quality
```

CDSK için repository içi doğrulayıcı varsayılandır; dış checkout gerekmez.
E2E bu komuta dahil değildir; dedicated database ve açık reset
onayı gerektiren `npm run test:e2e` ayrı çalıştırılır.

Varsayılan backend portu `4000`. Uygulama container'ı migration çalıştırmaz.
ADR-0017 uyarınca Compose backend servisi Dockerfile'ın `runtime` target'ını
kullanır. Bu target yalnız production/serving bağımlılıklarını, derlenmiş uygulamayı
ve üretilmiş Prisma Client'ı taşır; Prisma CLI, migration/source ağacı, test/build
araçları ve seed scriptlerini taşımaz.

İlk `SYSTEM_ADMIN`, yalnız veritabanında hiç sistem yöneticisi yokken ve migration
uygulandıktan sonra explicit operator adımıyla oluşturulur. Credential komut
geçmişine veya repository dosyasına yazılmaz:

```bash
DATABASE_URL=... BOOTSTRAP_ADMIN_EMAIL=... BOOTSTRAP_ADMIN_PASSWORD=... node ensure-admin.js
```

Sonraki tüm hesaplar authenticated invitation API'siyle oluşturulur. Development/test
varsayılanı `ACCOUNT_DELIVERY_MODE=operator` olup ham invitation/password-reset
tokenı `Cache-Control: no-store` taşıyan yetkili yanıtta bir kez gösterir; loglanmaz.
Production yalnız `smtp` kabul eder. `ACCOUNT_PUBLIC_BASE_URL`, SMTP host/port,
secure seçimi ve gönderici zorunludur; credentials birlikte sağlanır, timeout
varsayılanı 10 saniyedir. Provider/account/domain ve secret injection sahibi M4'te
`TBD`dir. SMTP kabulü inbox teslim garantisi değildir.

Public linkler `/accept-invitation#token=...` ve `/reset-password#token=...`
biçimindedir. Frontend fragment'ı belleğe aldıktan sonra URL'den kaldırır. Anonim
“parolamı unuttum” akışı yoktur; reset issuance hâlen yetkili admin işlemidir.

## Controlled Migration Deployment

`npm run prisma:migrate:deploy` yalnızca ADR-0006 koşulları sağlandığında ayrı bir
deployment adımı olarak çalıştırılır. Ön koşullar:

- hedef environment ve veri sahibi doğrulanmış;
- backup ve restore provası kanıtlanmış;
- migration SQL'i review edilmiş ve izole PostgreSQL üzerinde denenmiş;
- rollback/uyumluluk penceresi onaylanmış.

ADR-0017 kapsamında komut aynı revision ve lockfile'dan üretilen ayrı `migrator`
artifact/job içinde çalıştırılır; serving runtime'a migration credential ve Prisma
CLI verilmez. Yerel Compose doğrulaması için:

```bash
docker compose --profile operations run --rm migrator
```

Migrator'ın ikinci çalışması beklenen biçimde `No pending migrations to apply`
döndürmelidir. Production'da runtime ve migrator için ayrı en-az-yetkili DB rolleri,
job retry/failure politikası ve gözlemlenebilirlik sahibi `TBD`.

Bu koşullar sağlanmadan aşağıdaki komut çalıştırılmaz:

```bash
cd apps/backend
npm run prisma:migrate:deploy
```

## Stop and Recovery

### Break-glass system-admin recovery (ADR-0020)

Önce additive `20260906010000_add_system_admin_recovery_audit` migration'ı ayrı
migrator kapısıyla uygulanır. Komut yalnız checkout/maintenance ortamındadır;
serving runtime image içinde bulunmaz. Hedef mevcut `SYSTEM_ADMIN` olmalı, yeni
parola en az 12 karakter ve approval referansı tek satır/1–200 karakter olmalıdır.
Değerleri shell history, ticket çıktısı veya repository dosyasına yazma:

```bash
DATABASE_URL=... \
RECOVERY_ADMIN_EMAIL=... \
RECOVERY_ADMIN_PASSWORD=... \
RECOVERY_APPROVAL_REFERENCE=... \
RECOVERY_CONFIRM=RECOVER_SYSTEM_ADMIN \
npm run recover:system-admin
```

Başarılı işlem hesabı `ACTIVE` yapar, authVersion'ı artırır, bütün açık refresh
session/reset tokenlarını iptal eder ve token/PII içermeyen audit kaydı yazar.
Komut yalnız sabit başarı/başarısızlık mesajı verir. Approval referansının kaynağı,
iki-kişi onayı, DB maintenance rolü ve prova sahibi `TBD`dir; production'da bu
girdiler onaylanmadan çalıştırılmaz.

### Opt-in persistent sessions (ADR-0018)

Önce `20260905000000_add_refresh_sessions` migration'ını ayrı migrator adımıyla
uygula. Yeni backend, feature kapalı olsa da lifecycle revocation için bu tabloyu
kullanır. Her iki flag varsayılan kapalıdır. Yalnız doğrulanmış yerel/test ortamında:

```bash
# Backend ortamı (örnek development origin):
PERSISTENT_SESSIONS_ENABLED=true
FRONTEND_ORIGIN=http://localhost:3132
# Frontend build/dev ortamı:
VITE_PERSISTENT_SESSIONS_ENABLED=true
```

Production `FRONTEND_ORIGIN` tam HTTPS origin olmalıdır; path, wildcard ve eksik
origin reddedilir. Production cookie `__Host-ngcs_refresh`, localhost test cookie
`ngcs_refresh` adını kullanır. Aynı localhost host'undaki farklı portlar cookie
paylaşır; E2E ayrı browser context kullanır, kişisel browser oturumuyla karıştırma.

Access 15 dakika, refresh idle 7 gün ve absolute 30 gündür. Yeni login beş aktif
family sınırında en eskiyi düşürür. İptal/expiry kayıtları 30 gün sonra startup,
saatlik ve login temizliğine girer; başarısız cleanup yalnız sabit hata mesajı
yazar. Scheduler süreç içidir, kalıcı merkezi job değildir; operations rollout
monitoring'i ayrıca tanımlanmalıdır. Security audit retention `TBD` kalır.

Rollback iki flag'i kapatıp frontend'i yeniden build etmektir; family-bound JWT
kapalı modda reddedilir. Sonraki re-enable öncesi retained family'leri revoke et
veya ilgili kullanıcıların authVersion'ını artır. Additive tablo/enum korunur.
Refresh transport hatasında kullanıcıya retry gösterilir; logout transport hatası
başarılı çıkış gibi sunulmaz. Web Locks olmayan tarayıcılarda eşzamanlı sekme
refresh'i güvenli ret ve yeniden girişle sonuçlanabilir.

Yerel geliştirme süreci terminalden durdurulur. Servis recovery, veri restore ve
production rollback prosedürleri `TBD`.

Frontend yerel geliştirme ve gerçek API bağlantısı:

```bash
cd apps/frontend
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```

Vite geliştirme portu strict olarak `3132`'dir. Port doluysa rastgele başka bir
porta geçmez; önce o sürecin sahibi belirlenip güvenli biçimde durdurulmalıdır.

Browser E2E komutu ve dedicated veritabanı güvenlik koşulları
`apps/frontend/README.md` içinde kayıtlıdır. Fixture plan/katılım ve sezon maçı
taktik analiz senaryolarıyla birlikte yaş grubuna uygun drill kataloğu ve dört fazlı
plan-drill kalıcılığını aynı izole test veritabanında doğrular.

## Common Incidents

### Güncel yerel çalışma — 2026-09-05

Kullanıcı production yerine yerelde devam etmeyi seçti. `ngcs-postgres` container'ı
içindeki önceki `ngcs_local_test` DB'si korunarak `ngcs_local_session_dev` kopyası
oluşturuldu. `20260905000000_add_refresh_sessions` yalnız kopyaya deploy edildi;
üç migration güncel. Bu DB artık etkileşimli yerel çalışma verisidir, test adı
taşıyan kaynak DB veya E2E seed/reset hedefi olarak kullanılmaz.

Frontend `http://localhost:3001`, backend `http://localhost:4000` adresinde dev
süreçleri olarak başlatıldı. Backend development modunda exact frontend origin,
frontend doğru API origin'i ve iki process flag'i `true` kullanır. Repository
env örneklerindeki `false` varsayılanları değişmedi; production ayarı uygulanmadı.
JWT secret dosyaya yazılmadı: development process-local secret kullanılır;
backend restart eski access tokenlarını geçersiz kılar, refresh kaydı korunur.
Doğru yerel koç hesabının parolası daha sonra explicit kullanıcı onayıyla yalnız
kopyada sıfırlandı; authVersion artırıldı, refresh/reset kayıtları iptal edildi ve
audit kaydı oluşturuldu. Diğer hesaplar ve kaynak DB değiştirilmedi. Credential
bu belgeye yazılmaz; yeni parola ile giriş kullanıcı tarafından tamamlanmalıdır.

### Yerel frontend port standardizasyonu — 2026-09-08

Canonical geliştirme frontend'i `http://localhost:3132`, backend'i
`http://localhost:4000` adresindedir. Vite strict portu ve browser E2E varsayılanı
3132 olarak hizalanmıştır. Persistent session açıkken backend exact
`FRONTEND_ORIGIN=http://localhost:3132`, frontend ise
`VITE_PERSISTENT_SESSIONS_ENABLED=true` kullanır. HTTP ve Socket.IO aynı merkezi
origin resolver'ını tüketir; wildcard CORS kullanılmaz. Mevcut
`ngcs_local_session_dev` hedefi salt-okunur metadata sorgusuyla çözüldü;
migration, seed, reset veya iş verisi yazımı başlatılmadı. Backend çalışırken
normal session lifecycle temizliği gerçekleşebilir. Credential ve process-local
JWT secret dosyaya yazılmaz.

2026-09-08 kullanıcı onayıyla yalnız retained yerel koç hesabı aynı operator
sınırıyla yeniden sıfırlandı. `COACH`/`ACTIVE`/club kapsamı korundu,
`authVersion` 3 oldu, iki eski refresh family iptal edildi ve tokensız audit
yazıldı. Canonical 3132 frontend'inde normal login geçti; işlem sonrasında yalnız
yeni browser oturumu açıktır. Yeni parola yalnız kullanıcıya verildi ve dosyaya
yazılmadı.

### Tanılama

- `jest: command not found`: backend bağımlılıklarını `npm ci` ile kur.
- Frontend login sonrası veri yükleme hatası: backend'in `4000` portunda çalıştığını,
  `VITE_API_BASE_URL` değerini ve tarayıcı origin'inin backend CORS listesinde
  bulunduğunu doğrula. Kalıcı oturum flag'leri kapalıysa reload sonrası yeniden
  giriş beklenir; açıksa exact origin/header ve migration durumunu doğrula.
- Prisma tablo/model hatası: temiz baseline status ve schema diff'ini dedicated
  PostgreSQL üzerinde doğrula; retained veritabanına doğrudan `db push` uygulama.

## Escalation and Ownership

Ürün, operasyon, veri ve güvenlik sahipleri `TBD`.

## P0.1 sporting-foundation rollback

Retained ortamda P0.1 sonrası hata görülürse yeni sporting assignment yazılarını
durdur, önceki uygulama revision'ına dön ve yeni tabloları yerinde bırak. Legacy
`PlayerGroup`, `GroupMember` ve `Season` yolları additive migration tarafından
silinmez. Veri taşıyan ortamda tablo/enum drop etme; doğrulanmış forward-fix
migration hazırla. Migration öncesi ve sonrası Person/User, Team/PlayerGroup,
TeamSeason/Season ve `PLAYER_GROUP_BACKFILL_V1` reconciliation sayıları kaydedilir.
