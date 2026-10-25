# Scope

## Approved weekly-planning increment — 2026-10-19

ADR-0040/CR-029 explicitly approves mixed weekly events, optional meeting agenda,
age-specific balanced original CLUB templates, preview/exclusions/time edits and
atomic local application. U8–U16 are exact ages, not nearest published variants.
No global review exception, external content service, clinical data, measured load,
new users/players or production rollout is introduced. Multiple-match weeks use
manual scheduling in the original release; ADR-0043 below extends SENIOR to two.
Existing fixtures remain authoritative.

The subsequent explicit season-wide request extends this local application to
14 August 2026–23 May 2027, preserving populated weeks and existing user edits.
The guarded operator composes existing weekly transactions, with complete
preflight and durable continuation. No automatic background rescheduling or new
season API/schema is introduced. [Evidence](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

Subsequent explicit request approves ADR-0042 / CR-030: synchronous fixture-date
reconciliation of enrolled SENIOR weeks, including adjacent preparation/recovery,
with whole-event protection for manual edits/deletions and conflict rollback.
Existing audit storage supplies immutable ownership checkpoints; no migration,
external scheduler or automatic academy changes. Unknown legacy origins are not
adopted automatically; known local rollout uses a guarded operator.

The subsequent explicit two-match request approves ADR-0043 / CR-031: SENIOR
preview/apply and date reconciliation adapt intervening days to actual kickoff
intervals up to120 hours, preserving manual edits and explicit preview times.
Three-match/same-day/sub24-hour fixtures remain manual; academy profiles unchanged.
No new model, migration, service, measured loads or global content publication.

Subsequent explicit three-match request approves ADR-0044 / CR-032: the same
pairwise elapsed-hour templates support three SENIOR fixtures in preview/apply
and enrolled date updates. Earlier two-match ceiling is superseded; four-or-more,
same-day/sub24-hour contexts remain manual. All manual protections and atomic
rollback remain; no automatic academy or retained fixture changes.

Subsequent explicit four-match request approves ADR-0045 / CR-033: the existing
pairwise elapsed-hour planner accepts four SENIOR fixtures in preview/apply and
enrolled date updates, preserving all manual decisions and atomic conflict guards.
The earlier three-match ceiling is superseded; five-or-more/same-day/sub24-hour
contexts remain manual. No new schema, service, medical data or academy changes.

The explicit five-match request approves ADR-0047 / CR-034: existing pairwise
planning accepts five SENIOR fixtures with the same manual and atomic-conflict
guards. Earlier four-match ceiling is superseded; six-or-more/same-day/sub24-hour
contexts remain manual. No new schema, service, clinical data, academy regeneration
or retained fixture changes.


## MVP In Scope

- Sezon bağlamı ve haftalık/günlük planlama desteği.
- Antrenman planı ve egzersiz ilişkilendirmesi.
- Oyuncu katılım/takip kaydı.
- Taktik, maç ve rakip analizinin temel kaydı.
- Kulüp/grup kapsamlı egzersiz kütüphanesi; ortak etkileşimli taktik tahta;
  antrenman snapshot'ı ve maç tahtası.
- Koç genel bakışı, drill kütüphanesi, plan bazlı yoklama erişimi ve doğrulanmış
  çalışma alanı/oturum ayarları.
- MVP için gerekli kullanıcı, kulüp, takım/grup ve kimlik doğrulama desteği.

## Explicit Non-goals

- Sağlık/sakatlık yönetimini MVP özelliği olarak tamamlamak.
- İleri performans analitiği, scouting veya otomatik risk/skor üretimi.
- Video dosyası yükleme, işleme veya barındırma.
- PlayDrill uyumluluğu, tahta animasyonu ve çok sahneli/video taktik anlatımı.
- AI destekli öneri ya da analiz.
- Native mobil uygulama veya public pazarlama sitesi teslim etmek.

Mevcut backend'de non-goal alanlarına ait prototip kod bulunması onları onaylı
MVP kapsamına sokmaz; kod bu başlangıçta silinmez.

## Later

- Sağlık, rehabilitasyon ve oyuncu yük yönetimi.
- İleri takım/oyuncu performansı ve scouting.
- Video analizi ve AI destekli akışlar.
- Native mobil istemci ve production frontend deployment modeli.

## Phase 2 — Approved Foundation Scope

ADR-0021–0024 ile uzun vadeli ürün sınırı genişletilmiştir; tamamlanmış dar MVP
korunan başlangıç tabanıdır. İlk Phase 2 dilimi P0.1 ile sınırlıdır:

- `Person`/hesap ayrımı, kalıcı `Team`, `ClubSeason`/`TeamSeason` ve tarihli
  sportif atamalar.
- Kulüp ve takım kapsamında işlevsel rol/yetenek yetkilendirmesi.
- Tarihe göre takım kadrosu, oyuncu dizini ve kanıtla sınırlı Player 360 özeti.
- `PlayerGroup`, `GroupMember` ve `Season` için additive uyumluluk/backfill.

P0.1; klinik veri, scouting pipeline, gelişmiş performans, video ingestion,
readiness skoru, AI önerisi, dış sağlayıcı sözleşmesi veya production rollout
içermez. Bunlar ilgili karar ve gizlilik kapıları açılmadan etkinleştirilemez.

## Professional Drill Library — Approved Increment

- 120 özgün Türkçe egzersiz repository manifestinde `DRAFT` hazırlanır.
- Immutable sürüm, U12/U14/U16/U18/A Takım varyantı, TacticalBoardDocumentV1,
  kaynak/lisans/checksum ve author-reviewer-publisher akışı kapsam içidir.
- Rakip içerik kopyalama/scraping, FIFA içeriğini izinsiz ticari kullanma,
  belirsiz/NC/ND/SA lisans, canlı dış aktarım, video/animasyon ve ücretli sağlayıcı
  entegrasyonu kapsam dışıdır.
- Windows retained import/yayın 2026-10-19 ayrı onaylarıyla tamamlandı; production
  import ve diğer yayınlar için bağımsız futbol uzmanı `TBD`dir. ADR-0039 uyarınca ilk yayın tüm 120
  bağımsız onaydan sonra tek pakettir; önceki üç dalga planını günceller.

## Scope Change Policy

2026-10-19: Kullanıcı ADR-0037/0038 ve CR-027 kapsamını açıkça onayladı.
SYSTEM_ADMIN beş adımda yeni kulüp/logo/iki renk, ilk sezon, A Takım/altyapı ve
isteğe bağlı hesapsız teknik kadro kurar. Son kayıt atomiktir; davetler ayrı kalır.
Somut renk migration'ı ayrıca onaylandı. Fikstür importu, otomatik örnek kişi,
genel personel yönetimi ve production rollout eklenmez.

2026-09-19: ADR-0036 / CR-026 çok-sahneli 2D animasyonu ayrı bir Phase 2
artımı olarak **Accepted** durumundadır; kullanıcı A–D paketini açıkça onayladı.
Yukarıdaki non-goal tarihsel MVP sınırıdır. Yeni Phase 2 kapsamı sınırlı sahne/
doğrusal animasyon ve güvenli kayıttır; video/3D/offline ve editorial V2 kapsamı
genişletilmez. [Karar](../50-decisions/ADR-0036-tactical-scenes-and-playback.md).

MVP genişlemesi change request ve açık kullanıcı onayı gerektirir; mimari etkide
ADR hazırlanır.

## Ready drill planning — Approved increment (2026-10-19)

ADR-0039 extends individual exercise planning for existing U12/U14/U16/U18/SENIOR
variants, shared filters/preview and immutable plan content/duration snapshots.
No full-session/weekly templates or nearest-age assignment. Initial 120-item
release requires all independent approvals. Separately approved local migration
and DRAFT import are complete. The explicitly accepted ADR-0041 same-account
exception records Fatih Çelebigil's named approval and all-120 local publication.
This does not constitute independent review or authorize production/future releases.
