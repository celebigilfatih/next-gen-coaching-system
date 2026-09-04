# Integrations

| Integration | Purpose | Owner | Contract | Failure/fallback |
|---|---|---|---|---|
| PostgreSQL 16 | Kalıcı uygulama verisi | Backend / TBD | Prisma schema ve migrations | Backup/restore `TBD` |
| Socket.IO | Gerçek zamanlı plan ve katılım olayları | Events module / TBD | Kod içi olay adları | Retry/reconciliation `TBD` |
| Frontend | Koç öncelikli responsive web arayüzü | Frontend owner TBD | ADR-0009: React Router SPA, REST bearer JWT ve Socket.IO `auth.token` | Uygulama/görsel hedef henüz yok; memory-only oturum reload'da kapanır |

Doğrulanmış üçüncü taraf SaaS, dosya depolama, video veya AI entegrasyonu yoktur.
