# ADR-0037: Rehberli ilk kulüp kurulumu

- **Status:** Accepted
- **Date:** 2026-10-19
- **Owners / approvers:** Kullanıcı beş adımlı uygulamayı açıkça onayladı; named owner TBD
- **Supersedes / superseded by:** N/A
- **Related:** ADR-0022, ADR-0023, ADR-0027, ADR-0028, ADR-0038, CR-027, BL-060

## Context

Boş yerel kurulumda kulüp, ilk sezon, takım ve hesaptan bağımsız teknik kadro
oluşturma akışı eksikti. Legacy sezon/grup ve canonical Team/ClubSeason
bağımlılıkları ayrı ekranlarla ilk kurulumu zorlaştırıyordu. Kullanıcı mevcut
tasarım sistemiyle beş adımlı wizard uygulamasını açıkça onayladı; teknik kadro
isteğe bağlı, hesap davetleri ayrı kalır. Daha önce onaylanan Spor Manage örnek
veri operasyonu bu ürün akışından ayrıdır.

## Decision Drivers

- Son kontrol öncesinde iş verisi yazılmaz; başarısız işlem yarım kurulum bırakmaz.
- Tek A Takım, canonical/legacy eşleme ve rol sınırları korunur.
- Belirsiz ağ sonucunda tekrar gönderim yeni kulüp oluşturmaz.
- Teknik görev, kullanıcı hesabı ve erişim izni ayrı yaşam döngüleridir.

## Considered Options

1. Ayrı ekranlar ve operator komutlarıyla devam etmek.
2. Beş adım ve tek atomik son kayıt (seçildi).
3. Her adımda ayrı kayıt ve sonradan yarım kurulum onarımı.

## Decision

| Adım | Bilgi |
| --- | --- |
| Kulüp | Ad, isteğe bağlı açıklama ve logo, ana/ikincil renk ve canlı tema önizlemesi |
| Sezon | Ad ve açık başlangıç/bitiş günü |
| Takımlar | Tek A Takım; U8–U16 hızlı seçimleri ve düzenlenebilir altyapı grupları |
| Teknik kadro | İsteğe bağlı kişi adı, görev, takım ve sezon içi tarihler; Sonra ekle |
| Kontrol | Oluşturulacak kayıtların özeti ve tek Kurulumu oluştur eylemi |

- `/app/setup` yalnız SYSTEM_ADMIN içindir. Ayarlar ve boş yönetici dashboard'u
  giriş sunar; mevcut çalışma akışı zorla kesilmez. Diğer rollerin kulüp/ilk
  A Takım oluşturma yetkisi genişlemez.
- Form beyaz shadcn/Radix sistemini kullanır. Alan hataları, geri dönüş,
  klavye odağı ve kaydedilmemiş veri uyarısı vardır. Taslak kişi/logo verisi
  bellektedir; localStorage'a yazılmaz. Yenileme taslağı geri getirmez.
- POST `/sporting/club-setup` strict nested DTO ile yeniden doğrulanır.
  Serializable transaction içinde güncel ACTIVE SYSTEM_ADMIN principal kilitli
  yeniden kontrol edilir. Kulüp, ClubSeason, Team/TeamSeason, PlayerGroup/Season,
  isteğe bağlı Person/StaffProfile/STAFF ataması ve audit birlikte yazılır.
- Tarihler Türkiye yerel günü (+03:00) olarak yorumlanır. Sezon en fazla 80 hafta,
  altyapı en fazla 20, teknik kişi en fazla 60 satırdır. Atama son günü dahildir;
  kalıcı exclusive sınır ertesi günün gece yarısıdır.
- Teknik roller HEAD_COACH, ASSISTANT_COACH, GOALKEEPER_COACH, FITNESS_COACH ve
  ANALYST'tir. Yeni kulüpte her kişi satırı ayrı Person oluşturur; aynı isimler
  otomatik birleştirilmez. User, davet, GroupMember veya capability grant yazılmaz.
- Hesap daveti mevcut Kullanıcılar ve Yetkiler akışında ayrı işlem olarak kalır.
  Sonradan kişi/hesap bağlama ve mevcut kişi seçimi ayrı ürün artımıdır.

### Kalıcı tekrar gönderim sözleşmesi

İstemci UUID v4 requestId üretir; aktör + sürümlü operasyon + requestId SHA-256
ile deterministik kulüp/audit kimliğine bağlanır. Transaction advisory lock ve
mevcut legacyWrite serialization retry eşzamanlı işlemleri korur. Gerçek ilk
A Takım oluşturma audit'i normalize payload hash'i ve minimal sonuç taşır;
kişi listesi/logo payload'ı audit'e yazılmaz. Yeni replay tablosu gerekmemiştir.

Aynı aktör/kimlik/normalize payload aynı sonucu döndürür, timestamp yenilemez.
Değişen payload veya tutarsız/eksik sonuç kaydı 409'dur. GET
`/sporting/club-setup/:requestId` aktöre bağlı completed veya not-found döndürür;
başka yöneticinin kimliği sonucu açmaz. İki route da no-store'dur. Audit
retention gelecekte değiştirilirse bu marker'ın korunması ayrıca ele alınır.

URL yalnız opaque requestId tutar. Ağ hatasında gönderilen snapshot kilitlenir;
kullanıcı durum kontrolü veya aynı isteği yeniden gönderir. Yenileme yalnız
sonucu sorgular. Sonuç yoksa yeniden veri girişi aynı requestId'yi korur;
gecikmiş ilk isteğin sonradan tamamlanması duplicate oluşturmaz.

## Consequences

Yeni orchestration API'si vardır; teknik kadro veya replay için migration yoktur.
Logo/renk ayrıntısı ve ayrıca onaylanan nullable iki kolon ADR-0038'dedir.
Fikstür importer'ı, otomatik örnek kişi, yeni servis ve otomatik davet kapsam dışıdır.
Yeni kulüp kurulumundan mevcut Spor Manage kaydı için yeniden kurulum yapılmaz.

## Verification and Rollback

Dedicated PostgreSQL HTTP testleri rol/tenant, tarih, aynı isimli kişiler,
canonical/legacy parity, restart replay, dört eşzamanlı istek ve geç audit
hatasında tam rollback'i kapsar. Frontend testleri final-write, optional staff,
dirty navigation, draft, retry/recovery ve tema davranışını kapsar. Gerçek
browser kaydı/yenileme/tema ve desktop/tablet/mobile QA tamamlandı.
[Kanıt](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).

Rollback yeni wizard girişini ve API'sini geri alır; oluşturulmuş kulüp/atama/audit
silmez. Mevcut veri QA için resetlenmez. Production rollout bu yerel onay değildir.
