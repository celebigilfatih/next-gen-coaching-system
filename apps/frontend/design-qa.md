# Design QA — Koç Operasyon Masası

## Karşılaştırma hedefi

- **Görsel kaynak:** `qa/source-coach-operations-desk.png`
- **Uygulama:** `http://127.0.0.1:4173/app/week`
- **Uygulama ekran görüntüsü:** `qa/implementation-week-1487x1058.jpg`
- **Durum:** Masaüstü, haftalık çalışma alanı, 2 Eylül antrenman planı açık.
- **Viewport:** 1487 × 1058 CSS px.
- **Piksel/density normalizasyonu:** Kaynak 1487 × 1058 px; kaynak için CSS
  boyutu ve üretim DPR değeri N/A. Uygulama 1487 × 1058 CSS px ve 1487 × 1058
  çıktı px olarak yakalandı. İki kanıt da 1:1 piksel boyutunda, kırpma veya yeniden
  örnekleme olmadan aynı karşılaştırma girdisinde incelendi.

## Bulgular

- Actionable P0/P1/P2 fark bulunmadı. Üç panelli kompozisyon, bilgi hiyerarşisi,
  içerik sırası ve ana görev kontrolleri kaynakla aynı görsel yönü koruyor.

## Zorunlu fidelity yüzeyleri

- **Font ve tipografi:** Kaynaktaki dar başlık karakteri Barlow Condensed;
  açıklama ve kontrol metinleri Inter ile karşılandı. Ağırlık, satır yüksekliği,
  hiyerarşi ve taşma masaüstü ile tablet görünümünde okunaklı ve tutarlı.
- **Boşluk ve yerleşim ritmi:** Lacivert navigasyon rayı, dikey hafta seçici ve
  beyaz çalışma düzlemi aynı sırada ve benzer oranlarda. Bölüm ayraçları, satır
  aralıkları ve alt eylem alanı kaynak yoğunluğunu koruyor. 900 × 1024 kontrolde
  yatay taşma yok (`scrollWidth = innerWidth = 900`).
- **Renkler ve tokenlar:** Lacivert yüzey, açık gri hafta kolonu, beyaz çalışma
  alanı, mavi aktif/primary ve amber maç vurgusu kaynakla eşleşen semantik tokenlara
  bağlandı. Kontrast ve aktif durum ayrımı korunuyor.
- **Görsel/asset kalitesi:** Kaynakta fotoğraf, illüstrasyon veya logo asset'i yok.
  Görünen UI ikonları tek bir Phosphor icon ailesinden, keskin ve tutarlı stroke ile
  üretildi; CSS çizimi, emoji veya placeholder asset kullanılmadı.
- **Kopya ve içerik:** Takım, sezon, tarihler, antrenman amacı, dört aşamalı akış,
  süreler ve CTA metinleri kaynakla aynı. Ek katılım ve maç analizi durumları ürün
  bağlamına uygun Türkçe kopya kullanıyor.

## Tam görünüm karşılaştırma kanıtı

Kaynak ve uygulama kanıtı 1487 × 1058 boyutunda aynı karşılaştırma girdisinde
açıldı. Ana bölgelerin oranı, üst hizalar, antrenman akışı, süre kolonu ve alt CTA
grubu görsel hedefle aynı kompozisyonu taşıyor. Kalıcı kontrolü örten taşma,
çakışma, kırpılma veya hiyerarşi kaybı görülmedi.

## Odaklı bölge karşılaştırması

Ayrı kırpılmış odak karşılaştırması gerekmedi: native boyuttaki tam görünümde
başlık, küçük gün etiketleri, ikon stroke'ları, satır ayraçları ve CTA metinleri
okunabilir durumdaydı. Kritik kontroller ayrıca tarayıcı DOM ve etkileşim
kontrolleriyle doğrulandı.

## Etkileşim ve dayanıklılık kanıtı

- `Katılımı aç` katılım görünümünü açtı; Bora Aydın durumu değiştirilince özet
  `5/6 oyuncu mevcut` oldu ve kaydetme sonrası `Katılım listesi kaydedildi` durumu
  gösterildi.
- 6 Eylül maç satırı taktik analiz görünümünü açtı; koç notu düzenlendi ve
  `Maç analizi kaydedildi` durumu gösterildi.
- `Hesap değiştir` `/login` rotasına geçti; etiketli e-posta/parola alanları ve
  giriş kontrolü render edildi.
- 900 × 1024 tablet görünümünde navigasyon kompakt raya dönüştü; içerik ve alt
  eylemler kullanılabilir kaldı, yatay taşma oluşmadı.
- Masaüstü, tablet, katılım, maç ve login kontrollerinde console error/warning yok.

## Açık sorular

- Kalıcı oturum, production hosting ve ölçülebilir erişilebilirlik hedefi ADR-0009
  dışında kaldığı için `TBD`; bunlar bu görsel eşleşmeyi engellemiyor.

## Karşılaştırma geçmişi

### İterasyon 1 — 2026-09-01

- **Önceki P0/P1/P2 bulguları:** Yok.
- **Uygulanan görsel düzeltme:** Yok; ilk normalize edilmiş karşılaştırma actionable
  P0/P1/P2 fark olmadan geçti.
- **Sonraki kanıt:** `qa/implementation-week-1487x1058.jpg`, kaynakla aynı 1487 ×
  1058 viewport ve aynı haftalık antrenman durumu.

## Takip cilası

- [P3] Phosphor ikonları kaynakta görünen ikonlara anlam ve stroke açısından
  yakındır; özel marka ikon seti ileride sağlanırsa optik eşleşme artırılabilir.
- [P3] Production tarayıcı/font rasterizasyonu farklı işletim sistemlerinde küçük
  metrik sapmaları yaratabilir; release tarayıcı matrisi tanımlanınca yeniden
  örneklenebilir.

## Uygulama kontrol listesi

- [x] Kaynak ve uygulama aynı viewport/state ile karşılaştırıldı.
- [x] Zorunlu fidelity yüzeyleri incelendi.
- [x] Ana görev etkileşimleri ve başarı durumları test edildi.
- [x] Masaüstü/tablet taşma ve console kontrolleri yapıldı.
- [x] Actionable P0/P1/P2 bulgu kalmadı.

final result: passed
