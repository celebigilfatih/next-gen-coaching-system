# API Conventions

## Fixture-driven planning — ADR-0042

Current ADR-0047 / BALANCED_WEEK_V6 supports up to five SENIOR fixtures using
the same consecutive elapsed-hour rules. Six-or-more/same-day/sub24-hour contexts
require manual planning; automatic date reconciliation rejects them with409.
Existing contracts, preview-token invalidation, replay and manual protection remain.
ADR-0043 below describes the earlier two-match release, superseded only in ceiling.

ADR-0043 extends the same paths to two SENIOR fixtures per calendar week.
BALANCED_WEEK_V3 uses real elapsed kickoff intervals (including adjacent weeks)
for compressed recovery/preparation. Three-or-more/same-day/sub24-hour contexts
remain manual and reject automatic reconciliation with409. Explicit preview time
overrides pin the entire event when applied; manual edits/deletions remain fixed.

Existing PUT `/seasons/matches/:matchId` accepts date as before. An actual timestamp
change rechecks ACTIVE actor/current team permission inside a Serializable write,
uses the shared season planning lock and reconciles enrolled SENIOR calendar weeks
at old/new Monday plus adjacent weeks. Response remains the match with optional
`planningSync:{status,updated,created,retired,protected,weeks}`. Status is updated
or not-enrolled. Same-date and analysis-only requests do not repeat reconciliation.
Only date is sent by the schedule dialog; unrelated analysis/board drafts remain.

Immutable checkpoint hashes detect any day/plan/phase/exercise edit. Protect the
whole edited/deleted/excluded event, as well as past/completed/attendance-linked
sessions. Never adopt manual standalone records. Check authoritative matches and
all fixed/manual rows before mutation. Conflicts/congested templates return409
and roll back both match and program; out-of-season dates return400. Ordinary
management role boundaries remain; PLAYER cannot schedule. No additional endpoint,
background service or migration.

## Weekly planning — ADR-0040

- GET `/planning/events/page`: strict groupId, optional seasonId, ISO from/until
  half-open interval <=7 days, limit 1–50 (default25), scope-bound opaque after.
  Returns chronological `{items,summary,nextCursor,limit}`. Item source is plan,
  match or event; physical totals derive from authoritative plans. Linked DayPlan
  is metadata, never a second card. Private GORUSME is excluded. No board JSON.
- GET `/planning/teams?clubSeasonId=...`: management-authorized team/legacy-season
  choices only. POST `/planning/week/preview`: `{weekStart,seasonIds,overrides?}`,
  Monday ISO day, max21 distinct seasons in one club. Overrides accept only
  `{key,excluded?,startsAt?}`. Response includes token, normalized input, teams,
  fixture context, example phase/instruction previews and conflicts. No writes.
  Base template rows are clipped to inclusive season dates, including partial
  opening/closing weeks. Moving an included row outside the season still conflicts;
  excluded boundary rows are not valid override keys. BALANCED_WEEK_V6 uses real
  fixtures for opponent preparation; fixture-free breaks use development/rest.
- POST `/planning/week/apply`: `{requestId,previewToken,program}`. Server regenerates
  original templates, rechecks current principal/each season, schedule fingerprint
  and overlaps. All selected records/audits commit in one Serializable transaction.
  A per-team/season/week marker prevents new-request reapplication. UUID v4 request
  and normalized hash are actor-bound; exact replay does not rewrite timestamps.
  Changed payload/stale preview/overlap/duplicate returns409.
- GET `/planning/week/applications/:id`: actor-bound completed result or not-found.
  No-store on reads/preview/apply; URL retains only opaque request ID for recovery.
- POST `/planning/events`: requestId, seasonId, kind, title, startsAt, duration,
  optional notes/location/topic. Physical kinds create a real four-phase plan;
  TOPLANTI/REST create only DayPlan. Fixed fields/ownership are server-derived.
  PUT/DELETE `/planning/events/:id` manage nonlinked nonprivate day records only;
  kind/season are immutable. Linked training uses existing plan edit/delete routes.
- Existing roles remain: SystemAdmin, own-club ClubAdmin, assigned Coach; Player
  reads authorized calendar only. Dates use Turkey +03:00; durations1–480 minutes,
  physical sessions>=20. Existing100KiB parser remains; apply sends template
  selection/overrides, never all generated exercise text.


## Ready drill planning — ADR-0039

Drill catalog rows additionally return nullable contentVersionId. POST
/training-plans/:id/drills accepts optional expectedVersionId (nonempty, max 128).
A stale version or duplicate attachment returns 409; unpublished or unsupported
exact-age content returns 400. Source ownership, actor and group membership,
publication and exact age are rechecked in the Serializable write transaction.
The server appends to the published category and derives snapshot content; caller
snapshot/ownership fields never control storage. Existing controller role guards
remain authoritative and old optional-version callers remain compatible.

GET /training-plans/:id/editor-metadata adds nullable contentSnapshot without
board JSON. Old NULL records keep legacy title/duration. GET published drill
content returns variant=null for an explicitly requested unsupported age;
unpublished versioned records return 404 rather than a legacy projection.

POST /drills/content/starter-pack/publish is SystemAdmin-only and body-free.
All 120 approved stable starter IDs publish/audit in one Serializable transaction
or none do. Individual starter first publication is rejected; later revisions
and non-starter publication retain the existing expert/publication boundary.

## Guided club setup — ADR-0037/0038

POST `/sporting/club-setup` accepts only `{requestId, club, season, firstTeam,
academyTeams, staff}`. SYSTEM_ADMIN is rechecked ACTIVE inside the transaction.
All canonical/legacy projections and optional staff commit together. UUID v4
request identity is actor-bound; identical normalized body replays the original
result, changed body returns 409. GET `/sporting/club-setup/:requestId` returns
`completed` with club/season/first-team IDs and counts, or `not-found`. Both use
`Cache-Control: no-store`. The first-team audit anchors hash/result; it contains
no staff list or logo. No auto-retry with a different identity after network errors.

Club supports optional PNG/JPEG/WebP data URI logo up to 48 KiB and two nullable
#RRGGBB colors. Existing 100 KiB JSON body limit remains. Dates are valid ISO
calendar days, interpreted at +03:00; max 80-week season, 20 academy teams,
60 staff rows. Staff never writes accounts, invitations or capability grants.
[Verification](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

## Versioned tactical documents — ADR-0036 / BL-058b

- BL-058e.3 plan-phase document GET/PUT responses additionally include
  `phase: {planId, planDrillId, drillId, origin}`. Origin is `snapshot`, `drill`,
  or null only for an absent document. Client checks all three IDs and the
  document before editing; a successful PUT must report snapshot provenance.
  PUT body and canonical token remain unchanged. Metadata stays board-free;
  legacy `/board` remains V1-only. Source authorization is rechecked even for
  an existing snapshot; no fallback from malformed non-null data.
  [Verification](../30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).

- BL-058e.2 adds GET `/drills/:id/tactical-editor` (authorized board-free
  metadata), PUT on the same path (atomic `{metadata, document,
  expectedWriteToken}`), and POST `/drills/tactical-editor` (`{groupId,
  metadata, document, sourceId?, expectedSourceToken?}`). Copy source fields
  are paired; current visibility and source token are rechecked. Server derives
  CLUB scope/club/author/age from the authorized group. Metadata accepts only
  title/category/durationMin/difficulty/equipment. All mutations are Serializable;
  global writes remain forbidden. No query or ownership fields are accepted.
  [Contract and verification](../30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).

- BL-058e.1 adds `GET /matches/catalog/metadata/:matchId`, using the same strict
  `groupId` and optional `seasonId` query and season-owned authorization as the
  legacy detail. It omits tacticalBoard JSON and returns scalar `hasBoard`.
  The old `/detail/:matchId` stays unchanged and rejects V2; new match UI reads
  the document separately. Metadata analysis writes never carry the board.
  [Evidence](../30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).
- GET/PUT `/drills/:id/tactical-document`,
  `/training-plans/:planId/drills/:planDrillId/tactical-document` and
  `/seasons/matches/:matchId/tactical-document` use `{document, writeToken}`.
  PUT accepts only `{document, expectedWriteToken}`; no query fields.
- Current resource/source authority is checked inside a Serializable
  transaction before body/token validation. A malformed token/document is 400,
  stale token or serialization conflict is 409; no implicit retry. Null is a
  valid absent read, not a write. Unexpected errors do not expose causes.
- Tokens are canonical content/provenance hashes, not auth or monotonic
  revisions. A source-backed plan token changes when its source/provenance
  changes; a saved snapshot stays independent but source visibility is required.
- V2 writes require `TACTICAL_V2_WRITES_ENABLED=true`; read/protection are
  always available. Global document writes remain in the V1 review pipeline.
- These document PUTs and the e.2 tactical-editor POST/PUT allow a 600,000-byte JSON envelope, including
  inflated gzip. Domain V2 stays 500,000 bytes. Other JSON routes stay 100 KB.
  Excess HTTP bytes are 413; invalid JSON is a body-free 400.
- Legacy writers reject V2 downgrade atomically. Legacy GET payloads carrying
  V2 return 409; callers must switch to the new adapter, not open a blank board.
  [Contract](TACTICAL_ANIMATION_V2.md), [evidence](../30-quality/TACTICAL_V2_API_2026-09-19.md).

## Professional drill content

- Migrated published versions with SQL-NULL boardDocument may attach without a
  synthetic board only when source kind is LEGACY and license LEGACY_UNVERIFIED.
  Exact-age content/version/duration are still frozen. Actual legacy diagrams and
  every professional source retain strict board validation; add/replace permission,
  publication, expected-version and transaction checks remain unchanged.

- Ready collection read: `GET /drills/catalog/page` accepts optional
  `collection=ngcs-starter-v1`. Unknown/array values return400. This intersects
  the repository's exact120 stable IDs, GLOBAL visibility and PUBLISHED versions
  before count/cursor/limit. Versionless/seasonal and other NGCS originals are
  excluded. Without explicit ageGroup, this collection spans all ages and omits
  response ageGroup; each scalar row uses its original matching variant when
  available. Explicit ageGroup keeps exact-variant filtering. Requests without
  collection retain existing team-age semantics. Attachment authorization and
  exact-team-age validation remain independent of browsing.
- Plan picker adds `ageScope=TEAM` with this collection. The server resolves age
  from the authorized groupId metadata, independently of active workspace/client
  age. Explicit ageGroup together with TEAM, TEAM without collection, unknown
  values and arrays return400. This retains publication/identity/visibility
  filtering before count/pagination; unsupported exact ages return an empty
  collection. Library reads without ageScope continue to span all ages.

- `GET /drills/catalog/page` mevcut `groupId/category/kind/after/limit`
  sözleşmesini korur; `q`, yaş, amaç, zorluk, süre, oyuncu sayısı, ekipman,
  kaynak ve scope filtreleri additive'dir. Predicate'ler cursor öncesinde
  uygulanır; katalog yalnız `PUBLISHED` sürümleri ve versionless kulüp
  uyumluluk kayıtlarını döndürür. Cursor `v: 1` ile sürümlüdür.
- `GET /drills/:id/content`, yayınlanmış sürüm, çözümlenmiş yaş varyantı,
  TacticalBoardDocumentV1 ve kaynak/lisans bilgisini döndürür.
- `POST /drills/content/drafts` ve submit/approve/reject/publish/archive uçları
  strict body/query allowlist'i kullanır. Author/reviewer/club/status sahipliği
  istemciden kabul edilmez. Self-review 403, geçersiz yaşam döngüsü 400'dür.
- Doğrudan global `POST/PUT/DELETE /drills` kapalıdır; global içerik review
  akışından geçer. Mevcut club/group drill sözleşmeleri geriye uyumlu kalır.
- Yönetim kuyruğu varsayılan olarak en fazla 100 kayıt taşır; geniş ölçek için
  cursor kararı henüz `TBD`dir.

## Player 360 notes and activity

- `GET /sporting/players/:personId/notes/page` accepts only `after`, `limit`
  (default 20, maximum 100), `q`, `category`, `followUpStatus`, `teamId` and
  `status=ACTIVE|ARCHIVED`. Stable `observedAt + id` opaque cursors do not change
  the full filtered total.
- `POST .../notes` accepts source team, category, body, observation and optional
  paired follow-up date/status. `PATCH .../notes/:noteId`, archive, restore and
  share replacement require `expectedVersion`; stale writes return 409.
- `PUT .../shares` accepts only `expectedVersion` and unique target `teamIds`.
  Tenant, active player assignment and source-team exclusion are server-enforced.
- `GET .../revisions/page` is authorized by note visibility. `GET
.../activity/page` combines dated assignments and stored training attendance
  under existing `PLAYER_HISTORY_VIEW`/self-scope rules.
- Unknown/repeated/malformed input returns 400; unauthorized scope 403; missing
  records 404. Ownership (`clubId`, `personId`, `authorId`) and audit metadata are
  always derived server-side. Legacy `/users/:playerId/coach-notes` stays
  compatible but the new Player 360 does not call it.

## Account directory

- `GET /accounts` requires JWT plus `SYSTEM_ADMIN` or `CLUB_ADMIN`.
- Query is a strict allowlist: `after`, `limit` (1–100, default 25), `q`
  (trimmed name/e-mail, maximum 100 characters), `role`, `status`, `clubId`.
  Unknown, repeated/non-string or malformed values return 400.
- `SYSTEM_ADMIN` may omit `clubId` for platform scope or select one club.
  `CLUB_ADMIN` is always scoped to the authenticated principal's club;
  client-supplied club scope cannot expand access.
- Response is `{ items, nextCursor, limit, total, summary }`; item projection is
  `id`, `name`, `email`, `role`, `status`, `clubId`, `createdAt` and
  `club: { name }`. Password, authVersion, token and session data are absent.
- Items use stable ascending-ID keyset pagination. Counts and rows are read in a
  RepeatableRead transaction. Existing `/accounts/invitations`, access, status,
  password-reset and revoke-session mutation contracts remain unchanged.

## BL-043j read/write measurement boundary

An opt-in disposable fixture combines five GETs and two attendance POSTs. Three
clean-start runs observed 47 SQL events at 30/300 players and 150/1,500 selected
plans. Separate SELECT-only EXPLAIN captures scan-row emissions and root buffer
counters; it never replays mutations. Fixed query counts do not imply fixed row
work, unique physical rows or production capacity. The 80-event regression guard
is fixture-only, not an API limit/SLO. Settled totals, uniqueness, same-key races
and unauthorized writes are checked outside timing. No runtime contract changes.
Pilot owner/workload/environment/budgets remain TBD.
[Evidence](../30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md).

## BL-046c matched measurement boundary

The matched 2/50-phase fixture uses valid shared-source boards and distinct
snapshots. Three separate runs give 996,545 legacy versus 24,040 combined
metadata/selected JSON body bytes at 50 phases (97.59% smaller). Each request
uses six SQL events: new metadata + board together use twelve, not fewer than
the old six. Metadata has zero JSON projections; selected board has exactly one.
These are local fixture observations, not HTTP limits, latency SLOs or pilot
capacity. No runtime contract changes.
[Measured evidence](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).

## BL-046a editor read foundation

[ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md) accepts
GET /training-plans/:planId/editor-metadata and
GET /training-plans/:planId/drills/:planDrillId/board. Complete scalar phase
metadata plus one requested effective board is available in the backend. Both
reads reject query keys and invalid IDs (1–160 characters, no surrounding space
or control characters). Metadata uses explicit selects, phase/order/id ordering
and no JSON/attendance/user projection. New board reads additionally check source visibility,
including saved snapshots; existing editor reads and all mutations stay unchanged.
Effective JSON uses SQL/JSON null-aware snapshot precedence in one parameterized
query bound to plan, phase and authorized source ID. Invalid non-null snapshots
do not fall back; invalid/absent reads return document=null without raw content.
Valid documents retain strict 250-element/100,000-byte validation. Persistence
failures use fixed event names and cause-free generic 500 responses.
No phase cap or SLO is introduced. BL-046b frontend now reads metadata and only
the explicitly opened phase; no legacy editor fallback/prefetch. Dirty local and
route transitions share the editor guard; existing POST/PUT contracts are unchanged.
Ambiguous snapshot writes require an explicit authorized GET before a user-chosen
retry; a matching snapshot can be acknowledged without a duplicate PUT.
[Contract and acceptance design](BL046_EDITOR_READ_DESIGN.md).
[Backend verification](../30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md).

## BL-043i measurement boundary

The opt-in mixed GET benchmark does not change public contracts. Its 50-query
per five-read group and 32 KiB per page-response guards apply only to the fixed
synthetic fixture, not production budgets. Editor graph size remains unbounded
by that measurement. BL-046a above subsequently adds on-demand reads under
approved CR-017; frontend cutover and matched editor measurement are delivered.
Representative pilot capacity acceptance remains open.
See [method and results](../30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).

## BL-043h.2 attendance membership and shared-list cutover

GET /attendance/page requires JWT and a bounded planId. Only planId, limit
(default 25, 1–100 integer string) and after (the h.1 bounded identifier grammar)
are accepted; unknown fields are rejected. assertPlanView precedes the read;
groupId comes from that authorized plan, never a client-supplied workspace.
PLAYER is restricted to its own user ID in the page and both counts. Existing
POST /attendance guards, player eligibility and atomic upsert remain unchanged.

The GroupMember.id ASC keyset page returns items, total, presentTotal, limit and
nextCursor. Each item has only id/playerId/name/status; status is null for no
record, otherwise PRESENT/ABSENT. The existing unique planId/playerId constraint
bounds each selected user's attendance relation to one record. Counts precede
cursor filtering and intersect current PLAYER membership, like the attendance
overview; departed members' stored records are not deleted and remain available
through the unchanged legacy authorized APIs. This is not a historical sporting
roster or an ACTIVE-account filter. Group-less plans return an empty roster.

GET /training-plans/:id/editor applies existing plan view authorization and
returns plan scalars plus its existing drill/snapshot graph, without attendance
or nested group members. This is not a new bounded-drill editor contract. The
old /training-plans/:id and /attendance complete responses remain compatible.

The frontend uses editor plus independent 25-record attendance pages. It keys
attendance by plan/workspace scope, discards late reads, displays full counters
and preserves separate loading/error/empty states. One explicit write at a time
disables pagination; no optimistic attendance or automatic repeat is used.
Success re-reads the same cursor and full totals; failed/uncertain writes require
a current-state read before another write. A failed post-write read retries only
the read. PLAYER self attendance is read-only. Shared full-member provider
fetch/state is now removed; all four shared business lists (plans/drills/matches/
members) have separate consumers. SLO, query budgets and concurrent snapshot
guarantees are not implied; pilot validation remains open.
[Verification](../30-quality/BL043_ATTENDANCE_MEMBER_CUTOVER_2026-09-07.md).

## BL-043h.1 bounded player memberships

GET /groups/:id/members/players/page requires JWT, the existing SYSTEM_ADMIN,
CLUB_ADMIN or COACH role and current group view authorization before any page
read. PLAYER access remains denied. Only limit (default 25, integer string
1–100) and optional after (nonempty bounded identifier, maximum 160 characters,
no surrounding whitespace/control characters) are accepted; unknown fields
return 400. GroupMember.id ASC provides keyset order with one-row lookahead.

The server intersects groupId and user.role=PLAYER before both paging and full
count. Response: items, total, limit, nextCursor. Items contain only membership
id/groupId/userId and user id/name/email/role/position. No password, authVersion,
health or nested sporting data is returned. Total ignores the cursor. This is
current legacy membership, not an as-of SportingAssignment roster; no new user
status or season filter is introduced. Concurrent changes may affect later
pages/totals; this is not an immutable snapshot or production SLO guarantee.

Kadro uses 25-record pages with independent loading/error/retry and scope-keyed
state; its numbers are list positions, not jersey numbers. Genel Bakış uses
limit=1 and the full total, not returned item count. PLAYER receives an explicit
role notice, not a fabricated zero. At h.1 the provider array remained for
training-detail attendance. h.2 above separates that consumer and removes shared
full-member fetch/state; the old full members endpoint remains compatible.
[Verification](../30-quality/BL043_MEMBER_READS_2026-09-07.md).

## BL-043g.5 detail and shared-match cutover

GET /matches/catalog/detail/:matchId requires JWT and groupId; optional seasonId
narrows the authorized group's seasons. Unknown keys, page/date controls and
malformed IDs return 400. Current group view is checked before one match read;
the owning season must match both group/club plus any selected season. Missing
or out-of-scope ID returns 404; group denial remains 403. The detail projection
contains editor scalars/analysis/board, not videoLinks or nested resources.
Existing write-role guards, validators and endpoints remain unchanged.

GET /sporting/workspace/legacy-metadata returns only group/season through the
same sporting-capability and legacy-membership checks as legacy-context, without
a match query. The old complete legacy-context contract is preserved. Frontend
uses metadata-only context and has no shared matches array; detail owns a keyed
read/draft and the shell gets full total from catalog/page limit=1. Missing
concrete season never widens a read. Count failure is retryable and distinct from
zero. Bounded payloads do not establish production database-work limits.
[Verification](../30-quality/BL043_MATCH_CUTOVER_2026-09-07.md).

## BL-043g.1 bounded match read foundation

GET /matches/catalog/page requires JWT and groupId; optional seasonId must
belong to that group's club and group. Existing legacy group view rules apply;
season relation ownership, not optional Match.groupId, defines match visibility.
Omitting seasonId includes all seasons of the authorized group. Unknown keys
and malformed inputs return 400. Limit defaults to 25, maximum 100; after is a
bounded base64url object with exactly date/id. Date must be timezone-qualified
and non-null. Ordering is ascending date then ID. Cursor never grants access.

Optional paired from/until intersect season ownership using [from, until), up
to eight elapsed days. No period means no date cutoff. Response contains items,
total, limit and nextCursor. Items are scalar id/seasonId/date/opponent/location/
competition/result/ourFormation/notes plus hasBoard. Neither board, analysis nor
video JSON is selected. Board presence is read only for page IDs and excludes
SQL NULL/JSON null; it does not certify document validity. Total ignores cursor.
These are live independent reads, not an immutable multi-request snapshot.

BL-043g.2 moves Maçlar to this API with 25-record pages, full totals and scalar
hasBoard cards. Scope keys reset pagination and reject late responses. Only an
explicit all-seasons selection omits seasonId; missing concrete-season context
does not broaden the read. Page errors retry independently from workspace errors.
BL-043g.3 Genel Bakış uses the same endpoint with limit=3 and no cursor/date
filter, preserving the earliest three chronological season matches (not a new
future-only policy). It shows returned count/full total, scalar hasBoard badges,
scope reset and independent loading/error/retry. Missing concrete-season context
does not widen the request.
[Dashboard verification](../30-quality/BL043_DASHBOARD_MATCH_READS_2026-09-07.md).
BL-043g.4 Hafta uses seven independent daily match requests, limit=25 per day,
with local midnight/next local midnight converted to absolute from/until values.
Calendar-day arithmetic preserves DST boundaries; no fixed 24-hour assumption.
Each day has its own full match total, cursor history, loading/error/retry and
previous/next controls, independent of training pagination. Week/scope changes
discard stale responses. Only explicit all-seasons selection omits seasonId;
missing concrete-season context does not widen the request. A general empty-day
message requires confirmed zero full totals for both training and matches.
BL-043g.5 subsequently removed the remaining detail/shell shared-list consumers.
Seven bounded HTTP reads do not imply bounded total database work or a
production capacity SLO.
[Week verification](../30-quality/BL043_WEEK_MATCH_READS_2026-09-07.md).
Existing full season list and mutation contracts remain available.
[UI verification](../30-quality/BL043_MATCH_CATALOG_UI_2026-09-07.md).
[Contract, measurement and verification](../30-quality/BL043_MATCH_READ_FOUNDATION_2026-09-07.md).

## BL-043f.4 training picker and full-drill cutover

Training detail uses the existing catalog/page endpoint with its plan group,
25 records per page and one pinned off-page selection. Attached IDs are removed
from choices, not from the full catalog total. Existing admin visibility and
server source/plan authorization remain authoritative; this is not a new
attachability policy. All four frontend drill consumers now own bounded reads;
the provider no longer loads/stores the full GET /drills array. Legacy endpoints
remain available and nested plan details are not bounded by this change.

The picker calls existing POST /training-plans/:id/drills then GET plan. It no
longer uses replacement PUT, which recreated existing PlanDrill rows. Single
addition preserves existing snapshot rows, derives the next phase order from
the maximum current order and uses unchanged server duration synchronization.
A successful POST followed by failed GET offers only read retry, not another
POST. No public contract, DTO, permission, backend or schema change.

[Verification](../30-quality/BL043_DRILL_CUTOVER_2026-09-07.md).

## BL-043f.3 bounded tactical catalog

`GET /drills/catalog/page` additionally accepts optional `kind=tactical-board`.
Other kind strings, empty values, arrays, booleans and null are invalid. Omitting
kind preserves library/dashboard behavior. The JSON kind predicate intersects
the existing role/age/category filter before both keyset pagination and full
counting. It is not equivalent to category=TACTICAL: boards in any category remain
eligible. No board document is selected or returned; the scalar projection and
all current group/tenant checks remain unchanged. This marker is a catalog
classification, not full document validation; editor/import/write validation is
unchanged.

`/app/tactics` now owns 25-record pages, scope reset, stale-response rejection,
retry and empty-continuation recovery. It no longer consumes shared drills or
filters a partial page in the client. Existing board links, global copy hints and
create actions are preserved. The last training-detail consumer was migrated
in BL-043f.4 above; the shared drill list/full request is now removed.
[Verification](../30-quality/BL043_TACTICS_PAGINATION_2026-09-07.md).

## BL-043f.2 dashboard exercise total

The dashboard uses the existing `GET /drills/catalog/page?groupId=...&limit=1`
with no category/cursor and renders its full `total`. No new endpoint, filter,
permission or schema change is introduced. Its one minimal item is unused;
board JSON is absent. Group age and visibility follow the library contract below.
Exercises are not season-owned; season switches refresh the same group's total.
This does not modify the legacy club dashboard API's separate semantics.

The frontend read is independent, scope-keyed and late-response safe, with
loading/unavailable versus genuine zero and an independent retry. The dashboard
no longer consumes shared drills. Tactics and training detail were subsequently
migrated in BL-043f.3/f.4 above.
[Verification](../30-quality/BL043_DASHBOARD_DRILL_READS_2026-09-07.md).

## BL-043f.1 bounded exercise library

`GET /drills/catalog/page` requires authentication and a current authorized
`groupId`. Optional query fields are `category`, `after`, `limit`, and since
BL-043f.3 `kind` as described above.
Category accepts WARM_UP/TECHNICAL/TACTICAL/COOL_DOWN; omitting it means all.
The server derives age group from the authorized group; client-supplied tenant,
age-group or projection fields are rejected. Default limit is 25, maximum 100.
The bounded base64url cursor contains only validated `createdAt` and `id`;
ordering is descending creation date then ID. A cursor never grants access.

The response is `{ items, nextCursor, limit, total }`. Total counts the complete
authorized age/category filter, independently of the cursor. Items contain only
id/title/category/ageGroup/durationMin/difficulty/equipment/scope/createdAt and
`isBoard`. Board classification queries only returned IDs and the existing JSON
kind marker, without selecting/transferring board documents. It is a display
hint, not board validation; detail/import/write validation remains unchanged.

Visibility reuses the legacy drill policy: COACH/PLAYER see globals plus their
club-wide/selected-group records, CLUB_ADMIN sees globals plus all own-club
records, SYSTEM_ADMIN sees all records. All callers still pass group-view checks
and the server-derived age/category filter. No permission expansion is made.

`/app/library` owns 25-record pages, category/scope reset and retry. Its cards no
longer consume the shared drill array. That array/full legacy request remains
for dashboard/tactics/training-detail consumers until their separate migration;
never replace it with the first page. No schema, migration or write change.
[Library verification](../30-quality/BL043_DRILL_LIBRARY_2026-09-06.md).

## BL-043e.5 attendance projection and workspace cutover

`GET /training-plans/catalog/attendance/page` uses the same authenticated query,
current group/tenant/season checks and optional period as catalog/page. It returns
minimal plan items with scalar `presentCount` instead of `phaseCount`, plus full
catalog summary fields and `summary.playerCount`. Per-plan PRESENT aggregation
is restricted to returned IDs and authorized scope. Player count is the full
current legacy PLAYER membership count; PLAYER callers see only their own
membership/PRESENT records. It is not a historic roster or completion percentage.
No nested attendance, player, drill or board arrays are returned.

Attendance UI owns its 25-record cursor pages. Training catalog, dashboard, week
and attendance no longer consume a shared plan array; WorkspaceProvider's full
GET /training-plans request and plan state have been removed. Detail and write
APIs, remaining drill/member/match sources and legacy REST list behavior remain.
[Cutover verification](../30-quality/BL043_ATTENDANCE_CUTOVER_2026-09-06.md).

## BL-043e.4 bounded calendar reads

The existing catalog page endpoint additionally accepts paired `from` / `until`
offset-bearing ISO timestamps. Both are required together; `from < until` and a
maximum eight elapsed days are enforced, allowing a seven-day interval across
DST. Unknown fields, arrays, nulls, missing offsets and invalid dates are rejected.
The filter is `[from, until)` and intersects the authorized group/club and exact
season scope. It never replaces that scope. Null-date drafts are excluded only
from period reads and remain available in the ordinary catalog. Every aggregate
uses the same period/scope filter, independently of the cursor. Existing calls
without period fields retain their previous semantics and response shape.

Week now requests seven independent local-day pages (25 records each). Local
midnight and next local midnight are converted to ISO instants using calendar
arithmetic, not a fixed 24-hour increment. Each day has full count/duration,
previous/next, loading, failure/retry and empty states. Week/scope changes remount
the day reads, discarding stale responses and resetting pagination. Calendar URL
updates preserve unrelated scope parameters. Matches keep their existing source.
Since BL-043e.5 the final attendance consumer is migrated and the provider's full
plan fetch is removed; remaining workspace resources are unchanged.
Seven day requests add overhead during this compatibility phase; they do not
claim an end-to-end workspace speedup or a pilot SLO. No schema/index change.
[Verification](../30-quality/BL043_WEEK_READS_2026-09-06.md).

## BL-043e.1 training catalog read foundation

`GET /training-plans/catalog/page` requires `groupId`; accepts only optional
`seasonId`, `after`, `limit` (default 25, max 100), and paired `from`/`until`
(BL-043e.4 above). Current legacy group access
is revalidated, club scope is server-derived, and an exact supplied season must
belong to that group/club. Omitted season means all plans; a selected season
includes undated drafts and uses the existing inclusive UTC end-of-day boundary.

Date-desc/null-last/ID-desc keysets return at most limit minimal plan summaries
and `nextCursor`; cursor decodes only `{ id, date }`, max 512 base64url characters.
IDs max 160; dated cursors require strict offset-bearing ISO timestamps. Invalid
or unknown fields return 400. Items omit all nested documents/attendance arrays;
`phaseCount` is computed only for returned plan IDs. `summary` reports full
total/scheduled/undated/totalDuration/presentAttendance, without cursor filtering.
PLAYER PRESENT counts remain self-only. Reads are live, not snapshot-isolated.

This is the group-workspace catalog, not an owner-only or unassigned-plan API.
Legacy endpoints are unchanged. Since BL-043e.2, `/app/trainings` consumes this
catalog with independent 25-record pages and full summary fields. The shared full
plan read was removed in BL-043e.5, never replaced with a partial page.
Since BL-043e.3, dashboard requests this same endpoint with `limit=3`, no cursor,
and the exact selected legacy group/season. Its training/PRESENT counters use
the full `summary`, never the recent-item count. Recent cards use `phaseCount`.
Club/club-season/team/group/season changes remount the read, discarding stale
responses. No mapped group, loading or failed workspace means no overview read.
At the e.5 delivery, matches, drills and members retained shared sources. Later
f.4/g.5 removed full drill/match fetches; h.1 now separates Kadro/dashboard
members. h.2 above separates training-detail attendance and removes full members.
[Dashboard verification](../30-quality/BL043_DASHBOARD_TRAINING_READS_2026-09-06.md).
[UI verification](../30-quality/BL043_TRAINING_CATALOG_UI_2026-09-06.md).
[Contract and EXPLAIN evidence](../30-quality/BL043_TRAINING_READ_FOUNDATION_2026-09-06.md).

## BL-043d selected legacy context and assignment options

- `GET /sporting/workspace/legacy-context` accepts required `teamId` and optional
  `clubId`, `clubSeasonId` only (bounded nonempty IDs; `*` means all seasons).
  It checks current TEAM_VIEW and independently applies legacy group membership
  or the existing administrative exception. A mapping alone is not a grant.
  It returns `{ group, season, matches }`: at most one minimal group and season,
  with no member, week or team-season arrays. A native team or missing legacy
  membership returns null metadata and no matches. Missing TEAM_VIEW or foreign
  club returns 403; malformed query or absent team returns 400.
- Exact season mode chooses the newest-created matching legacy season, with
  ascending ID tie-breaker, and only that season's matches. All-seasons mode
  includes every authorized group season (including unmapped legacy seasons) in
  one relational match query, ordered by date then ID ascending. No selected
  season means no matches. Match records remain complete and **unbounded**;
  this delivery bounds metadata, not every business-resource response.
- `GET /sporting/roles/page` accepts required `clubId`, optional `after`, `q`,
  `limit` (default 25, max 100) using the catalog parser and ascending-ID keyset.
  It returns only PLAYER-system-role options as `{ items, nextCursor, limit }`,
  selecting id/name/key/systemKey, without capability arrays. Existing own-club
  visibility/SYSTEM_ADMIN rules apply; write capability is rechecked by the
  unchanged assignment mutation, never inferred from seeing an option.
- The assignment dialog loads team/role pages only while open, using the existing
  `/sporting/teams/page` and new roles page. Selected values remain pinned outside
  the page; neither initial load nor pagination chooses a value implicitly.
  Opening again clears the choices. Old full-array APIs remain available.

[Contract, tests and remaining work](../30-quality/BL043_LEGACY_METADATA_2026-09-06.md).

## BL-043c dated assignment pages

`GET /sporting/teams/:teamId/roster/page` and
`GET /sporting/players/:personId/assignments/page` require offset-bearing `asOf`;
optional `limit` is 1–100 (default 25), `after` is a bounded base64url
`{ id, validFrom }` cursor. Roster optionally filters exact `teamSeasonId`.
Unknown fields and invalid values return 400. Descending validFrom/ID keysets
return at most limit assignments with a next cursor; no full history is fetched
to compute a page. Roster header omits nested team seasons.

Roster `page` contains total/player-assignment/staff-assignment counts. Player
`assignmentPage` contains total, activeCount and historyVisible. Counts use the
full permitted date-filtered set, not page length. A missing history capability
restricts the page to active records. Current actor grants are rechecked even for
historical dates; existing self/admin rules are unchanged. Counts/traversal are
live views, not snapshot-isolated pagination. Old full-array endpoints remain.
[Detailed contract and evidence](../30-quality/BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

## BL-043b bounded team and workspace catalogs

- `GET /sporting/workspace/selection` accepts only optional `clubId`,
  `clubSeasonId`, `teamId`. It resolves permitted selected records independently
  of catalog pages, returning `club`, `clubSeason`, `team`, `teamSeason`, `scope`
  and first `clubs`/`seasons`/`teams` pages (25 records each).
- `GET /sporting/catalog/clubs`, `GET /sporting/catalog/seasons` and
  `GET /sporting/teams/page` return `{ items, nextCursor, limit }` with ascending
  ID keysets. Query: `clubId`, `clubSeasonId`, `after`, `q`, `limit`; `clubId`
  is required for seasons/teams, `clubSeasonId` filters teams only. Limit defaults
  to 25, max 100; ID values max 160 and name search max 100 characters. Unknown
  fields, arrays, control characters and malformed limits return 400.
- Current tenant and active `TEAM_VIEW` team/club-wide grants apply in SQL before
  every page. Own CLUB_ADMIN and SYSTEM_ADMIN retain their accepted bypasses;
  cursor values do not grant access. Non-system foreign-club catalogs return 403.
  Selection resolves unavailable requested IDs to visible fallbacks, never to the
  supplied foreign record. Default season is latest start date; club/team fallback
  uses ascending ID. `*` includes season-less teams.
- A team has at most one team-season summary (selected season, otherwise latest).
  Nested full history is not part of this contract. The selector pins the selected
  record separately if outside its page; page navigation alone does not change scope.
- Old `/sporting/workspace` and `/sporting/teams` array contracts remain unchanged.
  Legacy metadata and detail/history reads are not all bounded by this slice.

[Verification and remaining boundaries](../30-quality/BL043_WORKSPACE_CATALOGS_2026-09-06.md).

## BL-043a player-directory pagination

`GET /sporting/players/page` requires `teamId`; accepts `clubId`, `after`, `q`,
`position=KALECI|DEFANS|ORTA_SAHA|FORVET|UNASSIGNED`,
`sort=NAME_ASC|NAME_DESC` and `limit` (default 25, maximum 100); and returns
`{ items, nextCursor, limit, total, summary }`. `total` is the current search and
position result before pagination. `summary.total` and `summary.positions` cover
the visible active team scope, independent of the current search.

Requests without `sort` preserve ascending-ID keyset order and raw ID cursors.
Name-sorted requests use a versioned opaque cursor containing the deterministic
`displayName + id` tuple; malformed cursors or cursors from the other sort return 400. Current actor capability, tenant/team membership and PLAYER self restriction
apply before every page, total and summary. Each item has at most one latest active
assignment in the requested team. Query parsing rejects unknown fields and
malformed/oversized values. Search and position filtering run in PostgreSQL, not
on the current page; cursor/filter changes do not bypass authorization or reveal
team totals to a PLAYER.
The old `/sporting/players` array and Player 360 contracts are preserved.
[Contract details, evidence and remaining limits](../30-quality/BL043_PLAYER_PAGINATION_2026-09-06.md).

## P0.1b workspace and parity

- `GET /sporting/workspace`: authenticated, current capability-filtered clubs,
  teams and team-season contexts; retained compatibility array API. The live
  shell now uses the bounded selection/catalog APIs above. Legacy resource
  access is checked separately.
- `GET /sporting/legacy-parity?clubId=...`: SYSTEM_ADMIN or own CLUB_ADMIN;
  read-only repeatable-read `IN_SYNC`/`DRIFT` report with discrepancy counts only.
- Group/season/member writes preserve their existing contracts and generic error
  handling, adding an atomic sporting projection. The group API exclusively owns
  `LEGACY_MEMBER` create/end. Account changes that would invalidate a linked
  sporting identity or unexpired assignments return 409 before changing access.
- Actor capability uses the present time; `asOf` controls target history and
  cannot restore a revoked actor's old access.

See [P0.1b compatibility contract](P01B_COMPATIBILITY_CUTOVER.md).

## Protocol and Versioning

- Mevcut backend JSON tabanlı HTTP endpoint'leri ve Socket.IO olayları sunar.
- Global API prefix veya sürümlendirme doğrulanmadı.
- Global DTO/ValidationPipe politikası yoktur. MVP çekirdek mutation body'leri
  route/service düzeyinde doğrulanır; kalan `any` body'ler yalnız MVP dışı sağlık
  ve ileri analitik prototiplerindedir.
- Hedef protokol ve versioning politikası `TBD`.

## Authentication and Authorization

- JWT bearer token, Passport JWT strategy ve route bazlı rol guard'ları kullanılır.
- Authenticated principal her istekte güncel veritabanı kaydından oluşturulur.
- Çekirdek kulüp, grup, plan, sezon ve katılım endpoint'leri ADR-0007 rol/kaynak
  matrisiyle korunur. Yeni endpoint varsayılan olarak kapalı kalır; kapsamı ve
  negatif yetki testi olmadan rol erişimi açılmaz.
- Hesaplar public register yerine `/accounts/invitations` ile provision edilir.
  Invitation/reset token kabul endpoint'leri throttled; admin lifecycle endpoint'leri
  JWT, rol ve target-scope kontrolü gerektirir.
- ADR-0020 ile `ACCOUNT_DELIVERY_MODE=operator|smtp` uygulanır. Operator modu
  yalnız development/test'te admin yanıtına tek-seferlik ham token ekler ve issuance
  yanıtı `Cache-Control: no-store` taşır. SMTP modunda yanıt yalnız
  `delivery.status=accepted` taşır; ham token JSON'a girmez. SMTP ret/timeout'unda
  yeni token revoke edilir ve cause-free generic 503 döner. Public
  `/accounts/invitations/accept` ve `/accounts/password-resets/complete` uçları aynı
  tek-kullanımlık token doğrulamasını sürdürür; anonim reset-issue ucu yoktur.
- ADR-0009 frontend'i mevcut bearer JWT'yi bellekte tutar, REST isteklerinde
  `Authorization: Bearer` başlığı ve Socket.IO handshake'inde `auth.token` kullanır.
  ADR-0018 ile opt-in kalıcı oturum uygulanmıştır; varsayılan memory-only davranış
  korunur. Frontend Socket consumer'ı henüz yoktur; bearer alanı backend yeteneğidir.
- Plan drill replace işlemi `PUT /training-plans/:id/drills` üzerinden, mevcut
  plan-manage authorization sınırı içinde yürür. En fazla 50 faz kaydı kabul edilir;
  geçersiz phase/order veya bulunmayan drill bütün işlemi reddeder.
  BL-024 ilk dilimi aynı runtime DTO doğrulamasını controller'da liste işlenmeden
  önce ve service girişinde uygular: eksik/null/array olmayan `drills` ve bozuk
  elemanlar kontrollü 400 üretir. Önce plan-manage, geçerli girdide ardından kaynak
  drill yetkisi kontrol edilir. Boş liste ve 50 eleman kabulü korunur; global
  ValidationPipe veya bilinmeyen alan politikası değiştirilmemiştir.
- `POST /training-plans` ve `PUT /training-plans/:id` ortak runtime DTO parser'ları
  kullanır; servis girişinde de doğrulama uygulanır. Create club/coach kimliği önce
  mevcut principal kuralıyla türetilir; client'ın zaten yok sayılan ownership
  alanları yetki veya yeni bir validation bağımlılığı oluşturmaz. Update önce
  plan-manage kontrolünü yapar; yalnız yazılabilir scalar alanları aktarır.
  `title` string; `groupId`, `notes`, `date` şemadaki null/undefined davranışını
  korur. Grup kimliği sağlandığında boş olmayan string olmalıdır. Tarih gerçek
  takvim günü, saat ve offset taşıyan RFC3339 string veya servis çağrısında geçerli
  Date'tir; timezone tahmin edilmez. `totalDuration` yalnız Prisma signed 32-bit
  Int aralığında doğrulanır; yeni pozitif süre/başlık uzunluğu politikası eklenmez.
  Boş başlık/empty patch ve uygun null-clear korunur; grup detach/change mevcut
  serializable drill/day aggregate kontrollerini atlayamaz. Malformed input 400
  üretir; şema, global pipe ve rol sözleşmesi değişmez.
- `POST /training-plans/:id/drills`, replace ile aynı drillId/phase/non-negative
  integer order/string notes kontrolünü paylaşır. Plan yetkisi parse öncesinde,
  kaynak egzersiz yetkisi parse sonrasında kalır; servis de mutation öncesi doğrular.
- BL-038 ile training-plan create/update/delete, add/replace drill ve board snapshot
  lookup/write persistence hataları raw driver/cause taşımayan generic 500 üretir.
  Loglar yalnız `TRAINING_PLAN_CREATE_FAILED`, `TRAINING_PLAN_UPDATE_FAILED`,
  `TRAINING_PLAN_DELETE_FAILED`, `TRAINING_PLAN_DRILL_ADD_FAILED`,
  `TRAINING_PLAN_DRILLS_REPLACE_FAILED` veya
  `TRAINING_PLAN_BOARD_UPDATE_FAILED` olayını içerir. Transaction içindeki açık
  `BadRequestException` kontrolleri 400 olarak korunur; plan-create sonrasındaki
  opsiyonel season-day bağlantısı fail-soft kalır. Yeni global hata zarfı veya
  status politikası değildir.
- `POST /attendance` runtime DTO'su body nesnesi, boş olmayan string planId/playerId
  ve mevcut `PRESENT/ABSENT` değerlerini doğrular. Geçerli body plan-manage ve
  attendance-player kontrollerinden sonra explicit alanlarla servise aktarılır;
  servis aynı kuralları DB sorgusundan önce uygular. Bozuk body 400; yetki rolleri,
  aynı-kayıt update/yeni-kayıt create ve Socket event sözleşmesi değişmez.
  Lookup/update/create persistence hataları raw driver/cause taşımayan generic 500
  ve yalnız `ATTENDANCE_MARK_FAILED` sabit olayını üretir.
- Attendance yazımı ADR-0019 kapsamında `(planId, playerId)` birleşik anahtarlı tek
  Prisma upsert kullanır. DB unique constraint'i eşzamanlı ilk yazımlarda tek kayıt
  garantisi verir; son commit edilen başarılı status ortak son durumdur.
- `POST /groups` create sırasında beklenmeyen persistence hatası mevcut
  `{ statusCode: 500, message: 'Internal server error' }` yanıtını korur; raw error
  veya clubId loglanmaz. `POST /clubs/:id/groups` yolu da aynı generic yanıtı ve
  kendine ait sabit olayı kullanır. Yeni global hata zarfı/exception filter
  uygulanmamıştır.
- `GET /drills` ve `GET /drills/:id` authenticated ve principal-scope filtreli
  çalışır. `POST /drills` ownership alanlarını sunucuda türetir; `PUT`/`DELETE`
  sahiplik ve tenant kontrolü uygular.
- Drill create body ve yetkilendirilmiş update body JSON nesnesi olmalıdır;
  null/array/primitive mutation öncesi kontrollü 400 üretir. Update'te kaynak
  yetkisi body parse öncesinde korunur. Create/update/delete persistence hataları
  raw driver/cause taşımayan generic 500 ve yalnız `DRILL_CREATE_FAILED`,
  `DRILL_UPDATE_FAILED` veya `DRILL_DELETE_FAILED` sabit olayını üretir.
- `PUT /training-plans/:planId/drills/:planDrillId/board`, doğrulanmış
  `boardSnapshot` yazar ve plan/faz/kaynak egzersiz yetkisini yeniden kontrol eder.
- `PUT /seasons/matches/:matchId/tactical-board`, doğrulanmış `tacticalBoard`
  belgesini mevcut match-manage sınırında `opponentAnalysis` alanından ayrı yazar.
- `TacticalBoardDocumentV1` yalnız `schemaVersion: 1`, `kind: tactical-board`,
  canonical pitch ve en fazla 250 kimlikli element kabul eder; bilinmeyen alan/tür
  fail-closed reddedilir. Color yalnız canonical hexadecimal formattadır; SVG
  serialization dinamik XML değerlerini escape eder.
- ADR-0014 ile plan/drill ve season-day/plan group invariant'ı mutation
  transaction'ında uygulanır. Socket operasyonları kulüp-geneli payload yerine
  her emit'te güncel üyelikle türetilen group recipient'larına minimum kaynak
  kimliği gönderir.
- ADR-0015 ile password reset completion tokenı koşullu tek-kazanan claim olmadan
  parola veya audit mutation'ına geçmez.

## Sporting organisation contract (P0.1)

- Bütün `/sporting/*` endpoint'leri bearer authentication gerektirir.
- `GET /sporting/teams`, principal'ın kulüp/capability kapsamındaki kalıcı takım ve
  team-season bağlamlarını döndürür.
- `GET /sporting/teams/:teamId/roster?asOf=<RFC3339>&teamSeasonId=<id>` yalnız
  verilen anda aktif atamaları döndürür; geçersiz veya çapraz kapsam reddedilir.
- `GET /sporting/players?teamId=<id>` oyuncu dizinini, `GET
/sporting/players/:personId?asOf=<RFC3339>` izin filtreli Player 360 görünümünü
  döndürür. Tarihçe ve sportif uygunluk ayrı capability ile projekte edilir.
- `GET /sporting/roles` kulüp işlevsel rollerini ve capability adlarını sunar.
- `POST /sporting/assignments`, geçici veya tarihli atama oluşturur; yalnız
  `personId`, isteğe bağlı `teamId`/`teamSeasonId`, `roleDefinitionId`, tür,
  tarihler ve gerekçe kabul edilir. Ownership/source alanları parser projection'ında
  tamamen elenir ve sunucuda türetilir.
- `POST /sporting/assignments/transition-primary`, serializable transaction içinde
  önceki açık ana atamayı geçiş tarihinde kapatır ve yenisini açar. İkinci açık ana
  kayıt conflict'tir; geçici atamalar eşzamanlı kalabilir.
- `POST /sporting/assignments/:assignmentId/end`, başlangıçtan sonraki açık bitiş
  tarihiyle atamayı kapatır. Create/end/transition audit üretir.
- Eski P0.1 array sözleşmeleri uyumluluk için korunur; canlı oyuncu/takım,
  workspace ve kadro/geçmiş rotaları BL-043a/b/c sayfalı uçları kullanır.
  BL-043d seçili legacy metadata ve sayfalı diyalog seçeneklerini tamamlar.
  İş kaydı listeleri, compatibility API retirement ve gerçek pilot ölçek hedefleri açıktır.

## Season mutation contract (BL-024 / BL-031)

- Sezon/hafta/gün/maç create ve hafta/maç update controller ve service girişinde
  ortak runtime parser kullanır. Kaynak mutation'larında authorization parse
  öncesindedir; sezon create kimlikleri mevcut principal kuralıyla türetilir.
- Yalnız endpoint'in yazılabilir alanları aktarılır. İstemci `id`, ownership,
  `seasonId`, `season` ve `days` gibi ek scalar/ilişki alanları yok sayılır;
  nested Prisma create/connect/update/delete işlemleri geçirilemez. Bu, mevcut
  ADR-0007/0014 sınırının uygulanmasıdır; yeni rol veya global pipe politikası değildir.
- Maç create/update metadata gövdesindeki `tacticalBoard` yok sayılır. Tahta yalnız
  mevcut doğrulanmış `/seasons/matches/:matchId/tactical-board` ucundan yazılır.
- Tarihler gerçek takvim günü içeren ISO string veya servis çağrısında geçerli
  Date olmalıdır. Mevcut date-only, offset'li ve yerel ISO girişleri korunur;
  yerel ISO'nun dönüşümü runtime timezone davranışını korur. Yeni timezone
  politikası getirilmez. Sezon tarih sırası ve 80 haftalık üst sınır değişmez.
- Integer alanlar Prisma signed 32-bit sınırında doğrulanır; yeni ürün aralığı
  eklenmez. Gün type verilmezse TRAINING, completed false; drillIds null/eksikse
  boş liste olur. Şemadaki nullable string/duration/intensity alanları korunur.
  Gün-plan bağlantısı mevcut serializable kulüp/grup kontrolünden geçer.
- Maç update'te date null/boş string/eksikse tarih değişmez. opponentAnalysis ve
  videoLinks mevcut JSON şekillerini (null dahil) korur; JSON olmayan değerler
  reddedilir. Bozuk body/alanlar mutation öncesinde kontrollü 400 üretir.
- BL-037 ile season/week/day/match create, update, delete, toggle, tactical-board
  ve week-generation persistence/missing-record yolları raw driver/cause taşımayan
  generic 500 üretir. Loglar yalnız işlem türüne özel `SEASON_*_FAILED` sabit
  olaylarını içerir; kaynak kimliği ve hata nesnesi içermez. Day transaction'ın
  açık `BadRequestException` kontrolleri 400 olarak korunur. Toggle/generate için
  missing-record davranışı yeni bir 404 sözleşmesine çevrilmemiştir; global hata
  zarfı ve status politikası hâlâ `TBD`'dir.

## Club and group mutation contract (BL-024 / BL-032)

- Kulüp create/update; grup create/update ve üyelik body'leri controller ile
  service sınırında ortak runtime parser kullanır. Yalnız yazılabilir scalar
  alanlar Prisma'ya aktarılır; `id`, timestamp ve nested ilişki alanları yok sayılır.
- Kulüp adı string olmalıdır; boş string davranışı korunur. `logo` ve `description`
  eksik veya null olabilir. Yeni uzunluk, trim veya URL politikası eklenmemiştir.
- Grup yaş/kademe etiketi ADR-0028 ile trim edilmiş, kontrol karakteri içermeyen
  1–32 karakterlik metindir; mevcut enum değerleri aynen korunmuştur. Kategori
  yalnız `ALT_YAPI`, `A_TAKIM` olabilir. Legacy `/groups` create yalnız
  `ALT_YAPI` üretir; A Takım ve season-aware takım yönetimi aşağıdaki
  `/sporting/teams` yaşam döngüsü uçlarının sorumluluğundadır.
- Body hedefli `/groups` create, geçerli `clubId` alanını önce çıkarır ve tenant
  yetkisini kalan alanların doğrulamasından önce uygular. Path hedefli update,
  üyelik ve `/clubs/:id/groups` işlemlerinde de kaynak yetkisi body parse öncesidir.
- Üyelik mutation'ı yalnız boş olmayan `userId` aktarır; groupId path'ten gelir.
  Add-member mevcut kullanıcı-kulüp kontrolünü korur.
- `POST /clubs`, `PUT /clubs/:id` ve `POST /clubs/:id/groups` persistence hataları
  raw driver/cause taşımadan generic 500 üretir ve yalnız sabit
  `CLUB_CREATE_FAILED`, `CLUB_UPDATE_FAILED` veya `CLUB_GROUP_CREATE_FAILED`
  olayı loglar. Global hata zarfı, redaction veya retention politikası
  oluşturulmamıştır.
- Grup update/delete ve üye add/remove persistence hataları raw driver/cause
  taşımadan generic 500 üretir; yalnız `GROUP_UPDATE_FAILED`,
  `GROUP_DELETE_FAILED`, `GROUP_MEMBER_ADD_FAILED` veya
  `GROUP_MEMBER_REMOVE_FAILED` sabit olayı loglanır. Duplicate add ve missing
  remove için mevcut HTTP 500 davranışı korunur; yeni status politikası değildir.
- Grup silme, üyeliklerin ve grup kaydının silinmesini tek Prisma transaction'ında
  yürütür. İlişkili kaynak foreign key'i grup silmeyi reddederse üyelik silmeleri
  geri alınır; bağımsız grupta mevcut başarılı 200 sonucu korunur.

## Browser-session contract (ADR-0018)

- `POST /auth/login` aynı email/password DTO'sunu kullanır; JSON yalnız access
  token, public user ve `persistent_session` göstergesi taşır. Özellik açıkken
  refresh credential yalnız HttpOnly cookie'ye yazılır.
- `POST /auth/refresh` ve `/auth/logout` yalnız flag açıkken kullanılabilir;
  kapalı durumda 404 döner. Açık modda login/refresh/logout için exact
  `FRONTEND_ORIGIN` ve `X-NGCS-CSRF: 1` zorunludur. Missing/malformed/unapproved
  origin veya header 401; invalid/expired/replayed refresh 401 döner.
- Başarılı refresh/logout 200; login 201. Yanıtlar `Cache-Control: no-store` taşır.
  Refresh credential body/URL/JSON/log içinde gösterilmez. Replay family revoke'u
  hata yanıtından önce commit edilir. Logout tekrarı idempotenttir.
- Family-bound access JWT HTTP ve Socket sender/recipient kontrollerinde güncel
  aktif family gerektirir. Business REST uçları cookie ile authorize edilmez.

## Errors, Idempotency and Pagination

- Standart hata zarfı, pagination, idempotency ve request correlation politikası
  doğrulanmadı.
- Mevcut hata davranışı NestJS/Prisma varsayılanları ile route özel kodun karışımıdır.

## Compatibility

Public API değiştirilmeden önce mevcut tüketici envanteri, gelecekteki frontend
sözleşmesi, migration etkisi ve geriye uyumluluk planı doğrulanmalıdır.

## Training plan lifecycle — 2026-09-08

`PUT /training-plans/:id` keeps its response contract. The approved web edit
surface sends only `title`, timezone-qualified `date` and `notes`; group,
club/coach ownership and `totalDuration` are not mass-assigned. When a plan has
linked `DayPlan` rows, their title/date/notes plus target week/day projection are
updated in the same Serializable transaction. A date outside a linked season
week, or clearing a linked date, returns 400 without a partial write.

`DELETE /training-plans/:id` keeps existing authentication, role guards and
`assertPlanManage`. After authorization it permanently deletes linked `DayPlan`,
`Attendance`, `PlanDrill` (including board snapshots) and `TrainingPlan` rows in
one Serializable transaction. Persistence failure returns the existing generic
500 boundary and does not expose raw cause data. See ADR-0026.

## Team lifecycle contract — 2026-09-08

- `GET /sporting/teams/page` mevcut cursor sözleşmesine
  `categoryKey=A_TAKIM|ALT_YAPI` ve `status=ACTIVE|ARCHIVED` filtrelerini ekler.
  Varsayılan status `ACTIVE`dir; arşivli liste yalnız yönetici rollerine açıktır.
  Yanıt additive `archivedAt` alanı taşır.
- `POST /sporting/teams` yalnız `clubId`, gerçek bir `clubSeasonId`, `name`,
  `ageGroupLabel` ve `classification=FIRST_TEAM|ACADEMY` kabul eder. FIRST_TEAM
  create yalnız `SYSTEM_ADMIN`; academy create aynı kulüp yöneticisine de açıktır.
- `PATCH /sporting/teams/:teamId` yalnız `name` ve `ageGroupLabel` kabul eder.
  Kulüp, sezon, kategori, arşiv veya sahiplik mass-assignment'ı reddedilir.
- `POST /sporting/teams/:teamId/archive` ve `/restore` yalnız altyapıda çalışır.
  A Takım arşivleme her rolde reddedilir.
- Aktif kataloglar, workspace seçimi ve legacy operasyonel okumalar arşivli
  takımları dışlar. Restore aynı takım/grup kimliğini etkinleştirir.
- Bütün mutation'lar authentication, yönetici rolü, tenant ve kaynak kontrollerini
  uygular. Hata yanıtları raw Prisma cause taşımaz.
