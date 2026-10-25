# ADR-0032: Profesyonel egzersiz sürümleme ve yaş varyantları

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners / approvers:** Kullanıcı planı 2026-09-09 tarihinde açıkça onayladı; futbol uzmanı `TBD`
- **Related:** ADR-0012, ADR-0022, REQ-023, BL-056, CR-024

## Context

Mevcut `Drill` kaydı plan bağlantılarını koruyor ancak yayın yaşam döngüsü,
immutable sürüm, profesyonel uygulama ayrıntısı veya yaşa özgü uyarlama taşımıyor.
Tek yaş etiketiyle filtreleme aynı içeriğin tekrar kopyalanmasına yol açıyor.

## Decision

- `Drill` kalıcı kimlik ve mevcut plan ilişkilerinin sahibi olmaya devam eder.
- İçerik `DrillVersion` içinde immutable sürümlenir; yayınlanmış sürüm yerinde
  değiştirilmez, düzenleme yeni taslak sürüm üretir.
- `DrillAgeVariant` U12, U14, U16, U18 ve A Takım için süre, alan, oyuncu aralığı,
  kural ve koçluk noktalarını ana içerik altında çözümler.
- Yaşam döngüsü `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED` olur.
  Veritabanı aynı egzersiz için tek yayınlanmış sürümü koşullu unique indeksle
  korur.
- `PlanDrill.boardSnapshot` mevcut immutable plan kopyası olarak kalır; kaynak
  sürüm değişimi plan geçmişini değiştirmez.
- Mevcut egzersizler silinmez; yayınlanmış legacy sürüm ve kesin yaş varyantıyla
  backfill edilir, oyuncu aralığı gibi bilinmeyen alanlar tahmin edilmez.

## Consequences

Katalog yayınlanmış sürümü takım yaşına göre çözebilir; taslaklar katalogda
görünmez. Yeni tablolar additive migration gerektirir. İçerik reviewer'ı `TBD`
olduğu sürece başlangıç paketi yayınlanamaz.

## Rollout and rollback

Migration temiz ve legacy kayıtlı disposable PostgreSQL 16 üzerinde doğrulanır.
Uygulama katmanı önce kapatılabilir; tablolar ancak içerik export/retention kararı
sonrası kaldırılabilir. Retained local import ve production rollout ayrı onaydır.
