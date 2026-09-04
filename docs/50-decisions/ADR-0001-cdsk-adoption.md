# ADR-0001: CDSK 0.1.0 benimsenmesi

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Product owner
- **Supersedes / superseded by:** N/A
- **Related:** `.cdsk.json`, `AGENTS.md`, `PROJECT_BOOT.md`

## Context

Repository'de kalıcı ürün, mimari, karar, kalite ve operasyon bağlamı eksikti;
mevcut raporlar güncel kodla çelişiyordu.

## Decision Drivers

Tek doğruluk kaynağı, AI/dev sürekliliği, görünür karar kapıları ve doğrulanabilir
proje başlangıcı.

## Considered Options

1. Mevcut dağınık belgelerle devam etmek.
2. CDSK sürümünü `TBD` bırakmak.
3. Yereldeki güncel CDSK 0.1.0 sürümüne sabitlemek.

## Decision

CDSK 0.1.0 kullanılacak; bilinmeyen proje bilgileri `TBD` kalacak.

## Consequences

Zorunlu bilgi mimarisi ve validator kalite kapısı gelir. Repository runtime'ı bu
kararla değişmez. Sürüm yükseltmesi ayrıca etki incelemesi gerektirir.

## Rollout and Rollback

CDSK belgeleri tek değişiklik seti olarak eklenir. Geri alma runtime veya veri
migration'ı gerektirmez.

## Open Questions

Taşınabilir/repository-pinned validator modeli `TBD`.
