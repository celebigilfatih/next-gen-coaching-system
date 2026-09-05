# Data Model

## Canonical Entities

Doğrulanmış Prisma şeması şu kümeleri içerir:

- Kimlik ve organizasyon: `User`, `Club`, `PlayerGroup`, `GroupMember`.
- Hesap yaşam döngüsü: `AccountInvitation`, `PasswordResetToken`,
  `SecurityAuditEvent`, `RefreshSession`.
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
- ADR-0018 `RefreshSession` yalnız SHA-256 credential hash'i, user/family id,
  authVersion, lifecycle zamanları ve kontrollü revoke nedeni taşır. Her refresh
  eski satırı tüketip aynı family altında yeni satır oluşturur; user-row lock login,
  rotation ve logout'u sıralar. Idle expiry absolute expiry'yi aşamaz. En fazla beş
  aktif family vardır; password/access/status ve global revoke bunları iptal eder.
- İlişkilerin çoğu foreign key ile tanımlıdır.
- `TrainingPlan.totalDuration`, atomik drill replace işleminde ilişkili
  `Drill.durationMin` toplamından yeniden hesaplanır ve bağlı `DayPlan.duration`
  değeriyle senkronlanır.
- `Drill.scope` `GLOBAL` veya `CLUB` değeridir. Global kayıt ownership alanı
  taşımaz; kulüp kaydı zorunlu `clubId` ve `createdById`, isteğe bağlı `groupId`
  taşır. Database check constraint'i bu ayrımı doğrular.
- `PlanDrill.boardSnapshot`, planlama anındaki doğrulanmış taktik belge kopyasıdır;
  kaynak `Drill.jsonData` değişikliğinden etkilenmez.
- Grup kapsamlı `CLUB` drill yalnız aynı grup planına; club-wide `groupId = null`
  drill yalnız aynı kulüp planına bağlanabilir. `GLOBAL` drill bütün planlarda
  kullanılabilir. Season day ve training plan kulüp/grup kimliği eşleşir; bağlı
  plan sonradan farklı gruba taşınamaz. Bu kontroller serializable transaction'dadır.
- `Match.tacticalBoard`, `opponentAnalysis` metin/JSON alanından ayrı doğrulanmış
  maç tahtasıdır.
- Çekirdek kaynakların tenant/kulüp sahipliği ADR-0007 authorization katmanında
  uygulanır. İleri analiz kaydı sahipliği `TBD`.

## Lifecycle and Retention

Refresh kayıtları iptal veya expiry'den 30 gün sonra silinmeye uygun hale gelir;
özellik açıkken startup, saatlik ve login cleanup çalışır. Ham token, IP ve
user-agent tutulmaz. Security audit, sağlık verisi, arşivleme ve anonimleştirme
politikası `TBD` ve ayrı güvenlik/gizlilik onayı gerektirir.

## Migration Policy

- Korunacak veritabanı olmadığı onaylanarak eski driftli geçmiş tek
  `20260831000000_clean_baseline` migration'ıyla değiştirildi.
- Baseline güncel Prisma şemasının bütün modellerini, ADR-0005 rol enum'unu,
  ADR-0008 hesap yaşam döngüsünü ve sezonun zorunlu kulüp/grup ilişkisini içerir.
- `20260904000000_add_tactical_boards`, `DrillScope`, drill ownership alanları,
  `PlanDrill.boardSnapshot` ve `Match.tacticalBoard` için additive migration'dır.
  Temiz PostgreSQL 16 üzerinde deploy edilmiş ve schema diff boş doğrulanmıştır.
- Migration dosyaları Git tarafından izlenir ve uygulama başlangıcında otomatik
  çalıştırılmaz.
- `20260905000000_add_refresh_sessions`, session tablosu/index/expiry check ve
  dört audit enum değeri için additive migration'dır; lifecycle revocation bu
  tabloyu kullandığından özellik kapalıyken de yeni backend'den önce uygulanır.
- Yeni migration SQL'i review, izole PostgreSQL provası ve rollback kanıtı olmadan
  retained environment'a uygulanmaz.
- Tarihsel fark ve doğrulama kanıtı `SCHEMA_MIGRATION_DRIFT.md`, süreç ADR-0006
  içindedir.

### Refresh-session rollback

ADR-0018 için backend/frontend flag'lerini kapat, yeniden açmadan önce aktif
refresh kayıtlarını revoke et veya ilgili kullanıcıların authVersion'ını artır.
Tablo ve enum değerleri korunur; destructive schema rollback gerekmez. Provider
ve gerçek ortam belirlenmeden production rollout/rollback gerçekleştirilmez.

### Tactical-board migration rollback

Retained ortamda rollback, önce yeni yazmaları durdurup önceki uygulamaya dönmeyi
ve additive kolonları korumayı tercih eder. Yalnız verisiz ephemeral ortamda
`Drill` foreign key/check/index'leri, üç ownership kolonu, iki JSONB kolonu ve en
son `DrillScope` enum'u ters sırayla kaldırılır. Üretim için backup/RPO/RTO sahibi
`TBD` olduğundan destructive rollback onaylı değildir.
