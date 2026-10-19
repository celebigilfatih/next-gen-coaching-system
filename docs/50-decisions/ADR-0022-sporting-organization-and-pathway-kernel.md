# ADR-0022: Sportif organizasyon ve oyuncu yolu çekirdeği

- **Status:** Accepted
- **Date:** 2026-09-06
- **Owners / approvers:** Explicit user approval; named data owner TBD
- **Supersedes / superseded by:** Extends ADR-0006 and prepares later replacement
  of `PlayerGroup` / `GroupMember`
- **Related:** ADR-0021, ADR-0023, P0.1

## Context

`User`, `PlayerGroup` ve `GroupMember`, login hesabını kişi kimliğiyle birleştirir;
takımın sezonlar arası kimliğini ve oyuncunun misafir antrenman, terfi veya staff
ataması gibi tarihsel ilişkilerini temsil edemez.

## Decision

- `Person`, login hesabından bağımsız ve kulüp kapsamlı insan kimliğidir.
- `PlayerProfile` ve `StaffProfile`, aynı kişiye ayrı sportif profiller sağlar.
- `Team` kalıcı takım kimliğidir; yaş/kategori etiketi yapılandırılabilir alandır.
- `ClubSeason` kulüp sezonunu, `TeamSeason` takımın o sezondaki bağlamını taşır.
- `SportingAssignment`, kişi-takım ilişkisini tip, işlev, geçerlilik aralığı,
  gerekçe ve aktörle tarihsel olarak saklar. Güncel primary üyelik tekildir.
- P0.1 migration'ı `PlayerGroup`/`GroupMember` bilgisini deterministik olarak yeni
  yapılara ekler. Eski API ve foreign key'ler compatibility dönemi boyunca kalır.
- Yeni yazımlar tek domain service üzerinden yapılır; parity ve reconciliation
  doğrulanmadan destructive cutover yapılmaz.

## Consequences

Oyuncu hesabı olmadan oyuncu, oyuncu olmadan staff hesabı ve aynı kişinin farklı
sezon/takımlardaki geçmişi temsil edilebilir. Geçiş döneminde iki modelin drift
riski reconciliation kontrolleriyle yönetilir.

## Migration, rollout and rollback

Migration yalnız yeni enum/tablo/nullable linkler ve backfill ekler. Eski tabloları
silmez. Retained ortam öncesi disposable PostgreSQL deploy, diff, backfill sayımı ve
geri dönüş provası gerekir. Rollback uygulamayı eski okuma/yazma yollarına alır ve
additive tabloları veri varsa korur.

## Open questions

P0.1b implementation refinement: BL-042 maintains legacy-owned mapped facts
through the shared transaction adapter; removal ends assignments and preserves
history. Native primary/guest/staff writes remain separate from legacy access
membership. Read-only parity and the Club/Season/Team scope selector provide
cutover evidence. This implements the accepted compatibility strategy without
dropping legacy tables. See [contract](../10-architecture/P01B_COMPATIBILITY_CUTOVER.md).

Bir kişinin kulüpler arası canonical eşlemesi, sözleşme/registration domain'i ve
kalıcı legacy cutover tarihi `TBD`.
