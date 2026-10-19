# Taktik animasyon V2 — kabul edilen uygulama sözleşmesi

**Status: Accepted; BL-058a–e repository acceptance passed.** 2026-10-03. ADR-0036 / CR-026 /
REQ-025 / BL-058. A–D kullanıcı tarafından onaylandı. Belgedeki GET/PUT document
adaptörleri backend'de uygulandı; V2 yazımı varsayılan kapalı. Ortak editör V2'yi
destekler. BL-058e.1 maç, e.2 taktik egzersiz ve e.3 antrenman fazı route'una
bağlandı. Birleşik e.4 kabulü geçti; retained rollout ayrı onay bekler ve V2
yazımı kapalıdır.

## Kanıtlanan başlangıç ve etki alanı

- [Backend V1 doğrulayıcı](../../apps/backend/src/tactics/tactical-board.ts):
  schemaVersion 1, strict alanlar, 250 eleman ve 100.000 byte.
- [Frontend V1 model/validator](../../apps/frontend/src/lib/tactical-board.ts):
  tek pitch/elements; frontend/backend paritesi yeni ortak fixture'larla
  doğrulanmalıdır, otomatik olarak eşit oldukları varsayılmaz.
- [Editör](../../apps/frontend/src/components/tactics/tactical-board-editor.tsx):
  tek document timeline, 50 geri alma geçişi, explicit Save ve dirty guard.
- [Prisma](../../apps/backend/prisma/schema.prisma): `Drill.jsonData`,
  `PlanDrill.boardSnapshot`, `Match.tacticalBoard` JSON alanları; ayrıca
  `DrillVersion.boardDocument` yayın akışına aittir.
- [Plan tekli okuması](../../apps/backend/src/training-plans/training-editor.service.ts)
  snapshot önceliğini ve kaynak yetkisini korur; bozuk snapshot'ta kaynağa düşmez.
- [Drill servisi](../../apps/backend/src/drills/drills.service.ts),
  [plan controller](../../apps/backend/src/training-plans/training-plans.controller.ts),
  [maç controller](../../apps/backend/src/seasons/seasons.controller.ts) ve
  [editorial DTO](../../apps/backend/src/drills/drill-content.dto.ts)
  belge kabul/yazım noktalarıdır. Yalnız bir validator değiştirilmesi yeterli değildir.
- [HTTP bootstrap](../../apps/backend/src/main.ts) özel JSON boyut limiti
  belirtmez. V2 gövde limiti adapter seviyesinde açıkça tanımlanıp HTTP'de
  ölçülmelidir; yalnız domain limitini yükseltmek yeterli sayılmaz.

## Kabul edilen belge

```ts
type TacticalBoardDocument = TacticalBoardDocumentV1 | TacticalBoardDocumentV2;
type TacticalBoardDocumentV2 = {
  schemaVersion: 2;
  kind: 'tactical-board';
  scenes: Array<{
    id: string;
    title: string;
    holdMs: number;
    transition: 'cut' | 'linear';
    transitionMs: number;
    board: TacticalBoardDocumentV1;
  }>;
};
```

`scenes` dizisi tek sıra kaynağıdır; ayrıca `order` alanı yoktur. Oynatma zamanı,
seçili sahne, hız, zoom, selection ve çalışma takımı belgeye yazılmaz.
Sahne süresi antrenman/egzersiz süresi değildir; `totalDuration` değişmez.

### Sınırlar ve kimlik

- 1–12 sahne; sahne başına geçerli V1 ve en fazla 250 eleman/100.000 byte.
  Bütün sahnelerdeki eleman sayılarının toplamı en fazla 1.500; bütün V2 JSON
  en fazla 500.000 UTF-8 byte. Boyut sıkıştırma öncesi ölçülür.
- Sahne kimliği V1 eleman kimliğiyle aynı karakter/uzunluk kuralına uyar ve
  belge içinde benzersizdir. Başlık trim sonrası 1–80 karakter, düz metindir.
- Tüm sahnelerin canonical pitch türü/ölçüsü aynı olmalıdır. Çok-sahneli belgede
  saha türü değişimi ilk dilimde kapalıdır; sessiz koordinat dönüşümü yapılmaz.
- Bir elemanın aynı `id`si farklı sahnelerde aynı taktik nesnedir, Person değildir.
  Aynı id farklı type ile kullanılamaz. Her sahne kendi içinde benzersizdir.
  Sahne çoğaltma yeni scene id üretir ama element id'lerini korur. Eleman
  çoğaltma yeni id üretir; silip yeni eklemek eski oyuncunun devamı sayılmaz.
- Null, bilinmeyen alan/tür/sürüm, mükerrer id, NaN/Infinity, hatalı pitch,
  kesirli/negatif süre veya aşılmış limit bütün belgeyi reddeder. Trim dışında
  sessiz veri düzeltme, eleman/sahne atma veya V1'e indirme yoktur.

### Zaman çizelgesi ve hareket

Her sahne önce `holdMs` boyunca sabit gösterilir; ardından `transitionMs`
boyunca sonraki sahneye geçer. Toplam süre bu alanların toplamıdır:

- `holdMs`: 0–30.000 tam sayı; toplam belge süresi 1–120.000 ms.
- `cut` için transitionMs 0; `linear` için 100–10.000 ms.
- Son sahne `cut/0` ve en az 1 ms hold ile biter; son kare görünür kalır.
- Önerilen yeni sahne varsayılanı hold 2.000 ms; kullanıcı hareket seçerse
  transition 1.000 ms. Sahne çoğaltırken önceki son sahnenin geçişi kullanıcı
  seçmeden otomatik animasyona dönmez. Sıra değişiminde yeni son sahne cut/0
  olur; bu değişim aynı undo işleminin parçası ve UI'da açıklamalıdır.
- Ortak id/type taşıyan `player`, `goalkeeper`, `ball` için yalnız x/y doğrusal
  interpolasyon: `p(t) = p0 + (p1-p0) * clamp(t / transitionMs, 0, 1)`.
  Yön, boyut, isim, numara, takım rengi ve diğer nesneler geçiş boyunca kaynak
  değerinde kalır; hedef sınırında hedef sahneye geçer.
- Kaynakta olup hedefte olmayan nesne sınırda kalkar; yeni nesne sınırda görünür.
  Ok/eğri çizimi otomatik koşu veya top uçuş rotası değildir. Fizik, çarpışma,
  parabol, easing, otomatik hız/performans çıkarımı bu dilimde yoktur.
- Oynatıcı geçmiş/geçmiş-dışı zamanlardan bağımsız saf `document + time`
  değerlendirmesi kullanır. Kare kaçması toplam süreyi değiştirmez. Pause,
  seek ve başa dön aynı zaman için aynı çıktıyı verir; son bitiş kesin hedef
  sahnedir. Sıfır-hold/cut ardışıkları dizide ileri doğru çözülür, döngü yaratmaz.

## Koç akışı ve erişilebilirlik

1. V1 kayıt normal açılır; otomatik V2 dönüşümü olmaz. “Animasyon oluştur”
   tek sahneli V2 taslağı yaratır, tek undo ile geri döner; Kaydet gerektirir.
2. Saha altında isimli sahne şeridi: ekle (seçili sahneyi çoğalt), çoğalt,
   sola/sağa taşı ve açık onaylı sil. Son kalan sahne silinemez.
3. Sahne seçimi aynı taslağın parçasıdır; seçim oynatmayı durdurur, belgeyi
   kirletmez. Her düzenleme, geçiş veya sahne işlemi belge düzeyinde tek undo'dur.
4. Oynat/duraklat/başa dön, zaman göstergesi ve etiketli slider; 0,5×/1×/2×
   hız ve loop oturumluk tercihtir. Varsayılan loop kapalı ve autoplay yoktur.
5. Playback sırasında editing/drag/import/save devre dışıdır; pause sonrası
   düzenleme açıkça seçili sahnede yapılır, interpolasyon karesi kaydedilmez.
   Gizli sekme, dialog, scope/route değişimi oynatmayı durdurur.
6. Kısayollar form/slider/dialog odağını çalmaz. Reduce-motion tercihinde
   otomatik geçiş yoktur; kullanıcı açık oynatma seçer veya sahne adımlarıyla
   ilerler. Zaman değişimi her kare ekran okuyucuya anons edilmez.
7. Read-only kullanıcı yalnız mevcut yetkili belgeyi oynatır. Yeni rol veya
   paylaşım linki açılmaz. Önceki taslak, yetki/hata/409 durumunda korunur;
   scope değişiminde başka takıma otomatik kaydetme yapılmaz.

## Saklama, API ve eski istemci koruması

İlk hedef kulüp taktikleri, plan snapshot'ı ve maç tahtasıdır. Fiziksel kolon
ekleme beklenmez; yine de JSON sözleşmesi veri modeli değişikliğidir ve ADR
onayı gerektirir. Mevcut V1 kayıtlar ve JSON manifestleri olduğu gibi kalır.
İlk dilimde GLOBAL drill'e V2 yazımı SystemAdmin için de kapalıdır; yayın
workflow'u uyarlanmadan arka kapı oluşturulmaz. V2 yeni yazımlarının backend
kapısı `TACTICAL_V2_WRITES_ENABLED` olarak uygulanmıştır ve varsayılan false olur;
V2 okuma ve downgrade koruması bu flag'den bağımsız kalır.

Uygulanan additive `GET`/`PUT` document adaptörleri:

| Kaynak | Yeni yol | Mevcut yetki temeli |
| --- | --- | --- |
| Egzersiz | `/drills/:id/tactical-document` | drill-view / drill-manage, kulüp sahipliği |
| Plan fazı | `/training-plans/:planId/drills/:planDrillId/tactical-document` | plan-view/manage + plan-drill source-view |
| Maç | `/seasons/matches/:matchId/tactical-document` | match-view / match-manage |

GET `{document, writeToken}` döndürür; document, mevcut boş kaynakta null olabilir.
PUT yalnız `{document, expectedWriteToken}` kabul eder; başarı aynı zarfı yeni
token ile döndürür. Yetki body/token kontrolünden önce doğrulanır. Token erişim
yetkisi sağlamaz. URL/JSON içinde sahiplik veya Person kimliği kabul edilmez.

- writeToken sunucunun resource identity + canonical JSON içerik/provenance
  hash'idir (SHA-256, nesne anahtarları sıralı, diziler sıralı); istemci opaque
  kabul eder. Plan için snapshot yokluğunda seçili source id ve etkin kaynak
  belge hash'i de token'a girer. Null ayrı sentinel'dır. Yeniden aynı içeriğe
  dönüş aynı token'ı verebilir; bu bir revision/audit sıra numarası değildir.
- PUT, mevcut kaynak/etkin belgeyi transaction içinde yeniden okur, token ve
  yetki sınırlarını yeniden denetler ve karşılaştırma+yazımı atomik yapar.
  İki farklı eşzamanlı değişiklikten biri kazanır; diğeri 409 alır. Serializable
  retry eski token'ı yeni token gibi kabul edemez.
- Eksik token 400, farklı token 409, yanlış belge 400, fazla HTTP gövdesi 413;
  mevcut 401/403/404 ve generic persistence hata sınırları korunur. Body veya
  oyuncu isimleri loglanmaz. UI otomatik force-overwrite/retry yapmaz.
- Legacy V1 uçları V1 kayıtlarla çalışmaya devam eder. JSON değiştiren tüm
  yollar mevcut V2 üzerine V1/legacy/null yazımını transaction içinde 409 ile
  reddeder; yalnız metadata güncellemesi belgeyi korur. Eski okuyucu V2'yi boş
  tahta gibi açamaz. V1'e dönüş yalnız seçili sahnenin ayrı dosya/kayıt kopyasıdır.
- V2 oluşturma yeni kulüp kaydı için validated create yolunda desteklenebilir;
  mevcut kaydı V2'ye yükseltme document endpoint/token gerektirir. Copy işlemi
  kaynak yetkisini yeniden denetler; istemciden ownership alınmaz.
- Plan snapshot bütün V2'yi kopyalar, kaynak değişince değişmez. Bozuk veya
  yetkisiz snapshot/source yerine ilk sahneye ya da boş belgeye fallback yoktur.
- Metadata/catalog listelerine sahne JSON'u taşınmaz. İsteğe bağlı
  documentVersion/sceneCount metadata'sı yalnız doğrulanmış sonuçtan gelir.
- Document yazım yolları için toplam HTTP JSON limiti önerisi 600.000 byte;
  domain belge limiti 500.000 kalır. Parser sırası/sıkıştırılmış gövde sınırı ve
  DTO wrapper payı HTTP testleriyle doğrulanır. Diğer uçlar topluca genişletilmez.
- İlk dilimde immutable `DrillVersion`/review/publish/importer V1 kalır.
  V2 içeriği bu pipeline'a gönderme açık 400 ile reddedilir; yayın veya eski
  version güncellemesi mevcut V2 drill'i V1 ile ezemez. Global library-detail
  V1 kalır. Daha sonraki editorial V2 desteği ayrı acceptance dilimidir.

## Export ve import

V1 JSON aynen; V2 JSON tüm sahnelerle round-trip olur. Dosya boyutu parse öncesi
kontrol edilir. Kayıtlı sürüm ve bilinmeyen alanlar client/server parite testinden
geçer. PNG/SVG yalnız **seçili sabit sahne** için verilir; UI ve dosya adı bu
sahneyi belirtir. “V1 sahne JSON'u” export'u diğer sahneleri içermediğini açıklar,
kaynak V2'yi değiştirmez. Render çıktıları time/history/selection içermez;
isimler dışa aktarım uyarısı ve XML escape korunur. MP4/GIF yoktur.

## Uygulama sırası

1. **BL-058a — Sözleşme/validator:** ADR-0036 onayı sonrası V1/V2 ayrımı,
   ortak geçerli/geçersiz fixture'lar ve saf zaman değerlendirmesi. Çalışan
   kayıtlar dönüştürülmez. V1 davranışı ve ithal 120 taslak değişmeden geçmeli.
2. **BL-058b — Sunucu uyumluluğu:** Additive yetkili adaptörler, token/CAS,
   bütün legacy yazım yollarında V2 koruması ve payload sınırı. Yeni V2 yazımı
   kontrollü kapalı başlar; V1 okuma/yazma regresyonları geçmeden açılmaz.
3. **BL-058c — Sahne editörü:** Şerit, sahne işlemleri, document-wide undo,
   eski taslak/dirty/save koordinasyonu; isolated sentetik browser QA.
4. **BL-058d — Oynatıcı:** Saf zaman motoru + mevcut Konva sunumu, seek/hız,
   pause/reduced-motion/klavye. Animasyon gerçek veri çıkarımı yapmaz.
5. **BL-058e — Entegrasyon ve kapanış:** Kulüp kopyası, plan snapshot, maç,
   JSON/static export, rol/scope/çatışma ve eski client matrisi; disposable E2E,
   root quality ve CDSK. Yerel rollout için veri yazımı ayrıca açıkça seçilir.

Her kapı geçmeden sonrakine “tamamlandı” yazılmaz. Owner/tarih TBD. A–D
onayı alındı; BL-058a–e repository uygulama/kabulü tamamlandı. Retained rollout
ayrı açık onay bekler; temsilî kulüp/hardware pilotu hâlâ TBD.

## Kabul testleri ve rollout

- Sınırların n/n+1 durumları, UTF-8 byte, duplicate/unknown/null, sahne pitch
  uyuşmazlığı, id/type çakışması, toplam süre ve son sahne kuralı.
- t=0, hold sonu, transition ortası/sonu, toplam son, cut/zero-hold, 0,5×/2×,
  yeniden seek; aynı t aynı render. 30/60 Hz sentetik saatle süre sapmamalı.
- Numaralı kaleciyi çoğalt → aynı id'yi hareket ettir; yeni id interpolate
  edilmez. Öğe ekle/sil/tür değiştirme deterministik sınır davranışı.
- 12 sahne/1.500 eleman/500 KB limit fixture'ı; 50 undo geçişinde bellek ve
  render ölçümü. Ölçüm donanımı ve production FPS hedefi TBD; performans
  kanıtı gelmeden limitlerin elit kulüp kapasitesi olduğu iddia edilmez.
- İki kulüp/PLAYER denial, revoked source, snapshot provenance değişimi,
  çift eşzamanlı token yazımı, legacy V1/V2/null overwrite reddi, yanlış token
  ve unknown body; API hiçbir hata durumunda içeriği yarım yazmamalı.
- Disposable HTTP E2E: V1 aç → V2 oluştur/kaydet → yeniden aç/oynat → snapshot
  kopyala → kaynak değiştir → snapshot aynı → maç kaydet → eski client reddi.
  Professional review/publish self-approval ve immutable V1 regresyonları.
- 1672×941, 1024×900, 390×844; timeline taşması, touch hedefleri, keyboard,
  focus, dialog, uzun isim ve reduce-motion; gerçek touch-device pilotu TBD.
- `npm run quality`, CDSK, Markdown, diff; yeni migration gerekirse durup ADR
  etki değerlendirmesi yap. Retained DB'yi E2E hedefi seçme.
- Backend V2-aware read/koruma önce, frontend sonra, kontrollü V2 write en son.
  Rollback yeni V2 yazımını kapatır ama V2 okuyucusu/overwrite korumasını tutar;
  sahneler kırpılmaz ve V1-only eski backend'e veriyle kör dönüş yapılmaz.

## Mevcut durum

BL-058a: opt-in saf V1/V2 validator ve mutlak zaman örnekleyicisi eklendi.
Backend/frontend derleme sınırlarını değiştirmemek için iki bağımlılıksız core
kopyası kullanılır; aynı JSON fixture seti ve derlenmiş kaynak eşitliği testi
drift'i engeller. Çalışan eski validator/editor/API'ler bu core'a bağlanmadı.
Legacy uçlar V2'yi reddetmeye devam eder. UI, API, DB, migration veya dependency
değişimi yoktur (BL-058a teslim sınırı).

BL-058b: ayrı document GET/PUT adaptörleri, Serializable token kontrolü,
kaynak/snapshot provenance, legacy JSON yazım/okuma koruması ve route-scoped
600.000-byte parser uygulandı. Global document yazımları kapalıdır; eski
editorial V1 kalır. Retained flag/veri değişmedi; V2 yazımı varsayılan kapalıdır.
Disposable PostgreSQL HTTP 8/8 geçti; [kanıt](../30-quality/TACTICAL_V2_API_2026-09-19.md).
BL-058c: opt-in ortak sahne editörü, belge-geneli undo/dirty/Save, sahne ayarları
ve token istemcileri uygulandı; 36 hedefli test ve izole sentetik canvas QA geçti.
Gerçek route metadata/document/token koordinasyonu BL-058e'de yapılacak.
[Editör kanıtı](../30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).
BL-058d: gerçek Konva sunumuna mutlak zamanlı oynatıcı eklendi. Play/pause,
başa dön, seek, 0.5/1/2 hız, döngü ve reduced-motion tercihleri view-only'dir.
Önizlemede düzenleme/kayıt kilitlidir; sabit sahneye dönüş açık işlemdir.
Gizli sekme, modal, route/scope değişimi ve unmount oynatmayı durdurur;
otomatik devam yoktur. Önizleme koordinatları history veya kayda yazılmaz.
15 yeni test, sentetik üç viewport canvas QA ve kök kalite kapısı geçti.
[Oynatıcı kanıtı](../30-quality/TACTICAL_PLAYBACK_2026-09-26.md).
BL-058e.1: maç route'u board-free metadata + lazy document adaptörüne geçti.
Token sadece başarılı yazım yanıtıyla yenilenir. Sekme geçişi dirty guard'a
bağlıdır; discard/başarılı save sonrası editor unmount olur, geri dönünce
persisted belge yeniden okunur. PLAYER readonly, session/scope değişimi keyed.
[Maç kanıtı](../30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).
BL-058e.2: board-free drill metadata, atomik metadata/document PUT ve kaynak
token/yetki kontrollü yeni CLUB create/copy POST; gerçek route bütün belgeyi
okur/yazar. [Egzersiz kanıtı](../30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).
BL-058e.3: antrenman metadata'sı board-free kalır; yalnız açıkça seçilip açılan
faz document adaptörüyle yüklenir. Plan yanıtında additive phase kimliği ve
origin doğrulanır. Kaynak egzersiz değişikliği ilk snapshot öncesi token'ı
geçersizleştirir; kayıt sonrası bütün V2 kaynak değişiminden bağımsızdır.
İlk kayıt editörü remount etmez; undo korunur. Belirsiz yanıttan sonra aynı
persisted snapshot açıkça doğrulanırsa kullanıcı Kaydet ile yalnız yerel
başarıyı onaylar (PUT yok); farklı belge için doğrulama token'ı devralınmaz.
[Antrenman kanıtı](../30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).
BL-058e.4: V1/V2 kulüp kopyası → faz snapshot → maç, bağımsız token, kaynak
izolasyonu ve tam JSON/seçili sabit PNG/SVG kabulü geçti. Disposable HTTP 18/18,
gerçek route/API/PG browser akışı, üç viewport ve 12 sahne/1.500 eleman/50 undo
ölçümü doğrulandı. [Birleşik kanıt](../30-quality/TACTICAL_COMBINED_ACCEPTANCE_2026-10-03.md).
Repository kabulü kapalı; ayrı retained rollout/pilot kapısı açıktır. Flag kapalı;
V2-aware okuyucu ve legacy ezme koruması rollback sırasında da korunmalıdır.
