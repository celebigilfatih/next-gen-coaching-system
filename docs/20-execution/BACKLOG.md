# Backlog

| ID | Outcome | Priority | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| BL-001 | CDSK başlangıç bağlamı | P0 | CDSK 0.1.0 | Validator ve belge kontrolleri geçer | Done |
| BL-002 | Frontend kaynağı/topolojisi kararı | P0 | Repository kanıtı ve owner onayı | ADR karara bağlanır, gitlink bilinçli yönetilir | Done — monorepo workspace reserved |
| BL-003 | Prisma şeması/migration uzlaştırma planı | P0 | Hedef DB ve veri durumu | Drift raporu, rollback ve onaylı ADR | Done — clean baseline verified |
| BL-004 | Rol/yetki ve tenant izolasyonu | P0 | ADR-0005, BL-003 | Negatif yetki testleri dahil onaylı eylem matrisi ve uygulama | Done — ADR-0007 verified |
| BL-005 | Tekrarlanabilir kalite kapısı | P1 | Bağımlılık kurulumu | Lint, typecheck, test, build ve CDSK tek akışta geçer | Done — root quality gate verified |
| BL-006 | Dar MVP uçtan uca teslimi | P1 | BL-002–BL-005 | Onaylı çekirdek senaryolar geçer | Done — 3/3 core browser flows and root gate pass |
| BL-007 | Kritik auth/bootstrap güvenlik tabanı | P0 | ADR-0004 | Public privilege escalation, known JWT fallback, automatic admin seed ve passwordHash response yolları kapanır; unit test/build geçer | Done |
| BL-008 | Hesap provisioning ve rol yaşam döngüsü kararı | P0 | BL-004, ADR-0004 | Public kayıt/invitation, club assignment, first-admin ve role change politikası onaylanır | Done — ADR-0008 verified |
| BL-009 | Sağlık ve ileri analitik erişim politikası | P1 | Gizlilik/veri sahibi, ADR-0007 | Sağlık retention/audit ve analitik tenant sahipliği onaylanır; negatif testler eklenir | Backlog — outside MVP |
| BL-010 | Frontend teknoloji ve ilk ürün akışı | P0 | Persona, ADR-0003, backend API | Framework/runtime, ilk ekran akışı, auth sözleşmesi ve kalite kapıları onaylanır | Done — ADR-0009 accepted |
| BL-011 | E-posta teslimi ve hesap recovery | P1 | Provider/operations owner, ADR-0008 | Davet/reset teslimi, verification ve admin-yok recovery süreci onaylanır | Backlog — input TBD |
| BL-012 | Koç frontend dikey dilimi | P0 | ADR-0009, görsel yön seçimi, BL-005 | Login, haftalık sezon, antrenman planı ve katılım akışı onaylı görsel hedefle çalışır | Done — real API and browser E2E verified |
| BL-013 | Production origin ve kalıcı tarayıcı oturumu | P0 | ADR-0009, production/security owner | Origin, hosting ve session sınırı ADR ile onaylanır; domain/provider/süre/retention girdileri implementation öncesi kapanır | In progress — ADR-0010 accepted; required inputs TBD |
| BL-014 | Beş rotalı shadcn koç çalışma alanı | P0 | ADR-0009, ADR-0011 | Hafta, antrenman, taktik, kadro ve maç rotaları responsive kalite kapılarından geçer | Done — route/browser verified |
| BL-015 | Kulüp egzersizi ve ortak taktik tahta | P0 | ADR-0012, BL-014 | Sürümlü belge, tenant/sahiplik, plan snapshot ve maç tahtası uçtan uca doğrulanır | Done — unit/migration/E2E verified |
| BL-016 | Koç destek navigasyonunu genişlet | P1 | ADR-0013, BL-014 | Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve Ayarlar gerçek bağlamla açılır; masaüstü/mobil shell QA'dan geçer | Done — browser/design QA verified |

## 2026-09-05 MVP review backlog

Kaynak: [`MVP_REVIEW_2026-09-05.md`](../30-quality/MVP_REVIEW_2026-09-05.md).
Owner bilgisi doğrulanmadığı için bütün yeni işler `TBD` bırakılmıştır.

| ID | Finding / outcome | Priority | Owner | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| BL-017 | Dashboard recent drill tenant izolasyonu | P0 | TBD | F-001, ADR-0005/0007/0014 | İki kulüplü E2E'de CLUB_ADMIN yalnız global/kendi kulüp drill'lerini ve onaylı projection'ı görür | Done — E2E verified |
| BL-018 | Aggregate ilişkilerinde group invariant | P1 | TBD | F-002, ADR-0014 | Plan↔drill ve season day↔plan farklı group bağlantıları reddedilir; bağlı plan sonradan sınır dışına taşınamaz | Done — E2E verified |
| BL-019 | Socket.IO recipient authorization | P1 | TBD | F-003, ADR-0014 | Group B PLAYER/COACH, Group A presence/plan/attendance/drill payload'larını almaz | Done — current-recipient unit verified |
| BL-020 | Taktik editörü iç navigasyon kayıp koruması | P1 | TBD | F-004 | Sidebar, mobile nav, back ve programmatic navigate kirli durumda açık discard onayı olmadan rotayı değiştirmez | Done — Playwright verified |
| BL-021 | Password reset single-winner transaction | P2 | TBD | F-005, ADR-0015 | Eşzamanlı iki completion'da yalnız biri başarılıdır; kaybeden parola/audit yazamaz | Done — unit and PostgreSQL E2E verified |
| BL-022 | Tactical SVG güvenli serialization | P2 | TBD | F-006, ADR-0015 | Canonical color allowlist ve XML escaping testleri geçer; enjeksiyon girdisi reddedilir | Done — backend/frontend unit verified |
| BL-023 | Kritik negatif test matrisi | P2 | TBD | BL-017–BL-022 | Stats tenant, iki-group aggregate, Socket recipient, reset concurrency, board SVG ve dirty navigation testleri kalite kapısına bağlanır | Done for F-001–F-006; broader DTO/log coverage remains BL-024 |
| BL-024 | Log redaction, DTO ve analytics lint temizliği | P3 | TBD | F-008, observability owner | Raw error/operational metadata politikaya uygun redacted; kritik body'ler DTO ile doğrulanır; analytics warning'leri kapanır | Planned |
| BL-025 | Prisma production advisory kararı | P2 | TBD | M4, ADR-0016 | 3 high advisory için kanıtlı upgrade/downgrade/acceptance kararı ve lockfile audit kanıtı kaydedilir | Done — not_actionable runtime triage; temporary risk accepted |
| BL-026 | Runtime ve migrator image ayrımı | P1 | TBD | ADR-0017, CR-012 | Runtime image Prisma CLI/test/build paketlerini içermez; ayrı migrator aynı revision/lockfile ile yalnız onaylı deploy migration'ını çalıştırır | Done — image inventory, clean migration/idempotency, runtime smoke and E2E verified |
