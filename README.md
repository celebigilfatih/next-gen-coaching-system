# Next Generation Coaching System

Bu proje **CDSK 0.1.0** standardını kullanır.

## Proje özeti

- **Problem:** Sezon ve antrenman takibi ile taktik analiz süreçlerini dijital
  ortama taşımak.
- **İlk hedef:** Sezon bağlamında antrenman planlama, katılım/takip ve taktik
  analiz için dar bir MVP oluşturmak.
- **Mevcut durum:** NestJS/Prisma backend prototipi mevcuttur. Güncel çalışma
  bağlamı için [`PROJECT_BOOT.md`](PROJECT_BOOT.md) okunmalıdır.
- **MVP review:** `1b831e0` tabanlı stabilizasyon için 2026-09-05 remediation
  hükmü **Pass**; F-001–F-006 kapalı, açık P0/P1 yoktur. Kanıt için
  [`MVP_REVIEW_2026-09-05.md`](docs/30-quality/MVP_REVIEW_2026-09-05.md) okunmalıdır.
- **Phase 2 P0.1:** Sportif organizasyon, tarihsel takım atamaları ve Player 360,
  atomik legacy eşlemesi ve kalıcı kulüp/sezon/takım seçimi repository içinde
  uygulanıp doğrulandı; kontrollü yerel rollout tamamlandı, production rollout
  yapılmadı. [Yerel geçiş kanıtı](docs/30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).
  Repository kanıtları:
  [P0.1a temel doğrulaması](docs/30-quality/P01_SPORTING_FOUNDATION_VERIFICATION_2026-09-06.md)
  ve [P0.1b eşleme/seçim doğrulaması](docs/30-quality/P01B_COMPATIBILITY_VERIFICATION_2026-09-06.md).
- **Kullanıcı ve yetki yönetimi:** Sistem/kulüp yöneticileri için kapsamlı hesap
  dizini, davet, rol/durum, parola sıfırlama ve oturum iptali
  `/app/settings/users` altında doğrulandı. Sportif capability matrisi görünür
  ancak grant düzenleme ayrı onay kapısıdır. Ayrıntı:
  [ADR-0027](docs/50-decisions/ADR-0027-account-access-administration.md) ve
  [doğrulama raporu](docs/30-quality/ACCOUNT_ACCESS_ADMINISTRATION_2026-09-08.md).
- **Profesyonel egzersiz kütüphanesi:** Sürümlü içerik, yaş varyantı,
  kaynak/lisans/checksum ve ayrık uzman-yayın akışı repository temelinde
  uygulanmıştır. 120 özgün Türkçe kayıt `DRAFT`tır; uzman `TBD` olduğundan
  retained veritabanına alınmamış ve yayınlanmamıştır.
  [Karar](docs/50-decisions/ADR-0032-professional-drill-versioning-and-age-variants.md),
  [kanıt](docs/30-quality/PROFESSIONAL_DRILL_LIBRARY_2026-09-09.md).

## Repository başlangıç sırası

BL-046a tamamlandı: tam hafif faz bilgileri ve tekil tahta okumaları backend'e
eklendi; [ADR-0025](docs/50-decisions/ADR-0025-on-demand-training-editor-boards.md)
**Accepted**. Kaynak yetkisi ve snapshot önceliği doğrulandı; mevcut API'ler,
yazımlar ve yerel veri korunur. BL-046b frontend hafif faz metadata ve açık
“Tahtayı aç” akışına geçti; kaydedilmemiş faz/sekme değişimleri ve undo korunur.
BL-046c üç eşleşen 2/50-faz ölçümü ve son regresyonlarla tamamlandı: 50 fazda
JSON yanıt toplamı 996.545 → 24.040 byte; bu bir production kapasite iddiası değildir.
BL-046 kapalı. [Ölçüm ve kapanış](docs/30-quality/BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md).
BL-043j karma 5 GET/2 POST ve ayrı SELECT row-work ölçümü üç temiz başlangıçta
geçti: 30/300 oyuncu, 150/1500 planda 47 SQL olayı; bazı tarama işleri büyür.
BL-043 pilot kabulü owner/temsilî workload/ortam/bütçe TBD olarak açık kalır.
BL-045 tamamlandı: ortak sezon etiketleri explicit tüm-sezon seçimini gerçek
eksik veriden ayırır; [test ve yerel kanıt](docs/30-quality/BL045_SEASON_LABELS_2026-09-07.md).
Güncel kullanıcı önceliği BL-048 sayfa bazlı shadcn referans geçişidir. Dashboard,
Teams, Matches, Week, Trainings/detail, Library/Tactical Board/editor, Match
detail, Players, Player 360, Squad ve Attendance exact-size masaüstü/tablet/
mobil görsel QA ile geçti; Settings dilimi de aynı kapıyı geçerek onaylı BL-048
sayfa sırasını tamamladı. Sıradaki çalışma ayrı ürün eksikleri auditidir. Yalnız
gerçek API verileri gösterilir; desteklenmeyen modül ve
aggregate içerik eklenmez. Bunun altyapısını oluşturan BL-047 kademeli geçişte
token temeli ve
mevcut primitive etkileşim kapısı ve dashboard/settings ortak layout pilotu
doğrulandı; mobil kullanıcı menüsü düzeltildi. Faz 4A giriş/davet/parola yenileme
ortak form pilotu ve faz 4B plan/sportif atama diyalogları tamamlandı. Faz 5A
Oyuncular/Takımlar ortak veri durumu ve sayfalama pilotu, ardından faz 5B
katalog/seçenek sayfalaması geçti. Faz 5C ortak futbol kartları da antrenman,
maç, kütüphane ve taktik kataloglarında doğrulandı; faz 5 tamamlandı. BL-047 faz
6–8, güncel BL-048 referans sırasının ardından devam edecektir.
[Plan](docs/20-execution/UI_MIGRATION_PLAN.md),
[pilot kanıtı](docs/30-quality/UI_LAYOUT_PILOT_2026-09-07.md).
[Hesap formları](docs/30-quality/UI_ACCOUNT_FORMS_2026-09-07.md).
[Plan diyalogu](docs/30-quality/UI_PLAN_DIALOG_2026-09-07.md).
[Sportif atama diyalogu](docs/30-quality/UI_ASSIGNMENT_DIALOG_2026-09-07.md).
[Veri sunumu pilotu](docs/30-quality/UI_DATA_PATTERNS_2026-09-07.md).
[Seçenek sayfalaması](docs/30-quality/UI_OPTION_PAGINATION_2026-09-07.md).
[Futbol kartları](docs/30-quality/UI_FOOTBALL_CARDS_2026-09-07.md).
BL-044 ve kalan pilot/production karar girdilerinin onay planı açık kalır.
[Yeni ölçüm](docs/30-quality/BL043_READ_WRITE_ROW_WORK_2026-09-07.md).

BL-043i opt-in sentetik karma okuma ölçümünü ekler. 30/300 oyuncuda sayfalı
yanıt boyutu/sorgu sayısı sabit kalırken plan editor grafiği fazlarla büyür;
BL-046/CR-017 artık onaylıdır; production kapasite ve SLO girdileri TBD'dir.
[Ölçüm ve yeniden çalıştırma](docs/30-quality/BL043_MIXED_READ_CAPACITY_2026-09-07.md).

Oyuncular ekranı BL-043a ile sunucu tarafı arama ve 25 kayıtlık sayfalama kullanır.
[Ölçüm ve kalan ölçek işleri](docs/30-quality/BL043_PLAYER_PAGINATION_2026-09-06.md).
Takımlar ve ortak kulüp/sezon/takım seçenekleri BL-043b ile sayfalanır; seçili
kaydı sayfa dışında da korur. BL-043c tarihli kadro ve atama geçmişini sayfalayıp
toplam sayaçları korur. BL-043d seçili legacy metadata ve sayfalı diyalog
seçeneklerini tamamladı. BL-043e.1 antrenman sayfa/tam toplam API'sini ekler;
BL-043e.2 Antrenmanlar ekranını 25'lik sayfalara geçirir. BL-043e.3 Genel Bakış'ın
antrenman/katılım toplamlarını tam sunucu özetinden, son üç planını minimal
kayıtlardan okur. BL-043e.4 Hafta'yı yerel gün sınırlarıyla bağımsız 25'lik plan
sayfalarına geçirir; günlük tam toplamlar korunur. BL-043e.5 Yoklama'yı sayfalı
plan/katılım özetlerine geçirir; tam güncel oyuncu toplamı sunucudan gelir.
Ortak tam plan okuması kaldırıldı. BL-043f.1 Egzersiz Kütüphanesi'ni 25'lik
sayfalara ve sunucu kategori filtresine geçirir; tam toplamlar korunur, kartlara
tahta JSON'u taşınmaz. BL-043f.2 Genel Bakış egzersiz sayacını limit=1 minimal
okuma ve sunucunun tam toplamına geçirir; ayrı yüklenme/hata/yeniden deneme sunar.
BL-043f.3 Taktik Tahtası'nı sunucu belge türü filtresi ve 25'lik sayfalara
geçirir; tam toplam ve mevcut kartlar korunur. BL-043f.4 antrenman detayının
egzersiz seçeneklerini sayfalar; sayfa dışı seçim korunur. Ortak tam egzersiz
okuması kaldırıldı; tekli ekleme mevcut POST ile diğer snapshot'ları korur.
Sonraki g/h dilimleri maç/üye tüketicilerini ayırır; pilot kapasite hedefleri açıktır.
BL-043g.1 minimal/sayfalı maç okuma API'sini ekledi; BL-043g.2 Maçlar ekranını
25 kayıtlık sayfalar, tam toplam ve bağımsız hata/retry ile buna geçirdi.
BL-043g.3 Genel Bakış mevcut tarih sırasındaki ilk üç maçı limit=3 ile okur;
tam toplam ve bağımsız yüklenme/hata/retry sunar. BL-043g.4 Hafta maçları yerel
gün sınırlarıyla bağımsız 25'lik sayfalardan okur; günlük tam toplam ve ayrı
retry sunar. BL-043g.5 maç detayını scope-bound tekil okumaya, shell sayacını
limit=1/tam toplama geçirir. Ortak maç listesi kaldırıldı; workspace metadata
çağrısı maçları yüklemez. Eski backend tam liste sözleşmeleri korunur.
BL-043h.1 Kadro'yu 25'lik üye sayfalarına ve Genel Bakış oyuncu sayacını
limit=1/tam toplam okumasına geçirir. Mevcut grup/rol yetkileri korunur.
BL-043h.2 antrenman yoklamasını bağımsız 25'lik oyuncu/durum sayfalarına ve tam
katılım toplamına geçirir. Plan editörü tüm katılım/grup üyelerini yüklemez;
provider'ın son ortak iş listesi olan members fetch/state kaldırıldı. Açık tekli
katılım yazımı ve hata sonrası bağımsız okuma korunur; eski API'ler uyumludur.
[Yoklama ve ortak üye geçişi](docs/30-quality/BL043_ATTENDANCE_MEMBER_CUTOVER_2026-09-07.md).
[Kadro ve oyuncu sayacı](docs/30-quality/BL043_MEMBER_READS_2026-09-07.md).
[Maç detayı ve ortak liste geçişi](docs/30-quality/BL043_MATCH_CUTOVER_2026-09-07.md).
[Hafta maç okumaları](docs/30-quality/BL043_WEEK_MATCH_READS_2026-09-07.md).
[Genel Bakış maç okumaları](docs/30-quality/BL043_DASHBOARD_MATCH_READS_2026-09-07.md).
[Sayfalı Maçlar ekranı](docs/30-quality/BL043_MATCH_CATALOG_UI_2026-09-07.md).
[Maç okuma temeli](docs/30-quality/BL043_MATCH_READ_FOUNDATION_2026-09-07.md).
[Egzersiz seçicisi ve ortak liste geçişi](docs/30-quality/BL043_DRILL_CUTOVER_2026-09-07.md).
[Egzersiz kütüphanesi geçişi](docs/30-quality/BL043_DRILL_LIBRARY_2026-09-06.md).
[Genel Bakış egzersiz sayacı](docs/30-quality/BL043_DASHBOARD_DRILL_READS_2026-09-07.md).
[Sayfalı taktik kataloğu](docs/30-quality/BL043_TACTICS_PAGINATION_2026-09-07.md).
[Yoklama ve ortak plan geçişi](docs/30-quality/BL043_ATTENDANCE_CUTOVER_2026-09-06.md).
[Hafta okuma geçişi](docs/30-quality/BL043_WEEK_READS_2026-09-06.md).
[Genel Bakış antrenman geçişi](docs/30-quality/BL043_DASHBOARD_TRAINING_READS_2026-09-06.md).
[Antrenmanlar arayüz geçişi](docs/30-quality/BL043_TRAINING_CATALOG_UI_2026-09-06.md).
[Antrenman okuma temeli ve sorgu planları](docs/30-quality/BL043_TRAINING_READ_FOUNDATION_2026-09-06.md).
[Katalog sözleşmesi ve kanıt](docs/30-quality/BL043_WORKSPACE_CATALOGS_2026-09-06.md).
[Kadro/geçmiş kanıtı](docs/30-quality/BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/00-product/CONSTITUTION.md`](docs/00-product/CONSTITUTION.md)
3. [`PROJECT_BOOT.md`](PROJECT_BOOT.md)
4. Ürün, mimari ve ilgili ADR belgeleri
5. [`CHANGELOG.md`](CHANGELOG.md)

## Mevcut teknik yapı

- `apps/backend`: NestJS 11, Prisma 6 ve PostgreSQL kullanan backend.
- ADR-0018 kalıcı oturumu varsayılan kapalı flag'lerle uygular. Opt-in modda reload
  oturumu yeniler ve çıkış server family'yi revoke eder; yerel kurulum ve migration
  sırası [runbook](docs/40-operations/RUNBOOK.md) içindedir.
- `apps/frontend`: React 19/React Router SPA; shadcn/Radix, Tailwind, Phosphor ve
  React-Konva tabanlı “Koç Operasyon Masası”. Genel Bakış, Hafta, Antrenmanlar,
  Egzersiz Kütüphanesi, Taktik Tahtası, Maçlar, Kadro, Yoklama, Ayarlar ve admin
  kapsamlı Kullanıcılar ve Yetkiler rotaları
  ile kulüp egzersizi, plan snapshot'ı ve maç tahtası uçtan uca çalışır. Phase 2
  Takımlar, tarihe göre kadro, Oyuncular ve Player 360 rotalarını aynı shell'e ekler.
- `docker-compose.yml`: Doğrulanmış PostgreSQL ve runtime-only backend servisini;
  açık `operations` profili altında ayrı migrator job'unu tanımlar. İki artifact
  aynı backend Dockerfile, revision ve lockfile'dan üretilir.

## Doğrulanmış geliştirme komutları

Repository kökünde doğrulanmış non-destructive kalite kapısı:

```bash
npm run quality
```

Bu komut backend/frontend typecheck, salt-okunur lint ve format, unit test, build,
Sites worker, Markdown bağlantı, CDSK ve `git diff --check` adımlarını fail-fast
çalıştırır. CDSK checkout'u varsayılan sibling konumda değilse
`CDSK_VALIDATOR=/path/to/validate_project.py` verilir. Dedicated veritabanı isteyen
E2E testleri bu komuta bilinçli olarak dahil değildir.

Backend dizininde:

```bash
npm ci
npm run start:dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Frontend dizininde:

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:e2e
npm run build
npm run test:sites
```

Frontend browser E2E, yalnız dedicated ve silinebilir PostgreSQL hedefiyle çalışır;
zorunlu environment değişkenleri `apps/frontend/README.md` içinde tanımlıdır.

CDSK yapısı yerel kit ile şöyle doğrulanır:

```bash
python3 /Users/fatih/Dev/cdsk/scripts/validate_project.py .
```

Bu doğrulama yolu yerel CDSK checkout'una bağlıdır; taşınabilir validator modeli
`TBD`.
