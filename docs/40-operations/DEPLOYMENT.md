# Deployment

## Environments

- Yerel Docker Compose tanımı mevcuttur.
- Development, staging ve production ortam sözleşmeleri `TBD`.
- ADR-0010 aynı site altındaki ayrı HTTPS frontend/API origin'lerini kabul eder.
  Domain, provider, TLS/proxy ve secret ownership `TBD`; bunlar kapanmadan
  implementation veya rollout başlamaz.

## Release Steps

TBD. Mevcut Compose yalnız PostgreSQL ve backend'i kapsar; frontend veya production
deployment prosedürü olarak kullanılamaz.

ADR-0010 kabul edilmiştir; ancak provider/domain, WebSocket routing, trusted proxy,
dağıtık auth throttling, secret delivery, readiness, observability ve backup/restore
kapıları kapanmadan production rollout yapılamaz.

ADR-0016 mevcut Prisma CLI advisory zincirini hosted runtime için `not_actionable`
ve geçici kabul edilmiş dependency-hygiene riski olarak kaydeder. ADR-0017,
runtime-only backend image ile ayrı migrator artifact/job modelini önerir; henüz
uygulanmamıştır. Mevcut Dockerfile production release kanıtı sayılmaz.

## Verification

- Backend sağlık/readiness endpoint'i `TBD`; kök `Hello World!` gerçek health
  sözleşmesi sayılmaz.
- Veritabanı migration durumu, secret varlığı ve temel kullanıcı akışları
  release öncesi doğrulanmalıdır.
- Runtime image dependency inventory'si ile migrator revision/lockfile/migration
  eşleşmesi ADR-0017 kabul edilirse ayrı release kapılarıdır.

## Rollback

Uygulama ve veritabanı rollback prosedürü `TBD`; veri migration'ları için ayrı,
kanıtlanmış geri dönüş planı zorunludur.
