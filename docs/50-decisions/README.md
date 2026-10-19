# Architecture Decision Records

## Process

1. Şablonu sıradaki numarayla kopyala.
2. Seçenek ve etkileri `Proposed` olarak yaz.
3. CDSK onay kapılarını değerlendir.
4. Açık onayla `Accepted` veya `Rejected` yap.
5. Uygulama, belgeler ve changelog'u güncelle.
6. Eski kararı silme; yeni ADR ile `Superseded` yap.

## Index

| ADR                                                                          | Title                                                   | Status   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------- | -------- |
| [ADR-0001](ADR-0001-cdsk-adoption.md)                                        | CDSK 0.1.0 benimsenmesi                                 | Accepted |
| [ADR-0002](ADR-0002-mvp-boundary.md)                                         | Dar MVP sınırı                                          | Accepted |
| [ADR-0003](ADR-0003-frontend-source-and-topology.md)                         | Frontend kaynağı ve repository topolojisi               | Accepted |
| [ADR-0004](ADR-0004-authentication-and-bootstrap-security-baseline.md)       | Authentication ve bootstrap güvenlik tabanı             | Accepted |
| [ADR-0005](ADR-0005-role-and-tenant-boundary.md)                             | Rol ve tenant sınırı                                    | Accepted |
| [ADR-0006](ADR-0006-prisma-reconciliation-and-role-transition.md)            | Prisma uzlaştırma ve rol geçişi                         | Accepted |
| [ADR-0007](ADR-0007-core-resource-authorization.md)                          | Çekirdek kaynak yetkilendirme matrisi                   | Accepted |
| [ADR-0008](ADR-0008-invitation-based-account-lifecycle.md)                   | Davet tabanlı hesap yaşam döngüsü                       | Accepted |
| [ADR-0009](ADR-0009-coach-first-web-frontend.md)                             | Koç öncelikli web frontend ve ilk ürün akışı            | Accepted |
| [ADR-0010](ADR-0010-production-origin-and-persistent-session.md)             | Production origin topolojisi ve kalıcı tarayıcı oturumu | Accepted |
| [ADR-0011](ADR-0011-shadcn-routed-coach-workspace.md)                        | shadcn tabanlı rotalı koç çalışma alanı                 | Accepted |
| [ADR-0012](ADR-0012-scoped-drills-and-tactical-board-contract.md)            | Kapsamlı egzersizler ve taktik tahta sözleşmesi         | Accepted |
| [ADR-0013](ADR-0013-expanded-coach-navigation.md)                            | Genişletilmiş koç navigasyonu ve shadcn shell           | Accepted |
| [ADR-0014](ADR-0014-group-isolation-and-event-recipients.md)                 | Grup izolasyonu ve gerçek zamanlı olay alıcıları        | Accepted |
| [ADR-0015](ADR-0015-atomic-recovery-and-safe-svg.md)                         | Atomik password recovery ve güvenli SVG serialization   | Accepted |
| [ADR-0016](ADR-0016-prisma-advisory-risk-disposition.md)                     | Prisma CLI advisory risk disposition                    | Accepted |
| [ADR-0017](ADR-0017-runtime-and-migrator-image-separation.md)                | Runtime ve migrator image ayrımı                        | Accepted |
| [ADR-0018](ADR-0018-provider-neutral-persistent-sessions.md)                 | Provider-neutral kalıcı tarayıcı oturumu                | Accepted |
| [ADR-0019](ADR-0019-attendance-uniqueness-and-atomic-upsert.md)              | Attendance tekilliği ve atomik upsert                   | Accepted |
| [ADR-0020](ADR-0020-account-email-delivery-and-break-glass-recovery.md)      | Hesap e-postası teslimi ve break-glass recovery         | Accepted |
| [ADR-0021](ADR-0021-football-club-operating-system-boundary.md)              | Football Club Operating System ürün sınırı              | Accepted |
| [ADR-0022](ADR-0022-sporting-organization-and-pathway-kernel.md)             | Sportif organizasyon ve oyuncu yolu çekirdeği           | Accepted |
| [ADR-0023](ADR-0023-capability-scope-and-sensitive-availability-boundary.md) | Capability scope ve hassas veri sınırı                  | Accepted |
| [ADR-0024](ADR-0024-provider-neutral-intelligence-boundary.md)               | Provider-neutral entegrasyon ve intelligence sınırı     | Accepted |
| [ADR-0025](ADR-0025-on-demand-training-editor-boards.md)                     | İsteğe bağlı antrenman editörü tahta okumaları          | Accepted |
| [ADR-0026](ADR-0026-training-plan-edit-and-atomic-permanent-delete.md)       | Antrenman düzenleme ve atomik kalıcı silme              | Accepted |
| [ADR-0027](ADR-0027-account-access-administration.md)                        | Kullanıcı hesabı ve erişim yönetimi                     | Accepted |
| [ADR-0028](ADR-0028-first-team-and-academy-lifecycle.md)                     | A Takım ve altyapı takım yaşam döngüsü                  | Accepted |
| [ADR-0029](ADR-0029-separate-team-navigation-and-synthetic-roster-names.md)  | Ayrı takım navigasyonu ve sentetik kadro adları         | Accepted |
| [ADR-0030](ADR-0030-first-team-roster-center-and-player-directory.md)        | A Takım kadro merkezi ve oyuncu dizini                  | Accepted |
| [ADR-0031](ADR-0031-player-360-notes-and-controlled-team-sharing.md)         | Player 360 notları ve kontrollü takım paylaşımı         | Accepted |
| [ADR-0032](ADR-0032-professional-drill-versioning-and-age-variants.md)       | Profesyonel egzersiz sürümleme ve yaş varyantları       | Accepted |
| [ADR-0033](ADR-0033-original-and-open-license-drill-content-policy.md)       | Özgün ve açık lisanslı egzersiz içerik politikası       | Accepted |
| [ADR-0034](ADR-0034-drill-editorial-review-and-publication.md)               | Egzersiz uzman incelemesi ve global yayın ayrımı        | Accepted |
| [ADR-0035](ADR-0035-professional-2d-tactical-studio.md) | Profesyonel 2D taktik stüdyosu ve aşamalı geliştirme | Accepted |
| [ADR-0036](ADR-0036-tactical-scenes-and-playback.md) | Çok sahneli V2 taktik belge, oynatma ve güvenli kayıt | Accepted |
