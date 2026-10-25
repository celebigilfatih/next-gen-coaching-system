# ADR-0023: Capability scope ve hassas veri sınırı

- **Status:** Accepted
- **Date:** 2026-09-06
- **Owners / approvers:** Explicit user approval; named security/privacy owners TBD
- **Supersedes / superseded by:** Extends ADR-0005 and ADR-0007
- **Related:** ADR-0021, ADR-0022, GDPR Article 9

## Context

Dört teknik `UserRole` MVP için yeterli olsa da akademi direktörü, analist, scout,
performans veya sağlık staff'ının fonksiyon ve veri kapsamını güvenli biçimde
temsil etmez. Rol adı tek başına hangi takım ve veri türünün görülebileceğini
belirlememelidir.

## Decision

- Mevcut `UserRole`, platform/hesap uyumluluğu için korunur.
- `FunctionalRole` ve `RoleCapability`, kulüp tarafından tanımlanan işlevleri ve
  izinleri temsil eder; staff assignment rolü bir kulüp veya takım bağlamına taşır.
- Yetki kararı action capability + club/team scope + güncel assignment birleşimidir.
- `SYSTEM_ADMIN` platform sorumluluğunu, `CLUB_ADMIN` kendi kulübündeki P0
  yönetimini korur. Diğer staff erişimi açık grant ve assignment ister.
- P0.1 yalnız minimum sportif uygunluk projeksiyonunu gösterebilir. Klinik not,
  teşhis ve tedavi verisi ordinary Player 360/coach endpoint'lerine girmez.
- Sağlık verisinin hukuki dayanağı, retention, residency, profesyonel gizlilik,
  minor/guardian ve audit politikası ayrıca onaylanmadan medical uygulaması açılmaz.

## Consequences

Yeni işlevler enum büyütmeden eklenebilir ve aynı rol farklı takım kapsamlarında
farklı erişim taşıyabilir. Negatif çapraz kulüp/takım testleri her capability için
zorunludur.

## Rollout and rollback

P0 endpoint'leri deny-by-default capability kontrolü kullanır. Mevcut MVP
controller'ları parity fazında ADR-0005/0007 kurallarını korur. Rollback yeni P0
rotalarını kapatır; mevcut güvenlik sınırını gevşetmez.

## Open questions

Nihai staff matrisi, medical break-glass, purpose-of-access, veri sahibi ve formal
privacy impact assessment `TBD`.
