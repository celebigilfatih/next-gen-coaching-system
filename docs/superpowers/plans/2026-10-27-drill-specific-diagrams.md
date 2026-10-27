# Hazır egzersiz çizimlerini çalışma organizasyonuyla eşleştirme

**User approval:** 2026-10-27 “Tamam uygulayalım”; önceki24 temel çalışma ×5 yaş,
mevcut plan kopyalarını koruma önerisinin uygulanması.

**Goal:** BL-077/A16'nın dört tekrarlanan geometrisini,24 farklı futbol
organizasyonu ve U12/U14/U16/U18/SENIOR bağlamıyla düzeltmek.

**Boundaries:** React-Konva ve mevcut V1 çizim sözleşmesi/ortak SVG renderer
korunur. Migration/API/dependency yok. `ngcs-starter-v1.json` immutable geçmiş;
aynı120 drillId için `ngcs-starter-diagrams-v2.json` yeni DRAFT revizyon üretir.
Yayımlı sürüm ve PlanDrill snapshot yerinde güncellenmez. ADR-0034/0039/0041'in
yeni sürüm inceleme/yayın kapısı korunur; aynı-hesap istisnası genellenmez.
Mevcut audit belgeleri çalışma ağacına kopyalanmış ve ayrı özgün checkout'ta
korunmuştur. Commit/push kapsam dışıdır.

## Task 1 — İçerik sözleşmesi ve regresyon

- `scripts/drill-diagrams.test.mjs`: eski şablon tekrarını geometry fingerprint
  ile kırmızı göster; yeni pakette24 çalışma geometrisi,120 sabitID, v1 checksum
  değişmezliği, kategori dağılımı, alan içi elemanlar ve açıklama eşleşmesini sınar.
- `scripts/drill-diagrams/diagram-builder.mjs`:750×550 training alanında0–100
  normalize koordinat DSL; player/goalkeeper/ball/cone/goal/zone/line/text,
  mavi düz pas, turuncu kesik koşu, mor kavisli top sürme. DeterministikID.
- Konum/renk değiştirmek tek başına içerik özgünlüğü sayılmaz. Her çalışma
  başlangıç düzeni, görev, başarı ölçütü ve top/oyuncu hareketi taşır. Tek çizim
  çalışma grubu örneğidir; toplam oyuncuların paralel gruplaması metinde açık olur.

## Task 2 —24 çalışma planı

Bağımsız dosyalar; ortak `{age, diagram, area}` bağlamında fonksiyonlar:
`organization`, `steps`, `coachingPoints`, `progressions`, `regressions`,
`equipmentItems`, `rules` ve `boardDocument` döner. Özel futbol iddiaları uzman
onayı sayılmaz; önerilen uygulama DRAFT etiketlidir.

- `warm-cool.mjs`:01–04 ve21–24;8 farklı aktivasyon/toparlanma organizasyonu.
- `technical.mjs`:05–12;8 pas/kontrol/sürme/bitiriş organizasyonu.
- `tactical.mjs`:13–20;8 sahip olma/oyun kurma/pres/geçiş/blok organizasyonu.
- Yaş, grup büyüklüğü ve baskı seviyesi görevle anlamlı biçimde değişir; komşu
  yaş uyarlamaları mevcut modelde aynı çekirdek şemayı kullanır, fark metinde açık.

## Task 3 — Paket, aktarım ve görsel kabul

- `scripts/generate-drill-diagram-pack.mjs`: v1'den stableID/temel metadata alır;
  DRAFT v2 kaynak/checksum, yeni rehber ve çizimleri deterministik üretir.
- Mevcut `import-drill-content.js --file ...` sözleşmesiyle disposable PostgreSQL
  üzerinde120 yeni DRAFT, ikinci aktarım0, eski PUBLISHED/Drill/PlanDrill snapshot
  değişmezliği doğrulanır. Gerçek sportif onay üretilemez.
- Ortak `boardSvg` export'u kullanılarak120 çizim için salt okunur HTML/SVG
  inceleme galerisi üret; yeni bağımlılık ekleme. Galeride yaş/faz seçimi, rehber,
  legend ve DRAFT/inceleme durumu bulunur. Altı temsilci ve24 temel çizim incelenir.
- Tarayıcıda masaüstü/tablet/mobil galeri, PNG/SVG ve gerçek önizleme akışı
  disposable uygulamada doğrulanır; kalıcı yayın kararı somut kanıt sonrası.

## Task 4 — Doğrulama ve kapanış

- Kırmızı/yeşil Node regresyonları; ortak frontend board parser/SVG tests.
- Kök `npm run quality`; gerekli belge, BL-077, CHANGELOG ve Boot güncellemesi.
- Bağımsız kapsam/kod/veri incelemesi; mevcut v1 ve plan snapshot hashleri korunur.
- Yayın kapısı açıksa içeriği incelemeye hazır teslim et; kapı kalkmadan eski
  yayınları overwrite/archive etme. Eksik insan onayı açıkça belirtilir.
