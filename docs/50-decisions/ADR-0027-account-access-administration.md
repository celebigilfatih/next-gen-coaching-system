# ADR-0027: Kullanıcı hesabı ve erişim yönetimi

- **Status:** Accepted
- **Date:** 2026-09-08
- **Owners / approvers:** Kullanıcı 2026-09-08 tarihinde kullanıcı yetkileri yönetimini istedi; named product/security owner `TBD`
- **Supersedes / superseded by:** N/A
- **Related:** ADR-0005, ADR-0007, ADR-0008, ADR-0015, ADR-0018, ADR-0023, REQ-018, BL-050, CR-019

## Context

Backend davet, rol/kapsam değişikliği, askıya alma, yeniden etkinleştirme, parola
sıfırlama ve oturum iptalini zaten destekliyordu; ancak yöneticiler için kapsamlı
bir kullanıcı dizini ve bu işlemleri bir araya getiren güvenli bir çalışma yüzeyi
yoktu. Teknik hesap rolleri ile sportif işlevsel roller aynı kavram değildir ve
bu ayrım arayüzde görünür olmalıdır.

## Decision

- Teknik hesap rolleri değişmez: `SYSTEM_ADMIN`, `CLUB_ADMIN`, `COACH`, `PLAYER`.
  Sistem yöneticisi platformu, kulüp yöneticisi yalnız kendi kulübünü yönetir;
  koç ve oyuncu hesap yönetimi uçlarına erişemez.
- `GET /accounts` kimliği doğrulanmış, admin-only ve cursor tabanlıdır. Ad/e-posta,
  rol, durum ve sistem yöneticisi için kulüp filtresi kabul eder; bilinmeyen query
  alanlarını reddeder. Kulüp yöneticisinin kapsamı istemci girdisinden bağımsız
  olarak güncel principal kulübüne zorlanır.
- Liste yanıtı parola hash'i, authVersion, token veya session bilgisi taşımaz;
  yalnız yönetim için gereken hesap ve kulüp alanlarını döndürür.
- `/app/settings/users` dizin, davet, rol/kapsam değişikliği, askıya alma/yeniden
  etkinleştirme, parola sıfırlama ve tüm oturumları iptal eylemlerini mevcut
  hesap-yaşam-döngüsü API'leri üzerinden sunar. Backend her zaman nihai yetki
  otoritesidir; frontend guard ve gizleme yalnız savunma/UX katmanıdır.
- Tek kullanımlık davet/reset bağlantısı yalnız başarılı operator-mode yanıtında
  bir kez gösterilir. SMTP modunda token arayüze veya loga geri taşınmaz.
- Sportif `FunctionalRole`/`RoleCapability` matrisi aynı sayfada salt okunur
  gösterilir. Capability grant mutation bu kararla açılmaz; ayrıca ürün ve
  güvenlik kararı gerektirir.

## Consequences

Yöneticiler mevcut yetkileri tek yüzeyden kullanabilir ve hangi hesabın hangi
teknik kapsama sahip olduğunu görebilir. Kulüp yöneticisi sistem yöneticisi
oluşturamaz; kendi hesabını veya son aktif sistem yöneticisini mevcut backend
korumalarını aşarak değiştiremez. Rol/kapsam değişikliği ve lifecycle işlemleri
mevcut authVersion/refresh-session iptal davranışını korur.

Bu teslim sportif capability atama ekranı, toplu kullanıcı işlemi, arşivleme,
özel rol üretimi veya yeni hesap durumu eklemez. Şema migration'ı ve yeni runtime
bağımlılığı yoktur.

## Rollout and rollback

Rollback, admin dizin endpoint'ini ve frontend rotasını aynı revision'a geri
alır; mevcut lifecycle API'leri ve hesap verisi değişmez. Mutation E2E yalnız adı
`test` içeren disposable PostgreSQL 16 hedefinde çalışır. Korunan yerel hesaplar
doğrulama amacıyla değiştirilmez.
