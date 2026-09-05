# Milestones

## Milestone M0 — CDSK başlangıç

- **Outcome:** Doğrulanmış repository bağlamı ve görünür karar kapıları.
- **Dependencies:** CDSK 0.1.0.
- **Exit criteria:** CDSK validator, yerel bağlantı ve diff kontrolleri geçer;
  uygulama kodu değişmez; ortam engelleri kaydedilir.
- **Risks:** Tarihsel belgelerin güncel sanılması, eksik frontend ve test ortamı.
- **Status:** Completed 2026-08-31.

## Milestone M1 — MVP karar ve güvenilirlik tabanı

- **Outcome:** Persona, kabul kriterleri, frontend, veri ve güvenlik sınırları onaylı.
- **Dependencies:** M0 ve gerekli kullanıcı kararları.
- **Exit criteria:** İlgili ADR'ler karara bağlanmış; test/build/migration kapıları çalışır.
- **Risks:** Başarı metrikleri ve production politikasının `TBD` olması.
- **Status:** Completed 2026-09-01 — data/security/persona/frontend decisions and
  repeatable repository quality gate verified.

## Milestone M2 — Dar MVP

- **Outcome:** Antrenman planlama, katılım/takip ve taktik analiz uçtan uca çalışır.
- **Dependencies:** M1.
- **Exit criteria:** Ürün kabul senaryoları ve güvenlik/kalite kapıları geçer.
- **Risks:** Hedef tarih ve başarı metriği `TBD`.
- **Status:** Completed 2026-09-01 — login/plan/phased drills/attendance and
  tactical persistence plus repository quality gate pass.

## Milestone M3 — Ortak taktik çalışma alanı

- **Outcome:** Beş adreslenebilir koç rotası, etkileşimli taktik tahtası ve
  kulüp/grup kapsamlı egzersiz kütüphanesi.
- **Dependencies:** M2, ADR-0011 ve ADR-0012.
- **Exit criteria:** Clean migration/schema diff; tahta doğrulama ve yetki unit
  testleri; koç egzersiz → plan snapshot → maç tahtası → cross-tenant ret E2E;
  1440/1024/390 rota kontrolleri ve repository kalite kapısı.
- **Risks:** Production session/deployment, formal WCAG ve ürün metrikleri `TBD`.
- **Status:** Completed 2026-09-04.

## Milestone M3.1 — Koç navigasyonunu genişletme

- **Outcome:** Eski arayüzdeki MVP destek girişleri ortak shadcn shell içinde
  gerçek workspace bağlamıyla erişilebilir.
- **Dependencies:** M3, ADR-0013.
- **Exit criteria:** Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve Ayarlar rotaları;
  dokuz girişli masaüstü navigasyonu; beş ana görevli mobil alt navigasyon ve tam
  menü Sheet'i browser/design QA'dan geçer.
- **Risks:** Formal WCAG hedefi, browser matrisi ve tasarım owner'ı `TBD`.
- **Status:** Completed 2026-09-05.

## Milestone M4 — Production session hazırlığı

- **Outcome:** ADR-0010 sınırında güvenli ve kalıcı tarayıcı oturumu.
- **Dependencies:** Exact domain/provider, session lifetime/retention ve production
  operasyon girdileri.
- **Exit criteria:** Migration/API sözleşmesi ve operasyon kapıları onaylanır;
  staging doğrulamaları geçer.
- **Risks:** Zorunlu girdiler `TBD`.
- **Status:** Planned — required inputs TBD.
