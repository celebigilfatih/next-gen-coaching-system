# ADR-0024: Provider-neutral entegrasyon ve intelligence sınırı

- **Status:** Accepted
- **Date:** 2026-09-06
- **Owners / approvers:** Explicit user approval; named integration/AI owners TBD
- **Supersedes / superseded by:** Extends the N/A/TBD AI and integration baseline
- **Related:** ADR-0021, Phase 2 proposal, P4, P5

## Context

Profesyonel video, event/tracking, EPTS ve küresel scouting verisi uzman sağlayıcı
alanlarıdır. AI ise yalnız yetkili ve kaynaklı NGCS verisi üzerinde güvenilir karar
desteği sağladığında ürün değeri üretir.

## Decision

- NGCS dış sağlayıcı kimliklerini, source/version/unit/quality/provenance bilgisiyle
  eşler; sağlayıcı ontology'sini canonical domain yapmaz.
- Global maç verisi, profesyonel video/capture ve sensor donanımı önce entegrasyon
  olarak değerlendirilir; P0.1'de sağlayıcı seçilmez.
- AI çıktısı facts, interpretation, recommendation, confidence/limitations ve
  sources bölümlerini ayırır.
- Yetki retrieval öncesi uygulanır; prompt/model/tool/source set ve kullanıcı/purpose
  audit edilir. Yüksek etkili yazımlar insan onayı ve domain validation ister.
- Medical diagnosis, injury-risk claim, otomatik squad/release/contract kararı ve
  kanıtsız readiness/potential skoru kapsam dışıdır.

## Consequences

Kulüp sağlayıcı değiştirdiğinde kendi gelişim ve karar geçmişini korur. Entegrasyon
ve AI ancak veri hakları, güvenlik, maliyet, evaluation ve exit planı onayından sonra
production'a alınır.

## Rollout and rollback

P0.1 yalnız `ExternalIdentity` ve provenance temelini kurar. P4/P5 implementasyonu
yeni change request ve gerekirse sağlayıcı/AI ADR'si ister. Bir sağlayıcı kapatılırsa
canonical kayıtlar korunur ve ingestion durdurulur.

## Open questions

Vendor shortlist, maliyet, data export hakları, model/provider, hosting, evaluation
eşikleri ve observability `TBD`.
