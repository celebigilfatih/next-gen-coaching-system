# ADR-0036: Çok sahneli taktik belge ve 2D animasyon

- **Status:** Accepted
- **Date:** 2026-09-19
- **Approval:** Kullanıcı A–D teknik paketine 2026-09-19 tarihinde “Onaylıyorum” yanıtı verdi.
- **Related:** ADR-0012, ADR-0025, ADR-0035, CR-026, REQ-025, BL-058.
- **Owners:** Engineering / sporting pilot owner TBD.

## Context

ADR-0035'in üç dilimi saha odaklı editörü, kadro adlarını ve formasyon yerine
atamayı mevcut tek-sahne V1 üzerinde teslim etti. Kullanıcı sıradaki adım olan
sahne/zaman çizelgesi tasarımına devam edilmesini istedi; hazırlanan A–D paketi
ayrı açık onayla Accepted oldu. Uygulama dilimleri ayrıca doğrulanacaktır.

V1 backend doğrulayıcısı yalnız `schemaVersion`, `kind`, `pitch`, `elements`
alanlarını kabul eder. Animasyon alanlarını V1'e eklemek mevcut doğrulamayı
bozar. Plan snapshot ve maç tahtası aynı doğrulayıcıyı; profesyonel egzersiz
sürümleri de V1 diyagramı kullanır. Ayrıntılı kanıt ve önerilen sözleşme:
[Tactical Animation V2](../10-architecture/TACTICAL_ANIMATION_V2.md).

## Seçenekler

| Seçenek | Yarar | Bedel / karar |
| --- | --- | --- |
| A — V2 içinde sıralı, tam V1 sahneleri | Bağımsız snapshot, kolay doğrulama/undo, mevcut renderer yeniden kullanımı | JSON tekrar eder; toplam boyut ve sahne sınırı gerekir. Önerilen. |
| B — Ayrı actor/keyframe-track modeli | Karmaşık hareket ve uzun zaman çizelgesi için daha esnek | Kimlik yaşam döngüsü, interpolasyon ve düzenleme karmaşıklığı bu dilimi büyütür. Ertelendi. |
| C — V1'e opsiyonel animation alanı | Görünüşte az değişiklik | Strict V1 ve eski istemci güvenliğini bozar. Önerilmiyor. |

## Kabul edilen karar paketi

**A. Kapsam ve kullanıcı akışı:** Önce 2D sahne oluştur/çoğalt/sırala/sil,
oynat/duraklat/başa dön, zaman konumu ve hız kontrolü. Hareket yalnız oyuncu,
kaleci ve topun iki sahne arasındaki doğrusal konum geçişidir. Gerçek maç
tracking'i, rota optimizasyonu veya taktik doğruluk iddiası yoktur.

**B. Belge ve limitler:** `schemaVersion: 2`, `kind: tactical-board`,
`scenes[]`; aynı canonical saha, kararlı eleman kimlikleri, sahne başına mevcut
V1 limitleri. Önerilen üst sınırlar 12 sahne, toplam 1.500 eleman örneği,
500.000 UTF-8 JSON byte ve 120 saniyedir. Bunlar ölçülmüş kapasite değil,
onaylanan ürün/savunma limitleridir. Kullanıcı içeriği kırpılmaz.

**C. Saklama ve eski istemci güvenliği:** Mevcut JSON kolonlarında V1/V2
ayrımı; beklenen Prisma migration yok, otomatik backfill yok. Yeni yetkili
document okuma/yazma adaptörleri V2 için zorunlu içerik tabanlı writeToken
kullanır. Eski V1 yazımı mevcut V2'yi ezemez; uyuşmazlık 409 ve taslak korunur.
Bu, son-yazım-kazanır davranışına onaylanmış dar bir istisnadır.
Plan kaynak/snapshot önceliği ve tüm tenant/sahiplik kontrolleri korunur.

**D. Teslim sınırı:** Mevcut React-Konva/shadcn kullanılır; bağımlılık, dış
servis veya vendor eklenmez. V2 JSON bütün sahneleri, PNG/SVG yalnız seçilen
sabit sahneyi dışa aktarır. MP4/GIF, ses/video, çevrimdışı saklama, canlı ortak
düzenleme, Person bağlantısı ve 3D ayrı kararlara bırakılır. Global immutable
egzersiz yayın pipeline'ı ilk dilimde V1 kalır; V2 otomatik yayınlanamaz.

## Etkiler ve onay sınırı

ADR-0012'nin yalnız V1/tek-sahne sınırı bu dilim için kısmen
genişler; rol/tenant kararları değişmez. ADR-0025'in tek etkin belge ve kaynak
kontrolü korunur, yeni document adaptörlerinde writeToken eklenir.
ADR-0012 ve ADR-0025 yalnız bu yeni sürümün kapsamı bakımından kısmen genişler;
eski V1 davranışı korunur. Anayasa değişmez. `SCOPE` içindeki MVP animasyon
non-goal'ı tarihsel MVP sınırıdır; bu karar ayrı bir Phase 2 artımıdır.

Onay, tasarım ve repository uygulama/test paketine ilişkindir. Retained veri
üzerinde dönüşüm/yazım, production rollout veya destructive doğrulama izni
değildir. İlk doğrulamalar yalnız sentetik/disposable verilerle yapılır.

## Uygulama ve kabul

[BL-058 uygulama sırası ve test kapıları](../10-architecture/TACTICAL_ANIMATION_V2.md#uygulama-sırası)
izlenir. V1 regresyonu, strict V2 validator, deterministik oynatıcı, eski istemci
ezme reddi, eşzamanlı yazım, snapshot izolasyonu ve üç viewport kapısı zorunludur.
Yeni format yazıldıktan sonra V1-only backend'e kör rollback yapılmaz; V2-aware
okuyucu ve koruma muhafaza edilerek yeni V2 yazımı kapatılır.

## Açık sorular

Futbol uzmanı/temsilî kulüp, fiziksel tablet modeli, production performans
bütçesi, formal WCAG, offline güvenlik/retention ve 3D sağlayıcısı TBD.
Bu girdiler olmadan Süper Lig/Premier League/La Liga seviyesinde saha kabulü
veya maç içinde kullanım kurallarına uygunluk iddia edilmez.
