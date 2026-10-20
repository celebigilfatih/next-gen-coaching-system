# Requirements

## REQ-033 — Beş maçlı A Takım haftası (Implemented, 2026-10-19)

Explicit request / ADR-0047 / CR-034 / BL-068. Existing preview/apply and enrolled
date updates accept five SENIOR fixtures, adapting every actual kickoff interval
including adjacent weeks. Preserve manual content/time/exclusion/deletion and
historical decisions; conflicts/faults roll back all date/program changes. Verify
all21 weekday combinations, actual-hour asymmetry, concurrent retry and cross-
Monday behavior. Six-or-more/same-day/sub24-hour contexts remain manual. No new
schema or academy regeneration. Supersedes only REQ-032's five-match exclusion.

## REQ-032 — Dört maçlı A Takım haftası (Implemented, 2026-10-19)

Explicit request / ADR-0045 / CR-033 / BL-067. Existing preview/apply and enrolled
date updates accept four SENIOR fixtures. Each consecutive actual kickoff gap
adapts training, combined briefings and recovery using existing example presets,
including neighboring weeks. Manual content/time pins, exclusions/deletions and
history remain; conflict/fault rolls back all date/program changes. Verify all35
weekday combinations and four-match concurrent retry. Five-or-more/same-day/
sub24-hour contexts remain manual. Supersedes only REQ-031's four-match ceiling.

## REQ-031 — Üç maçlı A Takım haftası (Implemented, 2026-10-19)

Explicit request / ADR-0044 / CR-032 / BL-066. Existing preview/apply and enrolled
date changes support three SENIOR matches. Each consecutive kickoff interval,
including adjacent weeks, independently adapts recovery, short training and
combined briefings with existing example presets. Manual edits/time pins,
exclusions/deletions and historical protection remain. Conflict/late failure
rolls back the entire date/program write; concurrent/same-date retry stays safe.
Four-or-more/same-day/sub24-hour contexts remain manual. No migration or academy
regeneration. Supersedes only REQ-030's three-match exclusion.

## REQ-030 — İki maçlı A Takım haftası (Implemented, 2026-10-19)

Explicit user request / ADR-0043 / CR-031 / BL-065. Preview/apply and enrolled
date reconciliation support two SENIOR fixtures. Actual kickoff intervals,
including adjacent weeks, select compressed recovery/activation/briefings, one
physical session per intervening day up to120 hours. Preserve manual content,
time changes, explicit preview times, exclusions and deletions. Conflicts and
unsupported three-match/same-day/sub24-hour contexts roll back atomically.
Normal seven-day cycles and academy age/school profiles remain. No migration.

ADR-0018 / CR-013 / BL-027 local acceptance follow-up,2026-10-19: explicit user
request to preserve login across reload is fulfilled by enabling both existing
flags. Dashboard/library/training reload and new protected tab verified; existing
logout, revocation and expiry boundaries retained. No new feature or policy.
[Evidence](../30-quality/SESSION_PERSISTENCE_LOCAL_2026-10-19.md).

## REQ-029 — Fikstüre bağlı otomatik program (Implemented, 2026-10-19)

Explicit user request / ADR-0042 / CR-030 / BL-064. Changing a match date/time
reconciles enrolled SENIOR weeks around both old/new dates in the same transaction.
Manual edits protect the whole event; deleted/excluded events are not recreated.
Past/completed/attendance-bearing sessions and manual additions remain. Conflicts
and unsupported congested weeks roll back date and program together. Same-date
retry does not repeat planning. Match detail exposes an authorized date dialog,
readable failures and automatic/protected result counts. No migration/new service.

REQ-028 season extension, explicitly requested2026-10-19: all41 calendar weeks
populated for ten teams; fixture-relative senior and age/school-hour academy
templates, clipped season boundaries, preserved slots/user edits and durable
per-week continuation. No schema/API change. Backend893/HTTP8/operator4 pass;
restored/retained application and replay preserve all original rows.
[Evidence](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

## REQ-028 — Haftalık kulüp programı (Implemented, 2026-10-19)

Source: explicit full-plan user approval, ADR-0040, CR-029, BL-063. Week supports
chronological mixed events, multiple daily sessions, meeting agenda management,
age-specific preview and one atomic multi-team apply. Physical session duration
matches four actual phases; meetings/rest do not inflate training totals. Calendar
changes, overlap, duplicate/concurrent apply, role revocation and cross-club access
are verified. Approved local ten-team example is populated and existing fixtures
preserved. [Evidence](../30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).

## REQ-027 — Hazır egzersizlerden planlama (Implemented; local publication complete)

ADR-0039, CR-028, BL-062. Exact team-age filters and preview; existing/new
plan selection followed by explicit attachment; immutable content/board copies,
frozen duration totals and transactional version/permission checks. Initial
starter release is all 120 independently approved items. Separately approved
retained migration and idempotent 120-DRAFT import are complete. Publication
permission and Fatih Çelebigil's named approval are recorded. The user explicitly
accepted ADR-0041's same-account exception only for this local unchanged package;
all 120 are PUBLISHED with truthful exception audits. Normal independent-review
requirements remain for production/other releases; runtime API guards unchanged.
[Evidence](../30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

Retained browser follow-up: actual A Takım library/existing-plan and in-plan
preview/add verified with two authorized additions; total 121 minutes / 6 entries,
correct saved content/board/day duration and unchanged existing/other records.
[Browser evidence](../30-quality/READY_DRILL_RETAINED_BROWSER_2026-10-19.md).

Responsive follow-up: actual tablet1024/mobile390 filters, preview/Escape and
paginated existing-plan attachment pass. A separate19 May A Takım plan is now
103min/six entries; old phases/source versions/day/earlier desktop plan preserved.
Scrollable filters,44px controls/16px fields and selected-plan date/time summary.
[Responsive evidence](../30-quality/READY_DRILL_RESPONSIVE_BROWSER_2026-10-19.md).

## REQ-026 — Rehberli kulüp kurulumu ve tema (Implemented, 2026-10-19)

Kaynak: açık kullanıcı onayı, ADR-0037/0038, CR-027, BL-060. Kabul: beş adım,
logo/iki renk canlı ve kalıcı tema, optional staff, davetsiz hesap ayrımı; tek
atomik yazım, aktöre bağlı durable replay, roller ve üç viewport doğrulanır.
[Kanıt](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

## REQ-025 — Çok sahneli taktik anlatımı (Implemented; local activation complete)

Source: profesyonel tahta yönü ve sıradaki sözleşme tasarımı isteği; ADR-0036 /
CR-026 / BL-058. A–D onaylandı; BL-058a sözleşme/motor ve BL-058b güvenli
API/token/legacy koruması, BL-058c opt-in sahne editörü ve BL-058d oynatıcı uygulandı;
BL-058e.1 ile maç, e.2 ile taktik egzersiz route'u V1/V2-aware oldu. Egzersiz
başlığı ve belge atomik kaydedilir; kulüp kopyası kaynak yetkisi/token kontrolüyle
oluşur. BL-058e.3 ile antrenman fazı da V1/V2-aware: yalnız açılan faz okunur,
tam sahneli snapshot kaynak değişikliklerinden bağımsız kaydedilir; kaynak
yetkisi, token çakışması ve kaydedilmemiş taslak koruması devam eder.
Birleşik e.4 export/uyumluluk kabulü 2026-10-03 tarihinde geçti. Repository
uygulaması doğrulandı. Kullanıcının 2026-10-19 kontrollü etkinleştirme isteğiyle
Windows yerel retained ortamında V2 kaydı açıldı; ayrı etiketli pilot kullanıldı.
Varsayılan flag kapalı kalır; production/sportif pilot ayrı kapıdır.
[Yerel aktivasyon](../30-quality/TACTICAL_LOCAL_ROLLOUT_2026-10-19.md). Kabul:
sahne oluştur/çoğalt/sırala/sil, doğrusal oyuncu/top oynatma, pause/seek, V1
uyumluluğu, snapshot bağımsızlığı ve eski istemci veri kaybı koruması.
[Önerilen ayrıntılı sözleşme](../10-architecture/TACTICAL_ANIMATION_V2.md).
[Temel doğrulaması](../30-quality/TACTICAL_V2_FOUNDATION_2026-09-19.md).
[API doğrulaması](../30-quality/TACTICAL_V2_API_2026-09-19.md).
[Oynatıcı doğrulaması](../30-quality/TACTICAL_PLAYBACK_2026-09-26.md).
[Maç entegrasyonu](../30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).
[Antrenman entegrasyonu](../30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).
[Birleşik kabul](../30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).

## REQ-024 — Profesyonel 2D taktik çalışma alanı

2026-10-20 follow-up completes all nine shared-art equipment actions with flag,
ladder and marker. Existing dimensions/history/export behavior are retained.
[Evidence](../30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

2026-10-20 selected second equipment concept implemented: six labeled horizontal
actions and pitch objects share the same vector artwork; native document,
identity, size, undo/save and shirt/disc behavior remain. Responsive keyboard
scrolling and shared export parity verified.
[Evidence](../30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

Increment 3 assigns roster-name snapshots to existing formation positions with
confirmation, preserved geometry, cleared numbers and one-step undo. No live
identity linkage. [Evidence](../30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).

Increment 2 includes permission-filtered current-roster name snapshots and
multi-selection/unit operations on the unchanged V1 contract. Persistent
Person binding is not implied. [Evidence](../30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).

Source: ADR-0035 / CR-025. Status: first slice implemented; integrated live
route QA and later roadmap slices remain open (BL-057).
Acceptance: shirt/disc and equipment presentation, pitch-first responsive
layout, zoom/pan/fit and focus controls preserve V1 save/undo/dirty semantics;
SVG shares the canvas geometry and escapes untrusted labels.
[Evidence](../30-quality/TACTICAL_STUDIO_2026-09-19.md).

REQ-014/015 için BL-043a oyuncu sayfalama, sunucu araması ve negatif scope
kanıtları [dilim raporunda](../30-quality/BL043_PLAYER_PAGINATION_2026-09-06.md)
izlenir. Takım/history listesi ve pilot kapasite kabulü bu dilimde tamamlanmış
sayılmaz; BL-043 In progress kalır.

| ID      | Requirement                                                                | Source                       | Acceptance criteria                                                                                                                                                                                                          | Status                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-001 | Sezon bağlamında antrenman planı oluştur ve görüntüle                      | Onaylı ilk hedef             | Plan doğru sezon/takım bağlamıyla geri okunur                                                                                                                                                                                | Implemented — browser E2E verified                                                                                                                                                                                          |
| REQ-002 | Egzersizleri faz ve sırayla plana bağla                                    | Onaylı ilk hedef             | Plan ayrıntısı sıralı egzersizleri içerir                                                                                                                                                                                    | Implemented — browser E2E verified                                                                                                                                                                                          |
| REQ-003 | Oyuncu katılımını plan bazında takip et                                    | Onaylı ilk hedef             | Oyuncu/plan için güncel durum geri okunur                                                                                                                                                                                    | Implemented                                                                                                                                                                                                                 |
| REQ-004 | Temel taktik analiz kaydı oluştur ve güncelle                              | Onaylı ilk hedef             | Analiz kalıcıdır ve yetkili kullanıcıca erişilir                                                                                                                                                                             | Implemented — board persistence verified                                                                                                                                                                                    |
| REQ-005 | Kulüp verisini onaylı rol/yetki sınırlarıyla izole et                      | ADR-0005, ADR-0007, ADR-0014 | Yetkisiz çapraz kulüp ve grup erişimi reddedilir                                                                                                                                                                             | Implemented — dashboard, aggregate and Socket recipient regressions verified                                                                                                                                                |
| REQ-006 | Repository CDSK 0.1.0 yapısına uysun                                       | ADR-0001                     | Resmî CDSK validator geçer                                                                                                                                                                                                   | Implemented                                                                                                                                                                                                                 |
| REQ-007 | Hesapları davetle oluştur, askıya al ve oturumlarını iptal et              | ADR-0008, ADR-0015           | Scope, token replay/concurrency, suspension ve audit testleri geçer                                                                                                                                                          | Implemented — concurrent reset single-winner verified                                                                                                                                                                       |
| REQ-008 | Koçun ilk web akışını haftalık sezon bağlamından yürüt                     | ADR-0009, ADR-0011           | Login, haftalık plan, antrenman ve katılım kritik yolu frontend kalite kapılarından geçer                                                                                                                                    | Implemented — five routes and responsive E2E verified                                                                                                                                                                       |
| REQ-009 | Etkileşimli taktik tahtasını ortak ve sürümlü belgeyle kullan              | ADR-0011, ADR-0012, ADR-0015 | Araçlar, formasyon, undo/redo, açık save, dirty navigation ve güvenli NGCS import/export doğrulanır                                                                                                                          | Implemented — browser navigation and SVG security regressions verified                                                                                                                                                      |
| REQ-010 | Koç atandığı grup için kulüp egzersizi oluşturabilsin                      | ADR-0012                     | Sahiplik, mass-assignment ve çapraz tenant negatif testleri geçer                                                                                                                                                            | Implemented                                                                                                                                                                                                                 |
| REQ-011 | Koç, MVP destek işlevlerine ortak çalışma alanından ulaşabilsin            | ADR-0013                     | Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve Ayarlar rotaları gerçek bağlamla açılır; mobil ana görev navigasyonu korunur                                                                                                   | Implemented — browser and responsive QA verified                                                                                                                                                                            |
| REQ-012 | Kişi ve uygulama hesabını ayrı yaşam döngüleriyle temsil et                | ADR-0022                     | Oyuncu/staff login olmadan var olabilir; mevcut hesaplar deterministik Person kaydına bağlanır                                                                                                                               | Implemented — additive schema and legacy backfill verified                                                                                                                                                                  |
| REQ-013 | Takım, sezon ve sportif atama geçmişini etkili tarihle koru                | ADR-0022                     | Geçici ve ana atamalar birlikte çalışır; ana takım geçişi önceki kaydı kapatır; `asOf` kadroları geçmişi yeniden üretir                                                                                                      | Implemented — PostgreSQL pathway E2E verified                                                                                                                                                                               |
| REQ-014 | Sportif erişimi işlevsel rol ve capability kapsamıyla sınırla              | ADR-0023                     | Team/player/history/assignment/availability erişimi kulüp, takım ve özne kapsamında fail-closed çalışır                                                                                                                      | Implemented — unit and two-club E2E verified                                                                                                                                                                                |
| REQ-015 | Takım çalışma alanı ve Player 360 başlangıç görünümü sun                   | ADR-0022, ADR-0023           | Takım kadrosu ile oyuncu kimliği, atama zaman çizelgesi, uygunluk özeti ve mevcut kanıt 1440/1024/390 px'de okunur                                                                                                           | Implemented — browser E2E verified                                                                                                                                                                                          |
| REQ-016 | Legacy sportif eşlemeyi ve çalışma kapsamını tutarlı koru                  | ADR-0022, ADR-0023, BL-042   | Grup/üyelik/sezon yazımı atomik projection üretir; silmede geçmiş korunur; kullanıcıya bağlı kulüp/sezon/takım seçimi grant, reload, stale response ve dirty-navigation testlerini geçer                                     | Implemented — P0.1b PostgreSQL and browser evidence                                                                                                                                                                         |
| REQ-017 | Antrenman planını güvenli düzenle ve kalıcı sil                            | ADR-0026                     | Başlık/tarih/amaç ve bağlı takvim izdüşümü atomik güncellenir; açık onaylı silme bağlı takvim, katılım, faz ve snapshot kayıtlarını tek transaction'da kaldırır; mevcut rol/tenant sınırları korunur                         | Implemented — unit, frontend and disposable PostgreSQL E2E verified                                                                                                                                                         |
| REQ-018 | Yönetici hesap ve erişim yaşam döngüsünü tek yüzeyden yönetsin             | ADR-0027                     | Admin dizini minimum projection ve tenant sınırı uygular; davet, rol/durum, parola sıfırlama ve session revoke işlemleri mevcut güvenlik korumalarıyla çalışır; sportif capability matrisi salt okunur kalır                 | Implemented — unit, frontend, disposable PostgreSQL E2E and browser QA verified                                                                                                                                             |
| REQ-019 | A Takım ile altyapı takımlarını farklı yaşam döngüleriyle yönet            | ADR-0028                     | Kulüp başına tek aktif A Takım; yalnız sistem yöneticisi ilk kaydı oluşturur; yönetici altyapı create/edit/archive/restore işlemleri seçili sezona bağlı ve atomiktir; geçmiş kayıtlar korunur; koç/oyuncu salt okunur kalır | Implemented — migration/backfill, unit, disposable PostgreSQL E2E and browser QA verified                                                                                                                                   |
| REQ-020 | A Takım ve altyapı çalışma alanlarını ayrı navigasyon hedefleri olarak sun | ADR-0029                     | Sidebar ve mobil Sheet iki ayrı canonical route gösterir; sayfa içi takım sekmesi yoktur; legacy `/app/teams` yönlendirmesi, aktif menü, arama ve mevcut yaşam döngüsü davranışı doğrulanır                                  | Implemented — frontend regression and authenticated browser QA verified                                                                                                                                                     |
| REQ-021 | A Takım kadrosuna doğrudan ve kullanılabilir oyuncu diziniyle eriş         | ADR-0030                     | A Takım route'u çalışma takımını bozulmadan eşitler; responsive liste, URL filtre/sıra, deterministik cursor, Player 360 ve PLAYER self-scope testleri geçer                                                                 | Implemented — backend/frontend/E2E regression and Chrome route smoke verified                                                                                                                                               |
| REQ-022 | Hesaptan bağımsız oyuncuya sürümlü ve takım kapsamlı teknik not ekle       | ADR-0031                     | Notlar Person'a bağlanır; rol/capability/tenant/grant sınırları, revision/409, arşiv/restore, gövde-log gizliliği ve anlaşılır Player 360 akışı testleri geçer                                                               | Implemented — unit/frontend, disposable PostgreSQL E2E, additive local migration and authenticated Chrome desktop flow verified; exact-size responsive evidence TBD                                                         |
| REQ-023 | Profesyonel, sürümlü ve kaynak doğrulamalı egzersiz kütüphanesi sun        | ADR-0032–0034                | 120 özgün Türkçe taslak zorunlu profesyonel alanları/yaş dağılımını/tahtayı/checksum'u geçer; legacy kayıtlar korunur; self-review ve onaysız yayın reddedilir; katalog yalnız yayınlanmış sürümü gösterir                   | Partial — model, API/UI foundation, 120 DRAFT manifest, unit/disposable verification and idempotent retained DRAFT import implemented; independent review for other releases TBD; local publication complete under ADR-0041 |
