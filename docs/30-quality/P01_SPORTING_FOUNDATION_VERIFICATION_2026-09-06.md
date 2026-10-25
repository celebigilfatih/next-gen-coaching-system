# P0.1 Sporting Foundation Verification — 2026-09-06

## Verdict

Bu rapor P0.1a tesliminin tarihsel kanıtıdır. Sonraki BL-042/P0.1b teslimi
[eşleme/seçim doğrulama raporunda](P01B_COMPATIBILITY_VERIFICATION_2026-09-06.md)
tamamlandı; aşağıdaki açık cutover maddeleri bu raporun yazıldığı anı gösterir.
Korunan ortam rollout'u hâlâ ayrı bir kapıdır.

**P0.1a repository foundation: Pass. Full P0.1 exit and retained-environment
rollout: not performed.**

P0.1a sportif organizasyon ve oyuncu yolculuğu dilimi; additive veri modeli,
fail-closed capability sınırı, API, shadcn çalışma alanı ve gerçek PostgreSQL/
Chromium kanıtıyla tamamlandı. Production, klinik veri, external provider ve
retained yerel DB rollout'u bu hükmün parçası değildir. Legacy/new-model
dual-write ve kalıcı Club/Season/Team seçim cutover'ı BL-042 ile P0.1b olarak
kalır.

## Scope verified

- `Person` ve isteğe bağlı `User.personId`; player/staff profil ayrımı.
- Kalıcı `Team`, `ClubSeason`, `TeamSeason` ve legacy group/season mapping.
- Etkili tarihli, kaynak/gerekçe/aktör taşıyan `SportingAssignment`.
- İşlevsel rol ve ayrı capability grant'leri.
- Tarihe göre takım kadrosu, oyuncu dizini ve izin filtreli Player 360.
- U17 ana üyelik → U19 antrenman misafiri → kalıcı U19 geçişi → A takım daveti.
- Mevcut login, hafta, antrenman, taktik, kadro, maç ve dirty-navigation akışları.

## Evidence

| Gate                                         | Result                                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Prisma format / validate / generate          | Pass                                                                                                                         |
| Empty disposable PostgreSQL migration deploy | Pass; six migrations                                                                                                         |
| Legacy-data backfill rehearsal               | Pass; fixture before P0.1 migration and SQL assertions after it                                                              |
| Schema diff after backfill                   | Pass; no difference detected                                                                                                 |
| Sporting focused unit tests                  | Pass; 3 suites / 17 tests                                                                                                    |
| Backend disposable PostgreSQL E2E            | Pass; 2 suites / 28 tests                                                                                                    |
| Frontend unit tests                          | Pass; 7 files / 23 tests                                                                                                     |
| Frontend Chromium E2E                        | Pass; 4 passed / persistent-session opt-in test skipped                                                                      |
| Responsive Player 360                        | Pass; 1440×1024, 1024×900, 390×844 with no horizontal document overflow                                                      |
| Backend/frontend lint and typecheck          | Pass                                                                                                                         |
| Root quality, CDSK and Markdown links        | Pass; 38 backend suites / 396 tests, 7 frontend files / 23 tests, both builds, Sites 4/4, 73 Markdown files / 0 broken links |

The first sandboxed root-quality run reached the frontend build and failed only
because prerender could not bind loopback (`EPERM`). The same unchanged gate passed
outside the sandbox. The first browser run on frontend port 3101 failed before authentication because
the flag-off CORS allowlist intentionally contains fixed loopback ports and not 3101. The same unchanged build passed on the already approved 3500 loopback origin;
this was a test-harness origin choice, not a product assertion failure.

## Security observations

- Cross-club player read and assignment write return 403.
- Client-supplied `clubId`, `createdById` and `source` do not reach persistence.
- Coach access requires a current assignment whose functional role grants the
  requested capability; expired/no grant is denied.
- Player self-view is permitted; another player is not implicitly visible.
- `PLAYER_HISTORY_VIEW` and `AVAILABILITY_VIEW` are evaluated independently.
  Missing availability permission omits the projection.
- Primary create/transition rejects open or bounded date-range overlap. Transition
  closes the old record and creates the new one in a serializable transaction; a
  partial unique index also prevents a second open primary.
- Historical Player 360 results are cut at the requested `asOf`; future planned
  assignments are not exposed in a past snapshot.
- Assignment create/end audit records identify actor, Person, club and minimum
  assignment context without storing a credential.

## Migration and rollback

The P0.1 migration is additive. Backfill maps only legacy facts: group membership
becomes `LEGACY_MEMBER`; it is never guessed to be primary. The verification SQL
is stored under `apps/backend/prisma/verification/`.

Rollback for any retained environment is application-first: stop new sporting
writes, deploy the prior application revision and retain new tables/columns. Legacy
MVP tables remain available. Destructive enum/table removal is not approved for a
data-bearing environment; use a forward-fix migration.

## Remaining risks

- Legacy group/season writes do not yet dual-write to the new kernel and the shell
  still uses its compatibility team/automatic-season scope. BL-042 tracks the
  reconciliation and persistent Club/Season/Team cutover required for full P0.1.
- Pagination and measured performance budgets are `TBD` (BL-043).
- Minor/safeguarding, clinical boundary, retention and legal basis remain an
  explicit production blocker (BL-044).
- Production deployment, provider, backup, observability and formal WCAG targets
  remain outside P0.1.
