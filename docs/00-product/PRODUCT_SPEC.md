# Product Specification

## Haftalık kulüp programı — 2026-10-19

Hafta ekranı antrenman, maç, toplantı, toparlanma ve izin kayıtlarını saat sırasıyla
sunar. Yetkili yönetici/atanmış koç etkinlik ekler, toplantı gündemini düzenler ve
yaşa göre haftalık örnek programı önizleyerek uygular. A Takım maç çevresinde çift
seans; altyapı yaş/school-hour profilleri kullanır. Oyuncu yalnız okur. Seanslar
antrenman detayında dört gerçek faz ve örnek kulüp egzersizleriyle açılır.
[ADR-0040](../50-decisions/ADR-0040-weekly-club-program.md).

Kullanıcının sonraki açık isteğiyle aynı yapı Spor Manage'ın 14 Ağustos 2026–
23 Mayıs 2027 sezonuna yayılır. Mevcut dolu haftalar korunur; A Takım kayıtlı
örnek maçlara göre hazırlanır, maçsız haftalarda gelişim ve dinlenme kullanır.
Altyapı yaşa göre hafta içi 17.00 sonrası/cumartesi sabahı çalışır. İlk kısmi
haftada sezon öncesine kayıt oluşturulmaz. Sonraki açık kullanıcı isteğiyle,
[ADR-0042](../50-decisions/ADR-0042-fixture-aware-program-updates.md) kapsamında
maç tarih/saat değişikliği bağlı A Takım haftalarını aynı işlemde otomatik uyarlar.
Elle değiştirilen, silinen, tamamlanan ve geçmiş kayıtlar korunur. Çakışma veya
desteklenmeyen program tüm tarih değişikliğini açıklamalı olarak durdurur.
[ADR-0043](../50-decisions/ADR-0043-two-match-microcycles.md) ile A Takım iki maçlı
haftaları da destekler: gerçek başlama saatleri arasındaki süreye göre tek fiziksel
seans, toparlanma, kısa teknik/aktivasyon ve birleşik toplantı kullanılır. Önizlemede
elle seçilen saatler de korunur. Sonraki açık istekle
[ADR-0044](../50-decisions/ADR-0044-three-match-microcycles.md) üç maçlı A Takım
haftalarını da açar; her ardışık maç aralığı ayrı değerlendirilir. Sonraki açık
istekle [ADR-0045](../50-decisions/ADR-0045-four-match-microcycles.md) dört maçlı
haftalara da aynı korumalı uyarlamayı getirir. Sonraki açık beş maç isteği
[ADR-0047](../50-decisions/ADR-0047-five-match-microcycles.md) ile aynı aralık
kurallarını beş maça genişletir. Altı veya daha fazla maç, aynı gün veya24 saatten
kısa aralık manuel planlama gerektirir; manuel içerik/saat/silme korumaları sürer.
[Sezon doğrulaması](../30-quality/SEASON_CLUB_PROGRAM_2026-10-19.md).


## Rehberli ilk kurulum — 2026-10-19

Onaylı ADR-0037/0038 kapsamında SYSTEM_ADMIN Ayarlar → Yeni kulüp kur ile
beş adımda kulüp kimliği/logo/renk, sezon, A Takım/altyapı ve isteğe bağlı teknik
kadroyu tek son kayıtta oluşturur. Renkler okunaklı tema üretir. Hesap daveti
ve grant yönetimi ayrı kalır. [Kanıt](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

## Problem

Sezon ve antrenman planlama/takip ile taktik analiz süreçlerinin parçalı veya
manuel yürütülmesi, süreklilik ve izlenebilirlik kaybına yol açar.

## Target Users and Outcomes

- **Primary persona:** Takım/grup ataması bulunan futbol antrenörü (`COACH`).
- Backend ve temiz Prisma baseline rolleri ADR-0005 ile `SYSTEM_ADMIN`,
  `CLUB_ADMIN`, `COACH` ve `PLAYER` olarak tanımlandı.
- İlk hedef sonuç: sezon bağlamındaki antrenmanın planlanması, katılımının takip
  edilmesi ve ilgili taktik analiz kaydının dijital olarak saklanması.
- İlk ürün yüzeyi ADR-0009 kapsamında masaüstü/tablet öncelikli responsive
  web uygulamasıdır.

## Value Proposition

Antrenman ve taktik çalışma bağlamını tek, izlenebilir çalışma akışında tutmak.

Phase 2 hedefi, bu doğrulanmış çekirdeği kulübün A takımdan altyapıya sportif
organizasyonunu, oyuncu yolculuğunu ve ileride bağlanacak uzman sistemlerin kanıtını
aynı güvenilir bağlamda yöneten bir futbol operasyon sistemine genişletmektir.

## Functional Requirements

- Sezon ve takım/grup bağlamını temsil etme.
- Antrenman planı oluşturma ve egzersizlerle ilişkilendirme.
- Oyuncu katılımını plan bazında takip etme.
- Maç/rakip/taktik analiz kayıtlarını yönetme.
- Kişiyi uygulama hesabından bağımsız temsil etme.
- Kalıcı takım ile sezona özgü takım bağlamını ayırma.
- Oyuncu ve staff atamalarını başlangıç/bitiş tarihi, tür, gerekçe, aktör ve
  kaynakla tarihsel olarak izleme.
- Yetkiye göre filtrelenen takım kadrosu ve Player 360 başlangıç görünümünü sunma.
- A Takım ve altyapı yönetimini ayrı sidebar hedefleriyle sunma; takım yaşam
  döngüsü ve tenant sınırlarını ortak tutma.
- A Takım menüsünden doğrudan kadro merkezine ulaşma; oyuncuları responsive,
  aranabilir, pozisyonla filtrelenebilir ve Player 360 bağlantılı dizinde sunma.
- Egzersizleri amaç, faz, zorluk, süre, oyuncu sayısı, ekipman ve yaş uyarlamasıyla
  aranabilir kılma; kaynak/lisansı görünür ve yayın sürümünü immutable tutma.
- Global içerikte yazar, bağımsız futbol uzmanı ve SystemAdmin yayın sorumluluğunu
  ayırma; uzmanı doğrulanmamış taslağı profesyonel içerik olarak göstermeme.

## Non-functional Requirements

- Yetkilendirme ve kulüp veri izolasyonunun rol/tenant sınırı ADR-0005, çekirdek
  eylem matrisi ADR-0007 ile kabul edilip negatif E2E testleriyle uygulandı.
- Veri gizliliği ve retention: `TBD`; hassas sağlık verisi için ayrıca zorunlu.
- Erişilebilirlik, performans ve kullanılabilirlik hedefleri: `TBD`.
- Yedekleme, gözlemlenebilirlik ve hizmet seviyesi hedefleri: `TBD`.

## Ready Drill Planning — ADR-0039

2026-10-19 / ADR-0039: ready exercises can be previewed and explicitly attached
to existing/new plans. Exact-age content and durations are frozen per attachment;
initial starter publication requires all 120 independent approvals, except the
explicitly accepted one-time local same-account release in ADR-0041. No complete
session or weekly-program templates are introduced. Retained rollout and the
named real reviewer remain separate gates.

## Success Metrics

Ürün metrikleri, hedef değerler ve ölçüm dönemi `TBD`.

## Acceptance Criteria

- Dar MVP'nin üç çekirdek akışı doğrulanmış kullanıcı rolüyle uçtan uca
  çalıştırılabilir.
- Kulüp ve kullanıcı veri sınırları onaylı güvenlik modeline uyar.
- Test, migration ve deployment kapıları tanımlanır ve geçer.
- P0.1 yolculuk kanıtında U17 ana üyeliği, U19 geçici katılımı, kalıcı U19 geçişi
  ve A takım daveti geçmiş kaybedilmeden yeniden okunur.
