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

## Verification

- Backend sağlık/readiness endpoint'i `TBD`; kök `Hello World!` gerçek health
  sözleşmesi sayılmaz.
- Veritabanı migration durumu, secret varlığı ve temel kullanıcı akışları
  release öncesi doğrulanmalıdır.

## Rollback

Uygulama ve veritabanı rollback prosedürü `TBD`; veri migration'ları için ayrı,
kanıtlanmış geri dönüş planı zorunludur.
