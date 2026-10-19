# ADR-0030: A Takım kadro merkezi ve oyuncu dizini

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners / approvers:** Kullanıcı uygulama planını 2026-09-09 tarihinde açıkça onayladı; named product owner `TBD`
- **Supersedes / superseded by:** ADR-0029'un A Takımı tek yönetim kartı olarak sunan kararını kısmen supersede eder; ayrı navigasyon, yaşam döngüsü ve yetki kuralları geçerlidir
- **Related:** ADR-0022, ADR-0023, ADR-0028, ADR-0029, REQ-021, BL-054, CR-022

## Context

`/app/teams/first-team` ayrı bir menü hedefi olmasına rağmen kullanıcıyı önce
tek bir takım yönetim kartına götürüyor, kadroya ulaşmak için ikinci bir adım
gerektiriyordu. Oyuncu listeleri farklı ekranlarda farklı yoğunluk ve işlem
sunumu kullanıyordu. Mevcut oyuncu sayfalama sözleşmesi sunucu aramasını
desteklese de pozisyon filtresi, isim sırası ve tam kapsam özeti vermiyordu.

## Decision

- `/app/teams/first-team` aktif A Takım bulunduğunda doğrudan kadro merkezidir.
  Takım adı, kategori, sezon, gerçek kadro özeti, oyuncu dizini, Player 360 ve
  çalışan operasyon bağlantıları aynı ekranda sunulur.
- Route aktif A Takımı çözdüğünde çalışma takımı aynı kimliğe eşitlenir ve
  nested route korunur. Tüm-sezon kapsamında aktif takım, belirli sezonda o
  sezonla bağlı takım çözülür.
- A Takım yok/oluşturulabilir/salt-okunur halleri ile ADR-0028 create/edit ve
  arşivlenemezlik kuralları değişmez.
- Oyuncu sunumu masaüstü/tablette erişilebilir native tablo, 768 px altında aynı
  semantik tablonun kompakt kart görünümüdür. Player 360 işlemi açıkça adlandırılır.
- Oyuncu dizini arama, pozisyon filtresi ve A–Z/Z–A sırasını URL'de tutar.
  Filtre değişimi ilk cursor sayfasına döner; 250 ms arama gecikmesi ve eski yanıt
  reddi korunur.
- `GET /sporting/players/page`, geriye uyumlu `position` ve `sort` parametreleri
  ile `total` ve `summary` alanlarını ekler. Parametresiz istek ID sırasını ve ham
  ID cursor'unu korur. İsim sırası sürümlü opaque `displayName + id` cursor kullanır.
- Tenant, capability, aktif atama ve PLAYER self-scope filtreleri sayfalama ve
  özet hesaplarından önce uygulanır. PLAYER takım toplamını göremez.
- Prisma şeması, migration, rol modeli ve runtime bağımlılıkları değişmez.

## Consequences

A Takım menüsü kadroya tek adımda ulaşır ve oyuncu listeleri ortak, daha taranır
bir görsel dile kavuşur. Sıralı cursor eski istemcilerle paylaşılmaz; cursor kendi
sort değerini taşır ve başka sort ile kullanılırsa 400 döner. `summary` pozisyon
dağılımı aktif, yetkili takım kapsamını gösterirken `total` etkin arama/filtre
sonucunu gösterir.

## Rollout and rollback

Önce strict query/cursor ve scope regresyonları, sonra shared liste ile A Takım
route testleri ve canlı salt-okunur tarayıcı QA çalıştırılır. Rollback yeni
query/response alanlarını ve kadro merkezi sunumunu kaldırabilir; veri dönüşümü
olmadığı için veritabanı rollback'i gerekmez.
