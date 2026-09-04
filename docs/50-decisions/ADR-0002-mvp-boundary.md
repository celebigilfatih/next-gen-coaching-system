# ADR-0002: Dar MVP sınırı

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Product owner
- **Supersedes / superseded by:** N/A
- **Related:** `docs/00-product/SCOPE.md`, `docs/00-product/PRODUCT_SPEC.md`

## Context

Backend prototipi sağlık, performans, scouting ve çeşitli analiz alanlarını
içeriyor; kullanıcı ilk hedefi antrenman planlama/takip ve taktik analiz olarak
tanımladı.

## Decision Drivers

İlk değeri sınırlamak, kapsamı test edilebilir tutmak ve mevcut prototip kodunu
yanlışlıkla onaylı ürün kapsamı saymamak.

## Considered Options

1. Mevcut backend modüllerinin tamamını MVP kabul etmek.
2. MVP sınırını belirsiz bırakmak.
3. Sezon bağlamında planlama, katılım/takip ve temel taktik analize daraltmak.

## Decision

Seçenek 3 kabul edildi. Destekleyici kimlik, kulüp ve takım/grup işlevleri MVP'nin
çalışması için kapsamdadır; diğer mevcut modüller Later/prototip olarak sınıflanır.

## Consequences

MVP dışı kod silinmez fakat tamamlanmış ürün taahhüdü oluşturmaz. Kapsam
genişlemesi change request ve gerekirse ADR ister.

## Rollout and Rollback

Ürün, roadmap ve backlog belgeleri bu sınırı taşır. Değişiklik yalnızca yeni,
açık onaylı scope kararıyla supersede edilir.

## Open Questions

Birincil persona, ayrıntılı taktik analiz sözleşmesi ve başarı metrikleri `TBD`.
