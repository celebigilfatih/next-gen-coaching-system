# Örnek takım kadroları — 2026-10-27

Kullanıcı A takım ve alt gruplara oyuncu eklenmesini istedi; gerçek liste yerine
**örnek oyuncular oluştur** seçeneğini açıkça seçti. Uygulamadaki Spor Manage,
2026–2027 sezonu ve mevcut on aktif takım kullanıldı. Kadro büyüklüğü uygulama
tercihi olarak A takımda25, altyapıda18 seçildi; gerçek kulüp kadrosu iddiası yoktur.

## Sonuç

| Takım      |  Önce | Eklenen | Oyuncu dizini toplamı | Sezona bağlı yeni atama |
| ---------- | ----: | ------: | --------------------: | ----------------------: |
| A Takım    |     1 |      24 |                    25 |                      24 |
| U8         |     0 |      18 |                    18 |                      18 |
| U9         |     0 |      18 |                    18 |                      18 |
| U10        |     0 |      18 |                    18 |                      18 |
| U11        |     0 |      18 |                    18 |                      18 |
| U12        |     0 |      18 |                    18 |                      18 |
| U13        |     0 |      18 |                    18 |                      18 |
| U14        |     0 |      18 |                    18 |                      18 |
| U15        |     0 |      18 |                    18 |                      18 |
| U16        |     0 |      18 |                    18 |                      18 |
| **Toplam** | **1** | **186** |               **187** |                 **186** |

Yeni kayıtlar hesapsız Person/PlayerProfile ve tarihli PRIMARY_REGISTERED
atamalarından oluşur. Benzersiz sentetik Türkçe adlar, örnek pozisyon ve ayak
bilgileri vardır. Doğum tarihi, iletişim, sağlık, ölçülmüş performans, parola,
hesap, davet veya erişim izni oluşturulmadı. İsimler mevcut kişi adlarıyla
çakıştırılmadı. İlk isim dağılımındaki tekrarlı soyadları yalnız bu operasyonun
oluşturduğu kişilere sınırlı olarak çeşitlendirildi; önceki kişiler korunur.

Her atama doğru TeamSeason'a bağlıdır; 27 Ekim2026 başlangıcı ve24 Mayıs2027
hariç bitişi mevcut sezonun son gününü kapsar. Atama gerekçesi
`USER_REQUEST_SYNTHETIC_ROSTERS_2026_10_27` kaynağını ve gerçek kişi olmadığını
belirtir. Mevcut SportingService, yetki/referans/çakışma kontrolleri ve standart
atama audit akışı kullanıldı. Person oluşturma mevcut yerel fixture yaklaşımıdır;
genel ürün içe aktarımı veya yeni API eklenmedi.

## Koruma ve doğrulama

- Kesin hedef yalnız loopback5433 üzerindeki `ngcs_local_session_dev` ve mevcut
  Spor Manage kulübüdür. Kulüp/sezon/10takım ve aktif SystemAdmin/PLAYER rolü
  yazımdan önce doğrulandı. Takım oluşturulmadı veya düzenlenmedi.
- Tam PostgreSQL özel biçim yedeği repository dışında yerel
  `%LOCALAPPDATA%/NGCS/backups/synthetic-rosters-20261027/` altında alındı.
  Veritabanı sıfırlanmadı veya bu yedekten geri yüklenmedi.
- Önce186 kayıtlık Serializable işlemde tüm eklemeler ve koruma kontrolleri
  tamamlanıp kasıtlı rollback yapıldı. Sonra tek kalıcı transaction uygulandı.
- 42 tabloda önceki her satırın kimlik/içerik hash'i korundu. Yalnız186 Person,
  186 PlayerProfile,186 SportingAssignment ve186 atama audit kaydı eklendi.
  RefreshSession oynaktır; tarayıcı açılışından sonraki SESSION_REFRESHED audit
  ekleri ayrıca sınıflandırıldı, önceki audit satırları da değişmedi.
- On takım mevcut servis üzerinden yeniden okundu; dizin toplamları25/18,
  sezon atamaları24/18 doğrulandı. Yeni kişilerin hesap/doğum tarihi yokluğu,
  tek atama, doğru sezon, pozisyon ve sentetik kaynak gerekçesi kontrol edildi.
- Tekrar çalıştırmada sıfır yazım doğrulandı. İlk son-okuma denemesinde
  operatörün sayfalama parametresi sayıydı; katı HTTP sorgu sözleşmesi metin ve
  tarih gerektirdiğinden reddetti. Operatör düzeltildi; kalıcı ekleme tekrarlanmadan
  salt okunur doğrulamalar yeniden geçti. Uygulama hatası olarak sunulmaz.
- Runtime, şema, migration, bağımlılık ve yetki modeli değişmedi. ADR-0022/0029/0030
  geçerlidir; yeni ADR gerekmiyor. Tam test paketi bu veri operasyonu için tekrar
  çalıştırılmadı; transaction provası, veri koruma ve gerçek servis/UI kontrolleri
  kapsamın kanıtıdır.

## Mevcut sezon farkı

**Sonraki açık kullanıcı isteğiyle giderildi:**
[sezon bağlantısı raporu](FIRST_TEAM_SEASON_LINK_2026-10-27.md) mevcut oyuncunun
geçmişini koruyarak aynı takımın2026–2027 sezonuna geçişini doğrular. Güncel
dizin ve sezon kadrosu25/25'tir. Aşağıdaki24/25 bulgusu ilk işlemin tarihsel sonucudur.

Önceden kayıtlı tek A takım oyuncusunun primary/legacy atamaları TeamSeason
taşımıyor. Bu önceki satırlar değiştirilmedi. A takım oyuncu dizini25 gösterirken
seçili sezonla tam filtrelenen Kadro yeni24 oyuncuyu gösterir; altyapı18/18'dir.
Bu mevcut anlam farkı ürün auditindeki A15'te zaten kayıtlıdır. Sezonsuz eski
atamaların eşlenmesi bu operasyon kapsamında sessizce yapılmadı.

Yeni hesapsız oyuncular legacy User tabanlı yoklamaya otomatik eklenmez;
bu mevcut ürün sınırıdır. Oyuncu dizini, tarihli kadro ve Player360 için eklenmiştir.
Gerçek oyuncularla değiştirme veya eski atama eşleme ayrıca kaynaklı işlem ister.

## Tarayıcı kanıtı

Kanonik API4000 çalışır durumdaydı; durmuş UI3132 yalnız loopback üzerinde tekrar
açıldı. Mevcut oturum korundu. Dev bağımlılık optimizasyonu sonrasında yeni sekmede
A takımın25 oyuncusu görüldü. Son ekran kanıtları ve temizlenmiş sayaç özeti
[kanıt klasöründe](../../apps/frontend/qa/synthetic-rosters-2026-10-27/) tutulur.
Gerçek Chrome ekranında A takım25, U8 tarihli kadro18 oyuncu/3 mevcut teknik ekip,
örnek oyuncunun Player360 profili ve Yolculuk'taki sezon tarihleri/sentetik
gerekçesi kontrol edildi:

- [A takım](../../apps/frontend/qa/synthetic-rosters-2026-10-27/first-team.png)
- [U8 kadrosu](../../apps/frontend/qa/synthetic-rosters-2026-10-27/u8-roster.png)
- [Oyuncu profili](../../apps/frontend/qa/synthetic-rosters-2026-10-27/player-profile.png)
- [Atama kaynağı](../../apps/frontend/qa/synthetic-rosters-2026-10-27/player-journey.png)
- [On takım sayaç doğrulaması](../../apps/frontend/qa/synthetic-rosters-2026-10-27/verification.json)

Belge kontrolü218 Markdown/0 kırık bağlantı; CDSK36 zorunlu belge/47 ADR/0 hata.
İşlem/özel yedek ayrıntıları ve satır hash'leri ignored `output/` altındadır.
İlk doğrulamada commit/push yapılmadı. Sonraki açık kullanıcı isteği bu raporun,
sezon bağlantısı raporunun ve ekran/sayaç kanıtlarının mevcut branch'te
yayımlanmasını kapsar; [yayın kontrolü](FIRST_TEAM_SEASON_LINK_2026-10-27.md#yayın-kontrolü).
Önceki ürün auditinin bekleyen değişiklikleri ayrı korunur.
