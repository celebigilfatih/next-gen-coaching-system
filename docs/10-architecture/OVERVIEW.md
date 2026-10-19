# Architecture Overview

The approved guided setup is a SYSTEM_ADMIN-only frontend route and one atomic
sporting orchestration API, using existing legacy adapters and durable audit
replay. Club colors derive readable UI tokens for the selected club; semantic
status/pitch/equipment colors remain domain-specific. [ADR-0037](../50-decisions/ADR-0037-guided-club-setup.md),
[ADR-0038](../50-decisions/ADR-0038-club-branding-and-derived-theme.md).

## System Context

Repository, futbol kulübü çalışma verisini yöneten NestJS backend ile koç öncelikli
React/TypeScript frontend prototipini içerir. ADR-0003 normal monorepo topolojisini,
ADR-0009 frontend teknoloji ve ilk ürün akışını, ADR-0011 rotalı shadcn çalışma
alanını ve ADR-0012 ortak taktik belge/yetki sınırını kabul etmiştir.
ADR-0021–0024, tamamlanmış MVP'yi koruyarak Phase 2 ürün, organizasyon,
capability ve provider-neutral intelligence sınırını tanımlar.

## Layers and Responsibilities

- NestJS controller'ları HTTP sözleşmelerini ve bazı guard'ları tanımlar.
- Service sınıfları kullanım akışı ve Prisma sorgularını yürütür.
- Prisma, PostgreSQL veri erişimi ve şema tanımını sağlar.
- Socket.IO gateway, katılım ve plan olaylarını istemcilere yayınlar.
- Sporting modülü kişi/hesap ayrımı, takım/sezon bağlamı, etkili tarihli atamalar,
  tarihsel kadro ve Player 360 okuma modelini yönetir.

## Main Integrations

- PostgreSQL 16 (`docker-compose.yml`).
- Socket.IO/WebSocket.
- Frontend: React/TypeScript, React Router Framework Mode SPA, shadcn/Radix,
  Tailwind CSS, Phosphor ve `react-konva`. Login, dinamik hafta, antrenman,
  etkileşimli taktik, kadro ve maç çalışma alanları ayrı rotalardır;
  bearer JWT yalnız bellekte tutulur ve API tabanı environment ile yapılandırılır.
  Koç oturumu sonrası grup, sezon, plan, takım üyeleri ve katılım REST API'den
  yüklenir; plan/katılım mutation'ları gerçek backend'e yazılır. Sezonun yetkili
  maç kaydı aynı REST sınırından yüklenir; temel rakip/taktik analiz JSON'u, diziliş
  ve koç notu `PUT /seasons/matches/:matchId` ile kalıcılaştırılır. Maç tahtası
  dedicated endpoint ve `Match.tacticalBoard` alanında ayrı saklanır.
  Yaş grubuna uygun drill kataloğu `GET /drills` ile yüklenir; faz/sıra/not ilişkisi
  `PUT /training-plans/:id/drills` ile atomik değiştirilir. Kulüp taktik egzersizi
  katı `TacticalBoardDocumentV1` sözleşmesiyle saklanır; plan fazı kendi
  `boardSnapshot` kopyasını taşır.

## Frontend Design System

Frontend UI foundation note (BL-047, 2026-09-07): semantic shadcn/NGCS values are
centralized in `apps/frontend/src/styles/tokens.css`, imported from `styles.css`.
Existing Radix primitives retain their public props and behavior. Legacy text
color uses an explicit compatibility alias; remaining route CSS is retained until
its consumers migrate. Inactive dark tokens do not mean whole-app dark support.
The layout/pattern/domain boundaries and staged convergence are defined in the
[UI migration plan](../20-execution/UI_MIGRATION_PLAN.md); no new runtime stack,
API, model, permission or session architecture is introduced.

Phase 3 pilot: `components/layout/page-layout.tsx` owns presentation-only
PageContainer, PageHeader and PageActions, consumed by Dashboard and Settings.
Routes retain data reads, context and logout orchestration. Native and asChild
actions inherit consistent typography inside PageActions only; the global native
font rule remains for unmigrated consumers. The shell retains its navigation,
scope and session logic; its user-menu label and avatar visibility are corrected.
Remaining legacy layout consumers migrate incrementally, not through a global reset.

Phase 4A: `components/forms/form-field.tsx` owns label/control spacing and an
Alert-composed form error. Public account routes use those presentation patterns,
existing Input/Button and PageActions; route-owned validation and token/session
orchestration stay unchanged. No form-state/schema package is introduced.
The public NGCS shell remains; obsolete login-only native input/button selectors
are removed after their three consumers migrate. Other legacy form rules remain.

Phase 4B.1 applies those field/error patterns to the training creation dialog.
Only its DialogContent gets a dynamic-viewport height limit and internal scroll;
global dialog primitives and catalog/data orchestration stay unchanged. This
click-driven flow does not gain native required/min/max or implicit form submit.

Phase 4B.2 applies FormField and an owned styled native select to sporting
assignments. NativeSelect is presentation only: native options, keyboard,
required validation and FormData remain. Catalog pagination and pinned selections,
mutation dispatch, authorization and UTC date handling are unchanged. The
assignment dialog now also has a local dynamic-height/scroll limit; only its
unused legacy CSS was removed. No new schema or state library is introduced.

Phase 5A: `components/feedback` owns presentation-only PagePagination and
EmptyState/LoadingState/ErrorState. Players/Teams retain all request/search/
scope orchestration; AssignmentPageControls retains its typed count/total/cursor
adapter. The shared pager accepts caller-owned summary, disabled states and
callbacks; it never calculates totals, changes cursors or fetches records.
Phase 5B adds a separate compact OptionPagination pattern for workspace catalogs
and assignment selectors. It owns no state: adapters retain distinct cursor
commit policies, selection, visibility and labels. Workspace commits on success;
assignment requests change page before resolution and retry at that cursor.
Phase 5C adds `components/domain/football-card.tsx`, a presentation-only
composition over Card primitives for training, match, library and tactics
catalogs. The component owns slots and default/board/match accents only; links,
field values, fallback text, pagination, totals, permission and request behavior
remain route-owned. Card-only legacy selectors were removed after reference
checks. Phase 5 is complete; remaining route consumers migrate in phase 6.

## AI Components

N/A — repository'de model sağlayıcısı, prompt çalışma zamanı veya AI karar akışı
doğrulanmadı.

## Data and Storage

Prisma şeması kullanıcı, kulüp, grup, egzersiz, antrenman, katılım, sezon,
maç, performans, analiz ve sağlık varlıklarına ek olarak `Person`, `Team`,
`ClubSeason`, `TeamSeason`, `SportingAssignment`, `FunctionalRole`, capability,
dış kimlik ve sportif uygunluk varlıklarını tanımlar. P0.1 additive migration'ı
boş ve legacy-verili disposable PostgreSQL 16 üzerinde doğrulanmıştır.

## Deployment Model

Docker Compose PostgreSQL, runtime-only backend ve explicit operations profilli
ayrı migrator tanımlar; ADR-0017 artifact ayrımı uygulanmıştır.
Frontend yerel Vite/Sites-ready build ile doğrulanmıştır; production hosting ve
release modeli `TBD`. ADR-0010, aynı site altındaki ayrı frontend/API origin'leri
ve kalıcı tarayıcı oturumu sınırını kabul eder. ADR-0018 ayrı onayla hash-only
RefreshSession migration'ını ve opt-in login/refresh/logout sözleşmesini uygulamıştır.
Feature flag'ler varsayılan kapalıdır; production rollout hâlâ zorunlu girdileri
bekler. Güncel karar ve kanıt listesi
[M4 rollout girdileri](../40-operations/M4_ROLLOUT_INPUTS.md) içindedir.

## Key Risks and ADR Links

- CDSK benimsenmesi: ADR-0001.
- Dar MVP: ADR-0002.
- Frontend monorepo topolojisi: ADR-0003 Accepted; koç öncelikli teknoloji ve ilk
  akış ADR-0009 Accepted.
- Production origin ve kalıcı oturum: ADR-0010/0018 Accepted; opt-in uygulama
  doğrulandı, production girdileri ve staging/rollback kapıları bekleniyor.
- Çekirdek yetki: ADR-0005 ve ADR-0007 Accepted.
- Rotalı UI ve taktik belge/yetki: ADR-0011 ve ADR-0012 Accepted.
- Phase 2 işletim sistemi, organizasyon ve veri erişim sınırı: ADR-0021–0024
  Accepted; P0.1 repository teslimi M5'tedir.
- Hassas veri ve production kararları production öncesi onay kapısıdır.
