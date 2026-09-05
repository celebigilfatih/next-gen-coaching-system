# Changelog

## [Unreleased]

### Added

- Accepted ADR-0018: varsayılan kapalı, provider-neutral kalıcı oturum; 15m access,
  7d idle/30d absolute refresh, beş aktif family ve 30d refresh-record retention.
- Additive RefreshSession migration'ı, hash-only credential lineage, atomik rotation,
  replay audit'i ve login/refresh/logout origin/header kontrolleri.
- Reload bootstrap, tek refresh isteği ve sekmeler arası Web Locks, güvenli logout
  ve family-bound HTTP/Socket revocation için unit/PostgreSQL/browser regresyonları.

- CDSK 0.1.0 proje manifesti, çalışma protokolü ve zorunlu bilgi mimarisi.
- Doğrulanmış mevcut durum, dar MVP kapsamı, riskler ve AI handoff kaydı.
- CDSK benimsenmesi ve MVP kapsamı için kabul edilmiş ADR'ler.
- Auth DTO doğrulaması, request throttling ve güvenlik regresyon unit testleri.
- Authentication/bootstrap güvenlik tabanı için Accepted ADR-0004.
- Global `SYSTEM_ADMIN` ile kulüp kapsamlı `CLUB_ADMIN`, `COACH` ve `PLAYER`
  sınırlarını tanımlayan Accepted ADR-0005.
- Prisma şema/migration drift envanteri ve veri korumalı rol geçişi için Accepted
  ADR-0006.
- `SYSTEM_ADMIN`, `CLUB_ADMIN`, atanmış-grup `COACH` ve özne/grup kapsamlı `PLAYER`
  eylemlerini tanımlayan Accepted ADR-0007.
- Ortak authorization service ile current-database principal, cross-club negatif
  unit/E2E testleri ve authenticated Socket.IO regresyon testleri.
- Destructive E2E temizliği için ayrı test URL'si ve açık reset onayı zorunluluğu.
- Frontend repository topolojisi için Accepted ADR-0003 ve framework-neutral
  `apps/frontend` workspace belgesi.
- Invitation-only provisioning, suspension, session revocation, password reset ve
  security audit politikasını tanımlayan Accepted ADR-0008.
- Hesap daveti/reset token tabloları, `ACTIVE`/`SUSPENDED` durumu, `authVersion` ve
  lifecycle unit/E2E testleri.
- Koçu birincil persona; React/TypeScript, React Router SPA, Vite ve npm'i frontend
  tabanı; haftalık sezon-plan-katılım akışını ilk dikey dilim kabul eden ADR-0009.
- Seçilen “Koç Operasyon Masası” yönünü uygulayan responsive frontend; login,
  haftalık antrenman, katılım ve maç taktik notu akışları ile tarayıcı destekli
  görsel QA kanıtı.
- Gerçek koç login → atanmış takım/sezon → antrenman planı → katılım akışını
  doğrulayan fail-closed dedicated-DB fixture/runner ve Playwright browser E2E testi.
- Yetkili sezon maçını yükleyip rakip/taktik analiz JSON'u, diziliş ve koç notunu
  kalıcılaştıran bağımsız ikinci Playwright browser E2E senaryosu.
- Yaş grubuna uygun katalogdan dört fazlı drill seçimi ve faz notu kalıcılığını
  doğrulayan üçüncü Playwright browser E2E senaryosu.
- Backend/frontend typecheck, salt-okunur lint/format, unit test, izole-output build,
  Sites, Markdown link, CDSK ve diff adımlarını birleştiren kök `npm run quality`
  kapısı.
- Fresh clone kalite akışında typecheck öncesi Prisma Client üreten explicit kapı.
- Aynı site altındaki production frontend/API origin'leri ile dönen, server-side
  revoke edilebilir kalıcı tarayıcı oturumunu seçenekleri ve rollout kapılarıyla
  tanımlayan Accepted ADR-0010.
- shadcn/Radix, Tailwind, Phosphor ve React-Konva ile beş rotalı koç çalışma
  alanını kabul eden ADR-0011.
- `TacticalBoardDocumentV1`, `DrillScope`, kulüp/grup egzersiz sahipliği, plan
  snapshot'ı ve maç tahtası sınırlarını kabul eden ADR-0012.
- Tam/yarım/üçte bir/çeyrek, 7v7, 5v5, antrenman, grid, penaltı, korner ve serbest
  vuruş sahaları; oyuncu/ekipman/çizim araçları; formasyon, Transformer, grid-snap,
  50 adım undo/redo, açık save ve NGCS JSON/PNG/SVG aktarımı sunan taktik editörü.
- Kulüp egzersizi, antrenman snapshot'ı, maç tahtası ve çapraz tenant reddini
  doğrulayan iki kulüplü Playwright E2E.
- Eski “Koç Operasyon Masası” arayüzündeki MVP destek girişlerini güncel shadcn
  shell'e taşıyan Accepted ADR-0013; Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve
  Ayarlar rotaları.
- Üst menü araması, takım/sezon bağlamı, bildirim, shadcn Avatar/DropdownMenu ve
  mobil tam navigasyon Sheet'i.
- Genişletilmiş shell için masaüstü/mobil browser kanıtı ve kaynakla birleşik
  `design-qa.md` karşılaştırması.
- Dokuz masaüstü rota ve düzeltilmiş mobil kanıtı sıralı, düzenlenebilir kartlarda
  birleştiren doğrulanmış Figma UI audit panosu.
- `1b831e0` revision'ını ürün, backend, yetki, Prisma, frontend, taktik tahta,
  test ve CDSK katmanlarında doğrulayan tam MVP review raporu; endpoint matrisi,
  requirement izlenebilirliği ve önceliklendirilmiş BL-017–BL-025 backlog'u.
- Group/event sharing ve password-reset transaction karar kapıları için Proposed
  CR-009 ve CR-010.
- Disposable PostgreSQL 16 migration/status/schema diff, backend 7/7 E2E,
  frontend 2/2 Playwright E2E ve 1440/1024/390 runtime audit kanıtı.
- Dashboard/aggregate/Socket group izolasyonunu kabul eden ADR-0014 ve atomik
  password recovery/güvenli SVG serialization kararını kabul eden ADR-0015.
- İki-kulüplü dashboard, iki-gruplu aggregate, current-recipient Socket,
  eşzamanlı reset, güvenli SVG ve dirty-navigation regresyon testleri.
- Prisma CLI advisory zincirini hosted runtime için `not_actionable` sınıflandıran
  ve production öncesi yeniden incelemeli geçici risk kabulünü kaydeden ADR-0016.
- Runtime-only backend image ile ayrı migrator artifact/job modelini kabul eden
  ADR-0017 ve doğrulanmış CR-012.

### Changed

- ADR-0010 implementation gate'i ADR-0018 ile provider-neutral çalışma için
  genişletildi; production domain/provider/proxy/secret/rollout girdileri TBD kalır.
- Opt-in modda frontend login/refresh/logout credentialed cookie kullanır; business
  API bearer sözleşmesi korunur. Hesap lifecycle değişiklikleri aktif refresh
  kayıtlarını authVersion artışıyla birlikte revoke eder.

- Eski sezon planlama belgeleri güncel kaynak olmadıklarını belirten uyarılar
  taşıyacak şekilde sınıflandırıldı.
- Public kayıt fail-closed ve least-privilege hale getirildi; privileged role/club
  alanları dış request'ten kaldırıldı.
- JWT secret production'da zorunlu hale getirildi; bilinen fallback değerleri
  kaldırıldı.
- Production container başlangıcından otomatik seed kaldırıldı; bootstrap admin
  yalnızca external credential ile manuel oluşturulabilir.
- User response'ları Prisma default omit ve güvenli projection ile password hash
  taşımayacak şekilde sınırlandı.
- Attendance mutation RolesGuard ile bağlandı ve sezon hafta üretimine üst sınır
  eklendi.
- `npm audit fix` ile semver uyumlu NestJS, Socket.IO, JWT ve transitif güvenlik
  güncellemeleri uygulandı.
- Yeni Prisma migration'larının Git tarafından gizlenmesi kaldırıldı; uygulama
  başlangıcındaki otomatik migration ayrı `prisma:migrate:deploy` komutuna taşındı.
- Eski driftli migration geçmişi, güncel şemanın tamamını içeren doğrulanmış temiz
  baseline ile değiştirildi.
- `ADMIN` rolü `SYSTEM_ADMIN` ve `CLUB_ADMIN` olarak ayrıldı; bootstrap ve mevcut
  system-level guard referansları yeni enum'a taşındı.
- JWT principal her istekte güncel kullanıcı kaydından oluşturuluyor; client/token
  içindeki rol ve kulüp iddiaları tek başına yetki vermiyor.
- Kulüp, grup, antrenman planı, sezon ve katılım akışları kulüp/grup üyeliğine göre
  sınırlandı; `Season` zorunlu kulüp ve grup ilişkisi kazandı.
- Socket.IO handshake JWT zorunlu hale geldi; kimlik sunucudan türetiliyor. İlk
  kulüp-odası sınırı ADR-0014 ile kesin group/current-recipient modeline daraltıldı.
- Sağlık/klinik yolları ve tenant sahibi henüz tanımlanmamış ileri analitik yolları
  ayrı politika onaylanana kadar `SYSTEM_ADMIN` ile sınırlandı.
- Kurtarılamayan frontend gitlink'i normal monorepo dizinine dönüştürüldü; çalışan
  frontend bulunmadığından Compose ve environment örneğindeki doğrulanmamış
  Next.js/NextAuth varsayımları kaldırıldı.
- Public registration kaldırıldı; ilk system admin tek-admin bootstrap kuralına,
  diğer hesaplar scoped invitation akışına taşındı.
- HTTP ve Socket.IO session'ları güncel account status/authVersion ile anında revoke
  edilebilir hale geldi; eski kulüp atama yan yolu kaldırıldı.
- Hard-coded gerçek kişi örnekleri ve bilinen parolayla doğrudan kullanıcı oluşturan
  legacy sample-squad scriptleri kaldırıldı.
- Haftalık frontend'in grup, sezon, plan, oyuncu ve katılım state'i NestJS REST
  sözleşmelerine bağlandı; plan ve katılım kaydetme işlemleri kalıcı API mutation'ı
  haline getirildi.
- Maç hazırlık paneli gerçek season/match REST kaydına bağlandı; taktik analiz,
  diziliş ve koç notu yerel state yerine yetkili match mutation'ıyla saklanıyor.
- Antrenman editörü gerçek drill kataloğuna bağlandı; plan drill'leri authorization
  kontrollü atomik replace işlemiyle saklanıyor, toplam süre drill sürelerinden
  türetilip bağlı sezon gününe yansıtılıyor.
- Backend lint komutu salt-okunur hale getirildi; explicit `lint:fix`, typecheck,
  format check ve izlenen build cache'ine dokunmayan `build:check` ayrıştırıldı.
- Tek-dosyalı frontend modları ortak `/app` shell ve adreslenebilir Hafta,
  Antrenmanlar, Taktik Tahtası, Kadro ve Maçlar rotalarına ayrıldı.
- Haftalık görünüm sabit 2026 dizisi yerine yerel Pazartesi–Pazar, önceki/sonraki,
  bugün ve tarih seçimiyle gerçek plan/maç verisini eşleştiriyor.
- Drill okuma ve mutation yolları authentication, tenant, grup ve creator
  sahipliğiyle sınırlandı; ownership mass-assignment alanları sunucuda türetiliyor.
- `/app` varsayılanı Genel Bakış'a yönlendirildi; masaüstü navigasyonu Genel,
  Planlama ve Takım başlıkları altında dokuz girişe genişletildi. Mobil alt çubuk
  ADR-0011'deki beş ana görevi korur.
- Mobil ana görev sırası ADR-0011 ile aynı Hafta → Antrenmanlar → Taktik Tahtası →
  Kadro → Maçlar düzenine sabitlendi; Egzersiz Kütüphanesi faz sekmelerinin 390 px
  görünümde ikinci satıra taşması giderildi.
- Tam MVP review sonucunda REQ-005 ve REQ-009, doğrulanan açık bulgular nedeniyle
  `Implemented` yerine `Partial` olarak kanıtla hizalandı; uygulama davranışı
  değiştirilmedi.
- F-001–F-006 remediation ile dashboard görünürlüğü `GLOBAL + own club` ve güvenli
  projection'a; plan/drill/season bileşimleri kesin group sınırına; Socket olayları
  güncel yetkili alıcılara ve minimum payload'a taşındı.
- Taktik editörüne iç route/back/mobile navigasyonunu kapsayan kaydet/at/iptal
  koruması eklendi; SVG renkleri canonical hex allowlist ve XML escaping ile
  sınırlandı.
- Password reset completion transaction içi conditional claim ile single-winner
  hale getirildi. REQ-005 ve REQ-009 remediation kanıtıyla yeniden `Implemented`
  durumuna getirildi.
- BL-025, Prisma `6.19.3` → `@prisma/config` `6.19.3` → `deepmerge-ts` `7.1.5`
  zincirinin source/control/sink triyajı ve açık risk kabulüyle tamamlandı; paket,
  lockfile ve runtime davranışı değiştirilmedi.
- Prisma CLI development/build bağımlılığına taşındı. Backend Dockerfile aynı
  lockfile'dan runtime-only `runtime` ve HTTP uygulaması içermeyen `migrator`
  target'ları üretecek şekilde ayrıldı; Compose migrator'ı yalnız açık
  `operations` profiliyle çalıştırır.
- Runtime production install'i optional/development paketleri dışarıda bırakır;
  üretilmiş Prisma Client korunurken Prisma CLI, `@prisma/config`, `deepmerge-ts`,
  Nest CLI, Jest, migration/source ağacı ve seed scriptleri image'dan çıkarıldı.

### Known issues

- Frontend kalıcı oturum ADR-0018 ile opt-in uygulanmıştır; production rollout,
  ölçülebilir erişilebilirlik hedefi, domain/provider ve operasyon girdileri `TBD`.
  Refresh record retention onaylıdır; security-audit retention ayrı `TBD` kalır.
- E-posta teslimi/account recovery, production migration otoritesi ve sağlık/ileri
  analitik veri politikası açık karar kapılarıdır.
- E2E suite tablo temizliği yaptığı için yalnız caller-supplied dedicated ve
  silinebilir veritabanında çalıştırılabilir.
- Backend legacy analytics adapter'ında 41 unused-variable lint uyarısı görünür
  teknik borç olarak kalıyor; repository lint hatası yoktur.
- `npm audit --omit=dev` Prisma CLI / `@prisma/config` / `deepmerge-ts` zincirinde
  3 high advisory raporluyor. ADR-0016 bunu hosted runtime için `not_actionable`
  ve production öncesi yeniden incelemeli geçici kabul olarak kaydeder; otomatik
  Prisma 6.12.0 breaking downgrade uygulanmadı. ADR-0017/BL-026 uygulanmıştır:
  gerçek runtime-stage install audit'i sıfır bulgu verir ve image inventory bu
  zinciri içermez; repository-local audit optional-peer metadata nedeniyle ayrı
  bir accepted-risk sinyali olarak görünür kalır.
- 2026-09-05 ilk tam MVP review hükmü tarihsel olarak **Fail** idi; A–D
  stabilizasyonuyla F-001–F-006 kapatıldı ve güncel remediation hükmü **Pass** oldu.
  Ayrıntı ve yeniden doğrulama kanıtı `docs/30-quality/MVP_REVIEW_2026-09-05.md`
  içindedir.
