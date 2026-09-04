# API Conventions

## Protocol and Versioning

- Mevcut backend JSON tabanlı HTTP endpoint'leri ve Socket.IO olayları sunar.
- Global API prefix veya sürümlendirme doğrulanmadı.
- DTO/validation yaklaşımı tutarlı değildir; birçok endpoint `any` body kullanır.
- Hedef protokol ve versioning politikası `TBD`.

## Authentication and Authorization

- JWT bearer token, Passport JWT strategy ve route bazlı rol guard'ları kullanılır.
- Authenticated principal her istekte güncel veritabanı kaydından oluşturulur.
- Çekirdek kulüp, grup, plan, sezon ve katılım endpoint'leri ADR-0007 rol/kaynak
  matrisiyle korunur. Yeni endpoint varsayılan olarak kapalı kalır; kapsamı ve
  negatif yetki testi olmadan rol erişimi açılmaz.
- Hesaplar public register yerine `/accounts/invitations` ile provision edilir.
  Invitation/reset token kabul endpoint'leri throttled; admin lifecycle endpoint'leri
  JWT, rol ve target-scope kontrolü gerektirir.
- ADR-0009 frontend'i mevcut bearer JWT'yi bellekte tutar, REST isteklerinde
  `Authorization: Bearer` başlığı ve Socket.IO handshake'inde `auth.token` kullanır.
  Kalıcı oturum/refresh/cookie modeli production topolojisine kadar `TBD`.
- Plan drill replace işlemi `PUT /training-plans/:id/drills` üzerinden, mevcut
  plan-manage authorization sınırı içinde yürür. En fazla 50 faz kaydı kabul edilir;
  geçersiz phase/order veya bulunmayan drill bütün işlemi reddeder.

## Errors, Idempotency and Pagination

- Standart hata zarfı, pagination, idempotency ve request correlation politikası
  doğrulanmadı.
- Mevcut hata davranışı NestJS/Prisma varsayılanları ile route özel kodun karışımıdır.

## Compatibility

Public API değiştirilmeden önce mevcut tüketici envanteri, gelecekteki frontend
sözleşmesi, migration etkisi ve geriye uyumluluk planı doğrulanmalıdır.
