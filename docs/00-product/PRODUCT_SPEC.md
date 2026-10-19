# Product Specification

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

## Success Metrics

Ürün metrikleri, hedef değerler ve ölçüm dönemi `TBD`.

## Acceptance Criteria

- Dar MVP'nin üç çekirdek akışı doğrulanmış kullanıcı rolüyle uçtan uca
  çalıştırılabilir.
- Kulüp ve kullanıcı veri sınırları onaylı güvenlik modeline uyar.
- Test, migration ve deployment kapıları tanımlanır ve geçer.
- P0.1 yolculuk kanıtında U17 ana üyeliği, U19 geçici katılımı, kalıcı U19 geçişi
  ve A takım daveti geçmiş kaybedilmeden yeniden okunur.
