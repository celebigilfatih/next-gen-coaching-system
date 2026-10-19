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
- **Review status:** İlk tam MVP review hükmü **Fail** idi; M3.2 remediation sonrası
  kabul kapısı 2026-09-05 tarihinde **Pass** olarak yeniden doğrulandı.

## Milestone M3.2 — MVP stabilizasyonu

- **Outcome:** Tam MVP review'da bulunan tenant, group, Socket recipient,
  kaydedilmemiş veri, reset concurrency ve SVG enjeksiyon riskleri kapalıdır.
- **Dependencies:** M3.1, ADR-0014 ve ADR-0015.
- **Exit criteria:** Root quality; disposable PostgreSQL migration/status/diff;
  backend 9/9 E2E; frontend 3/3 Playwright E2E; CDSK ve diff kontrolleri geçer.
- **Risks:** Production session/deployment, formal WCAG, ADR-0016 ile geçici kabul
  edilen dependency advisory'nin production re-review'u, log/DTO borcu ve ürün
  metrikleri `TBD` kalır. Runtime/migrator ayrımı ADR-0017 ile tamamlanmıştır.
- **Status:** Completed 2026-09-05 — remediation review Pass.

## Milestone M4 — Production session hazırlığı

- **Outcome:** ADR-0010 sınırında güvenli ve kalıcı tarayıcı oturumu.
- **Dependencies:** Exact domain/provider, session lifetime/retention ve production
  operasyon girdileri. Session lifetime/refresh-record retention ADR-0018 ile
  onaylanmıştır. ADR-0017 artifact ayrımı ve ADR-0018 opt-in uygulaması tamamlanmıştır.
- **Exit criteria:** Migration/API sözleşmesi ve operasyon kapıları onaylanır;
  doğrulanmış artifact'lar seçilen registry/orchestrator'da ayrı DB yetkileriyle
  çalışır; staging doğrulamaları geçer.
- **Risks:** Zorunlu girdiler `TBD`; ADR-0016 advisory kabulü production öncesi
  yeniden incelenmelidir.
- **Status:** In progress — provider-neutral sessions implemented, production inputs TBD.

## Milestone M5 — Phase 2 P0.1 sportif temel

- **Outcome:** Kulüp, takım, sezon, kişi ve oyuncu/staff atama geçmişi güvenilir
  bir sportif organizasyon çekirdeğinde birleşir.
- **Dependencies:** M3.2; ADR-0021, ADR-0022, ADR-0023 ve ADR-0024.
- **Exit criteria:** Additive migration ve legacy backfill provası; capability,
  mass-assignment ve iki-kulüp testleri; U17→U19→A takım yolculuk E2E'si; takım
  ve Player 360 rotalarının 1440/1024/390 px doğrulaması; BL-042 atomik compatibility,
  parity, scope persistence ve dirty-navigation doğrulaması; root kalite kapısı.
- **Risks:** Doğrudan DB/eski uygulama yazımlarında parity; minor/safeguarding,
  sağlık retention ve production rollout politikaları `TBD`.
- **Status:** Completed in repository and approved local environment 2026-09-06.
  Backup/restore, migration, parity and browser smoke passed; production rollout
  not performed. [Local evidence](../30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md).

## Milestone M5.3 — Profesyonel egzersiz kütüphanesi

- **Outcome:** Global kütüphane immutable sürüm, yaş varyantı, kaynak/lisans
  kanıtı ve ayrık author-reviewer-publisher akışıyla yönetilir.
- **Dependencies:** M3, M5; ADR-0032, ADR-0033, ADR-0034; named football expert.
- **Exit criteria:** 120 özgün Türkçe kayıt üç 40'lık dalgada uzman incelemesi
  alır; migration/backfill, strict API, katalog/detail/manage UI, idempotent
  import, E2E ve responsive kalite kapıları geçer.
- **Risks:** Futbol uzmanı ve hukuk/production sahipleri `TBD`; bu kişiler
  atanmadıkça taslaklar doğrulanmış veya yayınlanmış içerik sayılmaz.
- **Status:** In progress — repository foundation ve 120 DRAFT manifest hazır;
  uzman incelemesi, retained import ve yayın yapılmadı.
