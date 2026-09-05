# Design QA — Genişletilmiş Koç Operasyon Masası

## Karşılaştırma hedefi

- **Kaynak görsel doğrusu:**
  `apps/frontend/qa/source-coach-operations-desk.png` — 1487 × 1058 px.
- **Uygulama kanıtı:**
  `apps/frontend/qa/implementation-dashboard-expanded-nav-1440x1024.png` —
  1440 × 1025 px ve
  `apps/frontend/qa/implementation-settings-mobile-390x844.png` — 390 × 844 px.
- **Birleşik karşılaştırma:**
  `apps/frontend/qa/design-qa-comparison-expanded-nav.png` — 2880 × 1024 px.
- **CSS viewport / yoğunluk:** Masaüstü 1440 × 1024 CSS px, mobil 390 × 844 CSS
  px, `devicePixelRatio: 1`. Kaynak görsel 1440 × 1024 alana orantılı küçültülüp
  beyaz pad ile hizalandı; uygulama aynı alana normalize edildi.
- **Durum:** Kaynak Hafta/antrenman ayrıntısı, uygulama yeni Genel Bakış rotasıdır.
  Tam ekran içerik bire bir karşılaştırılmadı; ortak shell, kimlik, tipografi,
  renk, navigasyon ve yoğunluk karşılaştırıldı.
- **Tarih:** 2026-09-05.

## Findings

- Actionable P0/P1/P2 bulgu yok.
- **P3 — Avatar kaynağı farklı:** Kaynak gerçek portre kullanırken uygulama shadcn
  `AvatarFallback` içinde kullanıcı baş harflerini gösterir. Doğrulanmış bir portre
  asset'i bulunmadığı için bu güvenli fallback kabul edildi.

## Beş zorunlu fidelity yüzeyi

- **Font ve tipografi:** Inter gövde ile Barlow Condensed başlık hiyerarşisi
  kaynakla korunuyor. Genişletilmiş menü için yan çubuk metinleri daha yoğundur;
  okunabilirlik ve kesilme sorunu görülmedi.
- **Boşluk ve yerleşim ritmi:** Koyu sabit sidebar, açık çalışma düzlemi ve güçlü
  sayfa başlığı korunuyor. Dokuz giriş üç gruba ayrıldı; üst çubuk yeni bağlam ve
  yardımcı eylemler için bilinçli ek yüzeydir. 390 px'de yatay taşma yoktur.
- **Renkler ve tokenlar:** Lacivert zemin, mavi aktif/primary vurgular, amber maç ve
  bildirim işaretleri ile açık gri çalışma yüzeyi kaynakla eşleşir.
- **Görsel/asset kalitesi:** Uygulama görsel placeholder, emoji veya el yapımı ikon
  kullanmaz. shadcn/Radix primitive'leri ve Phosphor ikonları keskin görünür;
  doğrulanmamış portre yerine baş harf fallback'i kullanılır.
- **Metin ve içerik:** Türkçe görev adları, takım/sezon bağlamı ve gerçek fixture
  verisi görünür. Analiz, scouting, sağlık ve yönetim menüleri MVP dışında tutulur.

## Tam görünüm ve odaklı karşılaştırma kanıtı

Birleşik görselde kaynak ve uygulama yan yana incelendi. Sidebar/brand, aktif menü,
başlık tipografisi, primary mavi, amber vurgular, card sınırları ve açık çalışma
düzlemi yeterince okunabildiği için ayrıca kırpılmış odak görseli gerekmedi. Mobil
kanıtta üst çubuk, Ayarlar kartları ve beşli alt navigasyon birlikte kontrol edildi.

## Etkileşim ve responsive kanıtı

- Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve Ayarlar masaüstü navigasyonundan
  açıldı; beklenen URL ve başlıklar doğrulandı.
- 390 × 844 viewport'ta beşli alt navigasyon ve shadcn `Sheet` tam menüsü görünür;
  Ayarlar Sheet içinden açıldı; `document.body.scrollWidth === 390` doğrulandı.
- Menü araması “Yoklama” girdisini doğru rotaya taşıdı ve alanı temizledi; bildirim
  ve kullanıcı menüsü görünür. Dört destek rotası gerçek workspace bağlamını
  kullanır.
- Tarayıcı error/warning log'u boştu.

## Comparison history

1. İlk kaydedilen masaüstü kanıtının tarayıcı aktarımı düşük ölçekli görünüyordu.
   Gerçek DOM ölçüleri doğrulandı ve native screenshot bytes yeniden kaydedildi.
2. Yeniden yakalanan masaüstü görseli kaynakla birleşik karşılaştırmaya alındı.
   Önceki kanıt aktarım sorunu giderildi; actionable P0/P1/P2 bulgu kalmadı.

## Open Questions

- Formal WCAG hedefi, browser matrisi ve doğrulanmış kullanıcı portresi `TBD`.

## Implementation Checklist

- [x] Kaynak ve uygulama tek birleşik görselde karşılaştırıldı.
- [x] Tipografi, boşluk, renk, asset ve içerik yüzeyleri kontrol edildi.
- [x] Masaüstü destek rotaları ve 390 px mobil navigasyon doğrulandı.
- [x] Console error/warning kontrol edildi.
- [x] Actionable P0/P1/P2 bulgu kalmadı.

## Follow-up Polish

- Doğrulanmış kullanıcı görseli ve yükleme politikası karara bağlanırsa shadcn
  `AvatarImage` etkinleştirilebilir.

final result: passed
