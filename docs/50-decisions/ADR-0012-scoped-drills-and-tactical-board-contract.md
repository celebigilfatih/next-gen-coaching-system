# ADR-0012: Kapsamlı egzersizler ve taktik tahta sözleşmesi

- **Status:** Accepted
- **Date:** 2026-09-04
- **Owners / approvers:** Explicit user approval; named data/security owner TBD
- **Supersedes / superseded by:** Partially extends ADR-0007 global drill rule
- **Related:** ADR-0005, ADR-0006, ADR-0007, REQ-004, REQ-009, REQ-010

## Context

Global egzersiz mutasyonu yalnız `SYSTEM_ADMIN` yetkisindeydi ve plan/maç taktik
verisi için sürümlü ortak belge sözleşmesi yoktu. Atanmış grup koçunun kulüp
egzersizi üretmesi ve planın kaynak egzersiz değişikliklerinden korunması gerekir.

## Decision

- `DrillScope` değeri `GLOBAL | CLUB` olur. `Drill`, `scope`, isteğe bağlı
  `clubId`/`groupId` ve `createdById` taşır. Eski kayıtlar `GLOBAL` kabul edilir.
- `SYSTEM_ADMIN` global/all; `CLUB_ADMIN` kendi kulübü; `COACH` yalnız atandığı
  grupta kendi oluşturduğu kulüp egzersizi için mutation yapar. `PLAYER` yazamaz.
- Global egzersiz koç tarafından değiştirilmez; “Kopyala ve düzenle” grup kapsamlı
  yeni kayıt üretir. Request gövdesi ownership alanlarını belirleyemez.
- Tek `TacticalBoardDocumentV1` sözleşmesi `schemaVersion: 1`,
  `kind: tactical-board`, canonical saha/ölçü ve ayrıştırılmış kimlikli element
  birleşimini taşır. Bilinmeyen alan/tür reddedilir; sınır 250 element ve 100 KB'dır.
- Tam/yarım/üçte bir/çeyrek, 7v7, 5v5, antrenman, grid, penaltı, korner ve serbest
  vuruş sahaları canonical'dır.
- `PlanDrill.boardSnapshot` kaynak egzersizden bağımsız kopyayı,
  `Match.tacticalBoard` maç tahtasını `opponentAnalysis` alanından ayrı saklar.
- Plan snapshot ve maç tahtası dedicated, doğrulamalı ve kaynak/tenant yetkisini
  yeniden kontrol eden endpoint'lerle güncellenir.

## Consequences

Koçlar sistem kataloğunu bozmadan kulüp bilgisi üretir. JSON doğrulama hem API hem
istemci sınırında yapılır. Taktik belge evrimi yeni schema version/ADR gerektirir.

PlayDrill uyumluluğu, animasyon, video ve çok sahneli tahta bu kararın dışındadır.

## Migration, Rollout and Rollback

`20260904000000_add_tactical_boards` additive enum/kolon/index/foreign key ve scope
check constraint'i ekler. PostgreSQL 16 temiz veritabanında deploy ve schema diff
doğrulanmıştır. Rollback önce yeni yazmaları durdurur ve uygulamayı önceki sürüme
alır; korunması gereken veri oluşmuşsa kolon/enum silinmez. Yalnız doğrulanmış,
verisiz ephemeral ortamda migration'daki constraint, foreign key, index, kolon ve
son olarak enum ters sırayla kaldırılabilir.

## Verification

Backend belge/sınır ve rol/sahiplik unit testleri, clean migration/schema diff ve
iki kulüplü browser E2E geçti. E2E koç oluşturma → yeniden açma → plan snapshot →
maç tahtası → çapraz tenant `403` zincirini doğrular.

## Open Questions

- Taktik belge v2 ihtiyaçları, arşivleme/retention ve formal audit kapsamı `TBD`.
