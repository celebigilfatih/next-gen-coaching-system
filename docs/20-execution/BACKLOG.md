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
| BL-013 | Production origin ve kalıcı tarayıcı oturumu | P0 | ADR-0009, production/security owner | Origin, hosting ve session sınırı ADR ile onaylanır; domain/provider/süre/retention girdileri production öncesi kapanır | Proposed — ADR-0010 awaiting approval |
| BL-014 | Beş rotalı shadcn koç çalışma alanı | P0 | ADR-0009, ADR-0011 | Hafta, antrenman, taktik, kadro ve maç rotaları responsive kalite kapılarından geçer | Done — route/browser verified |
| BL-015 | Kulüp egzersizi ve ortak taktik tahta | P0 | ADR-0012, BL-014 | Sürümlü belge, tenant/sahiplik, plan snapshot ve maç tahtası uçtan uca doğrulanır | Done — unit/migration/E2E verified |
