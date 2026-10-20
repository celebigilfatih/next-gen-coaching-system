# M4 — Staging ve Production Karar Girdileri

- **Date:** 2026-09-05
- **Status:** Input required — deployment onayı değildir
- **Code baseline:** `962a763`
- **Owner / approver:** TBD
- **Related:** [ADR-0010](../50-decisions/ADR-0010-production-origin-and-persistent-session.md),
  [ADR-0017](../50-decisions/ADR-0017-runtime-and-migrator-image-separation.md),
  [ADR-0018](../50-decisions/ADR-0018-provider-neutral-persistent-sessions.md), BL-013

## Onaylı taban — yeniden karar gerektirmez

Static React Router SPA, ayrı uzun ömürlü NestJS REST/Socket.IO backend ve
PostgreSQL korunur. Frontend/API aynı site altında ayrı HTTPS origin'ler kullanır.
Runtime ve migrator aynı revision/lockfile'dan ayrı artifact olarak üretilir.
ADR-0018 session süreleri, cookie/CSRF ve refresh-record retention onaylıdır;
iki feature flag varsayılan kapalıdır. Yerel test kanıtı production onayı değildir.

## İlk kullanıcı girdileri

Bu tablo seçenek araştırmasını sınırlar; secret, parola veya connection string
istenmez. Henüz bir vendor önerilmedi, fiyat araştırması veya kaynak oluşturulmadı.

| Girdi | Güncel değer | Karara etkisi |
|---|---|---|
| Kullanılabilir domain ve DNS yönetim erişimi | TBD | Staging/production frontend ve API exact HTTPS origin'leri |
| Mevcut hosting/cloud hesabı veya sunucu | TBD | Provider ve deployment yaklaşımının seçenekleri |
| Aylık toplam bütçe üst sınırı ve para birimi | TBD | Uygulama, DB, staging, backup ve monitoring maliyet sınırı |
| Veri barındırma bölgesi kısıtı | TBD | Provider/bölge seçimi; gizlilik değerlendirmesinin girdisi |
| İlk pilot kulüp/kullanıcı ve eşzamanlı kullanım tahmini | TBD | Kapasite ve staging yük testi hedefi |
| Operasyon ve olay müdahale sorumlusu | TBD | Deploy, secret rotation, restore ve incident onayı |

## Provider seçimi sonrası kapatılacak kararlar

| Karar | Durum | Gerekli kabul kanıtı |
|---|---|---|
| Staging ve production origin/DB/secret izolasyonu | TBD | Gerçek origin listesi; ayrı sentetik staging verisi ve credential sınırı |
| TLS, proxy zinciri, WebSocket routing, replica modeli | TBD | HTTPS ve reconnect testi; güvenilir client-IP derivation ve rate-limit tasarımı |
| Registry, build platform, immutable artifact ve SBOM/signing | TBD | Aynı revision'a bağlı frontend/runtime/migrator kimlikleri ve inventory |
| Runtime/migrator DB rolleri ve bootstrap/recovery operator yolu | TBD | Ayrı en-az-yetkili yetkiler; runtime ile DDL reddi; kontrollü migration ve admin provisioning |
| Secret delivery, rotation ve acil revoke | TBD | Secret içermeyen operasyon kaydı ve yetkili owner |
| Readiness, log redaction, metric/alert ve retention | TBD | DB unavailable davranışı, güvenli hata/log ve alarm provası; BL-024 |
| Backup, kabul edilebilir veri kaybı (RPO) ve dönüş süresi (RTO) | TBD | Onaylı hedefler; izole restore provası ve ölçülen sonuç |
| Browser matrisi ve release/rollback otoritesi | TBD | Hedef tarayıcılarda cookie/rotation testi, rollback provası, açık go/no-go |

Sağlık/ileri analitik MVP dışı kalır. Security-audit ve sağlık retention kararları,
onaylanmış 30 günlük refresh-record retention ile karıştırılmaz.

## Repository'de doğrulanan deployment boşlukları

1. `docker-compose.yml` yerel geliştirme tanımıdır: runtime/migrator aynı DB
   credential'ını kullanır; frontend/edge içermez. Production'a doğrudan taşınmaz.
2. `apps/backend/src/app.controller.ts` kök smoke yanıtı verir; readiness/DB
   bağımlılık kontrolü değildir. Probe sözleşmesi henüz uygulanmamıştır.
3. `apps/backend/src/main.ts` proxy trust modeli tanımlamaz. Dağıtık auth
   throttling ve topoloji ADR-0010 kapsamında hâlâ karar gerektirir.
4. `resolveBrowserOrigins()` (`apps/backend/src/auth/persistent-session.config.ts`)
   session flag kapalıyken `FRONTEND_ORIGIN` yerine localhost listesini döndürür.
   Bu nedenle gerçek ayrı HTTPS origin'lerde yalnız iki flag'i kapatmak kullanılabilir
   bir production browser rollback sağlamaz. Production CORS'un session flag'inden
   bağımsız sözleşmesi, uygulaması ve flag-off regresyonu rollout öncesi gereklidir;
   bu belge CORS davranışını değiştirmez veya yeni origin yetkilendirmez.

Bu eksikler MVP Pass hükmünü değiştirmez; BL-028 kapsamında staging/rollout kapısıdır.

## Uygulama sırası ve durma noktaları

1. Yukarıdaki ilk girdileri kullanıcıdan al. Eksik değerleri TBD bırak.
2. Kısıtlara uygun provider seçeneklerini resmî güncel kaynaklardan incele;
   maliyetleri varsayım ve tarihleriyle ayır. Provider/bölge/bütçe/topoloji kararını
   Proposed ADR olarak sun. Kabul olmadan hesap, DNS veya ücretli kaynak oluşturma.
3. Onaylı hedef için readiness, CORS rollback, proxy/rate-limit, DB privilege,
   secret ve recovery sözleşmelerini ayrıştır; mimari/güvenlik değişikliklerini
   açık onaydan sonra küçük testli adımlarla uygula.
4. Ayrı staging kurulumu onaylandıktan sonra migration → backend → frontend
   sırasını uygula. Migration flag kapalıyken de yeni backend'den önce gerekir.
5. Staging'de reload/logout/replay, cross-origin ret, tenant/grup sınırları,
   Socket erişimi, backup/restore ve flag-off rollback doğrulamalarını kaydet.
   Root quality ve migration/diff kapılarını aynı release revision'ında tekrarla.
6. Kanıtlar ve named owner ile ayrı production go/no-go onayı al. TBD kalan
   zorunlu kapı veya başarısız test varken rollout yapma.

## Bu adımın doğrulaması

Yalnız belgeler değişir. CDSK, yerel Markdown bağlantıları ve `git diff --check`
çalıştırılır; uygulama testlerinin eski sonuçları yeni çalıştırılmış sayılmaz.
Deployment, migration, secret/flag değişikliği veya dış servis işlemi yapılmaz.
