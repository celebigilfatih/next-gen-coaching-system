# ADR-0029: Ayrı takım navigasyonu ve sentetik kadro adları

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners / approvers:** Kullanıcı 2026-09-09 tarihinde ayrı sidebar hedeflerini ve doğal görünümlü sentetik adları açıkça istedi; named product owner `TBD`
- **Supersedes / superseded by:** ADR-0028'in yalnız sekmeli sunum kararı kısmen superseded; takım yaşam döngüsü ve yetki kararı geçerlidir
- **Related:** ADR-0013, ADR-0022, ADR-0028, REQ-020, BL-053, CR-021

## Context

ADR-0028 A Takım ile altyapıyı aynı `/app/teams` sayfasındaki iki sekmede
sunuyordu. Kullanıcı iki alanın birincil sidebar navigasyonunda ayrı görünmesini
ve sayfa içi sekmenin kaldırılmasını istedi. Yerel kadrolardaki açık `Demo
Oyuncu NN` adları da ürün gösterimi için doğal görünmüyordu.

## Decision

- Sidebar ve mobil Sheet içinde `A Takım` ile `Altyapı` iki ayrı menü öğesidir.
- Canonical adresler `/app/teams/first-team` ve `/app/teams/academy` olur.
  `/app/teams` eski `?view=first-team|academy` seçimini okuyarak ilgili canonical
  adrese yönlendirir; eski bağlantılar kırılmaz.
- Takım dizini sayfa içi sekme göstermez. A Takım korunan tek kart, altyapı ise
  aranabilir/cursor tabanlı kart dizini olarak mevcut davranışını sürdürür.
- Create/edit/archive/restore yetkileri, exact-season koşulu, tenant sınırı,
  çalışma takımı seçimi ve REST/Prisma sözleşmesi ADR-0028'deki gibi kalır.
- Yerel fixture her çalıştırmada değişen rastgele ad üretmez. Beş kadroya 90
  benzersiz, deterministik ve sentetik Türkçe ad atar. Doğum tarihi, iletişim
  bilgisi veya yeni hesap üretmez. Mevcut iki hesap-bağlı sportif kişinin yalnız
  görünen hesap adı Person adıyla atomik olarak eşitlenir; e-posta, parola, rol ve
  oturum bilgisi değişmez.

## Consequences

İki takım alanı menü aramasında ve erişilebilir navigasyonda ayrı hedeflerdir;
aynı anda yalnız biri aktif görünür. Takım detayındaki geri bağlantı takım
kategorisine döner. Route ve fixture regresyonları gerekir, fakat yeni runtime
bağımlılığı, API, şema veya migration gerekmez.

Sentetik adlar gerçek kimlik iddiası taşımaz. İleride gerçek kadro içe aktarımı
onaylanırsa yerel fixture yerine kaynak/provenance doğrulaması olan ayrı bir
operasyon kullanılmalıdır.

## Rollout and rollback

Önce route, aktif navigasyon, legacy redirect ve rol/yönetim regresyonları
çalıştırılır. Yerel isim dönüşümü yalnız mevcut exact-club/exact-season ve
local/demo/test/e2e veritaban kapıları içinde Serializable transaction ile
uygulanır; ikinci çalışma sıfır yeniden-adlandırma üretmelidir. UI rollback eski
tek menü ve query görünümüne dönebilir. Yerel isim rollback'i için önceki adlar
yalnız doğrulanmış bir snapshot varsa geri yüklenir; isim tahmini yapılmaz.
