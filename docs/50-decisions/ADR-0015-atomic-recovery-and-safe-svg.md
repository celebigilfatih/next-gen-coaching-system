# ADR-0015: Atomik password recovery ve güvenli SVG serialization

- **Status:** Accepted
- **Date:** 2026-09-05
- **Owners / approvers:** Explicit user approval; named security/data owner TBD
- **Supersedes / superseded by:** Clarifies ADR-0008 and hardens ADR-0012
- **Related:** REQ-007, REQ-009, CR-010, F-005, F-006

## Context

Tam MVP review, iki eşzamanlı password-reset completion isteğinin aynı token
kontrolünü geçebildiğini ve serbest biçimli tactical color değerinin SVG attribute
bağlamından çıkabildiğini doğruladı.

## Decision

- Password reset tokenı, aynı transaction içindeki koşullu `updateMany` ile
  `consumedAt = null`, `revokedAt = null` ve `expiresAt > now` koşullarında claim
  edilir. Yalnız `count = 1` alan istek parola, `authVersion` ve audit mutation'ına
  devam eder.
- Claim sonrasındaki herhangi bir hata transaction'ı bütünüyle geri alır. Şema,
  lock tablosu veya vendor-specific ek migration kullanılmaz.
- Tactical board color alanı yalnız `#RGB`, `#RRGGBB` veya `#RRGGBBAA` hexadecimal
  değerlerini kabul eder.
- SVG üretimi doğrulanmış board belgesinden yapılır ve bütün dinamik XML attribute
  ile text değerleri context-uygun escape edilir.
- Bu değişiklik schema version artırmaz: dışarıdan gelen serbest CSS rengi onaylı
  canonical sözleşme değildi ve korunması gereken production board verisi yoktur.

## Consequences

Reset yarışında tek kazanan vardır; kaybeden istek parola veya audit yazamaz. SVG
çıktısı attribute enjeksiyonu taşımaz. Hexadecimal olmayan eski/prototip importlar
açık hata ile reddedilir.

## Migration, Rollout and Rollback

Prisma migration gerekmez. Rollback eski reset veya SVG davranışını güvenlik açığı
olarak geri getireceği için yapılmaz; uyumluluk ihtiyacı oluşursa yalnız güvenli
renk normalizasyonu ayrı karar olarak ele alınır.

## Verification

- Unit testler claim kazanma/kaybetme dallarında kullanıcı ve audit mutation'ını
  doğrular; disposable PostgreSQL E2E iki eşzamanlı completion'da `201/400` ve
  kazanan parolayı doğrular.
- Backend validator enjeksiyon renklerini reddeder. Frontend SVG testleri geçerli
  çıktıyı XML olarak parse eder ve color/numeric attribute enjeksiyonlarını
  reddeder.

## Open Questions

Recovery provider, delivery, rate-limit storage ve operasyon sahibi M4 için `TBD`.
