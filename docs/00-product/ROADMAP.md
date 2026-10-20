# Roadmap

2026-10-19: ADR-0047 / REQ-033 / BL-068 extends protected SENIOR planning to five
fixtures; all21 weekday combinations and five-match PostgreSQL workflows verified.
[Evidence](../30-quality/FIVE_MATCH_PROGRAM_2026-10-19.md).

2026-10-19: ADR-0045 / REQ-032 / BL-067 extends protected SENIOR planning to four
fixtures; all35 weekday combinations and PostgreSQL four-match workflows verified.
[Evidence](../30-quality/FOUR_MATCH_PROGRAM_2026-10-19.md).

2026-10-19: ADR-0044 / REQ-031 / BL-066 extends SENIOR to three fixtures, using
each consecutive elapsed-hour interval and all existing manual protections.
[Evidence](../30-quality/THREE_MATCH_PROGRAM_2026-10-19.md).

2026-10-19: ADR-0043 / REQ-030 / BL-065 extends SENIOR planning to two-match weeks
with actual-hour interval adaptation and preserved manual/preview time changes.
[Evidence](../30-quality/TWO_MATCH_PROGRAM_2026-10-19.md).

2026-10-19: ADR-0042 / REQ-029 / BL-064 adds fixture-aware SENIOR program updates,
manual edit/deletion protection and atomic conflict rollback to the existing
match-date save. Guarded local enrollment extends the season rollout safely.

2026-10-19: Explicitly requested season extension of BL-063 completed locally:
Spor Manage2026-2027,41 weeks/410 team-week slots,2009 additional physical sessions,
504 meetings,1026 rest entries. Existing week/fixtures preserved; replay writes
nothing. [Evidence](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).

2026-10-19: BL-063 / REQ-028 / ADR-0040 weekly program implemented and approved
local ten-team week populated. Unified calendar/manual events, four-phase sessions,
transactional preview/apply and responsive QA completed. Production excluded.
[Evidence](../30-quality/WEEKLY_CLUB_PROGRAM_2026-10-19.md).


2026-10-19: Onaylı rehberli kulüp kurulumu ve logo/renk teması repository ve
yerel ortamda uygulandı (BL-060, REQ-026, ADR-0037/0038). Production kapsam dışıdır.
[Kanıt](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

| Milestone                               | Outcome                                                                                      | Exit criteria                                                                                                                                           | Status                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| M0 — CDSK başlangıç                     | Kalıcı ve doğrulanmış proje bağlamı                                                          | CDSK validator ve belge kontrolleri geçer                                                                                                               | Completed                                                                                         |
| M1 — MVP karar kapıları                 | Persona, kabul kriterleri, yetki ve veri sınırları onaylı                                    | İlgili Proposed ADR'ler karara bağlanır                                                                                                                 | Completed                                                                                         |
| M2 — Teknik taban doğrulama             | Frontend kaynağı, migration ve kalite kapıları güvenilir                                     | Test/build/migration kanıtları kayıtlıdır                                                                                                               | Completed                                                                                         |
| M3 — Ortak taktik çalışma alanı         | Beş rotalı koç masası, kulüp egzersizi, plan snapshot ve maç tahtası çalışır                 | İki kulüplü E2E, responsive rota, migration ve kalite kapıları geçer                                                                                    | Completed 2026-09-04                                                                              |
| M3.1 — Koç navigasyonu genişletme       | Genel bakış, egzersiz kütüphanesi, yoklama ve ayarlar ortak shadcn shell içinde erişilir     | Dokuz masaüstü menüsü, beşli mobil ana navigasyon ve dört destek rotası browser/design QA'dan geçer                                                     | Completed 2026-09-05                                                                              |
| M3.2 — MVP stabilizasyonu               | Review'daki tenant, group, Socket, dirty navigation, reset ve SVG riskleri kapanır           | ADR-0014/0015; root quality; disposable migration/diff; backend 9/9 ve frontend 3/3 E2E geçer                                                           | Completed 2026-09-05; remediation review Pass                                                     |
| M4 — Production session hazırlığı       | ADR-0010/0018 opt-in kalıcı oturumu ve runtime/migrator artifact'larını production'a hazırla | Domain/provider, proxy/secret, staging ve rollout kapıları onaylanır; gerekli operasyon doğrulamaları geçer                                             | In progress — provider-neutral sessions and artifact split implemented; production inputs TBD     |
| M5 — Phase 2 P0.1 sportif temel         | Kişi/hesap, takım/sezon ve tarihli atama çekirdeğiyle oyuncu yolculuğunu kanıtla             | Additive/backfill migration, capability sınırı, U17→U19→A takım E2E, Player 360, BL-042 atomik legacy eşlemesi ve kalıcı kulüp/sezon/takım seçimi geçer | Completed in repository and approved local environment 2026-09-06; production excluded            |
| M5.1 — Takım yönetimi ve yerel kadrolar | A Takım/altyapı yaşam döngüsü, ayrı navigasyon ve beş yerel 18 kişilik kadroyu doğrula       | Tek aktif A Takım; academy lifecycle; iki canonical sidebar route; 90 benzersiz sentetik ad; unit/browser/CDSK kalite kapıları geçer                    | Completed in approved local environment 2026-09-09; production excluded                           |
| M5.2 — A Takım kadro merkezi            | A Takım route'u ve oyuncu dizinini doğrudan, responsive ve filtrelenebilir hale getir        | Route-preserving takım eşitleme; strict API filtresi/cursor; Player self-scope; shared tablo/kart; kalite ve browser kapıları geçer                     | Completed in repository 2026-09-09; production excluded                                           |
| M5.3 — Profesyonel egzersiz kütüphanesi | Sürümlü, kaynak doğrulamalı, yaş varyantlı global içerik akışını ve 120 Türkçe taslağı kur   | Migration/backfill; author-reviewer-publisher ayrımı; validator/idempotent import; katalog/detail/manage UI; ilk yayında tüm 120 bağımsız onay          | Windows local publication complete under ADR-0041; independent review required for other releases |

Hedef tarihler ve ürün sürümleri `TBD`.

2026-10-19: ADR-0039 / BL-062 ready-exercise planning is implemented and verified
in the repository: shared filters/preview, existing/new plan selection and frozen
age-specific content/duration. Initial all-120 release still requires actual
independent sporting review. This Windows machine's snapshot migration and
DRAFT import were separately gated; local migration/import completed with explicit
2026-10-19 follow-up approval. ADR-0041's same-account local exception was then
explicitly accepted; Fatih Çelebigil's approval and all-120 local publication are
audited. Independent review for other releases/production remains required.
Historical retained-import evidence does
not transfer database records between computers.

BL-043 sonrası BL-046 editör okuma ayrıştırması
[ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md) ile Accepted.
BL-046a/b/c tamamlandı: üç eşleşen 2/50-faz ölçümü ve son QA geçti. BL-043j
karma okuma/yazma ve ayrı SELECT row-work sentetik ölçümü üç temiz başlangıçta
geçti; [kanıt](../30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md).
BL-043 temsilî pilot kabulü owner/workload/ortam/bütçeler TBD olarak açık kalır.
BL-045 ortak sezon etiketi ve regresyonları tamamlandı;
[kanıt](../30-quality/BL045_SEASON_LABELS_2026-09-07.md).
2026-09-07 kullanıcı UI geçiş brief'i ile güncel uygulama önceliği BL-047'dir:
[sekiz aşamalı geçiş](../20-execution/UI_MIGRATION_PLAN.md), faz 1 token temeli
ve mevcut primitive yüzey bağlantıları tamamlandı; faz 2 etkileşim kapısı 12 yeni
test ve yerel browser kontrolüyle geçti. Faz 3 dashboard/settings layout pilotu
ve mobil kullanıcı menüsü düzeltmesi doğrulandı (quality 655/172). Faz 4A hesap
formları tamamlandı (quality 655/188); faz 4B.1 yeni plan diyalogu da geçti
(quality 655/197). Faz 4B.2 sportif atama diyalogu da tamamlandı (quality 655/212,
15 yeni test); seçili faz 4 hedefleri kapalı. Faz 5A ortak sayfalama/veri durumu
Oyuncular/Takımlar pilotu ve atama sayfalama adaptörü geçti (quality 655/226).
Faz 5B katalog/seçenek sayfalaması tamamlandı (15 yeni/39 hedef test);
faz 5C ortak futbol kartları da dört katalogda geçti (4 yeni/34 hedef test,
quality 655/245). Faz 5 bütünü kapalı; sırada faz 6 Hafta modülü vardır.
Faz 6–8 açık;
geniş layout/shell yayılımı faz 6/8'de, tipografi/cascade yakınsaması sıradaki
veri sunumu pilotunda sürer. Yeni ürün
kapsamı veya teknoloji eklenmez. BL-044 ve kalan karar girdilerinin onay planı bekler;
BL-043 temsilî pilot ve M4 production kabulü bu frontend düzeltmesiyle kapanmaz.
M5 yeniden açılmaz, M4 tamamlanmış sayılmaz ve
yeni ürün limiti eklenmez.
[Kapanış](../30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).
