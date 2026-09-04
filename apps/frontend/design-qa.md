# Design QA — Koç Operasyon Masası

## Karşılaştırma hedefi

- **Kaynak:** `qa/source-coach-operations-desk.png` (1487 × 1058).
- **Yeni kanıt:** `qa/implementation-week-1440x1024.png`,
  `qa/implementation-week-1024x900.png`, `qa/implementation-week-390x844.png` ve
  `qa/implementation-tactics-1440x1024.png`.
- **Tarih:** 2026-09-04.
- **Durum:** Playwright tarafından dedicated PostgreSQL fixture'ıyla yakalandı;
  görseller native CSS viewport boyutundadır.

## Sonuç

Mevcut kimlik korunmuştur: koyu lacivert navigasyon, açık çalışma düzlemi, mavi
aktif/primary durumlar, amber maç kartı, Inter gövde ve Barlow Condensed başlıklar.
Kaynağın görev hiyerarşisi yeni adreslenebilir rotalara uygulanmıştır. Yeni hafta
kartları kaynak üç-panelli ekranın bire bir kopyası değildir; ADR-0011 ile onaylanan
dinamik hafta/çoklu görev yapısının bilinçli sonucudur.

## Viewport kontrolleri

- **1440 × 1024 masaüstü:** Beş etiketli navigasyon öğesi, yedi gün, gerçek plan ve
  maç kartı aynı çalışma düzleminde görünür. Taktik editöründe metadata, komut çubuğu,
  araç rayı, saha, klavye katman listesi ve özellik sekmesi birlikte kullanılabilir.
- **1024 × 900 tablet:** Navigasyon ikon rayına daralır; erişilebilir isimler
  korunur. Hafta yatay kaydırılabilir; üst kontroller ve içerik çakışmaz.
- **390 × 844 mobil:** Beşli alt navigasyon, hafta özeti ve yatay gün kartları
  okunur. Taktik tahta mobilde yatay kaydırma ile görüntülenebilir; masaüstü editör
  yoğunluğunu küçük ekrana zorla sıkıştırmaz.

## Etkileşim kanıtı

Playwright 2/2 geçti: koç kulüp tahtası oluşturdu, egzersizi yeniden açtı, antrenman
fazına snapshot kaydetti, maç tahtasını kaydetti ve ikinci kulüp erişimi `403` aldı.
Aynı suite beş ana rotayı üç viewport'ta açtı, başlık ve aktif navigasyonu doğruladı.
Test sırasında console kaynaklı uygulama hatası kalmadı.

## Açık sorular

- Formal WCAG hedefi, browser matrisi ve özel marka ikon seti `TBD`.
- Production hosting ve kalıcı oturum ADR-0010 `Proposed` kapsamındadır.

## Uygulama kontrol listesi

- [x] Kaynak görsel kimlik ve yeni uygulama kanıtları karşılaştırıldı.
- [x] 1440 masaüstü, 1024 tablet ve 390 mobil görünüm kontrol edildi.
- [x] Ortak taktik editörü masaüstünde görsel ve işlevsel doğrulandı.
- [x] Kritik görev akışı ve tenant reddi gerçek API ile test edildi.
- [x] Actionable P0/P1/P2 görsel bulgu kalmadı.

final result: passed
