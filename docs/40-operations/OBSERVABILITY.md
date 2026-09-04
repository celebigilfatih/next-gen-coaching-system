# Observability

## Logs, Metrics and Traces

- Kodda console log kullanımı gözlendi.
- Yapılandırılmış log, metrik, trace ve correlation kimliği doğrulanmadı.
- Sağlık veya kişisel veri loglanmamalıdır.

## Health and Alerts

PostgreSQL Compose healthcheck'i var. Backend readiness/liveness ve uyarı
eşikleri `TBD`.

## Dashboards and Ownership

N/A — doğrulanmış operasyon dashboard'u veya on-call sahibi yok.

## Sensitive Data Rules

Token, parola/hash, kişisel veri ve sağlık ayrıntısı loglara yazılmaz. Redaction,
erişim ve log retention politikası `TBD`.
