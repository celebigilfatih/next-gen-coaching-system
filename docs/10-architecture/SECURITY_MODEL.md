# Security Model

## Tactical V2 persistence — ADR-0036

BL-058b introduces no role or sharing grant. Transaction-scoped authorization
checks club, group, drill ownership and plan source visibility before document
or token validation. PLAYER cannot write. Tokens bind content/resource/source,
not user authority. Serializable conflict returns 409 without silent retry.
Global document mutations remain denied; V1 editorial publish cannot overwrite
an existing V2 drill. Body content is absent from error logs/audit metadata.
The default-off V2 flag is independent of always-on read/downgrade protection.
Rollbacks must retain both protections. [Evidence](../30-quality/TACTICAL_V2_API_2026-09-19.md).

## Professional drill editorial boundary

[ADR-0032–0034](../50-decisions/ADR-0032-professional-drill-versioning-and-age-variants.md)
global egzersiz yazarlığını, uzman incelemesini ve yayını ayırır.
`DRILL_CONTENT_AUTHOR` taslak ve kendi submit işlemini;
`DRILL_CONTENT_REVIEW` başka yazarın incelemesini sağlar. Yazar kendi sürümünü
onaylayamaz. Nihai publish/archive yalnız `SYSTEM_ADMIN`dır ve audit metadata'sı
yalnız drill/version kimliği ile sürüm numarasını taşır.

Kaynak importer'ı yalnız NGCS özgün veya kayıt bazında doğrulanmış CC0/CC BY 4.0
manifestini kabul eder. Lisansı belirsiz/NC/ND/SA içerik, client ownership
alanları ve onaysız global mutation fail-closed reddedilir. Kulüp kopyaları
mevcut tenant/grup/sahiplik sınırlarında kalır.

## Player-note scope and sensitive-content boundary

[ADR-0031](../50-decisions/ADR-0031-player-360-notes-and-controlled-team-sharing.md)
adds `PLAYER_NOTE_VIEW` and `PLAYER_NOTE_MANAGE`. Non-admin access requires an
active same-club staff assignment whose functional role carries the capability;
the source team or an explicit `PlayerNoteTeamGrant` must intersect that assignment.
`PLAYER` is always denied note reads/writes. `SYSTEM_ADMIN` is global;
`CLUB_ADMIN` is restricted to its principal club. Non-admin mutation additionally
requires note authorship. Client-supplied ownership/tenant/version fields outside
the strict contracts are rejected; version conflicts return 409.

Shares are administrator-only, same-club, exclude the source team and require an
active target-player assignment. Note deletion is unavailable; archive/restore
and every update/share change retain immutable revisions. Security audit metadata
contains IDs/category/version/action only. Note body, clinical diagnosis and
psychological assessment are not accepted audit fields or note categories.

## Player-directory scope and summary boundary

[ADR-0030](../50-decisions/ADR-0030-first-team-roster-center-and-player-directory.md)
extends the paged player read without broadening `PLAYER_VIEW`. Team, tenant,
active assignment, capability and optional player-self predicates are applied in
the database before pagination. Search/position totals use the same boundary;
position summaries use the same visible active-team scope. A `PLAYER` therefore
receives only self-scoped items, totals and position counts. Name cursors are
opaque, versioned, sort-bound and non-authoritative; invalid or cross-sort cursor
payloads fail closed with 400.

## Account administration boundary

[ADR-0027](../50-decisions/ADR-0027-account-access-administration.md) exposes an
admin-only account directory without broadening the accepted role model.
`SYSTEM_ADMIN` may inspect platform or explicit club scope; `CLUB_ADMIN` is
server-forced to the current principal club even when another `clubId` is sent.
`COACH` and `PLAYER` are denied by controller and service boundaries. The list
uses a strict query allowlist, bounded cursor pagination and minimum projection;
password hashes, authVersion, tokens and session rows are never returned.

The `/app/settings/users` guard and hidden navigation are defense-in-depth only.
All invite, role/club, status, reset and revoke actions continue through the
existing lifecycle authorization, audit and session-invalidation rules. Operator
mode may reveal a one-time fragment link after creation; SMTP mode never returns
the token. `FunctionalRole`/`RoleCapability` is read-only on this surface;
capability grant mutation remains a separate approval gate.

## BL-046a additive editor read boundary

[ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md) implements
plan-view authorization on both additive editor reads and the existing
plan-drill source-view check on the new single-board read, including snapshots.
This is stricter than the existing nested editor GET; that legacy endpoint and
all write guards remain unchanged. Source checks precede the effective JSON query,
which is bound to the checked source ID as well as plan/phase. Invalid stored JSON
is suppressed, not repaired or replaced; unexpected persistence errors do not
expose raw causes. No new role/capability is granted, and legacy aggregate reads
are not claimed as hardened by this additive change.
[Verification](../30-quality/BL046_EDITOR_READ_FOUNDATION_2026-09-07.md).

## P0.1b compatibility scope

BL-043c retains these same permission rules for paged roster/history reads and
full counters. Person capability checks use relational common-team existence
instead of materializing target assignment arrays; target validity uses asOf,
actor grants use now. Cursor manipulation cannot expand tenant, team or person
scope. See [verification](../30-quality/BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

Membership removal closes the mapped capability-bearing legacy assignment in
the same transaction. Historical `asOf` requests still require an actor grant
valid now; they cannot restore revoked access. New compatibility role defaults
match the accepted backfill and are audited; existing/revoked grants are not
restored. Primary/guest/staff assignments never write GroupMember implicitly.
Mapped Person club moves and role changes with unexpired assignments are guarded
before account mutation. The parity endpoint is admin-only and returns counts.
The frontend stores only user-keyed context IDs, never credentials; every scope is
revalidated from authenticated responses. See [compatibility contract](P01B_COMPATIBILITY_CUTOVER.md).

## Assets and Trust Boundaries

- Kullanıcı kimliği, parola hash'i ve JWT.
- Kulüp, takım, oyuncu, antrenman, katılım, performans ve sağlık verisi.
- HTTP API, Socket.IO bağlantısı, PostgreSQL ve gelecekteki frontend sınırları.

## Enforced Baseline

- Public kayıt kaldırılmıştır. İlk `SYSTEM_ADMIN` tek seferlik operator bootstrap,
  diğer hesaplar ADR-0008 kapsamındaki yetkili, hash-token davet akışıyla oluşturulur.
- ADR-0020 SMTP modunda ham davet/reset tokenını API yanıtı, DB, audit ve logdan
  çıkarır; bağlantı tokenı URL fragment'ında taşınır ve public SPA tarafından
  belleğe alındıktan sonra history'den temizlenir. Delivery ret/timeout'unda token
  revoke edilir ve dış cause gösterilmez. Production operator modunu veya eksik
  SMTP/public-origin yapılandırmasını kabul etmez.
- `recover-system-admin.js` yalnız tam e-postayla bulunan mevcut `SYSTEM_ADMIN`
  hesabını tek transaction'da reaktive eder; parola hash'ini değiştirir,
  authVersion'ı artırır, refresh/reset kayıtlarını revoke eder ve kontrollü approval
  referanslı `SYSTEM_ADMIN_RECOVERED` audit olayı yazar. Kullanıcı oluşturma, rol
  yükseltme, club değiştirme ve sır/PII loglama yolu yoktur.
- Production JWT secret yoksa, kısa ise veya bilinen placeholder ise backend
  fail-closed davranır; development/test eksik secret için process-local rastgele
  değer kullanır.
- Prisma varsayılanı ve açık response projection'ları `passwordHash` alanını
  kullanıcı yanıtlarından çıkarır; authentication sorgusu alanı yalnızca parola
  doğrulama sınırında açıkça seçer.
- Her authenticated HTTP isteğinde JWT `sub` değeriyle güncel kullanıcı veritabanından
  yüklenir; token içindeki eski/oynanmış rol, e-posta veya kulüp iddiası yetki vermez.
- Çekirdek kulüp, grup, antrenman planı, sezon ve katılım işlemleri ortak
  authorization katmanında kulüp/grup üyeliğiyle sınırlandırılır.
- Egzersiz okumaları authentication gerektirir. Global katalog görünürdür;
  kulüp/grup kayıtları tenant ve güncel üyelikle filtrelenir. Koç yalnız atanmış
  grupta kendi egzersizini, kulüp yöneticisi kendi kulübünü, sistem yöneticisi tüm
  kayıtları yönetir.
- Drill create/update body'leri `clubId`, `scope` ve `createdById` ile sahiplik
  kazanamaz; sunucu bunları güncel principal ve grup atamasından türetir. Global
  katalog doğrudan mutate edilmez; uzman onaylı sürüm yalnız `SYSTEM_ADMIN`
  tarafından yayınlanır.
- Plan snapshot ve maç tahtası 250 element/100 KB sınırı ve katı alan/tür
  allowlist'iyle doğrulanır; kaynak egzersiz görünürlüğü mutation sırasında yeniden
  kontrol edilir.
- `SYSTEM_ADMIN` global; `CLUB_ADMIN` kendi kulübü; `COACH` atanmış grupları;
  `PLAYER` kendi profili, grup görünümü ve kendi katılımı kapsamında çalışır.
- Phase 2 sporting endpoint'leri ADR-0023 kapsamında teknik rolün yanında aktif
  `SportingAssignment` ve `RoleCapability` arar. Sistem yöneticisi global,
  kulüp yöneticisi kendi kulübünde yönetim, player yalnız kendi Person kaydında;
  diğer staff ise açık capability ve kulüp/takım kesişiminde çalışır. Süresi bitmiş
  atama yetki vermez.
- Assignment body `clubId`, `createdById` veya `source` ile sahiplik kazanamaz;
  sunucu kulübü hedef Person'dan, aktörü principal'dan ve kaynağı kontrollü sabit
  değerden türetir. Person, Team, TeamSeason ve FunctionalRole kulüpleri mutation
  öncesinde eşleşmelidir. Açık ana üyelik DB constraint'i ve serializable geçiş
  işlemiyle tekildir.
- Player 360 projection'ı `PLAYER_VIEW`, `PLAYER_HISTORY_VIEW` ve
  `AVAILABILITY_VIEW` yeteneklerini ayrı değerlendirir. Yetkisiz uygunluk alanı
  yanıttan çıkarılır; klinik veri veya readiness skoru P0.1'de üretilmez.
- Socket.IO bağlantısı JWT gerektirir, sunucu tarafından türetilen grup odalarına
  katılır, her olayda güncel status/authVersion doğrular ve plan/oyuncu
  mutation'larından önce aynı kaynak kontrollerini uygular.
- ADR-0014 ile Socket alıcı listesi her yayında güncel DB rolü, kulüp/grup üyeliği,
  account status ve authVersion üzerinden yeniden türetilir; operasyon payload'ı
  minimum kaynak kimliğiyle sınırlandırılır. Grup sahibi olmayan plan yayınlanmaz.
- Dashboard drill görünürlüğü `GLOBAL + principal.clubId` predicate'i ve minimum
  projection uygular. Plan/drill ile season-day/plan aggregate'leri group sınırını
  mutation transaction'ı içinde korur; plan grup değişikliği mevcut ilişkileri
  sınır dışına taşıyamaz.
- Kulüp ve grup mutation'ları explicit field projection uygular. `POST /clubs`
  istemci `id`/timestamp/nested ilişki alanlarını Prisma create'e taşıyamaz;
  grup create/update ve membership body'leri yalnız onaylı scalar hedefleri yazar.
  Body hedefli grup create'te tenant yetkisi, geçerli clubId çıkarıldıktan sonra
  diğer alan doğrulamasından önce çalışır. Bu ADR-0007 sınırının uygulanmasıdır.
- Grup silmede üyelik temizliği ve ana kayıt silme tek transaction'dır; ilişkili
  kaynak nedeniyle başarısız ana silme üyelik kaybına yol açmaz. Grup update/delete
  ile duplicate/missing üyelik hata yolları raw driver, cause veya kaynak kimliği
  loglamaz; yalnız sabit olay ve generic 500 üretir. Global redaction/retention ve
  hata-status politikası hâlâ `TBD`'dir.
- Kulüp update ile egzersiz create/update/delete persistence hataları da yalnız
  sabit olay ve cause-free generic 500 üretir. Drill body nesne sınırı controller
  ve servis imzalarında `unknown` olarak ele alınır; update kaynak yetkisi malformed
  body'den önce uygulanır. Bu, mevcut ADR-0007/0012 yetkisini değiştirmez.
- Attendance atomik upsert persistence hataları oyuncu veya plan kimliği
  loglamadan yalnız `ATTENDANCE_MARK_FAILED` ve cause-free generic 500 üretir.
  Plan/oyuncu authorization controller'da önce tamamlanır. ADR-0019 birleşik DB
  constraint'iyle eşzamanlı ilk yazımda tek kayıt garantisi verir.
- Season/week/day/match mutation ve week-generation persistence/missing-record
  yolları kaynak kimliği, Prisma metadata'sı veya cause loglamadan yalnız işlem
  türüne özel `SEASON_*_FAILED` olayları ve cause-free generic 500 üretir. Mevcut
  controller authorization sırası ile transaction içi 400 group/plan doğrulamaları
  korunur. Bu dar containment yeni bir global redaction/retention veya 404
  politikası değildir.
- Training-plan create/update/delete, add/replace drill ve board snapshot
  lookup/write persistence yolları da plan, drill, grup veya hata nesnesi
  loglamadan yalnız işlem türüne özel `TRAINING_PLAN_*_FAILED` olayları ve
  cause-free generic 500 üretir. Mevcut plan/drill authorization sırası,
  transaction içi aggregate 400 kontrolleri ve opsiyonel season-day fail-soft
  bağlantısı korunur.
- Password reset completion, ADR-0015 uyarınca koşullu token claim'i kazanmadan
  parola, authVersion veya audit kaydı yazamaz.
- Tactical renkleri canonical hexadecimal değerlerle sınırlıdır; SVG serializer
  bütün dinamik XML attribute/text değerlerini escape eder.
- Sağlık/klinik endpoint'leri ile ileri analitik tenant modeli onaylanana kadar
  `SYSTEM_ADMIN` ile sınırlıdır.
- Authentication throttling in-memory ve instance-local'dir; proxy/topoloji ve
  dağıtık rate-limit storage kararı production deployment ile birlikte `TBD`.
- Kalıcı tarayıcı oturumu ve production origin sınırı ADR-0010 Option 1 olarak
  `Accepted`; ADR-0018 provider-neutral implementation kapısını açmıştır.
  Backend/frontend flag'leri varsayılan kapalıdır. Açık modda 15m access JWT,
  7d idle/30d absolute refresh, beş aktif family, host-only HttpOnly cookie, exact
  origin ve zorunlu custom CSRF header uygulanır. PostgreSQL user-row lock ile
  rotation tek kazananlıdır; replay/logout/eviction family erişimini HTTP ve Socket
  alıcı/gönderici kontrollerinde keser. Lifecycle revocation authVersion'a ek olarak
  refresh kayıtlarını iptal eder. Production rollout girdileri `TBD` kalır.
- Prisma CLI → `@prisma/config` → `deepmerge-ts` advisory zinciri ADR-0016 ile
  hosted runtime için `not_actionable` sınıflanmış ve production öncesi yeniden
  inceleme koşuluyla geçici kabul edilmiştir. ADR-0017 kabul edilmiş ve Docker
  artifact'larında uygulanmıştır: serving runtime development/optional paketleri,
  Prisma CLI, `@prisma/config` ve `deepmerge-ts` zincirini içermez; CLI ve migration
  ağacı HTTP uygulaması içermeyen ayrı migrator target'ındadır. Production DB rolü,
  credential delivery ve orchestrator sınırı `TBD` kalır.

Kalan maddeler sonraki güvenlik ve production dalgaları için karar girdileridir.

## Identity, Authorization and Audit

- Mevcut teknik roller: `SYSTEM_ADMIN`, `CLUB_ADMIN`, `COACH`, `PLAYER`.
- Phase 2 işlevsel roller (`FunctionalRole`) teknik hesap rolünden ayrıdır ve
  capability grant'leri aktif, etkili tarihli atama üzerinden uygulanır.
- Yalnızca `SYSTEM_ADMIN` globaldir; diğer roller kulüp, grup veya özne sınırında
  çalışır. Baseline, SYSTEM_ADMIN için boş ve CLUB_ADMIN için dolu `clubId`
  constraint'i uygular.
- Çekirdek eylem matrisi ADR-0007 ile bağlayıcıdır ve negatif cross-club testleriyle
  doğrulanır.
- Dashboard, aggregate ve Socket recipient istisnaları ADR-0014 remediation'ıyla
  kapatılmış ve REQ-005 yeniden `Implemented` durumunda doğrulanmıştır.
- Invitation, acceptance, suspension/reactivation, access, password/reset, session
  revocation ve bootstrap güvenlik audit olayları kalıcıdır. Audit retention/export
  ile ileri analitik tenant modeli `TBD`.
- Sporting assignment create/end işlemleri aktör, hedef Person, kulüp ve minimum
  atama metadata'sıyla `SecurityAuditEvent` üretir. Capability yönetim API'si P0.1
  kapsamına açılmadı; grant değişikliği sonraki yönetim akışıdır.

## Team lifecycle authorization — ADR-0028

- İlk `FIRST_TEAM` kaydını yalnız `SYSTEM_ADMIN` oluşturabilir. A Takım adı ve
  kademe etiketini `SYSTEM_ADMIN` ile takım kulübündeki `CLUB_ADMIN` değiştirebilir;
  A Takım hiçbir rol tarafından archive/restore edilemez.
- `ACADEMY` create/edit/archive/restore işlemleri `SYSTEM_ADMIN` veya aynı
  kulübün `CLUB_ADMIN` hesabına açıktır. `COACH` ve `PLAYER` yalnız yetkili
  katalog okumalarını kullanır.
- İstemci `PATCH` ile club, season, classification, archivedAt veya ownership
  alanı atayamaz. Create belirli ve aynı kulübe ait `ClubSeason` gerektirir.
- Aktif katalog/workspace arşivli takımı görünmez sayar. Arşiv kataloğu yalnız
  yöneticilere açıktır; restore aynı kimliği yeniden etkinleştirir.
- Create/update/archive/restore işlemleri actor, club ve team kimliğiyle ayrı
  `SecurityAuditAction` üretir. Raw age label veya persistence cause loglanmaz;
  global audit retention/export politikası yine `TBD`dir.

## Secrets and Sensitive Data

- Secret repository'ye veya loglara yazılmaz; production fallback secret ile
  başlatılmamalıdır.
- Sağlık verisinin hukuki dayanağı, erişim sahipleri, retention ve silme süreci
  `TBD` ve production öncesi açık onay gerektirir.
- Log redaction ve veri sınıflandırma politikası `TBD`.
