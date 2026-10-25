# A Takım Kadro Merkezi Doğrulaması — 2026-09-09

## Kapsam

- `/app/teams/first-team` doğrudan kadro merkezi ve route-preserving çalışma
  takımı eşitlemesi
- ortak responsive oyuncu tablosu/kart görünümü ve Player 360 bağlantıları
- URL tabanlı arama, pozisyon filtresi, isim sırası ve cursor sıfırlama
- `GET /sporting/players/page` strict query, deterministik cursor, total/summary,
  tenant/capability ve PLAYER self-scope sınırları

## Sonuç

Repository uygulaması ve davranış kapıları **Pass**. Prisma şeması, migration,
bağımlılık ve korunan yerel iş verisi değişmedi. Authenticated 1672/1024/390
matched visual gate, backend restartından sonra yeniden login gerektirdiği için
açık kalır.

- Backend unit: 52 suite, 712 test geçti.
- Frontend: 43 dosya, 284 test geçti.
- Player-page disposable PostgreSQL 16 HTTP E2E: 2/2 geçti.
- 1.000 oyuncu / 3.000 atama ölçümünde 20 sıcak örnek için p50 28.32 ms,
  p95 32.65 ms, en fazla 10 sorgu ve 11.718 byte sayfa ölçüldü. Bu değerler
  yerel sentetik kanıttır; production SLO değildir.
- Backend/frontend typecheck, lint, production build ve kök CDSK/docs/format/
  whitespace kapıları geçti.
- Canlı Chrome erişilebilirlik ağacında A Takım menüsünün doğrudan canonical
  route'u, kadro başlığı, yönetici edit işlemi, dört gerçek hızlı bağlantı ve
  üç filtre kontrolü doğrulandı. Backend yeniden başlatıldığında mevcut browser
  access token'ı geçersizleşti; kalıcı kullanıcı verisi veya parola değiştirilmedi.

## Güvenlik ve uyumluluk kanıtı

- Query allowlist bilinmeyen alan, geçersiz enum, bozuk ve başka sıraya ait
  opaque cursor'u 400 ile reddeder.
- Arama ve pozisyon filtresi sayfalamadan önce uygulanır; aynı isimlerde ID ikinci
  anahtar olarak kullanılır ve 1.000 kayıtlı dolaşımda tekrar/kayıp oluşmaz.
- Yabancı kulüp/takım, saklı takım ve revoke edilmiş grant reddedilir.
- PLAYER yanıtındaki `items`, `total` ve `summary` aynı self-scope içindedir.
- Parametresiz istemci ID sırası ve ham ID cursor davranışını korur.

## Görsel ve davranış kabulü

Frontend regresyonları masaüstü native tablo yapısını, 768 px altı kompakt kart
CSS'ini, profil/hızlı bağlantıları, admin/coach boş durumlarını, URL filtre/sıra
durumunu, 250 ms debounce'u, cursor resetini ve stale-response reddini kapsar.
Formal WCAG seviyesi ve production performans bütçesi `TBD` kalır.
