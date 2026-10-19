# Change Requests

## CR-026 — Taktik sahneler ve 2D animasyon (Approved, 2026-09-19)

Kullanıcı ADR-0035 sonrası sahne/zaman çizelgesi sözleşmesinin hazırlanmasına
devam edilmesini istedi ve A–D teknik paketini ayrıca “Onaylıyorum” ile kabul etti.
Karar: V1'i koruyan V2 tam-sahne dizisi, sınırlı doğrusal oyuncu/top hareketi,
document token ile atomik yazım ve legacy downgrade reddi; kulüp/plan/maç
entegrasyonu. Yeni limitler ve HTTP boyut kapısı onaylandı; uygulama dilimleri
ayrı doğrulanır. Global editorial
V2, MP4/GIF, offline, Person bağı ve 3D kapsam dışıdır.
[ADR-0036](../50-decisions/ADR-0036-tactical-scenes-and-playback.md),
[sözleşme](../10-architecture/TACTICAL_ANIMATION_V2.md), REQ-025 ve BL-058.
2026-10-03: repository a–e uygulama/kabul kapıları geçti; retained rollout
ayrı onay bekler. Flag/veri değişmedi.
[Birleşik kabul](../30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).

## CR-025 — Profesyonel taktik stüdyosu (Approved; first 2D slice, 2026-09-19)

Kullanıcının “Tamam uygulayalım” onayıyla saha odaklı 2D → kadro → animasyon →
maç günü → 3D yönünde ilerlenir. İlk dilim kompakt editör, forma/disk, ekipman,
zoom/pan/fit ve export tutarlılığıdır. V1 model ve API değişmez. Sonraki
şema/çevrimdışı/paylaşım tasarımları ayrıca somutlaştırılır. ADR-0035, REQ-024,
BL-057 ve [kanıt](../30-quality/TACTICAL_STUDIO_2026-09-19.md).

## CR-024 — Profesyonel egzersiz kütüphanesi (Approved; foundation implemented, 2026-09-09)

Kullanıcı 120 özgün Türkçe egzersiz, immutable sürüm/yaş varyantı, doğrulanmış
kaynak-lisans kaydı ve yazar → uzman → sistem yöneticisi yayın ayrımını onayladı.
Rakip/federasyon içeriği kopyalanmaz veya scrape edilmez; açık içerik yalnız kayıt
bazında doğrulanmış CC0/CC BY 4.0 ile kabul edilir. Additive model, API, katalog/
detay/yönetim yüzeyi ve idempotent DRAFT manifest importer'ı tamamlandı. Ayrı
kullanıcı onayıyla 120 taslak retained local DB'ye idempotent aktarıldı. Adı
belirlenmiş futbol uzmanı ve yayın `TBD`dir. Ayrıntı:
[ADR-0032](../50-decisions/ADR-0032-professional-drill-versioning-and-age-variants.md),
[ADR-0033](../50-decisions/ADR-0033-original-and-open-license-drill-content-policy.md),
[ADR-0034](../50-decisions/ADR-0034-drill-editorial-review-and-publication.md),
REQ-023 ve BL-056.

## CR-023 — Player 360 ve oyuncu notları (Approved; implemented, 2026-09-09)

Kullanıcı Player 360'ı anlaşılır kimlik, gerçek aktivite ve etkili not yönetimi
ile yeniden düzenlemeyi; hesap bulunmayan `Person` oyuncular için sürümlü not,
arşiv/restore ve yönetici kontrollü takım paylaşımını onayladı. Klinik kategoriler,
not gövdesi audit/log kaydı ve otomatik takım devri kapsam dışıdır. Ayrıntı
[ADR-0031](../50-decisions/ADR-0031-player-360-notes-and-controlled-team-sharing.md),
REQ-022 ve BL-055 içindedir.

## CR-022 — A Takım kadro merkezi ve ortak oyuncu dizini (Approved; implemented, 2026-09-09)

Kullanıcı A Takım menüsünün ara yönetim kartı olmadan doğrudan takım kadrosunu
açmasını ve oyuncu listelerinin daha kullanıcı dostu olmasını istedi. A Takım
route'u route-preserving çalışma takımı eşitlemesi, gerçek kapsam özeti, Player
360 ve operasyon bağlantılarıyla kadro merkezine dönüştürüldü. Oyuncu sayfalama
API'si geriye uyumlu pozisyon/sıra filtreleri, deterministik opaque isim cursor'u
ve yetki kapsamlı özetlerle genişletildi. Prisma şeması, migration, veri ve rol
modeli değişmedi. Ayrıntı
[ADR-0030](../50-decisions/ADR-0030-first-team-roster-center-and-player-directory.md),
REQ-021 ve BL-054 içindedir.

## CR-021 — Ayrı takım navigasyonu ve sentetik kadro adları (Approved; implemented, 2026-09-09)

Kullanıcı A Takım ile Altyapı alanlarının sayfa içi sekme yerine sidebar'da ayrı
menüler olmasını ve görünür `Demo Oyuncu NN` adlarının doğal görünümlü rastgele
isimlerle değiştirilmesini istedi. Canonical route'lar ayrıldı; eski adres
uyumluluk yönlendirmesi olarak korundu. Yerel kadrolar her çalıştırmada değişen
rastgelelik yerine 90 benzersiz, deterministik sentetik Türkçe ad kullanır. Yeni
hesap/PII oluşturulmadı; API, şema ve takım yaşam döngüsü değişmedi. Ayrıntı
[ADR-0029](../50-decisions/ADR-0029-separate-team-navigation-and-synthetic-roster-names.md),
REQ-020 ve BL-053 içindedir.

## CR-020 — A Takım ve altyapı takım yaşam döngüsü (Approved; implemented, 2026-09-08)

Kullanıcı kulüp takım yönetimini A Takım ve Altyapı olarak ayırmayı; A Takımı
korumalı ve kulüp başına tek, altyapıyı yönetici tarafından oluşturulabilir,
düzenlenebilir, arşivlenebilir ve geri yüklenebilir yapmayı onayladı. Oluşturma
belirli kulüp sezonuna bağlanır; legacy/canonical projection ile audit yazımları
Serializable transaction içinde kalır. Sabit yaş enum'u mevcut değerler
korunarak doğrulanan serbest kademe etiketine geçirilir. Ayrıntılar
[ADR-0028](../50-decisions/ADR-0028-first-team-and-academy-lifecycle.md), REQ-019
ve BL-051 içindedir. `BL-050` daha önce hesap yönetimine ayrıldığı için bu iş
çakışmasız sonraki kimlik olan `BL-051` ile izlenir.

## CR-019 — Kullanıcı hesabı ve erişim yönetimi (Approved; implemented, 2026-09-08)

Kullanıcının hesap yetkilerini yönetme talebi mevcut Accepted ADR-0005/0007/0008/
0023 sınırlarında uygulandı. Yeni teknik rol veya capability grant politikası
üretilmedi. Admin-only, minimum-projection kullanıcı dizini; davet, rol/kapsam,
durum, parola sıfırlama ve session revoke arayüzü eklendi. Sportif görev/capability
matrisi salt okunurdur. Şema migration'ı veya yeni bağımlılık yoktur.
[ADR-0027](../50-decisions/ADR-0027-account-access-administration.md), REQ-018 ve
BL-050 bu kararı izler.

## CR-018 — Antrenman planı düzenleme ve atomik kalıcı silme (Approved; implemented, 2026-09-08)

Kullanıcı başlık, tarih/saat ve amaç düzenlemesini; planla birlikte takvim
bağlantısı, katılım, faz ve snapshot kayıtlarını açık Dialog onayından sonra
atomik kalıcı silmeyi seçti. Mevcut rol/tenant matrisi, fazlardan türetilen süre,
REST response şekli ve cause-free hata sınırı korunur. Schema migration,
arşivleme, takım taşıma veya optimistic delete yoktur.
[ADR-0026](../50-decisions/ADR-0026-training-plan-edit-and-atomic-permanent-delete.md)
ve BL-049 bu kararı izler.

## CR-017 — Editor payload growth (Approved; implemented and verified, 2026-09-07)

BL-043i measured 34,394→853,304 JSON bytes for 2→50 linked synthetic phases,
despite six SQL queries. See the
[measurement](../30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).
Implement minimal phase metadata plus on-demand selected drill/snapshot reads;
preserve snapshot isolation, ordering, explicit writes and dirty/undo behavior.
No phase cap or data truncation is approved. New product limits need separate
approval. The user directed the next implementation step in response to the
explicit Option A approval question on 2026-09-07.
[ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md) and the
[BL-046 design](../10-architecture/BL046_EDITOR_READ_DESIGN.md) now specify
accepted Option A: complete metadata, one explicitly opened board, coordinated
dirty transitions and existing source-view checks on new board reads, including
snapshots. BL-046a backend reads and BL-046b frontend/draft cutover are verified;
BL-046c matched measurement and final regression also passed: three 2/50-phase
runs, quality/API/browser gates. Implementation closed; performance owner/budget
and broader BL-043 pilot capacity remain TBD/open.
Tracking: BL-046, P2, Done. [Evidence](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).

| ID     | Change                                                                    | Scope impact                                                                    | ADR needed         | Approver                                                                                              | Status                                                                                      |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| CR-001 | CDSK 0.1.0 kullan                                                         | Repository yönetişimi ve bilgi mimarisi                                         | ADR-0001           | Product owner                                                                                         | Approved                                                                                    |
| CR-002 | Dar MVP sınırını benimse                                                  | Ürün kapsamı                                                                    | ADR-0002           | Product owner                                                                                         | Approved                                                                                    |
| CR-003 | Frontend kaynak/topoloji modelini seç                                     | Repository ve delivery mimarisi                                                 | ADR-0003           | Product owner                                                                                         | Approved                                                                                    |
| CR-004 | Şema/migration geçmişini uzlaştır                                         | Veri modeli ve migration                                                        | ADR-0006           | Product owner approval; named data owner TBD                                                          | Approved                                                                                    |
| CR-005 | Çekirdek rol ve tenant matrisini uygula                                   | Güvenlik                                                                        | ADR-0005, ADR-0007 | Product owner approval; named security owner TBD                                                      | Approved                                                                                    |
| CR-006 | Sağlık ve ileri analitik veri politikasını onayla                         | Güvenlik ve gizlilik                                                            | Evet, TBD          | Product owner / security owner TBD                                                                    | Proposed                                                                                    |
| CR-007 | Frontend teknoloji ve ilk ekran akışını seç                               | Ürün ve frontend mimarisi                                                       | ADR-0009           | Product owner approval; named frontend owner TBD                                                      | Approved                                                                                    |
| CR-008 | Davet tabanlı hesap yaşam döngüsünü uygula                                | Auth, veri modeli ve audit                                                      | ADR-0008           | Product owner approval; named security owner TBD                                                      | Approved                                                                                    |
| CR-009 | Same-club cross-group aggregate ve Socket recipient sınırını kapat        | Güvenlik, API/event sözleşmesi ve veri ilişkileri                               | ADR-0014           | Explicit user approval; named security owner TBD                                                      | Approved and verified                                                                       |
| CR-010 | Password reset token tüketimini single-winner atomik yap                  | Güvenlik ve transaction davranışı                                               | ADR-0015           | Explicit user approval; named security/data owner TBD                                                 | Approved and verified                                                                       |
| CR-011 | Prisma CLI advisory için kanıtlı geçici risk kabulü                       | Dependency security ve production gate                                          | ADR-0016           | Explicit user approval; named security/operations owner TBD                                           | Approved                                                                                    |
| CR-012 | Backend runtime image ile migrator artifact/job'u ayır                    | Deployment mimarisi, image içeriği ve DB yetkileri                              | ADR-0017           | Explicit user approval; named operations owner TBD                                                    | Approved and verified                                                                       |
| CR-013 | Provider-neutral kalıcı oturum ve onaylı süre/retention politikası        | Auth API, frontend, additive migration ve güvenlik                              | ADR-0018           | Explicit user approval; named security/operations owner TBD                                           | Approved and verified — production rollout TBD                                              |
| CR-014 | Attendance kaydını `(planId, playerId)` için atomik ve tekil yap          | Veri modeli, migration, concurrency ve son-yazım davranışı                      | ADR-0019           | Explicit user approval; named data/product owner TBD                                                  | Approved and verified                                                                       |
| CR-015 | Davet/reset e-postası ve mevcut admin için break-glass recovery ekle      | Dış servis, public auth UI/API, additive audit migration ve operasyon güvenliği | ADR-0020           | User approved Option A on 2026-09-06; named security/operations owner TBD                             | Approved and implemented — provider/account and production rollout TBD                      |
| CR-016 | Phase 2 P0.1 sportif organizasyon ve oyuncu yolculuğu temelini uygula     | Ürün sınırı, veri modeli, API/yetki, takım ve Player 360 frontend'i             | ADR-0021–0024      | User approved decisions A–D and implementation on 2026-09-06; named product/data/security owner TBD   | Approved — repository and controlled local rollout verified; production TBD                 |
| CR-017 | Antrenman editörü tahta payload büyümesini isteğe bağlı okumaya geçir     | API projection, frontend dirty-state ve ölçüm                                   | ADR-0025           | User approved Option A on 2026-09-07; named owner TBD                                                 | Approved and verified                                                                       |
| CR-018 | Antrenman düzenleme ve atomik kalıcı silme yaşam döngüsünü uygula         | UI, API transaction, takvim/katılım/faz ilişkileri                              | ADR-0026           | User approved hard delete and title/date/purpose edit on 2026-09-08; named product/data owner TBD     | Approved, implemented and verified                                                          |
| CR-019 | Kullanıcı hesabı ve erişim yönetimi yüzeyini uygula                       | Güvenlik, hesap dizini API'si ve admin UI                                       | ADR-0027           | User requested implementation on 2026-09-08; named product/security owner TBD                         | Approved, implemented and verified                                                          |
| CR-020 | A Takım tekilliği ve altyapı takım yaşam döngüsünü uygula                 | Veri modeli/migration, takım API/yetkisi ve iki sekmeli yönetim UI'ı            | ADR-0028           | User approved the implementation plan on 2026-09-08; named product/data/security owner TBD            | Approved, implemented and verified                                                          |
| CR-021 | A Takım ve altyapıyı sidebar'da ayır; sentetik kadro adlarını doğallaştır | Frontend route/navigation ve kontrollü yerel fixture verisi                     | ADR-0029           | User explicitly requested both changes on 2026-09-09; named product owner TBD                         | Approved, implemented and verified                                                          |
| CR-022 | A Takımı doğrudan kadro merkezine geçir; oyuncu dizinini iyileştir        | Player list API/query/cursor ve ortak responsive UI                             | ADR-0030           | User explicitly approved the implementation plan on 2026-09-09; named product owner TBD               | Approved, implemented and verified                                                          |
| CR-023 | Player 360 ve takım kapsamlı sürümlü oyuncu notlarını uygula              | Additive veri/migration, yetki/API, revision ve responsive Player 360 UI        | ADR-0031           | User explicitly approved the implementation plan on 2026-09-09; named product/data/security owner TBD | Approved and implemented; desktop browser flow verified, exact-size responsive evidence TBD |
| CR-024 | Profesyonel sürümlü egzersiz kütüphanesi ve 120 taslak paketini uygula    | Additive veri/migration, kaynak-lisans, yayın yetkisi, katalog/detail/manage UI | ADR-0032–0034      | User explicitly approved the implementation plan on 2026-09-09; named football/legal owner TBD        | Approved; repository foundation and DRAFT package implemented, expert review/publication TBD |
