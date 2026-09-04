# Data Model

## Canonical Entities

Doğrulanmış Prisma şeması şu kümeleri içerir:

- Kimlik ve organizasyon: `User`, `Club`, `PlayerGroup`, `GroupMember`.
- Hesap yaşam döngüsü: `AccountInvitation`, `PasswordResetToken`,
  `SecurityAuditEvent`.
- Antrenman: `Drill`, `TrainingPlan`, `PlanDrill`, `Attendance`.
- Sezon: `Season`, `WeekPlan`, `DayPlan`, `Match`.
- Analiz ve performans: `PlayerLoad`, `PlayerPerformance`, `VideoAnalysis`,
  `AnalysisReport`, `TeamPerformance`, `ScoutingReport`, `MatchAnalysis`.
- Sağlık/notlar: `PlayerHealthLog`, `PlayerHealthStatus`, `PlayerCoachNote`.

## Invariants and Ownership

- `User.email` benzersizdir.
- `WeekPlan` için `(seasonId, weekNumber)` benzersizdir.
- `Season.clubId` ve `Season.groupId` zorunludur; sezon bir kulüp ve oyuncu grubuna
  açıkça aittir.
- Baseline constraint'i `SYSTEM_ADMIN.clubId = NULL` ve tüm diğer roller için
  `clubId IS NOT NULL` koşulunu uygular.
- Kullanıcı `ACTIVE`/`SUSPENDED` durumuna ve session revocation için artan
  `authVersion` değerine sahiptir.
- Davet/reset ham tokenları saklanmaz; yalnız benzersiz SHA-256 hash, expiry ve
  consume/revoke zamanları tutulur.
- İlişkilerin çoğu foreign key ile tanımlıdır.
- `TrainingPlan.totalDuration`, atomik drill replace işleminde ilişkili
  `Drill.durationMin` toplamından yeniden hesaplanır ve bağlı `DayPlan.duration`
  değeriyle senkronlanır.
- Çekirdek kaynakların tenant/kulüp sahipliği ADR-0007 authorization katmanında
  uygulanır. İleri analiz kaydı sahipliği `TBD`.

## Lifecycle and Retention

Silme, arşivleme, sağlık verisi saklama ve anonimleştirme politikası `TBD` ve
güvenlik/gizlilik onayı gerektirir.

## Migration Policy

- Korunacak veritabanı olmadığı onaylanarak eski driftli geçmiş tek
  `20260831000000_clean_baseline` migration'ıyla değiştirildi.
- Baseline güncel Prisma şemasının bütün modellerini, ADR-0005 rol enum'unu,
  ADR-0008 hesap yaşam döngüsünü ve sezonun zorunlu kulüp/grup ilişkisini içerir.
- Migration dosyaları Git tarafından izlenir ve uygulama başlangıcında otomatik
  çalıştırılmaz.
- Yeni migration SQL'i review, izole PostgreSQL provası ve rollback kanıtı olmadan
  retained environment'a uygulanmaz.
- Tarihsel fark ve doğrulama kanıtı `SCHEMA_MIGRATION_DRIFT.md`, süreç ADR-0006
  içindedir.
