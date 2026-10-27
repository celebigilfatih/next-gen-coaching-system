# Mevcut A takım oyuncusunun sezon bağlantısı — 2026-10-27

Kullanıcı, önceki örnek kadro işleminin ardından eski A takım oyuncusunu da
2026–2027 sezonuna bağlamayı ve Kadro'da25 oyuncunun tamamını görmeyi açıkça istedi.
Bu işlem yalnız yerel Spor Manage kulübündeki mevcut tek sezonsuz primary atamaya
uygulandı; yeni kişi, hesap veya erişim izni oluşturulmadı.

## Yapılan işlem

Mevcut SportingService.transitionPrimary üzerinden aynı kişi ve aynı A takım
korunarak doğru TeamSeason'a geçiş yapıldı. Geçiş27 Ekim2026 saat00.00 İstanbul
zamanında geçerlidir. Eski primary atamanın yalnız validTo/updatedAt alanları
güncellendi; eski başlangıç, takım, kaynak, gerekçe ve sezonsuz geçmiş korundu.
Yeni primary atama aynı anda başlar,2026–2027 TeamSeason'ını taşır ve standart
`NGCS_TRANSITION_V1` kaynağıyla işlem gerekçesini saklar. Standart bitiş/başlangıç
audit kayıtları aynı Serializable transaction içinde yazıldı.

Legacy üyelik, hesap, Person/PlayerProfile, geçmiş katılım, antrenmanlar, maçlar,
diğer oyuncular ve altyapı kayıtları değişmedi. Genel sezonsuz atama politikası
değiştirilmedi; ürün auditinin A15 sorusu bu tek kayıt işlemiyle kapatılmaz.
ADR-0022/0023 kapsamındaki mevcut atama geçişi kullanıldı; model/migration veya
yeni ADR gerekmiyor. Runtime kaynakları ve bağımlılıklar değiştirilmedi.

## Doğrulama

- Kesin yerel DB/kulüp/kişi/takım/sezon/rol ve aktif SystemAdmin doğrulandı.
  Önceki primary atama açık, doğru kişide/takımda ve sezonsuzdu; sezona bağlı
  oyuncu sayısı24 idi.
- Repository dışında `%LOCALAPPDATA%/NGCS/backups/first-team-season-link-20261027/`
  altında özel biçim PostgreSQL yedeği alındı. Önce tam geçiş ve25 oyuncu okuması
  rollback provasında geçti, ardından tek kalıcı işlem uygulandı.
- 42 tablonun önceki satır hash'leri karşılaştırıldı. İzin verilen fark yalnız
  eski primary atamanın iki alanıdır. Bir yeni primary atama ve iki audit eklendi;
  başka iş verisi eklenmedi/değişmedi. Auth oturum yenilemeleri ayrıca izlenir.
- Mevcut servislerle dizin25 ve sezon filtreli kadro25 doğrulandı. Kadrodaki25
  Person kimliği benzersiz; mevcut oyuncu tam bir kez bulunuyor. Oyuncunun güncel
  primary ataması tek.26 Ekim tarihli okumada eski atama görünmeye devam ediyor.
- Tekrar çalıştırma sıfır yazım üretir. İlk kadro operasyonunun eski verifier'ı,
  koruduğu eski atama bu açık kullanıcı isteğiyle değiştiği için artık güncel
  durumun verifier'ı değildir; bu işlemin receipt/verifier'ı kullanılmalıdır.
- Tam test paketi çalıştırılmadı; runtime değişmedi. Veri operasyonu transaction
  provası, tam satır koruma, servis sonuçları ve gerçek tarayıcıyla doğrulandı.

İşlem/özel yedek receipt'i ignored `output/first-team-season-link-20261027/`
altındadır. Temizlenmiş sayaçlar ve ekran kanıtı
[QA klasöründe](../../apps/frontend/qa/first-team-season-link-2026-10-27/)
saklanır. Önceki [örnek kadro raporunun](SYNTHETIC_TEAM_ROSTERS_2026-10-27.md)
24/25 sezon farkını bu işlem giderir. Önceki bekleyen audit belgeleri korunur;
İlk doğrulamada commit/push yapılmadı; sonraki açık kullanıcı isteğiyle bu rapor,
örnek kadro raporu, beş ekran görüntüsü ve iki temizlenmiş doğrulama özeti mevcut
`codex/product-audit-20261026` dalında yayımlanmak üzere kontrol edildi. Diğer ürün
auditinin bekleyen belgeleri ve kanıtları bu commit'in dışında korunur.

Gerçek Chrome'da2026–2027/A takım seçimiyle `/app/squad` açıldı; tam sayfa
yenilemesinden sonra sayaç25 ve25 oyuncu satırı (başlıkla26 tablo satırı), mevcut
oyuncunun tek satırı doğrulandı. Kanıt:
[sezon kadrosu](../../apps/frontend/qa/first-team-season-link-2026-10-27/season-squad-25.png)
ve [servis/veri doğrulaması](../../apps/frontend/qa/first-team-season-link-2026-10-27/verification.json).

## Yayın kontrolü

Yayın öncesi mevcut sezon-link verifier'ı yeniden geçti:25/25 benzersiz sezon
oyuncusu, tek eski oyuncu satırı ve42 tabloda izin verilen farklar doğrulandı.
Eski örnek kadro JSON'undaki24 sezon ataması ilk işlemin tarihli kanıtıdır;
sonraki25 sonucu ayrı JSON ve bu rapordadır. Tarihsel kanıt yeniden yazılmadı.
Beş ekran dosyası decode/ölçü/byte hash kontrolleri ve iki JSON'un sayısal
tutarlılığıyla incelendi. Kesin commit ağacının belge bağlantıları, CDSK ve
whitespace kontrolleri yayın kapısıdır. Runtime/test kodu değişmediğinden tam
test paketi tekrarlanmadı; yeni test veya production verisi iddiası yoktur.
