# Deployment

## Environments

- Yerel Docker Compose tanımı mevcuttur.
- Development, staging ve production ortam sözleşmeleri `TBD`.
- ADR-0010 aynı site altındaki ayrı HTTPS frontend/API origin'lerini kabul eder.
  ADR-0018 provider-neutral session uygulamasını onaylar. Domain, provider,
  TLS/proxy ve secret ownership `TBD`; bunlar kapanmadan production rollout başlamaz.

## Release Steps

TBD. Mevcut Compose yalnız PostgreSQL ve backend'i kapsar; frontend veya production
deployment prosedürü olarak kullanılamaz.

ADR-0010 kabul edilmiştir; ancak provider/domain, WebSocket routing, trusted proxy,
dağıtık auth throttling, secret delivery, readiness, observability ve backup/restore
kapıları kapanmadan production rollout yapılamaz.

ADR-0016 mevcut Prisma CLI advisory zincirini hosted runtime için `not_actionable`
ve geçici kabul edilmiş dependency-hygiene riski olarak kaydeder. ADR-0017 kabul
edilmiş ve backend Dockerfile'ında uygulanmıştır: serving `runtime` ve yalnız
`prisma migrate deploy` çalıştıran `migrator` target'ları aynı lockfile ve revision
üzerinden üretilir. Bu doğrulama production release veya rollout kanıtı sayılmaz.

Repository artifact'ları şu komutlarla ayrı oluşturulur:

```bash
docker build --target runtime -t ngcs-backend-runtime:local ./apps/backend
docker build --target migrator -t ngcs-backend-migrator:local ./apps/backend
```

Yerel Compose backend için `runtime` target'ını kullanır. Migrator varsayılan
servis setine dahil değildir; açık operations profiliyle ayrı çalıştırılır:

```bash
docker compose --profile operations run --rm migrator
```

Production registry, immutable tag/digest politikası, image signing/SBOM,
orchestrator, ayrı runtime/migrator DB rolleri ve credential delivery `TBD`.

## Verification

Kalıcı oturum migration'ı backend güncellemesinden önce ayrı migrator ile
uygulanır. Varsayılan `PERSISTENT_SESSIONS_ENABLED=false` ve
`VITE_PERSISTENT_SESSIONS_ENABLED=false`; production'da açılması bu teslimin parçası
değildir. Frontend flag'i build-time, backend flag'i process-start girdisidir.
Production'da özellik açıkken eksik/HTTP/path içeren `FRONTEND_ORIGIN` startup'ı
reddeder; aynı site API origin eşleşmesi ve TLS deployment kapısında doğrulanır.

- Backend sağlık/readiness endpoint'i `TBD`; kök `Hello World!` gerçek health
  sözleşmesi sayılmaz.
- Veritabanı migration durumu, secret varlığı ve temel kullanıcı akışları
  release öncesi doğrulanmalıdır.
- Runtime image dependency inventory'si ile migrator revision/lockfile/migration
  eşleşmesi ayrı release kapılarıdır. Yerel doğrulamada runtime install audit'i
  sıfır bulgu verdi ve Prisma CLI/config/advisory zincirinin image'da bulunmadığı
  inventory ile kanıtlandı.

## Rollback

Uygulama ve veritabanı rollback prosedürü `TBD`; veri migration'ları için ayrı,
kanıtlanmış geri dönüş planı zorunludur.
