# Architecture Overview

## System Context

Repository, futbol kulübü çalışma verisini yöneten NestJS backend ile koç öncelikli
React/TypeScript frontend prototipini içerir. ADR-0003 normal monorepo topolojisini,
ADR-0009 frontend teknoloji ve ilk ürün akışını kabul etmiştir.

## Layers and Responsibilities

- NestJS controller'ları HTTP sözleşmelerini ve bazı guard'ları tanımlar.
- Service sınıfları kullanım akışı ve Prisma sorgularını yürütür.
- Prisma, PostgreSQL veri erişimi ve şema tanımını sağlar.
- Socket.IO gateway, katılım ve plan olaylarını istemcilere yayınlar.

## Main Integrations

- PostgreSQL 16 (`docker-compose.yml`).
- Socket.IO/WebSocket.
- Frontend: React/TypeScript, React Router Framework Mode SPA ve Vite. Login,
  haftalık antrenman planı, katılım ve maç taktik notu çalışma alanları hazırdır;
  bearer JWT yalnız bellekte tutulur ve API tabanı environment ile yapılandırılır.
  Koç oturumu sonrası grup, sezon, plan, takım üyeleri ve katılım REST API'den
  yüklenir; plan/katılım mutation'ları gerçek backend'e yazılır. Sezonun yetkili
  maç kaydı aynı REST sınırından yüklenir; temel rakip/taktik analiz JSON'u, diziliş
  ve koç notu `PUT /seasons/matches/:matchId` ile kalıcılaştırılır.
  Yaş grubuna uygun drill kataloğu `GET /drills` ile yüklenir; faz/sıra/not ilişkisi
  `PUT /training-plans/:id/drills` ile atomik değiştirilir.

## AI Components

N/A — repository'de model sağlayıcısı, prompt çalışma zamanı veya AI karar akışı
doğrulanmadı.

## Data and Storage

Prisma şeması kullanıcı, kulüp, grup, egzersiz, antrenman, katılım, sezon,
maç, performans, analiz ve sağlık varlıklarını tanımlar. Güncel şema temiz baseline
migration ile ephemeral PostgreSQL 16 üzerinde doğrulanmıştır.

## Deployment Model

Docker Compose yalnız doğrulanmış PostgreSQL ve backend servislerini tanımlar.
Frontend yerel Vite/Sites-ready build ile doğrulanmıştır; production hosting ve
release modeli `TBD`. ADR-0010, aynı site altındaki ayrı frontend/API origin'leri
ve kalıcı tarayıcı oturumu için bağlayıcı olmayan bir öneridir; onaylanmadan mevcut
deployment veya authentication sözleşmesini değiştirmez.

## Key Risks and ADR Links

- CDSK benimsenmesi: ADR-0001.
- Dar MVP: ADR-0002.
- Frontend monorepo topolojisi: ADR-0003 Accepted; koç öncelikli teknoloji ve ilk
  akış ADR-0009 Accepted.
- Production origin ve kalıcı oturum: ADR-0010 Proposed; açık kullanıcı onayı ve
  production girdileri bekleniyor.
- Çekirdek yetki: ADR-0005 ve ADR-0007 Accepted.
- Hassas veri ve production kararları production öncesi onay kapısıdır.
