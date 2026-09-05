# Security Model

## Assets and Trust Boundaries

- Kullanıcı kimliği, parola hash'i ve JWT.
- Kulüp, takım, oyuncu, antrenman, katılım, performans ve sağlık verisi.
- HTTP API, Socket.IO bağlantısı, PostgreSQL ve gelecekteki frontend sınırları.

## Enforced Baseline

- Public kayıt kaldırılmıştır. İlk `SYSTEM_ADMIN` tek seferlik operator bootstrap,
  diğer hesaplar ADR-0008 kapsamındaki yetkili, hash-token davet akışıyla oluşturulur.
- Production JWT secret yoksa, kısa ise veya bilinen placeholder ise backend
  fail-closed davranır; development/test eksik secret için process-local rastgele
  değer kullanır.
- Prisma varsayılanı ve açık response projection'ları `passwordHash` alanını
  kullanıcı yanıtlarından çıkarır; authentication sorgusu alanı yalnızca parola
  doğrulama sınırında açıkça seçer.
- Her authenticated HTTP isteğinde JWT `sub` değeriyle güncel kullanıcı veritabanından
  yüklenir; token içindeki eski/oynanmış rol, e-posta veya kulüp iddiası yetki vermez.
- Çekirdek kulüp, grup, antrenman planı, sezon ve katılım işlemleri ortak
  authorization katmanında kulüp/grup üyeliğiyle sınırlandırılır.
- Egzersiz okumaları authentication gerektirir. Global katalog görünürdür;
  kulüp/grup kayıtları tenant ve güncel üyelikle filtrelenir. Koç yalnız atanmış
  grupta kendi egzersizini, kulüp yöneticisi kendi kulübünü, sistem yöneticisi tüm
  kayıtları yönetir.
- Drill create/update body'leri `clubId`, `scope` ve `createdById` ile sahiplik
  kazanamaz; sunucu bunları güncel principal ve grup atamasından türetir. Global
  katalog yalnız `SYSTEM_ADMIN` tarafından mutate edilir.
- Plan snapshot ve maç tahtası 250 element/100 KB sınırı ve katı alan/tür
  allowlist'iyle doğrulanır; kaynak egzersiz görünürlüğü mutation sırasında yeniden
  kontrol edilir.
- `SYSTEM_ADMIN` global; `CLUB_ADMIN` kendi kulübü; `COACH` atanmış grupları;
  `PLAYER` kendi profili, grup görünümü ve kendi katılımı kapsamında çalışır.
- Socket.IO bağlantısı JWT gerektirir, sunucu tarafından türetilen grup odalarına
  katılır, her olayda güncel status/authVersion doğrular ve plan/oyuncu
  mutation'larından önce aynı kaynak kontrollerini uygular.
- ADR-0014 ile Socket alıcı listesi her yayında güncel DB rolü, kulüp/grup üyeliği,
  account status ve authVersion üzerinden yeniden türetilir; operasyon payload'ı
  minimum kaynak kimliğiyle sınırlandırılır. Grup sahibi olmayan plan yayınlanmaz.
- Dashboard drill görünürlüğü `GLOBAL + principal.clubId` predicate'i ve minimum
  projection uygular. Plan/drill ile season-day/plan aggregate'leri group sınırını
  mutation transaction'ı içinde korur; plan grup değişikliği mevcut ilişkileri
  sınır dışına taşıyamaz.
- Password reset completion, ADR-0015 uyarınca koşullu token claim'i kazanmadan
  parola, authVersion veya audit kaydı yazamaz.
- Tactical renkleri canonical hexadecimal değerlerle sınırlıdır; SVG serializer
  bütün dinamik XML attribute/text değerlerini escape eder.
- Sağlık/klinik endpoint'leri ile ileri analitik tenant modeli onaylanana kadar
  `SYSTEM_ADMIN` ile sınırlıdır.
- Authentication throttling in-memory ve instance-local'dir; proxy/topoloji ve
  dağıtık rate-limit storage kararı production deployment ile birlikte `TBD`.
- Kalıcı tarayıcı oturumu ve production origin sınırı ADR-0010 Option 1 olarak
  `Accepted`; ADR-0018 provider-neutral implementation kapısını açmıştır.
  Backend/frontend flag'leri varsayılan kapalıdır. Açık modda 15m access JWT,
  7d idle/30d absolute refresh, beş aktif family, host-only HttpOnly cookie, exact
  origin ve zorunlu custom CSRF header uygulanır. PostgreSQL user-row lock ile
  rotation tek kazananlıdır; replay/logout/eviction family erişimini HTTP ve Socket
  alıcı/gönderici kontrollerinde keser. Lifecycle revocation authVersion'a ek olarak
  refresh kayıtlarını iptal eder. Production rollout girdileri `TBD` kalır.
- Prisma CLI → `@prisma/config` → `deepmerge-ts` advisory zinciri ADR-0016 ile
  hosted runtime için `not_actionable` sınıflanmış ve production öncesi yeniden
  inceleme koşuluyla geçici kabul edilmiştir. ADR-0017 kabul edilmiş ve Docker
  artifact'larında uygulanmıştır: serving runtime development/optional paketleri,
  Prisma CLI, `@prisma/config` ve `deepmerge-ts` zincirini içermez; CLI ve migration
  ağacı HTTP uygulaması içermeyen ayrı migrator target'ındadır. Production DB rolü,
  credential delivery ve orchestrator sınırı `TBD` kalır.

Kalan maddeler sonraki güvenlik ve production dalgaları için karar girdileridir.

## Identity, Authorization and Audit

- Mevcut teknik roller: `SYSTEM_ADMIN`, `CLUB_ADMIN`, `COACH`, `PLAYER`.
- Yalnızca `SYSTEM_ADMIN` globaldir; diğer roller kulüp, grup veya özne sınırında
  çalışır. Baseline, SYSTEM_ADMIN için boş ve CLUB_ADMIN için dolu `clubId`
  constraint'i uygular.
- Çekirdek eylem matrisi ADR-0007 ile bağlayıcıdır ve negatif cross-club testleriyle
  doğrulanır.
- Dashboard, aggregate ve Socket recipient istisnaları ADR-0014 remediation'ıyla
  kapatılmış ve REQ-005 yeniden `Implemented` durumunda doğrulanmıştır.
- Invitation, acceptance, suspension/reactivation, access, password/reset, session
  revocation ve bootstrap güvenlik audit olayları kalıcıdır. Audit retention/export
  ile ileri analitik tenant modeli `TBD`.

## Secrets and Sensitive Data

- Secret repository'ye veya loglara yazılmaz; production fallback secret ile
  başlatılmamalıdır.
- Sağlık verisinin hukuki dayanağı, erişim sahipleri, retention ve silme süreci
  `TBD` ve production öncesi açık onay gerektirir.
- Log redaction ve veri sınıflandırma politikası `TBD`.
