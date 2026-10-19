# Data Model

## Canonical Entities

Doğrulanmış Prisma şeması şu kümeleri içerir:

- Kimlik ve organizasyon: `User`, `Club`, `Person`, `PlayerProfile`,
  `StaffProfile`, `Team`, `ClubSeason`, `TeamSeason`, `FunctionalRole`,
  `RoleCapability`, `SportingAssignment`, `ExternalIdentity`,
  `AvailabilityPeriod`; compatibility için `PlayerGroup`, `GroupMember`.
- Hesap yaşam döngüsü: `AccountInvitation`, `PasswordResetToken`,
  `SecurityAuditEvent`, `RefreshSession`.
- Antrenman: `Drill`, `DrillVersion`, `DrillAgeVariant`, `DrillSource`,
  `TrainingPlan`, `PlanDrill`, `Attendance`.
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
- `TrainingPlan` başlık/tarih/amaç düzenlemesi bağlı `DayPlan` izdüşümünü aynı
  Serializable transaction'da günceller. Tarih bağlı sezon haftasına
  eşlenemiyorsa yazım reddedilir. Kalıcı silme `DayPlan`, `Attendance`,
  `PlanDrill`/snapshot ve planı açık sırayla tek transaction'da kaldırır; şema
  cascade'i veya soft-delete alanı kullanılmaz (ADR-0026).
- `Drill.scope` `GLOBAL` veya `CLUB` değeridir. Global kayıt ownership alanı
  taşımaz; kulüp kaydı zorunlu `clubId` ve `createdById`, isteğe bağlı `groupId`
  taşır. Database check constraint'i bu ayrımı doğrular.
- `Drill` kalıcı egzersiz kimliğidir; profesyonel global içerik immutable
  `DrillVersion` ile sürümlenir. Aynı drill/version ve aynı sürüm/yaş varyantı
  tekildir; koşullu indeks aynı drill için en fazla bir `PUBLISHED` sürüme izin
  verir. `DrillSource.contentHash` nullable-unique olup idempotent paket aktarımını
  ve kaynak kanıtını bağlar. `DrillAgeVariant` süre, alan, oyuncu aralığı, kural
  ve koçluk uyarlamasını ana sürüm altında tutar (ADR-0032–0034).
- `PlanDrill.boardSnapshot`, planlama anındaki doğrulanmış taktik belge kopyasıdır;
  kaynak `Drill.jsonData` değişikliğinden etkilenmez.
- `Attendance` için `(planId, playerId)` birleşik unique constraint'i ADR-0019
  kapsamında DB tekilliğini uygular. Yazım aynı anahtarlı atomik upsert'tir;
  eşzamanlı geçerli yazımlarda son commit edilen başarılı status ortak son durumdur.
- Grup kapsamlı `CLUB` drill yalnız aynı grup planına; club-wide `groupId = null`
  drill yalnız aynı kulüp planına bağlanabilir. `GLOBAL` drill bütün planlarda
  kullanılabilir. Season day ve training plan kulüp/grup kimliği eşleşir; bağlı
  plan sonradan farklı gruba taşınamaz. Bu kontroller serializable transaction'dadır.
- `Match.tacticalBoard`, `opponentAnalysis` metin/JSON alanından ayrı doğrulanmış
  maç tahtasıdır.
- ADR-0036 / BL-058b aynı `Drill.jsonData`, `PlanDrill.boardSnapshot` ve
  `Match.tacticalBoard` JSON kolonlarında V1/V2 document adaptörlerini ekler;
  fiziksel şema veya migration değişmez. V2 bütün sahneleri taşır, snapshot
  kaynak değişiminden bağımsızdır. Write token kayıt/snapshot-kaynak kimliği ve
  canonical içerikten hesaplanır; veritabanında saklanan revision değildir.
  Global `DrillVersion.boardDocument` V1 kalır; V2 yazımı varsayılan kapalıdır.
  [Sözleşme](TACTICAL_ANIMATION_V2.md).
- `Person` uygulama hesabından bağımsızdır; `User.personId` isteğe bağlı ve
  benzersizdir. Oyuncu/staff login olmadan var olabilir.
- `PlayerNote`, login hesabından bağımsız `Person` oyuncuya, kulüp, kaynak takım
  ve yazara bağlı teknik gözlemdir. `expectedVersion` ile değişen her durum
  `PlayerNoteRevision` üretir; kalıcı silme yerine `archivedAt` kullanılır.
  `PlayerNoteTeamGrant` aynı kulüpte oyuncunun aktif ataması bulunan yeni takıma
  yönetici tarafından verilen açık görünürlük kaydıdır. Legacy `PlayerCoachNote`
  uyumluluk için korunur ve tahmine dayalı backfill yapılmaz (ADR-0031).
- `Team` sezonlar boyunca kalır; kategori/yaş etiketi kulüp verisidir.
  `ClubSeason` kulüp takvimini, `TeamSeason` takımın o takvimdeki bağlamını tutar.
  `Team.archivedAt` ve legacy `PlayerGroup.archivedAt` yalnız altyapı takımını
  aktif operasyonlardan çıkarır; ilişkili geçmişi silmez. Kulüp başına tek aktif
  `A_TAKIM` koşullu tekil indeksle korunur (ADR-0028).
- `PlayerGroup.ageGroup` ve `Drill.ageGroup` yapılandırılabilir metin etiketidir;
  yazım sınırı trim edilmiş, kontrol karakteri içermeyen 1–32 karakterdir.
- `SportingAssignment` başlangıç ve isteğe bağlı bitiş tarihi, tür, takım,
  takım-sezon, işlevsel rol, gerekçe, kaynak ve oluşturan aktör taşır. Tarih aralığı
  DB check'iyle korunur; açık `PRIMARY_REGISTERED` kişi/kulüp başına tektir.
  Geçici atamalar ana kayıtla eşzamanlı olabilir.
- `RoleCapability`, `TEAM_VIEW`, `PLAYER_VIEW`, `PLAYER_HISTORY_VIEW`,
  `ASSIGNMENT_MANAGE` ve `AVAILABILITY_VIEW` gibi ayrı yetenekleri işlevsel role
  bağlar. Teknik `UserRole` tek başına Phase 2 erişim politikası değildir.
- `AvailabilityPeriod` yalnız sportif uygunluk statüsü ve kısıt özetidir; klinik
  tanı veya tedavi detayı P0.1 modeline taşınmaz.
- Çekirdek kaynakların tenant/kulüp sahipliği ADR-0007 authorization katmanında
  uygulanır. İleri analiz kaydı sahipliği `TBD`.

## Lifecycle and Retention

P0.1b maintains mapped legacy group/season/member facts through a shared domain
adapter in the same transaction. Member removal ends the legacy assignment;
Group/Season deletion preserves sporting history. Independent primary/guest/staff
assignments do not silently grant legacy membership. ADR-0028 daha sonra yedinci
migration ile takım yaşam döngüsü alanlarını ve yapılandırılabilir kademe
etiketlerini eklemiştir. See [P0.1b compatibility contract](P01B_COMPATIBILITY_CUTOVER.md).

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
- `20260906000000_add_attendance_uniqueness`, önce duplicate çiftlerde veri
  değiştirmeden fail-fast olur, ardından `(planId, playerId)` unique index'ini
  oluşturur. Clean ve duplicate disposable PostgreSQL 16 kanıtları ADR-0019'dadır.
- `20260906010000_add_system_admin_recovery_audit`, yalnız
  `SecurityAuditAction.SYSTEM_ADMIN_RECOVERED` enum değerini ekler. Break-glass
  komutu çalıştırılmadan önce uygulanır; raw token, parola veya delivery outbox
  kolonu eklemez. Uygulama rollback'inde enum ve tarihsel audit kayıtları korunur.
- `20260906020000_add_sporting_foundation`, P0.1 tablolarını ve bağlantıları
  additive ekler. Mevcut kulüp kullanıcılarını deterministik `Person` kayıtlarına,
  grupları aynı kimlikli `Team` kayıtlarına, sezonları TeamSeason bağlamına ve
  üyelikleri yalnız kanıtlanan `LEGACY_MEMBER` atamalarına dönüştürür; primarilik
  tahmin etmez. Verification fixture/assertion SQL'i legacy-verili disposable
  PostgreSQL'de çalışır ve schema diff boştur.
- `20260908000000_add_team_lifecycle`, mevcut ageGroup enum değerlerini veri
  kaybetmeden `text` kolonlarına geçirir; `Team`/`PlayerGroup.archivedAt`, audit
  olayları ve kulüp başına tek aktif A Takım partial unique indeksini ekler.
  Clean deploy/status/diff ile retained-veri clone hash karşılaştırması geçmiştir.
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

### P0.1 sporting-foundation rollback

Retained ortamda önce yeni sporting yazmaları durdurulur ve önceki uygulama
revision'ına dönülür. Legacy `PlayerGroup`/`GroupMember`/`Season` tabloları
silinmediği için mevcut MVP okumaları devam eder; yeni tablolar ve bağlantılar
korunur. Veri içeren ortamda enum/tablo drop'u yapılmaz; hata forward-fix migration
ile düzeltilir. Yalnız disposable provada tüm hedef DB yeniden oluşturulabilir.

### Team-lifecycle rollback

Yeni takım mutation'ları durdurulur ve önceki uygulama revision'ına dönülür.
Retained ortamda archive alanları, audit enum değerleri veya metin ageGroup
kolonları destructive biçimde geri çevrilmez; forward-fix migration kullanılır.
Partial unique indeks yalnız duplicate aktif A Takım olmadığı doğrulandıktan sonra
değiştirilebilir. Ayrıntı [ADR-0028](../50-decisions/ADR-0028-first-team-and-academy-lifecycle.md)
içindedir.
