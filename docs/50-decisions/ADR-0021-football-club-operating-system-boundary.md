# ADR-0021: Football Club Operating System ürün sınırı

- **Status:** Accepted
- **Date:** 2026-09-06
- **Owners / approvers:** Explicit user approval; named product owner TBD
- **Supersedes / superseded by:** Supersedes ADR-0002 for the long-term product
  boundary; preserves the completed narrow MVP as the baseline
- **Related:** Phase 2 product/architecture proposal, M5, ADR-0022, ADR-0023,
  ADR-0024

## Context

ADR-0002, ilk doğrulanabilir ürünü sezon/antrenman, katılım ve taktik analizle
sınırladı. Bu dilim tamamlandı. Onaylanan Phase 2 vizyonu NGCS'yi akademiden A
takıma sportif operasyonu ve karar kanıtlarını taşıyan bir Football Club Operating
System + Football Intelligence Platform olarak genişletir.

## Decision

- Mevcut MVP silinmez; yeni ürünün ilk çalışan dikey dilimi olarak korunur.
- Uzun vadeli kapsam kulüp/takım/sezon, oyuncu yolu, gelişim, oyun modeli,
  antrenman, maç/analiz, scouting, performans, sportif uygunluk ve kontrollü
  intelligence bağlamlarını kapsar.
- Ürün farklılaşması, oyun modeli -> gelişim hedefi -> antrenman -> kanıt ->
  değerlendirme -> sonraki karar döngüsüdür.
- Sağlık, AI, dış veri/video ve production kullanımı kendi karar kapılarını korur;
  bu ADR onları uygulama onayı sayılmaz.
- İlk teslim P0.1 Sporting Foundation and Pathway Proof kapsamıyla sınırlıdır.

## Consequences

Ürün ve domain belgeleri Phase 2 yol haritasını taşıyabilir. Sonraki modüller sırf
vizyonda yer aldığı için `Implemented` sayılamaz. Her faz kendi kabul kanıtını ve
gerekiyorsa ayrı ADR/migration onayını ister.

## Rollout and rollback

P0.1 eklemeli ve geriye uyumlu ilerler. Mevcut MVP rotaları ve modelleri parity
kanıtı olmadan kaldırılmaz. Ürün sınırı geri alınırsa yeni faz durdurulur; çalışan
MVP tabanı korunur.

## Open questions

Ticari hedef segment, fiyatlandırma, delivery kapasitesi, sürüm tarihi ve başarı
metrikleri `TBD`.
