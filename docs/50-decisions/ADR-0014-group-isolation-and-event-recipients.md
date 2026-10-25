# ADR-0014: Grup izolasyonu ve gerçek zamanlı olay alıcıları

- **Status:** Accepted
- **Date:** 2026-09-05
- **Owners / approvers:** Explicit user approval; named security owner TBD
- **Supersedes / superseded by:** Clarifies ADR-0007 and ADR-0012
- **Related:** REQ-002, REQ-005, REQ-010, CR-009, F-001, F-002, F-003

## Context

Tam MVP review, dashboard drill sorgusunun tenant filtresi taşımadığını, aynı
kulüpte farklı grup kaynaklarının aggregate kayıtlara bağlanabildiğini ve Socket.IO
operasyon olaylarının bütün kulübe yayıldığını doğruladı. Gönderici yetkisi tek
başına alıcı yetkisi veya aggregate veri bütünlüğü sağlamaz.

## Decision

- Kulüp dashboard'u global katalog ile yalnız principal'ın kendi kulüp drill'lerini
  minimum projection ile gösterir. `SYSTEM_ADMIN`, kulüp seçmemişse global görünümü
  korur; kulüp seçmişse aynı görünürlük filtresini kullanır.
- Bir sezon günü yalnız sezonla aynı kulüp ve gruptaki training plan'a bağlanır.
  Planın grup değişikliği mevcut day-plan bağlantılarını geçersiz kılamaz.
- `GLOBAL` drill her plana, `CLUB` ve `groupId = null` drill aynı kulüp planlarına,
  grup kapsamlı `CLUB` drill ise yalnız aynı grup planına bağlanabilir. Plan grup
  değişikliği mevcut drill bağlantılarını geçersiz kılamaz.
- Aggregate kontrolü ve mutation aynı serializable transaction içinde yürür.
- Socket bağlantıları kulüp odası yerine grup odalarına katılır. `CLUB_ADMIN`
  kulübündeki gruplara, `COACH` ve `PLAYER` güncel üyelik gruplarına katılır.
- Presence ve operasyon olaylarında alıcı listesi her yayında güncel kullanıcı,
  durum, `authVersion`, kulüp ve grup üyeliğinden yeniden türetilir. Grup sahibi
  olmayan plan için operasyon yayını yapılmaz.
- Plan/drill olayları ham client `value` veya `drill` nesnesini taşımaz; yalnız
  yeniden yükleme için gereken kaynak kimliği yayınlanır.

## Consequences

Farklı grup içeriği nested aggregate veya gerçek zamanlı olay üzerinden dar grup
kullanıcısına taşınmaz. Club-wide drill'lerin bilinçli `groupId = null` davranışı
ADR-0012 ile uyumlu kalır. Frontend'de doğrulanmış Socket consumer olmadığı için
payload daraltmasının mevcut web akışına etkisi yoktur.

## Migration, Rollout and Rollback

Prisma şeması veya migration değişmez. Rollback ilgili controller/service/gateway
değişikliklerinin birlikte geri alınmasıdır; bu, kapatılan tenant sınırlarını tekrar
açacağı için güvenlik onayı olmadan uygulanmaz.

## Verification

- İki kulüplü dashboard E2E, global ve aynı-kulüp drill'lerini korurken diğer kulüp
  drill'ini ve hassas projection alanlarını reddeder.
- İki gruplu E2E, plan↔drill ve season-day↔plan farklı grup bağlantılarını ve bağlı
  planın sonradan başka gruba taşınmasını reddeder; same-group akış geçer.
- Gateway unit testleri farklı grup socket'ini alıcı listesinden çıkarır, güncel DB
  üyeliğini kullanır ve operasyon payload'ını sınırlar.

## Open Questions

Frontend gerçek zamanlı consumer, reconnect/reconciliation davranışı, distributed
presence ve gözlemlenebilirlik M4 veya sonraki kapsam için `TBD` kalır.
